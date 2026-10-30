import { noise } from './common'

// Shaders for the Milky Way (see lib/galaxyModel.js and components/Galaxy.jsx).
// Real galaxies are mostly smooth light from stars too far to resolve, shaped by dust, star
// clouds and nebulae. So: a detailed face-on map of the galaxy is painted once, then drawn as a
// stack of thin slices that both glow and absorb, which gives the disk depth and a 3D bulge.

// --- the face-on map, rendered once into a texture -------------------------------------------
// rgb = starlight (stored as sqrt(light / 16) so 8 bits hold the bright core), a = dust

export const MAP_SIZE = 110 // thousands of light years the map covers, edge to edge

export const mapVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const mapFragment = /* glsl */ `
  ${noise}
  varying vec2 vUv;

  const vec3 OLD = vec3(1.0, 0.82, 0.62);
  const vec3 CORE = vec3(1.0, 0.78, 0.5);
  const vec3 YOUNG = vec3(0.58, 0.74, 1.0);
  const vec3 CLUSTER = vec3(0.72, 0.86, 1.0);
  const vec3 HII = vec3(1.0, 0.38, 0.52);

  mat2 rot(float a) { float c = cos(a); float s = sin(a); return mat2(c, -s, s, c); }
  float ridged(float n) { return 1.0 - abs(2.0 * n - 1.0); }

  void main() {
    vec2 p = (vUv - 0.5) * ${MAP_SIZE.toFixed(1)};
    float r = length(p);

    // warp the coordinates with noise at two scales so the arms wander, kink and branch like
    // real ones instead of tracing perfect curves
    vec2 w = p + (vec2(fbm(p * 0.05 + 1.3), fbm(p * 0.05 + 7.1)) - 0.5) * 7.0;
    w += (vec2(fbm(p * 0.2 + 4.2), fbm(p * 0.2 + 2.9)) - 0.5) * 2.2;
    float th = atan(w.y, w.x);
    float lr = log(max(length(w), 0.6));

    // logarithmic spiral, ~14 degree pitch: two strong arms and two weaker ones between them.
    // each arm brightens and fades along its length, and the weak ones break into segments
    float phase = th - 4.0 * lr;
    float a1 = 0.5 + 0.5 * cos(2.0 * phase);
    float a2 = 0.5 + 0.5 * cos(2.0 * phase + 2.2);
    float a1s = a1 * a1 * a1;
    float a2s = a2 * a2 * a2;
    // (the angle enters through cos/sin, so there's no seam where atan wraps around)
    float along = fbm(vec2(lr * 3.0, 0.0) + vec2(cos(th), sin(th)) * 1.6 + 6.0);
    float arms = a1s * a1s * (0.55 + 0.9 * along) + a2s * a2s * a2 * 0.8 * smoothstep(0.42, 0.7, along);
    float armZone = smoothstep(3.0, 7.0, r) * exp(-r / 15.0) * smoothstep(52.0, 38.0, r);

    // feathering: short dusty spurs crossing the arms at a steeper angle
    float spurs = pow(0.5 + 0.5 * cos(12.0 * (th - 1.5 * lr) + 4.0 * fbm(p * 0.15)), 5.0);

    float clouds = fbm(p * 0.32 + 4.0);    // star clouds along the arms
    float fine = fbm(p * 1.4 + 11.0);      // grain of the unresolved stars

    // smooth old population: disk, bar, bulge
    vec2 b = rot(0.5) * p;
    float bar = exp(-(b.x * b.x / 30.0 + b.y * b.y / 3.2));
    float bulge = exp(-r / 1.5) + 0.6 * exp(-r / 0.45);
    vec3 light = CORE * (bar * 0.7 + bulge * 3.2);

    // young population: blue-white arms, knotted into clouds, with bright star clusters and
    // pink nebulae strung along the brightest stretches
    float young = arms * armZone * (0.3 + 1.5 * clouds * clouds) * (0.8 + 0.4 * fine);
    vec3 disk = YOUNG * young * 2.6;
    float knots = fbm(p * 0.9 + 9.0);
    disk += CLUSTER * pow(smoothstep(0.6, 0.85, knots), 3.0) * a1s * armZone * 2.5;
    disk += HII * pow(smoothstep(0.58, 0.82, fbm(p * 0.75 + 2.0)), 3.0) * a1s * armZone * 2.2;
    disk += OLD * exp(-r / 8.5) * 0.22;

    // dust: lanes along the inner (concave) edge of every arm, ragged and filamentary, plus the
    // spurs, thinning out toward the edge and gone from the bulge
    float lane = pow(0.5 + 0.5 * cos(2.0 * phase - 0.65), 7.0) + 0.35 * pow(0.5 + 0.5 * cos(2.0 * phase + 1.6), 9.0);
    float strands = ridged(fbm(p * 0.45 + 3.0));
    float dust = (lane * (0.35 + 1.1 * strands * strands) + spurs * a1 * 0.4) * (0.55 + 0.9 * fine);
    dust *= smoothstep(2.5, 6.0, r) * exp(-r / 22.0) * smoothstep(50.0, 30.0, r);
    dust = clamp(dust * 1.6, 0.0, 1.0);

    // the disk's stars live in the same thin dusty layer, so the lanes darken them in the map
    // itself, seen from any side; the bulge and bar stand above it
    light += disk * (1.0 - 0.75 * dust);

    gl_FragColor = vec4(sqrt(min(light, 16.0) / 16.0), dust);
  }
`

// --- the disk: a stack of horizontal slices sampling the map ---------------------------------

export const sliceVertex = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xz;  // the plane geometry is laid flat in xz
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// each slice at height uY adds the light and absorbs with the dust that live at that height.
// light spreads over a thin disk that thickens into the bulge near the centre; dust is thinner
// still. weights are normalised, so the stack adds up to the map no matter how it's sliced.
// output is premultiplied (blend ONE, ONE_MINUS_SRC_ALPHA), drawn far slice first
export const sliceFragment = /* glsl */ `
  ${noise}
  uniform sampler2D uMap;
  uniform float uY;
  uniform float uStep;
  uniform float uSpin;
  uniform float uDust;
  varying vec2 vP;

  void main() {
    float c = cos(uSpin);
    float s = sin(uSpin);
    vec2 p = mat2(c, -s, s, c) * vP;
    vec4 t = texture2D(uMap, p / ${MAP_SIZE.toFixed(1)} + 0.5);
    vec3 light = t.rgb * t.rgb * 16.0;
    float r = length(p);

    float sl = 0.28 + 2.3 * exp(-r / 2.4);
    float sd = 0.11 + 0.05 * smoothstep(5.0, 30.0, r);
    float wl = exp(-0.5 * uY * uY / (sl * sl)) / (sl * 2.5066);
    float wd = exp(-0.5 * uY * uY / (sd * sd)) / (sd * 2.5066);

    // fine structure the map is too coarse for, varying from slice to slice
    float grain = noise(p * 1.8 + uY * 3.0);
    light *= 0.82 + 0.36 * noise(p * 0.9 - uY * 2.0);
    float dust = t.a * (0.55 + 0.9 * grain) * uDust;

    float alpha = 1.0 - exp(-dust * wd * uStep * 4.5);
    gl_FragColor = vec4(light * wl * uStep, alpha);
  }
`

// --- distant stars all around --------------------------------------------------------------

export const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;  // pixels per world unit at distance 1
  varying vec3 vColor;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float size = aSize * uScale / max(-mv.z, 1e-3);
    gl_PointSize = clamp(size, 1.0, 4.0);
    // below a pixel, draw one pixel and dim it instead
    vColor = aColor * min(size * size, 1.0) * (0.8 + 0.2 * sin(uTime * (0.8 + aSeed * 2.5) + aSeed * 60.0));
    gl_Position = projectionMatrix * mv;
  }
`

export const starFragment = /* glsl */ `
  varying vec3 vColor;
  void main() {
    vec2 q = gl_PointCoord - 0.5;
    float r2 = dot(q, q) * 4.0;
    if (r2 > 1.0) discard;
    gl_FragColor = vec4(vColor * (exp(-r2 * 10.0) + 0.12 * exp(-r2 * 3.0)), 1.0);
  }
`

// --- HDR to screen ----------------------------------------------------------------------------
// the galaxy is drawn into a half-float target, where the core can run far past 1.0, then
// tone-mapped like a camera exposure: the core keeps its gold gradient instead of clipping

export const toneVertex = mapVertex

export const toneFragment = /* glsl */ `
  uniform sampler2D uScene;
  uniform float uExposure;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uScene, vUv).rgb * uExposure;
    // tone-map brightness, not each channel, so bright regions keep their colour
    float l = max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 1e-5);
    vec3 col = c * ((1.0 - exp(-l)) / l);
    // a channel pushed past 1 lifts the others toward white, like overexposed film
    col += max(max(col.r, max(col.g, col.b)) - 1.0, 0.0);
    gl_FragColor = vec4(min(col, 1.0), 1.0);
  }
`

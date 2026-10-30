import { camera, isMobile, noise, stars, uniforms } from './common'

// Wormhole ray tracer using the metric from "Visualizing Interstellar's Wormhole"
// (James, von Tunzelmann, Franklin & Thorne, 2015):
//   ds^2 = -dt^2 + dl^2 + r(l)^2 dOmega^2
// with a throat of radius RHO, length 2A and lensing mass M. Each ray stays in one plane,
// so we only integrate (l, phi). l > 0 at the end = our side, l < 0 = the far side.
export const wormhole = /* glsl */ `
  ${uniforms}
  #define STEPS ${isMobile ? 100 : 160}
  ${noise}
  ${stars}
  ${camera}

  const float PI = 3.14159265;
  const float RHO = 1.0;
  const float A = 0.05;
  const float M = 0.4;

  float radius(float l, out float drdl) {
    float al = abs(l);
    if (al <= A) {
      drdl = 0.0;
      return RHO;
    }
    float x = 2.0 * (al - A) / (PI * M);
    drdl = sign(l) * (2.0 / PI) * atan(x);
    return RHO + M * (x * atan(x) - 0.5 * log(1.0 + x * x));
  }

  // seamless noise on the sphere: blend three planar projections
  float sphereFbm(vec3 d, float scale, float drift) {
    vec3 w = abs(d);
    w /= w.x + w.y + w.z;
    return fbm(d.yz * scale + drift) * w.x + fbm(d.zx * scale + drift) * w.y + fbm(d.xy * scale + drift) * w.z;
  }

  // our side: a soft, bright nebula
  vec3 nebula(vec3 d) {
    float t = uTime * 0.008;
    float n1 = sphereFbm(d, 2.2, t);
    float n2 = sphereFbm(d, 5.0, -t);

    vec3 base = vec3(0.965, 0.955, 0.94);
    vec3 gas = mix(vec3(1.0, 0.74, 0.68), vec3(1.0, 0.85, 0.7), smoothstep(0.3, 0.55, n2));
    gas = mix(gas, vec3(0.78, 0.74, 0.96), smoothstep(0.5, 0.7, n2));
    gas = mix(gas, vec3(0.7, 0.82, 1.0), smoothstep(0.55, 0.8, n1) * 0.6);
    float density = smoothstep(0.36, 0.7, n1);
    vec3 col = mix(base, gas, density);

    // glowing filaments and darker dust lanes give the lensing something to bend
    float fil = pow(1.0 - abs(n2 * 2.0 - 1.0), 6.0);
    col += vec3(1.0, 0.93, 0.85) * fil * density * 0.3;
    col = mix(col, vec3(0.6, 0.55, 0.53), smoothstep(0.62, 0.8, n2) * (1.0 - density) * 0.4);

    // a bright star right behind the wormhole; lensing turns it into an Einstein ring
    float s = max(dot(d, normalize(vec3(0.0, 0.04, 1.0))), 0.0);
    col += vec3(1.0, 0.88, 0.72) * (pow(s, 260.0) * 2.0 + pow(s, 30.0) * 0.2);
    return col;
  }

  // the far side: deep space, a galaxy band, and Gargantua small in the distance
  vec3 farSide(vec3 d, vec3 g) {
    vec3 col = vec3(0.01, 0.012, 0.025);
    float b = dot(d, normalize(vec3(0.2, 1.0, 0.35)));
    float band = exp(-b * b * 9.0);
    float n = fbm(d.xz * 3.0 + d.y * 2.0);
    col += mix(vec3(0.35, 0.45, 1.0), vec3(1.0, 0.68, 0.48), n) * band * (0.12 + 0.4 * n);
    col += starLayer(d, 60.0, 0.12, 0.12);
    col += starLayer(d, 130.0, 0.15 + 0.25 * band, 0.13) * 0.7;

    float facing = dot(d, g);
    if (facing > 0.0) {
      vec3 gu = normalize(cross(g, vec3(0.0, 1.0, 0.0)));
      vec3 gv = cross(gu, g);
      vec2 q = vec2(dot(d, gu), dot(d, gv)) / facing;
      float e = length(vec2(q.x, q.y * 4.0));
      float disk = exp(-pow((e - 0.07) / 0.02, 2.0)) * smoothstep(0.03, 0.05, e);
      float arc = exp(-pow((length(q) - 0.05) / 0.008, 2.0)) * step(0.0, q.y);
      float shadow = 1.0 - smoothstep(0.036, 0.042, length(q));
      col = col * (1.0 - shadow) + vec3(1.0, 0.82, 0.6) * (disk * 1.4 + arc * 0.9);
    }
    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec3 ro;
    vec3 rd;
    cameraRay(uv, ro, rd);

    // split the view direction into radial (toward/away from the throat) and sideways parts
    vec3 er = normalize(ro);
    float pl = dot(rd, er);
    vec3 side = rd - pl * er;
    float sideLen = length(side);
    vec3 et = sideLen > 1e-5 ? side / sideLen : vec3(0.0, 1.0, 0.0);

    float drdl;
    float l = uDist;
    float b = radius(l, drdl) * sideLen;
    float phi = 0.0;

    for (int i = 0; i < STEPS; i++) {
      float r = radius(l, drdl);
      float dt = min(0.03 + 0.08 * abs(l), 0.9);
      pl += b * b * drdl / (r * r * r) * dt;
      l += pl * dt;
      phi += b / (r * r) * dt;
      if (abs(l) > 40.0) break;
    }

    vec3 dir = cos(phi) * er + sin(phi) * et;
    vec3 g = normalize(er + vec3(0.0, 0.08, 0.0));

    // a ray goes through exactly when b < RHO, so blend across that edge over one pixel
    // instead of switching sides with a hard step (which aliases badly)
    float edge = max(fwidth(b), 1e-4) * 1.5;
    float through = 1.0 - smoothstep(RHO - edge, RHO + edge, b);
    vec3 col;
    if (through > 0.999) col = farSide(dir, g);
    else if (through < 0.001) col = nebula(dir);
    else col = mix(nebula(dir), farSide(dir, g), through);

    // thin photon ring hugging the throat
    float ring = exp(-pow((b - RHO) / (edge * 2.0 + 0.012), 2.0));
    col += vec3(1.0, 0.93, 0.82) * ring * 0.9;

    col *= mix(0.94, 1.0, smoothstep(1.3, 0.3, length(uv)));
    gl_FragColor = vec4(col, 1.0);
  }
`

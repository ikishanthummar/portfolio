export const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches

export const uniforms = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uCam;
  uniform float uDist;
  uniform float uYaw;
  uniform float uPitch;
  uniform float uFov;
  uniform float uShift;
`

export const noise = /* glsl */ `
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }
  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
  }
`

export const stars = /* glsl */ `
  // stars live on a 3D grid so there's no seam or pinching at the poles
  vec3 starLayer(vec3 d, float scale, float density, float size) {
    vec3 p = d * scale;
    vec3 id = floor(p);
    float h = hash13(id);
    if (h < 1.0 - density) return vec3(0.0);
    // star sits on the sphere we're sampling (only tangent offset matters)
    vec3 q = fract(p) - 0.5 - (hash33(id) - 0.5) * 0.7;
    q -= d * dot(q, d);
    float dist = length(q);
    float mag = pow(hash13(id + 7.3), 6.0);
    float tw = 0.75 + 0.25 * sin(uTime * (1.0 + h * 3.0) + h * 80.0);
    vec3 tint = mix(vec3(1.0), mix(vec3(0.62, 0.76, 1.0), vec3(1.0, 0.8, 0.58), hash13(id + 2.1)), 0.6);
    vec3 c = tint * (smoothstep(size, 0.0, dist) + exp(-dist * 22.0) * mag * 0.6) * (0.35 + 2.2 * mag) * tw;
    if (mag > 0.35) {
      // small diffraction cross on the brightest ones, faded before the cell edge
      vec3 ax = normalize(cross(d, vec3(0.0, 1.0, 0.0)));
      float sx = dot(q, ax);
      float sy = dot(q, cross(d, ax));
      float spike = exp(-abs(sx) * 110.0) * exp(-abs(sy) * 14.0) + exp(-abs(sy) * 110.0) * exp(-abs(sx) * 14.0);
      c += tint * spike * smoothstep(0.32, 0.15, max(abs(sx), abs(sy))) * mag * 1.2 * tw;
    }
    return c;
  }
`

export const camera = /* glsl */ `
  mat3 rotY(float a) { float c = cos(a); float s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
  mat3 rotX(float a) { float c = cos(a); float s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

  // orbiting camera; mouse adds a little yaw/pitch on top of the scroll keyframes.
  // uShift slides the subject sideways on screen (keeps it clear of the hero text)
  void cameraRay(vec2 uv, out vec3 ro, out vec3 rd) {
    float yaw = uYaw + uCam.x * 0.3 + sin(uTime * 0.05) * 0.08;
    float pitch = uPitch + uCam.y * 0.08;
    ro = rotY(yaw) * rotX(pitch) * vec3(0.0, 0.0, -uDist);
    vec3 fw = normalize(-ro);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
    vec3 up = cross(fw, right);
    rd = normalize(fw * uFov + (uv.x - uShift) * right + uv.y * up);
  }
`

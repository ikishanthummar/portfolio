import { camera, isMobile, noise, stars, uniforms } from './common'

// Schwarzschild ray marcher. Rays bend with a = -1.5 * h^2 * x / r^5 (rs = 1),
// which is what makes the back of the disk show up above and below the hole.
export const blackHole = /* glsl */ `
  ${uniforms}
  #define STEPS ${isMobile ? 120 : 170}
  ${noise}
  ${stars}
  ${camera}

  vec3 starfield(vec3 d) {
    // milky way band with dust lanes and a slow colour shift
    float b = dot(d, normalize(vec3(0.35, 1.0, -0.25)));
    float band = exp(-b * b * 14.0);
    float dust = fbm(d.xz * 4.0 + vec2(d.y * 3.0, 0.0));
    vec3 glow = mix(vec3(0.42, 0.5, 0.95), vec3(0.98, 0.74, 0.58), fbm(d.zy * 2.5 + 10.0));
    vec3 col = glow * band * (0.05 + 0.12 * dust) * smoothstep(0.25, 0.75, dust + 0.2);

    col += starLayer(d, 55.0, 0.1, 0.11);
    col += starLayer(d, 110.0, 0.12 + 0.18 * band, 0.12) * 0.75;
    col += starLayer(d, 220.0, 0.1 + 0.35 * band, 0.14) * 0.5;
    return col;
  }

  // a shooting star every ~9 seconds, drawn in screen space
  vec3 shootingStar(vec2 uv) {
    float cycle = floor(uTime / 9.0);
    float t = fract(uTime / 9.0) * 9.0;
    if (t > 1.1) return vec3(0.0);
    float k = t / 1.1;
    vec2 start = vec2(hash(vec2(cycle, 1.3)) * 1.4 - 0.2, 0.25 + hash(vec2(cycle, 7.1)) * 0.25);
    vec2 dir = normalize(vec2(-1.0 - hash(vec2(cycle, 3.7)) * 0.6, -0.45 - hash(vec2(cycle, 5.9)) * 0.3));
    vec2 head = start + dir * k * 0.9;
    vec2 tail = head - dir * 0.22 * smoothstep(0.0, 0.3, k);
    vec2 pa = uv - tail;
    vec2 ba = head - tail;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
    float d = length(pa - ba * h);
    float line = smoothstep(0.0035, 0.0, d) * h * h;
    return vec3(0.85, 0.92, 1.0) * (line * 1.6 + exp(-d * 260.0) * h * 0.5) * sin(k * 3.14159);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec3 ro;
    vec3 rd;
    cameraRay(uv, ro, rd);

    vec3 pos = ro;
    vec3 vel = rd;
    vec3 L = cross(pos, vel);
    float h2 = dot(L, L);
    vec3 col = vec3(0.0);
    float alpha = 0.0;
    bool captured = false;

    for (int i = 0; i < STEPS; i++) {
      float r2 = dot(pos, pos);
      float r = sqrt(r2);
      if (r < 1.0) { captured = true; break; }
      float dt = clamp(0.06 * r, 0.025, 0.9);
      vec3 acc = -1.5 * h2 * pos / (r2 * r2 * r);
      vec3 nv = vel + acc * dt;
      vec3 np = pos + nv * dt;

      // ray crossed the disk plane
      if (pos.y * np.y < 0.0) {
        float t = pos.y / (pos.y - np.y);
        vec3 hp = mix(pos, np, t);
        float hr = length(hp.xz);
        if (hr > 2.6 && hr < 10.5) {
          float ang = atan(hp.z, hp.x) + uTime * 2.4 / pow(hr, 1.5);
          vec2 q = vec2(cos(ang), sin(ang)) * hr;
          float n = fbm(q * 1.15);
          float fil = fbm(vec2(hr * 9.0, 0.0) + q * 0.55);
          float bands = 0.5 + 0.5 * sin(hr * 9.0 + n * 5.0);
          float dens = smoothstep(2.6, 2.8, hr) * smoothstep(10.5, 6.0, hr);
          float heat = clamp(pow(3.4 / hr, 1.5), 0.0, 1.5);
          vec3 tangent = normalize(vec3(-hp.z, 0.0, hp.x));
          float dop = 1.0 + 0.5 * dot(tangent, -normalize(nv));
          vec3 dc = mix(vec3(1.0, 0.58, 0.24), vec3(1.0, 0.95, 0.88), clamp(heat - 0.15, 0.0, 1.0));
          float bright = heat * (0.5 + 0.9 * n) * (0.55 + 0.6 * fil) * (0.75 + 0.25 * bands) * dop * dop;
          float a = clamp(dens * (0.45 + 0.65 * n) * (0.75 + 0.4 * fil), 0.0, 1.0);
          col += (1.0 - alpha) * dc * bright * a * 4.2;
          alpha += (1.0 - alpha) * a;
          if (alpha > 0.97) break;
        }
      }
      pos = np;
      vel = nv;
      if (r > 45.0) break;
    }

    if (!captured) col += (1.0 - alpha) * (starfield(normalize(vel)) + shootingStar(uv));
    col = 1.0 - exp(-col * 1.8);
    col *= mix(0.7, 1.0, smoothstep(1.3, 0.3, length(uv)));
    gl_FragColor = vec4(col, 1.0);
  }
`

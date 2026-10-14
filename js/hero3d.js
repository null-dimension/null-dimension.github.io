(() => {
  const canvas = document.getElementById("heroGL");
  const visual = canvas && canvas.closest(".hero__visual");
  if (!canvas || !visual || !window.THREE) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch (e) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
  camera.position.set(0, 0, 6.5);

  const PORTAL_W = 3.3;
  const PORTAL_H = 4.0;
  const clock = new THREE.Clock();

  const isLight = () => document.documentElement.dataset.theme === "light";

  const radialTexture = (c0, c1) => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, c0);
    grad.addColorStop(0.4, c1);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  };

  const world = new THREE.Group();
  scene.add(world);

  const frameMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uPlane: { value: new THREE.Vector2(PORTAL_W + 1.7, PORTAL_H + 1.7) },
      uHalf: { value: new THREE.Vector2(PORTAL_W / 2, PORTAL_H / 2) },
      uRadius: { value: 0.1 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      uniform vec2 uPlane;
      uniform vec2 uHalf;
      uniform float uRadius;

      float sdRoundBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }

      void main() {
        vec2 p = (vUv - 0.5) * uPlane;
        float d = sdRoundBox(p, uHalf, uRadius);
        float line = exp(-abs(d) * 16.0) * 1.5;
        float bloom = exp(-max(d, 0.0) * 3.5) * 0.55 + exp(-abs(d) * 2.2) * 0.14;
        float pulse = 0.92 + 0.08 * sin(uTime * 1.3);
        vec3 c = mix(vec3(0.32, 0.55, 1.0), vec3(0.62, 0.44, 1.0), vUv.y + 0.12 * sin(uTime * 0.6));
        float k = (line + bloom) * pulse * uIntensity;
        gl_FragColor = vec4(c * k, 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(PORTAL_W + 1.7, PORTAL_H + 1.7),
    frameMat
  );
  frame.position.z = 0.04;
  world.add(frame);

  const interiorMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        float r = length((vUv - 0.5) * vec2(1.2, 1.0));
        float vig = smoothstep(0.75, 0.15, r);
        vec3 col = mix(vec3(0.008, 0.012, 0.035), vec3(0.03, 0.05, 0.15), vig);
        float wave = sin(vUv.y * 14.0 - uTime * 0.7) * sin(vUv.x * 9.0 + uTime * 0.5);
        col += vec3(0.01, 0.02, 0.06) * wave * 0.35;
        gl_FragColor = vec4(col, 0.72);
      }`,
    transparent: true,
    depthWrite: false,
  });
  const interior = new THREE.Mesh(
    new THREE.PlaneGeometry(PORTAL_W, PORTAL_H),
    interiorMat
  );
  world.add(interior);

  const bh = new THREE.Group();
  bh.position.set(0, 0.1, 0.3);
  world.add(bh);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  bh.add(core);

  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(0.66, 48, 32),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x7aa8ff) } },
      vertexShader: `
        varying vec3 vN;
        varying vec3 vV;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vN;
        varying vec3 vV;
        uniform vec3 uColor;
        void main() {
          float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.0);
          gl_FragColor = vec4(uColor * f * 1.5, f);
        }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  bh.add(rim);

  const photon = new THREE.Mesh(
    new THREE.RingGeometry(0.64, 0.7, 96),
    new THREE.MeshBasicMaterial({
      color: 0xbdd4ff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  photon.position.z = 0.01;
  bh.add(photon);

  const diskMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntensity: { value: 1 } },
    vertexShader: `
      varying vec2 vPos;
      void main() {
        vPos = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 vPos;
      uniform float uTime;
      uniform float uIntensity;
      void main() {
        float r = length(vPos);
        float rn = clamp((r - 0.78) / (1.55 - 0.78), 0.0, 1.0);
        float a = atan(vPos.y, vPos.x);
        float inner = smoothstep(0.0, 0.1, rn);
        float outer = 1.0 - smoothstep(0.5, 1.0, rn);
        float beam = 0.5 + 0.5 * cos(a - uTime * 0.55 + rn * 2.5);
        beam = 0.3 + 0.7 * pow(beam, 2.4);
        float bands = 0.86 + 0.14 * sin(a * 7.0 + rn * 16.0 - uTime * 1.8);
        float b = inner * outer * beam * bands;
        vec3 hot = vec3(1.0, 0.97, 0.92);
        vec3 mid = vec3(0.55, 0.66, 1.0);
        vec3 cold = vec3(0.48, 0.36, 1.0);
        vec3 col = mix(hot, mid, smoothstep(0.0, 0.4, rn));
        col = mix(col, cold, smoothstep(0.4, 0.95, rn));
        float k = b * 1.7 * uIntensity;
        gl_FragColor = vec4(col * k, clamp(k, 0.0, 1.0));
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const disk = new THREE.Mesh(new THREE.RingGeometry(0.78, 1.55, 128, 1), diskMat);
  disk.rotation.set(1.05, 0, -0.3);
  bh.add(disk);

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture("rgba(120,150,255,0.85)", "rgba(70,80,220,0.35)"),
      color: 0x6d8cff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  halo.scale.set(4.4, 4.4, 1);
  halo.position.z = -0.4;
  bh.add(halo);

  const STAR_COUNT = 1900;
  const starPos = new Float32Array(STAR_COUNT * 3);
  const starCol = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 18;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 11;
    starPos[i * 3 + 2] = -1.2 - Math.random() * 13;
    const t = Math.random();
    starCol[i * 3] = 0.75 + t * 0.25;
    starCol[i * 3 + 1] = 0.8 + t * 0.2;
    starCol[i * 3 + 2] = 1.0;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  const floorGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture("rgba(110,140,255,0.7)", "rgba(60,70,200,0.25)"),
      color: 0x5f7cff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  floorGlow.scale.set(6.4, 2.1, 1);
  floorGlow.position.set(0, -2.75, 0.4);
  world.add(floorGlow);

  scene.add(new THREE.AmbientLight(0x232a55, 1.4));
  const key = new THREE.PointLight(0x5b7cff, 60, 30, 2);
  key.position.set(0, 0.5, 3);
  scene.add(key);
  const dir = new THREE.DirectionalLight(0x8fa8ff, 1.6);
  dir.position.set(-4, 5, 3);
  scene.add(dir);

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d18,
    roughness: 0.82,
    metalness: 0.35,
    emissive: 0x05070f,
    flatShading: true,
  });
  const rockSpecs = [
    { p: [-2.6, 1.5, 1.1], s: 0.42 },
    { p: [2.7, 1.9, -0.7], s: 0.62 },
    { p: [2.5, -1.6, 1.3], s: 0.36 },
    { p: [-2.4, -1.8, -0.9], s: 0.5 },
    { p: [0.5, 2.5, -1.8], s: 0.3 },
    { p: [-1.0, -2.4, 0.9], s: 0.26 },
    { p: [1.6, 0.4, 2.0], s: 0.2 },
  ];
  const rocks = rockSpecs.map((spec, i) => {
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(spec.s, 0), rockMat);
    m.position.set(spec.p[0], spec.p[1], spec.p[2]);
    m.rotation.set(i * 1.1, i * 0.7, i * 0.5);
    m.userData = {
      baseY: spec.p[1],
      phase: i * 1.7,
      spin: 0.1 + (i % 3) * 0.07,
      bob: 0.1 + (i % 4) * 0.05,
    };
    world.add(m);
    return m;
  });

  let nx = 0;
  let ny = 0;
  let tx = 0;
  let ty = 0;
  const hero = document.getElementById("home");
  hero &&
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });

  let gx = 0;
  let gy = 0;
  let surge = 0;
  let surgeTarget = 0;
  let elapsed = 0;
  let gyroActive = false;
  let baseBeta = null;
  let baseGamma = null;
  let rebase = false;
  const gyroBtn = document.getElementById("gyroBtn");
  const canOrient = typeof window.DeviceOrientationEvent !== "undefined";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const needPerm =
    canOrient && typeof DeviceOrientationEvent.requestPermission === "function";

  const onOrient = (e) => {
    if (e.beta == null || e.gamma == null) return;
    if (baseBeta == null || rebase) {
      baseBeta = e.beta;
      baseGamma = e.gamma;
      rebase = false;
      return;
    }
    const ang =
      (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    const dx = e.gamma - baseGamma;
    const dy = e.beta - baseBeta;
    let x;
    let y;
    if (Math.abs(ang) === 90) {
      x = -dy;
      y = dx;
    } else if (ang === 180) {
      x = -dx;
      y = -dy;
    } else {
      x = dx;
      y = dy;
    }
    gx = Math.max(-1, Math.min(1, x / 28));
    gy = Math.max(-1, Math.min(1, y / 28));
    tx = gx;
    ty = gy;
    const mag = Math.hypot(gx, gy);
    surgeTarget = Math.max(0, Math.min(1, (mag - 0.25) / 0.75));
  };

  const startGyro = () => {
    if (gyroActive || !canOrient) return;
    gyroActive = true;
    baseBeta = null;
    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("orientationchange", () => {
      rebase = true;
    });
    if (gyroBtn) gyroBtn.hidden = true;
  };

  if (coarse && canOrient) {
    if (needPerm) {
      if (gyroBtn) {
        gyroBtn.hidden = false;
        gyroBtn.addEventListener("click", () => {
          DeviceOrientationEvent.requestPermission()
            .then((s) => {
              if (s === "granted") startGyro();
              else gyroBtn.hidden = true;
            })
            .catch(() => {
              gyroBtn.hidden = true;
            });
        });
      }
    } else {
      startGyro();
    }
  }

  let visible = true;
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0.01 }
  );
  io.observe(hero || canvas);

  const resize = () => {
    const w = visual.clientWidth;
    const h = visual.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(visual);

  canvas.addEventListener("webglcontextlost", () => {
    visual.classList.remove("gl-ready");
  });

  let first = true;
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    surge += (surgeTarget - surge) * 0.06;
    elapsed += dt * (1 + surge * 1.6);
    const t = elapsed;
    const light = isLight();

    nx += (tx - nx) * 0.045;
    ny += (ty - ny) * 0.045;

    camera.position.x = nx * 0.55;
    camera.position.y = -ny * 0.4;
    camera.lookAt(0, 0, 0);

    world.rotation.y = nx * 0.1;
    world.rotation.x = -ny * 0.06;

    frameMat.uniforms.uTime.value = t;
    frameMat.uniforms.uIntensity.value = light ? 0.55 : 1;
    interiorMat.uniforms.uTime.value = t;
    diskMat.uniforms.uTime.value = t;
    diskMat.uniforms.uIntensity.value = (light ? 0.6 : 1) + surge * 1.1;

    photon.rotation.z = t * 0.15;
    stars.rotation.z = t * 0.006;
    starMat.opacity = (light ? 0.4 : 0.85) + (light ? 0.1 : 0.15) * Math.sin(t * 2.1);
    halo.material.opacity = (light ? 0.28 : 0.5) + surge * 0.35;
    floorGlow.material.opacity = light ? 0.22 : 0.4;

    rocks.forEach((m) => {
      const u = m.userData;
      m.position.y = u.baseY + Math.sin(t * u.bob + u.phase) * 0.16;
      m.rotation.x += 0.0016 * u.spin * 10;
      m.rotation.y += 0.0012 * u.spin * 10;
    });

    renderer.render(scene, camera);

    if (first) {
      first = false;
      visual.classList.add("gl-ready");
    }
  };
  tick();
})();

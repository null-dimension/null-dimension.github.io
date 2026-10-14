(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const touchCapable = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (!finePointer && !touchCapable) return;
  const isTouch = !finePointer;

  const fx = document.getElementById("cursorFx");
  const dot = fx && fx.querySelector(".cursor-fx__dot");
  const ring = fx && fx.querySelector(".cursor-fx__ring");
  const trail = document.getElementById("cursorTrail");
  const canvas = document.getElementById("cursorConst");
  const charge = fx && fx.querySelector(".cursor-fx__charge");
  const fill = fx && fx.querySelector(".charge__fill");
  if (!fx || !dot || !ring || !trail || !canvas || !charge || !fill) return;
  const ctx = canvas.getContext("2d");

  if (isTouch) fx.classList.add("is-touch");
  else document.documentElement.classList.add("cursor-fx-on");

  const HOVER_SEL = "a, button, .btn, .card, .stat, .tech__item, .palette__item, .nav__link, .link-arrow, input, .icon-btn";
  const MAGNET_SEL = ".btn, .nav__link, .icon-btn, .link-arrow, .footer__link, .brand";
  const SPOT_SEL = ".card, .stat, .cta__panel, .tech__item";
  const TILT_SEL = ".card, .stat";

  document.querySelectorAll(SPOT_SEL).forEach((el) => el.classList.add("spotlight"));
  document.querySelectorAll(".cards, .stats").forEach((el) => {
    el.style.perspective = "1000px";
  });

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let lastTx = mx;
  let lastTy = my;
  let lastMove = performance.now();
  let particles = 0;

  let vx = 0;
  let vy = 0;
  let stretch = 0;
  let angle = 0;

  let magnetEl = null;
  let tiltEl = null;
  let idleTimer = 0;
  let glitchTimer = 0;
  let flareTimer = 0;

  let charging = false;
  let chargeStart = 0;
  let chargeP = 0;
  let lastAcc = 0;
  const CHARGE_MS = 900;
  const CHARGE_CIRC = 125.66;

  let touchId = null;
  let touchSX = 0;
  let touchSY = 0;
  let touchScrolled = false;
  let touchOnTimer = 0;

  const pts = [];
  let lastPtX = -999;
  let lastPtY = -999;
  let lastPtT = 0;

  const resizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  if (!isTouch) fx.classList.add("is-on");

  const scheduleIdle = () => {
    clearTimeout(idleTimer);
    fx.classList.remove("is-idle");
    idleTimer = setTimeout(() => fx.classList.add("is-idle"), 2200);
  };

  const scheduleGlitch = () => {
    clearTimeout(glitchTimer);
    glitchTimer = setTimeout(() => {
      if (!fx.classList.contains("is-hover")) {
        ring.classList.add("is-glitch");
        setTimeout(() => ring.classList.remove("is-glitch"), 320);
      }
      scheduleGlitch();
    }, 2600 + Math.random() * 3600);
  };
  scheduleGlitch();

  const resetMagnet = () => {
    if (!magnetEl) return;
    magnetEl.style.transform = "";
    magnetEl = null;
  };

  const resetTilt = () => {
    if (!tiltEl) return;
    tiltEl.style.transition = "transform 0.6s cubic-bezier(0.22, 1.6, 0.36, 1)";
    tiltEl.style.transform = "";
    const el = tiltEl;
    tiltEl = null;
    setTimeout(() => {
      if (el !== tiltEl) el.style.transition = "";
    }, 620);
  };

  window.addEventListener(
    "mousemove",
    (e) => {
      if (isTouch) return;
      const px = mx;
      const py = my;
      mx = e.clientX;
      my = e.clientY;
      lastMove = performance.now();
      scheduleIdle();
      if (!fx.classList.contains("is-on")) fx.classList.add("is-on");

      const dx = mx - lastTx;
      const dy = my - lastTy;
      if (particles < 28 && dx * dx + dy * dy > 90) {
        lastTx = mx;
        lastTy = my;
        spawnParticle(mx, my, dx, dy);
      }

      const now = performance.now();
      if (Math.hypot(mx - lastPtX, my - lastPtY) > 9 && now - lastPtT > 28) {
        pts.push({ x: mx, y: my, t: now });
        if (pts.length > 36) pts.shift();
        lastPtX = mx;
        lastPtY = my;
        lastPtT = now;
      }

      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      const mag = target.closest(MAGNET_SEL);
      if (mag !== magnetEl) {
        resetMagnet();
        magnetEl = mag;
      }
      if (magnetEl) {
        const r = magnetEl.getBoundingClientRect();
        const ox = mx - (r.left + r.width / 2);
        const oy = my - (r.top + r.height / 2);
        const k = 0.3;
        const lim = 11;
        const tx = Math.max(-lim, Math.min(lim, ox * k));
        const ty = Math.max(-lim, Math.min(lim, oy * k));
        magnetEl.style.transition = "transform 0.18s ease-out";
        magnetEl.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      }

      const spot = target.closest(SPOT_SEL);
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--sx", `${mx - r.left}px`);
        spot.style.setProperty("--sy", `${my - r.top}px`);
      }

      const tilt = target.closest(TILT_SEL);
      if (tilt !== tiltEl) resetTilt();
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const nx = (mx - r.left) / r.width - 0.5;
        const ny = (my - r.top) / r.height - 0.5;
        tiltEl = tilt;
        tilt.style.transition = "transform 0.12s ease-out";
        tilt.style.transform = `rotateX(${(-ny * 7).toFixed(2)}deg) rotateY(${(nx * 8).toFixed(2)}deg)`;
      } else if (tiltEl && !target.closest(TILT_SEL)) {
        resetTilt();
      }
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", () => fx.classList.remove("is-on"));
  document.addEventListener("mouseenter", () => fx.classList.add("is-on"));

  document.addEventListener("mouseover", (e) => {
    fx.classList.toggle("is-hover", !!e.target.closest(HOVER_SEL));
  });

  document.addEventListener("mouseout", (e) => {
    if (e.relatedTarget instanceof Element) {
      if (magnetEl && !e.relatedTarget.closest(MAGNET_SEL)) resetMagnet();
      if (tiltEl && !e.relatedTarget.closest(TILT_SEL)) resetTilt();
    } else {
      resetMagnet();
      resetTilt();
    }
  });

  window.addEventListener("mousedown", (e) => {
    if (isTouch) return;
    if (e.button !== 0) return;
    mx = e.clientX;
    my = e.clientY;
    charging = true;
    chargeStart = performance.now();
    chargeP = 0;
    lastAcc = 0;
    clearTimeout(idleTimer);
    fx.classList.remove("is-idle");
    fx.classList.remove("is-flare");
    fx.classList.remove("is-critical");
    fx.classList.add("is-charging");
    fill.style.strokeDashoffset = String(CHARGE_CIRC);
    spawnPop(mx, my);
  });
  window.addEventListener("mouseup", (e) => {
    if (isTouch || !charging) return;
    charging = false;
    fx.classList.remove("is-charging");
    fx.classList.remove("is-critical");
    const p = chargeP;
    if (p > 0.12) discharge(e.clientX, e.clientY, p);
  });
  window.addEventListener("blur", () => {
    charging = false;
    fx.classList.remove("is-charging");
    fx.classList.remove("is-critical");
  });

  const findTouch = (list) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].identifier === touchId) return list[i];
    }
    return null;
  };

  if (isTouch) {
    window.addEventListener("touchstart", (e) => {
      if (touchId !== null) return;
      const t = e.changedTouches[0];
      touchId = t.identifier;
      touchSX = t.clientX;
      touchSY = t.clientY;
      touchScrolled = false;
      clearTimeout(touchOnTimer);
      mx = t.clientX;
      my = t.clientY;
      rx = mx;
      ry = my;
      fx.classList.add("is-on");
      charging = true;
      chargeStart = performance.now();
      chargeP = 0;
      lastAcc = 0;
      clearTimeout(idleTimer);
      fx.classList.remove("is-idle");
      fx.classList.remove("is-flare");
      fx.classList.remove("is-critical");
      fx.classList.add("is-charging");
      fill.style.strokeDashoffset = String(CHARGE_CIRC);
      spawnPop(mx, my);
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      const t = findTouch(e.changedTouches);
      if (!t) return;
      mx = t.clientX;
      my = t.clientY;
      if (Math.hypot(mx - touchSX, my - touchSY) > 14) {
        touchScrolled = true;
        if (charging) {
          charging = false;
          fx.classList.remove("is-charging");
          fx.classList.remove("is-critical");
        }
      }
      const now = performance.now();
      if (Math.hypot(mx - lastPtX, my - lastPtY) > 9 && now - lastPtT > 28) {
        pts.push({ x: mx, y: my, t: now });
        if (pts.length > 36) pts.shift();
        lastPtX = mx;
        lastPtY = my;
        lastPtT = now;
      }
    }, { passive: true });

    const endTouch = (e) => {
      const t = findTouch(e.changedTouches);
      if (!t) return;
      touchId = null;
      if (charging) {
        charging = false;
        fx.classList.remove("is-charging");
        fx.classList.remove("is-critical");
        if (!touchScrolled && chargeP > 0.12) discharge(t.clientX, t.clientY, chargeP);
      }
      clearTimeout(touchOnTimer);
      touchOnTimer = setTimeout(() => fx.classList.remove("is-on"), 650);
    };
    window.addEventListener("touchend", endTouch, { passive: true });
    window.addEventListener("touchcancel", endTouch, { passive: true });
  }

  const spawnParticle = (x, y, dx, dy) => {
    if (particles >= 28) return;
    particles++;
    const p = document.createElement("i");
    p.className = "cursor-fx__particle";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    const speed = Math.min(Math.hypot(dx, dy), 34);
    const ang = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.4;
    const dist = 10 + speed * 0.7 + Math.random() * 12;
    p.style.setProperty("--px", `${Math.cos(ang) * dist}px`);
    p.style.setProperty("--py", `${Math.sin(ang) * dist + 8}px`);
    const s = 0.6 + Math.random() * 0.9;
    const size = 3 + s * 2.5;
    p.style.width = p.style.height = `${size}px`;
    p.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
    p.addEventListener("animationend", () => {
      p.remove();
      particles--;
    });
    trail.appendChild(p);
  };

  const spawnAccretion = (x, y) => {
    if (particles >= 40) return;
    particles++;
    const a = Math.random() * Math.PI * 2;
    const r = 34 + Math.random() * 26;
    const ox = Math.cos(a) * r;
    const oy = Math.sin(a) * r;
    const p = document.createElement("i");
    p.className = "cursor-fx__particle cursor-fx__particle--acc";
    p.style.left = `${x + ox}px`;
    p.style.top = `${y + oy}px`;
    p.style.setProperty("--px", `${-ox}px`);
    p.style.setProperty("--py", `${-oy}px`);
    const size = 2 + Math.random() * 1.6;
    p.style.width = p.style.height = `${size}px`;
    p.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
    p.style.animationDuration = `${0.45 + Math.random() * 0.15}s`;
    p.addEventListener("animationend", () => {
      p.remove();
      particles--;
    });
    trail.appendChild(p);
  };

  const spawnPop = (x, y) => {
    const p = document.createElement("i");
    p.className = "cursor-fx__pop";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.addEventListener("animationend", () => p.remove());
    trail.appendChild(p);
  };

  const discharge = (x, y, p) => {    const waves = p >= 0.99 ? 2 : 1;
    for (let i = 0; i < waves; i++) {
      const w = document.createElement("i");
      w.className = "cursor-fx__discharge";
      w.style.left = `${x}px`;
      w.style.top = `${y}px`;
      w.style.setProperty("--ds", (3 + p * 7).toFixed(2));
      if (i) w.style.animationDelay = "0.07s";
      w.addEventListener("animationend", () => w.remove());
      trail.appendChild(w);
    }
    fx.classList.add("is-flare");
    clearTimeout(flareTimer);
    flareTimer = setTimeout(() => fx.classList.remove("is-flare"), 240);
  };

  const drawConstellation = (now) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    while (pts.length && now - pts[0].t > 1050) pts.shift();
    if (pts.length < 2) return;

    ctx.globalCompositeOperation = "lighter";

    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const age = (now - b.t) / 1050;
      const alpha = (1 - age) * 0.34;
      ctx.strokeStyle = `rgba(140, 150, 255, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 2; j < pts.length; j++) {
        const a = pts[i];
        const b = pts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 110) continue;
        const age = (now - b.t) / 1050;
        const alpha = (1 - d / 110) * (1 - age) * 0.12;
        if (alpha < 0.01) continue;
        ctx.strokeStyle = `rgba(120, 130, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const age = (now - p.t) / 1050;
      const alpha = (1 - age) * 0.5;
      ctx.fillStyle = `rgba(190, 200, 255, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  };

  const tick = () => {
    requestAnimationFrame(tick);
    const now = performance.now();

    const pvx = mx - rx;
    const pvy = my - ry;
    rx += pvx * 0.16;
    ry += pvy * 0.16;

    vx += (pvx - vx) * 0.2;
    vy += (pvy - vy) * 0.2;
    const speed = Math.hypot(vx, vy);
    if (speed > 0.5) angle = Math.atan2(vy, vx);
    const targetStretch = Math.min(speed / 70, 0.65);
    stretch += (targetStretch - stretch) * 0.15;

    const sx = 1 + stretch;
    const sy = 1 - stretch * 0.45;
    const deg = (angle * 180) / Math.PI;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) rotate(${deg.toFixed(1)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;

    if (charging) {
      chargeP = Math.min((now - chargeStart) / CHARGE_MS, 1);
      fill.style.strokeDashoffset = (CHARGE_CIRC * (1 - chargeP)).toFixed(2);
      charge.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      if (chargeP >= 1) fx.classList.add("is-critical");
      if (now - lastAcc > 55) {
        lastAcc = now;
        spawnAccretion(mx, my);
      }
    }

    drawConstellation(now);
  };
  requestAnimationFrame(tick);
})();

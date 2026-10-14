(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const themeToggle = document.getElementById("themeToggle");
  const toTop = document.getElementById("toTop");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const storedTheme = localStorage.getItem("nd-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    document.documentElement.dataset.theme = storedTheme;
  }

  themeToggle?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("nd-theme", next);
  });

  const onScroll = () => {
    nav?.classList.toggle("is-scrolled", window.scrollY > 12);
    toTop?.classList.toggle("is-visible", window.scrollY > 600);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toTop?.addEventListener("click", () => {
    const r = toTop.getBoundingClientRect();
    runWarp(r.left + r.width / 2, r.top + r.height / 2);
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  navToggle?.addEventListener("click", () => {
    const open = navLinks?.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const warp = document.getElementById("warp");
  const warpVeil = document.getElementById("warpVeil");
  let warping = false;

  const runWarp = (x, y) => {
    if (!warp || warping) return;
    warping = true;
    warp.style.setProperty("--wx", `${x}px`);
    warp.style.setProperty("--wy", `${y}px`);
    warpVeil?.classList.add("is-active");
    warp.classList.add("is-active");
    const done = () => {
      warp.classList.remove("is-active");
      warpVeil?.classList.remove("is-active");
      warping = false;
    };
    setTimeout(done, 720);
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      runWarp(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight * 0.35);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", id);
      navLinks?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const menuLinks = [...document.querySelectorAll(".nav__link")];
  const zones = [...document.querySelectorAll(".ambience__zone")];

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        menuLinks.forEach((a) => {
          const href = a.getAttribute("href") || "";
          a.classList.toggle("is-active", href === `#${id}`);
        });
        zones.forEach((z) => {
          z.classList.toggle("is-on", z.classList.contains(`ambience__zone--${id}`));
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const revealObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  }

  const animateCounter = (el) => {
    const target = Number(el.dataset.target || 0);
    if (!target) return;
    if (prefersReduced) {
      el.textContent = String(target);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".counter").forEach((c) => counterObs.observe(c));

  const scene = document.getElementById("scene");
  if (scene && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    const hero = document.getElementById("home");
    hero?.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      scene.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 5}deg) translateZ(0)`;
    });
    hero?.addEventListener("mouseleave", () => {
      scene.style.transform = "";
    });
  }

  const canvas = document.getElementById("starfield");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let stars = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(160, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        s: Math.random() * 0.4 + 0.1,
        p: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const light = document.documentElement.dataset.theme === "light";
      for (const star of stars) {
        const twinkle = prefersReduced ? 1 : 0.65 + 0.35 * Math.sin(t * star.s + star.p);
        const alpha = star.a * twinkle * (light ? 0.35 : 1);
        ctx.beginPath();
        ctx.fillStyle = `rgba(200, 212, 255, ${alpha})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!prefersReduced) {
        t += 0.016;
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
  }
})();

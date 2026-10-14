(() => {
  const palette = document.getElementById("palette");
  const input = document.getElementById("paletteInput");
  const list = document.getElementById("paletteList");
  const openBtn = document.getElementById("paletteBtn");
  if (!palette || !input || !list) return;

  const icon = (paths) =>
    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  const commands = [
    { group: "Navigate", id: "nav-home", title: "Home", hint: "#home", icon: icon('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'), run: () => jump("#home") },
    { group: "Navigate", id: "nav-about", title: "About", hint: "#about", icon: icon('<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>'), run: () => jump("#about") },
    { group: "Navigate", id: "nav-experience", title: "Experience", hint: "#experience", icon: icon('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>'), run: () => jump("#experience") },
    { group: "Navigate", id: "nav-projects", title: "Projects", hint: "#projects", icon: icon('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'), run: () => jump("#projects") },
    { group: "Navigate", id: "nav-skills", title: "Skills & Tech Stack", hint: "#skills", icon: icon('<path d="M8 6l-5 6 5 6M16 6l5 6-5 6"/>'), run: () => jump("#skills") },
    { group: "Navigate", id: "nav-contact", title: "Contact", hint: "#contact", icon: icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'), run: () => jump("#contact") },
    {
      group: "Projects",
      id: "proj-triage",
      title: "Clinical Triage & Tasking Agents",
      hint: "FastAPI · LangGraph · Playwright",
      icon: icon('<path d="M12 3v18M3 12h18"/>'),
      run: () => jump("#projects"),
    },
    {
      group: "Projects",
      id: "proj-doc",
      title: "AI Document Extraction",
      hint: "LLM · Streamlit",
      icon: icon('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>'),
      run: () => jump("#projects"),
    },
    {
      group: "Projects",
      id: "proj-ide",
      title: "Agentic Workflow POCs",
      hint: "LangGraph · FastMCP · Streamlit",
      icon: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>'),
      run: () => jump("#projects"),
    },
    {
      group: "Projects",
      id: "proj-snakes",
      title: "Snakes and Ladders",
      hint: "live · no libraries",
      icon: icon('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="M10 6.5h5.5V12M21 3v5.5h-5.5"/>'),
      run: () => window.open("https://null-dimension.github.io/snakes-and-ladders", "_blank", "noopener"),
    },
    {
      group: "Projects",
      id: "proj-rngfy",
      title: "RNGFY",
      hint: "live · Firefox extension",
      icon: icon('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12h8M12 8v8"/>'),
      run: () => window.open("https://null-dimension.github.io/rngfy", "_blank", "noopener"),
    },
    {
      group: "Projects",
      id: "proj-intnet-v2",
      title: "INTNET (v2) UI",
      hint: "live · Vue · NuxtUI",
      icon: icon('<circle cx="9" cy="8" r="3.2"/><path d="M2.5 19c.7-3 3.5-4.8 6.5-4.8s5.8 1.8 6.5 4.8"/>'),
      run: () => window.open("https://intne-v2.pages.dev", "_blank", "noopener"),
    },
    {
      group: "Projects",
      id: "proj-intnet",
      title: "Intnet — Interests Network",
      hint: "archived",
      icon: icon('<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>'),
      run: () => jump("#projects"),
    },
    {
      group: "Projects",
      id: "proj-lanquiz",
      title: "LANQUIZ",
      hint: "archived · live scores",
      icon: icon('<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"/>'),
      run: () => jump("#projects"),
    },
    {
      group: "Projects",
      id: "proj-scatter",
      title: "Scatter Network",
      hint: "archived · hashtags",
      icon: icon('<path d="M10 3L8 21M16 3l-2 18M3.5 9h17M3.5 15h17"/>'),
      run: () => jump("#projects"),
    },
    {
      group: "Projects",
      id: "proj-ecommerce",
      title: "Ecommerce Android App",
      hint: "archived · Razorpay",
      icon: icon('<path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>'),
      run: () => jump("#projects"),
    },
    { group: "Actions", id: "act-theme", title: "Toggle theme", hint: "dark / light", icon: icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'), run: () => document.getElementById("themeToggle")?.click() },
    { group: "Actions", id: "act-github", title: "Open GitHub", hint: "external", icon: icon('<path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>'), run: () => window.open("https://github.com/null-dimension", "_blank", "noopener") },
    { group: "Actions", id: "act-v0", title: "Open site v0", hint: "prior version", icon: icon('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>'), run: () => window.open("https://null-dimension.github.io/portfolio/", "_blank", "noopener") },
    { group: "Actions", id: "act-v1", title: "Open site v1", hint: "prior version", icon: icon('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>'), run: () => window.open("https://null-dimension.github.io/terminal-style-portfolio/", "_blank", "noopener") },
    { group: "Actions", id: "act-linkedin", title: "Open LinkedIn", hint: "external", icon: icon('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2.5 2.5 0 0 1 5 0v4"/>'), run: () => window.open("https://www.linkedin.com/in/hrishikesha-u-153230228", "_blank", "noopener") },
  ];

  let active = 0;
  let results = commands.slice();

  const jump = (hash) => {
    const target = document.querySelector(hash);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", hash);
  };

  const fuzzy = (query, text) => {
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    if (t.includes(q)) return 100 - t.indexOf(q);
    let qi = 0;
    let score = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) {
        qi++;
        score += 10 - i * 0.05;
      }
    }
    return qi === q.length ? score : 0;
  };

  const render = () => {
    if (!results.length) {
      list.innerHTML = '<li class="palette__empty">No matches — try "project" or "theme"</li>';
      return;
    }
    let html = "";
    let lastGroup = "";
    results.forEach((cmd, i) => {
      if (cmd.group !== lastGroup) {
        html += `<li class="palette__group-label">${cmd.group}</li>`;
        lastGroup = cmd.group;
      }
      html += `<li class="palette__item${i === active ? " is-active" : ""}" role="option" aria-selected="${i === active}" data-id="${cmd.id}">${cmd.icon}<span>${cmd.title}</span><span class="palette__hint">${cmd.hint}</span></li>`;
    });
    list.innerHTML = html;
  };

  const filter = () => {
    const q = input.value.trim();
    if (!q) {
      results = commands.slice();
    } else {
      results = commands
        .map((c) => ({ c, s: Math.max(fuzzy(q, c.title), fuzzy(q, c.hint) * 0.5) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.c);
    }
    active = 0;
    render();
  };

  const open = () => {
    palette.hidden = false;
    input.value = "";
    active = 0;
    filter();
    input.focus();
  };

  const close = () => {
    palette.hidden = true;
  };

  const runActive = () => {
    const cmd = results[active];
    if (!cmd) return;
    close();
    cmd.run();
  };

  openBtn?.addEventListener("click", open);
  palette.querySelectorAll("[data-palette-close]").forEach((el) => el.addEventListener("click", close));
  input.addEventListener("input", filter);

  list.addEventListener("mousemove", (e) => {
    const item = e.target.closest(".palette__item");
    if (!item) return;
    const idx = results.findIndex((c) => c.id === item.dataset.id);
    if (idx >= 0 && idx !== active) {
      active = idx;
      render();
    }
  });
  list.addEventListener("click", (e) => {
    const item = e.target.closest(".palette__item");
    if (!item) return;
    const idx = results.findIndex((c) => c.id === item.dataset.id);
    if (idx >= 0) {
      active = idx;
      runActive();
    }
  });

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (palette.hidden) open();
      else close();
      return;
    }
    if (palette.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      active = Math.min(active + 1, results.length - 1);
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = Math.max(active - 1, 0);
      render();
    } else if (e.key === "Enter") {
      e.preventDefault();
      runActive();
    }
  });
})();

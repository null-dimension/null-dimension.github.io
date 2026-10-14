(() => {
  const boot = document.getElementById("boot");
  const log = document.getElementById("bootLog");
  const bar = document.getElementById("bootBar");
  if (!boot || !log || !bar) return;
  if (document.documentElement.classList.contains("no-boot")) return;

  const lines = [
    { text: "> null-dimension kernel v0.9.4", delay: 60 },
    { text: "> mounting /dev/void ............ ", ok: "ok", delay: 34 },
    { text: "> resolving null pointer ........ ", ok: "void", delay: 40 },
    { text: "> calibrating portal ........... ", ok: "ok", delay: 34 },
    { text: "> loading operator profile ....... ", ok: "hrishi", val: true, delay: 28 },
    { text: "> dimension stable. welcome.", delay: 50 },
  ];

  const finish = () => {
    boot.classList.add("is-done");
    try {
      sessionStorage.setItem("nd-booted", "1");
    } catch (e) {}
    setTimeout(() => boot.remove(), 800);
    window.removeEventListener("keydown", onKey);
    boot.removeEventListener("click", onClick);
  };

  let cancelled = false;
  const onKey = () => {
    cancelled = true;
    finish();
  };
  const onClick = () => {
    cancelled = true;
    finish();
  };
  window.addEventListener("keydown", onKey);
  boot.addEventListener("click", onClick);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const typeLine = (entry) =>
    new Promise((resolve) => {
      const span = document.createElement("span");
      log.appendChild(span);
      log.appendChild(document.createTextNode("\n"));
      let i = 0;
      const step = () => {
        if (cancelled) return resolve();
        i += 1;
        let html = entry.text.slice(0, i).replace(/ /g, "&nbsp;");
        if (i >= entry.text.length) {
          if (entry.ok) {
            const cls = entry.val ? "val" : "ok";
            html += `<span class="${cls}">${entry.ok}</span>`;
          }
          span.innerHTML = html;
          return resolve();
        }
        span.innerHTML = html + '<span class="cursor"></span>';
        setTimeout(step, entry.delay);
      };
      step();
    });

  const run = async () => {
    await sleep(320);
    for (let i = 0; i < lines.length; i++) {
      if (cancelled) return;
      await typeLine(lines[i]);
      if (cancelled) return;
      bar.style.width = `${Math.round(((i + 1) / lines.length) * 100)}%`;
      await sleep(110);
    }
    if (cancelled) return;
    await sleep(420);
    finish();
  };

  run();
})();

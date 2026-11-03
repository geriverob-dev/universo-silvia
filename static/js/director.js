(function (global) {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  const TOTAL = 8;
  const loader = document.getElementById("loader");
  const app = document.getElementById("app");
  const root = document.getElementById("scene-root");
  const progressList = document.getElementById("progress-list");
  const btnBack = document.getElementById("btn-back");
  const btnSound = document.getElementById("btn-sound");
  const petalCanvas = document.getElementById("petal-canvas");
  const starCursor = document.getElementById("star-cursor");

  const reducedMotion = global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    document.body.classList.add("reduced-motion");
  }

  const state = {
    index: 0,
    gardenBloomed: false,
    envelopes: { a: false, b: false, c: false },
    stars: new Set(),
    butterflies: new Set(),
    candlesOut: new Set(),
    cakeWishDone: false,
    bookOpened: false,
  };

  let currentCleanup = null;
  let petalRaf = null;
  const petals = [];

  function resetState() {
    state.index = 0;
    state.gardenBloomed = false;
    state.envelopes = { a: false, b: false, c: false };
    state.stars = new Set();
    state.butterflies = new Set();
    state.candlesOut = new Set();
    state.cakeWishDone = false;
    state.bookOpened = false;
  }

  function buildProgress() {
    progressList.innerHTML = "";
    for (let i = 0; i < TOTAL; i++) {
      const li = document.createElement("li");
      const dot = document.createElement("span");
      dot.className = "progress-dot";
      dot.setAttribute("aria-label", "Escena " + (i + 1));
      if (i === 0) dot.classList.add("progress-dot--current");
      li.appendChild(dot);
      progressList.appendChild(li);
    }
  }

  function updateProgress() {
    const dots = progressList.querySelectorAll(".progress-dot");
    dots.forEach((dot, i) => {
      dot.classList.remove("progress-dot--current", "progress-dot--done");
      if (i < state.index) dot.classList.add("progress-dot--done");
      if (i === state.index) dot.classList.add("progress-dot--current");
    });
    btnBack.disabled = state.index <= 0;
  }

  const api = {
    state,
    reducedMotion,
    gsap,
    ScrollTrigger,
    next() {
      if (state.index < TOTAL - 1) goTo(state.index + 1);
    },
    back() {
      if (state.index > 0) goTo(state.index - 1);
    },
    restart() {
      resetState();
      goTo(0, true);
    },
    spawnPetals(count, duration) {
      spawnPetalRain(count || 40, duration || 4000);
    },
    spawnConfetti() {
      spawnConfettiBurst();
    },
  };

  function destroyScene() {
    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }
    ScrollTrigger.getAll().forEach((t) => t.kill());
    root.innerHTML = "";
  }

  function transitionIn(el) {
    if (reducedMotion) {
      gsap.set(el, { opacity: 1 });
      return;
    }
    return gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out" });
  }

  function goTo(index, instant) {
    const prev = root.querySelector(".scene--active");
    destroyScene();

    state.index = index;
    updateProgress();

    const sceneEl = document.createElement("section");
    sceneEl.className = "scene scene--active scene-" + (index + 1);
    sceneEl.setAttribute("role", "region");
    sceneEl.setAttribute("aria-label", "Escena " + (index + 1));
    root.appendChild(sceneEl);

    const factory = global.UniversoEscenas[index];
    if (factory) {
      try {
        currentCleanup = factory(sceneEl, api) || null;
      } catch (err) {
        console.error("[Universo] Error en escena " + (index + 1) + ":", err);
      }
    }

    root.focus({ preventScroll: true });

    if (instant || reducedMotion) {
      gsap.set(sceneEl, { opacity: 1 });
    } else if (prev) {
      gsap.fromTo(sceneEl, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 1, ease: "power2.inOut" });
    } else {
      transitionIn(sceneEl);
    }
  }

  btnBack.addEventListener("click", () => api.back());
  btnSound.addEventListener("click", async () => {
    const on = await UniversoAudio.toggle();
    btnSound.setAttribute("aria-pressed", on ? "true" : "false");
    btnSound.setAttribute("aria-label", on ? "Silenciar música suave" : "Activar música suave");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.querySelector(".letter-panel--open")) {
      document.querySelector(".letter-panel--open")?.classList.remove("letter-panel--open");
      return;
    }
  });

  function initPetalCanvas() {
    const resize = () => {
      petalCanvas.width = global.innerWidth;
      petalCanvas.height = global.innerHeight;
    };
    resize();
    global.addEventListener("resize", resize);

    let mx = 0;
    let my = 0;
    global.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (starCursor && global.matchMedia("(pointer: fine)").matches) {
          starCursor.style.left = mx + "px";
          starCursor.style.top = my + "px";
          starCursor.classList.add("star-cursor--on");
        }
      },
      { passive: true }
    );

    global.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches[0]) {
          mx = e.touches[0].clientX;
          my = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    function loop() {
      const ctx2 = petalCanvas.getContext("2d");
      ctx2.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.phase) * 0.3;
        p.phase += 0.02;
        p.rot += p.vr;
        p.life -= 1;
        if (p.life <= 0) {
          petals.splice(i, 1);
          continue;
        }
        ctx2.save();
        ctx2.translate(p.x, p.y);
        ctx2.rotate(p.rot);
        ctx2.fillStyle = p.color;
        ctx2.globalAlpha = Math.min(1, p.life / 40);
        ctx2.beginPath();
        ctx2.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.restore();
      }
      if (!reducedMotion && petals.length < 3 && Math.random() < 0.02) {
        petals.push(makePetal(mx, my, true));
      }
      petalRaf = requestAnimationFrame(loop);
    }
    loop();
  }

  function makePetal(x, y, subtle) {
    const colors = ["#E9B7C6", "#C9BCE7", "#D8B879", "#f5ebe0"];
    return {
      x: x ?? Math.random() * petalCanvas.width,
      y: y ?? -10,
      vx: (Math.random() - 0.5) * (subtle ? 0.3 : 1),
      vy: subtle ? 0.4 + Math.random() * 0.3 : 1.5 + Math.random() * 2,
      r: subtle ? 3 + Math.random() * 2 : 4 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.05,
      phase: Math.random() * 6,
      life: subtle ? 80 + Math.random() * 40 : 120 + Math.random() * 80,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  function spawnPetalRain(count, duration) {
    if (reducedMotion) return;
    const start = performance.now();
    function addBatch() {
      for (let i = 0; i < 4; i++) petals.push(makePetal());
    }
    addBatch();
    const iv = setInterval(() => {
      if (performance.now() - start > duration) {
        clearInterval(iv);
        return;
      }
      addBatch();
    }, 120);
  }

  function spawnConfettiBurst() {
    if (reducedMotion) return;
    let canvas = document.querySelector(".confetti-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "confetti-canvas";
      document.body.appendChild(canvas);
    }
    canvas.width = global.innerWidth;
    canvas.height = global.innerHeight;
    const ctx2 = canvas.getContext("2d");
    const pieces = [];
    const colors = ["#E9B7C6", "#C9BCE7", "#D8B879", "#FFF9F2", "#B86B83"];
    for (let i = 0; i < 80; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 6 - 2,
        w: 4 + Math.random() * 6,
        h: 3 + Math.random() * 4,
        color: colors[i % colors.length],
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.2,
        g: 0.12,
      });
    }
    let frame = 0;
    function anim() {
      ctx2.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y < canvas.height + 20) alive = true;
        ctx2.save();
        ctx2.translate(p.x, p.y);
        ctx2.rotate(p.rot);
        ctx2.fillStyle = p.color;
        ctx2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx2.restore();
      });
      frame++;
      if (alive && frame < 180) requestAnimationFrame(anim);
      else ctx2.clearRect(0, 0, canvas.width, canvas.height);
    }
    anim();
    spawnPetalRain(30, 3500);
  }

  buildProgress();
  initPetalCanvas();

  function boot() {
    app.hidden = false;
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      onComplete() {
        loader.remove();
        goTo(0, true);
      },
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot).catch(boot);
  } else {
    setTimeout(boot, 400);
  }
})(window);

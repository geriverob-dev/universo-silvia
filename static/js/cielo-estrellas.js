(function (global) {
  "use strict";

  function starfield(canvas, reduced) {
    const ctx = canvas.getContext("2d");
    const stars = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let parallaxX = 0;
    let destroyed = false;

    function resize() {
      const cssW = canvas.offsetWidth;
      const cssH = canvas.offsetHeight;
      if (cssW === 0 || cssH === 0) return;

      w = canvas.width = Math.round(cssW * devicePixelRatio);
      h = canvas.height = Math.round(cssH * devicePixelRatio);
      stars.length = 0;
      const n = reduced ? 40 : 120;
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.5,
          a: Math.random(),
          sp: 0.0002 + Math.random() * 0.0004,
        });
      }
    }

    function draw() {
      if (destroyed) return;
      raf = requestAnimationFrame(draw);
      if (w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.a += s.sp;
        const flicker = 0.5 + Math.sin(s.a * 80) * 0.3;
        ctx.fillStyle = "rgba(255,249,242," + flicker + ")";
        ctx.beginPath();
        ctx.arc(s.x + parallaxX * s.r * 0.3, s.y, s.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onResize);
      ro.observe(canvas);
    }

    resize();
    draw();
    requestAnimationFrame(onResize);

    return {
      shift(dx) {
        parallaxX = dx;
      },
      destroy() {
        destroyed = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        if (ro) ro.disconnect();
      },
    };
  }

  /**
   * Fondo nocturno con canvas titilante (escena 1). opts.moon = true añade la luna.
   */
  function mount(bg, api, opts) {
    const options = opts || {};
    bg.classList.add("scene-bg--night");

    const canvas = document.createElement("canvas");
    canvas.className = "stars-canvas";
    bg.appendChild(canvas);

    let moon = null;
    if (options.moon) {
      moon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      moon.setAttribute("class", "moon-svg");
      moon.setAttribute("viewBox", "0 0 100 100");
      moon.setAttribute("aria-hidden", "true");
      moon.innerHTML =
        '<circle cx="50" cy="50" r="38" fill="#D8B879"/><circle cx="62" cy="42" r="36" fill="#22233F"/>';
      bg.appendChild(moon);
    }

    const field = starfield(canvas, api.reducedMotion);

    return {
      canvas,
      moon,
      field,
      destroy() {
        field.destroy();
      },
    };
  }

  global.UniversoCielo = { mount, starfield };
})(window);

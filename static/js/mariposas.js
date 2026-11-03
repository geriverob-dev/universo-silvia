(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  const LIT_INDICES = [0, 2, 4];
  const SPECS = [
    { left: 8, top: 18, luminous: true, phrase: 0 },
    { left: 55, top: 42, luminous: false },
    { left: 28, top: 58, luminous: true, phrase: 1 },
    { left: 72, top: 12, luminous: false },
    { left: 42, top: 28, luminous: false },
    { left: 18, top: 72, luminous: true, phrase: 2 },
    { left: 65, top: 68, luminous: false },
  ];

  function svgEl(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }

  function buildGardenBackdrop() {
    const svg = svgEl("svg", {
      class: "butterfly-garden-bg",
      viewBox: "0 0 320 200",
      preserveAspectRatio: "xMidYMid slice",
      "aria-hidden": "true",
    });
    const defs = svgEl("defs");
    defs.innerHTML =
      '<linearGradient id="bf-sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#c5e4f0"/><stop offset="100%" stop-color="#d8eed8"/></linearGradient>' +
      '<linearGradient id="bf-hill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#a8d4a0"/><stop offset="100%" stop-color="#8fbc85"/></linearGradient>' +
      '<radialGradient id="bf-glow" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#D8B879" stop-opacity="0.9"/><stop offset="100%" stop-color="#D8B879" stop-opacity="0"/></radialGradient>';
    svg.appendChild(defs);
    svg.appendChild(svgEl("rect", { width: "320", height: "200", fill: "url(#bf-sky)" }));
    svg.appendChild(
      svgEl("path", {
        d: "M0,145 Q80,125 160,135 T320,140 L320,200 L0,200 Z",
        fill: "url(#bf-hill)",
      })
    );
    for (let i = 0; i < 8; i++) {
      const x = 25 + i * 38;
      svg.appendChild(
        svgEl("circle", {
          cx: String(x),
          cy: String(138 + (i % 3) * 4),
          r: "4",
          fill: "#E9B7C6",
          opacity: "0.5",
        })
      );
    }
    return svg;
  }

  function createButterflySvg(luminous, uid) {
    const svg = svgEl("svg", {
      viewBox: "0 0 64 56",
      class: "butterfly-art",
      "aria-hidden": "true",
    });
    const defs = svgEl("defs");
    defs.innerHTML =
      '<linearGradient id="bf-wing-l-' +
      uid +
      '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#e8dff8"/><stop offset="100%" stop-color="#C9BCE7"/></linearGradient>' +
      '<linearGradient id="bf-wing-r-' +
      uid +
      '" x1="1" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#f5d4e0"/><stop offset="100%" stop-color="#E9B7C6"/></linearGradient>' +
      '<radialGradient id="bf-glow-' +
      uid +
      '" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#D8B879" stop-opacity="0.9"/><stop offset="100%" stop-color="#D8B879" stop-opacity="0"/></radialGradient>';
    svg.appendChild(defs);

    if (luminous) {
      svg.appendChild(
        svgEl("circle", { class: "bf-halo", cx: "32", cy: "28", r: "26", fill: "url(#bf-glow-" + uid + ")", opacity: "0.55" })
      );
      svg.appendChild(svgEl("circle", { class: "bf-spark bf-spark-1", cx: "18", cy: "12", r: "2", fill: "#fff9f2", opacity: "0.8" }));
      svg.appendChild(svgEl("circle", { class: "bf-spark bf-spark-2", cx: "48", cy: "44", r: "1.5", fill: "#D8B879", opacity: "0.9" }));
    }

    const wingL = svgEl("g", { class: "bf-wing bf-wing-left" });
    wingL.appendChild(
      svgEl("path", {
        d: "M32,28 C22,10 6,14 8,28 C10,40 24,44 32,36",
        fill: "url(#bf-wing-l-" + uid + ")",
        opacity: "0.95",
      })
    );
    const wingR = svgEl("g", { class: "bf-wing bf-wing-right" });
    wingR.appendChild(
      svgEl("path", {
        d: "M32,28 C42,10 58,14 56,28 C54,40 40,44 32,36",
        fill: "url(#bf-wing-r-" + uid + ")",
        opacity: "0.95",
      })
    );
    svg.appendChild(wingL);
    svg.appendChild(wingR);
    svg.appendChild(svgEl("ellipse", { cx: "32", cy: "30", rx: "2.5", ry: "6", fill: "#22233F" }));
    svg.appendChild(svgEl("path", { d: "M32,36 L32,48", stroke: "#22233F", "stroke-width": "1.2", "stroke-linecap": "round" }));
    svg.appendChild(svgEl("path", { d: "M28,22 Q32,18 36,22", fill: "none", stroke: "rgba(255,255,255,0.6)", "stroke-width": "0.8" }));
    return { svg, wingL, wingR };
  }

  function mount(field, api, phrases, onAllFound) {
    field.innerHTML = "";
    field.appendChild(buildGardenBackdrop());
    const layer = document.createElement("div");
    layer.className = "butterfly-layer";
    field.appendChild(layer);

    const buttons = [];
    const tweens = [];

    SPECS.forEach((spec, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "butterfly" + (spec.luminous ? " butterfly--luminous" : " butterfly--ambient");
      b.style.left = spec.left + "%";
      b.style.top = spec.top + "%";
      const hit = document.createElement("span");
      hit.className = "butterfly-hit";
      b.appendChild(hit);
      const { svg, wingL, wingR } = createButterflySvg(spec.luminous, idx);
      b.appendChild(svg);

      if (spec.luminous) {
        const phraseIdx = spec.phrase;
        b.setAttribute("aria-label", "Mariposa luminosa " + (phraseIdx + 1));
        if (api.state.butterflies.has(phraseIdx)) {
          b.classList.add("butterfly--caught");
          b.disabled = true;
        }
        b.addEventListener("click", () => {
          if (api.state.butterflies.has(phraseIdx) || b.disabled) return;
          api.state.butterflies.add(phraseIdx);
          b.classList.add("butterfly--caught");
          b.disabled = true;
          if (!api.reducedMotion) {
            api.gsap.fromTo(b, { scale: 1 }, { scale: 1.15, duration: 0.35, yoyo: true, repeat: 1 });
          }
          if (typeof onAllFound === "function") onAllFound(phrases[phraseIdx]);
          if (api.state.butterflies.size >= 3) {
            api.spawnPetals(50, 4500);
          }
        });
      } else {
        b.setAttribute("aria-label", "Mariposa");
        b.tabIndex = -1;
        b.setAttribute("aria-hidden", "true");
      }

      layer.appendChild(b);
      buttons.push({ b, wingL, wingR, spec, idx });

      if (!api.reducedMotion) {
        tweens.push(
          api.gsap.to(b, {
            x: "+=14",
            y: "+=10",
            duration: 3.5 + idx * 0.35,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          })
        );
        if (spec.luminous && wingL && wingR) {
          tweens.push(
            api.gsap.to(wingL, {
              scaleX: 0.55,
              duration: 0.35,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformOrigin: "32px 28px",
            })
          );
          tweens.push(
            api.gsap.to(wingR, {
              scaleX: 0.55,
              duration: 0.35,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              transformOrigin: "32px 28px",
            })
          );
        }
      }
    });

    if (!api.reducedMotion) {
      api.gsap.set(layer, { opacity: 0 });
      api.gsap.to(layer, { opacity: 1, duration: 0.8, delay: 0.2 });
      api.gsap.fromTo(
        buttons.map((x) => x.b),
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.6)", delay: 0.15 }
      );
      buttons.forEach(({ b }) => {
        if (b.classList.contains("butterfly--luminous") && !b.classList.contains("butterfly--caught")) {
          api.gsap.to(b.querySelector(".bf-halo"), {
            opacity: 0.75,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      });
    }

    return () => tweens.forEach((t) => t.kill());
  }

  global.UniversoMariposas = { mount };
})(window);

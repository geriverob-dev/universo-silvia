(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  const STARS = [
    { id: 0, x: 104, y: 70, label: "Deseo 1" },
    { id: 1, x: 176, y: 70, label: "Deseo 2" },
    { id: 2, x: 140, y: 48, label: "Deseo 3" },
    { id: 3, x: 98, y: 122, label: "Deseo 4" },
    { id: 4, x: 140, y: 158, label: "Deseo 5" },
  ];

  const SEGMENTS = [
    [2, 0],
    [2, 1],
    [0, 3],
    [1, 4],
    [3, 4],
  ];

  const HEART_GLOW =
    "M140,158 C140,158 98,128 98,102 C98,82 112,68 128,76 C140,62 152,62 164,76 C180,68 182,82 182,102 C182,128 140,158 140,158";

  function svgEl(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    }
    return n;
  }

  function gradStop(offset, color, opacity) {
    const s = svgEl("stop", { offset: offset, "stop-color": color });
    if (opacity != null) s.setAttribute("stop-opacity", String(opacity));
    return s;
  }

  function linearGrad(id, x1, y1, x2, y2, stops) {
    const g = svgEl("linearGradient", { id: id, x1: x1, y1: y1, x2: x2, y2: y2 });
    stops.forEach(([o, c, op]) => g.appendChild(gradStop(o, c, op)));
    return g;
  }

  function radialGrad(id, stops, extra) {
    const attrs = { id: id, cx: "50%", cy: "50%", r: "50%" };
    if (extra) Object.assign(attrs, extra);
    const g = svgEl("radialGradient", attrs);
    stops.forEach(([o, c, op]) => g.appendChild(gradStop(o, c, op)));
    return g;
  }

  function injectDefs(svg) {
    const defs = svgEl("defs");
    defs.appendChild(
      radialGrad(
        "cs-sky-glow",
        [
          ["0%", "#3d4278"],
          ["55%", "#252847"],
          ["100%", "#141528"],
        ],
        { cx: "50%", cy: "35%", r: "65%" }
      )
    );
    defs.appendChild(
      radialGrad("cs-nebula", [
        ["0%", "#D8B879", "0.12"],
        ["100%", "#C9BCE7", "0"],
      ])
    );
    defs.appendChild(
      radialGrad("cs-star-core", [
        ["0%", "#fffef8"],
        ["45%", "#D8B879"],
        ["100%", "#b8924a"],
      ])
    );
    defs.appendChild(
      radialGrad("cs-star-dim", [
        ["0%", "#e8e4f5"],
        ["100%", "#9a8fc4"],
      ])
    );
    defs.appendChild(
      radialGrad("cs-star-halo", [
        ["0%", "#C9BCE7", "0.55"],
        ["100%", "#C9BCE7", "0"],
      ])
    );
    const fStar = svgEl("filter", { id: "cs-star-glow", x: "-80%", y: "-80%", width: "260%", height: "260%" });
    const blurS = svgEl("feGaussianBlur", { stdDeviation: "2.5", result: "b" });
    const mergeS = svgEl("feMerge");
    mergeS.appendChild(svgEl("feMergeNode", { in: "b" }));
    mergeS.appendChild(svgEl("feMergeNode", { in: "SourceGraphic" }));
    fStar.appendChild(blurS);
    fStar.appendChild(mergeS);
    defs.appendChild(fStar);
    svg.appendChild(defs);
  }

  function starShapePath(size) {
    const s = size;
    return (
      "M0," +
      -s +
      " L" +
      s * 0.28 +
      "," +
      -s * 0.28 +
      " L" +
      s +
      ",0 L" +
      s * 0.28 +
      "," +
      s * 0.28 +
      " L0," +
      s +
      " L" +
      -s * 0.28 +
      "," +
      s * 0.28 +
      " L" +
      -s +
      ",0 L" +
      -s * 0.28 +
      "," +
      -s * 0.28 +
      " Z"
    );
  }

  function buildSkySvg() {
    const svg = svgEl("svg", {
      viewBox: "0 0 280 200",
      class: "sky-svg",
      role: "img",
      "aria-label": "Cielo de deseos con constelación",
    });
    injectDefs(svg);

    svg.appendChild(svgEl("rect", { width: "280", height: "200", rx: "12", fill: "url(#cs-sky-glow)" }));

    svg.appendChild(
      svgEl("ellipse", {
        cx: "140",
        cy: "95",
        rx: "100",
        ry: "55",
        fill: "url(#cs-nebula)",
        opacity: "0.9",
      })
    );

    svg.appendChild(
      svgEl("path", {
        d: "M20,55 Q80,25 140,40 Q200,22 260,58",
        fill: "none",
        stroke: "#fff9f2",
        "stroke-width": "8",
        "stroke-linecap": "round",
        opacity: "0.04",
      })
    );

    const dust = svgEl("g", { class: "sky-dust", opacity: "0.5" });
    for (let i = 0; i < 56; i++) {
      const x = (i * 37 + 11) % 276;
      const y = (i * 23 + 7) % 190;
      const r = i % 7 === 0 ? 1.4 : i % 3 === 0 ? 0.9 : 0.5;
      dust.appendChild(
        svgEl("circle", {
          cx: String(x),
          cy: String(y),
          r: String(r),
          fill: "#fff9f2",
          opacity: String(0.12 + (i % 5) * 0.06),
        })
      );
    }
    svg.appendChild(dust);

    const linesLayer = svgEl("g", { class: "sky-lines-layer" });
    const segmentEls = SEGMENTS.map(([a, b], idx) => {
      const sa = STARS[a];
      const sb = STARS[b];
      const len = Math.hypot(sb.x - sa.x, sb.y - sa.y);
      const line = svgEl("line", {
        class: "sky-segment",
        "data-seg": String(idx),
        x1: String(sa.x),
        y1: String(sa.y),
        x2: String(sb.x),
        y2: String(sb.y),
        stroke: "#C9BCE7",
        "stroke-width": "1.4",
        "stroke-linecap": "round",
        opacity: "0.14",
        "stroke-dasharray": String(len),
        "stroke-dashoffset": String(len),
      });
      line.setAttribute("data-len", String(len));
      linesLayer.appendChild(line);
      return { line, a, b, len };
    });
    svg.appendChild(linesLayer);

    const heartGlow = svgEl("path", {
      class: "sky-heart-glow",
      d: HEART_GLOW,
      fill: "none",
      stroke: "#E9B7C6",
      "stroke-width": "1.4",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      opacity: "0",
    });
    svg.appendChild(heartGlow);

    const starsLayer = svgEl("g", { class: "sky-stars-layer" });
    const starNodes = STARS.map((st) => {
      const g = svgEl("g", {
        class: "star-btn sky-star sky-star--enter",
        role: "button",
        tabindex: "0",
        "data-star-id": String(st.id),
        transform: "translate(" + st.x + "," + st.y + ")",
      });
      g.setAttribute("aria-label", st.label);

      const hit = svgEl("circle", {
        class: "sky-star-hit",
        cx: "0",
        cy: "0",
        r: "22",
        fill: "transparent",
      });
      const halo = svgEl("circle", {
        class: "sky-star-halo",
        cx: "0",
        cy: "0",
        r: "18",
        fill: "url(#cs-star-halo)",
        opacity: "0.4",
      });
      const shape = svgEl("path", {
        class: "sky-star-shape",
        d: starShapePath(11),
        fill: "url(#cs-star-dim)",
        filter: "url(#cs-star-glow)",
      });
      const core = svgEl("circle", {
        class: "sky-star-spark",
        cx: "0",
        cy: "0",
        r: "2.5",
        fill: "#fff9f2",
        opacity: "0.95",
      });

      g.appendChild(hit);
      g.appendChild(halo);
      g.appendChild(shape);
      g.appendChild(core);
      starsLayer.appendChild(g);
      return { g, halo, shape, core, st };
    });
    svg.appendChild(starsLayer);

    return { svg, segmentEls, starNodes, heartGlow };
  }

  function animateSegmentOn(seg, gsap, reduced) {
    if (reduced) {
      seg.line.setAttribute("stroke-dashoffset", "0");
      return;
    }
    gsap.to(seg.line, {
      attr: { "stroke-dashoffset": 0 },
      duration: 0.65,
      ease: "power2.out",
    });
  }

  function setSegmentLit(seg, lit, gsap, reduced, animate) {
    const line = seg.line;
    if (lit) {
      line.setAttribute("stroke", "#D8B879");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("opacity", "0.95");
      line.setAttribute("filter", "url(#cs-star-glow)");
      if (animate) animateSegmentOn(seg, gsap, reduced);
      else line.setAttribute("stroke-dashoffset", "0");
    } else {
      line.setAttribute("stroke", "#C9BCE7");
      line.setAttribute("stroke-width", "1.4");
      line.setAttribute("opacity", "0.14");
      line.removeAttribute("filter");
      line.setAttribute("stroke-dashoffset", String(seg.len));
    }
  }

  function setStarLit(node, lit, gsap, reduced) {
    node.g.classList.toggle("sky-star--lit", lit);
    node.g.classList.toggle("sky-star--dim-pulse", !lit);
    node.shape.setAttribute("fill", lit ? "url(#cs-star-core)" : "url(#cs-star-dim)");
    node.halo.setAttribute("opacity", lit ? "0.9" : "0.4");
    if (lit && gsap && !reduced) {
      gsap.fromTo(node.halo, { attr: { r: 16 } }, { attr: { r: 22 }, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.out" });
    }
  }

  function refreshSegments(segmentEls, activeSet, gsap, reduced, animateStarId) {
    segmentEls.forEach((seg) => {
      const on = activeSet.has(seg.a) && activeSet.has(seg.b);
      const shouldAnimate =
        animateStarId != null &&
        on &&
        (seg.a === animateStarId || seg.b === animateStarId);
      setSegmentLit(seg, on, gsap, reduced, shouldAnimate);
    });
  }

  function playEntrance(parts, api) {
    const { svg, starNodes } = parts;
    const { gsap, reducedMotion: reduced } = api;
    if (reduced) {
      starNodes.forEach((n) => n.g.classList.remove("sky-star--enter"));
      return;
    }
    gsap.set(svg, { opacity: 0, scale: 0.96, transformOrigin: "50% 50%" });
    gsap.to(svg, { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" });
    gsap.fromTo(
      starNodes.map((n) => n.g),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        onComplete: () => {
          starNodes.forEach((n) => {
            n.g.classList.remove("sky-star--enter");
            if (!n.g.classList.contains("sky-star--lit")) n.g.classList.add("sky-star--dim-pulse");
          });
        },
      }
    );
  }

  function wireConstellation(parts, activeSet, wishLabels, wishEl, contBtn, api) {
    const { segmentEls, starNodes, heartGlow } = parts;
    const { gsap, reducedMotion: reduced } = api;

    function tryFinish() {
      if (activeSet.size < 5) return;
      contBtn.style.display = "inline-flex";
      refreshSegments(segmentEls, activeSet, gsap, reduced, null);
      if (reduced) {
        heartGlow.setAttribute("opacity", "0.55");
        return;
      }
      const len = heartGlow.getTotalLength();
      heartGlow.setAttribute("stroke-dasharray", String(len));
      heartGlow.setAttribute("stroke-dashoffset", String(len));
      heartGlow.setAttribute("opacity", "0.7");
      gsap.to(heartGlow, {
        attr: { "stroke-dashoffset": 0 },
        duration: 2,
        ease: "power2.inOut",
      });
      gsap.to(heartGlow, { opacity: 0.85, duration: 1.2, delay: 0.4 });
    }

    function activate(id) {
      if (activeSet.has(id)) return;
      activeSet.add(id);
      const node = starNodes[id];
      setStarLit(node, true, gsap, reduced);
      wishEl.textContent = wishLabels[id];
      if (!reduced) {
        gsap.fromTo(wishEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      }
      refreshSegments(segmentEls, activeSet, gsap, reduced, id);
      tryFinish();
    }

    starNodes.forEach((node, id) => {
      if (activeSet.has(id)) {
        setStarLit(node, true, null, true);
        node.g.classList.remove("sky-star--dim-pulse");
      } else {
        node.g.classList.add("sky-star--dim-pulse");
      }
      node.g.addEventListener("click", () => activate(id));
      node.g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate(id);
        }
      });
    });

    refreshSegments(segmentEls, activeSet, gsap, reduced, null);
    playEntrance(parts, api);
    if (activeSet.size === 5) tryFinish();
  }

  /** SVG mínimo si falla el módulo principal */
  function buildFallbackSky() {
    const svg = svgEl("svg", {
      viewBox: "0 0 280 200",
      class: "sky-svg sky-svg--fallback",
    });
    svg.appendChild(svgEl("rect", { width: "280", height: "200", fill: "#252847" }));
    STARS.forEach((st) => {
      svg.appendChild(
        svgEl("circle", {
          cx: String(st.x),
          cy: String(st.y),
          r: "12",
          fill: "#C9BCE7",
          opacity: "0.8",
        })
      );
    });
    return svg;
  }

  global.UniversoConstelacion = {
    buildSkySvg,
    buildFallbackSky,
    wireConstellation,
    STARS,
  };
})(window);

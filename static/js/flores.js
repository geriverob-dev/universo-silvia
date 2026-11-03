(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    }
    return n;
  }

  function hillY(x) {
    const t = x / 400;
    return 148 + Math.sin(t * Math.PI) * 8 + Math.cos(t * 4.2) * 3;
  }

  function generatePositions(count, minDist) {
    const pts = [];
    let attempts = 0;
    while (pts.length < count && attempts < count * 40) {
      attempts++;
      const x = 28 + Math.random() * 344;
      const y = hillY(x) + (Math.random() - 0.5) * 6;
      if (pts.every((p) => Math.hypot(p.x - x, p.y - y) >= minDist)) {
        pts.push({ x, y, type: Math.floor(Math.random() * 5), rot: (Math.random() - 0.5) * 24, scale: 0.72 + Math.random() * 0.48 });
      }
    }
    while (pts.length < count) {
      const x = 28 + Math.random() * 344;
      pts.push({ x, y: hillY(x), type: pts.length % 5, rot: 0, scale: 0.85 });
    }
    return pts;
  }

  function injectDefs(svg) {
    const defs = svgEl("defs");
    defs.innerHTML =
      '<linearGradient id="fg-sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#dbeef8"/><stop offset="100%" stop-color="#e8f4e8"/></linearGradient>' +
      '<linearGradient id="fg-grass" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#b8d9a8"/><stop offset="100%" stop-color="#8fb87a"/></linearGradient>' +
      '<radialGradient id="fg-petal-rose" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#f5d0dc"/><stop offset="100%" stop-color="#B86B83"/></radialGradient>' +
      '<radialGradient id="fg-petal-lav" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#e8dff8"/><stop offset="100%" stop-color="#9a87c4"/></radialGradient>' +
      '<radialGradient id="fg-petal-daisy" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#f5ebe0"/></radialGradient>' +
      '<filter id="fg-soft" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#3d5a3d" flood-opacity="0.25"/></filter>';
    svg.appendChild(defs);
  }

  function buildGardenSvg() {
    const svg = svgEl("svg", {
      viewBox: "0 0 400 220",
      class: "garden-svg",
      role: "img",
      "aria-label": "Jardín ilustrado",
    });
    injectDefs(svg);

    const sky = svgEl("rect", { x: "0", y: "0", width: "400", height: "220", fill: "url(#fg-sky)" });
    svg.appendChild(sky);

    const hill = svgEl("path", {
      d: "M0,165 Q60,145 120,152 T240,148 Q320,142 400,158 L400,220 L0,220 Z",
      fill: "url(#fg-grass)",
    });
    svg.appendChild(hill);

    for (let i = 0; i < 12; i++) {
      const lx = 20 + i * 32 + (i % 3) * 5;
      const line = svgEl("path", {
        d: "M" + lx + ",168 q4,-6 8,0",
        stroke: "#7aa86a",
        "stroke-width": "1",
        fill: "none",
        opacity: "0.35",
      });
      svg.appendChild(line);
    }

    const flowersLayer = svgEl("g", { class: "garden-flowers-layer" });
    svg.appendChild(flowersLayer);

    const bouquetLayer = svgEl("g", { class: "garden-bouquet-layer", opacity: "0" });
    svg.appendChild(bouquetLayer);

    return { svg, flowersLayer, bouquetLayer };
  }

  function addPetal(parent, cx, cy, rx, ry, fill, rot) {
    const p = svgEl("ellipse", {
      cx: String(cx),
      cy: String(cy),
      rx: String(rx),
      ry: String(ry),
      fill: fill,
    });
    if (rot) p.setAttribute("transform", "rotate(" + rot + " " + cx + " " + cy + ")");
    parent.appendChild(p);
    return p;
  }

  function createBloom(type, container) {
    const bloom = svgEl("g", { class: "flower-bloom" });
    bloom.setAttribute("transform", "scale(0.12)");

    if (type === 0) {
      for (let i = 0; i < 8; i++) {
        addPetal(bloom, 0, -18, 9, 14, "url(#fg-petal-rose)", i * 45);
      }
      bloom.appendChild(svgEl("circle", { cx: "0", cy: "-18", r: "5", fill: "#B86B83" }));
    } else if (type === 1) {
      for (let i = 0; i < 6; i++) {
        addPetal(bloom, 0, -14 - i * 5, 4, 7, "url(#fg-petal-lav)", i * 18 - 20);
      }
      bloom.appendChild(svgEl("circle", { cx: "0", cy: "-42", r: "4", fill: "#8a7ab8" }));
    } else if (type === 2) {
      for (let i = 0; i < 10; i++) {
        addPetal(bloom, 0, -16, 5, 12, "url(#fg-petal-daisy)", i * 36);
      }
      bloom.appendChild(svgEl("circle", { cx: "0", cy: "-16", r: "6", fill: "#D8B879" }));
    } else if (type === 3) {
      for (let i = 0; i < 4; i++) {
        addPetal(bloom, 0, -12, 7, 11, "#E9B7C6", i * 90);
      }
      bloom.appendChild(svgEl("circle", { cx: "0", cy: "-12", r: "4", fill: "#fff9f2" }));
    } else {
      for (let i = 0; i < 5; i++) {
        addPetal(bloom, 0, -14, 6, 10, "#D8B879", i * 72);
      }
      bloom.appendChild(svgEl("circle", { cx: "0", cy: "-14", r: "4", fill: "#b8924a" }));
    }

    const petals = bloom.querySelectorAll("ellipse");
    petals.forEach((p, i) => {
      p.setAttribute("class", "flower-petal");
      p.setAttribute("data-i", String(i));
    });

    container.appendChild(bloom);
    return bloom;
  }

  function createFlowerInstance(layer, spec) {
    const { x, y, type, rot, scale } = spec;
    const g = svgEl("g", { class: "flower-instance" });
    g.setAttribute("transform", "translate(" + x + "," + y + ") rotate(" + rot + ") scale(" + scale + ")");

    const seed = svgEl("circle", {
      class: "flower-seed",
      cx: "0",
      cy: "0",
      r: "3",
      fill: "#5a8f4a",
      opacity: "0",
    });
    g.appendChild(seed);

    const stemLen = type === 1 ? 55 : 48;
    const stem = svgEl("path", {
      class: "flower-stem",
      d: "M0,0 Q" + (2 + (type % 3)) + ",-" + stemLen * 0.5 + " 0,-" + stemLen,
      stroke: "#4d8a4d",
      "stroke-width": "2.5",
      fill: "none",
      "stroke-linecap": "round",
    });
    const dash = stemLen * 1.2;
    stem.setAttribute("stroke-dasharray", String(dash));
    stem.setAttribute("stroke-dashoffset", String(dash));
    g.appendChild(stem);

    const leaves = svgEl("g", { class: "flower-leaves", opacity: "0" });
    leaves.appendChild(
      svgEl("ellipse", {
        cx: "-6",
        cy: "-" + stemLen * 0.35,
        rx: "7",
        ry: "4",
        fill: "#6fa86a",
        transform: "rotate(-35 -6 -" + stemLen * 0.35 + ")",
      })
    );
    leaves.appendChild(
      svgEl("ellipse", {
        cx: "7",
        cy: "-" + stemLen * 0.55,
        rx: "7",
        ry: "4",
        fill: "#6fa86a",
        transform: "rotate(30 7 -" + stemLen * 0.55 + ")",
      })
    );
    g.appendChild(leaves);

    const bloomWrap = svgEl("g", { class: "flower-bloom-wrap" });
    bloomWrap.setAttribute("transform", "translate(0,-" + stemLen + ")");
    createBloom(type, bloomWrap);
    g.appendChild(bloomWrap);

    layer.appendChild(g);
    return { g, stem, seed, leaves, bloomWrap, stemLen, dash };
  }

  function animateFlowerGrow(parts, gsap, reduced) {
    const tl = gsap.timeline();
    const { stem, seed, leaves, bloomWrap } = parts;
    const bloom = bloomWrap.querySelector(".flower-bloom");

    if (reduced) {
      tl.set(seed, { opacity: 1 });
      tl.set(stem, { attr: { "stroke-dashoffset": 0 } });
      tl.set(leaves, { opacity: 1 });
      tl.set(bloom, { attr: { transform: "scale(1)" } });
      return tl;
    }

    tl.fromTo(seed, { opacity: 0, attr: { r: 0.5 } }, { opacity: 1, attr: { r: 3 }, duration: 0.28, ease: "back.out(2.5)" });
    tl.to(stem, { attr: { "stroke-dashoffset": 0 }, duration: 0.55, ease: "power1.out" }, "-=0.05");
    tl.to(leaves, { opacity: 1, duration: 0.35 }, "-=0.2");
    tl.fromTo(
      bloom,
      { attr: { transform: "scale(0.12)" } },
      { attr: { transform: "scale(1)" }, duration: 0.55, ease: "back.out(1.9)" },
      "-=0.08"
    );
    return tl;
  }

  function showInstantGarden(flowersLayer, positions) {
    positions.forEach((spec) => {
      const parts = createFlowerInstance(flowersLayer, spec);
      parts.seed.setAttribute("opacity", "1");
      parts.stem.setAttribute("stroke-dashoffset", "0");
      parts.leaves.setAttribute("opacity", "1");
      const bloom = parts.bloomWrap.querySelector(".flower-bloom");
      bloom.setAttribute("transform", "scale(1)");
    });
  }

  function buildBouquet(bouquetLayer) {
    bouquetLayer.innerHTML = "";
    bouquetLayer.setAttribute("transform", "translate(200,125)");
    const wrap = svgEl("g", { filter: "url(#fg-soft)" });

    const ribbon = svgEl("path", {
      d: "M-8,28 Q0,38 8,28 L6,42 Q0,48 -6,42 Z",
      fill: "#D8B879",
    });
    wrap.appendChild(ribbon);

    [[-22, 8, 0.9, 0], [0, 0, 1.05, -8], [22, 10, 0.85, 12], [-10, 18, 0.75, -15], [14, 20, 0.7, 8]].forEach(([ox, oy, sc, r]) => {
      const mini = svgEl("g", { transform: "translate(" + ox + "," + oy + ") rotate(" + r + ") scale(" + sc + ")" });
      const bw = svgEl("g", { transform: "translate(0,-42)" });
      createBloom(Math.floor(Math.abs(ox)) % 5, bw);
      const b = bw.querySelector(".flower-bloom");
      if (b) b.setAttribute("transform", "scale(0.85)");
      mini.appendChild(svgEl("path", { d: "M0,0 Q1,-20 0,-42", stroke: "#5a8f5a", "stroke-width": "2", fill: "none" }));
      mini.appendChild(bw);
      wrap.appendChild(mini);
    });

    bouquetLayer.appendChild(wrap);
  }

  function runGardenBloom(flowersLayer, bouquetLayer, gsap, reduced, onComplete) {
    const count = 40;
    const positions = generatePositions(count, 16);
    flowersLayer.innerHTML = "";

    if (reduced) {
      showInstantGarden(flowersLayer, positions);
      buildBouquet(bouquetLayer);
      gsap.set(bouquetLayer, { opacity: 1 });
      if (onComplete) onComplete();
      return null;
    }

    const master = gsap.timeline({ onComplete: onComplete });
    positions.forEach((spec, i) => {
      const parts = createFlowerInstance(flowersLayer, spec);
      master.add(animateFlowerGrow(parts, gsap, false), i * 0.1);
    });

    const endAt = positions.length * 0.1 + 0.5;
    master.add(() => buildBouquet(bouquetLayer), endAt);
    master.to(bouquetLayer, { opacity: 1, duration: 1.2, ease: "power2.out" }, endAt + 0.1);

    return master;
  }

  global.UniversoFlores = {
    buildGardenSvg,
    generatePositions,
    createFlowerInstance,
    showInstantGarden,
    buildBouquet,
    runGardenBloom,
    hillY,
  };
})(window);

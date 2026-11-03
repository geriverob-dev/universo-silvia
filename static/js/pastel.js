(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }

  /**
   * Crea el SVG del pastel. Devuelve { svg, flames: [{ g, flameOuter, flameInner, i }] }
   */
  function buildCakeSvg() {
    const svg = svgEl("svg", {
      viewBox: "0 0 220 200",
      class: "cake-svg",
      role: "img",
      "aria-label": "Pastel de cumpleaños",
    });

    const defs = svgEl("defs");
    defs.innerHTML =
      '<linearGradient id="ck-base" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#fff9f2"/><stop offset="100%" stop-color="#e8dcc8"/></linearGradient>' +
      '<linearGradient id="ck-frost" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#f5d4e0"/><stop offset="100%" stop-color="#E9B7C6"/></linearGradient>' +
      '<linearGradient id="ck-frost2" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#f0ebe0"/><stop offset="100%" stop-color="#d4c4a8"/></linearGradient>' +
      '<linearGradient id="ck-flame" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0%" stop-color="#D8B879"/><stop offset="50%" stop-color="#ffe8a0"/><stop offset="100%" stop-color="#fff9f2"/></linearGradient>' +
      '<filter id="ck-shadow" x="-30%" y="-30%" width="160%" height="160%">' +
      '<feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#22233F" flood-opacity="0.25"/></filter>';
    svg.appendChild(defs);

    svg.appendChild(
      svgEl("ellipse", { cx: "110", cy: "178", rx: "82", ry: "10", fill: "rgba(34,35,63,0.18)" })
    );

    const cake = svgEl("g", { filter: "url(#ck-shadow)" });

    cake.appendChild(
      svgEl("path", {
        d: "M45,175 L45,125 Q45,115 110,112 Q175,115 175,125 L175,175 Q175,182 110,185 Q45,182 45,175 Z",
        fill: "url(#ck-base)",
        stroke: "#D8B879",
        "stroke-width": "0.8",
      })
    );

    cake.appendChild(
      svgEl("path", {
        d: "M55,125 Q110,118 165,125 L165,118 Q110,108 55,118 Z",
        fill: "url(#ck-frost2)",
      })
    );

    cake.appendChild(
      svgEl("path", {
        d: "M55,118 Q110,108 165,118 L165,95 Q110,82 55,95 Z",
        fill: "url(#ck-frost)",
        stroke: "#B86B83",
        "stroke-width": "0.6",
      })
    );

    cake.appendChild(
      svgEl("path", {
        d: "M58,95 Q110,88 162,95 Q130,92 110,90 Q90,92 58,95",
        fill: "rgba(255,255,255,0.45)",
      })
    );

    [[75, 108], [110, 102], [145, 108], [92, 118], [128, 118]].forEach(([cx, cy], i) => {
      const rosette = svgEl("circle", {
        cx: String(cx),
        cy: String(cy),
        r: "5",
        fill: i % 2 ? "#fff9f2" : "#f5ebe0",
        stroke: "#D8B879",
        "stroke-width": "0.5",
      });
      cake.appendChild(rosette);
      cake.appendChild(svgEl("circle", { cx: String(cx), cy: String(cy), r: "2", fill: "#E9B7C6" }));
    });

    [[68, 128], [152, 128], [110, 135]].forEach(([cx, cy]) => {
      const fg = svgEl("g", { transform: "translate(" + cx + "," + cy + ") scale(0.35)" });
      for (let i = 0; i < 5; i++) {
        fg.appendChild(
          svgEl("ellipse", {
            cx: "0",
            cy: "-12",
            rx: "5",
            ry: "9",
            fill: "#E9B7C6",
            transform: "rotate(" + i * 72 + " 0 -12)",
          })
        );
      }
      fg.appendChild(svgEl("circle", { cx: "0", cy: "-12", r: "3", fill: "#B86B83" }));
      fg.appendChild(svgEl("path", { d: "M0,0 L0,-12", stroke: "#6a9a6a", "stroke-width": "1.5" }));
      cake.appendChild(fg);
    });

    svg.appendChild(cake);

    const sparks = svgEl("g", { class: "cake-sparks" });
    [[50, 75], [170, 78], [110, 58]].forEach(([x, y]) => {
      sparks.appendChild(
        svgEl("path", {
          d: "M" + x + "," + y + " l3,0 l1.5,2.5 l1.5,-2.5 l3,0 l-2.5,1.5 l2.5,1.5 l-3,0 l-1.5,2.5 l-1.5,-2.5 l-3,0 l2.5,-1.5 z",
          fill: "#D8B879",
          opacity: "0.7",
        })
      );
    });
    svg.appendChild(sparks);

    const flames = [];
    [75, 110, 145].forEach((cx, i) => {
      const g = svgEl("g", { class: "candle-btn" });
      g.setAttribute("role", "button");
      g.setAttribute("tabindex", "0");
      g.setAttribute("aria-label", "Vela " + (i + 1));

      g.appendChild(
        svgEl("rect", {
          x: String(cx - 3.5),
          y: "68",
          width: "7",
          height: "32",
          rx: "2",
          fill: "#fff9f2",
          stroke: "#e8dcc8",
          "stroke-width": "0.5",
        })
      );
      g.appendChild(svgEl("line", { x1: cx, y1: "68", x2: cx, y2: "64", stroke: "#333", "stroke-width": "1" }));

      const flameOuter = svgEl("ellipse", {
        class: "candle-flame candle-flame--outer",
        cx: String(cx),
        cy: "56",
        rx: "6",
        ry: "11",
        fill: "url(#ck-flame)",
      });
      const flameInner = svgEl("ellipse", {
        class: "candle-flame candle-flame--inner",
        cx: String(cx),
        cy: "58",
        rx: "3",
        ry: "6",
        fill: "#fff9f2",
        opacity: "0.85",
      });
      g.appendChild(flameOuter);
      g.appendChild(flameInner);
      svg.appendChild(g);
      flames.push({ g, flameOuter, flameInner, i, cx });
    });

    return { svg, flames, sparks };
  }

  global.UniversoPastel = { buildCakeSvg };
})(window);

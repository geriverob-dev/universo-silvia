(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) {
      if (text === "\u00a0") n.innerHTML = "&nbsp;";
      else n.textContent = text;
    }
    return n;
  }

  function marginFlower(x, y, flip) {
    const g = svgEl("g", { transform: "translate(" + x + "," + y + ")" + (flip ? " scale(-1,1)" : "") });
    g.setAttribute("class", "poem-margin-svg");
    g.innerHTML =
      '<path d="M8 2c-2 3-5 5-5 8a5 5 0 0 0 10 0c0-3-3-5-5-8z" fill="#E9B7C6" opacity="0.7"/>' +
      '<circle cx="8" cy="6" r="1.2" fill="#D8B879"/>';
    return g;
  }

  function mountStarSky(bgElement, api) {
    const layer = el("div", "book-star-sky");
    const svg = svgEl("svg", {
      class: "book-star-sky-svg",
      viewBox: "0 0 400 600",
      preserveAspectRatio: "xMidYMid slice",
      "aria-hidden": "true",
    });

    const defs = svgEl("defs");
    defs.innerHTML =
      '<radialGradient id="bk-halo" cx="50%" cy="45%" r="45%">' +
      '<stop offset="0%" stop-color="#D8B879" stop-opacity="0.2"/><stop offset="100%" stop-color="#D8B879" stop-opacity="0"/></radialGradient>';
    svg.appendChild(defs);

    svg.appendChild(svgEl("rect", { width: "400", height: "600", fill: "url(#bk-halo)" }));
    svg.appendChild(
      svgEl("path", {
        d: "M0,80 Q120,40 200,70 T400,90",
        fill: "none",
        stroke: "#fff9f2",
        "stroke-width": "12",
        opacity: "0.04",
        "stroke-linecap": "round",
      })
    );

    const stars = [];
    for (let i = 0; i < 52; i++) {
      const cx = (i * 47 + 13) % 396;
      const cy = (i * 31 + 7) % 580;
      const r = i % 6 === 0 ? 1.8 : i % 3 === 0 ? 1.1 : 0.65;
      const star = svgEl("circle", {
        class: "book-twinkle-star",
        cx: String(cx),
        cy: String(cy),
        r: String(r),
        fill: i % 4 === 0 ? "#D8B879" : "#fff9f2",
        opacity: String(0.25 + (i % 5) * 0.12),
      });
      svg.appendChild(star);
      stars.push(star);
    }

    layer.appendChild(svg);
    bgElement.appendChild(layer);

    const tweens = [];
    if (!api.reducedMotion) {
      stars.forEach((star, i) => {
        tweens.push(
          api.gsap.to(star, {
            opacity: 0.15 + (i % 4) * 0.15,
            duration: 1.6 + (i % 7) * 0.25,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: (i * 0.07) % 2,
          })
        );
      });
    }

    return () => {
      tweens.forEach((t) => t.kill());
      layer.remove();
    };
  }

  function wireScrollContainer(inner) {
    inner.addEventListener(
      "wheel",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );

    inner.addEventListener(
      "touchmove",
      (e) => {
        if (inner.scrollHeight > inner.clientHeight + 1) {
          e.stopPropagation();
        }
      },
      { passive: true }
    );
  }

  function markBookOpened(parts) {
    const { book, wrap } = parts;
    book.removeAttribute("role");
    book.removeAttribute("tabindex");
    book.removeAttribute("aria-label");
    wrap.setAttribute("aria-expanded", "true");
    wrap.classList.add("book-wrap--open");
  }

  function buildBook(api, poemLines) {
    const wrap = el("div", "book-wrap");
    const book = el("div", "book");
    book.setAttribute("role", "button");
    book.setAttribute("tabindex", "0");
    book.setAttribute("aria-label", "Abrir libro de poemas");

    const spine = el("div", "book-spine");
    const cover = el("div", "book-cover");
    const coverFrame = el("div", "book-cover-frame");
    const coverDeco = document.createElementNS(NS, "svg");
    coverDeco.setAttribute("class", "book-cover-deco");
    coverDeco.setAttribute("viewBox", "0 0 200 280");
    coverDeco.innerHTML =
      '<path d="M20,30 L180,30 L175,250 L25,250 Z" fill="none" stroke="#D8B879" stroke-width="1" opacity="0.5"/>' +
      '<path transform="translate(24,24)" d="M8 2c-2 3-5 5-5 8a5 5 0 0 0 10 0c0-3-3-5-5-8z" fill="#E9B7C6" opacity="0.55"/>' +
      '<path transform="translate(160,200)" d="M6 0 L7 2 L9 2 L7.5 3.5 L8 6 L6 4.5 L4 6 L4.5 3.5 L3 2 L5 2 Z" fill="#D8B879" opacity="0.7"/>';

    const title = el("span", "book-cover-title", "Para Silvia");
    const hint = el("span", "book-cover-hint", "Toca para abrirlo");
    coverFrame.appendChild(coverDeco);
    coverFrame.appendChild(title);
    coverFrame.appendChild(hint);
    cover.appendChild(coverFrame);

    const pages = el("div", "book-pages");
    const marginWrap = document.createElementNS(NS, "svg");
    marginWrap.setAttribute("class", "poem-margins");
    marginWrap.setAttribute("viewBox", "0 0 100 100");
    marginWrap.setAttribute("preserveAspectRatio", "none");
    marginWrap.appendChild(marginFlower(8, 8, false));
    marginWrap.appendChild(marginFlower(92, 8, true));
    marginWrap.appendChild(marginFlower(8, 92, false));
    marginWrap.appendChild(marginFlower(92, 92, true));

    const inner = el("div", "book-pages-inner");
    let firstTextIdx = -1;
    let lastTextIdx = -1;
    poemLines.forEach((line, i) => {
      if (line === "") return;
      if (firstTextIdx === -1) firstTextIdx = i;
      lastTextIdx = i;
    });
    poemLines.forEach((line, i) => {
      let cls = "poem-line";
      if (line !== "" && i === firstTextIdx) cls += " poem-line--title";
      if (line !== "" && i === lastTextIdx) cls += " poem-line--closing";
      const p = el("p", cls, line === "" ? "\u00a0" : line);
      inner.appendChild(p);
    });

    pages.appendChild(marginWrap);
    pages.appendChild(inner);
    wireScrollContainer(inner);

    book.appendChild(spine);
    book.appendChild(cover);
    book.appendChild(pages);
    wrap.appendChild(book);

    return { wrap, book, cover, pages, inner };
  }

  function showPoemLines(lines, gsap, reduced, onDone) {
    if (reduced) {
      lines.forEach((l) => {
        l.style.opacity = "1";
      });
      if (onDone) onDone();
      return;
    }
    gsap.to(lines, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      stagger: 0.12,
      ease: "power1.out",
      delay: 0.15,
      onComplete: onDone,
    });
  }

  function setOpenedVisual(parts, gsap, reduced) {
    const { book, cover, pages, inner } = parts;
    book.classList.add("book--open");
    markBookOpened(parts);
    if (reduced) {
      cover.style.transform = "rotateY(-108deg)";
    } else {
      gsap.set(cover, { rotateY: -108, transformOrigin: "left center" });
    }
    pages.style.opacity = "1";
    pages.style.pointerEvents = "auto";
    inner.querySelectorAll(".poem-line").forEach((l) => {
      l.style.opacity = "1";
    });
  }

  function openBook(parts, api, onPoemDone) {
    const { book, cover, pages, inner } = parts;
    const { gsap, reducedMotion: reduced } = api;
    api.state.bookOpened = true;
    book.classList.add("book--open");
    markBookOpened(parts);

    const lines = inner.querySelectorAll(".poem-line");
    if (!reduced) {
      gsap.set(lines, { opacity: 0, y: 8 });
    }

    if (reduced) {
      setOpenedVisual(parts, gsap, true);
      if (onPoemDone) onPoemDone();
      return;
    }

    const tl = gsap.timeline();
    tl.to(cover, {
      rotateY: -108,
      duration: 0.95,
      ease: "power2.inOut",
      transformOrigin: "left center",
    });
    tl.fromTo(pages, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, "-=0.35");
    tl.add(() => {
      showPoemLines(lines, gsap, false, onPoemDone);
    });
  }

  /**
   * @param {HTMLElement} bg
   * @param {HTMLElement} content
   * @param {*} api
   * @param {string[]} poemLines
   * @param {HTMLElement} nextBtn
   */
  function mount(_bg, content, api, poemLines, nextBtn) {
    const parts = buildBook(api, poemLines);
    content.appendChild(parts.wrap);
    content.appendChild(nextBtn);

    let opened = api.state.bookOpened;

    const revealNext = () => {
      nextBtn.style.opacity = "1";
      nextBtn.style.pointerEvents = "auto";
    };

    if (opened) {
      setOpenedVisual(parts, api.gsap, api.reducedMotion);
      revealNext();
    } else if (!api.reducedMotion) {
      api.gsap.fromTo(
        parts.wrap,
        { opacity: 0, y: 20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.out", delay: 0.15 }
      );
      api.gsap.to(parts.cover, {
        boxShadow: "0 0 24px rgba(216,184,121,0.35)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    function onActivate() {
      if (opened) return;
      opened = true;
      openBook(parts, api, revealNext);
    }

    parts.book.addEventListener("click", onActivate);
    parts.book.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    });

    return () => {};
  }

  global.UniversoLibro = { mount, mountStarSky, buildBook };
})(window);

(function (global) {
  "use strict";

  function el(tag, cls) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  function envelopeMarkup(key) {
    return (
      '<svg class="envelope-body" viewBox="0 0 100 80" aria-hidden="true">' +
      '<defs><linearGradient id="env-paper-' +
      key +
      '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#fff9f2"/><stop offset="100%" stop-color="#f0e6dc"/></linearGradient></defs>' +
      '<rect class="env-back" x="8" y="28" width="84" height="44" rx="3" fill="url(#env-paper-' +
      key +
      ')" stroke="#B86B83" stroke-width="0.8"/>' +
      '<g class="envelope-letter-peek" opacity="0">' +
      '<rect x="18" y="18" width="64" height="36" rx="2" fill="#fffef9" stroke="#D8B879" stroke-width="0.6"/>' +
      '<line x1="24" y1="28" x2="76" y2="28" stroke="#E9B7C6" stroke-width="0.8"/>' +
      '<line x1="24" y1="36" x2="68" y2="36" stroke="#C9BCE7" stroke-width="0.6" opacity="0.7"/>' +
      "</g>" +
      '<path class="env-front" d="M8 30 L50 52 L92 30 L92 72 L8 72 Z" fill="#f5ebe0" stroke="#B86B83" stroke-width="0.8"/>' +
      '<g class="envelope-flap">' +
      '<path d="M8 30 L50 52 L92 30 L50 22 Z" fill="#E9B7C6" stroke="#B86B83" stroke-width="0.8"/>' +
      '<g class="env-seal">' +
      '<circle cx="50" cy="38" r="9" fill="#B86B83"/>' +
      '<path d="M46 38 L50 42 L54 34" fill="none" stroke="#FFF9F2" stroke-width="1.5"/></g>' +
      "</g></svg>"
    );
  }

  function setOpenVisual(wrap, instant) {
    wrap.classList.add("envelope--open");
    const peek = wrap.querySelector(".envelope-letter-peek");
    const flap = wrap.querySelector(".envelope-flap");
    const seal = wrap.querySelector(".env-seal");
    if (peek) peek.setAttribute("opacity", "1");
    if (instant) {
      if (flap) flap.style.transform = "rotateX(160deg)";
      if (seal) seal.style.opacity = "0";
    }
  }

  function animateOpen(wrap, gsap, reduced) {
    wrap.classList.add("envelope--open");
    const flap = wrap.querySelector(".envelope-flap");
    const seal = wrap.querySelector(".env-seal");
    const peek = wrap.querySelector(".envelope-letter-peek");
    if (reduced) {
      setOpenVisual(wrap, true);
      return;
    }
    if (flap) {
      gsap.to(flap, {
        rotateX: 160,
        duration: 0.7,
        ease: "power2.inOut",
        transformOrigin: "50px 30px",
      });
    }
    if (seal) gsap.to(seal, { opacity: 0, duration: 0.35, delay: 0.15 });
    if (peek) gsap.to(peek, { opacity: 1, duration: 0.5, delay: 0.35 });
  }

  /**
   * @returns {{ row: HTMLElement, openModal: Function, syncOpenStates: Function }}
   */
  function createRow(titles, envelopeState, api, openModal) {
    const row = el("div", "envelopes-row");
    const wraps = {};

    titles.forEach(([key, label]) => {
      const wrap = el("div", "envelope-wrap");
      const envBtn = el("button", "envelope");
      envBtn.setAttribute("aria-label", "Abrir sobre: " + label);
      envBtn.innerHTML = envelopeMarkup(key);
      const lbl = el("span", "envelope-label", label);
      wrap.appendChild(envBtn);
      wrap.appendChild(lbl);
      row.appendChild(wrap);
      wraps[key] = { wrap, envBtn };

      if (envelopeState[key]) {
        setOpenVisual(wrap, true);
      }

      envBtn.addEventListener("click", () => {
        const firstOpen = !envelopeState[key];
        if (firstOpen) {
          envelopeState[key] = true;
          animateOpen(wrap, api.gsap, api.reducedMotion);
        }
        openModal(key);
      });
    });

    return {
      row,
      syncOpenStates() {
        titles.forEach(([key]) => {
          if (envelopeState[key]) setOpenVisual(wraps[key].wrap, true);
        });
      },
    };
  }

  global.UniversoSobres = {
    createRow,
    setOpenVisual,
  };
})(window);

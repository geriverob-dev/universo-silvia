(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  const PARAGRAPHS = [
    "Hoy quería regalarte algo que no pudiera envolverse en papel.",
    "Un pequeño rincón hecho de palabras, flores y estrellas, porque hay personas que merecen que uno se detenga un momento a crear algo solamente para ellas.",
    "Deseo que este nuevo año de tu vida te encuentre rodeada de cariño, de sueños que se cumplan y de momentos que te hagan sonreír de verdad.",
    "Gracias por ser tú, por tu forma tan especial de mirar la vida y por todas esas pequeñas cosas que te hacen única.",
    "Feliz cumpleaños, Silvia.",
  ];

  function buildFrameSvg() {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "final-frame-svg");
    svg.setAttribute("viewBox", "0 0 400 520");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      '<defs><pattern id="final-paper" width="8" height="8" patternUnits="userSpaceOnUse">' +
      '<path d="M0 8 L8 0" stroke="#D8B879" stroke-width="0.3" opacity="0.15"/></pattern></defs>' +
      '<rect x="12" y="12" width="376" height="496" rx="6" fill="url(#final-paper)" stroke="#D8B879" stroke-width="1" opacity="0.4"/>' +
      '<rect x="20" y="20" width="360" height="480" rx="4" fill="none" stroke="#B86B83" stroke-width="0.6" opacity="0.35"/>' +
      '<g opacity="0.65">' +
      '<path transform="translate(28,28)" d="M12 2c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10z" fill="#E9B7C6"/>' +
      '<path transform="translate(352,28) scale(-1,1)" d="M12 2c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10z" fill="#C9BCE7"/>' +
      '<path transform="translate(28,468)" d="M12 2c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10z" fill="#C9BCE7"/>' +
      '<path transform="translate(352,468) scale(-1,1)" d="M12 2c-2 4-6 6-6 10a6 6 0 0 0 12 0c0-4-4-6-6-10z" fill="#E9B7C6"/>' +
      "</g>";
    return svg;
  }

  function build(api) {
    const scene = document.createElement("div");
    scene.className = "final-scene";

    const sun = document.createElement("div");
    sun.className = "final-sun";
    scene.appendChild(sun);

    const frame = document.createElement("div");
    frame.className = "final-frame";

    const frameInner = document.createElement("div");
    frameInner.className = "final-frame-inner";
    frameInner.appendChild(buildFrameSvg());

    const scroll = document.createElement("div");
    scroll.className = "final-scroll";

    const salutation = document.createElement("p");
    salutation.className = "final-salutation";
    salutation.textContent = "Querida Silvia:";

    scroll.appendChild(salutation);
    PARAGRAPHS.forEach((text) => {
      const p = document.createElement("p");
      p.className = "final-p";
      p.textContent = text;
      scroll.appendChild(p);
    });

    const signBlock = document.createElement("div");
    signBlock.className = "final-sign";
    signBlock.innerHTML =
      '<span class="final-sign-line"></span>' +
      '<p class="final-sign-text">Con mucho cariño,</p>' +
      '<p class="final-sign-name">Gerardo <span class="heart-accent" aria-hidden="true">♡</span></p>' +
      '<svg class="final-wax" viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="24" r="20" fill="#8f5068" stroke="#B86B83" stroke-width="1"/>' +
      '<circle cx="24" cy="22" r="14" fill="#B86B83" opacity="0.9"/>' +
      '<path d="M18 24 L24 30 L30 20" fill="none" stroke="#fff9f2" stroke-width="1.5" opacity="0.5"/></svg>';

    scroll.appendChild(signBlock);
    frameInner.appendChild(scroll);
    frame.appendChild(frameInner);
    scene.appendChild(frame);

    const { gsap, reducedMotion: reduced } = api;

    if (reduced) {
      return scene;
    }

    gsap.set(frame, { opacity: 0, y: 28, scale: 0.98 });
    gsap.to(frame, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power2.out", delay: 0.2 });
    gsap.fromTo(
      scroll.querySelectorAll(".final-p, .final-salutation"),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: "power2.out", delay: 0.5 }
    );
    gsap.fromTo(signBlock, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1.1 });
    gsap.to(sun, { opacity: 0.85, scale: 1.05, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });

    return scene;
  }

  global.UniversoCartaFinal = { build };
})(window);

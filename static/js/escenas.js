(function (global) {
  "use strict";

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function btn(label, extraClass, micro) {
    const b = el("button", "btn-primary " + (extraClass || "") + " " + (micro || ""));
    b.type = "button";
    b.textContent = label;
    return b;
  }

  function typewriter(target, text, speed, gsap, reduced) {
    target.textContent = "";
    if (reduced) {
      target.textContent = text;
      return gsap.delayedCall(0.1, () => {});
    }
    const chars = [...text];
    const tl = gsap.timeline();
    chars.forEach((ch, i) => {
      tl.call(
        () => {
          target.textContent += ch;
        },
        null,
        i * speed
      );
    });
    return tl;
  }

  const envelopePoems = {
    a: "Admiro la calma con que escuchas,\ncomo si el silencio también tuviera algo\nque contar, y tú supieras esperarlo\nsin prisa, con esa luz serena en la mirada.",
    b: "Provocas, sin buscarlo, que el día\nse incline hacia lo bello: un gesto,\nuna risa contenida, la forma en que\nencuentras detalle donde otros pasan de largo.",
    c: "Deseo para ti caminos amables,\nmañanas que te sorprendan suaves,\ny la certeza — aunque no siempre lo digas—\nde que alguien te quiere con ternura honesta.",
  };

  const wishLabels = [
    "Alegría que no se apague en los días grises.",
    "Tranquilidad, como un atardecer sin prisa.",
    "Aventuras pequeñas que te hagan sentir viva.",
    "Sueños que encuentren puertas abiertas.",
    "Personas que te quieran bonito, sin condiciones.",
  ];

  const butterflyPhrases = [
    "Que nunca te falten razones para sonreír.",
    "Que tus sueños encuentren caminos.",
    "Que la vida te abrace con la misma dulzura que tú compartes.",
  ];

  const poemLines = [
    "Para ti, mi Silvia ❤️",
    "",
    "Qué hermoso es saber que existes, Silvia, que entre tantas personas y tantos caminos, la vida me permitió encontrarte. Me haces feliz de maneras tan sencillas: con tu sonrisa, con tu voz, con esas pequeñas cosas de nuestros días que, sin darte cuenta, conviertes en recuerdos maravillosos.",
    "",
    "Hoy quisiera regalarte el cielo entero, todas sus estrellas y todas las flores del mundo. Pero ya sabes lo complicado que soy para sorprenderte; siempre siento que ningún detalle es suficiente para alguien tan especial. Si pudiera regalarte algo imposible, te prestaría mis ojos un instante para que vieras lo hermosa que eres para mí.",
    "",
    "Deseo que cumplas muchísimos años más, que la vida te abrace con ternura y te regale todo lo bonito que mereces. Y ojalá me permita seguir coincidiendo contigo, entre nuestras risas, nuestras miradas y esos pequeños momentos cotidianos que tanto adoro. Porque desde que estás aquí, Silvia, hasta los días más comunes tienen algo de poesía.",
    "",
    "Feliz cumpleaños, mi niña bonita. ❤️",
  ];

  function scene1(container, api) {
    const bg = el("div", "scene-bg");
    const sky = UniversoCielo.mount(bg, api, { moon: true });
    container.appendChild(bg);

    const content = el("div", "scene-content");
    const lines = el("p", "scene-lines");
    const title = el("h1", "scene-title");
    title.innerHTML = 'Feliz cumpleaños, Silvia <span class="heart-accent" aria-hidden="true">♡</span>';
    title.style.opacity = "0";
    const cta = btn("Tengo algo para ti", "", "btn-micro-glow");
    cta.style.opacity = "0";
    content.append(lines, title, cta);
    container.appendChild(content);

    const master = api.gsap.timeline({ delay: 0.4 });
    master.add(typewriter(lines, "Hay días que el calendario guarda en silencio...", 0.045, api.gsap, api.reducedMotion));
    master.to({}, { duration: api.reducedMotion ? 0.3 : 1.8 });
    master.add(() => {
      lines.textContent = "";
    });
    master.add(typewriter(lines, "Y hay uno que merece llenarse de estrellas.", 0.04, api.gsap, api.reducedMotion));
    master.to(title, { opacity: 1, duration: 1 }, "+=0.6");
    master.to(cta, { opacity: 1, duration: 0.8 }, "-=0.2");

    cta.addEventListener("click", () => {
      api.gsap.to(sky.canvas, { x: 80, opacity: 0.3, duration: 1.2, ease: "power2.inOut" });
      sky.field.shift(40);
      api.gsap.to(sky.moon, { x: 30, opacity: 0.5, duration: 1 });
      api.gsap.to(content, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => api.next(),
      });
    });

    return () => sky.destroy();
  }

  function scene2(container, api) {
    const bg = el("div", "scene-bg");
    container.appendChild(bg);

    const content = el("div", "scene-content");
    content.innerHTML =
      '<p class="scene-lines scene-lines--dark">Hay personas que, sin proponérselo, hacen florecer los días de otros.</p>';
    const stage = el("div", "garden-stage");
    const { svg, flowersLayer, bouquetLayer } = UniversoFlores.buildGardenSvg();
    stage.appendChild(svg);

    const growBtn = btn("Haz florecer este jardín", "btn-primary--rose", "btn-micro-pulse");
    const ded = el("p", "garden-dedication", "Y qué bonito es coincidir contigo.");
    const nextBtn = btn("Hay algo más...", "", "btn-micro-glow");
    nextBtn.style.display = "none";

    content.append(stage, growBtn, ded, nextBtn);
    container.appendChild(content);

    let blooming = false;
    let bloomTimeline = null;

    function finishGardenUI() {
      growBtn.style.display = "none";
      api.gsap.to(ded, { opacity: 1, duration: 1 });
      nextBtn.style.display = "inline-flex";
    }

    function restoreBloomed() {
      const positions = UniversoFlores.generatePositions(40, 16);
      flowersLayer.innerHTML = "";
      UniversoFlores.showInstantGarden(flowersLayer, positions);
      UniversoFlores.buildBouquet(bouquetLayer);
      bouquetLayer.setAttribute("opacity", "1");
      growBtn.style.display = "none";
      ded.style.opacity = "1";
      nextBtn.style.display = "inline-flex";
    }

    if (api.state.gardenBloomed) {
      restoreBloomed();
    }

    growBtn.addEventListener("click", () => {
      if (blooming || api.state.gardenBloomed) return;
      blooming = true;
      growBtn.disabled = true;

      bloomTimeline = UniversoFlores.runGardenBloom(
        flowersLayer,
        bouquetLayer,
        api.gsap,
        api.reducedMotion,
        () => {
          api.state.gardenBloomed = true;
          blooming = false;
          finishGardenUI();
        }
      );
    });

    nextBtn.addEventListener("click", () => api.next());

    return () => {
      if (bloomTimeline) bloomTimeline.kill();
    };
  }

  function scene3(container, api) {
    const bg = el("div", "scene-bg");
    container.appendChild(bg);
    const content = el("div", "scene-content");
    content.innerHTML =
      '<p class="scene-lines scene-lines--dark">Tres sobres, tres secretos pequeños.</p>';

    const titles = [
      ["a", "Lo que admiro de ti"],
      ["b", "Lo que provocas sin saberlo"],
      ["c", "Lo que deseo para ti"],
    ];

    const panel = el("div", "letter-panel");
    const card = el("div", "letter-card");
    const poemEl = el("p", "letter-poem");
    const closeBtn = btn("Cerrar carta");
    closeBtn.classList.add("btn-primary--rose");
    card.append(poemEl, closeBtn);
    panel.appendChild(card);
    document.body.appendChild(panel);

    const contBtn = btn("Continuar", "", "btn-micro-glow");
    contBtn.style.display =
      api.state.envelopes.a && api.state.envelopes.b && api.state.envelopes.c ? "inline-flex" : "none";

    function openModal(key) {
      poemEl.textContent = envelopePoems[key];
      panel.classList.add("letter-panel--open");
      if (!api.reducedMotion) {
        api.gsap.fromTo(card, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" });
      }
      if (api.state.envelopes.a && api.state.envelopes.b && api.state.envelopes.c) {
        contBtn.style.display = "inline-flex";
      }
    }

    const { row } = UniversoSobres.createRow(titles, api.state.envelopes, api, openModal);

    closeBtn.addEventListener("click", () => panel.classList.remove("letter-panel--open"));
    panel.addEventListener("click", (e) => {
      if (e.target === panel) panel.classList.remove("letter-panel--open");
    });

    content.append(row, contBtn);
    container.appendChild(content);
    contBtn.addEventListener("click", () => {
      panel.remove();
      api.next();
    });

    return () => panel.remove();
  }

  function scene4(container, api) {
    const bg = el("div", "scene-bg");
    const sky = UniversoCielo.mount(bg, api, { moon: false });
    container.appendChild(bg);

    const content = el("div", "scene-content");
    content.innerHTML =
      '<p class="scene-lines">Si pudiera regalarte un pedacito del cielo, llenaría cada estrella de un deseo para ti.</p>';
    const wish = el("p", "wish-text");
    const cont = btn("Seguir", "", "btn-micro-glow");
    cont.style.display = api.state.stars.size === 5 ? "inline-flex" : "none";

    try {
      if (typeof UniversoConstelacion === "undefined") {
        throw new Error("UniversoConstelacion no cargó");
      }
      const parts = UniversoConstelacion.buildSkySvg();
      content.appendChild(parts.svg);
      content.append(wish, cont);
      container.appendChild(content);
      UniversoConstelacion.wireConstellation(parts, api.state.stars, wishLabels, wish, cont, api);
    } catch (err) {
      console.error("[Universo] Escena 4:", err);
      const fallback = document.createElement("p");
      fallback.className = "scene-lines";
      fallback.textContent = "Un momento… volvamos a mirar el cielo.";
      content.appendChild(fallback);
      if (typeof UniversoConstelacion !== "undefined" && UniversoConstelacion.buildFallbackSky) {
        content.appendChild(UniversoConstelacion.buildFallbackSky());
      }
      const retry = btn("Reintentar", "btn-primary--rose");
      retry.addEventListener("click", () => {
        api.gsap.to(content, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            content.innerHTML =
              '<p class="scene-lines">Si pudiera regalarte un pedacito del cielo, llenaría cada estrella de un deseo para ti.</p>';
            content.appendChild(wish);
            content.appendChild(cont);
            try {
              const parts = UniversoConstelacion.buildSkySvg();
              content.insertBefore(parts.svg, wish);
              UniversoConstelacion.wireConstellation(parts, api.state.stars, wishLabels, wish, cont, api);
              api.gsap.to(content, { opacity: 1, duration: 0.5 });
            } catch (e2) {
              console.error(e2);
            }
          },
        });
      });
      content.append(retry, wish, cont);
      container.appendChild(content);
    }

    cont.addEventListener("click", () => api.next());
    return () => sky.destroy();
  }

  function scene5(container, api) {
    const bg = el("div", "scene-bg");
    container.appendChild(bg);
    const content = el("div", "scene-content");
    content.innerHTML = '<p class="scene-lines scene-lines--dark">Toca tres mariposas luminosas.</p>';
    const field = el("div", "butterfly-field");
    const msg = el("p", "butterfly-msg");
    const next = btn("Continuar", "", "btn-micro-glow");
    next.style.display = api.state.butterflies.size >= 3 ? "inline-flex" : "none";

    const cleanup = UniversoMariposas.mount(field, api, butterflyPhrases, (phrase) => {
      msg.textContent = phrase;
      if (!api.reducedMotion) {
        api.gsap.fromTo(msg, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 });
      }
      if (api.state.butterflies.size >= 3) {
        next.style.display = "inline-flex";
      }
    });

    content.append(field, msg, next);
    container.appendChild(content);
    next.addEventListener("click", () => api.next());
    return cleanup;
  }

  function scene6(container, api) {
    const bg = el("div", "scene-bg");
    const sky = UniversoCielo.mount(bg, api, { moon: false });
    container.appendChild(bg);
    const content = el("div", "scene-content");

    const next = btn("Todavía falta tu deseo", "", "btn-micro-pulse");
    next.style.opacity = "0";
    next.style.pointerEvents = "none";

    UniversoLibro.mount(bg, content, api, poemLines, next);
    container.appendChild(content);
    next.addEventListener("click", () => api.next());
    return () => sky.destroy();
  }

  function scene7(container, api) {
    const bg = el("div", "scene-bg");
    const sky = UniversoCielo.mount(bg, api, { moon: false });
    container.appendChild(bg);
    const content = el("div", "scene-content");
    content.innerHTML =
      '<p class="scene-lines">Ahora viene la parte más importante… pide un deseo.</p>';

    const { svg, flames, sparks } = UniversoPastel.buildCakeSvg();
    content.appendChild(svg);

    const wishBtn = btn("Ya pedí mi deseo", "btn-primary--rose", "btn-micro-glow");
    const blowHint = el("p", "scene-lines");
    blowHint.textContent = "Entonces apaga las velitas ♡";
    blowHint.style.opacity = "0";
    const blowAll = btn("Apagar velas");
    blowAll.style.display = "none";
    const bigTitle = el("h2", "cake-title", "¡Feliz cumpleaños, Silvia!");
    const next = btn("Una carta más...", "", "btn-micro-glow");
    next.style.display = "none";

    content.append(wishBtn, blowHint, blowAll, bigTitle, next);
    container.appendChild(content);

    if (!api.reducedMotion) {
      api.gsap.to(sparks.querySelectorAll("path"), {
        opacity: 0.95,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
        ease: "sine.inOut",
      });
    }

    function animateFlames() {
      if (api.reducedMotion) return;
      flames.forEach(({ flameOuter, flameInner, i }) => {
        if (api.state.candlesOut.has(i)) return;
        api.gsap.to(flameOuter, {
          attr: { rx: 5 + Math.random() * 2, ry: 9 + Math.random() * 4 },
          duration: 0.25 + Math.random() * 0.15,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.12,
        });
        api.gsap.to(flameInner, {
          attr: { ry: 5 + Math.random() * 2 },
          duration: 0.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.08,
        });
      });
    }
    animateFlames();

    function refreshCandles() {
      flames.forEach(({ g, flameOuter, flameInner, i }) => {
        if (api.state.candlesOut.has(i)) {
          flameOuter.style.opacity = "0";
          flameInner.style.opacity = "0";
          g.style.pointerEvents = "none";
        }
      });
    }
    refreshCandles();

    if (api.state.cakeWishDone) {
      wishBtn.style.display = "none";
      blowHint.style.opacity = "1";
      blowAll.style.display = "inline-flex";
    }

    wishBtn.addEventListener("click", () => {
      api.state.cakeWishDone = true;
      wishBtn.style.display = "none";
      api.gsap.to(blowHint, { opacity: 1, duration: 0.6 });
      blowAll.style.display = "inline-flex";
    });

    function blow(i) {
      if (api.state.candlesOut.has(i)) return;
      api.state.candlesOut.add(i);
      const f = flames[i];
      api.gsap.to([f.flameOuter, f.flameInner], { opacity: 0, duration: 0.45 });
      if (api.state.candlesOut.size === 3) finishCake();
    }

    flames.forEach(({ g, i }) => {
      g.addEventListener("click", () => blow(i));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          blow(i);
        }
      });
    });

    blowAll.addEventListener("click", () => {
      [0, 1, 2].forEach(blow);
    });

    function finishCake() {
      api.spawnConfetti();
      api.gsap.to(bigTitle, { opacity: 1, duration: 1, scale: 1.02, ease: "power2.out" });
      next.style.display = "inline-flex";
    }

    if (api.state.candlesOut.size === 3) {
      bigTitle.style.opacity = "1";
      next.style.display = "inline-flex";
    }

    next.addEventListener("click", () => api.next());
    return () => sky.destroy();
  }

  function scene8(container, api) {
    const bg = el("div", "scene-bg");
    const sky = UniversoCielo.mount(bg, api, { moon: false });
    container.appendChild(bg);
    const content = el("div", "scene-content");
    const finalScene = UniversoCartaFinal.build(api);
    const restart = btn("Volver a pasear por nuestro pequeño universo", "btn-primary--rose", "btn-micro-pulse");
    content.append(finalScene, restart);
    container.appendChild(content);
    restart.addEventListener("click", () => api.restart());
    return () => sky.destroy();
  }

  global.UniversoEscenas = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8];
})(window);

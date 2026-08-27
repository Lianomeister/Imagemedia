(function () {
  if (window.__imNavFix) return;
  window.__imNavFix = true;

  const MENUS = {
    Anwendungen: [
      ["/Imagemedia/anwendungen/grossflaechenwerbung", "Großflächenwerbung"],
      ["/Imagemedia/anwendungen/messen", "Messen"],
      ["/Imagemedia/anwendungen/events", "Events"],
      ["/Imagemedia/anwendungen/interior", "Interior- und Shopdesign"],
      ["/Imagemedia/anwendungen/fahrzeuge", "Fahrzeugbeschriftung"],
      ["/Imagemedia/anwendungen/inflatables", "Inflatables"],
      ["/Imagemedia/anwendungen/architektur", "Architektur"],
    ],
    Produkte: [
      ["/Imagemedia/produkte/digitaldruck", "Digitaldruck"],
      ["/Imagemedia/produkte/konfektion", "Konfektion"],
      ["/Imagemedia/produkte/montage", "Montage"],
      ["/Imagemedia/produkte/displays", "Displays"],
    ],
    Unternehmen: [
      ["/Imagemedia/unternehmen", "Über uns"],
      ["/Imagemedia/unternehmen#team", "Team"],
    ],
    Infocenter: [
      ["/Imagemedia/infocenter/grafikvorlagen", "Grafikvorlagen"],
      ["/Imagemedia/infocenter/datenaufbereitung", "Datenaufbereitung"],
      ["/Imagemedia/infocenter/produktkatalog/produkte", "Produktkatalog"],
    ],
  };

  function isCoarsePointer() {
    try {
      return window.matchMedia("(hover: none), (pointer: coarse)").matches;
    } catch (_) {
      return false;
    }
  }

  function isNavigableHref(href) {
    if (!href) return false;
    if (href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("javascript:")) {
      return false;
    }
    if (href.charAt(0) === "#") return false;
    return true;
  }

  function bindForcedNavClicks() {
    if (document.documentElement.dataset.imNavCapture) return;
    document.documentElement.dataset.imNavCapture = "1";

    document.addEventListener(
      "click",
      function (e) {
        const a =
          e.target && e.target.closest ? e.target.closest("a[href]") : null;
        if (!a) return;
        if (a.closest("[data-im-native-drawer]")) return;
        if (a.target === "_blank" || a.hasAttribute("download")) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (typeof e.button === "number" && e.button !== 0) return;

        const href = a.getAttribute("href");
        if (!isNavigableHref(href)) return;

        const dd = a.closest(".im-dd");
        if (
          dd &&
          isCoarsePointer() &&
          a === dd.querySelector(":scope > a") &&
          !dd.classList.contains("im-dd-open")
        ) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        window.location.href = href;
      },
      true
    );
  }

  function injectNavCss() {
    if (document.getElementById("im-nav-fix-style")) return;
    const style = document.createElement("style");
    style.id = "im-nav-fix-style";
    style.textContent = `
      header [data-im-native-drawer] {
        pointer-events: none !important;
        visibility: hidden !important;
        grid-template-rows: 0fr !important;
        max-height: 0 !important;
        overflow: hidden !important;
      }
      header [data-im-native-drawer] > * {
        min-height: 0 !important;
        overflow: hidden !important;
      }
      #im-mobile-overlay[hidden] {
        display: none !important;
        pointer-events: none !important;
      }
      #im-mobile-overlay:not([hidden]) {
        display: block !important;
        pointer-events: auto !important;
      }
      footer {
        position: relative;
        z-index: 0;
        isolation: isolate;
      }
      footer a[href="/Imagemedia/"] {
        z-index: 0 !important;
        display: inline-flex !important;
        width: auto !important;
      }
      footer a[href="/Imagemedia/"] img {
        display: block;
        height: 2.25rem;
        width: auto;
        max-width: 220px;
      }
      header.fixed,
      header {
        z-index: 40 !important;
        background-color: var(--brand-darker) !important;
      }
      @media (min-width: 768px) {
        header a[href="/Imagemedia/"] img,
        footer a[href="/Imagemedia/"] img {
          height: 3rem !important;
        }
        header + div {
          padding-top: 89px !important;
        }
      }
      html {
        scrollbar-width: thin;
        scrollbar-color: rgba(230, 43, 52, 0.55) transparent;
      }
      ::-webkit-scrollbar {
        width: 11px;
        height: 11px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(230, 43, 52, 0.5);
        border-radius: 999px;
        border: 3px solid transparent;
        background-clip: padding-box;
      }
      ::-webkit-scrollbar-thumb:hover {
        background-color: var(--brand-red, #e62b34);
      }
    `;
    document.head.appendChild(style);
  }

  function findHamburger(header) {
    return (
      header.querySelector("button.lg\\:hidden") ||
      header.querySelector('button[aria-label*="Men"]') ||
      Array.from(header.querySelectorAll("button")).find(function (b) {
        return b.querySelector(".lucide-menu, .lucide-x");
      }) ||
      null
    );
  }

  function findMobilePanel(header) {
    const candidates = Array.from(header.querySelectorAll("div.lg\\:hidden"));
    return (
      candidates.find(function (el) {
        return (
          el.className.indexOf("grid") !== -1 &&
          (el.className.indexOf("grid-rows") !== -1 || el.querySelector("a[href]"))
        );
      }) || null
    );
  }

  function neutralizeNativeDrawer(header) {
    const panel = findMobilePanel(header);
    if (!panel || panel.dataset.imNativeDrawer === "1") return panel;
    panel.dataset.imNativeDrawer = "1";
    panel.setAttribute("data-im-native-drawer", "");
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("inert", "");
    panel.classList.remove("grid-rows-[1fr]");
    panel.classList.add("grid-rows-[0fr]");
    panel.style.gridTemplateRows = "0fr";
    panel.style.pointerEvents = "none";
    panel.style.visibility = "hidden";
    panel.style.maxHeight = "0";
    panel.style.overflow = "hidden";
    const inner = panel.firstElementChild;
    if (inner) {
      inner.style.minHeight = "0";
      inner.style.overflow = "hidden";
    }
    return panel;
  }

  function ensureOverlay() {
    let overlay = document.getElementById("im-mobile-overlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "im-mobile-overlay";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.cssText =
      "position:fixed;top:64px;left:0;right:0;bottom:0;z-index:99999;background:#0b0f1a;overflow:auto;padding:12px 0 48px;pointer-events:none";

    const closeHint = document.createElement("button");
    closeHint.type = "button";
    closeHint.textContent = "Schließen";
    closeHint.style.cssText =
      "position:absolute;top:12px;right:18px;background:transparent;border:1px solid rgba(255,255,255,.25);color:#fff;padding:8px 14px;border-radius:999px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer";
    overlay.appendChild(closeHint);

    const wrap = document.createElement("div");
    wrap.innerHTML = Object.entries(MENUS)
      .map(function (entry) {
        const title = entry[0];
        const items = entry[1];
        const head =
          '<div style="padding:18px 24px 8px;color:rgba(255,255,255,.9);font-size:12px;letter-spacing:.18em;text-transform:uppercase">' +
          title +
          "</div>";
        const links = items
          .map(function (item) {
            return (
              '<a href="' +
              item[0] +
              '" style="display:block;padding:12px 24px;color:rgba(255,255,255,.75);font-size:16px;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.06)">' +
              item[1] +
              "</a>"
            );
          })
          .join("");
        return '<div style="margin-bottom:10px">' + head + links + "</div>";
      })
      .join("");
    wrap.innerHTML +=
      '<a href="/Imagemedia/kontakt" style="display:block;margin:24px;padding:16px;text-align:center;background:#e11d2e;color:#fff;font-size:13px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;border-radius:10px">Kontakt</a>';
    overlay.appendChild(wrap);
    document.body.appendChild(overlay);
    return overlay;
  }

  function fixMobileMenu() {
    const header = document.querySelector("header");
    if (!header) return;

    injectNavCss();
    neutralizeNativeDrawer(header);

    const btn = findHamburger(header);
    if (!btn) return;
    if (btn.dataset.imBound === "1") return;
    btn.dataset.imBound = "1";

    const overlay = ensureOverlay();
    const iconOpen = btn.querySelector(".lucide-menu");
    const iconClose = btn.querySelector(".lucide-x");
    let open = false;

    function setOpen(v) {
      open = !!v;
      if (open) {
        overlay.hidden = false;
        overlay.removeAttribute("aria-hidden");
        overlay.style.pointerEvents = "auto";
        overlay.style.display = "block";
      } else {
        overlay.hidden = true;
        overlay.setAttribute("aria-hidden", "true");
        overlay.style.pointerEvents = "none";
        overlay.style.display = "none";
      }
      if (iconOpen) iconOpen.style.opacity = open ? "0" : "1";
      if (iconClose) {
        iconClose.style.opacity = open ? "1" : "0";
        iconClose.style.transform = open ? "rotate(0deg)" : "rotate(-90deg)";
      }
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
    }

    setOpen(false);

    const closeBtn = overlay.querySelector("button");
    if (closeBtn && closeBtn.dataset.imBound !== "1") {
      closeBtn.dataset.imBound = "1";
      closeBtn.addEventListener("click", function () {
        setOpen(false);
      });
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) setOpen(false);
    });
  }

  function fixDesktopDropdowns() {
    const nav =
      document.querySelector("nav.hidden.lg\\:flex") ||
      document.querySelector("header nav.hidden") ||
      document.querySelector("header nav");
    if (!nav || nav.dataset.imBound === "1") return;
    nav.dataset.imBound = "1";

    if (!document.getElementById("im-dd-style")) {
      const style = document.createElement("style");
      style.id = "im-dd-style";
      style.textContent = `
        .im-dd { position: relative; }
        .im-dd > a .lucide-chevron-down { transition: transform .25s; }
        .im-dd:hover > a .lucide-chevron-down,
        .im-dd.im-dd-open > a .lucide-chevron-down,
        .im-dd:focus-within > a .lucide-chevron-down { transform: rotate(180deg); }
        .im-dd-panel {
          position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          padding-top: 10px;
          opacity: 0; visibility: hidden; pointer-events: none;
          transition: opacity .2s, visibility .2s;
          z-index: 80;
        }
        .im-dd-panel-inner {
          min-width: 240px; padding: 10px;
          background: rgba(12,16,28,.96); border: 1px solid rgba(255,255,255,.1);
          border-radius: 14px; box-shadow: 0 20px 50px rgba(0,0,0,.45);
        }
        .im-dd:hover > .im-dd-panel,
        .im-dd.im-dd-open > .im-dd-panel,
        .im-dd:focus-within > .im-dd-panel {
          opacity: 1; visibility: visible; pointer-events: auto;
        }
        .im-dd-panel a {
          display: block; padding: 10px 14px; border-radius: 10px;
          color: rgba(255,255,255,.75); font-size: 13px; text-decoration: none;
          white-space: nowrap;
        }
        .im-dd-panel a:hover { background: rgba(255,255,255,.06); color: #fff; }
      `;
      document.head.appendChild(style);
    }

    const coarse = isCoarsePointer();

    Array.from(nav.children).forEach(function (wrap) {
      if (wrap.tagName === "A") return;
      const link = wrap.querySelector(":scope > a");
      if (!link) return;
      const labelEl = link.querySelector("span.relative, span");
      const label = (labelEl ? labelEl.textContent : link.textContent || "").trim();
      const items = MENUS[label];
      if (!items) return;

      wrap.classList.add("im-dd");
      if (wrap.querySelector(":scope > .im-dd-panel")) return;

      const panel = document.createElement("div");
      panel.className = "im-dd-panel";
      const panelInner = document.createElement("div");
      panelInner.className = "im-dd-panel-inner";
      panelInner.innerHTML = items
        .map(function (item) {
          return '<a href="' + item[0] + '">' + item[1] + "</a>";
        })
        .join("");
      panel.appendChild(panelInner);
      wrap.appendChild(panel);

      if (coarse) {
        link.addEventListener("click", function (e) {
          if (!wrap.classList.contains("im-dd-open")) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll(".im-dd.im-dd-open").forEach(function (el) {
              if (el !== wrap) el.classList.remove("im-dd-open");
            });
            wrap.classList.add("im-dd-open");
          }
        });
      }
    });

    if (coarse && !document.documentElement.dataset.imDdOutside) {
      document.documentElement.dataset.imDdOutside = "1";
      document.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest(".im-dd")) return;
        document.querySelectorAll(".im-dd.im-dd-open").forEach(function (el) {
          el.classList.remove("im-dd-open");
        });
      });
    }
  }

  function fixFaq() {
    document.querySelectorAll("button.w-full.flex.items-center.justify-between").forEach(function (btn) {
      if (btn.dataset.imBound) return;
      const panel = btn.nextElementSibling;
      if (!panel || !panel.classList.contains("grid")) return;
      btn.dataset.imBound = "1";

      const isOpen = function () {
        return panel.className.indexOf("grid-rows-[1fr]") !== -1;
      };

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const open = !isOpen();
        const list = btn.closest("div") && btn.closest("div").parentElement;
        if (list) {
          list.querySelectorAll("button.w-full.flex.items-center.justify-between").forEach(function (other) {
            if (other === btn) return;
            const p = other.nextElementSibling;
            if (!p) return;
            p.classList.remove("grid-rows-[1fr]", "opacity-100");
            p.classList.add("grid-rows-[0fr]", "opacity-0");
            const icon = other.querySelector(".rotate-45");
            if (icon) icon.classList.remove("rotate-45");
          });
        }
        panel.classList.toggle("grid-rows-[1fr]", open);
        panel.classList.toggle("opacity-100", open);
        panel.classList.toggle("grid-rows-[0fr]", !open);
        panel.classList.toggle("opacity-0", !open);
        const plus = btn.querySelector("span.shrink-0");
        if (plus) plus.classList.toggle("rotate-45", open);
      });
    });
  }

  function fixStats(stats) {
    if (!stats) return;
    setTextById("cfg-stat-years", stats.years);
    setTextById("cfg-stat-width", stats.width);
    setTextById("cfg-stat-delivery", stats.delivery);
    setTextById("cfg-stat-production", stats.production);
    const map = [
      { needle: "JAHRE ERFAHRUNG", value: stats.years },
      { needle: "DRUCKBREITE", value: stats.width },
      { needle: "PROJEKTE REALISIERT", value: stats.projects },
      { needle: "EXPRESS-LIEFERUNG", value: stats.express },
    ].filter(function (entry) {
      return !!entry.value;
    });
    document.querySelectorAll("p, span, div").forEach(function (el) {
      const t = (el.textContent || "").trim().toUpperCase();
      map.forEach(function (entry) {
        if (t === entry.needle) {
          const box = el.parentElement;
          if (!box) return;
          Array.from(box.children)
            .filter(function (c) {
              return c !== el;
            })
            .forEach(function (c) {
              const txt = (c.textContent || "").replace(/\s+/g, " ").trim();
              if (/^0\s*[a-z+]*$/i.test(txt)) {
                c.textContent = entry.value;
              }
            });
        }
      });
    });
  }

  function replaceTextIn(el, test, value) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (test(node.textContent)) node.textContent = value;
    }
  }

  function fixContact(contact) {
    if (!contact) return;
    if (contact.phone_tel) {
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
        a.setAttribute("href", "tel:" + contact.phone_tel);
        if (contact.phone_display) {
          replaceTextIn(
            a,
            function (t) {
              return /\+\d[\d\s()/-]{6,}/.test(t);
            },
            contact.phone_display
          );
        }
      });
    }
    if (contact.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
        a.setAttribute("href", "mailto:" + contact.email);
        replaceTextIn(
          a,
          function (t) {
            return t.indexOf("@") !== -1;
          },
          contact.email
        );
      });
    }
  }

  function setTextById(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function fixHero(hero) {
    if (!hero) return;
    setTextById("cfg-hero-title1", hero.title1);
    setTextById("cfg-hero-title2", hero.title2);
    setTextById("cfg-hero-subtitle", hero.subtitle);
  }

  function fixAbout(about) {
    if (!about) return;
    setTextById("cfg-about-title1", about.title1);
    setTextById("cfg-about-title2", about.title2);
    setTextById("cfg-about-text", about.text);
  }

  function fixFaqContent(faq) {
    if (!Array.isArray(faq)) return;
    faq.forEach(function (item, i) {
      setTextById("cfg-faq-" + (i + 1) + "-q", item.q);
      setTextById("cfg-faq-" + (i + 1) + "-a", item.a);
    });
  }

  function fixHeroSlider(slides) {
    const existingImgs = Array.from(
      document.querySelectorAll(
        'section img[src*="hero1"], section img[src*="hero2"], section img[src*="hero3"]'
      )
    );
    if (!existingImgs.length) return;
    const section = existingImgs[0].closest("section");
    if (!section || section.dataset.imHeroBound === "1") return;
    section.dataset.imHeroBound = "1";

    let buttonsContainer = section.querySelector('button[aria-label^="Slide "]');
    buttonsContainer = buttonsContainer ? buttonsContainer.closest("div") : null;

    let imgs = existingImgs;
    let buttons = buttonsContainer
      ? Array.from(buttonsContainer.querySelectorAll('button[aria-label^="Slide "]'))
      : [];

    const slidesMatchExisting =
      Array.isArray(slides) &&
      slides.length === existingImgs.length &&
      slides.every(function (slide, i) {
        return existingImgs[i].getAttribute("src") === "/Imagemedia/" + String(slide.image || "").replace(/^\/+/, "");
      });

    if (Array.isArray(slides) && slides.length && !slidesMatchExisting) {
      imgs = slides.map(function (slide, i) {
        const img = document.createElement("img");
        img.src = "/Imagemedia/" + String(slide.image || "").replace(/^\/+/, "");
        img.alt = slide.alt || "";
        img.width = 1920;
        img.height = 900;
        img.className =
          "absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] " +
          (i === 0 ? "opacity-100 scale-100" : "opacity-0 scale-105");
        return img;
      });
      existingImgs.forEach(function (img) {
        img.remove();
      });
      section.prepend.apply(section, imgs);

      if (buttonsContainer) {
        buttonsContainer.innerHTML = "";
        buttons = slides.map(function (_, i) {
          const btn = document.createElement("button");
          btn.setAttribute("aria-label", "Slide " + (i + 1));
          btn.className =
            "h-[2px] transition-all duration-500 " +
            (i === 0 ? "w-12 bg-white" : "w-6 bg-white/40 hover:bg-white/70");
          buttonsContainer.appendChild(btn);
          return btn;
        });
      }
    }

    if (imgs.length < 1) return;

    const INTERVAL_MS = 6000;
    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + imgs.length) % imgs.length;
      imgs.forEach(function (img, n) {
        if (n === index) {
          img.classList.remove("opacity-0", "scale-105");
          img.classList.add("opacity-100", "scale-100");
        } else {
          img.classList.remove("opacity-100", "scale-100");
          img.classList.add("opacity-0", "scale-105");
        }
      });
      buttons.forEach(function (btn, n) {
        if (n === index) {
          btn.classList.remove("w-6", "bg-white/40", "hover:bg-white/70");
          btn.classList.add("w-12", "bg-white");
        } else {
          btn.classList.remove("w-12", "bg-white");
          btn.classList.add("w-6", "bg-white/40", "hover:bg-white/70");
        }
      });
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, INTERVAL_MS);
    }

    buttons.forEach(function (btn, n) {
      btn.addEventListener("click", function () {
        show(n);
        start();
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  function fixImpressum(impressum, contact) {
    if (impressum) {
      setTextById("cfg-imp-firma", impressum.firma);
      setTextById("cfg-imp-strasse", impressum.strasse);
      setTextById("cfg-imp-plzort", impressum.plz_ort);
      setTextById("cfg-imp-land", impressum.land);
      setTextById("cfg-kontakt-strasse", impressum.strasse);
      setTextById("cfg-kontakt-plzort", impressum.plz_ort);
      setTextById("cfg-kontakt-land", impressum.land);
      setTextById("cfg-imp-gf", impressum.geschaeftsfuehrer);
      setTextById("cfg-imp-fbnr", impressum.firmenbuchnummer);
      setTextById("cfg-imp-fbgericht", impressum.firmenbuchgericht);
      setTextById("cfg-imp-uid", impressum.uid);
      setTextById("cfg-imp-wko", impressum.wko);
      if (impressum.bank) {
        setTextById("cfg-imp-bankname", impressum.bank.name);
        setTextById("cfg-imp-blz", impressum.bank.blz);
        setTextById("cfg-imp-iban", impressum.bank.iban);
        setTextById("cfg-imp-bic", impressum.bank.bic);
      }
    }
    if (contact) {
      setTextById("cfg-imp-telefon", contact.phone_display);
      setTextById("cfg-imp-fax", contact.fax);
      setTextById("cfg-imp-email", contact.email);
    }
  }

  function loadSiteConfig() {
    fetch("/Imagemedia/data/site-config.json", { cache: "no-store" })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (config) {
        fixHeroSlider(config ? config.hero_slides : undefined);
        if (!config) return;
        fixStats(config.stats);
        fixContact(config.contact);
        fixHero(config.hero);
        fixAbout(config.about);
        fixFaqContent(config.faq);
        fixImpressum(config.impressum, config.contact);
      })
      .catch(function () {
        fixHeroSlider();
      });
  }

  function run() {
    bindForcedNavClicks();
    fixMobileMenu();
    fixDesktopDropdowns();
    fixFaq();
    loadSiteConfig();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  setInterval(function () {
    const header = document.querySelector("header");
    if (header) neutralizeNativeDrawer(header);
    fixMobileMenu();
    fixDesktopDropdowns();
    fixFaq();
  }, 800);
})();

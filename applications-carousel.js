(function () {
  const STYLE_ID = "im-applications-carousel-style";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #startApplicationsCarousel {
        display: flex;
        gap: 1.5rem;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        cursor: grab;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      #startApplicationsCarousel::-webkit-scrollbar { display: none; }
      #startApplicationsCarousel.cursor-grabbing { cursor: grabbing; }
      #startApplicationsCarousel [data-app-card] {
        position: relative;
        flex: 0 0 auto;
        width: min(88vw, 420px);
        aspect-ratio: 16 / 9;
        scroll-snap-align: center;
        overflow: hidden;
        background: #000;
        border: 1px solid rgba(255,255,255,0.1);
        text-decoration: none;
        color: inherit;
        box-shadow: 0 20px 40px -20px rgba(0,0,0,0.55);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      #startApplicationsCarousel [data-app-card]:hover {
        transform: translateY(-4px);
        box-shadow: 0 28px 50px -18px rgba(0,0,0,0.65);
      }
      #startApplicationsCarousel [data-app-card] > img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.7s ease;
      }
      #startApplicationsCarousel [data-app-card]:hover > img {
        transform: scale(1.05);
      }
      #startApplicationsCarousel [data-app-card] .im-app-shade {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, #000 0%, rgba(0,0,0,0.45) 42%, transparent 75%);
        pointer-events: none;
      }
      #startApplicationsCarousel [data-app-card] .im-app-caption {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 1.25rem 1.35rem;
        text-align: left;
        pointer-events: none;
      }
      @media (min-width: 640px) {
        #startApplicationsCarousel [data-app-card] { width: min(45vw, 380px); }
      }
      @media (min-width: 768px) {
        #startApplicationsCarousel [data-app-card] { width: min(40vw, 400px); }
        #startApplicationsCarousel [data-app-card] .im-app-caption { padding: 1.5rem; }
      }
      @media (min-width: 1024px) {
        #startApplicationsCarousel [data-app-card] { width: min(32vw, 420px); }
      }
      @media (min-width: 1280px) {
        #startApplicationsCarousel [data-app-card] { width: min(28vw, 440px); }
      }
    `;
    document.head.appendChild(style);
  }

  const carousel = document.getElementById("startApplicationsCarousel");
  const prev = document.getElementById("startApplicationsPrev");
  const next = document.getElementById("startApplicationsNext");
  const section = document.getElementById("anwendungen");
  if (!carousel || !prev || !next || !section) return;

  function buildCard(item, i) {
    const a = document.createElement("a");
    a.setAttribute("data-app-card", "");
    a.href = "/Imagemedia" + (item.link || "/anwendungen");
    a.className =
      "group relative shrink-0 min-w-[88vw] sm:min-w-[45vw] md:min-w-[40vw] lg:min-w-[32vw] xl:min-w-[28vw] aspect-video snap-center bg-black border border-white/10 overflow-hidden shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl";

    const img = document.createElement("img");
    img.src = "/Imagemedia/" + String(item.image || "").replace(/^\/+/, "");
    img.alt = item.title || "";
    img.loading = "lazy";
    img.draggable = false;
    img.className =
      "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105";
    a.appendChild(img);

    const shade = document.createElement("div");
    shade.className = "im-app-shade absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent pointer-events-none";
    a.appendChild(shade);

    const caption = document.createElement("div");
    caption.className = "im-app-caption absolute inset-x-0 bottom-0 p-5 md:p-6 text-left pointer-events-none";

    const kicker = document.createElement("span");
    kicker.className = "text-[10px] uppercase tracking-[0.3em] text-[color:var(--brand-red-glow)] font-medium";
    kicker.textContent = String(i + 1).padStart(2, "0") + " — Anwendung";
    caption.appendChild(kicker);

    const h3 = document.createElement("h3");
    h3.className = "mt-2 text-xl md:text-2xl font-light tracking-tight text-white";
    h3.textContent = item.title || "";
    caption.appendChild(h3);

    const p = document.createElement("p");
    p.className = "mt-1 text-xs uppercase tracking-[0.18em] text-white/70";
    p.textContent = item.tagline || "";
    caption.appendChild(p);

    a.appendChild(caption);
    return a;
  }

  function rebuildCards(applications) {
    if (!Array.isArray(applications) || !applications.length) return;
    carousel.innerHTML = "";
    applications.forEach(function (item, i) {
      carousel.appendChild(buildCard(item, i));
    });
  }

  function init() {
    const cards = Array.from(carousel.querySelectorAll("[data-app-card]"));
    if (!cards.length) return;

    const counterEl = document.getElementById("startApplicationsCounter");
    const totalEl = document.getElementById("startApplicationsTotal");
    const progressEl = document.getElementById("startApplicationsProgress");
    if (totalEl) totalEl.textContent = String(cards.length).padStart(2, "0");
    const AUTOPLAY_MS = 4500;

    let index = 0;
    let timer = null;
    let isPointerDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let dragMoved = false;

    function clampIndex(i) {
      const n = cards.length;
      return ((i % n) + n) % n;
    }

    function updateChrome() {
      if (counterEl) {
        counterEl.textContent = String(index + 1).padStart(2, "0");
      }
      cards.forEach(function (card, i) {
        if (i === index) card.setAttribute("aria-current", "true");
        else card.removeAttribute("aria-current");
      });
    }

    function updateProgressFromScroll() {
      if (!progressEl) return;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const frac = maxScroll > 0 ? Math.min(1, Math.max(0, carousel.scrollLeft / maxScroll)) : 0;
      progressEl.style.width = frac * 100 + "%";
    }

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    let scrollRaf = null;

    function animateScrollTo(targetLeft) {
      if (scrollRaf != null) {
        window.cancelAnimationFrame(scrollRaf);
        scrollRaf = null;
      }
      const startLeft = carousel.scrollLeft;
      const distance = targetLeft - startLeft;
      if (Math.abs(distance) < 1) {
        updateProgressFromScroll();
        return;
      }
      const duration = Math.min(900, Math.max(450, Math.abs(distance) * 0.55));
      const startTime = performance.now();

      function frame(now) {
        const t = Math.min(1, (now - startTime) / duration);
        carousel.scrollLeft = startLeft + distance * easeInOutCubic(t);
        updateProgressFromScroll();
        if (t < 1) {
          scrollRaf = window.requestAnimationFrame(frame);
        } else {
          scrollRaf = null;
        }
      }
      scrollRaf = window.requestAnimationFrame(frame);
    }

    function scrollToIndex(i) {
      index = clampIndex(i);
      const card = cards[index];
      if (!card) return;
      const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
      const left = card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2;
      animateScrollTo(Math.max(0, Math.min(left, maxScrollLeft)));
      updateChrome();
    }

    function step(delta) {
      scrollToIndex(index + delta);
      restartAutoplay();
    }

    function nearestIndex() {
      const center = carousel.scrollLeft + carousel.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach(function (card, i) {
        const mid = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    }

    function syncFromScroll() {
      if (isPointerDown) return;
      const nextIndex = nearestIndex();
      if (nextIndex !== index) {
        index = nextIndex;
        updateChrome();
      }
    }

    function startAutoplay() {
      stopAutoplay();
      timer = window.setInterval(function () {
        if (document.hidden) return;
        scrollToIndex(index + 1);
      }, AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (timer != null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    prev.type = "button";
    next.type = "button";

    prev.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      step(-1);
    });

    next.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      step(1);
    });

    let scrollEndTimer = null;
    carousel.addEventListener(
      "scroll",
      function () {
        updateProgressFromScroll();
        if (scrollEndTimer) window.clearTimeout(scrollEndTimer);
        scrollEndTimer = window.setTimeout(syncFromScroll, 80);
      },
      { passive: true }
    );

    carousel.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      isPointerDown = true;
      dragMoved = false;
      carousel.classList.add("cursor-grabbing");
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      stopAutoplay();
    });

    carousel.addEventListener("mouseleave", function () {
      if (!isPointerDown) return;
      isPointerDown = false;
      carousel.classList.remove("cursor-grabbing");
      index = nearestIndex();
      updateChrome();
      startAutoplay();
    });

    carousel.addEventListener("mouseup", function () {
      if (!isPointerDown) return;
      isPointerDown = false;
      carousel.classList.remove("cursor-grabbing");
      index = nearestIndex();
      updateChrome();
      startAutoplay();
    });

    carousel.addEventListener("mousemove", function (e) {
      if (!isPointerDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.2;
      if (Math.abs(walk) > 6) dragMoved = true;
      carousel.scrollLeft = scrollLeft - walk;
    });

    carousel.addEventListener(
      "click",
      function (e) {
        if (dragMoved) {
          e.preventDefault();
          e.stopPropagation();
          dragMoved = false;
        }
      },
      true
    );

    carousel.addEventListener(
      "touchstart",
      function (e) {
        startX = e.touches[0].pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        stopAutoplay();
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchend",
      function () {
        index = nearestIndex();
        updateChrome();
        startAutoplay();
      },
      { passive: true }
    );

    const pauseTargets = [carousel, prev, next];
    pauseTargets.forEach(function (el) {
      el.addEventListener("mouseenter", stopAutoplay);
      el.addEventListener("mouseleave", startAutoplay);
      el.addEventListener("focusin", stopAutoplay);
      el.addEventListener("focusout", function (e) {
        if (!pauseTargets.some(function (t) { return t.contains(e.relatedTarget) || t === e.relatedTarget; })) {
          startAutoplay();
        }
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    cards.forEach(function (card) {
      const shade = card.querySelector(".absolute.inset-0.bg-gradient-to-t, .im-app-shade");
      const caption = card.querySelector(".absolute.inset-x-0.bottom-0, .im-app-caption");
      if (shade && !shade.classList.contains("im-app-shade")) shade.classList.add("im-app-shade");
      if (caption && !caption.classList.contains("im-app-caption")) caption.classList.add("im-app-caption");
    });

    updateChrome();
    updateProgressFromScroll();
    startAutoplay();
  }

  fetch("/Imagemedia/data/site-config.json", { cache: "no-store" })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (config) {
      if (config && Array.isArray(config.applications)) rebuildCards(config.applications);
    })
    .catch(function () {})
    .then(init);
})();

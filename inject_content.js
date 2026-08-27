(function() {
    const PDF_SRC = "/images/anwendungen/produkte.pdf?v=4";
    const PDF_OPTS = "view=FitH&toolbar=0&navpanes=0&scrollbar=1";

    function ensureChapterStyles() {
        if (document.getElementById("im-pdf-chapter-style")) return;
        const style = document.createElement("style");
        style.id = "im-pdf-chapter-style";
        style.textContent = [
            "#im-pdf-chapters .im-pdf-chapter-row{display:flex;gap:0.5rem;overflow-x:auto;padding:0.15rem 0.25rem 0.65rem;margin:0 -0.25rem;scrollbar-width:thin;}",
            "#im-pdf-chapters .im-pdf-chapter{flex:0 0 auto;white-space:nowrap;cursor:pointer;padding:0.55rem 0.95rem;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--foreground);border:1px solid rgba(15,23,42,0.12);background:rgba(15,23,42,0.03);transition:border-color .2s ease,background .2s ease,color .2s ease;}",
            "#im-pdf-chapters .im-pdf-chapter:hover{border-color:var(--brand-red);color:var(--brand-red);background:color-mix(in srgb,var(--brand-red) 8%,transparent);}",
            "#im-pdf-chapters .im-pdf-chapter.is-active{border-color:var(--brand-red);color:#fff;background:var(--brand-red);}",
            "#im-pdf-chapters .im-pdf-chapter:focus{outline:none;}",
            "#im-pdf-chapters .im-pdf-chapter:focus-visible{box-shadow:0 0 0 2px color-mix(in srgb,var(--brand-red) 45%,transparent);}",
            ".im-pdf-topnav{display:flex;flex-wrap:wrap;align-items:center;gap:0.75rem 1.25rem;margin-bottom:1rem;}"
        ].join("");
        document.head.appendChild(style);
    }

    function bindPdfChapters() {
        const root = document.getElementById("im-pdf-chapters");
        const iframe = document.getElementById("im-produkte-pdf");
        if (!root || !iframe) return;
        ensureChapterStyles();

        root.addEventListener("click", function (e) {
            const btn = e.target.closest("[data-pdf-page]");
            if (!btn) return;
            const page = btn.getAttribute("data-pdf-page");
            if (!page) return;

            iframe.src = "about:blank";
            iframe.src = PDF_SRC + "&t=" + Date.now() + "#page=" + page + "&" + PDF_OPTS;

            root.querySelectorAll("[data-pdf-page]").forEach(function (el) {
                el.classList.remove("is-active");
            });
            btn.classList.add("is-active");
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindPdfChapters);
    } else {
        bindPdfChapters();
    }
})();

(function() {
    const urlMap = {
        'Grossflächenwerbung': '/anwendungen/grossflaechenwerbung',
        'Messen': '/anwendungen/messen',
        'Events': '/anwendungen/events',
        'Interior- und Shopdesign': '/anwendungen/interior',
        'Fahrzeugbeschriftung': '/anwendungen/fahrzeuge',
        'Inflatables': '/anwendungen/inflatables',
        'Architektur': '/anwendungen/architektur'
    };

    function addMehrLinks() {
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;

        const cards = document.querySelectorAll('.touch-pan-y button[aria-label]');
        cards.forEach(card => {
            const p = card.querySelector('p:last-of-type');
            if (p && !p.querySelector('.carousel-mehr-link')) {
                const link = document.createElement('span');
                link.className = 'carousel-mehr-link inline-block ml-2 text-[color:var(--brand-red)] hover:text-[color:var(--brand-red-glow)] font-medium cursor-pointer relative z-50';
                link.innerHTML = '&nbsp;Mehr &rarr;';
                p.appendChild(link);
            }
        });
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.touch-pan-y button[aria-label]');
        if (!card) return;

        const transform = card.style.transform || '';
        const isActive = transform.includes('translateX(0%)') || transform.includes('translateX(0px)');

        if (isActive) {
            if (e.target.closest('.carousel-mehr-link')) {
                e.preventDefault();
                e.stopPropagation();
                const title = card.getAttribute('aria-label');
                if (urlMap[title]) {
                    window.location.href = urlMap[title];
                }
            }
        } else {
            e.preventDefault();
            e.stopPropagation();

            const isRight = transform.includes('translateX(1') || transform.includes('translateX(2');
            const container = card.closest('.touch-pan-y');

            if (container) {
                const startX = isRight ? 600 : 100;
                const endX = isRight ? 100 : 600;

                function dispatchEvents(typeDown, typeMove, typeUp, EventClass) {
                    const down = new EventClass(typeDown, { bubbles: true, clientX: startX, clientY: 300 });
                    const move = new EventClass(typeMove, { bubbles: true, clientX: endX, clientY: 300 });
                    const up = new EventClass(typeUp, { bubbles: true, clientX: endX, clientY: 300 });

                    container.dispatchEvent(down);
                    setTimeout(() => container.dispatchEvent(move), 10);
                    setTimeout(() => container.dispatchEvent(up), 20);
                }

                dispatchEvents('pointerdown', 'pointermove', 'pointerup', PointerEvent);
                dispatchEvents('mousedown', 'mousemove', 'mouseup', MouseEvent);
            }
        }
    }, true);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addMehrLinks);
    } else {
        addMehrLinks();
    }
})();

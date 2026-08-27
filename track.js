(function () {
  var ENDPOINT = "/track.php";

  function send(type, detail) {
    var payload = JSON.stringify({
      type: type,
      detail: detail || "",
      path: window.location.pathname,
      ref: document.referrer || "",
      t: Date.now(),
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          ENDPOINT,
          new Blob([payload], { type: "application/json" })
        );
      } else {
        fetch(ENDPOINT, { method: "POST", body: payload, keepalive: true });
      }
    } catch (e) {}
  }

  function trackableAction(el) {
    if (!el || !el.closest) return null;
    var a = el.closest("a[href]");
    if (!a) return null;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) return "call";
    if (href.indexOf("mailto:") === 0) return "email";
    if (/\.pdf(\?|#|$)/i.test(href)) return "pdf_download";
    if (href === "/Imagemedia/kontakt" || href.indexOf("/Imagemedia/kontakt#") === 0) return "contact_cta";
    return null;
  }

  document.addEventListener(
    "click",
    function (e) {
      var action = trackableAction(e.target);
      if (action) send(action);
    },
    true
  );

  send("pageview");
})();

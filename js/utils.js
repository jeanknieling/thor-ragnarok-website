/** @param {number} t 0–1 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/** @param {number} secs */
export function formatTime(secs) {
  if (!Number.isFinite(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/** @param {Element} el */
export function observeReveal(el, className = "is-visible", options = {}) {
  if (!("IntersectionObserver" in window)) {
    el.classList.add(className);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(className);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.2, ...options },
  );
  observer.observe(el);
}

/** @param {MediaQueryList | string} query */
export function prefersReducedMotion(query = "(prefers-reduced-motion: reduce)") {
  return window.matchMedia(query).matches;
}

// Obtém ou cria dinamicamente o overlay do relâmpago
export function getLightningOverlay() {
  if (prefersReducedMotion()) return null;
  let overlay = document.querySelector(".lightning-flash-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "lightning-flash-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "9999",
      background: "rgba(225, 240, 255, 0.25)", // Cor azulada sutil
      opacity: "0",
    });
    document.body.appendChild(overlay);
  }
  return overlay;
}

// Função para disparar o relâmpago
export function triggerLightning() {
  const overlay = getLightningOverlay();
  if (!overlay) return;

  const tl = gsap.timeline();
  // Efeito de flash duplo típico de relâmpagos
  tl.to(overlay, { opacity: 0.35, duration: 0.05, ease: "power1.out" })
    .to(overlay, { opacity: 0.05, duration: 0.08, ease: "power1.inOut" })
    .to(overlay, { opacity: 0.4, duration: 0.05, ease: "power1.out" })
    .to(overlay, { opacity: 0, duration: 0.7, ease: "power4.out" });
}



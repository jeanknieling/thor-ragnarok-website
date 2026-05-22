import { easeOutCubic } from "./utils.js";

/**
 * @param {{ root: HTMLElement, fill: HTMLElement, percent: HTMLElement, site: HTMLElement }} els
 */
export function initPreloader({ root, fill, percent, site }) {
  const MIN_MS = 1800;
  const start = performance.now();
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    root.classList.add("preloader--done");
    requestAnimationFrame(() => {
      site.classList.add("site--visible");
      window.dispatchEvent(new CustomEvent("preloader:done"));
    });
    root.addEventListener("transitionend", () => root.remove(), { once: true });
  };

  const frame = () => {
    const elapsed = performance.now() - start;
    const raw = Math.min(1, elapsed / MIN_MS);
    const pct = Math.round(easeOutCubic(raw) * 100);
    fill.style.width = `${pct}%`;
    percent.textContent = `${pct}%`;

    const loaded = document.readyState === "complete";
    if (raw >= 1 && loaded) {
      finish();
      return;
    }
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}

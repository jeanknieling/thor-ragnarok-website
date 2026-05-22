/** @param {{ header: HTMLElement, nav: HTMLElement, burger: HTMLButtonElement }} els */
export function initHeader({ header, nav, burger }) {
  const SCROLL_Y = 40;

  window.addEventListener(
    "scroll",
    () => header.classList.toggle("header--scrolled", window.scrollY > SCROLL_Y),
    { passive: true },
  );

  const close = () => {
    nav.classList.remove("header__nav--open");
    burger.classList.remove("header__burger--open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };

  const open = () => {
    nav.classList.add("header__nav--open");
    burger.classList.add("header__burger--open");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  };

  burger.addEventListener("click", () => {
    nav.classList.contains("header__nav--open") ? close() : open();
  });

  nav.querySelectorAll(".header__nav-link").forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("header__nav--open")) return;
    const target = /** @type {Node} */ (e.target);
    if (!nav.contains(target) && !burger.contains(target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

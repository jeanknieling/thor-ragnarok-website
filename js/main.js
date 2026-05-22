import { initPreloader } from "./preloader.js";
import { initHeader } from "./header.js";
import { initLazyBgVideo } from "./lazy-video.js";
import { initTrailerPlayer } from "./trailer-player.js";
import { initEntranceAnimations, initScrollAnimations } from "./animations.js";
import { initLightningEffect, initElectricCursor } from "./effects.js";

const preloader = document.getElementById("preloader");
const site = document.getElementById("site");

if (preloader && site) {
  initPreloader({
    root: preloader,
    fill: /** @type {HTMLElement} */ (document.getElementById("preloaderFill")),
    percent: /** @type {HTMLElement} */ (
      document.getElementById("preloaderPercent")
    ),
    site,
  });
}

const header = document.querySelector(".header");
const nav = document.getElementById("headerNav");
const burger = document.getElementById("burgerBtn");

if (header && nav && burger) {
  initHeader({
    header: /** @type {HTMLElement} */ (header),
    nav: /** @type {HTMLElement} */ (nav),
    burger: /** @type {HTMLButtonElement} */ (burger),
  });
}

// Inicializa as animações e efeitos assim que o preloader terminar
window.addEventListener("preloader:done", () => {
  initEntranceAnimations();
  initScrollAnimations();
  initLightningEffect();
  initElectricCursor();
});

initLazyBgVideo(
  /** @type {HTMLVideoElement | null} */ (document.getElementById("heroVideo")),
  "assets/video-hero.mp4",
);
initLazyBgVideo(
  /** @type {HTMLVideoElement | null} */ (document.getElementById("ctaVideo")),
  "assets/video-footer.mp4",
);

const trailer = document.getElementById("trailerPlayer");
if (trailer) initTrailerPlayer(trailer);

/**
 * Carrega vídeo de fundo após o load da página (economiza banda inicial).
 * @param {HTMLVideoElement | null} video
 * @param {string} src
 * @param {number} delayMs
 */
export function initLazyBgVideo(video, src, delayMs = 600) {
  if (!video || !src) return;

  const start = () => {
    video.src = src;
    video.load();

    video.addEventListener(
      "canplaythrough",
      () => {
        video.play().then(() => {
          requestAnimationFrame(() => video.classList.add("media-bg__video--ready"));
        }).catch(() => {});
      },
      { once: true },
    );
  };

  if (document.readyState === "complete") {
    setTimeout(start, delayMs);
  } else {
    window.addEventListener("load", () => setTimeout(start, delayMs), {
      once: true,
    });
  }
}

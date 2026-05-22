import { formatTime } from "./utils.js";

/**
 * Player do trailer: loop mudo (ambient) → reprodução com controles (active).
 * @param {HTMLElement} root
 */
export function initTrailerPlayer(root) {
  const video = root.querySelector(".trailer__video");
  const playBtn = root.querySelector(".trailer__play");
  const playedBar = root.querySelector(".player__played");
  const seek = /** @type {HTMLInputElement | null} */ (
    root.querySelector(".player__seek")
  );
  const timeEl = root.querySelector(".player__time");
  const btnPlayPause = root.querySelector(".player__btn--play");
  const btnMute = root.querySelector(".player__btn--mute");
  const volume = /** @type {HTMLInputElement | null} */ (
    root.querySelector(".player__volume")
  );
  const btnFullscreen = root.querySelector(".player__btn--fullscreen");

  if (!(video instanceof HTMLVideoElement) || !playBtn) return;

  let hideTimer = 0;

  const setProgress = (pct) => {
    if (playedBar) playedBar.style.width = `${pct}%`;
    if (seek) seek.value = String(pct);
  };

  const showControls = () => {
    root.classList.add("trailer--controls-visible");
    clearTimeout(hideTimer);
    if (!root.classList.contains("trailer--paused")) {
      hideTimer = window.setTimeout(
        () => root.classList.remove("trailer--controls-visible"),
        3000,
      );
    }
  };

  const activate = () => {
    video.muted = false;
    video.loop = false;
    video.currentTime = 0;

    video
      .play()
      .then(() => {
        root.classList.add("trailer--active");
        root.classList.remove("trailer--paused");
        showControls();
      })
      .catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
  };

  const resetAmbient = () => {
    root.classList.remove(
      "trailer--active",
      "trailer--paused",
      "trailer--controls-visible",
    );
    video.muted = true;
    video.loop = true;
    video.currentTime = 0;
    setProgress(0);
    video.play().catch(() => {});
  };

  const togglePlayPause = () => {
    if (!root.classList.contains("trailer--active")) {
      activate();
      return;
    }
    if (video.paused) {
      video.play().catch(() => {});
      root.classList.remove("trailer--paused");
    } else {
      video.pause();
      root.classList.add("trailer--paused");
    }
    showControls();
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!video.muted) continue;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: 0.25 },
    ).observe(root);
  }

  playBtn.addEventListener("click", activate);
  btnPlayPause?.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlayPause();
  });
  video.addEventListener("click", () => {
    if (root.classList.contains("trailer--active")) togglePlayPause();
  });

  btnMute?.addEventListener("click", (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    root.classList.toggle("trailer--muted", video.muted);
    if (!video.muted && volume) volume.value = String(video.volume);
  });

  volume?.addEventListener("input", (e) => {
    e.stopPropagation();
    video.volume = parseFloat(volume.value);
    video.muted = video.volume === 0;
    root.classList.toggle("trailer--muted", video.muted);
  });

  seek?.addEventListener("input", (e) => {
    e.stopPropagation();
    const pct = parseFloat(seek.value);
    setProgress(pct);
    if (video.duration) video.currentTime = (pct / 100) * video.duration;
  });
  seek?.addEventListener("click", (e) => e.stopPropagation());

  video.addEventListener("timeupdate", () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(pct);
    if (timeEl) {
      timeEl.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    }
  });

  video.addEventListener("loadedmetadata", () => {
    if (timeEl) timeEl.textContent = `0:00 / ${formatTime(video.duration)}`;
  });

  video.addEventListener("ended", resetAmbient);

  root.addEventListener("mousemove", showControls);
  root.addEventListener("touchstart", showControls, { passive: true });
  root.addEventListener("mouseleave", () => {
    clearTimeout(hideTimer);
    if (!root.classList.contains("trailer--paused")) {
      root.classList.remove("trailer--controls-visible");
    }
  });

  btnFullscreen?.addEventListener("click", (e) => {
    e.stopPropagation();
    const req =
      root.requestFullscreen ||
      root.webkitRequestFullscreen ||
      root.mozRequestFullScreen;
    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      req?.call(root);
    } else {
      exit?.call(document);
    }
  });

  const onFsChange = () => {
    const fs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    root.classList.toggle("trailer--fullscreen", fs);
  };
  document.addEventListener("fullscreenchange", onFsChange);
  document.addEventListener("webkitfullscreenchange", onFsChange);
}

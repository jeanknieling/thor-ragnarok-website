/* ============================================================
   THOR: RAGNAROK — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     PRELOADER
     ---------------------------------------------------------- */
  const preloader = document.getElementById('preloader');
  const fillEl    = document.getElementById('preloaderFill');
  const percentEl = document.getElementById('preloaderPercent');
  const site      = document.getElementById('site');

  const totalDuration = 2600; // ms for 0→100
  const tickInterval  = 40;   // ms per tick
  const steps         = totalDuration / tickInterval;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  let rawProgress = 0;

  const timer = setInterval(function () {
    rawProgress += 1 / steps;
    if (rawProgress >= 1) rawProgress = 1;

    const pct = Math.round(easeOutCubic(rawProgress) * 100);
    fillEl.style.width    = pct + '%';
    percentEl.textContent = pct + '%';

    if (rawProgress >= 1) {
      clearInterval(timer);
      finishPreloader();
    }
  }, tickInterval);

  function finishPreloader() {
    setTimeout(function () {
      preloader.classList.add('fade-out');

      requestAnimationFrame(function () {
        site.classList.add('visible');
      });

      preloader.addEventListener('transitionend', function () {
        preloader.remove();
      }, { once: true });
    }, 420);
  }

  /* ----------------------------------------------------------
     HEADER — scroll effect
     ---------------------------------------------------------- */
  const header = document.querySelector('.header');

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ----------------------------------------------------------
     MOBILE MENU
     ---------------------------------------------------------- */
  const burgerBtn = document.getElementById('burgerBtn');
  const nav       = document.getElementById('headerNav');

  burgerBtn.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open');
    burgerBtn.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    burgerBtn.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('.header__nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      burgerBtn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== burgerBtn) {
      nav.classList.remove('open');
      burgerBtn.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ----------------------------------------------------------
     SCROLL REVEAL — lore quotes
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.lore__quote');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ----------------------------------------------------------
     ASYNC BACKGROUND VIDEOS (hero + CTA)
     Strategy:
       - Do NOT set src until after the page finishes loading so the
         initial HTML/CSS/images load without competing bandwidth.
       - Once the video has enough data to play smoothly (canplaythrough),
         start playing and fade it in over the static image.
         The first frame of each video matches the static image, so the
         transition is imperceptible.
     ---------------------------------------------------------- */
  function loadBgVideo(videoEl, src) {
    if (!videoEl) return;

    videoEl.src = src;
    videoEl.load();

    videoEl.addEventListener('canplaythrough', function () {
      videoEl.play().then(function () {
        // Small delay so the first frame is truly rendered before fading in
        requestAnimationFrame(function () {
          videoEl.classList.add('ready');
        });
      }).catch(function () {
        // Autoplay blocked — keep static image visible, no error shown
      });
    }, { once: true });
  }

  window.addEventListener('load', function () {
    // Small extra delay so the browser isn't competing with post-load tasks
    setTimeout(function () {
      loadBgVideo(document.getElementById('heroVideo'), 'assets/video-hero.mp4');
      loadBgVideo(document.getElementById('ctaVideo'),  'assets/video-footer.mp4');
    }, 800);
  });

  /* ----------------------------------------------------------
     TRAILER PLAYER
     Ambient mode  → muted loop, overlay visible, big play btn
     Active mode   → full player controls, plays from 0 with sound
     ---------------------------------------------------------- */
  const trailerPlayer   = document.getElementById('trailerPlayer');
  const trailerVideo    = document.getElementById('trailerVideo');
  const trailerPlayBtn  = document.getElementById('trailerPlayBtn');   // big initial btn
  const playerControls  = document.getElementById('playerControls');
  const playerPlayPause = document.getElementById('playerPlayPause');
  const playerMute      = document.getElementById('playerMute');
  const playerVolume    = document.getElementById('playerVolume');
  const playerSeek      = document.getElementById('playerSeek');
  const playerPlayed    = document.getElementById('playerPlayed');
  const playerTime      = document.getElementById('playerTime');
  const playerFullscreen = document.getElementById('playerFullscreen');

  if (!trailerPlayer || !trailerVideo) return; // nothing to do

  /* ---- helpers -------------------------------------------- */
  function formatTime(secs) {
    if (isNaN(secs)) return '0:00';
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function setPlayedBar(pct) {
    playerPlayed.style.width = pct + '%';
    playerSeek.value = pct;
  }

  /* ---- Pause ambient loop when off-screen ----------------- */
  if ('IntersectionObserver' in window) {
    var ambientObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (trailerVideo.muted) {
          if (entry.isIntersecting) {
            trailerVideo.play().catch(function () {});
          } else {
            trailerVideo.pause();
          }
        }
      });
    }, { threshold: 0.25 });
    ambientObserver.observe(trailerPlayer);
  }

  /* ---- Auto-hide controls timer --------------------------- */
  var hideTimer = null;

  function showControls() {
    trailerPlayer.classList.add('controls-visible');
    clearTimeout(hideTimer);
    if (!trailerPlayer.classList.contains('is-paused')) {
      hideTimer = setTimeout(function () {
        trailerPlayer.classList.remove('controls-visible');
      }, 3000);
    }
  }

  trailerPlayer.addEventListener('mousemove', showControls);
  trailerPlayer.addEventListener('touchstart', showControls, { passive: true });

  trailerPlayer.addEventListener('mouseleave', function () {
    clearTimeout(hideTimer);
    if (!trailerPlayer.classList.contains('is-paused')) {
      trailerPlayer.classList.remove('controls-visible');
    }
  });

  /* ---- Activate player (big play button) ------------------ */
  function activatePlayer() {
    trailerVideo.muted       = false;
    trailerVideo.loop        = false;
    trailerVideo.currentTime = 0;

    trailerVideo.play().then(function () {
      trailerPlayer.classList.add('active');
      trailerPlayer.classList.remove('is-paused');
      showControls();
    }).catch(function () {
      // Unmuted play blocked — keep muted
      trailerVideo.muted = true;
      trailerVideo.play().catch(function () {});
    });
  }

  trailerPlayBtn.addEventListener('click', activatePlayer);

  /* ---- Play / Pause toggle -------------------------------- */
  function togglePlayPause() {
    if (!trailerPlayer.classList.contains('active')) {
      activatePlayer();
      return;
    }
    if (trailerVideo.paused) {
      trailerVideo.play().catch(function () {});
      trailerPlayer.classList.remove('is-paused');
      showControls();
    } else {
      trailerVideo.pause();
      trailerPlayer.classList.add('is-paused');
      showControls();
    }
  }

  playerPlayPause.addEventListener('click', function (e) {
    e.stopPropagation();
    togglePlayPause();
  });

  // Click on the video itself (not controls) also toggles
  trailerVideo.addEventListener('click', function () {
    if (trailerPlayer.classList.contains('active')) togglePlayPause();
  });

  /* ---- Mute toggle ---------------------------------------- */
  playerMute.addEventListener('click', function (e) {
    e.stopPropagation();
    trailerVideo.muted = !trailerVideo.muted;
    trailerPlayer.classList.toggle('is-muted', trailerVideo.muted);
    if (!trailerVideo.muted) playerVolume.value = trailerVideo.volume;
  });

  /* ---- Volume slider -------------------------------------- */
  playerVolume.addEventListener('input', function (e) {
    e.stopPropagation();
    trailerVideo.volume = parseFloat(this.value);
    trailerVideo.muted  = trailerVideo.volume === 0;
    trailerPlayer.classList.toggle('is-muted', trailerVideo.muted);
  });

  /* ---- Seek bar ------------------------------------------- */
  playerSeek.addEventListener('input', function (e) {
    e.stopPropagation();
    var pct = parseFloat(this.value);
    setPlayedBar(pct);
    if (trailerVideo.duration) {
      trailerVideo.currentTime = (pct / 100) * trailerVideo.duration;
    }
  });

  playerSeek.addEventListener('click', function (e) { e.stopPropagation(); });

  /* ---- Time + progress update ----------------------------- */
  trailerVideo.addEventListener('timeupdate', function () {
    if (!trailerVideo.duration) return;
    var pct = (trailerVideo.currentTime / trailerVideo.duration) * 100;
    setPlayedBar(pct);
    playerTime.textContent =
      formatTime(trailerVideo.currentTime) + ' / ' + formatTime(trailerVideo.duration);
  });

  trailerVideo.addEventListener('loadedmetadata', function () {
    playerTime.textContent = '0:00 / ' + formatTime(trailerVideo.duration);
  });

  /* ---- Ended — reset to ambient --------------------------- */
  trailerVideo.addEventListener('ended', function () {
    trailerPlayer.classList.remove('active', 'is-paused', 'controls-visible');
    trailerVideo.muted       = true;
    trailerVideo.loop        = true;
    trailerVideo.currentTime = 0;
    setPlayedBar(0);
    trailerVideo.play().catch(function () {});
  });

  /* ---- Fullscreen ----------------------------------------- */
  playerFullscreen.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      (trailerPlayer.requestFullscreen
        || trailerPlayer.webkitRequestFullscreen
        || trailerPlayer.mozRequestFullScreen
      ).call(trailerPlayer);
    } else {
      (document.exitFullscreen
        || document.webkitExitFullscreen
        || document.mozCancelFullScreen
      ).call(document);
    }
  });

  document.addEventListener('fullscreenchange', function () {
    trailerPlayer.classList.toggle('is-fullscreen', !!document.fullscreenElement);
  });
  document.addEventListener('webkitfullscreenchange', function () {
    trailerPlayer.classList.toggle('is-fullscreen', !!document.webkitFullscreenElement);
  });

})();

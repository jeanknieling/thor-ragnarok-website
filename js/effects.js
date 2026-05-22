import { prefersReducedMotion, triggerLightning, getLightningOverlay } from "./utils.js";

/**
 * Inicializa o efeito de relâmpago sutil na tela.
 */
export function initLightningEffect() {
  if (prefersReducedMotion()) return;

  // Cria o overlay do relâmpago na inicialização
  getLightningOverlay();

  // Dispara relâmpagos aleatórios
  const scheduleNextFlash = () => {
    const minDelay = 12000; // 12s
    const maxDelay = 24000; // 24s
    const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;

    setTimeout(() => {
      triggerLightning();
      scheduleNextFlash();
    }, randomDelay);
  };
  scheduleNextFlash();

  // Dispara relâmpago quando o usuário passa o mouse por cima do botão principal de ingressos
  const primaryBtns = document.querySelectorAll(".btn--primary");
  if (primaryBtns) {
    primaryBtns.forEach((primaryBtn) => {
      primaryBtn.addEventListener("mouseenter", () => {
        // Pequeno flash sutil em hover
        const overlay = getLightningOverlay();
        if (!overlay) return;
        const tl = gsap.timeline();
        tl.to(overlay, { opacity: 0.15, duration: 0.06 })
          .to(overlay, { opacity: 0, duration: 0.4 });
      });
    });
  }

  // E também no logo do martelo
  const logo = document.querySelector(".header__logo");
  if (logo) {
    logo.addEventListener("mouseenter", triggerLightning);
  }
}

/**
 * Cria um efeito de cursor de partículas elétricas (sparks) ao redor do cursor do mouse.
 */
export function initElectricCursor() {
  // Apenas ativa se não for dispositivo móvel e se o usuário não preferir movimentos reduzidos
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouch || prefersReducedMotion()) return;

  const canvas = document.createElement("canvas");
  canvas.className = "cursor-canvas";
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "9998",
    mixBlendMode: "screen",
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const mouse = { x: 0, y: 0, active: false };
  let hoverInteractive = false;

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", handleResize);

  let lastX = 0;
  let lastY = 0;

  // Acompanha a posição do cursor
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;

    // Deteta se o cursor está sobre elementos interativos para intensificar as faíscas
    const target = e.target;
    if (target instanceof Element) {
      const isInteractive = target.closest("a, button, canvas, .btn");
      hoverInteractive = !!isInteractive;
    }

    // Calcula a distância desde a última criação para evitar sobrecarga de partículas
    const dx = mouse.x - lastX;
    const dy = mouse.y - lastY;
    const dist = Math.hypot(dx, dy);

    if (dist > 8) { // Apenas cria se mover pelo menos 8px
      lastX = mouse.x;
      lastY = mouse.y;

      const count = hoverInteractive ? 3 : 1;
      for (let i = 0; i < count; i++) {
        particles.push(new Spark(mouse.x, mouse.y, hoverInteractive));
      }
    }
  });

  document.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  // Classe das partículas de faísca elétrica
  class Spark {
    constructor(x, y, highEnergy = false) {
      this.x = x;
      this.y = y;
      this.highEnergy = highEnergy;

      // Velocidade aleatória (efeito raio que muda de direção)
      const speedMultiplier = highEnergy ? 3 : 1.5;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * speedMultiplier;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      // Tamanho e tempo de vida
      this.size = Math.random() * (highEnergy ? 2.5 : 1.5) + 0.5;
      this.life = 1;
      this.decay = Math.random() * 0.03 + 0.02; // Duração

      // Cores elétricas (Ciano, Azul e Branco)
      const colors = ["#00f0ff", "#3b82f6", "#ffffff", "#00d2ff"];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      // Aplica resistência do ar leve
      this.vx *= 0.96;
      this.vy *= 0.96;

      // Movimento errático (como faíscas de raio)
      this.vx += (Math.random() - 0.5) * 0.8;
      this.vy += (Math.random() - 0.5) * 0.8;

      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }

    draw(ctx) {
      ctx.save();

      // 1. DESENHA O BRILHO EXTERNO (Largo e semi-transparente - substitui shadowBlur de forma performática)
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size * (this.highEnergy ? 4 : 2.5);
      ctx.globalAlpha = this.life * 0.25;
      ctx.lineCap = "round";
      ctx.moveTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      // 2. DESENHA O NÚCLEO BRILHANTE (Fino e opaco/branco)
      ctx.beginPath();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = this.size;
      ctx.globalAlpha = this.life;
      ctx.lineCap = "round";
      ctx.moveTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Loop de animação
  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    // Se o mouse estiver pairando sobre algo interativo de alta energia e parado,
    // ainda assim gera algumas partículas pulsantes
    if (mouse.active && hoverInteractive && Math.random() < 0.3) {
      particles.push(new Spark(mouse.x, mouse.y, true));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      if (p.life <= 0) {
        particles.splice(i, 1);
      } else {
        p.draw(ctx);
      }
    }

    requestAnimationFrame(animate);
  };
  animate();
}

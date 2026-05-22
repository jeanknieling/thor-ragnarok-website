import { prefersReducedMotion } from "./utils.js";

/**
 * Divide o texto de um elemento em spans contendo letras individuais para animações stagger,
 * mantendo as palavras agrupadas em wrappers para evitar quebra de linhas incorreta em telas menores.
 * @param {HTMLElement} element 
 */
export function splitTextIntoChars(element) {
  if (!element) return;
  const text = element.textContent.trim();
  element.textContent = "";
  
  const words = text.split(/\s+/);
  
  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word-wrapper";
    wordSpan.style.display = "inline-block";
    wordSpan.style.whiteSpace = "nowrap";
    
    word.split("").forEach((char) => {
      const charSpan = document.createElement("span");
      charSpan.textContent = char;
      charSpan.style.display = "inline-block";
      charSpan.className = "anim-char";
      wordSpan.appendChild(charSpan);
    });
    
    element.appendChild(wordSpan);
    
    // Adiciona um espaço quebrável padrão entre as palavras
    if (wordIndex < words.length - 1) {
      const space = document.createTextNode(" ");
      element.appendChild(space);
    }
  });
}

/**
 * Divide o texto de um elemento em spans contendo palavras para animações staggered de scroll.
 * @param {HTMLElement} element 
 */
export function splitTextIntoWords(element) {
  if (!element) return;
  const text = element.textContent.trim();
  element.textContent = "";
  
  const words = text.split(/\s+/);
  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.display = "inline-block";
    span.className = "anim-word";
    
    element.appendChild(span);
    
    // Adiciona espaço depois de cada palavra, exceto a última
    if (index < words.length - 1) {
      const space = document.createTextNode(" ");
      element.appendChild(space);
    }
  });
}

/**
 * Inicializa as animações de entrada do Hero e do Header.
 */
export function initEntranceAnimations() {
  if (prefersReducedMotion()) {
    // Se o usuário preferir menos movimentos, apenas garante que os elementos estejam visíveis
    gsap.set([".header", ".hero__title", ".hero__subtitle", ".hero__actions"], { opacity: 1, y: 0, scale: 1 });
    return;
  }

  const heroTitle = document.querySelector(".hero__title");
  if (heroTitle) {
    splitTextIntoChars(heroTitle);
  }

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" }
  });

  // Estado inicial oculto/deslocado
  gsap.set(".header", { y: -50, opacity: 0 });
  gsap.set(".hero__subtitle", { y: 30, opacity: 0 });
  gsap.set(".hero__actions", { y: 20, opacity: 0 });
  
  if (heroTitle) {
    gsap.set(".hero__title .anim-char", { 
      opacity: 0, 
      y: 100, 
      rotateX: -60,
      scale: 0.9,
      filter: "blur(5px)"
    });
  }

  // Animação de Entrada
  tl.to(".header", {
    y: 0,
    opacity: 1,
    duration: 1,
  })
  .to(".hero__title .anim-char", {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: "blur(0px)",
    duration: 0.8,
    stagger: 0.04,
    ease: "back.out(1.5)",
  }, "-=0.6")
  .to(".hero__subtitle", {
    y: 0,
    opacity: 1,
    duration: 0.8,
  }, "-=0.4")
  .to(".hero__actions", {
    y: 0,
    opacity: 1,
    duration: 0.6,
  }, "-=0.6");
}

/**
 * Inicializa as animações baseadas em ScrollTrigger.
 */
export function initScrollAnimations() {
  if (prefersReducedMotion()) {
    // Apenas ativa as classes estáticas se prefers-reduced-motion estiver ativo
    document.querySelectorAll(".lore__quote").forEach((el) => {
      el.classList.add("is-visible");
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Animações dos Quotes da seção Lore
  const quoteLeft = document.querySelector(".lore__quote--left");
  const quoteRight = document.querySelector(".lore__quote--right");
  const quoteCenter = document.querySelector(".lore__quote--center");

  if (quoteLeft) {
    splitTextIntoChars(quoteLeft);
    gsap.set(quoteLeft, { opacity: 1, y: 0 });
    
    gsap.fromTo(quoteLeft.querySelectorAll(".anim-char"),
      { 
        opacity: 0, 
        y: 80, 
        rotateX: -60,
        scale: 0.9,
        filter: "blur(5px)"
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.015,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: quoteLeft,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  }

  if (quoteRight) {
    splitTextIntoChars(quoteRight);
    gsap.set(quoteRight, { opacity: 1, y: 0 });
    
    gsap.fromTo(quoteRight.querySelectorAll(".anim-char"),
      { 
        opacity: 0, 
        y: 80, 
        rotateX: -60,
        scale: 0.9,
        filter: "blur(5px)"
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.015,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: quoteRight,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  }

  if (quoteCenter) {
    splitTextIntoChars(quoteCenter);
    gsap.set(quoteCenter, { opacity: 1, y: 0 });
    
    gsap.fromTo(quoteCenter.querySelectorAll(".anim-char"),
      { 
        opacity: 0, 
        y: 80, 
        rotateX: -60,
        scale: 0.9,
        filter: "blur(5px)"
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.015,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: quoteCenter,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  }

  // Animação do Título da CTA Section (mesmo efeito do Hero Title, ativado por ScrollTrigger)
  const ctaTitle = document.querySelector(".cta-section__title");
  if (ctaTitle) {
    splitTextIntoChars(ctaTitle);
    
    gsap.fromTo(".cta-section__title .anim-char", 
      { 
        opacity: 0, 
        y: 100, 
        rotateX: -60,
        scale: 0.9,
        filter: "blur(5px)"
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.04,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: ctaTitle,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  }
}

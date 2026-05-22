/**
 * Cena 3D do martelo na seção Lore (desktop/tablet landscape).
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { triggerLightning } from "./utils.js";

const MODEL_PATH = "assets/martelo.glb";
const ENV_PATH = "assets/hdri.webp";
const DESKTOP_MQ =
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

const container = document.querySelector(".lore__canvas");

let activeCleanup = null;
let isInitialized = false;

/**
 * Controla a inicialização e destruição da cena com base no estado da Media Query.
 */
function handleMQChange(e) {
  if (e.matches) {
    if (container) {
      container.classList.remove("lore__canvas--static");
      if (!isInitialized) {
        activeCleanup = initScene(container);
        isInitialized = true;
      }
    }
  } else {
    if (container) {
      container.classList.add("lore__canvas--static");
    }
    if (isInitialized) {
      if (activeCleanup) {
        activeCleanup();
        activeCleanup = null;
      }
      isInitialized = false;
    }
  }
}

if (container) {
  const mq = window.matchMedia(DESKTOP_MQ);
  
  if (mq.addEventListener) {
    mq.addEventListener("change", handleMQChange);
  } else {
    mq.addListener(handleMQChange);
  }
  
  // Executa uma vez no início
  handleMQChange(mq);
} else {
  console.warn("[scene] .lore__canvas não encontrado.");
}

/**
 * Inicializa a cena Three.js
 * @param {HTMLElement} container
 * @returns {Function} Função de limpeza (cleanup)
 */
function initScene(container) {
  gsap.registerPlugin(ScrollTrigger);

  let isDisposed = false;
  let animationFrameId = null;
  let tl = null;
  let resizeObserver = null;

  /**
   * ============================================================
   * RENDERER
   * ============================================================
   */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x000000, 0);
  
  // Habilita eventos de ponteiro no canvas
  renderer.domElement.style.pointerEvents = "auto";

  container.appendChild(renderer.domElement);

  /**
   * ============================================================
   * SCENE / CAMERA
   * ============================================================
   */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    1,
    0.01,
    100,
  );

  camera.position.set(0, 0.5, 4);

  /**
   * ============================================================
   * ENVIRONMENT
   * ============================================================
   */
  new THREE.TextureLoader().load(
    ENV_PATH,
    (texture) => {
      if (isDisposed) {
        texture.dispose();
        return;
      }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;

      scene.environment = texture;
    },
    undefined,
    (err) => console.warn("[scene] HDRI:", err.message),
  );

  /**
   * ============================================================
   * LOADERS
   * ============================================================
   */
  const draco = new DRACOLoader();

  draco.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
  );

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(draco);

  /**
   * ============================================================
   * MODEL
   * ============================================================
   */
  let model = null;

  gltfLoader.load(
    MODEL_PATH,
    (gltf) => {
      if (isDisposed) {
        gltf.scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat) => mat.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        draco.dispose();
        return;
      }

      model = gltf.scene;

      /**
       * ------------------------------------------------------------
       * Normalize model
       * ------------------------------------------------------------
       */
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const scale = 2 / Math.max(size.x, size.y, size.z);

      model.scale.setScalar(scale);

      model.position.sub(center.multiplyScalar(scale));

      /**
       * Initial transform
       */
      model.position.set(1.5, 1.5, -4);
      model.rotation.set(1.5, -0.2, 0);

      scene.add(model);

      /**
       * ------------------------------------------------------------
       * Animations
       * ------------------------------------------------------------
       */
      if (gltf.animations.length) {
        const mixer = new THREE.AnimationMixer(model);

        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

        model.userData.mixer = mixer;
      }

      /**
       * ------------------------------------------------------------
       * Scroll animation (Sincronizada com o Scroll da Página)
       * ------------------------------------------------------------
       */
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "15% 65%",
          end: "90% 30%",
          scrub: 2,
          invalidateOnRefresh: true,
        },
      });

      /**
       * =========================================================
       * 1. GIRO CONTÍNUO EM Z (EIXO ÚNICO)
       * =========================================================
       */
      tl.to(
        model.rotation,
        {
          z: "+=" + (Math.PI * 4), // Giro de 2 voltas completas (360° x 2)
          ease: "none",            // Velocidade linear
          duration: 4,             // Duração total
        },
        0
      );

      /**
       * =========================================================
       * 2. MOVIMENTAÇÃO: PASSO 1 (Posição e Rotação Y Iniciais)
       * =========================================================
       */
      tl.to(
        model.rotation,
        {
          y: 0.5,
          duration: 2,
          ease: "power1.inOut"
        },
        0
      );

      tl.to(
        model.position,
        {
          x: -0.5,
          y: -0.8,
          z: -3,
          duration: 2,
          ease: "power1.inOut"
        },
        "<"
      );

      /**
       * =========================================================
       * 3. MOVIMENTAÇÃO: PASSO 2 (Nova Posição e Rotação Y)
       * =========================================================
       */
      tl.to(
        model.rotation,
        {
          y: 3.5,
          duration: 2,
          ease: "power1.inOut"
        },
        ">"
      );

      tl.to(
        model.position,
        {
          x: 0.5,
          y: 0.65,
          z: -2.5,
          duration: 2,
          ease: "power1.inOut"
        },
        "<"
      );

      draco.dispose();
    },
    undefined,
    (err) => {
      console.error("[scene] Modelo:", err.message);
      draco.dispose();
    },
  );

  /**
   * ============================================================
   * INTERATIVIDADE DO PONTEIRO (Raycasting e Clique)
   * ============================================================
   */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isSpinning = false;

  const onPointerMove = (event) => {
    if (!model || isDisposed) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(model, true);

    if (intersects.length > 0) {
      renderer.domElement.style.cursor = "pointer";
    } else {
      renderer.domElement.style.cursor = "default";
    }
  };

  const onClick = (event) => {
    if (!model || isDisposed || isSpinning) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(model, true);

    if (intersects.length > 0) {
      isSpinning = true;
      triggerLightning();
      gsap.to(model.rotation, {
        z: "+=" + (Math.PI * 4), // Giro de 2 voltas completas adicionais
        duration: 2,
        ease: "power2.out",
        onComplete: () => {
          isSpinning = false;
        }
      });
    }
  };

  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("click", onClick);

  /**
   * ============================================================
   * RESIZE
   * ============================================================
   */
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;

    if (w === 0 || h === 0) return;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
  };

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  /**
   * ============================================================
   * RENDER LOOP
   * ============================================================
   */
  let lastTime = 0;

  const loop = (time) => {
    if (isDisposed) return;
    animationFrameId = requestAnimationFrame(loop);

    const delta = (time - lastTime) / 1000;
    lastTime = time;

    model?.userData.mixer?.update(delta);

    renderer.render(scene, camera);
  };

  animationFrameId = requestAnimationFrame(loop);

  /**
   * ============================================================
   * CLEANUP
   * ============================================================
   */
  const cleanup = () => {
    if (isDisposed) return;
    isDisposed = true;

    window.removeEventListener("beforeunload", cleanup);

    if (renderer && renderer.domElement) {
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    if (tl) {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
      tl = null;
    }

    if (scene) {
      scene.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      if (scene.environment) {
        scene.environment.dispose();
      }
    }
  };

  window.addEventListener("beforeunload", cleanup);

  return cleanup;
}

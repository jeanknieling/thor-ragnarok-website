/**
 * Three.js 3D Scene — Lore section (divMartelo)
 * - Transparent background (alpha: true)
 * - DracoLoader for compressed GLTF/GLB
 * - TextureLoader for equirectangular reflection map (assets/hdri.webp)
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------
   Config
   ---------------------------------------------------------- */
const MODEL_PATH = "assets/martelo.glb";
const ENV_PATH = "assets/hdri.webp";

/* ----------------------------------------------------------
   Container
   ---------------------------------------------------------- */
const container = document.querySelector(".divMartelo");
if (!container) {
  console.warn("[scene.js] .divMartelo not found — aborting Three.js init.");
  throw new Error("No .divMartelo container.");
}

/* ----------------------------------------------------------
   Renderer
   ---------------------------------------------------------- */
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true, // transparent background
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x000000, 0);

container.appendChild(renderer.domElement);

/* ----------------------------------------------------------
   Scene
   ---------------------------------------------------------- */
const scene = new THREE.Scene();

/* ----------------------------------------------------------
   Camera
   ---------------------------------------------------------- */
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.01,
  100,
);
camera.position.set(0, 0.5, 4);

/* ----------------------------------------------------------
   Environment map — TextureLoader (lightweight reflection)
   Uses the equirectangular webp as an env map for reflections.
   ---------------------------------------------------------- */
const textureLoader = new THREE.TextureLoader();
textureLoader.load(
  ENV_PATH,
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.environment = texture; // applied as reflection/IBL on materials
  },
  undefined,
  (err) => console.warn("[scene.js] Env texture not loaded:", err.message),
);

/* ----------------------------------------------------------
   Draco + GLTF loader
   ---------------------------------------------------------- */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
);
dracoLoader.preload();

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let model = null;

gltfLoader.load(
  MODEL_PATH,
  (gltf) => {
    model = gltf.scene;

    // Auto-center and normalize scale to fit a ~2-unit bounding box
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;

    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));

    model.position.y = 1.5;
    model.position.x = 1.5;
    model.position.z = -4;
    model.rotation.x = 1.5;
    model.rotation.y = -0.2;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".divMartelo",
        start: "0% 50%",
        end: "90% 30%",
        scrub: 2,
        invalidateOnRefresh: true
        
      },
    });

    timeline.to(model.position, {
      y: 0,
      x: -.6,
      z: -2
    });

    timeline.to(model.rotation, {
      y: 1
    }, "<")

    // SEGUNDA PARTE
    timeline.to(model.position, {
      y: .8,
      x: 0.5,
      z: -1.3
    }, )

    timeline.to(model.rotation, {
      y: 3
    }, "<")

    // TIMELINE -> LINHA DO TEMPO

    scene.add(model);

    // Play embedded animations if any
    if (gltf.animations && gltf.animations.length) {
      const mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
      model.userData.mixer = mixer;
    }
  },
  undefined,
  (err) => console.error("[scene.js] Model not loaded:", err.message),
);

/* ----------------------------------------------------------
   Resize handling
   ---------------------------------------------------------- */
function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  if (w === 0 || h === 0) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

const resizeObserver = new ResizeObserver(onResize);
resizeObserver.observe(container);
onResize();

/* ----------------------------------------------------------
   Animation loop
   ---------------------------------------------------------- */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (model?.userData.mixer) model.userData.mixer.update(delta);
  renderer.render(scene, camera);
}

animate();

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/controls/DragControls.js";

const canvas = document.getElementById("scene");
const status = document.getElementById("status");
const resetButton = document.getElementById("reset");
const furnitureButtons = [...document.querySelectorAll("[data-furniture]")];

const apartment = {
  width: 10.6,
  depth: 6.9,
  wallHeight: 2.5,
};

const furnitureCatalog = {
  chair: { label: "의자", size: [0.6, 0.9, 0.6], color: 0xf59e0b },
  desk: { label: "책상", size: [1.4, 0.75, 0.7], color: 0x0ea5e9 },
  bed: { label: "침대", size: [2.1, 0.6, 1.6], color: 0x8b5cf6 },
  sofa: { label: "소파", size: [2.0, 0.8, 0.95], color: 0x10b981 },
};

let selectedFurniture = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f5f9);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(8, 9, 8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.2;

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(8, 12, 6);
scene.add(sun);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(apartment.width, apartment.depth),
  new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const grid = new THREE.GridHelper(12, 24, 0x94a3b8, 0xcbd5e1);
scene.add(grid);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
const wallThickness = 0.12;
const halfW = apartment.width / 2;
const halfD = apartment.depth / 2;

const makeWall = (w, h, d, x, y, z) => {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMaterial);
  wall.position.set(x, y, z);
  scene.add(wall);
};

makeWall(apartment.width, apartment.wallHeight, wallThickness, 0, apartment.wallHeight / 2, -halfD);
makeWall(apartment.width, apartment.wallHeight, wallThickness, 0, apartment.wallHeight / 2, halfD);
makeWall(wallThickness, apartment.wallHeight, apartment.depth, -halfW, apartment.wallHeight / 2, 0);
makeWall(wallThickness, apartment.wallHeight, apartment.depth, halfW, apartment.wallHeight / 2, 0);

const dividerMaterial = new THREE.MeshStandardMaterial({ color: 0xcbd5e1 });
const dividerSpecs = [
  [wallThickness, apartment.wallHeight, 2.4, -1.6, apartment.wallHeight / 2, 1.7],
  [wallThickness, apartment.wallHeight, 2.2, 1.4, apartment.wallHeight / 2, 1.8],
  [3.6, apartment.wallHeight, wallThickness, -1.7, apartment.wallHeight / 2, -0.1],
];

dividerSpecs.forEach(([w, h, d, x, y, z]) => {
  const divider = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), dividerMaterial);
  divider.position.set(x, y, z);
  scene.add(divider);
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const furnitures = [];
let dragControls = createDragControls();

function createFurniture(type, x = 0, z = 0) {
  const spec = furnitureCatalog[type];
  const [w, h, d] = spec.size;
  const material = new THREE.MeshStandardMaterial({ color: spec.color });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.userData = { type, halfW: w / 2, halfD: d / 2, baseY: h / 2 };
  scene.add(mesh);
  furnitures.push(mesh);
  refreshDragControls();
}

function setSelection(type) {
  selectedFurniture = type;
  furnitureButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.furniture === type);
  });
  const label = type ? furnitureCatalog[type].label : "없음";
  status.textContent = `현재 선택: ${label}`;
}

function clampInside(mesh) {
  mesh.position.x = THREE.MathUtils.clamp(
    mesh.position.x,
    -halfW + mesh.userData.halfW,
    halfW - mesh.userData.halfW
  );
  mesh.position.z = THREE.MathUtils.clamp(
    mesh.position.z,
    -halfD + mesh.userData.halfD,
    halfD - mesh.userData.halfD
  );
  mesh.position.y = mesh.userData.baseY;
}

function createDragControls() {
  const dc = new DragControls(furnitures, camera, renderer.domElement);
  dc.addEventListener("dragstart", () => {
    controls.enabled = false;
  });
  dc.addEventListener("drag", (event) => {
    clampInside(event.object);
  });
  dc.addEventListener("dragend", (event) => {
    clampInside(event.object);
    controls.enabled = true;
  });
  return dc;
}

function refreshDragControls() {
  dragControls.deactivate();
  dragControls.dispose();
  dragControls = createDragControls();
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  if (!selectedFurniture) return;

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(floor);
  if (!hits.length) return;

  const hit = hits[0].point;
  createFurniture(selectedFurniture, hit.x, hit.z);
});

furnitureButtons.forEach((button) => {
  button.addEventListener("click", () => setSelection(button.dataset.furniture));
});

resetButton.addEventListener("click", () => {
  furnitures.splice(0).forEach((mesh) => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
  refreshDragControls();
  setSelection(null);
});

window.addEventListener("resize", resize);
function resize() {
  const { clientWidth, clientHeight } = canvas;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}
resize();

setSelection(null);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

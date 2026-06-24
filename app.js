import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const WALL_H = 2.5, WALL_T = 0.12;
const APT_W = 10.6, APT_D = 6.9;
const HW = APT_W / 2, HD = APT_D / 2; // 5.3, 3.45

/* ─── Colour palette ─────────────────────────────────────────────────────────── */
const C = {
  fabricBlue:   0x6b8caa,
  fabricBlue2:  0x4d6f8e,
  fabricGreen:  0x7a9e84,
  fabricGreen2: 0x5c8268,
  fabricBeige:  0xd2c4a8,
  fabricBeige2: 0xb8a888,
  wood:         0xc4a47c,
  darkWood:     0x5a3e2b,
  walnut:       0x7c5840,
  oak:          0xc8a860,
  white:        0xf5f5f0,
  offWhite:     0xf0ece4,
  ivoryWhite:   0xf8f4ec,
  metal:        0xa8b4bc,
  darkMetal:    0x3c4450,
  lightGray:    0xd0d4dc,
  midGray:      0x8898a8,
  pine:         0xdac890,
  cream:        0xf0e8d8,
};

/* ─── Geometry helper ────────────────────────────────────────────────────────── */
function addBox(g, w, h, d, x, y, z, color) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color })
  );
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/* ─── Furniture catalogue ────────────────────────────────────────────────────── */
// w = footprint width (x), d = footprint depth (z), cat = UI category
const catalog = {
  sofa:        { label: "소파",       w: 2.10, d: 0.95, cat: "거실" },
  armchair:    { label: "1인소파",    w: 0.85, d: 0.85, cat: "거실" },
  coffeeTable: { label: "커피테이블", w: 1.20, d: 0.65, cat: "거실" },
  tvStand:     { label: "TV장",       w: 1.60, d: 0.45, cat: "거실" },
  bed:         { label: "더블침대",   w: 2.10, d: 1.60, cat: "침실" },
  nightstand:  { label: "협탁",       w: 0.50, d: 0.45, cat: "침실" },
  wardrobe:    { label: "옷장",       w: 1.60, d: 0.60, cat: "침실" },
  dresser:     { label: "화장대",     w: 1.00, d: 0.45, cat: "침실" },
  diningTable: { label: "식탁(4인)", w: 1.40, d: 0.80, cat: "주방/식당" },
  diningChair: { label: "식탁의자",  w: 0.45, d: 0.45, cat: "주방/식당" },
  fridge:      { label: "냉장고",     w: 0.65, d: 0.70, cat: "주방/식당" },
  desk:        { label: "책상",       w: 1.20, d: 0.60, cat: "서재" },
  bookshelf:   { label: "책장",       w: 0.80, d: 0.30, cat: "서재" },
  washer:      { label: "세탁기",     w: 0.60, d: 0.60, cat: "기타" },
  shoeCabinet: { label: "신발장",     w: 0.90, d: 0.35, cat: "기타" },
};

/* ─── Furniture builders ─────────────────────────────────────────────────────── */
// Each function fills a THREE.Group whose origin = floor-level footprint centre.

const builders = {
  sofa(g) {
    const W = 2.10, D = 0.95;
    // Base frame
    addBox(g, W, 0.40, D, 0, 0.20, 0, C.fabricBlue);
    // Back cushion
    addBox(g, W, 0.48, 0.20, 0, 0.64, D / 2 - 0.10, C.fabricBlue);
    // Armrests
    addBox(g, 0.20, 0.45, D, -(W / 2 - 0.10), 0.425, 0, C.fabricBlue);
    addBox(g, 0.20, 0.45, D,  (W / 2 - 0.10), 0.425, 0, C.fabricBlue);
    // Three seat cushions
    for (let i = -1; i <= 1; i++)
      addBox(g, 0.56, 0.10, 0.62, i * 0.64, 0.45, -0.09, C.fabricBlue2);
    // Legs
    const lX = W / 2 - 0.12, lZ = D / 2 - 0.10;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) =>
      addBox(g, 0.08, 0.10, 0.08, sx * lX, 0.05, sz * lZ, C.darkWood));
  },

  armchair(g) {
    const W = 0.85, D = 0.85;
    addBox(g, W, 0.40, D, 0, 0.20, 0, C.fabricGreen);
    addBox(g, W, 0.45, 0.18, 0, 0.625, D / 2 - 0.09, C.fabricGreen);
    addBox(g, 0.18, 0.45, D, -(W / 2 - 0.09), 0.425, 0, C.fabricGreen);
    addBox(g, 0.18, 0.45, D,  (W / 2 - 0.09), 0.425, 0, C.fabricGreen);
    // Seat cushion
    addBox(g, 0.46, 0.10, 0.58, 0, 0.45, -0.07, C.fabricGreen2);
    const lX = W / 2 - 0.10, lZ = D / 2 - 0.10;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) =>
      addBox(g, 0.07, 0.10, 0.07, sx * lX, 0.05, sz * lZ, C.darkWood));
  },

  coffeeTable(g) {
    const W = 1.20, D = 0.65, LH = 0.36;
    // Tabletop
    addBox(g, W, 0.05, D, 0, LH + 0.025, 0, C.wood);
    // Lower shelf
    addBox(g, W * 0.70, 0.03, D * 0.65, 0, 0.12, 0, C.wood);
    // Legs
    const lX = W / 2 - 0.07, lZ = D / 2 - 0.06;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) =>
      addBox(g, 0.05, LH, 0.05, sx * lX, LH / 2, sz * lZ, C.darkWood));
  },

  tvStand(g) {
    const W = 1.60, D = 0.45;
    // Cabinet
    addBox(g, W, 0.50, D, 0, 0.25, 0, C.white);
    // Door dividers
    addBox(g, 0.015, 0.46, D + 0.01, -W / 4, 0.25, 0, C.lightGray);
    addBox(g, 0.015, 0.46, D + 0.01,  W / 4, 0.25, 0, C.lightGray);
    // Base strip
    addBox(g, W, 0.04, D * 0.60, 0, 0.02, 0, C.lightGray);
    // TV panel
    addBox(g, W * 0.90, 0.68, 0.04, 0, 0.84, D / 2 - 0.02, C.darkMetal);
    // TV stand foot
    addBox(g, W * 0.28, 0.03, 0.10, 0, 0.515, D / 2 - 0.05, C.darkMetal);
  },

  bed(g) {
    const W = 2.10, D = 1.60;
    // Frame
    addBox(g, W, 0.22, D, 0, 0.11, 0, C.wood);
    // Mattress
    addBox(g, W - 0.08, 0.22, D - 0.08, 0, 0.33, 0, C.cream);
    // Headboard
    addBox(g, W, 0.70, 0.10, 0, 0.57, -(D / 2 - 0.05), C.wood);
    // Footboard
    addBox(g, W, 0.28, 0.08, 0, 0.36,  (D / 2 - 0.04), C.wood);
    // Pillows
    addBox(g, 0.55, 0.09, 0.38, -0.47, 0.49, -(D / 2 - 0.28), C.ivoryWhite);
    addBox(g, 0.55, 0.09, 0.38,  0.47, 0.49, -(D / 2 - 0.28), C.ivoryWhite);
    // Blanket
    addBox(g, W - 0.12, 0.08, D * 0.55, 0, 0.50, D * 0.15, C.fabricBeige);
  },

  nightstand(g) {
    // Body
    addBox(g, 0.50, 0.55, 0.45, 0, 0.275, 0, C.wood);
    // Drawer line
    addBox(g, 0.51, 0.015, 0.46, 0, 0.28, 0, C.darkWood);
    // Handle
    addBox(g, 0.12, 0.02, 0.02, 0, 0.42, 0.23, C.metal);
    // Legs
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) =>
      addBox(g, 0.06, 0.06, 0.06, sx * 0.19, 0.03, sz * 0.17, C.darkWood));
  },

  wardrobe(g) {
    const W = 1.60, D = 0.60;
    // Body
    addBox(g, W, 2.00, D, 0, 1.00, 0, C.white);
    // Centre door seam
    addBox(g, 0.015, 1.96, D + 0.01, 0, 1.00, 0, C.lightGray);
    // Handles
    addBox(g, 0.02, 0.16, 0.03, -0.12, 1.02, D / 2, C.metal);
    addBox(g, 0.02, 0.16, 0.03,  0.12, 1.02, D / 2, C.metal);
    // Top trim
    addBox(g, W + 0.02, 0.05, D + 0.02, 0, 2.025, 0, C.lightGray);
    // Base strip
    addBox(g, W, 0.07, D, 0, 0.035, 0, C.lightGray);
  },

  dresser(g) {
    const W = 1.00, D = 0.45, CH = 0.76;
    // Drawer unit
    addBox(g, W, CH, D, 0, CH / 2, 0, C.wood);
    // Drawer lines
    addBox(g, W + 0.01, 0.015, D + 0.01, 0, 0.27, 0, C.darkWood);
    addBox(g, W + 0.01, 0.015, D + 0.01, 0, 0.53, 0, C.darkWood);
    // Handles
    [0.14, 0.40, 0.65].forEach((y) =>
      addBox(g, 0.14, 0.02, 0.03, 0, y, D / 2, C.metal));
    // Mirror posts
    addBox(g, 0.04, 0.80, 0.04, -W * 0.30, CH + 0.40, 0, C.wood);
    addBox(g, 0.04, 0.80, 0.04,  W * 0.30, CH + 0.40, 0, C.wood);
    // Mirror frame then glass
    addBox(g, W * 0.76, 0.80, 0.025, 0, CH + 0.40, D / 2 - 0.015, C.wood);
    addBox(g, W * 0.72, 0.76, 0.02,  0, CH + 0.40, D / 2 - 0.01,  C.lightGray);
  },

  diningTable(g) {
    const W = 1.40, D = 0.80, LH = 0.73;
    addBox(g, W, 0.05, D, 0, LH + 0.025, 0, C.oak);
    const lX = W / 2 - 0.08, lZ = D / 2 - 0.07;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) =>
      addBox(g, 0.06, LH, 0.06, sx * lX, LH / 2, sz * lZ, C.walnut));
  },

  diningChair(g) {
    const W = 0.45, D = 0.45, SH = 0.45;
    // Seat
    addBox(g, W, 0.04, D, 0, SH, 0, C.fabricBeige);
    // Back
    addBox(g, W, 0.42, 0.04, 0, SH + 0.21, -(D / 2 - 0.02), C.fabricBeige2);
    // Legs
    const lX = W / 2 - 0.04, lZ = D / 2 - 0.04;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) =>
      addBox(g, 0.04, SH, 0.04, sx * lX, SH / 2, sz * lZ, C.walnut));
  },

  fridge(g) {
    const W = 0.65, D = 0.70, H = 1.85;
    addBox(g, W, H, D, 0, H / 2, 0, C.metal);
    // Freezer/fridge divider line
    addBox(g, W + 0.01, 0.015, D + 0.01, 0, H * 0.65, 0, C.darkMetal);
    // Handles
    addBox(g, 0.025, 0.35, 0.04, W / 2, H * 0.82, D / 2, C.darkMetal);
    addBox(g, 0.025, 0.22, 0.04, W / 2, H * 0.38, D / 2, C.darkMetal);
    // Base strip
    addBox(g, W, 0.06, D, 0, 0.03, 0, C.darkMetal);
  },

  desk(g) {
    const W = 1.20, D = 0.60, LH = 0.72;
    // Desktop
    addBox(g, W, 0.04, D, 0, LH + 0.02, 0, C.white);
    // Side panels
    addBox(g, 0.04, LH, D * 0.85, -(W / 2 - 0.04), LH / 2, 0, C.white);
    addBox(g, 0.04, LH, D * 0.85,  (W / 2 - 0.04), LH / 2, 0, C.white);
    // Back cross-bar
    addBox(g, W - 0.10, 0.04, 0.04, 0, 0.30, -(D / 2 - 0.04), C.lightGray);
    // Monitor
    addBox(g, 0.55, 0.36, 0.03, 0, LH + 0.20, -(D / 2 - 0.04), C.darkMetal);
    addBox(g, 0.12, 0.02, 0.14, 0, LH + 0.02, -(D / 2 - 0.12), C.darkMetal);
  },

  bookshelf(g) {
    const W = 0.80, D = 0.30, H = 1.80, T = 0.03;
    // Back, sides, top, bottom panels
    addBox(g, W, H, T, 0, H / 2, -(D / 2 - T / 2), C.pine);
    addBox(g, T, H, D, -(W / 2 - T / 2), H / 2, 0, C.pine);
    addBox(g, T, H, D,  (W / 2 - T / 2), H / 2, 0, C.pine);
    addBox(g, W, T, D, 0, H - T / 2, 0, C.pine);
    addBox(g, W, T, D, 0, T / 2, 0, C.pine);
    // Four shelves
    const shelfYs = [H / 5, H * 2 / 5, H * 3 / 5, H * 4 / 5];
    shelfYs.forEach((sy) => addBox(g, W - T * 2, T, D - T, 0, sy, 0, C.pine));
    // Books on each shelf
    const palette = [0xe05050, 0x5070d0, 0x40a858, 0xe09030, 0x9040c0, 0x30a8c0, 0xd04090];
    const widths  = [0.070, 0.062, 0.078, 0.064, 0.072, 0.066, 0.068];
    shelfYs.forEach((sy, si) => {
      let cx = -(W / 2 - T - 0.03);
      widths.forEach((bw, bi) => {
        if (cx + bw > W / 2 - T - 0.02) return;
        addBox(g, bw, H / 5 * 0.62, D * 0.55,
          cx + bw / 2, sy + H / 5 * 0.33, 0,
          palette[(si * widths.length + bi) % palette.length]);
        cx += bw + 0.012;
      });
    });
  },

  washer(g) {
    const W = 0.60, D = 0.60, H = 0.85;
    addBox(g, W, H, D, 0, H / 2, 0, C.white);
    // Control panel
    addBox(g, W, 0.12, 0.06, 0, H - 0.06, D / 2, C.lightGray);
    // Door frame
    addBox(g, 0.38, 0.38, 0.04, 0, H * 0.46, D / 2, C.lightGray);
    // Door glass
    addBox(g, 0.30, 0.30, 0.045, 0, H * 0.46, D / 2, C.midGray);
    // Base strip
    addBox(g, W, 0.06, D, 0, 0.03, 0, C.lightGray);
  },

  shoeCabinet(g) {
    const W = 0.90, D = 0.35, H = 1.20;
    addBox(g, W, H, D, 0, H / 2, 0, C.white);
    // Shelf dividers
    addBox(g, W + 0.01, 0.015, D + 0.01, 0, H * 0.35, 0, C.lightGray);
    addBox(g, W + 0.01, 0.015, D + 0.01, 0, H * 0.65, 0, C.lightGray);
    // Handles
    [H * 0.17, H * 0.50, H * 0.82].forEach((y) =>
      addBox(g, 0.14, 0.02, 0.03, 0, y, D / 2, C.metal));
    // Base strip
    addBox(g, W, 0.06, D, 0, 0.03, 0, C.lightGray);
  },
};

function buildFurniture(type) {
  const g = new THREE.Group();
  builders[type](g);
  return g;
}

/* ─── Scene ──────────────────────────────────────────────────────────────────── */
const canvas = document.getElementById("scene");
const scene  = new THREE.Scene();
scene.background = new THREE.Color(0xeef2f7);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
camera.position.set(9, 10, 9);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

/* ─── Lighting ───────────────────────────────────────────────────────────────── */
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(8, 14, 6);
sun.castShadow = true;
scene.add(sun);

/* ─── Orbit controls ─────────────────────────────────────────────────────────── */
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.target.set(0, 0, 0);
orbitControls.enableDamping = true;
orbitControls.maxPolarAngle = Math.PI / 2.1;

/* ─── Floor & room zones ─────────────────────────────────────────────────────── */
const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(APT_W, APT_D),
  new THREE.MeshStandardMaterial({ color: 0xd8d0c0 })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

// Coloured room zones sit just above the base floor
function addZone(cx, cz, w, d, color) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({ color })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(cx, 0.002, cz);
  scene.add(m);
}
//              cx      cz       w     d      colour
addZone(-2.05, -1.475,  6.50, 3.95, 0xede8de); // 거실
addZone(-2.05,  1.975,  6.50, 2.95, 0xe4ede0); // 주방/식당
addZone( 3.25, -1.575,  4.10, 3.75, 0xe8e2ee); // 안방
addZone( 2.35,  1.875,  2.30, 3.15, 0xdfe8f0); // 침실2
addZone( 4.40,  1.875,  1.80, 3.15, 0xedeae2); // 침실3

const grid = new THREE.GridHelper(12, 24, 0x94a3b8, 0xcbd5e1);
grid.position.y = 0.003;
scene.add(grid);

/* ─── Walls ──────────────────────────────────────────────────────────────────── */
const wallMat    = new THREE.MeshStandardMaterial({ color: 0x8a98a8 });
const intWallMat = new THREE.MeshStandardMaterial({ color: 0xb0bcc8 });
const WY = WALL_H / 2;

function makeWall(w, h, d, x, y, z, mat = wallMat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  scene.add(m);
}

// Outer walls
makeWall(APT_W, WALL_H, WALL_T,  0,  WY, -HD);
makeWall(APT_W, WALL_H, WALL_T,  0,  WY,  HD);
makeWall(WALL_T, WALL_H, APT_D, -HW, WY,   0);
makeWall(WALL_T, WALL_H, APT_D,  HW, WY,   0);

// Main vertical divider (x = 1.2) — door gap z: −1.5 → −0.6
makeWall(WALL_T, WALL_H, 1.95, 1.2, WY, -2.475, intWallMat); // z: −3.45 → −1.5
makeWall(WALL_T, WALL_H, 4.05, 1.2, WY,  1.425, intWallMat); // z: −0.6 → 3.45

// Kitchen / living divider (z = 0.5) — door gap x: −1.8 → −0.9
makeWall(3.50, WALL_H, WALL_T, -3.55, WY, 0.5, intWallMat); // x: −5.3 → −1.8
makeWall(2.10, WALL_H, WALL_T,  0.15, WY, 0.5, intWallMat); // x: −0.9 → 1.2

// Bedroom horizontal divider (z = 0.3, x: 1.2 → 5.3) — door gap x: 2.4 → 3.3
makeWall(1.20, WALL_H, WALL_T, 1.80, WY, 0.3, intWallMat); // x: 1.2 → 2.4
makeWall(2.00, WALL_H, WALL_T, 4.30, WY, 0.3, intWallMat); // x: 3.3 → 5.3

// Bedroom 2 / 3 divider (x = 3.5, z: 0.3 → 3.45) — door gap z: 1.2 → 2.1
makeWall(WALL_T, WALL_H, 0.90, 3.5, WY, 0.75,  intWallMat); // z: 0.3 → 1.2
makeWall(WALL_T, WALL_H, 1.35, 3.5, WY, 2.775, intWallMat); // z: 2.1 → 3.45

/* ─── Furniture state ────────────────────────────────────────────────────────── */
const furnitures = [];
let selectedType = null;
let lastPlaced   = null;

function placeFurniture(type, x, z) {
  const spec = catalog[type];
  const g    = buildFurniture(type);
  g.position.set(x, 0, z);
  g.userData = { type, halfW: spec.w / 2, halfD: spec.d / 2, baseY: 0 };
  scene.add(g);
  furnitures.push(g);
  lastPlaced = g;
}

function clampInside(obj) {
  const { halfW, halfD, baseY } = obj.userData;
  obj.position.x = THREE.MathUtils.clamp(obj.position.x, -HW + halfW, HW - halfW);
  obj.position.z = THREE.MathUtils.clamp(obj.position.z, -HD + halfD, HD - halfD);
  obj.position.y = baseY;
}

/* ─── Custom drag (replaces DragControls — works with THREE.Group) ───────────── */
const raycaster  = new THREE.Raycaster();
const pointer2D  = new THREE.Vector2();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hitPt      = new THREE.Vector3();
const dragOff    = new THREE.Vector3();
let   dragObj    = null;

function updatePointer(e) {
  const r = canvas.getBoundingClientRect();
  pointer2D.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
  pointer2D.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
}

function pickGroup() {
  const hits = raycaster.intersectObjects(furnitures, true);
  if (!hits.length) return null;
  let obj = hits[0].object;
  while (obj && !furnitures.includes(obj)) obj = obj.parent;
  return furnitures.includes(obj) ? obj : null;
}

canvas.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  updatePointer(e);
  raycaster.setFromCamera(pointer2D, camera);

  // Try to drag an existing piece
  const g = pickGroup();
  if (g) {
    dragObj = g;
    lastPlaced = g;
    orbitControls.enabled = false;
    raycaster.ray.intersectPlane(floorPlane, hitPt);
    dragOff.set(hitPt.x - g.position.x, 0, hitPt.z - g.position.z);
    return;
  }

  // Otherwise place new furniture
  if (!selectedType) return;
  if (raycaster.ray.intersectPlane(floorPlane, hitPt))
    placeFurniture(selectedType, hitPt.x, hitPt.z);
});

canvas.addEventListener("pointermove", (e) => {
  if (!dragObj) return;
  updatePointer(e);
  raycaster.setFromCamera(pointer2D, camera);
  if (raycaster.ray.intersectPlane(floorPlane, hitPt)) {
    dragObj.position.x = hitPt.x - dragOff.x;
    dragObj.position.z = hitPt.z - dragOff.z;
    clampInside(dragObj);
  }
});

canvas.addEventListener("pointerup", () => {
  if (dragObj) {
    clampInside(dragObj);
    dragObj = null;
    orbitControls.enabled = true;
  }
});

/* ─── R key — rotate last-touched furniture 90° ─────────────────────────────── */
document.addEventListener("keydown", (e) => {
  if ((e.key === "r" || e.key === "R") && lastPlaced) {
    e.preventDefault();
    lastPlaced.rotation.y += Math.PI / 2;
    // Swap footprint dimensions so clamping stays correct
    const tmp = lastPlaced.userData.halfW;
    lastPlaced.userData.halfW = lastPlaced.userData.halfD;
    lastPlaced.userData.halfD = tmp;
    clampInside(lastPlaced);
  }
});

/* ─── UI bindings ────────────────────────────────────────────────────────────── */
const statusEl = document.getElementById("status");

document.querySelectorAll("[data-furniture]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (selectedType === btn.dataset.furniture) {
      // Clicking the active button again deselects it
      selectedType = null;
      btn.classList.remove("active");
      statusEl.textContent = "현재 선택: 없음";
    } else {
      selectedType = btn.dataset.furniture;
      document.querySelectorAll("[data-furniture]").forEach((b) =>
        b.classList.toggle("active", b === btn));
      statusEl.textContent = `현재 선택: ${catalog[selectedType].label}`;
    }
  });
});

/* ─── Panel toggle ───────────────────────────────────────────────────────────── */
document.getElementById("panel-toggle").addEventListener("click", () => {
  document.body.classList.toggle("panel-hidden");
  resize();
});

document.getElementById("reset").addEventListener("click", () => {
  furnitures.splice(0).forEach((g) => {
    scene.remove(g);
    g.traverse((c) => {
      if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); }
    });
  });
  selectedType = null;
  lastPlaced   = null;
  document.querySelectorAll("[data-furniture]").forEach((b) =>
    b.classList.remove("active"));
  statusEl.textContent = "현재 선택: 없음";
});

/* ─── Resize ─────────────────────────────────────────────────────────────────── */
window.addEventListener("resize", resize);
function resize() {
  const { clientWidth: w, clientHeight: h } = canvas;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
resize();

/* ─── Render loop ────────────────────────────────────────────────────────────── */
(function animate() {
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
})();

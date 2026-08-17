// ADW — installation build animation.
// Line-drawn house, solar array, batteries, charger and car, assembled on a
// timeline. Call init(hostElement); the host must contain an <img data-logo>.
import * as THREE from './three.module.min.js';

/* ───────── setup ───────── */
export function init(host) {
const LOGO = host.querySelector('[data-logo]');
const vw = () => host.clientWidth, vh = () => host.clientHeight;
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(45, vw()/vh(), 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(vw(), vh());
host.appendChild(renderer.domElement);

// A lower, three-quarter camera: high enough to read the array on the slope,
// low enough that the battery wall is not foreshortened into nothing.
camera.position.set(9.6, 4.3, 14.8);
camera.lookAt(0.9, 0.7, 0.6);

const rig = new THREE.Group();
scene.add(rig);

/* ───────── ADW palette (alu-dewolf.be) ───────── */
const BLACK  = 0x1a1d22;      // must match the page background for the fill trick
const LINE   = 0x262b32;
const SILVER = 0xc4cad3, SILVER_BRIGHT = 0xeef1f6, STEEL = 0x878e99;
const GOLD   = 0xcda434, GOLD_BRIGHT = 0xe7c976, GOLD_DEEP = 0xa07f1f;

/* ───────── house dimensions ───────── */
const W = 8, HH = 3, D = 6;
const RISE   = 2.2;
const PITCH  = Math.atan2(RISE, D/2);
const SLOPE  = Math.hypot(D/2, RISE);
const RIDGE  = HH/2 + RISE;
const TAN    = RISE / (D/2);
const EAVE   = 0.45;
const XW     = W/2;                    // the gable wall facing the camera

/* Every piece knows where it ends up, where it flies in from,
   and when in the scroll it should travel. */
const pieces = [];

function addPiece({ geo, color, parent, pos, rot, from, fromRot,
                    start, span, solid = true, rawLines = false, noArc = false,
                    edgeAngle = 1 }) {
  const grp = new THREE.Group();
  (parent || rig).add(grp);

  const lineMat = new THREE.LineBasicMaterial({ color, transparent:true, opacity:0 });
  // edgeAngle keeps smooth curves from being drawn as a ladder of facet lines
  grp.add(new THREE.LineSegments(
    rawLines ? geo : new THREE.EdgesGeometry(geo, edgeAngle), lineMat));

  // A solid fill in the background colour. Invisible as a surface, but it
  // occludes what is behind it — which is what stops the house reading as a
  // see-through wireframe. Polygon offset keeps the outlines on top.
  let fill = null;
  if (solid && !rawLines) {
    fill = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: BLACK, side: THREE.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    }));
    fill.visible = false;
    grp.add(fill);
  }

  pieces.push({
    grp, lineMat, fill, noArc,
    to:   new THREE.Vector3(...pos),
    from: new THREE.Vector3(...from),
    toRot:   new THREE.Euler(...(rot     || [0,0,0])),
    fromRot: new THREE.Euler(...(fromRot || [0,0,0])),
    start, span
  });
  return grp;
}

const rnd = (i, s) => (Math.sin(i * 127.1 + s * 311.7) * 43758.5453) % 1;

const segGeo = pts => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
};

function triangle(a, b, c) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3));
  g.computeVertexNormals();
  return g;
}

/* ───────── 1. foundation (0.00 → 0.08) ───────── */
addPiece({
  geo: new THREE.BoxGeometry(W + 0.5, 0.35, D + 0.5), color: STEEL,
  pos: [0, -HH/2 - 0.17, 0], from: [0, -7, 0], start: 0.00, span: 0.08
});

/* ───────── 2. walls (0.03 → 0.14) ───────── */
addPiece({
  geo: new THREE.BoxGeometry(W, HH, D), color: SILVER_BRIGHT,
  pos: [0, 0, 0], from: [0, -7, 0], start: 0.03, span: 0.11
});

/* ───────── 3. horizontal siding (0.11 → 0.20) ───────── */
// Cheap detail that does most of the work: without it the walls read as blank
// slabs, with it they read as a clad house.
const siding = [];
for (let y = -HH/2 + 0.3; y < HH/2 - 0.05; y += 0.32) {
  siding.push(-XW, y,  D/2+0.01,  XW, y,  D/2+0.01);
  siding.push(-XW, y, -D/2-0.01,  XW, y, -D/2-0.01);
  siding.push( XW+0.01, y, -D/2,  XW+0.01, y, D/2);
  siding.push(-XW-0.01, y, -D/2, -XW-0.01, y, D/2);
}
addPiece({ geo: segGeo(siding), color: LINE, rawLines: true,
  pos: [0,0,0], from: [0,-4,0], start: 0.11, span: 0.09 });

/* ───────── 4. corner boards (0.14 → 0.21) ───────── */
[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sz], i) => {
  addPiece({
    geo: new THREE.BoxGeometry(0.16, HH, 0.16), color: STEEL,
    pos: [sx * (XW - 0.06), 0, sz * (D/2 - 0.06)],
    from: [sx * 8, 5, sz * 8], start: 0.14 + i * 0.012, span: 0.07
  });
});

/* ───────── 5. gable ends + vents (0.16 → 0.28) ───────── */
[1, -1].forEach((side, i) => {
  const x = side * XW;
  addPiece({
    geo: triangle([x, HH/2, D/2], [x, HH/2, -D/2], [x, RIDGE, 0]),
    color: SILVER_BRIGHT,
    pos: [0,0,0], from: [side * 7, 4, 0], start: 0.16 + i * 0.03, span: 0.09
  });
  addPiece({
    geo: new THREE.BoxGeometry(0.06, 0.5, 0.7), color: STEEL,
    pos: [x + side * 0.02, HH/2 + 0.85, 0],
    from: [side * 9, 6, 0], start: 0.21 + i * 0.02, span: 0.07
  });
});

/* ───────── 6. door, porch, windows (0.22 → 0.37) ───────── */
const OUT = 0.03;
// the door stays neutral — gold is reserved for the energy kit (array, charger)
addPiece({ geo: new THREE.BoxGeometry(1.05, 1.95, 0.07), color: SILVER,
  pos: [0, -HH/2 + 0.97, D/2 + OUT], from: [0, 6, 9], start: 0.22, span: 0.09 });
addPiece({ geo: new THREE.BoxGeometry(1.6, 0.14, 0.5), color: STEEL,
  pos: [0, -HH/2 - 0.02, D/2 + 0.25], from: [0, -5, 9], start: 0.24, span: 0.07 });
addPiece({ geo: new THREE.BoxGeometry(2.6, 0.1, 1.1), color: STEEL,
  pos: [0, -HH/2 + 2.25, D/2 + 0.4], from: [0, 9, 10], start: 0.28, span: 0.08 });
[-1, 1].forEach((sx, i) => addPiece({
  geo: new THREE.BoxGeometry(0.11, 2.2, 0.11), color: STEEL,
  pos: [sx * 1.15, -HH/2 + 1.1, D/2 + 0.85], from: [sx * 5, 7, 10],
  start: 0.30 + i * 0.015, span: 0.07
}));

// front windows only — the +X gable wall is now the equipment wall
[-2.5, 2.5].forEach((x, i) => {
  const y = 0.45, z = D/2 + OUT;
  addPiece({ geo: new THREE.BoxGeometry(1.2, 0.95, 0.07), color: SILVER,
    pos: [x, y, z], from: [x * 2.6, y + 6, z * 2.6], start: 0.25 + i * 0.02, span: 0.08 });
  addPiece({ geo: segGeo([ x-0.6,y,z+0.05, x+0.6,y,z+0.05,
                           x,y-0.475,z+0.05, x,y+0.475,z+0.05 ]),
    color: STEEL, rawLines: true,
    pos: [0,0,0], from: [0,5,0], start: 0.29 + i * 0.02, span: 0.06 });
});

/* ───────── 7. roof deck, plank by plank (0.30 → 0.61) ───────── */
const PLANKS = 8;
const DECK   = SLOPE + EAVE;
const plankDepth = DECK / PLANKS;

[1, -1].forEach((side, s) => {
  const slopeGrp = new THREE.Group();
  slopeGrp.position.set(0, RIDGE, 0);
  // front slope tips down toward +Z; the back one has to tip down toward -Z,
  // which is (PI - pitch), not the negative pitch
  slopeGrp.rotation.x = side === 1 ? PITCH : Math.PI - PITCH;
  rig.add(slopeGrp);
  if (side === 1) window.frontSlope = slopeGrp;

  for (let i = 0; i < PLANKS; i++) {
    const z = (i + 0.5) * plankDepth;
    const t = (s * PLANKS + i) / (PLANKS * 2);
    addPiece({
      // narrow gable overhang on purpose — a wide one hangs out past the
      // equipment wall and hides the batteries from a raised camera
      geo: new THREE.BoxGeometry(W + 0.24, 0.09, plankDepth * 0.94),
      color: SILVER_BRIGHT, parent: slopeGrp,
      pos: [0, 0, z],
      // the back slope group is flipped, so its local "up" is world-down —
      // negate the launch height there or the planks rise out of the ground
      from: [ (rnd(i, s) - 0.5) * 14, (9 + i * 0.6) * side, z + 6 ],
      fromRot: [ rnd(i, s+3) * 2, rnd(i, s+7) * 2, 0 ],
      start: 0.30 + t * 0.20, span: 0.11
    });
  }
});

/* ───────── 8. ridge cap + chimney (0.52 → 0.65) ───────── */
addPiece({ geo: new THREE.BoxGeometry(W + 0.24, 0.14, 0.3), color: STEEL,
  pos: [0, RIDGE + 0.05, 0], from: [0, 11, 0], start: 0.52, span: 0.08 });

const chZ = -1.1, chH = 1.9;
const chBase = RIDGE - Math.abs(chZ) * TAN;
addPiece({ geo: new THREE.BoxGeometry(0.75, chH, 0.75), color: STEEL,
  pos: [-2.4, chBase + chH/2 - 0.3, chZ], from: [-2.4, 12, chZ], start: 0.54, span: 0.08 });
addPiece({ geo: new THREE.BoxGeometry(0.95, 0.12, 0.95), color: STEEL,
  pos: [-2.4, chBase + chH - 0.24, chZ], from: [-2.4, 14, chZ], start: 0.58, span: 0.07 });

/* ───────── 9. the solar array (0.56 → 0.87) ───────── */
const COLS = 4, ROWS = 3;
const pw = 1.55, ph = 0.95, gx = 0.14, gz = 0.14;
const arrayW = COLS * pw + (COLS-1) * gx;
const arrayL = ROWS * ph + (ROWS-1) * gz;
const z0 = SLOPE * 0.5 - arrayL / 2;

for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    const i = c * ROWS + r;
    const x = -arrayW/2 + pw/2 + c * (pw + gx);
    const z =  z0 + ph/2 + r * (ph + gz);
    const t = i / (COLS * ROWS - 1);

    addPiece({
      geo: new THREE.BoxGeometry(pw, 0.07, ph),
      color: GOLD_BRIGHT, parent: window.frontSlope,
      pos: [x, 0.13, z],
      from: [ x + 9, 14 + i * 0.8, z - 4 ],
      fromRot: [ rnd(i, 11) * 3, rnd(i, 13) * 3, rnd(i, 17) * 3 ],
      // the last panel must LAND before the scroll ends, not still be arriving
      start: 0.56 + t * 0.19, span: 0.12
    });
  }
}

/* ───────── 10. batteries on the gable wall (0.76 → 0.88) ───────── */
// Two wall-mounted units on the +X end, which is the wall facing the camera.
const BAT_X = XW + 0.20;
[-0.5, -2.0].forEach((z, i) => {
  addPiece({                                   // the cabinet
    geo: new THREE.BoxGeometry(0.38, 1.25, 0.85), color: SILVER,
    pos: [BAT_X, -HH/2 + 0.95, z],
    from: [BAT_X + 7, 4, z], fromRot: [0, 1.2, 0.6],
    start: 0.76 + i * 0.035, span: 0.10
  });
  addPiece({                                   // gold status strip, so it reads as live
    geo: new THREE.BoxGeometry(0.05, 0.09, 0.55), color: GOLD_DEEP,
    pos: [BAT_X + 0.20, -HH/2 + 1.38, z],
    from: [BAT_X + 8, 5, z],
    start: 0.80 + i * 0.035, span: 0.07
  });
});

// conduit: batteries up the wall to the eave, so the system reads as connected
addPiece({
  geo: new THREE.BoxGeometry(0.09, 1.5, 0.09), color: STEEL,
  pos: [XW + 0.09, 0.55, -1.25], from: [XW + 6, 5, -1.25],
  start: 0.83, span: 0.07
});
addPiece({
  geo: new THREE.BoxGeometry(0.09, 0.09, 1.6), color: STEEL,
  pos: [XW + 0.09, 1.28, -1.25 + 0.75], from: [XW + 6, 6, -0.5],
  start: 0.85, span: 0.06
});

/* ───────── 11. EV charger, last thing installed (0.86 → 0.95) ───────── */
const EV_Z = 2.05, EV_Y = -HH/2 + 1.15;
addPiece({                                     // the wallbox
  geo: new THREE.BoxGeometry(0.26, 0.62, 0.42), color: GOLD_BRIGHT,
  pos: [XW + 0.14, EV_Y, EV_Z],
  from: [XW + 8, 6, EV_Z], fromRot: [0, 1.5, 0.8],
  start: 0.80, span: 0.07
});
addPiece({                                     // charge-status bar
  geo: new THREE.BoxGeometry(0.04, 0.07, 0.26), color: GOLD,
  pos: [XW + 0.28, EV_Y + 0.16, EV_Z],
  from: [XW + 9, 7, EV_Z], start: 0.83, span: 0.05
});

/* ───────── 12. the car arrives (0.87 → 0.94) ───────── */
// Parked alongside the equipment wall, long axis running front-to-back.
// Every part shares one launch offset and no spin, so the car travels as a
// rigid body instead of its panels fanning apart in mid-air.
const GROUND = -HH/2 - 0.35;
const CAR_X = 6.5, CAR_Z = 2.6;
const CAR_IN = [0, 0, -11];                    // approaches along the drive, on the ground
const CAR_START = 0.84, CAR_SPAN = 0.10;
const CAR_ROLL  = 11 / 0.40;                   // wheel turns over that distance
const wheels = [];

const car = new THREE.Group();
car.position.set(CAR_X, 0, CAR_Z);
rig.add(car);

const carPart = (geo, color, pos, rot, edgeAngle) => addPiece({
  geo, color, parent: car, pos, edgeAngle,
  rot: rot || [0, 0, 0], fromRot: rot || [0, 0, 0],
  from: [pos[0] + CAR_IN[0], pos[1] + CAR_IN[1], pos[2] + CAR_IN[2]],
  start: CAR_START, span: CAR_SPAN, noArc: true
});

// A box body reads as a saloon no matter what you do to it. The silhouette is
// what makes a car look fast, so the body is a side profile extruded across the
// width: long low bonnet, steeply raked screen, cabin pushed to the back.
const CAR_W = 1.98;
// Straight segments are what made this read as chunky. Every line of a car
// like this is a curve, so the profile is drawn with beziers throughout.
const prof = new THREE.Shape();
prof.moveTo( 2.24, 0.34);                                  // nose
prof.bezierCurveTo( 2.22, 0.46,  1.95, 0.51,  1.55, 0.54); // over the nose
prof.bezierCurveTo( 1.10, 0.57,  0.82, 0.60,  0.60, 0.67); // long low bonnet
prof.bezierCurveTo( 0.34, 0.81,  0.14, 0.99, -0.12, 1.08); // raked screen
prof.bezierCurveTo(-0.42, 1.15, -0.64, 1.16, -0.94, 1.10); // roof
prof.bezierCurveTo(-1.36, 1.02, -1.70, 0.88, -2.03, 0.72); // fastback
prof.bezierCurveTo(-2.14, 0.67, -2.21, 0.62, -2.23, 0.52); // tail
prof.lineTo(-2.23, 0.20);
prof.bezierCurveTo(-2.12, 0.10, -1.90, 0.05, -1.55, 0.05); // sill
prof.lineTo( 1.55, 0.05);
prof.bezierCurveTo( 1.95, 0.06,  2.17, 0.15,  2.24, 0.34);
prof.closePath();

const bodyGeo = new THREE.ExtrudeGeometry(prof, {
  depth: CAR_W, bevelEnabled: false, steps: 1, curveSegments: 26 });
bodyGeo.translate(0, 0, -CAR_W / 2);           // centre it across the width
// the profile is drawn in the extruder's XY plane, so swing it round to put
// the car's length along Z and its width along X
bodyGeo.rotateY(-Math.PI / 2);                 // length along Z, width along X
carPart(bodyGeo, SILVER_BRIGHT, [0, GROUND + 0.10, 0], null, 16);

// big wheels pushed out to the corners — the other half of the sports-car read
// axle baked onto the X axis, so rolling is a plain rotation about X
const wheel = new THREE.CylinderGeometry(0.40, 0.40, 0.30, 32).rotateZ(Math.PI / 2);
[[-0.96, 1.42], [0.96, 1.42], [-0.96, -1.42], [0.96, -1.42]].forEach(([x, z]) =>
  wheels.push(carPart(wheel, STEEL, [x, GROUND + 0.40, z], null, 20)));

// raw line work on the car — skips the edge-extraction path
const carLines = (pts, color, pos = [0, 0, 0]) => addPiece({
  geo: segGeo(pts), color, parent: car, rawLines: true,
  pos, from: [pos[0] + CAR_IN[0], pos[1] + CAR_IN[1], pos[2] + CAR_IN[2]],
  start: CAR_START, span: CAR_SPAN, noArc: true
});

// Runs a closed Catmull-Rom through the given points and returns line segments.
// Corner points are deliberately never fed in: sampling just inside each corner
// lets the spline round it off, so the outline has no angles anywhere.
const smoothLoop = (pts, samples = 72) => {
  const curve = new THREE.CatmullRomCurve3(
    pts.map(q => new THREE.Vector3(...q)), true, 'catmullrom', 0.5);
  const s = curve.getPoints(samples), out = [];
  for (let i = 0; i < s.length - 1; i++)
    out.push(s[i].x, s[i].y, s[i].z, s[i+1].x, s[i+1].y, s[i+1].z);
  return out;
};

// four corners in, a cornerless pane out
const paneLoop = (A, B, C, D) => {
  const pts = [];
  [[A,B],[B,C],[C,D],[D,A]].forEach(([u, v]) =>
    [0.16, 0.5, 0.84].forEach(t => pts.push([
      u[0] + (v[0]-u[0])*t, u[1] + (v[1]-u[1])*t, u[2] + (v[2]-u[2])*t ])));
  return smoothLoop(pts);
};

const BY = GROUND + 0.10;                      // body datum: profile y sits on this
const SX = CAR_W / 2 + 0.01;                   // just proud of the flank

[-1, 1].forEach(s => {
  const x = s * SX;
  // side glass, a flowing teardrop rather than a chain of straight segments
  carLines(smoothLoop([[0.46,0.73],[0.20,0.90],[-0.06,1.01],[-0.44,1.06],
                       [-0.80,1.04],[-1.10,0.93],[-1.26,0.82],[-0.55,0.70]]
                      .map(([z, y]) => [x, BY + y, z])), SILVER);
  // door shut lines, front and rear
  carLines([ x,BY+0.08,0.60,  x,BY+0.66,0.60,
             x,BY+0.08,-1.30, x,BY+0.92,-1.30 ], STEEL);
  // side intake behind the door
  carLines([ x,BY+0.45,-0.35, x,BY+0.70,-1.05,
             x,BY+0.32,-0.30, x,BY+0.52,-1.10 ], STEEL);
});

// Windscreen and rear screen. Traced along the profile's own curve points and
// lifted a hair off the surface so the outline does not fight the bodywork.
const LIFT = 0.02;
const pane = (a, b, c, d) => carLines(paneLoop(a, b, c, d), SILVER);
// windscreen: cowl at z 0.60 up to the screen header at z -0.12
pane([-0.82, BY+0.67+LIFT,  0.60], [ 0.82, BY+0.67+LIFT,  0.60],
     [ 0.70, BY+1.08+LIFT, -0.12], [-0.70, BY+1.08+LIFT, -0.12]);
// rear screen, down the fastback
pane([-0.70, BY+1.08+LIFT, -0.92], [ 0.70, BY+1.08+LIFT, -0.92],
     [ 0.78, BY+0.88+LIFT, -1.66], [-0.78, BY+0.88+LIFT, -1.66]);

// door handles, mirrors
[-1, 1].forEach(s => {
  carPart(new THREE.BoxGeometry(0.05, 0.07, 0.24), STEEL, [s*(SX+0.02), BY+0.68, -0.72]);
  carPart(new THREE.BoxGeometry(0.24, 0.08, 0.13), STEEL, [s*(SX+0.11), BY+0.74,  0.42]);
});

// lights front and rear
[-1, 1].forEach(s => {
  carPart(new THREE.BoxGeometry(0.44, 0.08, 0.14), SILVER_BRIGHT, [s*0.62, BY+0.44,  2.00]);
  carPart(new THREE.BoxGeometry(0.44, 0.09, 0.06), SILVER,        [s*0.62, BY+0.60, -2.16]);
  carPart(new THREE.BoxGeometry(0.17, 0.10, 0.07), STEEL,         [s*0.45, BY+0.32, -2.20]);  // exhaust
});

// front splitter and rear diffuser fins
carPart(new THREE.BoxGeometry(1.92, 0.05, 0.36), STEEL, [0, BY + 0.06, 2.00]);
[-0.6, -0.2, 0.2, 0.6].forEach(x =>
  carPart(new THREE.BoxGeometry(0.05, 0.22, 0.30), STEEL, [x, BY + 0.16, -2.08]));

// wheel hubs, plus five spokes on each outer face
const hub = new THREE.CylinderGeometry(0.17, 0.17, 0.33, 26).rotateZ(Math.PI / 2);
[[-0.96, 1.42], [0.96, 1.42], [-0.96, -1.42], [0.96, -1.42]].forEach(([wx, wz]) => {
  wheels.push(carPart(hub, SILVER, [wx, GROUND + 0.40, wz], null, 20));
  // spokes are built around the origin and the GROUP is placed at the hub —
  // baking hub coordinates into the geometry would make them swing around the
  // car's centre once the wheel starts turning
  const face = Math.sign(wx) * 0.16, spokes = [];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    spokes.push(face, Math.sin(a) * 0.17, Math.cos(a) * 0.17,
                face, Math.sin(a) * 0.36, Math.cos(a) * 0.36);
  }
  wheels.push(carLines(spokes, STEEL, [wx, GROUND + 0.40, wz]));
});

// the charge port, on the side facing the house
const PORT = [-(CAR_W/2 + 0.02), BY + 0.68, -1.35];
carPart(new THREE.BoxGeometry(0.08, 0.22, 0.28), GOLD_BRIGHT, PORT);

/* ───────── 13. cable from the wallbox to the car (0.93 → 0.98) ───────── */
const c0 = [XW + 0.30, EV_Y - 0.28, EV_Z];
const c1 = [CAR_X + PORT[0] - 0.06, PORT[1], CAR_Z + PORT[2]];
const cable = [];
const SEG = 20;
const at = (s) => [
  c0[0] + (c1[0]-c0[0]) * s,
  c0[1] + (c1[1]-c0[1]) * s - 0.48 * Math.sin(Math.PI * s),     // the sag
  c0[2] + (c1[2]-c0[2]) * s
];
for (let i = 0; i < SEG; i++) cable.push(...at(i/SEG), ...at((i+1)/SEG));

addPiece({
  geo: segGeo(cable), color: GOLD, rawLines: true,
  pos: [0,0,0], from: [2, 2.5, 0], start: 0.945, span: 0.05
});

/* ───────── timeline ───────── */
// Plays itself on load, then holds on the finished system. Set LOOP to true if
// you want it to rebuild forever instead of settling.
const DELAY    = 0.5;    // seconds of stillness before anything moves
const DURATION = 7.3;    // seconds for the whole build
const HOLD     = 4.0;    // seconds to sit on the finished house before a loop
const LOOP     = true;

// The house shell is the least interesting part, so it runs faster than the
// equipment. Rather than retime twenty pieces by hand, the timeline is
// stretched: the house half is compressed, the kit half plays at its old speed.
const HOUSE_END  = 0.65;   // where the shell finishes on the piece timings
const HOUSE_FRAC = 0.55;   // how much of the runtime the shell is allowed
const timeline = u => u < HOUSE_FRAC
  ? (u / HOUSE_FRAC) * HOUSE_END
  : HOUSE_END + (u - HOUSE_FRAC) / (1 - HOUSE_FRAC) * (1 - HOUSE_END);

const LOGO_START = 0.94;  // fraction of the build when the monogram arrives
const LOGO_SPAN  = 0.06;

const easeOut = t => 1 - Math.pow(1 - t, 3);
const clamp01 = t => t < 0 ? 0 : t > 1 ? 1 : t;

/* ───────── render loop ───────── */
const STILL = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock = new THREE.Clock();
let startTime = clock.getElapsedTime();

function tick() {
  const time = clock.getElapsedTime();

  // prefers-reduced-motion: hold on the finished installation, never rebuild
  let elapsed = STILL ? DURATION : time - startTime - DELAY;
  if (LOOP && !STILL) elapsed = elapsed % (DURATION + HOLD);
  const now = timeline(clamp01(elapsed / DURATION));

  // headroom, so the last piece is fully seated rather than still arriving
  const prog = clamp01(now * 1.06);

  for (const p of pieces) {
    const raw = clamp01((prog - p.start) / p.span);
    const t   = easeOut(raw);

    p.grp.position.lerpVectors(p.from, p.to, t);
    // flown parts arc in; anything on wheels stays on the ground
    if (!p.noArc) p.grp.position.y += Math.sin(raw * Math.PI) * 1.4;

    p.grp.rotation.x = p.fromRot.x + (p.toRot.x - p.fromRot.x) * t;
    p.grp.rotation.y = p.fromRot.y + (p.toRot.y - p.fromRot.y) * t;
    p.grp.rotation.z = p.fromRot.z + (p.toRot.z - p.fromRot.z) * t;

    p.lineMat.opacity = raw < 0.08 ? raw / 0.08 : 1;
    if (p.fill) p.fill.visible = raw > 0.75;
  }

  // Only ever a small swing, held inside a three-quarter view. The panel face
  // (+Z) and the equipment wall (+X) must BOTH stay toward the camera the whole
  // time. The idle motion is a slow oscillation, not a drift — anything that
  // adds `time` without bounds eventually turns the house right around.
  rig.rotation.y = -0.02 - now * 0.26 + Math.sin(time * 0.22) * 0.035;

  // wheels roll the distance the car actually covers — set after the piece
  // loop, which resets every rotation each frame
  const carT = easeOut(clamp01((prog - CAR_START) / CAR_SPAN));
  wheels.forEach(w => { w.rotation.x = carT * CAR_ROLL; });

  // the logo flies in last, on the same arc-and-settle motion as the panels
  const lr = clamp01((prog - LOGO_START) / LOGO_SPAN);
  const lt = easeOut(lr);
  LOGO.style.opacity   = lr < 0.15 ? lr / 0.15 : 1;
  // arrives from below-left and rises into its corner, matching the panel motion
  LOGO.style.transform =
    `translate(${(1 - lt) * -150}px, ${(1 - lt) * 120}px)` +
    ` rotate(${(1 - lt) * -20}deg) scale(${0.6 + lt * 0.4})`;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

new ResizeObserver(() => {
  camera.aspect = vw() / vh();
  camera.updateProjectionMatrix();
  renderer.setSize(vw(), vh());
}).observe(host);
}

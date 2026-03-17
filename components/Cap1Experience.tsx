'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── SCENE DATA ──────────────────────────────────────────────────── */

const SCENES = [
  {
    id: 1, nav: 'Atomic Hypothesis',
    question: 'What do your hand, the air, and this text have in common?',
    quote: '"All things are made of atoms — little particles that move around in perpetual motion, attracting each other when they are a little distance apart, but repelling upon being squeezed into one another. In that one sentence, you will see, there is an enormous amount of information about the world."',
    author: '— Feynman, Six Easy Pieces, Ch. 1',
    steps: [
      { label: 'Temperature is speed', text: 'Temperature is not abstract — it is the average speed of atoms. Each atom has a different speed (Maxwell-Boltzmann distribution). Color shows individual velocity: blue = slow, white = average, red = fast.' },
      { label: 'States are just energy', text: 'Solid, liquid, and gas are the same material at different velocities. The state of matter is not a property of the material — it is a property of its energy. Notice how atom colors shift as you heat them.' },
    ],
    insight: 'In that single sentence, Feynman packed more information about the nature of reality than almost any other description in history.',
    control: 'slider' as const,
    camera: { r: 18, y: 9, speed: 0.003 },
    poe: { predict: 'What happens to atoms when they are heated?', options: ['They move faster', 'They change chemistry'] as const, correct: 0, hit: '✓ Correct — drag the slider to see it.', miss: 'Not quite — drag the slider to find out.' },
  },
  {
    id: 2, nav: 'H₂O Molecule',
    question: 'Why is water the strangest substance in the known universe?',
    quote: '"Now consider a drop of water. If we look at it very closely we see nothing — but if we look more and more closely, eventually we see the atoms of which it is composed, in their perpetual motion."',
    author: '— Feynman, Six Easy Pieces, Ch. 1',
    steps: [
      { label: 'Shape creates polarity', text: 'A water molecule is exactly 2 Hydrogens + 1 Oxygen in a V-shape, at an angle of 104.5°. That asymmetry creates an electric dipole: the Oxygen side is negative (δ⁻), the Hydrogen side is positive (δ⁺). Click each atom.' },
      { label: 'Polarity explains everything', text: 'That dipole explains surface tension, the unusually high boiling point, why ice floats, and why water dissolves almost everything. All from a 104.5° angle.' },
    ],
    insight: 'All the strangeness of water — and all life on Earth — emerges from a 104.5° angle.',
    control: 'none' as const,
    camera: { r: 7, y: 2, speed: 0.006 },
    poe: { predict: 'Why does water stick to itself?', options: ["Electric charge imbalance", "It's heavier than other liquids"] as const, correct: 0, hit: '✓ Correct — click the atoms to explore the charges.', miss: 'Not quite — click the atoms to find out.' },
  },
  {
    id: 3, nav: 'Three States',
    question: 'What is the difference between ice, water, and steam?',
    quote: '"The atoms in a solid are not motionless — they jiggle about their equilibrium positions. In a liquid they slide over each other. In a gas they fly about at great speed in all directions."',
    author: '— Feynman, Six Easy Pieces, Ch. 1',
    steps: [
      { label: 'Same molecule, different energy', text: 'Ice, water, and steam are the exact same H₂O molecule. There is no chemical difference — only energy. In ice, each molecule vibrates in a fixed hexagonal lattice held by hydrogen bonds.' },
      { label: 'Why ice floats', text: 'That hexagonal lattice is more spread out than liquid water — so ice is less dense and floats. If it didn\'t, oceans would freeze from the bottom up, and complex life would likely not exist.' },
    ],
    insight: 'Drag slowly across the thresholds — MELTING and VAPORIZATION happen at precise energy levels, not gradually.',
    control: 'slider' as const,
    camera: { r: 16, y: 7, speed: 0.0025 },
    poe: { predict: 'What separates ice, water, and steam?', options: ['Energy — same molecule', 'Different chemicals'] as const, correct: 0, hit: '✓ Correct — drag the slider across the thresholds.', miss: 'Not quite — drag the slider to find out.' },
  },
  {
    id: 4, nav: 'H₂ + O₂ → Water',
    question: 'What is fire, described in terms of atoms?',
    quote: '"Chemical reactions are just processes in which atoms rearrange their partners. The atoms themselves do not change — only who they are bonded to. And in that rearrangement, energy is released."',
    author: '— Feynman, Six Easy Pieces, Ch. 1',
    steps: [
      { label: 'Molecules rearrange', text: 'H₂ is two Hydrogen atoms bonded together. O₂ is two Oxygen atoms bonded together (21% of the air you breathe). With enough ignition energy, the bonds break and atoms recombine: 2H₂ + O₂ → 2H₂O.' },
      { label: 'Fire is just that', text: 'The energy released comes out as heat and light — that is fire. The only product is water. No CO₂, no smoke. This is why hydrogen is considered the clean fuel of the future.' },
    ],
    insight: 'The most familiar reaction in human history — fire — is nothing more than atoms finding a more stable configuration.',
    control: 'button' as const,
    buttonLabel: 'REACT',
    camera: { r: 14, y: 5, speed: 0.002 },
    poe: { predict: 'What is the only product of hydrogen combustion?', options: ['Pure water', 'Carbon dioxide'] as const, correct: 0, hit: '✓ Correct — press REACT to watch it happen.', miss: 'Not quite — press REACT to find out.' },
  },
  {
    id: 5, nav: 'Salt in Water',
    question: 'Why does salt disappear when you stir it into water?',
    quote: '"The ions are pulled away from the crystal one by one by the electric forces of the water molecules — the water molecule, being a dipole, can surround each ion and pull it away."',
    author: '— Feynman, Six Easy Pieces, Ch. 1',
    steps: [
      { label: 'Salt is a crystal of ions', text: 'Table salt (NaCl) is a cubic ionic crystal: Na⁺ ions (yellow, positive) and Cl⁻ ions (green, negative), alternating in a perfect lattice. The crystal is stable because opposites attract.' },
      { label: 'Water dissolves it electrically', text: 'Water, being polar, acts as a molecular magnet: the Oxygen (δ⁻) orients toward Na⁺ while the Hydrogens (δ⁺) orient toward Cl⁻. Each ion is surrounded and pulled away from the crystal one by one.' },
    ],
    insight: 'The same electrical principles that govern circuits and magnets dissolve the salt in your soup.',
    control: 'button' as const,
    buttonLabel: 'DISSOLVE',
    camera: { r: 10, y: 4, speed: 0.004 },
    poe: { predict: 'Why does salt disappear in water?', options: ['Water molecules are electric dipoles', 'Salt breaks into smaller pieces'] as const, correct: 0, hit: '✓ Correct — press DISSOLVE to watch it happen.', miss: 'Not quite — press DISSOLVE to find out.' },
  },
] as const;

type SceneId = 1 | 2 | 3 | 4 | 5;

/* ─── HELPERS ─────────────────────────────────────────────────────── */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// Color from normalized temperature (0–1)
function tempColorNorm(t: number, out: THREE.Color): THREE.Color {
  if (t < 0.5) { out.setRGB(lerp(0.15, 1.0, t * 2), lerp(0.35, 1.0, t * 2), 1.0); }
  else { const s = (t - 0.5) * 2; out.setRGB(1.0, lerp(1.0, 0.15, s), lerp(1.0, 0.04, s)); }
  return out;
}

function mkAtom(r: number, color: THREE.Color): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(
    new THREE.SphereGeometry(r, 24, 16),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, roughness: 0.25, metalness: 0.1 })
  ));
  return g;
}

function mkBond(a: THREE.Vector3, b: THREE.Vector3, color: THREE.Color): THREE.Mesh {
  const dir = b.clone().sub(a);
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, dir.length(), 12),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2, roughness: 0.4 })
  );
  m.position.copy(a.clone().add(b).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function mkH2OGroup(scale = 1): THREE.Group {
  const g = new THREE.Group();
  const ang = (104.5 * Math.PI) / 180;
  const bl = 0.9 * scale;
  const oP = new THREE.Vector3(0, 0, 0);
  const h1P = new THREE.Vector3(bl * Math.sin(ang / 2), -bl * Math.cos(ang / 2), 0);
  const h2P = new THREE.Vector3(-bl * Math.sin(ang / 2), -bl * Math.cos(ang / 2), 0);
  const oA = mkAtom(0.32 * scale, new THREE.Color(0xff3300)); oA.position.copy(oP);
  const h1A = mkAtom(0.18 * scale, new THREE.Color(0xddf4ff)); h1A.position.copy(h1P);
  const h2A = mkAtom(0.18 * scale, new THREE.Color(0xddf4ff)); h2A.position.copy(h2P);
  g.add(oA, h1A, h2A, mkBond(oP, h1P, new THREE.Color(0xffee44)), mkBond(oP, h2P, new THREE.Color(0xffee44)));
  return g;
}

function mkEnhancedBox(half: number): THREE.Group {
  const g = new THREE.Group();
  const edgesMat = new THREE.LineBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.8 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(half * 2, half * 2, half * 2)), edgesMat);
  g.add(edges); g.userData.edges = edges;
  const cGeo = new THREE.SphereGeometry(0.1, 8, 6);
  const cMat = new THREE.MeshBasicMaterial({ color: 0x88ccff });
  [[-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],[-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1]].forEach(([x,y,z]) => {
    const cm = new THREE.Mesh(cGeo, cMat); cm.position.set(x! * half, y! * half, z! * half); g.add(cm);
  });
  const grid = new THREE.GridHelper(half * 2, 8, 0x1a3a7a, 0x0d1e40); grid.position.y = -half + 0.01; g.add(grid);
  return g;
}

function mkStars(): THREE.Points {
  const n = 400; const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 90 + Math.random() * 80; const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1);
    pos[i*3] = r*Math.sin(ph)*Math.cos(th); pos[i*3+1] = r*Math.sin(ph)*Math.sin(th); pos[i*3+2] = r*Math.cos(ph);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.3, sizeAttenuation: true }));
}

/* ─── SCENE BUILDERS ──────────────────────────────────────────────── */

interface SceneHandle {
  update: (temp: number) => void;
  dispose: () => void;
  triggerAction?: () => void;
  onMount?: (camera: THREE.PerspectiveCamera, el: HTMLElement) => () => void;
  getAvgSpeed?: () => number;
}

/* Scene 1 — Lennard-Jones physics, per-atom velocity coloring */
function buildScene1(scene: THREE.Scene): SceneHandle {
  const N = 64; const BOX = 4.5;
  const SIGMA = 1.4; const EPSILON = 0.8;
  const CUT2 = (3.0 * SIGMA) ** 2;
  const MIN_R2 = (0.65 * SIGMA) ** 2;

  // Lattice init
  const lattice: THREE.Vector3[] = [];
  const cs = [-3, -1, 1, 3];
  for (const x of cs) for (const y of cs) for (const z of cs) if (lattice.length < N) lattice.push(new THREE.Vector3(x, y, z));

  const positions = lattice.map(v => v.clone().add(new THREE.Vector3((Math.random()-.5)*.25,(Math.random()-.5)*.25,(Math.random()-.5)*.25)));
  const velocities = Array.from({length: N}, () => new THREE.Vector3((Math.random()-.5)*.08,(Math.random()-.5)*.08,(Math.random()-.5)*.08));

  // Geometry — shared, single material
  const geo = new THREE.SphereGeometry(0.22, 16, 12);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000, emissiveIntensity: 0, roughness: 0.35, metalness: 0.05 });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  scene.add(mesh);

  // Scene-1-local ambient — ensures atom colors read correctly without global emissive wash
  const localAmb = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(localAmb);

  const box = mkEnhancedBox(BOX); scene.add(box);

  // Hoisted reusable objects — zero allocation in hot loop
  const _color = new THREE.Color();
  const _dummy = new THREE.Object3D();
  const forces = Array.from({length: N}, () => new THREE.Vector3());
  let avgSpd = 0;

  const update = (temp: number) => {
    const tN = temp / 100;
    const targetKE = lerp(0.002, 1.4, tN);
    const dt = 0.012;

    // Reset forces
    for (let i = 0; i < N; i++) forces[i].set(0, 0, 0);

    // Lennard-Jones pairwise forces
    for (let i = 0; i < N - 1; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const dz = positions[j].z - positions[i].z;
        let r2 = dx*dx + dy*dy + dz*dz;
        if (r2 > CUT2) continue;
        r2 = Math.max(r2, MIN_R2); // avoid singularity
        const sr2 = (SIGMA * SIGMA) / r2;
        const sr6 = sr2 * sr2 * sr2;
        const sr12 = sr6 * sr6;
        const f = 24 * EPSILON * (2 * sr12 - sr6) / r2;
        forces[i].x -= f * dx; forces[i].y -= f * dy; forces[i].z -= f * dz;
        forces[j].x += f * dx; forces[j].y += f * dy; forces[j].z += f * dz;
      }
    }

    // Integrate velocities
    for (let i = 0; i < N; i++) velocities[i].addScaledVector(forces[i], dt);

    // Velocity-rescaling thermostat
    let sumV2 = 0;
    for (let i = 0; i < N; i++) sumV2 += velocities[i].lengthSq();
    const currentKE = sumV2 / (2 * N);
    if (currentKE > 1e-6) {
      const scale = Math.min(Math.max(Math.sqrt(targetKE / currentKE), 0.5), 2.0);
      for (let i = 0; i < N; i++) velocities[i].multiplyScalar(scale);
    }

    // Move + wall bounce + measure avg speed
    let totalSpd = 0;
    for (let i = 0; i < N; i++) {
      const p = positions[i]; const v = velocities[i];
      p.addScaledVector(v, dt);
      const r = 0.22;
      if (p.x > BOX-r) { p.x = BOX-r; v.x *= -0.85; }
      if (p.x < -BOX+r) { p.x = -BOX+r; v.x *= -0.85; }
      if (p.y > BOX-r) { p.y = BOX-r; v.y *= -0.85; }
      if (p.y < -BOX+r) { p.y = -BOX+r; v.y *= -0.85; }
      if (p.z > BOX-r) { p.z = BOX-r; v.z *= -0.85; }
      if (p.z < -BOX+r) { p.z = -BOX+r; v.z *= -0.85; }
      totalSpd += v.length();
    }
    avgSpd = totalSpd / N;

    // Per-atom velocity coloring — shows Maxwell-Boltzmann distribution
    for (let i = 0; i < N; i++) {
      const spd = velocities[i].length();
      // Shift color by relative speed — capped at ±0.15 so cold atoms stay blue, hot atoms stay red
      const relativeShift = avgSpd > 0 ? Math.max(-0.15, Math.min(0.15, (spd / avgSpd - 1) * 0.4)) : 0;
      const t = Math.max(0, Math.min(1, tN + relativeShift));
      tempColorNorm(t, _color);
      _dummy.position.copy(positions[i]);
      _dummy.scale.setScalar(0.9 + tN * 0.22);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
      mesh.setColorAt(i, _color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Pulsing box edges
    const edgesObj = box.userData.edges as THREE.LineSegments;
    if (edgesObj) (edgesObj.material as THREE.LineBasicMaterial).opacity = 0.45 + 0.35 * Math.sin(Date.now() * 0.0015);
  };

  return { update, dispose: () => scene.remove(mesh, box, localAmb), getAvgSpeed: () => avgSpd };
}

/* Scene 2 — H₂O with CSS2DObject labels */
function buildScene2(scene: THREE.Scene, onAtomInfo: (info: { name: string; detail: string } | null) => void): SceneHandle {
  const group = new THREE.Group();
  const ang = (104.5 * Math.PI) / 180; const bl = 1.6;
  const oP = new THREE.Vector3(0, 0, 0);
  const h1P = new THREE.Vector3(bl * Math.sin(ang / 2), -bl * Math.cos(ang / 2), 0);
  const h2P = new THREE.Vector3(-bl * Math.sin(ang / 2), -bl * Math.cos(ang / 2), 0);

  const oAtom = mkAtom(0.72, new THREE.Color(0xff3300)); oAtom.position.copy(oP);
  oAtom.userData = { name: 'Oxygen (O) — δ⁻', detail: 'Atomic radius: 73 pm\nElectronegativity: 3.44\nPartial charge: δ⁻\n\nOxygen is the most electronegative atom in the molecule. It pulls shared electrons toward itself, creating the negative pole of the dipole. It acts as a hydrogen-bond "acceptor" — attracting H atoms from neighboring water molecules.\n\nThis is why water molecules stick to each other: each oxygen can attract up to 2 hydrogens from neighboring molecules.' };

  const h1Atom = mkAtom(0.42, new THREE.Color(0xddf4ff)); h1Atom.position.copy(h1P);
  h1Atom.userData = { name: 'Hydrogen (H) — δ⁺', detail: 'Atomic radius: 31 pm (smallest of all atoms)\nElectronegativity: 2.20\nPartial charge: δ⁺\n\nWith electrons pulled toward the oxygen, the hydrogen end carries a positive partial charge. It acts as a hydrogen-bond "donor" — attracting the oxygen of a neighboring water molecule.\n\nThese hydrogen bonds explain water\'s unusually high boiling point (100°C vs. the −80°C expected for a molecule this size).' };

  const h2Atom = mkAtom(0.42, new THREE.Color(0xddf4ff)); h2Atom.position.copy(h2P);
  h2Atom.userData = { name: 'Bond Angle: 104.5°', detail: 'The H–O–H angle is 104.5° — not 180° (linear).\n\nWhy? Oxygen has 2 lone pairs of electrons that repel the O–H bonds, pushing them closer together.\n\nIf the angle were 180°, the molecule would be symmetric and non-polar. Without polarity:\n→ No hydrogen bonds\n→ Water boils at −80°C\n→ No liquid water at room temperature\n→ No life as we know it\n\nA 104.5° angle makes life possible.' };

  group.add(oAtom, h1Atom, h2Atom);
  group.add(mkBond(oP, h1P, new THREE.Color(0xffee44)), mkBond(oP, h2P, new THREE.Color(0xffee44)));
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1.6, 0), new THREE.Vector3(0, -1.3, 0)]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
  ));

  // CSS2DObject labels — float in 3D space near each atom
  const makeAtomLabel = (text: string, color: string, subtext?: string) => {
    const div = document.createElement('div');
    div.style.cssText = `font-family:monospace;font-size:11px;color:${color};background:rgba(3,6,18,0.88);border:1px solid ${color}44;padding:2px 7px;border-radius:4px;pointer-events:none;white-space:nowrap;line-height:1.4;`;
    div.innerHTML = subtext ? `<strong>${text}</strong><br><span style="font-size:9px;opacity:0.65">${subtext}</span>` : `<strong>${text}</strong>`;
    return new CSS2DObject(div);
  };

  const oLabel = makeAtomLabel('O', '#ff6644', 'δ⁻  electronegativity 3.44');
  oLabel.position.set(0, 1.1, 0);
  oAtom.add(oLabel);

  const h1Label = makeAtomLabel('H', '#aaddff', 'δ⁺');
  h1Label.position.set(0.3, 0.7, 0);
  h1Atom.add(h1Label);

  const h2Label = makeAtomLabel('H', '#aaddff', 'δ⁺');
  h2Label.position.set(-0.3, 0.7, 0);
  h2Atom.add(h2Label);

  // Bond angle label — positioned at center
  const angleDiv = document.createElement('div');
  angleDiv.style.cssText = 'font-family:monospace;font-size:10px;color:#ffee44;background:rgba(3,6,18,0.8);border:1px solid #ffee4433;padding:2px 6px;border-radius:4px;pointer-events:none;';
  angleDiv.textContent = '104.5°';
  const angleLabel = new CSS2DObject(angleDiv);
  angleLabel.position.set(0, -0.5, 0);
  group.add(angleLabel);

  scene.add(group);

  const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
  const clickTargets = [oAtom.children[0] as THREE.Mesh, h1Atom.children[0] as THREE.Mesh, h2Atom.children[0] as THREE.Mesh];
  const parentMap = new Map([[clickTargets[0], oAtom], [clickTargets[1], h1Atom], [clickTargets[2], h2Atom]]);
  let removeClick: (() => void) | null = null;

  const onMount = (camera: THREE.PerspectiveCamera, el: HTMLElement) => {
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickTargets);
      if (hits.length > 0) { const pg = parentMap.get(hits[0].object as THREE.Mesh); if (pg) onAtomInfo(pg.userData as { name: string; detail: string }); }
      else onAtomInfo(null);
    };
    el.addEventListener('click', handler);
    removeClick = () => el.removeEventListener('click', handler);
    return () => removeClick?.();
  };

  const update = () => { group.rotation.y += 0.007; group.rotation.x = Math.sin(Date.now() * 0.0003) * 0.16; };

  const dispose = () => {
    // Remove CSS2D DOM elements explicitly
    [oLabel, h1Label, h2Label, angleLabel].forEach(l => { l.element.remove(); });
    scene.remove(group);
    removeClick?.();
  };

  return { update, dispose, onMount };
}

/* Scene 3 — Three states of H₂O */
function buildScene3(scene: THREE.Scene): SceneHandle {
  const lattice: THREE.Vector3[] = [];
  for (let x=-1;x<=1;x++) for (let y=-1;y<=1;y++) for (let z=-1;z<=1;z++) lattice.push(new THREE.Vector3(x*3.4,y*3.4,z*3.4));
  const mols = lattice.map(hp => {
    const g = mkH2OGroup(0.85); g.position.copy(hp); scene.add(g);
    return { g, pos: hp.clone(), vel: new THREE.Vector3((Math.random()-.5)*.015,(Math.random()-.5)*.015,(Math.random()-.5)*.015), home: hp.clone(), rx: Math.random()*Math.PI*2, ry: Math.random()*Math.PI*2, rvx: (Math.random()-.5)*.004, rvy: (Math.random()-.5)*.004 };
  });
  const BOX = 6;
  const update = (temp: number) => {
    const tN = temp/100; const spring = Math.max(0,1-tN*2.2); const sf = 0.005+tN*0.18;
    const maxS = sf*2.5; const damp = lerp(0.88,0.978,tN); const rotSpd = lerp(0.001,0.022,tN);
    mols.forEach(m => {
      m.vel.x += (m.home.x-m.pos.x)*spring*0.05+(Math.random()-.5)*sf*0.5;
      m.vel.y += (m.home.y-m.pos.y)*spring*0.05+(Math.random()-.5)*sf*0.5;
      m.vel.z += (m.home.z-m.pos.z)*spring*0.05+(Math.random()-.5)*sf*0.5;
      const spd=m.vel.length(); if(spd>maxS) m.vel.multiplyScalar(maxS/spd);
      m.vel.multiplyScalar(damp); m.pos.add(m.vel);
      if(m.pos.x>BOX){m.pos.x=BOX;m.vel.x*=-.7;} if(m.pos.x<-BOX){m.pos.x=-BOX;m.vel.x*=-.7;}
      if(m.pos.y>BOX){m.pos.y=BOX;m.vel.y*=-.7;} if(m.pos.y<-BOX){m.pos.y=-BOX;m.vel.y*=-.7;}
      if(m.pos.z>BOX){m.pos.z=BOX;m.vel.z*=-.7;} if(m.pos.z<-BOX){m.pos.z=-BOX;m.vel.z*=-.7;}
      m.g.position.copy(m.pos);
      m.rvx+=(Math.random()-.5)*rotSpd*0.3; m.rvy+=(Math.random()-.5)*rotSpd*0.3;
      m.rvx*=0.95; m.rvy*=0.95; m.rx+=m.rvx+rotSpd*0.1; m.ry+=m.rvy+rotSpd*0.1;
      m.g.rotation.set(m.rx,m.ry,0);
    });
  };
  return { update, dispose: () => mols.forEach(m => scene.remove(m.g)) };
}

/* Scene 4 — H₂ + O₂ → Water */
function buildScene4(scene: THREE.Scene, onPhase: (p: string) => void): SceneHandle {
  const objs: THREE.Object3D[] = []; let phase='idle'; let t=0;
  const h2mols = Array.from({length:4},(_,i)=>{
    const g=new THREE.Group(); const pos=new THREE.Vector3(-5.5+(i%2)*2.2,(i<2?1.8:-1.8),(Math.random()-.5)*2);
    const hA=mkAtom(0.32,new THREE.Color(0xddf4ff)); hA.position.set(-0.55,0,0);
    const hB=mkAtom(0.32,new THREE.Color(0xddf4ff)); hB.position.set(0.55,0,0);
    g.add(hA,hB,mkBond(new THREE.Vector3(-0.55,0,0),new THREE.Vector3(0.55,0,0),new THREE.Color(0x88ddff)));
    g.position.copy(pos); scene.add(g); objs.push(g);
    return {g,pos:pos.clone(),vel:new THREE.Vector3((Math.random()-.5)*.02,(Math.random()-.5)*.02,0)};
  });
  const o2mols = Array.from({length:2},(_,i)=>{
    const g=new THREE.Group(); const pos=new THREE.Vector3(5.5,i===0?1.8:-1.8,(Math.random()-.5)*2);
    const oA=mkAtom(0.42,new THREE.Color(0xff3300)); oA.position.set(-0.65,0,0);
    const oB=mkAtom(0.42,new THREE.Color(0xff3300)); oB.position.set(0.65,0,0);
    g.add(oA,oB,mkBond(new THREE.Vector3(-0.65,0,0),new THREE.Vector3(0.65,0,0),new THREE.Color(0xff6633)));
    g.position.copy(pos); scene.add(g); objs.push(g);
    return {g,pos:pos.clone(),vel:new THREE.Vector3((Math.random()-.5)*.02,(Math.random()-.5)*.02,0)};
  });
  const flash = new THREE.PointLight(0xffaa00, 0, 25); scene.add(flash); objs.push(flash);
  const products = [mkH2OGroup(1.1), mkH2OGroup(1.1)];
  products.forEach((p,i)=>{p.visible=false;p.position.set(i===0?-2:2,0,0);scene.add(p);objs.push(p);});
  const allMols = [...h2mols, ...o2mols];
  const update = () => {
    if (phase==='idle') {
      allMols.forEach(m=>{m.vel.x+=(Math.random()-.5)*.003;m.vel.y+=(Math.random()-.5)*.003;m.vel.multiplyScalar(0.97);m.pos.add(m.vel);if(Math.abs(m.pos.x)>8)m.vel.x*=-1;if(Math.abs(m.pos.y)>4)m.vel.y*=-1;m.g.position.copy(m.pos);m.g.rotation.z+=0.008;});
    } else if (phase==='reacting') {
      t+=0.016;
      allMols.forEach(m=>{const toC=new THREE.Vector3().sub(m.pos).normalize().multiplyScalar(0.14);m.vel.add(toC);m.vel.multiplyScalar(0.9);m.pos.add(m.vel);m.g.position.copy(m.pos);m.g.rotation.z+=0.06;if(t>0.9)m.g.traverse(o=>{if((o as THREE.Mesh).isMesh){const mat=(o as THREE.Mesh).material as THREE.MeshStandardMaterial;mat.transparent=true;mat.opacity=Math.max(0,1-(t-0.9)/0.4);}});});
      flash.intensity=(t>0.7&&t<1.6)?Math.sin((t-0.7)/0.9*Math.PI)*12:0;
      if(t>1.1)products.forEach((p,i)=>{p.visible=true;p.scale.setScalar(Math.min(1,(t-1.1)/0.5));p.rotation.y+=0.02;p.position.y=Math.sin(Date.now()*.001+i)*.3;});
      if(t>2.2){phase='done';onPhase('done');}
    } else {
      products.forEach((p,i)=>{p.rotation.y+=0.012;p.position.y=Math.sin(Date.now()*.001+i)*.5;});
    }
  };
  const triggerAction = () => { if(phase==='idle'){phase='reacting';t=0;onPhase('reacting');} };
  return { update, dispose: () => objs.forEach(o => scene.remove(o)), triggerAction };
}

/* Scene 5 — NaCl dissolving */
function buildScene5(scene: THREE.Scene, onPhase: (p: string) => void): SceneHandle {
  const objs: THREE.Object3D[] = []; let phase='crystal'; let t=0;
  const ions: {g:THREE.Group;pos:THREE.Vector3;home:THREE.Vector3;vel:THREE.Vector3;dissolved:boolean;delay:number}[] = [];
  let idx=0;
  for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++){
    const isNa=(x+y+z)%2===0; const col=new THREE.Color(isNa?0xffcc00:0x00dd88);
    const g=mkAtom(isNa?0.33:0.40,col); const pos=new THREE.Vector3(x*1.15,y*1.15,z*1.15);
    g.position.copy(pos); scene.add(g); objs.push(g);
    ions.push({g,pos:pos.clone(),home:pos.clone(),vel:new THREE.Vector3(),dissolved:false,delay:idx*0.07});
    idx++;
  }
  const waters=Array.from({length:14},(_,i)=>{
    const wg=mkAtom(0.2,new THREE.Color(0x0088ff));
    const radius=3.8+Math.random()*1.5; const theta=(i/14)*Math.PI*2; const phi=Math.acos(2*Math.random()-1);
    wg.userData={radius,theta,phi,speed:0.008+Math.random()*.01};
    scene.add(wg); objs.push(wg); return wg;
  });
  const update = () => {
    if(phase==='crystal'){
      const w=0.04; ions.forEach(ion=>{ion.g.position.set(ion.home.x+(Math.random()-.5)*w,ion.home.y+(Math.random()-.5)*w,ion.home.z+(Math.random()-.5)*w);});
      waters.forEach(wg=>{wg.userData.theta+=wg.userData.speed;const{radius,theta,phi}=wg.userData;wg.position.set(radius*Math.sin(phi)*Math.cos(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.sin(theta));});
    } else if(phase==='dissolving'){
      t+=0.016;
      ions.forEach(ion=>{if(!ion.dissolved&&t>ion.delay){ion.vel.add(ion.home.clone().normalize().multiplyScalar(0.008));ion.vel.addScaledVector(new THREE.Vector3((Math.random()-.5),(Math.random()-.5),(Math.random()-.5)),0.006);ion.vel.multiplyScalar(0.94);ion.pos.add(ion.vel);ion.g.position.copy(ion.pos);if(ion.pos.length()>5.5)ion.dissolved=true;}});
      waters.forEach((wg,i)=>{const target=ions[i%ions.length].pos;wg.position.lerp(target,0.04);wg.userData.theta+=wg.userData.speed*4;});
      if(ions.every(ion=>ion.dissolved)){phase='dissolved';onPhase('dissolved');}
    } else {
      ions.forEach(ion=>{ion.pos.y+=Math.sin(Date.now()*.001+ion.home.x)*.005;ion.g.position.copy(ion.pos);});
      waters.forEach(wg=>{wg.userData.theta+=wg.userData.speed;const{radius,theta,phi}=wg.userData;wg.position.set(radius*Math.sin(phi)*Math.cos(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.sin(theta));});
    }
  };
  const triggerAction = () => { if(phase==='crystal'){phase='dissolving';t=0;onPhase('dissolving');} };
  return { update, dispose: () => objs.forEach(o => scene.remove(o)), triggerAction };
}

/* ─── HELPERS ─────────────────────────────────────────────────────── */

function getStateLabel(id: SceneId, temp: number) {
  if (id===1) return temp<30?'SOLID':temp<65?'LIQUID':'GAS';
  if (id===3) return temp<30?'ICE':temp<65?'WATER':'STEAM';
  return '';
}
function getStateBadge(id: SceneId, temp: number) {
  const s = getStateLabel(id, temp);
  if (s==='SOLID'||s==='ICE') return 'text-blue-300 border-blue-500/50 bg-blue-900/25';
  if (s==='LIQUID'||s==='WATER') return 'text-emerald-300 border-emerald-500/50 bg-emerald-900/25';
  if (s==='GAS'||s==='STEAM') return 'text-orange-300 border-orange-500/50 bg-orange-900/25';
  return '';
}

/* ─── CONTEXTUAL CAPTIONS ─────────────────────────────────────────── */

function getCaption(id: SceneId, temp: number): string {
  if (id === 1) {
    if (temp < 10) return 'Atoms vibrate 10¹² times per second — faster than any sound — yet stay locked in place.';
    if (temp < 30) return 'Higher temperature = faster atoms. Every degree you add is energy going directly into their motion.';
    if (temp < 50) return 'The lattice has broken. Atoms still attract each other, but now have enough energy to slide past.';
    if (temp < 65) return 'Temperature is literally the average speed of atoms. Nothing more, nothing less.';
    return 'Gas atoms move at ~500 m/s — the speed of a rifle bullet — in random directions.';
  }
  if (id === 3) {
    if (temp < 30) return 'Ice is less dense than liquid water because its hexagonal lattice has gaps — that\'s why it floats.';
    if (temp < 65) return 'The same H₂O molecule in three states. No chemistry changes — only energy.';
    return 'Steam molecules are 1600× more spread out than liquid water at the same mass.';
  }
  return '';
}

const DISCOVERY: Record<string, { title: string; body: string }> = {
  melt: {
    title: 'Melting point',
    body: 'The rigid lattice breaks. Atoms now have enough energy to slide past each other.\n\nSolid and liquid are the same material — just different energy.',
  },
  boil: {
    title: 'Boiling point',
    body: 'Atoms escape the liquid entirely. Intermolecular forces can no longer hold them.\n\nGas is just the same material with even more energy.',
  },
  solidify: {
    title: 'Solidification',
    body: 'As energy drops, atoms slow down and lock back into fixed positions.\n\nThe same molecule — now frozen into a rigid lattice.',
  },
  condense: {
    title: 'Condensation',
    body: 'Atoms slow down enough to be captured by intermolecular forces again.\n\nGas becomes liquid as energy leaves the system.',
  },
};

/* ─── SCENE INTRO CONTEXT ─────────────────────────────────────────── */

const SCENE_CONTEXT: Record<number, { hook: string; fact: string }> = {
  1: {
    hook: 'Everything you see, touch, and breathe is made of atoms.',
    fact: 'They are so small that 10 million atoms would fit across a single human hair.',
  },
  2: {
    hook: 'A water molecule is just 3 atoms — yet it makes life on Earth possible.',
    fact: 'Its 104.5° angle creates an electric dipole that explains surface tension, why ice floats, and why water dissolves almost everything.',
  },
  3: {
    hook: 'Ice, water, and steam are the exact same molecule.',
    fact: 'The only difference between them is energy. There is no chemistry change — just speed.',
  },
  4: {
    hook: 'Fire is atoms finding a more stable configuration.',
    fact: 'Burn hydrogen and the only product is water. The most familiar reaction in history is just atoms rearranging.',
  },
  5: {
    hook: 'Salt doesn\'t dissolve in water — water pulls it apart atom by atom.',
    fact: 'The same electrical forces that govern circuits dissolve the salt in your food.',
  },
};

/* ─── MAIN COMPONENT ──────────────────────────────────────────────── */

export default function Cap1Experience() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const css2dRendererRef = useRef<CSS2DRenderer | null>(null);
  const animRef = useRef<number>(0);
  const handleRef = useRef<SceneHandle | null>(null);
  const tempRef = useRef(15);
  const prevTempRef = useRef(15);
  const sceneIdRef = useRef<SceneId>(1);
  const cleanupClickRef = useRef<(() => void) | null>(null);
  const speedDisplayRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const userActiveRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orbitAngleRef = useRef(0.5);

  const [sceneId, setSceneId] = useState<SceneId>(1);
  const [temp, setTemp] = useState(15);
  const [atomInfo, setAtomInfo] = useState<{ name: string; detail: string } | null>(null);
  const [actionPhase, setActionPhase] = useState<string>('idle');
  const [showDragHint, setShowDragHint] = useState(true);
  const [sceneIntroVisible, setSceneIntroVisible] = useState(true);
  const [discoveryCard, setDiscoveryCard] = useState<{ title: string; body: string } | null>(null);
  const [showFeynman, setShowFeynman] = useState(false);

  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownDiscoveriesRef = useRef(new Set<string>());

  // POE state (Predict-Observe-Explain) — all scenes

  const sceneData = SCENES.find(s => s.id === sceneId)!;
  const stateLabel = getStateLabel(sceneId, temp);
  const stateBadge = getStateBadge(sceneId, temp);

  /* ── Base Three.js setup ── */
  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const W = mount.clientWidth; const H = mount.clientHeight;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CSS2D Renderer — floats HTML labels in 3D space
    const css2d = new CSS2DRenderer();
    css2d.setSize(W, H);
    css2d.domElement.style.position = 'absolute';
    css2d.domElement.style.top = '0';
    css2d.domElement.style.left = '0';
    css2d.domElement.style.pointerEvents = 'none';
    mount.appendChild(css2d.domElement);
    css2dRendererRef.current = css2d;

    // Camera
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 300);
    camera.position.set(12, 9, 18); camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Scene
    const ts = new THREE.Scene();
    ts.background = new THREE.Color(0x03040c);
    ts.fog = new THREE.FogExp2(0x03040c, 0.012);
    threeSceneRef.current = ts;
    ts.add(new THREE.AmbientLight(0xffffff, 0.18));
    const key = new THREE.PointLight(0x7799ff, 4.5, 55); key.position.set(12, 12, 12); ts.add(key);
    const fill = new THREE.PointLight(0xff4422, 1.8, 40); fill.position.set(-10, -8, -10); ts.add(fill);
    ts.add(mkStars());

    // EffectComposer + UnrealBloomPass
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(ts, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.85, 0.38, 0.72);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composerRef.current = composer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.07;
    controls.enablePan = false; controls.minDistance = 4; controls.maxDistance = 32;
    controls.addEventListener('start', () => {
      userActiveRef.current = true;
      setShowDragHint(false);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    });
    controls.addEventListener('end', () => {
      idleTimerRef.current = setTimeout(() => { userActiveRef.current = false; }, 4000);
    });
    controlsRef.current = controls;

    const onResize = () => {
      const w = mount.clientWidth; const h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      css2d.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const tick = () => {
      animRef.current = requestAnimationFrame(tick);
      frameRef.current++;
      const sd = SCENES.find(s => s.id === sceneIdRef.current)!;
      if (!userActiveRef.current) {
        orbitAngleRef.current += sd.camera.speed;
        camera.position.x = Math.sin(orbitAngleRef.current) * sd.camera.r;
        camera.position.z = Math.cos(orbitAngleRef.current) * sd.camera.r;
        camera.position.y = sd.camera.y;
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
      } else {
        orbitAngleRef.current = Math.atan2(camera.position.x, camera.position.z);
      }
      controls.update();
      handleRef.current?.update(tempRef.current);
      if (frameRef.current % 20 === 0 && speedDisplayRef.current && handleRef.current?.getAvgSpeed) {
        speedDisplayRef.current.textContent = (handleRef.current.getAvgSpeed() * 10000).toFixed(1);
      }
      composer.render();
      css2d.render(ts, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      if (mount.contains(css2d.domElement)) mount.removeChild(css2d.domElement);
    };
  }, []);

  /* ── Scene switching ── */
  useEffect(() => {
    const ts = threeSceneRef.current; const camera = cameraRef.current; const mount = mountRef.current;
    if (!ts || !camera || !mount) return;
    cleanupClickRef.current?.(); cleanupClickRef.current = null;
    handleRef.current?.dispose(); handleRef.current = null;
    sceneIdRef.current = sceneId;
    setAtomInfo(null); setActionPhase('idle');
    let handle: SceneHandle;
    switch (sceneId) {
      case 1: handle = buildScene1(ts); break;
      case 2: handle = buildScene2(ts, setAtomInfo); break;
      case 3: handle = buildScene3(ts); break;
      case 4: handle = buildScene4(ts, setActionPhase); break;
      case 5: handle = buildScene5(ts, setActionPhase); break;
    }
    handleRef.current = handle;
    if (handle.onMount) { const cleanup = handle.onMount(camera, mount); cleanupClickRef.current = cleanup; }
    return () => { cleanupClickRef.current?.(); cleanupClickRef.current = null; handle.dispose(); if (handleRef.current === handle) handleRef.current = null; };
  }, [sceneId]);

  // Reset intro + discoveries on every scene change
  useEffect(() => {
    setSceneIntroVisible(true);
    setDiscoveryCard(null);
    setShowFeynman(false);
    shownDiscoveriesRef.current = new Set();
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    introTimerRef.current = setTimeout(() => setSceneIntroVisible(false), 6000);
    return () => { if (introTimerRef.current) clearTimeout(introTimerRef.current); };
  }, [sceneId]);

  const dismissIntro = useCallback(() => {
    setSceneIntroVisible(false);
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
  }, []);

  const handleTempChange = useCallback((v: number) => {
    dismissIntro();
    const prev = prevTempRef.current; tempRef.current = v; setTemp(v); prevTempRef.current = v;
    const show = (key: string) => {
      if (!shownDiscoveriesRef.current.has(key)) {
        shownDiscoveriesRef.current.add(key);
        setDiscoveryCard(DISCOVERY[key]);
      }
    };
    if (prev < 30 && v >= 30) show('melt');
    else if (prev >= 30 && v < 30) show('solidify');
    else if (prev < 65 && v >= 65) show('boil');
    else if (prev >= 65 && v < 65) show('condense');
  }, [dismissIntro]);

  const goScene = useCallback((id: SceneId) => {
    setSceneId(id); tempRef.current = 15; setTemp(15);
    setDiscoveryCard(null); setShowFeynman(false);
  }, []);

  const buttonLabel = (sceneData as { buttonLabel?: string }).buttonLabel;
  const buttonDone = actionPhase === 'done' || actionPhase === 'dissolved';
  const buttonActive = actionPhase === 'reacting' || actionPhase === 'dissolving';

  // Next scene info for scenes 4 and 5
  const nextScene = sceneId < 5 ? SCENES.find(s => s.id === sceneId + 1) : null;

  const caption = getCaption(sceneId, temp);

  return (
    <div className="w-screen h-screen bg-[#03040c] overflow-hidden relative">

      {/* ── Simulation fills the entire screen ── */}
      <div ref={mountRef} className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* ── Header overlay ── */}
      <header className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-5 z-50"
        style={{ background: 'rgba(3,4,12,0.82)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <a href="/" className="text-white/55 font-mono text-[11px] hover:text-white transition-colors">← Back</a>
          <span className="text-white/20">·</span>
          <span className="text-white/40 font-mono text-[11px]">Six Easy Pieces</span>
          <span className="text-white/20">·</span>
          <span className="text-white/70 font-mono text-[11px]">Chapter 1 — Atoms in Motion</span>
        </div>
        {/* Scene nav + progress */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {SCENES.map(s => (
              <button
                key={s.id}
                onClick={() => goScene(s.id as SceneId)}
                title={s.nav}
                className={`transition-all rounded-full ${sceneId === s.id ? 'bg-[#4da3ff] w-5 h-2' : 'bg-white/20 hover:bg-white/40 w-2 h-2'}`}
              />
            ))}
          </div>
          <nav className="flex gap-1">
            {SCENES.map(s => (
              <button key={s.id} onClick={() => goScene(s.id as SceneId)}
                className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-all ${
                  sceneId === s.id
                    ? 'bg-[#4da3ff]/20 border border-[#4da3ff]/50 text-[#4da3ff]'
                    : 'text-white/45 hover:text-white/75 border border-transparent hover:bg-white/5'
                }`}>
                {s.id}. {s.nav}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ══ 1. SCENE QUESTION PILL — top center, auto-dismiss 6s ══ */}
      <AnimatePresence>
        {sceneIntroVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="rounded-xl px-5 py-3 text-center"
              style={{ background: 'rgba(4,12,26,0.9)', border: '1px solid rgba(77,130,255,0.3)', backdropFilter: 'blur(16px)', whiteSpace: 'nowrap' }}>
              <p className="text-[#4da3ff]/55 font-mono text-[10px] uppercase tracking-widest mb-1">
                {sceneId} of 5 · {sceneData.nav}
              </p>
              <p className="text-white text-sm font-medium">{sceneData.question}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 2. STATE BADGE — top left ══ */}
      {stateLabel && (
        <div className="absolute top-14 left-4 z-10 pointer-events-none">
          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border font-mono text-xs font-bold tracking-widest ${stateBadge}`}>
            {stateLabel}
          </div>
        </div>
      )}

      {/* ══ 3. AVG SPEED — top right, scene 1 only ══ */}
      {sceneId === 1 && (
        <div className="absolute top-14 right-4 text-right pointer-events-none z-10">
          <p className="text-white/25 font-mono text-[10px] uppercase tracking-widest">Avg. atom speed</p>
          <p className="text-white font-mono text-2xl font-bold leading-none"><span ref={speedDisplayRef}>—</span></p>
          <p className="text-white/20 font-mono text-[10px]">× 10⁻⁴ u/s</p>
        </div>
      )}

      {/* ══ 4. DISCOVERY CARD — bottom left, doesn't block simulation ══ */}
      <AnimatePresence>
        {discoveryCard && (
          <motion.div
            initial={{ opacity: 0, x: -16, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -16, y: 8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute left-4 z-35 w-72"
            style={{ bottom: '108px' }}
          >
            <div className="rounded-2xl p-5 shadow-2xl"
              style={{ background: 'rgba(4,10,22,0.97)', border: '1px solid rgba(77,163,255,0.3)', backdropFilter: 'blur(20px)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4da3ff]" />
                <p className="text-[#4da3ff] font-mono text-[10px] uppercase tracking-widest">Phase change</p>
              </div>
              <h3 className="text-white text-base font-bold mb-2">{discoveryCard.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line mb-4">{discoveryCard.body}</p>
              <button
                onClick={() => setDiscoveryCard(null)}
                className="w-full py-1.5 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
                style={{ background: 'rgba(77,163,255,0.08)', border: '1px solid rgba(77,163,255,0.18)' }}>
                Got it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 6. CONTEXTUAL CAPTION — bottom center, above controls ══ */}
      {caption && !discoveryCard && (
        <AnimatePresence mode="wait">
          <motion.div
            key={caption}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
            className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center"
            style={{ bottom: '96px' }}
          >
            <p className="text-white/50 text-sm" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
              {caption}
            </p>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ══ 7. DRAG HINT ══ */}
      <AnimatePresence>
        {showDragHint && !sceneIntroVisible && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-24 right-4 pointer-events-none z-10"
          >
            <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">⟳ Drag · Scroll to zoom</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 8. ATOM INFO — Scene 2 ══ */}
      <AnimatePresence>
        {atomInfo && (
          <motion.div
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="absolute top-1/2 right-4 -translate-y-1/2 w-72 rounded-2xl p-5 shadow-2xl z-35"
            style={{ background: 'rgba(4,10,22,0.97)', border: '1px solid rgba(77,130,255,0.25)', backdropFilter: 'blur(16px)' }}
          >
            <p className="text-[#4da3ff] font-mono text-[10px] uppercase tracking-widest mb-2">{atomInfo.name}</p>
            <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">{atomInfo.detail}</p>
            <button onClick={() => setAtomInfo(null)} className="mt-4 text-white/25 hover:text-white/60 font-mono text-xs uppercase tracking-widest transition-colors">× close</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 9. FEYNMAN PANEL — slide in from right ══ */}
      <AnimatePresence>
        {showFeynman && (
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute top-12 right-0 bottom-20 w-[420px] z-40 flex flex-col overflow-hidden"
            style={{ background: 'rgba(4,8,20,0.98)', borderLeft: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)' }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p className="text-[#4da3ff] font-mono text-[10px] uppercase tracking-widest mb-0.5">Feynman on this</p>
                <p className="text-white/50 text-xs">{sceneData.nav}</p>
              </div>
              <button onClick={() => setShowFeynman(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/8 transition-all text-base">
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">

              {/* Quote block */}
              <div className="px-7 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex gap-4">
                  <div className="w-0.5 shrink-0 rounded-full bg-[#4da3ff]/35 self-stretch" />
                  <div>
                    <blockquote className="text-white/75 leading-relaxed italic"
                      style={{ fontSize: '13px', lineHeight: '1.75' }}>
                      {sceneData.quote}
                    </blockquote>
                    <cite className="text-white/25 font-mono text-[10px] not-italic block mt-3">
                      {sceneData.author}
                    </cite>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="px-7 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[#4da3ff]/50 font-mono text-[10px] uppercase tracking-widest mb-5">How It Works</p>
                <div className="flex flex-col gap-6">
                  {sceneData.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-[#4da3ff]/35 font-mono text-[10px] font-bold shrink-0 mt-0.5 w-4">
                        {String(i+1).padStart(2,'0')}
                      </span>
                      <div>
                        <p className="text-[#4da3ff] text-sm font-semibold mb-1.5">{step.label}</p>
                        <p className="text-white/55 leading-relaxed" style={{ fontSize: '13px', lineHeight: '1.7' }}>
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key insight */}
              <div className="px-7 py-6" style={{ borderBottom: sceneId === 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#4da3ff] text-xs">✦</span>
                  <p className="text-[#4da3ff] font-mono text-[10px] uppercase tracking-widest">Key Insight</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(15,35,80,0.5)', border: '1px solid rgba(77,163,255,0.15)' }}>
                  <p className="text-blue-100/70 leading-relaxed" style={{ fontSize: '13px', lineHeight: '1.7' }}>
                    {sceneData.insight}
                  </p>
                </div>
              </div>

              {/* Scene 2 legend */}
              {sceneId === 2 && (
                <div className="px-7 py-6">
                  <p className="text-[#4da3ff]/50 font-mono text-[10px] uppercase tracking-widest mb-4">Legend</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-[#ff3300] shrink-0"/>
                      <span className="text-white/60" style={{ fontSize: '13px' }}>O — Oxygen (δ⁻, electronegative)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-[#ddf4ff] shrink-0"/>
                      <span className="text-white/60" style={{ fontSize: '13px' }}>H — Hydrogen (δ⁺, positive pole)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-px bg-[#ffee44] shrink-0"/>
                      <span className="text-white/60" style={{ fontSize: '13px' }}>Covalent bond</span>
                    </div>
                    <p className="text-white/30 text-xs mt-1">Click any atom to explore its properties.</p>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 10. CONTROLS BAR — bottom gradient ══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50"
        style={{ background: 'linear-gradient(to top, rgba(3,4,12,0.95) 60%, transparent 100%)' }}>

        {/* Feynman button — bottom right */}
        <div className="absolute bottom-6 right-5">
          <button
            onClick={() => setShowFeynman(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:border-[#4da3ff]/40"
            style={{ background: 'rgba(4,10,22,0.85)', border: `1px solid ${showFeynman ? 'rgba(77,163,255,0.4)' : 'rgba(255,255,255,0.1)'}`, backdropFilter: 'blur(8px)' }}
          >
            <span className="text-[#4da3ff]/70 font-mono text-[10px] uppercase tracking-widest">Feynman →</span>
          </button>
        </div>

        <div className="flex items-center justify-center px-8 gap-8" style={{ height: '80px' }}>

          {sceneData.control === 'slider' && (
            <div className="w-full max-w-lg">
              <div className="flex justify-between font-mono text-xs mb-1.5 px-0.5">
                <span className="text-blue-400/60 uppercase tracking-widest">{sceneId === 3 ? '❄ ICE' : '❄ SOLID'}</span>
                <span className="text-white font-bold">{temp}°</span>
                <span className="text-orange-400/60 uppercase tracking-widest">{sceneId === 3 ? 'STEAM ♨' : 'GAS ♨'}</span>
              </div>
              <div className="relative">
                <input type="range" min={0} max={100} value={temp}
                  onChange={e => handleTempChange(Number(e.target.value))}
                  style={{ background: `linear-gradient(to right,#1a55cc 0%,#22aaff ${temp*.35}%,#44ffaa ${temp*.65}%,#ffaa22 ${temp*.9}%,#ff3300 100%)` }}
                />
                <div className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none" style={{ left: '30%' }}>
                  <div className="w-px h-2 bg-cyan-400/40 mt-1" />
                </div>
                <div className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none" style={{ left: '65%' }}>
                  <div className="w-px h-2 bg-orange-400/40 mt-1" />
                </div>
              </div>
              <div className="flex justify-between font-mono text-[10px] mt-1.5 px-0.5">
                <span className="text-white/15">0°</span>
                <span className="text-cyan-400/50" style={{ marginLeft: '22%' }}>│ 30° MELT</span>
                <span className="text-orange-400/50">65° BOIL │</span>
                <span className="text-white/15">100°</span>
              </div>
            </div>
          )}

          {sceneData.control === 'button' && (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-white/45 font-mono text-xs">{sceneId === 4 ? 'H₂ (cyan) + O₂ (red)' : 'NaCl crystal + H₂O (blue)'}</p>
                <p className="text-white/25 font-mono text-xs">{sceneId === 4 ? 'React to form H₂O' : 'Water pulls ions apart'}</p>
              </div>
              <button
                onClick={() => { dismissIntro(); !buttonDone && !buttonActive && handleRef.current?.triggerAction?.(); }}
                disabled={buttonDone || buttonActive}
                className={`px-7 py-2.5 rounded-xl border font-mono text-sm font-bold uppercase tracking-widest transition-all ${
                  buttonDone ? 'border-emerald-700/40 text-emerald-600/50 cursor-default' :
                  buttonActive ? 'border-yellow-500/50 text-yellow-400 animate-pulse cursor-default' :
                  'border-orange-600/50 text-orange-300 bg-orange-900/15 hover:bg-orange-900/30 hover:border-orange-400/70'
                }`}>
                {buttonDone ? '✓ COMPLETE' : buttonActive ? 'IN PROGRESS...' : buttonLabel}
              </button>
              <AnimatePresence>
                {buttonDone && nextScene && (
                  <motion.button
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    onClick={() => goScene(nextScene.id as SceneId)}
                    className="px-4 py-2.5 rounded-xl border border-blue-700/40 text-blue-400/60 font-mono text-[10px] uppercase tracking-widest hover:text-blue-300 hover:border-blue-500/60 transition-all"
                  >
                    → {nextScene.nav}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

          {sceneData.control === 'none' && (
            <p className="text-white/25 font-mono text-xs uppercase tracking-widest">Click any atom to explore · Drag to rotate · Scroll to zoom</p>
          )}
        </div>
      </div>

    </div>
  );
}

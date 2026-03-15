'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── SCENE DATA ──────────────────────────────────────────────────── */

const SCENES = [
  {
    id: 1, nav: 'Atomic Hypothesis',
    question: 'What do your hand, the air, and this text have in common?',
    quote: '"All things are made of atoms — little particles that move around in perpetual motion, attracting each other when they are a little distance apart, but repelling upon being squeezed into one another. In that one sentence, you will see, there is an enormous amount of information about the world."',
    author: '— Feynman, Six Easy Pieces, Ch. 1',
    steps: [
      { label: 'Temperature is speed', text: 'Temperature is not abstract — it is the average speed of atoms. Heating something means making its atoms move faster. Drag the slider and watch the same atoms transition between states.' },
      { label: 'States are just energy', text: 'Solid, liquid, and gas are the same material at different velocities. The state of matter is not a property of the material — it is a property of its energy.' },
    ],
    insight: 'In that single sentence, Feynman packed more information about the nature of reality than almost any other description in history.',
    control: 'slider' as const,
    camera: { r: 18, y: 9, speed: 0.003 },
  },
  {
    id: 2, nav: 'H₂O Molecule',
    question: 'Why is water the strangest substance in the known universe?',
    quote: '"Now consider a drop of water. If we look at it very closely we see nothing — but if we look more and more closely, eventually we see the atoms of which it is composed, in their perpetual motion."',
    author: '— Feynman, Six Easy Pieces, Ch. 1',
    steps: [
      { label: 'Shape creates polarity', text: 'A water molecule is exactly 2 Hydrogens + 1 Oxygen in a V-shape, at an angle of 104.5°. That asymmetry creates an electric dipole: the Oxygen side is negative (δ⁻), the Hydrogen side is positive (δ⁺).' },
      { label: 'Polarity explains everything', text: 'That dipole explains surface tension, the unusually high boiling point, why ice floats, and why water dissolves almost everything. Click each atom to explore its properties.' },
    ],
    insight: 'All the strangeness of water — and all life on Earth — emerges from a 104.5° angle.',
    control: 'none' as const,
    camera: { r: 7, y: 2, speed: 0.006 },
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
  },
] as const;

type SceneId = 1 | 2 | 3 | 4 | 5;

/* ─── HELPERS ─────────────────────────────────────────────────────── */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function tempColor(temp: number): THREE.Color {
  const t = temp / 100;
  const c = new THREE.Color();
  if (t < 0.5) { c.setRGB(lerp(0.15, 1.0, t * 2), lerp(0.35, 1.0, t * 2), 1.0); }
  else { const s = (t - 0.5) * 2; c.setRGB(1.0, lerp(1.0, 0.15, s), lerp(1.0, 0.04, s)); }
  return c;
}

function mkAtom(r: number, color: THREE.Color): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.45, shininess: 170 })));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.9, 10, 7), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false })));
  return g;
}

function mkBond(a: THREE.Vector3, b: THREE.Vector3, color: THREE.Color): THREE.Mesh {
  const dir = b.clone().sub(a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, dir.length(), 12), new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.25, shininess: 90 }));
  m.position.copy(a.clone().add(b).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

function mkH2OGroup(scale = 1): THREE.Group {
  const g = new THREE.Group(); const ang = (104.5 * Math.PI) / 180; const bl = 0.9 * scale;
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
  const cGeo = new THREE.SphereGeometry(0.1, 8, 6); const cMat = new THREE.MeshBasicMaterial({ color: 0x88ccff });
  [[-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],[-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1]].forEach(([x,y,z]) => {
    const cm = new THREE.Mesh(cGeo, cMat); cm.position.set(x * half, y * half, z * half); g.add(cm);
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
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.38, sizeAttenuation: true }));
}

/* ─── SCENE BUILDERS ──────────────────────────────────────────────── */

interface SceneHandle {
  update: (temp: number) => void;
  dispose: () => void;
  triggerAction?: () => void;
  onMount?: (camera: THREE.PerspectiveCamera, el: HTMLElement) => () => void;
  getAvgSpeed?: () => number;
}

function buildScene1(scene: THREE.Scene): SceneHandle {
  const N = 80; const BOX = 4.5;
  const lattice: THREE.Vector3[] = [];
  const cs = [-3, -1, 1, 3];
  for (const x of cs) for (const y of cs) for (const z of cs) if (lattice.length < N) lattice.push(new THREE.Vector3(x, y, z));
  while (lattice.length < N) lattice.push(new THREE.Vector3((Math.random()-.5)*7,(Math.random()-.5)*7,(Math.random()-.5)*7));

  const coreGeo = new THREE.SphereGeometry(0.22, 22, 14);
  const coreMat = new THREE.MeshPhongMaterial({ emissiveIntensity: 0.45, shininess: 160 });
  const coreMesh = new THREE.InstancedMesh(coreGeo, coreMat, N);
  coreMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  coreMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  scene.add(coreMesh);
  const glowGeo = new THREE.SphereGeometry(0.44, 10, 8);
  const glowMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false });
  const glowMesh = new THREE.InstancedMesh(glowGeo, glowMat, N);
  glowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  glowMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  scene.add(glowMesh);
  const box = mkEnhancedBox(BOX); scene.add(box);

  const positions = lattice.map(v => v.clone().add(new THREE.Vector3((Math.random()-.5)*.1,(Math.random()-.5)*.1,(Math.random()-.5)*.1)));
  const velocities = Array.from({length: N}, () => new THREE.Vector3((Math.random()-.5)*.02,(Math.random()-.5)*.02,(Math.random()-.5)*.02));
  const dummy = new THREE.Object3D(); let avgSpd = 0;

  const update = (temp: number) => {
    const tN = temp / 100; const spring = Math.max(0, 1 - tN * 2.2);
    const sf = 0.008 + tN * 0.24; const maxS = sf * 2.5; const damp = lerp(0.87, 0.978, tN);
    const col = tempColor(temp); let total = 0;
    for (let i = 0; i < N; i++) {
      const p = positions[i]; const v = velocities[i]; const h = lattice[i];
      v.x += (h.x-p.x)*spring*0.06+(Math.random()-.5)*sf*0.6;
      v.y += (h.y-p.y)*spring*0.06+(Math.random()-.5)*sf*0.6;
      v.z += (h.z-p.z)*spring*0.06+(Math.random()-.5)*sf*0.6;
      const spd = v.length(); if (spd > maxS) v.multiplyScalar(maxS/spd);
      v.multiplyScalar(damp); p.add(v); total += spd;
      const r = 0.22;
      if (p.x>BOX-r){p.x=BOX-r;v.x*=-.75;} if (p.x<-BOX+r){p.x=-BOX+r;v.x*=-.75;}
      if (p.y>BOX-r){p.y=BOX-r;v.y*=-.75;} if (p.y<-BOX+r){p.y=-BOX+r;v.y*=-.75;}
      if (p.z>BOX-r){p.z=BOX-r;v.z*=-.75;} if (p.z<-BOX+r){p.z=-BOX+r;v.z*=-.75;}
      dummy.position.copy(p); dummy.scale.setScalar(0.9+tN*0.22); dummy.updateMatrix();
      coreMesh.setMatrixAt(i,dummy.matrix); glowMesh.setMatrixAt(i,dummy.matrix);
      coreMesh.setColorAt(i,col); glowMesh.setColorAt(i,col);
    }
    avgSpd = total/N;
    coreMesh.instanceMatrix.needsUpdate = true; glowMesh.instanceMatrix.needsUpdate = true;
    if (coreMesh.instanceColor) coreMesh.instanceColor.needsUpdate = true;
    if (glowMesh.instanceColor) glowMesh.instanceColor.needsUpdate = true;
    const edges = box.userData.edges as THREE.LineSegments;
    if (edges) (edges.material as THREE.LineBasicMaterial).opacity = 0.5 + 0.35*Math.sin(Date.now()*0.0015);
  };
  return { update, dispose: () => scene.remove(coreMesh, glowMesh, box), getAvgSpeed: () => avgSpd };
}

function buildScene2(scene: THREE.Scene, onAtomInfo: (info: { name: string; detail: string } | null) => void): SceneHandle {
  const group = new THREE.Group();
  const ang = (104.5*Math.PI)/180; const bl = 1.6;
  const oP = new THREE.Vector3(0,0,0);
  const h1P = new THREE.Vector3(bl*Math.sin(ang/2), -bl*Math.cos(ang/2), 0);
  const h2P = new THREE.Vector3(-bl*Math.sin(ang/2), -bl*Math.cos(ang/2), 0);
  const oAtom = mkAtom(0.72, new THREE.Color(0xff3300)); oAtom.position.copy(oP);
  oAtom.userData = { name: 'Oxygen (O) — δ⁻', detail: 'Atomic radius: 73 pm\nElectronegativity: 3.44\nPartial charge: δ⁻\n\nOxygen is the most electronegative atom in the molecule. It pulls shared electrons toward itself, creating the negative pole of the dipole. It acts as a hydrogen-bond "acceptor" — attracting H atoms from neighboring water molecules.\n\nThis is why water molecules stick to each other: each oxygen can attract up to 2 hydrogens from neighboring molecules.' };
  const h1Atom = mkAtom(0.42, new THREE.Color(0xddf4ff)); h1Atom.position.copy(h1P);
  h1Atom.userData = { name: 'Hydrogen (H) — δ⁺', detail: 'Atomic radius: 31 pm (smallest of all atoms)\nElectronegativity: 2.20\nPartial charge: δ⁺\n\nWith electrons pulled toward the oxygen, the hydrogen end carries a positive partial charge. It acts as a hydrogen-bond "donor" — attracting the oxygen of a neighboring water molecule.\n\nThese hydrogen bonds explain water\'s unusually high boiling point (100°C vs. the −80°C expected for a molecule this size).' };
  const h2Atom = mkAtom(0.42, new THREE.Color(0xddf4ff)); h2Atom.position.copy(h2P);
  h2Atom.userData = { name: 'Bond Angle: 104.5°', detail: 'The H–O–H angle is 104.5° — not 180° (linear).\n\nWhy? Oxygen has 2 lone pairs of electrons that repel the O–H bonds, pushing them closer together.\n\nIf the angle were 180°, the molecule would be symmetric and non-polar. Without polarity:\n→ No hydrogen bonds\n→ Water boils at −80°C\n→ No liquid water at room temperature\n→ No life as we know it\n\nA 104.5° angle makes life possible.' };
  group.add(oAtom, h1Atom, h2Atom);
  group.add(mkBond(oP, h1P, new THREE.Color(0xffee44)), mkBond(oP, h2P, new THREE.Color(0xffee44)));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,1.6,0), new THREE.Vector3(0,-1.3,0)]), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 })));
  scene.add(group);
  const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
  const clickTargets = [oAtom.children[0] as THREE.Mesh, h1Atom.children[0] as THREE.Mesh, h2Atom.children[0] as THREE.Mesh];
  const parentMap = new Map([[clickTargets[0], oAtom],[clickTargets[1], h1Atom],[clickTargets[2], h2Atom]]);
  let removeClick: (() => void) | null = null;
  const onMount = (camera: THREE.PerspectiveCamera, el: HTMLElement) => {
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX-rect.left)/rect.width)*2-1; mouse.y = -((e.clientY-rect.top)/rect.height)*2+1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickTargets);
      if (hits.length>0) { const pg = parentMap.get(hits[0].object as THREE.Mesh); if (pg) onAtomInfo(pg.userData as {name:string;detail:string}); }
      else onAtomInfo(null);
    };
    el.addEventListener('click', handler); removeClick = () => el.removeEventListener('click', handler);
    return () => removeClick?.();
  };
  const update = () => { group.rotation.y += 0.007; group.rotation.x = Math.sin(Date.now()*0.0003)*0.16; };
  return { update, dispose: () => { scene.remove(group); removeClick?.(); }, onMount };
}

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

function buildScene4(scene: THREE.Scene, onPhase: (p:string)=>void): SceneHandle {
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
  const flash=new THREE.PointLight(0xffaa00,0,25); scene.add(flash); objs.push(flash);
  const products=[mkH2OGroup(1.1),mkH2OGroup(1.1)];
  products.forEach((p,i)=>{p.visible=false;p.position.set(i===0?-2:2,0,0);scene.add(p);objs.push(p);});
  const allMols=[...h2mols,...o2mols];
  const update=()=>{
    if(phase==='idle'){
      allMols.forEach(m=>{m.vel.x+=(Math.random()-.5)*.003;m.vel.y+=(Math.random()-.5)*.003;m.vel.multiplyScalar(0.97);m.pos.add(m.vel);if(Math.abs(m.pos.x)>8)m.vel.x*=-1;if(Math.abs(m.pos.y)>4)m.vel.y*=-1;m.g.position.copy(m.pos);m.g.rotation.z+=0.008;});
    } else if(phase==='reacting'){
      t+=0.016;
      allMols.forEach(m=>{const toC=new THREE.Vector3().sub(m.pos).normalize().multiplyScalar(0.14);m.vel.add(toC);m.vel.multiplyScalar(0.9);m.pos.add(m.vel);m.g.position.copy(m.pos);m.g.rotation.z+=0.06;if(t>0.9)m.g.traverse(o=>{if((o as THREE.Mesh).isMesh){const mat=(o as THREE.Mesh).material as THREE.MeshPhongMaterial;mat.transparent=true;mat.opacity=Math.max(0,1-(t-0.9)/0.4);}});});
      flash.intensity=(t>0.7&&t<1.6)?Math.sin((t-0.7)/0.9*Math.PI)*12:0;
      if(t>1.1)products.forEach((p,i)=>{p.visible=true;p.scale.setScalar(Math.min(1,(t-1.1)/0.5));p.rotation.y+=0.02;p.position.y=Math.sin(Date.now()*.001+i)*.3;});
      if(t>2.2){phase='done';onPhase('done');}
    } else {
      products.forEach((p,i)=>{p.rotation.y+=0.012;p.position.y=Math.sin(Date.now()*.001+i)*.5;});
    }
  };
  const triggerAction=()=>{if(phase==='idle'){phase='reacting';t=0;onPhase('reacting');}};
  return{update,dispose:()=>objs.forEach(o=>scene.remove(o)),triggerAction};
}

function buildScene5(scene: THREE.Scene, onPhase: (p:string)=>void): SceneHandle {
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
  const update=()=>{
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
  const triggerAction=()=>{if(phase==='crystal'){phase='dissolving';t=0;onPhase('dissolving');}};
  return{update,dispose:()=>objs.forEach(o=>scene.remove(o)),triggerAction};
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────────── */

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

export default function Cap1Experience() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
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
  const [transitionText, setTransitionText] = useState<string | null>(null);
  const [showDragHint, setShowDragHint] = useState(true);

  const sceneData = SCENES.find(s => s.id === sceneId)!;
  const stateLabel = getStateLabel(sceneId, temp);
  const stateBadge = getStateBadge(sceneId, temp);

  // Base Three.js setup
  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const W = mount.clientWidth; const H = mount.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement); rendererRef.current = renderer;
    const camera = new THREE.PerspectiveCamera(55, W/H, 0.1, 300);
    camera.position.set(12, 9, 18); camera.lookAt(0, 0, 0); cameraRef.current = camera;
    const ts = new THREE.Scene();
    ts.background = new THREE.Color(0x03040c); ts.fog = new THREE.FogExp2(0x03040c, 0.015);
    threeSceneRef.current = ts;
    ts.add(new THREE.AmbientLight(0xffffff, 0.2));
    const key = new THREE.PointLight(0x6699ff, 4, 50); key.position.set(12, 12, 12); ts.add(key);
    const fill = new THREE.PointLight(0xff4422, 2, 40); fill.position.set(-10, -8, -10); ts.add(fill);
    ts.add(mkStars());

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
      const w=mount.clientWidth,h=mount.clientHeight;
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
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
      renderer.render(ts, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animRef.current); window.removeEventListener('resize', onResize);
      controls.dispose(); renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Scene switching
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

  const handleTempChange = useCallback((v: number) => {
    const prev = prevTempRef.current; tempRef.current = v; setTemp(v); prevTempRef.current = v;
    if (prev < 30 && v >= 30) { setTransitionText('MELTING'); setTimeout(() => setTransitionText(null), 1800); }
    else if (prev >= 30 && v < 30) { setTransitionText('SOLIDIFICATION'); setTimeout(() => setTransitionText(null), 1800); }
    else if (prev < 65 && v >= 65) { setTransitionText('VAPORIZATION'); setTimeout(() => setTransitionText(null), 1800); }
    else if (prev >= 65 && v < 65) { setTransitionText('CONDENSATION'); setTimeout(() => setTransitionText(null), 1800); }
  }, []);

  const goScene = useCallback((id: SceneId) => { setSceneId(id); tempRef.current = 15; setTemp(15); }, []);
  const buttonLabel = (sceneData as { buttonLabel?: string }).buttonLabel;
  const buttonDone = actionPhase === 'done' || actionPhase === 'dissolved';
  const buttonActive = actionPhase === 'reacting' || actionPhase === 'dissolving';

  return (
    <div className="w-screen h-screen flex flex-col bg-[#03040c] overflow-hidden">

      {/* ── Header ── */}
      <header className="h-11 flex items-center justify-between px-5 border-b border-[#0d1e35] shrink-0 bg-[#040810]">
        <div className="flex items-center gap-3">
          <a href="/" className="text-[#1a3a5a] font-mono text-[11px] hover:text-blue-400 transition-colors">← Back</a>
          <span className="text-[#0d1e35]">·</span>
          <span className="text-[#2a4a6a] font-mono text-[11px]">Six Easy Pieces</span>
          <span className="text-[#0d1e35]">·</span>
          <span className="text-white font-mono text-[11px]">Chapter 1 — Atoms in Motion</span>
        </div>
        <nav className="flex gap-1">
          {SCENES.map(s => (
            <button key={s.id} onClick={() => goScene(s.id as SceneId)}
              className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-all ${
                sceneId === s.id ? 'bg-[#0a1a3a] border border-blue-500/50 text-blue-300' : 'text-[#1a3050] hover:text-[#4a7aaa] border border-transparent'
              }`}>
              {s.id}. {s.nav}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <aside className="w-72 shrink-0 bg-[#040810] border-r border-[#0d1e35] flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={sceneId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex-1 flex flex-col p-5 overflow-y-auto gap-5"
            >
              {/* Scene badge */}
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-900/50 border border-blue-700/50 flex items-center justify-center font-mono text-[10px] text-blue-400">{sceneId}</span>
                <span className="text-[#1a3a5a] font-mono text-[9px] uppercase tracking-widest">{sceneId} of 5</span>
              </div>

              {/* Question */}
              <div>
                <p className="text-[#1a3a5a] font-mono text-[9px] uppercase tracking-widest mb-1.5">The Question</p>
                <h2 className="text-white text-sm font-semibold leading-snug">{sceneData.question}</h2>
              </div>

              {/* Feynman Quote */}
              <div className="border-l-2 border-blue-700/40 pl-3">
                <p className="text-[#1a3a5a] font-mono text-[9px] uppercase tracking-widest mb-1.5">Feynman Said</p>
                <blockquote className="text-[#2a4a70] font-mono text-[10px] italic leading-relaxed mb-1">
                  {sceneData.quote}
                </blockquote>
                <cite className="text-[#142030] font-mono text-[9px] not-italic">{sceneData.author}</cite>
              </div>

              {/* Steps */}
              <div>
                <p className="text-[#1a3a5a] font-mono text-[9px] uppercase tracking-widest mb-2.5">How It Works</p>
                <div className="space-y-4">
                  {sceneData.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-[#2255aa] font-mono text-[10px] font-bold shrink-0 mt-0.5 w-5 text-right">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="text-[#4488cc] font-mono text-[10px] font-semibold mb-0.5">{step.label}</p>
                        <p className="text-[#2a4060] font-mono text-[10px] leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insight */}
              <div className="bg-[#060f1e] border border-blue-900/40 rounded-lg p-3 mt-auto">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-blue-500 text-[10px]">✦</span>
                  <span className="text-blue-500 font-mono text-[9px] uppercase tracking-widest">Key Insight</span>
                </div>
                <p className="text-blue-300/60 font-mono text-[10px] leading-relaxed">{sceneData.insight}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Scene 2 legend (inside sidebar bottom) */}
          {sceneId === 2 && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="border-t border-[#0d1e35] p-4">
              <p className="text-[#1a3a5a] font-mono text-[9px] uppercase tracking-widest mb-2">Legend</p>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#ff3300] shrink-0"/><span className="text-[#884433]">O — Oxygen (δ⁻, larger)</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#ddf4ff] shrink-0"/><span className="text-[#6688aa]">H — Hydrogen (δ⁺, smaller)</span></div>
                <div className="flex items-center gap-2"><span className="w-4 h-px bg-[#ffee44] shrink-0"/><span className="text-[#665522]">Covalent bond</span></div>
                <div className="mt-1 text-[#1a2a3a]">Click any atom to explore its properties.</div>
              </div>
            </motion.div>
          )}
        </aside>

        {/* ── Canvas + Controls ── */}
        <div className="flex-1 flex flex-col">

          {/* Canvas area */}
          <div className="flex-1 relative">
            <div ref={mountRef} className="absolute inset-0" />

            {/* Drag hint */}
            <AnimatePresence>
              {showDragHint && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: 1.5, duration: 0.5 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
                >
                  <div className="flex items-center gap-2 bg-[#060d1a]/80 border border-[#1a3a6a]/40 rounded-full px-4 py-2 backdrop-blur-sm">
                    <span className="text-[#2255aa] text-sm">⟳</span>
                    <span className="text-[#2255aa] font-mono text-[10px] uppercase tracking-widest">Drag to rotate · Scroll to zoom</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transition flash */}
            <AnimatePresence>
              {transitionText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="font-mono text-3xl font-bold tracking-widest text-white" style={{ textShadow: '0 0 40px rgba(80,160,255,0.9)' }}>
                    {transitionText}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* State badge (top-left of canvas) */}
            {stateLabel && (
              <div className="absolute top-4 left-4 pointer-events-none">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border font-mono text-xs font-bold tracking-widest ${stateBadge}`}>
                  {stateLabel}
                </div>
              </div>
            )}

            {/* Speed readout (scene 1) */}
            {sceneId === 1 && (
              <div className="absolute top-4 right-4 text-right pointer-events-none">
                <p className="text-[#1a3050] font-mono text-[9px] uppercase tracking-widest">Avg. speed</p>
                <p className="text-white font-mono text-lg font-bold leading-none"><span ref={speedDisplayRef}>—</span></p>
                <p className="text-[#1a3050] font-mono text-[9px]">× 10⁻⁴ u/s</p>
              </div>
            )}

            {/* Atom info popup (scene 2) */}
            <AnimatePresence>
              {atomInfo && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="absolute top-1/2 right-4 -translate-y-1/2 w-56 bg-[#040c1a]/96 border border-blue-800/40 rounded-xl p-4 backdrop-blur-sm"
                >
                  <p className="text-blue-400 font-mono text-[10px] uppercase tracking-widest mb-2">{atomInfo.name}</p>
                  <p className="text-[#2a4a6a] font-mono text-[10px] leading-relaxed whitespace-pre-line">{atomInfo.detail}</p>
                  <button onClick={() => setAtomInfo(null)} className="mt-3 text-[#1a3060] hover:text-white font-mono text-[9px] uppercase tracking-widest transition-colors">× close</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Controls bar ── */}
          <div className="h-20 bg-[#040810] border-t border-[#0d1e35] flex items-center justify-center px-8 gap-8 shrink-0">
            {sceneData.control === 'slider' && (
              <div className="w-full max-w-md">
                <div className="flex justify-between font-mono text-[9px] mb-1 px-0.5">
                  <span className="text-blue-400/60 uppercase tracking-widest">{sceneId === 3 ? '❄ ICE' : '❄ SOLID'}</span>
                  <span className="text-white font-bold">{temp}°</span>
                  <span className="text-orange-400/60 uppercase tracking-widest">{sceneId === 3 ? 'STEAM ♨' : 'GAS ♨'}</span>
                </div>
                <input type="range" min={0} max={100} value={temp} onChange={e => handleTempChange(Number(e.target.value))}
                  style={{ background: `linear-gradient(to right,#1a55cc 0%,#22aaff ${temp*.35}%,#44ffaa ${temp*.65}%,#ffaa22 ${temp*.9}%,#ff3300 100%)` }}
                />
                <div className="flex justify-between font-mono text-[9px] mt-1 px-0.5">
                  <span className="text-[#0d1e35]">0°</span>
                  <span className="text-blue-500/30" style={{marginLeft:`${30}%`}}>│ MELT</span>
                  <span className="text-orange-500/30" style={{marginLeft:'0'}}>BOIL │</span>
                  <span className="text-[#0d1e35]">100°</span>
                </div>
              </div>
            )}
            {sceneData.control === 'button' && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[#1a3050] font-mono text-[9px]">H₂ (cyan) + O₂ (red)</p>
                  <p className="text-[#2a4060] font-mono text-[9px]">React to form H₂O</p>
                </div>
                <button
                  onClick={() => !buttonDone && !buttonActive && handleRef.current?.triggerAction?.()}
                  disabled={buttonDone || buttonActive}
                  className={`px-7 py-2.5 rounded-xl border font-mono text-sm font-bold uppercase tracking-widest transition-all ${
                    buttonDone ? 'border-emerald-700/40 text-emerald-600/50 cursor-default' :
                    buttonActive ? 'border-yellow-500/50 text-yellow-400 animate-pulse cursor-default' :
                    'border-orange-600/50 text-orange-300 bg-orange-900/15 hover:bg-orange-900/30 hover:border-orange-400/70'
                  }`}>
                  {buttonDone ? '✓ COMPLETE' : buttonActive ? 'IN PROGRESS...' : buttonLabel}
                </button>
              </div>
            )}
            {sceneData.control === 'none' && (
              <p className="text-[#1a3050] font-mono text-[10px] uppercase tracking-widest">Click any atom to explore · Drag to rotate · Scroll to zoom</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

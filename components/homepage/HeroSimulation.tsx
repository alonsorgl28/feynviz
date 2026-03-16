'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function makeAtomTex(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;

  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0,    'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.65, 'rgba(255,255,255,0.25)');
  grad.addColorStop(1,    'rgba(255,255,255,0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function HeroSimulation() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ─────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0012);

    const camera = new THREE.PerspectiveCamera(55, W / H, 2, 2000);
    camera.position.z = 900;

    // ── Atoms ──────────────────────────────────────────────────────────────
    const tex = makeAtomTex();

    // Two layers: small atoms (100) + occasional larger molecules (18)
    const layers = [
      { count: 100, size: 14, opacity: 0.38 },
      { count: 18,  size: 28, opacity: 0.22 },
    ];

    const objects: THREE.Points[] = [];

    for (const layer of layers) {
      const geo = new THREE.BufferGeometry();
      const verts = new Float32Array(layer.count * 3);
      const vels  = new Float32Array(layer.count * 3);

      for (let i = 0; i < layer.count; i++) {
        verts[i * 3]     = 1600 * Math.random() - 800;
        verts[i * 3 + 1] = 1000 * Math.random() - 500;
        verts[i * 3 + 2] =  700 * Math.random() - 350;

        // slow brownian velocity — 0.25 to 0.55 units/frame
        const speed = 0.25 + Math.random() * 0.30;
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        vels[i * 3]     = speed * Math.sin(phi) * Math.cos(theta);
        vels[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
        vels[i * 3 + 2] = speed * Math.cos(phi) * 0.3; // shallow z movement
      }

      geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      (geo as any)._vels = vels; // store velocities alongside geometry

      const mat = new THREE.PointsMaterial({
        size: layer.size,
        sizeAttenuation: true,
        map: tex,
        alphaTest: 0.01,
        transparent: true,
        opacity: layer.opacity,
        color: new THREE.Color(0x8cc8ff), // rgba(140, 200, 255) — spec color
        depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);
      objects.push(points);
    }

    // ── Mouse — track on window so it works across the full page ───────────
    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      mouseX = e.clientX - window.innerWidth  / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    };
    window.addEventListener('pointermove', onMove);

    // ── Animation ─────────────────────────────────────────────────────────
    const BOUNDS = { x: 820, y: 520, z: 370 };

    const animate = () => {
      // Brownian motion — update positions, bounce off walls
      for (const pts of objects) {
        const pos  = pts.geometry.attributes.position.array as Float32Array;
        const vels = (pts.geometry as any)._vels as Float32Array;
        const n = pos.length / 3;

        for (let i = 0; i < n; i++) {
          pos[i * 3]     += vels[i * 3];
          pos[i * 3 + 1] += vels[i * 3 + 1];
          pos[i * 3 + 2] += vels[i * 3 + 2];

          if (Math.abs(pos[i * 3])     > BOUNDS.x) vels[i * 3]     *= -1;
          if (Math.abs(pos[i * 3 + 1]) > BOUNDS.y) vels[i * 3 + 1] *= -1;
          if (Math.abs(pos[i * 3 + 2]) > BOUNDS.z) vels[i * 3 + 2] *= -1;
        }
        pts.geometry.attributes.position.needsUpdate = true;
      }

      // Camera follows mouse — same lerp as billboards example
      camera.position.x += (mouseX  - camera.position.x) * 0.03;
      camera.position.y += (-mouseY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      tex.dispose();
      for (const pts of objects) {
        pts.geometry.dispose();
        (pts.material as THREE.Material).dispose();
      }
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
}

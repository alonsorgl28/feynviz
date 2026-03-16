'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroSimulation() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.z = 55;

    // Particle field — 280 floating points
    const N = 280;
    const posArr = new Float32Array(N * 3);
    const velArr = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      posArr[i * 3]     = (Math.random() - 0.5) * 110;
      posArr[i * 3 + 1] = (Math.random() - 0.5) * 65;
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velArr[i * 3]     = (Math.random() - 0.5) * 0.018;
      velArr[i * 3 + 1] = (Math.random() - 0.5) * 0.014;
      velArr[i * 3 + 2] = (Math.random() - 0.5) * 0.006;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x4da3ff,
      size: 0.55,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Subtle connection lines between nearby particles
    const linePositions = new Float32Array(N * N * 6); // worst case
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x4da3ff,
      transparent: true,
      opacity: 0.08,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    let animId: number;
    const CONNECT_DIST2 = 18 * 18; // only connect particles within 18 units

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Move particles
      for (let i = 0; i < N; i++) {
        posArr[i * 3]     += velArr[i * 3];
        posArr[i * 3 + 1] += velArr[i * 3 + 1];
        posArr[i * 3 + 2] += velArr[i * 3 + 2];
        // Wrap
        if (posArr[i * 3] > 55)  posArr[i * 3] = -55;
        if (posArr[i * 3] < -55) posArr[i * 3] = 55;
        if (posArr[i * 3 + 1] > 33)  posArr[i * 3 + 1] = -33;
        if (posArr[i * 3 + 1] < -33) posArr[i * 3 + 1] = 33;
      }
      geo.attributes.position.needsUpdate = true;

      // Update connection lines (check subset for performance)
      let lineIdx = 0;
      const maxLines = 120;
      for (let i = 0; i < N - 1 && lineIdx / 6 < maxLines; i++) {
        for (let j = i + 1; j < N && lineIdx / 6 < maxLines; j++) {
          const dx = posArr[i*3] - posArr[j*3];
          const dy = posArr[i*3+1] - posArr[j*3+1];
          const dz = posArr[i*3+2] - posArr[j*3+2];
          if (dx*dx + dy*dy + dz*dz < CONNECT_DIST2) {
            linePositions[lineIdx++] = posArr[i*3];
            linePositions[lineIdx++] = posArr[i*3+1];
            linePositions[lineIdx++] = posArr[i*3+2];
            linePositions[lineIdx++] = posArr[j*3];
            linePositions[lineIdx++] = posArr[j*3+1];
            linePositions[lineIdx++] = posArr[j*3+2];
          }
        }
      }
      lineGeo.setDrawRange(0, lineIdx / 3);
      lineGeo.attributes.position.needsUpdate = true;

      // Slow camera drift
      const t = Date.now() * 0.0001;
      camera.position.x = Math.sin(t) * 6;
      camera.position.y = Math.cos(t * 0.8) * 3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}

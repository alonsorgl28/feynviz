'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function WaveDivider() {
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
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.z = 22;

    const N = 90;
    const posArr = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      posArr[i * 3]     = ((i / (N - 1)) - 0.5) * 72;
      posArr[i * 3 + 1] = 0;
      posArr[i * 3 + 2] = 0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

    // Dots
    const dotMat = new THREE.PointsMaterial({
      color: 0x4da3ff,
      size: 0.35,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(geo, dotMat));

    // Line
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x4da3ff,
      transparent: true,
      opacity: 0.18,
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    scene.add(new THREE.Line(lineGeo, lineMat));

    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      for (let i = 0; i < N; i++) {
        const x = posArr[i * 3];
        posArr[i * 3 + 1] =
          Math.sin(x * 0.18 + t * 0.9) * 1.6 +
          Math.sin(x * 0.09 + t * 0.5) * 0.9;
      }

      geo.attributes.position.needsUpdate = true;
      lineGeo.attributes.position.needsUpdate = true;
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

  return <div ref={mountRef} className="w-full h-[180px]" />;
}

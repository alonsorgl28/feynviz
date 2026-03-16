'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Exponential InOut — same curve as TWEEN.Easing.Exponential.InOut
function easeExpInOut(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

interface Tween {
  obj: THREE.Vector3;
  fx: number; fy: number; fz: number; // from
  tx: number; ty: number; tz: number; // to
  start: number;
  dur: number;
}

const TOTAL = 512;
const BASE_DUR = 2200;

function buildPositions(): number[] {
  const pos: number[] = [];

  // 1 — Plane (wave)
  const amtX = 16, amtZ = 32, sepP = 150;
  for (let i = 0; i < TOTAL; i++) {
    const x = (i % amtX) * sepP - ((amtX - 1) * sepP) / 2;
    const z = Math.floor(i / amtX) * sepP - ((amtZ - 1) * sepP) / 2;
    pos.push(x, (Math.sin(x * 0.5) + Math.sin(z * 0.5)) * 200, z);
  }

  // 2 — Cube
  const amt = 8, sepC = 150, offC = ((amt - 1) * sepC) / 2;
  for (let i = 0; i < TOTAL; i++) {
    pos.push(
      (i % amt) * sepC - offC,
      Math.floor((i / amt) % amt) * sepC - offC,
      Math.floor(i / (amt * amt)) * sepC - offC,
    );
  }

  // 3 — Random scatter
  for (let i = 0; i < TOTAL; i++) {
    pos.push(
      Math.random() * 4000 - 2000,
      Math.random() * 4000 - 2000,
      Math.random() * 4000 - 2000,
    );
  }

  // 4 — Sphere
  for (let i = 0; i < TOTAL; i++) {
    const phi   = Math.acos(-1 + (2 * i) / TOTAL);
    const theta = Math.sqrt(TOTAL * Math.PI) * phi;
    pos.push(
      750 * Math.cos(theta) * Math.sin(phi),
      750 * Math.sin(theta) * Math.sin(phi),
      750 * Math.cos(phi),
    );
  }

  return pos;
}

export default function IntroOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible]     = useState(true);
  const [showEnter, setShowEnter] = useState(false);
  const [fading, setFading]       = useState(false);

  // CSS3D scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    let cancelled = false;

    const init = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { CSS3DRenderer, CSS3DSprite } = await import('three/addons/renderers/CSS3DRenderer.js') as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { TrackballControls } = await import('three/addons/controls/TrackballControls.js') as any;

      if (cancelled) return;

      const W = window.innerWidth;
      const H = window.innerHeight;

      const camera = new THREE.PerspectiveCamera(75, W / H, 1, 5000);
      camera.position.set(600, 400, 1500);
      camera.lookAt(0, 0, 0);

      const scene = new THREE.Scene();
      const positions = buildPositions();
      const tweens: Tween[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const objects: any[] = [];

      // Create CSS3D sprite elements
      for (let i = 0; i < TOTAL; i++) {
        const el = document.createElement('div');
        el.style.cssText = `
          width: 9px; height: 9px; border-radius: 50%;
          background: radial-gradient(circle, rgba(140,200,255,0.92) 0%, rgba(77,163,255,0.32) 58%, transparent 100%);
        `;
        const sprite = new CSS3DSprite(el);
        sprite.position.set(
          Math.random() * 4000 - 2000,
          Math.random() * 4000 - 2000,
          Math.random() * 4000 - 2000,
        );
        scene.add(sprite);
        objects.push(sprite);
      }

      // Renderer
      const renderer = new CSS3DRenderer();
      renderer.setSize(W, H);
      renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;';
      container.appendChild(renderer.domElement);

      // Controls
      const controls = new TrackballControls(camera, renderer.domElement);
      controls.rotateSpeed = 0.4;
      controls.noZoom  = true;
      controls.noPan   = true;

      let current = 0;
      let lastTransition = -BASE_DUR * 3 - 1; // fire immediately
      let transitionCount = 0;

      function triggerTransition(now: number) {
        const offset = current * TOTAL * 3;
        for (let i = 0, j = offset; i < TOTAL; i++, j += 3) {
          const pos = objects[i].position as THREE.Vector3;
          const dur = Math.random() * BASE_DUR + BASE_DUR;
          tweens.push({
            obj: pos,
            fx: pos.x, fy: pos.y, fz: pos.z,
            tx: positions[j], ty: positions[j + 1], tz: positions[j + 2],
            start: now,
            dur,
          });
        }
        current = (current + 1) % 4;
        transitionCount++;
        if (transitionCount === 2) setShowEnter(true); // after 2nd shape
        lastTransition = now;
      }

      const animate = () => {
        if (cancelled) return;
        animId = requestAnimationFrame(animate);

        const now = performance.now();

        // Trigger next transition after interval
        if (now - lastTransition > BASE_DUR * 3) {
          triggerTransition(now);
        }

        // Advance tweens
        for (let i = tweens.length - 1; i >= 0; i--) {
          const tw = tweens[i];
          const t = Math.min((now - tw.start) / tw.dur, 1);
          const e = easeExpInOut(t);
          tw.obj.x = tw.fx + (tw.tx - tw.fx) * e;
          tw.obj.y = tw.fy + (tw.ty - tw.fy) * e;
          tw.obj.z = tw.fz + (tw.tz - tw.fz) * e;
          if (t >= 1) tweens.splice(i, 1);
        }

        // Pulse scale
        for (let i = 0; i < objects.length; i++) {
          const obj = objects[i];
          const s = Math.sin((Math.floor(obj.position.x) + now) * 0.002) * 0.3 + 1;
          obj.scale.set(s, s, s);
        }

        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      // Store cleanup
      (container as any)._introCleanup = () => {
        cancelled = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        controls.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    init().catch(console.error);

    return () => {
      (container as any)._introCleanup?.();
    };
  }, []);

  const handleEnter = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 900);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0"
      style={{
        zIndex: 200,
        background: '#0b0b0b',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.9s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      {/* CSS3D canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Logo — centered */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ zIndex: 10, pointerEvents: 'none' }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.28em',
            color: 'rgba(140,200,255,0.55)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Richard P. Feynman
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(42px, 7vw, 80px)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          Six Easy Pieces
        </h1>
      </div>

      {/* Enter button — appears after 2nd transition */}
      <div
        className="absolute inset-x-0 bottom-0 flex justify-center"
        style={{
          paddingBottom: '80px',
          zIndex: 10,
          opacity: showEnter ? 1 : 0,
          transform: showEnter ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
          pointerEvents: showEnter ? 'auto' : 'none',
        }}
      >
        <button
          onClick={handleEnter}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            fontWeight: 600,
            color: '#0b0b0b',
            background: '#4da3ff',
            border: 'none',
            padding: '14px 40px',
            borderRadius: '100px',
            cursor: 'pointer',
          }}
        >
          Begin Exploring →
        </button>
      </div>

      {/* Skip */}
      <button
        onClick={handleEnter}
        style={{
          position: 'absolute',
          top: '28px',
          right: '36px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.22)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textTransform: 'uppercase',
          zIndex: 10,
          padding: '8px',
        }}
      >
        Skip
      </button>
    </div>
  );
}

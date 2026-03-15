'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

const N = 64; // 4x4x4 lattice
const BOX = 4.5;

function makeLattice(): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const coords = [-3, -1, 1, 3];
  for (const x of coords)
    for (const y of coords)
      for (const z of coords)
        pts.push(new THREE.Vector3(x, y, z));
  return pts;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function getAtomColor(temp: number): THREE.Color {
  const t = temp / 100;
  const c = new THREE.Color();
  if (t < 0.35) {
    // cold: dark blue → cyan
    c.setRGB(lerp(0.1, 0.15, t / 0.35), lerp(0.25, 0.65, t / 0.35), lerp(0.9, 1.0, t / 0.35));
  } else if (t < 0.65) {
    // medium: cyan → yellow-green
    const s = (t - 0.35) / 0.3;
    c.setRGB(lerp(0.15, 0.85, s), lerp(0.65, 0.9, s), lerp(1.0, 0.15, s));
  } else {
    // hot: orange → red
    const s = (t - 0.65) / 0.35;
    c.setRGB(lerp(0.85, 1.0, s), lerp(0.9, 0.15, s), lerp(0.15, 0.05, s));
  }
  return c;
}

function getState(temp: number): string {
  if (temp < 30) return 'SÓLIDO';
  if (temp < 65) return 'LÍQUIDO';
  return 'GAS';
}

function getStateDesc(temp: number): string {
  if (temp < 30) return 'Átomos vibran en posición fija — la estructura no se deforma';
  if (temp < 65) return 'Átomos fluyen libremente — mantienen volumen pero no forma';
  return 'Átomos vuelan en todas direcciones — sin estructura ni cohesión';
}

function getStateBadgeClass(temp: number): string {
  if (temp < 30) return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
  if (temp < 65) return 'text-green-400 border-green-500/50 bg-green-500/10';
  return 'text-orange-400 border-orange-500/50 bg-orange-500/10';
}

export default function AtomsScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const tempRef = useRef(15);
  const [temp, setTemp] = useState(15);
  const [clickedAtom, setClickedAtom] = useState<{ speed: number; index: number } | null>(null);

  const handleTempChange = useCallback((v: number) => {
    tempRef.current = v;
    setTemp(v);
    setClickedAtom(null);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050f);
    scene.fog = new THREE.FogExp2(0x05050f, 0.025);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(12, 9, 15);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x6699ff, 3, 40);
    keyLight.position.set(10, 10, 10);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xff6622, 1.5, 30);
    fillLight.position.set(-8, -6, -8);
    scene.add(fillLight);

    // Box — edges only
    const boxGeo = new THREE.BoxGeometry(BOX * 2, BOX * 2, BOX * 2);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x1a3a6a, transparent: true, opacity: 0.7 });
    scene.add(new THREE.LineSegments(edgesGeo, edgesMat));

    // Subtle inner grid planes (optional wireframe on faces)
    const faceGeo = new THREE.BoxGeometry(BOX * 2, BOX * 2, BOX * 2);
    const faceMat = new THREE.MeshBasicMaterial({
      color: 0x0a1a3a,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    scene.add(new THREE.Mesh(faceGeo, faceMat));

    // Instanced atom mesh
    const atomGeo = new THREE.SphereGeometry(0.22, 20, 14);
    const atomMat = new THREE.MeshPhongMaterial({
      color: 0x4488ff,
      shininess: 120,
      emissive: 0x0a1a44,
    });
    const mesh = new THREE.InstancedMesh(atomGeo, atomMat, N);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    // Enable per-instance color
    const colorsArr = new Float32Array(N * 3);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colorsArr, 3);

    // Atom state
    const lattice = makeLattice();
    const positions = lattice.map((v) =>
      v.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.12,
          (Math.random() - 0.5) * 0.12,
          (Math.random() - 0.5) * 0.12
        )
      )
    );
    const velocities = positions.map(
      () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.025,
          (Math.random() - 0.5) * 0.025,
          (Math.random() - 0.5) * 0.025
        )
    );

    const dummy = new THREE.Object3D();

    // Click / raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(mesh);
      if (hits.length > 0) {
        const idx = hits[0].instanceId!;
        const speed = velocities[idx].length();
        setClickedAtom({ speed: Math.round(speed * 10000) / 100, index: idx + 1 });
      } else {
        setClickedAtom(null);
      }
    };
    mount.addEventListener('click', onClick);

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Auto-rotate angle
    let angle = Math.PI / 6;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = tempRef.current;
      const tNorm = t / 100;

      // Camera slow orbit
      angle += 0.003;
      const radius = 18;
      camera.position.x = Math.sin(angle) * radius;
      camera.position.z = Math.cos(angle) * radius;
      camera.position.y = 9;
      camera.lookAt(0, 0, 0);

      // Physics params
      const spring = Math.max(0, 1.0 - tNorm * 2.2); // strong when cold, zero above ~45°
      const speedFactor = 0.008 + tNorm * 0.22;
      const maxSpeed = speedFactor * 2.5;
      const damping = lerp(0.88, 0.975, tNorm);

      const color = getAtomColor(t);

      for (let i = 0; i < N; i++) {
        const pos = positions[i];
        const vel = velocities[i];
        const home = lattice[i];

        // Spring toward home (solid cohesion)
        vel.x += (home.x - pos.x) * spring * 0.06;
        vel.y += (home.y - pos.y) * spring * 0.06;
        vel.z += (home.z - pos.z) * spring * 0.06;

        // Thermal noise
        vel.x += (Math.random() - 0.5) * speedFactor * 0.6;
        vel.y += (Math.random() - 0.5) * speedFactor * 0.6;
        vel.z += (Math.random() - 0.5) * speedFactor * 0.6;

        // Clamp speed
        const spd = vel.length();
        if (spd > maxSpeed) vel.multiplyScalar(maxSpeed / spd);

        // Damping
        vel.multiplyScalar(damping);

        // Move
        pos.add(vel);

        // Bounce off walls
        const r = 0.22;
        if (pos.x > BOX - r) { pos.x = BOX - r; vel.x *= -0.75; }
        if (pos.x < -BOX + r) { pos.x = -BOX + r; vel.x *= -0.75; }
        if (pos.y > BOX - r) { pos.y = BOX - r; vel.y *= -0.75; }
        if (pos.y < -BOX + r) { pos.y = -BOX + r; vel.y *= -0.75; }
        if (pos.z > BOX - r) { pos.z = BOX - r; vel.z *= -0.75; }
        if (pos.z < -BOX + r) { pos.z = -BOX + r; vel.z *= -0.75; }

        // Atom size: slight thermal expansion
        const scale = 0.9 + tNorm * 0.25;
        dummy.position.copy(pos);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, color);
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

      // Dynamic key light color
      keyLight.color.copy(getAtomColor(Math.max(0, t - 15)));
      keyLight.intensity = lerp(2, 4, tNorm);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#05050f] overflow-hidden">
      {/* Three.js canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top-left: chapter info */}
      <div className="absolute top-6 left-8 pointer-events-none">
        <p className="text-[#1a3a6a] text-xs font-mono uppercase tracking-widest mb-1">
          Capítulo 1 — Six Easy Pieces
        </p>
        <h1 className="text-white text-2xl font-light tracking-wide mb-3">
          Átomos en Movimiento
        </h1>
        <p className="text-[#2a4a7a] text-xs font-mono max-w-xs leading-relaxed">
          &ldquo;Si en un cataclismo toda la ciencia fuera destruida, y sólo pudiera transmitirse una sola frase a la siguiente generación, sería: <em>toda materia está formada de átomos.</em>&rdquo;
        </p>
      </div>

      {/* Top-right: state badge */}
      <div className="absolute top-6 right-8 text-right pointer-events-none">
        <div className={`inline-block px-4 py-2 rounded border font-mono text-sm font-bold tracking-widest mb-2 ${getStateBadgeClass(temp)}`}>
          {getState(temp)}
        </div>
        <p className="text-[#2a4060] text-xs font-mono max-w-[220px] leading-relaxed">
          {getStateDesc(temp)}
        </p>
      </div>

      {/* Bottom center: temperature slider */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80">
        <div className="flex justify-between text-xs font-mono mb-2">
          <span className="text-blue-400">0° — FRÍO</span>
          <span className="text-white font-bold tracking-widest">{temp}°</span>
          <span className="text-orange-400">CALIENTE — 100°</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={temp}
          onChange={(e) => handleTempChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right,
              #1a55cc 0%,
              #22aaff ${temp * 0.35}%,
              #44ffaa ${temp * 0.65}%,
              #ffaa22 ${temp * 0.9}%,
              #ff3300 100%)`,
          }}
        />
        <p className="text-center text-[#1a3060] text-xs font-mono mt-2 tracking-widest">
          ARRASTRA PARA CAMBIAR TEMPERATURA
        </p>
      </div>

      {/* Bottom-right: meta */}
      <div className="absolute bottom-10 right-8 text-right font-mono text-xs text-[#1a2a4a] pointer-events-none">
        <p>{N} átomos</p>
        <p>caja 3D — {(BOX * 2).toFixed(0)} u</p>
      </div>

      {/* Back link */}
      <a
        href="/"
        className="absolute bottom-10 left-8 text-[#1a3060] font-mono text-xs uppercase tracking-widest hover:text-blue-400 transition-colors"
      >
        ← capítulos
      </a>

      {/* Clicked atom panel */}
      {clickedAtom && (
        <div className="absolute top-1/2 right-8 -translate-y-1/2 bg-[#08101e] border border-[#1a3a6a] rounded-xl p-5 font-mono text-xs w-48 shadow-2xl">
          <p className="text-[#2255aa] text-[10px] uppercase tracking-widest mb-3">
            Átomo #{clickedAtom.index}
          </p>
          <p className="text-[#3a5a8a] mb-1">Velocidad actual</p>
          <p className="text-3xl font-bold text-white mb-1">
            {clickedAtom.speed}
          </p>
          <p className="text-[#2a4060] mb-4 text-[10px]">unidades / s × 10⁻⁴</p>
          <div className="border-t border-[#0d1a30] pt-3">
            <p className="text-[#1a3050] text-[10px] leading-relaxed">
              La temperatura es la <span className="text-[#4488ff]">velocidad promedio</span> de todos los átomos — no un número abstracto.
            </p>
          </div>
          <button
            onClick={() => setClickedAtom(null)}
            className="mt-4 text-[#1a2a4a] hover:text-white text-[10px] uppercase tracking-widest transition-colors w-full text-center"
          >
            × cerrar
          </button>
        </div>
      )}
    </div>
  );
}

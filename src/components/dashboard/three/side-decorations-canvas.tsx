"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

// ── Color journey: 10 waypoints, one per section ──────────────────────────────
// Left side: violet → teal → gold
const LEFT_COLORS = [
  0x6c5ce7, // 0 Hero
  0x6c5ce7, // 1 Prezentare
  0x7a6ed8, // 2 Cursuri
  0x4a8bc4, // 3 Realizari (mid-transition)
  0x00cec9, // 4 Roadmap
  0x00cec9, // 5 Interviu
  0x00cec9, // 6 Comunitate
  0x5ecba0, // 7 Clasament (teal-gold blend)
  0xfdcb6e, // 8 Portofoliu
  0xffe8b0, // 9 Profil (gold-white)
];

// Right side: teal → violet → gold (crosses over for visual interest)
const RIGHT_COLORS = [
  0x00cec9, // 0 Hero
  0x00cec9, // 1 Prezentare
  0x00cec9, // 2 Cursuri
  0x2abfb8, // 3 Realizari
  0x6c5ce7, // 4 Roadmap (violet cross)
  0x6c5ce7, // 5 Interviu
  0x9966dd, // 6 Comunitate
  0xd4a050, // 7 Clasament
  0xfdcb6e, // 8 Portofoliu
  0xffe8b0, // 9 Profil
];

function getScrollProgress(): number {
  const total = document.body.scrollHeight - window.innerHeight;
  return total > 0 ? Math.min(window.scrollY / total, 1) : 0;
}

function lerpColor(a: THREE.Color, b: THREE.Color, t: number, out: THREE.Color): void {
  out.r = a.r + (b.r - a.r) * t;
  out.g = a.g + (b.g - a.g) * t;
  out.b = a.b + (b.b - a.b) * t;
}

// ── Left: icosahedron + orbiting octahedron + violet particle dust ─────────────

function LeftCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pre-build color objects (reused every frame — no GC pressure)
    const palette = LEFT_COLORS.map((hex) => new THREE.Color(hex));
    const colorA = new THREE.Color();
    const colorB = new THREE.Color();
    const lerpedColor = new THREE.Color();

    let vel = 0;
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      vel = Math.min(Math.abs(window.scrollY - lastScrollY) / 25, 3);
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const W = 250;
    const H = 600;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Shape group (enables rotation-axis tilt without disrupting orbit) ──────
    const shapeGroup = new THREE.Group();
    scene.add(shapeGroup);

    // ── Icosahedron ───────────────────────────────────────────────────────────
    const icosaGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const icosaWire = new THREE.WireframeGeometry(icosaGeo);
    const icosaMat = new THREE.LineBasicMaterial({
      color: 0x6c5ce7,
      opacity: 0.65,
      transparent: true,
    });
    const icosa = new THREE.LineSegments(icosaWire, icosaMat);
    shapeGroup.add(icosa);

    // ── Orbiting octahedron ───────────────────────────────────────────────────
    const octaGeo = new THREE.OctahedronGeometry(0.45, 0);
    const octaWire = new THREE.WireframeGeometry(octaGeo);
    const octaMat = new THREE.LineBasicMaterial({
      color: 0xa29bfe,
      opacity: 0.5,
      transparent: true,
    });
    const octa = new THREE.LineSegments(octaWire, octaMat);
    scene.add(octa); // outside shapeGroup so orbit isn't tilted

    // ── Particle dust ─────────────────────────────────────────────────────────
    const N = 40; // 40 total — initially only ~25 "visible" via opacity
    const pPos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 5;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x6c5ce7,
      size: 0.07,
      opacity: 0.25,
      transparent: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Animation loop ────────────────────────────────────────────────────────
    let t = 0;
    let rafId: number;
    let tiltZ = 0; // smooth-follows tiltTarget

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      vel *= 0.95;
      const spd = 1 + vel * 1.5;
      t += 0.003 * spd;

      // ── Scroll-driven values ──────────────────────────────────────────────
      const progress = getScrollProgress();
      const sectionF = progress * 9;
      const sIdx = Math.min(Math.floor(sectionF), 8);
      const tween = sectionF - sIdx;

      // Color lerp
      colorA.copy(palette[sIdx]);
      colorB.copy(palette[sIdx + 1]);
      lerpColor(colorA, colorB, tween, lerpedColor);
      icosaMat.color.copy(lerpedColor);
      octaMat.color.copy(lerpedColor);
      pMat.color.copy(lerpedColor);

      // Octahedron cross-fade out: full opacity until section 4, then fades
      const octaFade = Math.max(0, 1 - Math.max(0, sectionF - 4) / 3);
      octaMat.opacity = 0.5 * octaFade;

      // ── Scale breathe ─────────────────────────────────────────────────────
      const breathe = 1 + Math.sin(t * 0.8) * 0.04;
      shapeGroup.scale.setScalar(breathe);

      // ── Rotation axis tilt (smooth follows target) ────────────────────────
      const tiltTarget = (sectionF / 9) * 0.55; // up to ~31°
      tiltZ += (tiltTarget - tiltZ) * 0.015;
      shapeGroup.rotation.z = tiltZ;

      // ── Icosahedron rotation ───────────────────────────────────────────────
      icosa.rotation.x += 0.003 * spd;
      icosa.rotation.y += 0.005 * spd;
      icosa.rotation.z += 0.002 * spd;

      // ── Opacity pulse (cheap wireframe glow) ──────────────────────────────
      icosaMat.opacity = 0.55 + Math.sin(t * 1.4) * 0.08;

      // ── Octahedron orbit ──────────────────────────────────────────────────
      octa.position.x = Math.sin(t * 0.8) * 2.2;
      octa.position.y = Math.cos(t * 0.55) * 1.4;
      octa.position.z = Math.cos(t * 0.8) * 0.4;
      octa.rotation.x += 0.01 * spd;
      octa.rotation.y += 0.007 * spd;

      // ── Particle drift + growth ───────────────────────────────────────────
      particles.rotation.y += 0.0008 * spd;
      particles.rotation.x += 0.0003 * spd;
      pMat.opacity = 0.2 + (sectionF / 9) * 0.3; // 0.2 → 0.5 over journey
      pMat.size = 0.06 + (sectionF / 9) * 0.04;  // 0.06 → 0.10

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
      icosaGeo.dispose();
      icosaWire.dispose();
      icosaMat.dispose();
      octaGeo.dispose();
      octaWire.dispose();
      octaMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="aurora-side-canvas"
      style={{
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        maskImage:
          "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
      }}
    />
  );
}

// ── Right: wireframe torus + DNA double helix + teal particle dust ─────────────

function RightCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const palette = RIGHT_COLORS.map((hex) => new THREE.Color(hex));
    const colorA = new THREE.Color();
    const colorB = new THREE.Color();
    const lerpedColor = new THREE.Color();

    let vel = 0;
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      vel = Math.min(Math.abs(window.scrollY - lastScrollY) / 25, 3);
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const W = 250;
    const H = 600;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Torus group (for rotation-axis tilt) ──────────────────────────────────
    const torusGroup = new THREE.Group();
    scene.add(torusGroup);

    // ── Torus ─────────────────────────────────────────────────────────────────
    const torusGeo = new THREE.TorusGeometry(0.9, 0.32, 8, 22);
    const torusWire = new THREE.WireframeGeometry(torusGeo);
    const torusMat = new THREE.LineBasicMaterial({
      color: 0x00cec9,
      opacity: 0.65,
      transparent: true,
    });
    const torus = new THREE.LineSegments(torusWire, torusMat);
    torus.rotation.x = Math.PI * 0.3;
    torusGroup.add(torus);

    // ── DNA Double Helix ──────────────────────────────────────────────────────
    const helixMat = new THREE.LineBasicMaterial({
      color: 0x00cec9,
      opacity: 0.5,
      transparent: true,
    });
    const rungMat = new THREE.LineBasicMaterial({
      color: 0x00cec9,
      opacity: 0.2,
      transparent: true,
    });
    const helixGroup = new THREE.Group();

    const nPts = 80;
    const helixR = 0.55;
    const strand1: THREE.Vector3[] = [];
    const strand2: THREE.Vector3[] = [];

    for (let i = 0; i <= nPts; i++) {
      const pct = i / nPts;
      const ang = pct * Math.PI * 6;
      const y = pct * 4.5 - 2.25;
      strand1.push(new THREE.Vector3(Math.cos(ang) * helixR, y, Math.sin(ang) * helixR));
      strand2.push(
        new THREE.Vector3(
          Math.cos(ang + Math.PI) * helixR,
          y,
          Math.sin(ang + Math.PI) * helixR
        )
      );
    }

    const s1Geo = new THREE.BufferGeometry().setFromPoints(strand1);
    const s2Geo = new THREE.BufferGeometry().setFromPoints(strand2);
    helixGroup.add(new THREE.Line(s1Geo, helixMat));
    helixGroup.add(new THREE.Line(s2Geo, helixMat));

    const rungGeos: THREE.BufferGeometry[] = [];
    for (let i = 0; i <= 18; i++) {
      const pct = i / 18;
      const ang = pct * Math.PI * 6;
      const y = pct * 4.5 - 2.25;
      const rg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.cos(ang) * helixR, y, Math.sin(ang) * helixR),
        new THREE.Vector3(Math.cos(ang + Math.PI) * helixR, y, Math.sin(ang + Math.PI) * helixR),
      ]);
      rungGeos.push(rg);
      helixGroup.add(new THREE.Line(rg, rungMat));
    }

    scene.add(helixGroup);

    // ── Particle dust ─────────────────────────────────────────────────────────
    const N = 40;
    const pPos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 5;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00cec9,
      size: 0.07,
      opacity: 0.25,
      transparent: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Animation loop ────────────────────────────────────────────────────────
    let rafId: number;
    let t = 0;
    let tiltZ = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      vel *= 0.95;
      const spd = 1 + vel * 1.5;
      t += 0.003 * spd;

      // ── Scroll-driven values ──────────────────────────────────────────────
      const progress = getScrollProgress();
      const sectionF = progress * 9;
      const sIdx = Math.min(Math.floor(sectionF), 8);
      const tween = sectionF - sIdx;

      // Color lerp
      colorA.copy(palette[sIdx]);
      colorB.copy(palette[sIdx + 1]);
      lerpColor(colorA, colorB, tween, lerpedColor);
      torusMat.color.copy(lerpedColor);
      helixMat.color.copy(lerpedColor);
      rungMat.color.copy(lerpedColor);
      pMat.color.copy(lerpedColor);

      // Helix cross-fade out: fades from section 5 onward
      const helixFade = Math.max(0, 1 - Math.max(0, sectionF - 5) / 3);
      helixMat.opacity = 0.5 * helixFade;
      rungMat.opacity = 0.2 * helixFade;

      // Torus opacity pulse (cheap glow) — brightens as helix fades
      const torusBase = 0.55 + (1 - helixFade) * 0.2;
      torusMat.opacity = torusBase + Math.sin(t * 1.3) * 0.07;

      // ── Scale breathe ─────────────────────────────────────────────────────
      const breathe = 1 + Math.sin(t * 0.75 + 1.0) * 0.04; // phase offset from left
      torusGroup.scale.setScalar(breathe);

      // ── Rotation axis tilt (tilts opposite direction from left side) ──────
      const tiltTarget = -(sectionF / 9) * 0.45;
      tiltZ += (tiltTarget - tiltZ) * 0.015;
      torusGroup.rotation.z = tiltZ;

      // ── Torus rotation ────────────────────────────────────────────────────
      torus.rotation.y += 0.006 * spd;
      torus.rotation.z += 0.002 * spd;

      // ── Helix bob + spin ──────────────────────────────────────────────────
      helixGroup.rotation.y += 0.008 * spd;
      helixGroup.position.y = Math.sin(Date.now() * 0.0006) * 0.3;

      // ── Particle drift + growth ───────────────────────────────────────────
      particles.rotation.x -= 0.0008 * spd;
      particles.rotation.y += 0.001 * spd;
      pMat.opacity = 0.2 + (sectionF / 9) * 0.3;
      pMat.size = 0.06 + (sectionF / 9) * 0.04;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
      torusGeo.dispose();
      torusWire.dispose();
      torusMat.dispose();
      s1Geo.dispose();
      s2Geo.dispose();
      rungGeos.forEach((g) => g.dispose());
      helixMat.dispose();
      rungMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="aurora-side-canvas-right"
      style={{
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        maskImage:
          "linear-gradient(to left, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to left, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
      }}
    />
  );
}

export function SideDecorationsCanvas() {
  return (
    <>
      <LeftCanvas />
      <RightCanvas />
    </>
  );
}

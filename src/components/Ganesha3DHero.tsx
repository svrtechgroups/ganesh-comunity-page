'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Sparkles, Flame, Heart, RotateCcw, ExternalLink, Ticket } from 'lucide-react';

interface Ganesha3DHeroProps {
  onBookPoojaClick?: () => void;
  onPoojaClick?: () => void;
  onDonateClick?: () => void;
  onNotifyClick?: () => void;
  onRSVPClick?: () => void;
  onRegisterClick?: () => void;
}

export default function Ganesha3DHero({
  onBookPoojaClick,
  onPoojaClick,
  onDonateClick,
  onNotifyClick,
  onRSVPClick,
  onRegisterClick,
}: Ganesha3DHeroProps) {
  const handlePooja = onBookPoojaClick || onPoojaClick;
  const handleRSVP = onRSVPClick || onRegisterClick;
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    // Low power / mobile hardware detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const lowConcurrency = typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile || lowConcurrency || reducedMotion) {
      setIsLowPower(true);
    }
  }, []);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Three.js Scene Setup
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    // Ivory warm foggy atmosphere instead of dark
    scene.fog = new THREE.FogExp2(0xFFF3E0, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);

    // Renderer with alpha for ivory background blending
    const renderer = new THREE.WebGLRenderer({ antialias: !isLowPower, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowPower ? 1 : 1.75));
    renderer.shadowMap.enabled = !isLowPower;
    if (!isLowPower) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    currentMount.appendChild(renderer.domElement);

    // Group for idol assembly
    const idolGroup = new THREE.Group();
    scene.add(idolGroup);

    // Procedural Murti Group (Fallback)
    const proceduralMurtiGroup = new THREE.Group();
    idolGroup.add(proceduralMurtiGroup);

    // Loading Manager for 3D GLTF Asset
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      const percent = Math.round((itemsLoaded / itemsTotal) * 100);
      setLoadingProgress(Math.max(percent, 25));
    };
    loadingManager.onLoad = () => {
      setLoadingProgress(100);
      setTimeout(() => setModelLoaded(true), 300);
    };

    // Custom 3D Model GLTF Loader for Lord Ganesh.glb
    const gltfLoader = new GLTFLoader(loadingManager);
    const modelPath = '/assets/idols/Lord Ganesh.glb';

    gltfLoader.load(
      modelPath,
      (gltf) => {
        // Hide procedural fallback when custom Lord Ganesh.glb model loads
        proceduralMurtiGroup.visible = false;
        const customModel = gltf.scene;

        // Auto-center and normalize model scale using bounding box
        const box = new THREE.Box3().setFromObject(customModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Center model origin
        customModel.position.x += customModel.position.x - center.x;
        customModel.position.y += customModel.position.y - center.y - 0.2;
        customModel.position.z += customModel.position.z - center.z;

        // Fit height into viewport (~2.8 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const desiredScale = 2.8 / maxDim;
          customModel.scale.set(desiredScale, desiredScale, desiredScale);
        }

        customModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = !isLowPower;
            child.receiveShadow = !isLowPower;
            if (child.material && 'envMapIntensity' in child.material) {
              child.material.envMapIntensity = 1.5;
            }
          }
        });

        idolGroup.add(customModel);
        setModelLoaded(true);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(percent);
        }
      },
      (err) => {
        console.warn('Fallback to procedural murti as model load error:', err);
        setModelLoaded(true);
      }
    );

    // 1. Ornate Multi-tiered Base / Pedestal (Lotus Peetham) — warm saffron tones
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.9, 0.35, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xCC4000,
      metalness: 0.5,
      roughness: 0.4,
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = -1.1;
    pedestal.receiveShadow = true;
    proceduralMurtiGroup.add(pedestal);

    const ringGeo = new THREE.TorusGeometry(1.7, 0.06, 16, 64);
    const saffronMat = new THREE.MeshStandardMaterial({
      color: 0xE65C00,
      metalness: 0.8,
      roughness: 0.25,
    });
    const saffronRing = new THREE.Mesh(ringGeo, saffronMat);
    saffronRing.rotation.x = Math.PI / 2;
    saffronRing.position.y = -0.92;
    proceduralMurtiGroup.add(saffronRing);

    // 2. Sculpted Ganesha Form — warm saffron-gold murti
    const bodyGeo = new THREE.SphereGeometry(0.85, 32, 32);
    bodyGeo.scale(1, 1.15, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, saffronMat);
    bodyMesh.position.set(0, -0.15, 0);
    bodyMesh.castShadow = true;
    proceduralMurtiGroup.add(bodyMesh);

    // Crown / Mukut
    const mukutGeo = new THREE.ConeGeometry(0.55, 1.1, 16);
    const mukutMesh = new THREE.Mesh(mukutGeo, saffronMat);
    mukutMesh.position.set(0, 1.45, 0);
    mukutMesh.castShadow = true;
    proceduralMurtiGroup.add(mukutMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.5, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, saffronMat);
    headMesh.position.set(0, 0.75, 0.1);
    headMesh.castShadow = true;
    proceduralMurtiGroup.add(headMesh);

    // Trunk Curve
    const trunkGeo = new THREE.TorusGeometry(0.35, 0.12, 16, 32, Math.PI * 1.2);
    const trunkMesh = new THREE.Mesh(trunkGeo, saffronMat);
    trunkMesh.rotation.z = -Math.PI / 3;
    trunkMesh.rotation.y = Math.PI / 6;
    trunkMesh.position.set(-0.15, 0.45, 0.45);
    proceduralMurtiGroup.add(trunkMesh);

    // Ears
    const earGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 24);
    const leftEar = new THREE.Mesh(earGeo, saffronMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.rotation.y = -Math.PI / 6;
    leftEar.position.set(-0.65, 0.8, 0);
    proceduralMurtiGroup.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.rotation.y = Math.PI / 6;
    rightEar.position.set(0.65, 0.8, 0);
    proceduralMurtiGroup.add(rightEar);

    // Divine Halo Arch
    const haloGeo = new THREE.TorusGeometry(1.2, 0.08, 16, 64);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xFF9A3C,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xFF7A00,
      emissiveIntensity: 0.5,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0.7, -0.4);
    proceduralMurtiGroup.add(haloMesh);

    // 4. Floating Saffron/Marigold Petal Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xFF7A00,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.NormalBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Lighting — warm saffron-infused light setup
    // Bright ambient for the white/ivory background look
    const ambientLight = new THREE.AmbientLight(0xFFF3E0, 1.2);
    scene.add(ambientLight);

    // Warm saffron spotlight from above
    const saffronSpot = new THREE.SpotLight(0xFF7A00, 4);
    saffronSpot.position.set(3, 5, 4);
    saffronSpot.angle = Math.PI / 4;
    saffronSpot.penumbra = 0.8;
    saffronSpot.castShadow = true;
    scene.add(saffronSpot);

    // Orange warm back fill
    const warmBacklight = new THREE.PointLight(0xE65C00, 2.5, 10);
    warmBacklight.position.set(-3, 1, -2);
    scene.add(warmBacklight);

    // Soft front glow — marigold
    const divineGlow = new THREE.PointLight(0xFF9A3C, 2, 6);
    divineGlow.position.set(0, 0.8, 1);
    scene.add(divineGlow);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation of Lord Ganesh
      idolGroup.rotation.y += 0.006;

      // Particle floating loop
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i);
        y += 0.006;
        if (y > 4) y = -3;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Subtle pulse light
      divineGlow.intensity = 1.8 + Math.sin(elapsedTime * 3) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!currentMount) return;
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E0] to-[#FFF8F0] text-[#3D1A00] overflow-hidden flex flex-col justify-between pb-12">
      {/* Saffron Mandala Radial Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#E65C00]/12 via-[#FFF3E0]/60 to-[#FFF8F0] z-0 pointer-events-none" />

      {/* Decorative lotus petal dots — top left & right */}
      <div className="absolute top-16 left-8 w-24 h-24 opacity-10 pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-[#E65C00]">
          <circle cx="50" cy="10" r="5"/><circle cx="85" cy="35" r="5"/><circle cx="85" cy="65" r="5"/>
          <circle cx="50" cy="90" r="5"/><circle cx="15" cy="65" r="5"/><circle cx="15" cy="35" r="5"/>
          <circle cx="50" cy="50" r="10"/>
        </svg>
      </div>
      <div className="absolute top-16 right-8 w-24 h-24 opacity-10 pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-[#E65C00]">
          <circle cx="50" cy="10" r="5"/><circle cx="85" cy="35" r="5"/><circle cx="85" cy="65" r="5"/>
          <circle cx="50" cy="90" r="5"/><circle cx="15" cy="65" r="5"/><circle cx="15" cy="35" r="5"/>
          <circle cx="50" cy="50" r="10"/>
        </svg>
      </div>

      {/* 3D Canvas Mounting Area */}
      <div className="relative z-10 w-full h-[520px] sm:h-[600px] flex items-center justify-center">
        {/* Loading Screen Overlay */}
        {!modelLoaded && (
          <div className="absolute inset-0 z-30 bg-[#FFF8F0]/96 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
            <div className="relative w-20 h-20 rounded-full border-2 border-[#E65C00]/40 flex items-center justify-center bg-[#FFF0E0] overflow-hidden">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#E65C00] animate-spin" style={{ animationDuration: '6s' }} />
              <img src="/assets/favicon.ico" alt="Loading Bappa" className="w-full h-full object-contain rounded-full p-2" />
            </div>
            
            <div className="text-center space-y-2">
              <span className="text-xs font-black font-cinzel text-[#E65C00] tracking-widest uppercase block">
                ENTERING SANCTUM... {loadingProgress}%
              </span>
              
              {/* Saffron Progress Bar */}
              <div className="w-48 h-2 bg-[#FFF0E0] rounded-full border border-[#E65C00]/30 overflow-hidden mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-[#CC4000] via-[#E65C00] to-[#FF7A00] transition-all duration-300" 
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-[#6B3A2A]">Streaming 3D Bappa Murti &amp; Devotional Rays</p>
            </div>
          </div>
        )}

        <div ref={mountRef} className="w-full h-full pointer-events-none select-none" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 text-center space-y-6 -mt-8">
        {/* Presenter / Association Banner */}
        <div className="inline-flex items-center gap-2 bg-white/80 border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-md">
          <Sparkles className="w-4 h-4 text-[#E65C00] animate-pulse" />
          <span className="text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
            Welcome to Mana Indian Telugu Roots Abroad (MITRA UK)
          </span>
        </div>

        {/* Main Title */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-decorative tracking-wider leading-tight gold-foil-text drop-shadow-[0_2px_12px_rgba(230,92,0,0.2)]">
            THE BIGGEST MAHA GANAPATHI
          </h1>
          <h2 className="text-xl sm:text-3xl font-bold font-cinzel text-[#3D1A00] tracking-widest uppercase">
            LONDON GANESH MAHOTSAV 2026
          </h2>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {handlePooja || onDonateClick || handleRSVP ? (
            // ── Event page: show enabled action buttons ───────────────
            <>
              {handleRSVP && (
                <button
                  onClick={handleRSVP}
                  className="gold-button px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider flex items-center gap-2.5 hover:scale-105 transition-all shadow-xl"
                >
                  <Ticket className="w-5 h-5 text-white" />
                  <span>Register / RSVP Now</span>
                </button>
              )}

              {handlePooja && (
                <button
                  onClick={handlePooja}
                  className="gold-button px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider flex items-center gap-2.5 hover:scale-105 transition-all shadow-xl"
                >
                  <Flame className="w-5 h-5 fill-current text-white" />
                  <span>Make Event Payment</span>
                </button>
              )}

              {onDonateClick && (
                <button
                  onClick={onDonateClick}
                  className="maroon-button px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all border border-[#E65C00]/30"
                >
                  <Heart className="w-5 h-5 text-[#FF9A3C] fill-current" />
                  <span>Make a Booking</span>
                </button>
              )}
            </>
          ) : (
            // ── Home page: show WhatsApp + View Event ─────────────────────────
            <>
            <Link
                href="/ganesh-event-2026"
                className="maroon-button px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all border border-[#E65C00]/30"
              >
                <ExternalLink className="w-5 h-5 text-[#FF9A3C]" />
                <span>View Event</span>
              </Link>
              
              <a
                href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider flex items-center gap-2.5 hover:scale-105 transition-all"
              >
                <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                <span>Join WhatsApp Group</span>
              </a>

              
            </>
          )}
        </div>

        {/* Scroll Cue Bell */}
        <div className="pt-6 flex justify-center">
          <a
            href="#ritual-clock"
            className="inline-flex flex-col items-center gap-2 text-[#E65C00] hover:text-[#CC4000] transition-colors group"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest">Scroll to Enter Sanctum</span>
            <div className="w-10 h-10 rounded-full border border-[#E65C00]/40 flex items-center justify-center group-hover:scale-110 group-hover:border-[#E65C00] transition-all bg-white/60">
              <span className="text-lg animate-bounce">🔔</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

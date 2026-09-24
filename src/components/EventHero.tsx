'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  Sparkles, 
  Flame, 
  Heart, 
  ExternalLink, 
  Calendar, 
  Play, 
  RotateCw, 
  Award, 
  Feather, 
  Layers, 
  Compass, 
  Video,
  Volume2
} from 'lucide-react';
import { EventHeroConfig } from '@/types/event-template';

export interface EventHeroProps {
  config?: Partial<EventHeroConfig>;
  eventSlug?: string;
  mode?: 'home' | 'event';
  onBookPoojaClick?: () => void;
  onDonateClick?: () => void;
  onRsvpClick?: () => void;
  onNotifyClick?: () => void;
}

const DEFAULT_CONFIG: EventHeroConfig = {
  heroType: '3d-model',
  modelUrl: '/assets/idols/Lord Ganesh.glb',
  modelScale: 2.8,
  proceduralFallback: 'none',
  bannerImageUrl: '/assets/poster.jpg',
  presenterBadge: 'Welcome to Mana Indian Telugu Roots Abroad (MITRA UK)',
  title: 'THE BIGGEST MAHA GANAPATHI',
  subtitle: 'LONDON GANESH MAHOTSAV 2026',
  tagline: 'Streaming 3D Bappa Murti & Devotional Rays',
  loadingText: 'ENTERING SANCTUM...',
  scrollCueText: 'Scroll to Enter Sanctum',
  primaryColor: '#E65C00',
  accentColor: '#CC4000',
  backgroundColor: '#FFF8F0',
  primaryCta: {
    label: 'Book Pooja / Seva',
    action: 'pooja',
  },
  secondaryCta: {
    label: 'Make Donation',
    action: 'donation',
  },
  whatsAppUrl: 'https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd',
};

export default function EventHero({
  config: userConfig,
  eventSlug = 'ganesh-event-2026',
  mode = 'event',
  onBookPoojaClick,
  onDonateClick,
  onRsvpClick,
  onNotifyClick,
}: EventHeroProps) {
  const cfg: EventHeroConfig = { ...DEFAULT_CONFIG, ...userConfig };
  const isHomeMode = mode === 'home';

  // Background aura, particles, and corner motifs flags
  const shouldShowParticles = cfg.showParticles === true || (cfg.showParticles !== false && cfg.proceduralFallback !== 'none');
  const shouldShowCornerMotifs = cfg.showCornerMotifs === true || (cfg.showCornerMotifs !== false && cfg.proceduralFallback !== 'none');
  const shouldShowRadialAura = cfg.showRadialAura === true || (cfg.showRadialAura !== false && cfg.proceduralFallback !== 'none');

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

  // Three.js Scene Setup — Exact Sanctuary Setup with Floating Devotional Dust & Warm Lights
  useEffect(() => {
    if (cfg.heroType !== '3d-model') return;

    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    // Warm ivory atmospheric fog
    scene.fog = new THREE.FogExp2(0xFFF3E0, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isLowPower,
      alpha: true,
      powerPreference: 'high-performance',
    });
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

    const saffronMat = new THREE.MeshStandardMaterial({
      color: 0xE65C00,
      metalness: 0.8,
      roughness: 0.25,
    });

    if (cfg.proceduralFallback === 'pedestal' || cfg.proceduralFallback === 'ganesha') {
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
      const saffronRing = new THREE.Mesh(ringGeo, saffronMat);
      saffronRing.rotation.x = Math.PI / 2;
      saffronRing.position.y = -0.92;
      proceduralMurtiGroup.add(saffronRing);
    }

    if (cfg.proceduralFallback === 'ganesha') {
      // Sculpted Ganesha Form — warm saffron-gold murti
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
    }

    // 2. Floating Devotional Petal / Gold Dust Particles (Controlled by showParticles / proceduralFallback)
    const shouldShowParticles = cfg.showParticles === true || (cfg.showParticles !== false && cfg.proceduralFallback !== 'none');
    const particleCount = isLowPower ? 40 : 200;
    let particleGeo: THREE.BufferGeometry | null = null;

    if (shouldShowParticles) {
      particleGeo = new THREE.BufferGeometry();
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
    }

    // 3. Custom 3D Model GLTF Loader
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      const percent = Math.round((itemsLoaded / itemsTotal) * 100);
      setLoadingProgress(Math.max(percent, 25));
    };
    loadingManager.onLoad = () => {
      setLoadingProgress(100);
      setTimeout(() => setModelLoaded(true), 300);
    };

    const gltfLoader = new GLTFLoader(loadingManager);
    const modelPath = cfg.modelUrl || '/assets/idols/Lord Ganesh.glb';

    gltfLoader.load(
      modelPath,
      (gltf) => {
        proceduralMurtiGroup.visible = false;
        const customModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(customModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        customModel.position.x += customModel.position.x - center.x;
        customModel.position.y += customModel.position.y - center.y - 0.2;
        customModel.position.z += customModel.position.z - center.z;

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const desiredScale = (cfg.modelScale || 2.8) / maxDim;
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

    // 4. Warm Saffron-Infused Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xFFF3E0, 1.2);
    scene.add(ambientLight);

    const saffronSpot = new THREE.SpotLight(0xFF7A00, 4);
    saffronSpot.position.set(3, 5, 4);
    saffronSpot.angle = Math.PI / 4;
    saffronSpot.penumbra = 0.8;
    saffronSpot.castShadow = !isLowPower;
    scene.add(saffronSpot);

    const warmBacklight = new THREE.PointLight(0xE65C00, 2.5, 10);
    warmBacklight.position.set(-3, 1, -2);
    scene.add(warmBacklight);

    const divineGlow = new THREE.PointLight(0xFF9A3C, 2, 6);
    divineGlow.position.set(0, 0.8, 1);
    scene.add(divineGlow);

    // 5. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation of idol
      idolGroup.rotation.y += 0.006;

      // Particle floating loop (if active)
      if (particleGeo) {
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          let y = posAttr.getY(i);
          y += 0.006;
          if (y > 4) y = -3;
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      }

      // Subtle breathing pulse light
      divineGlow.intensity = 1.8 + Math.sin(elapsedTime * 3) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

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
      renderer.dispose();
    };
  }, [cfg.heroType, cfg.heroVariant, cfg.modelUrl, cfg.modelScale, cfg.proceduralFallback, cfg.showParticles, isLowPower]);

  // Hero Variant Resolution (4 variants per heroType)
  const variant = cfg.heroVariant || (
    cfg.heroType === '3d-model' ? '3d-sanctum' :
    cfg.heroType === 'image' ? 'image-split' :
    'video-split'
  );

  // CTA Click Helper
  const handleCtaClick = (cta: typeof cfg.primaryCta) => {
    if (cta.action === 'pooja' && onBookPoojaClick) {
      onBookPoojaClick();
    } else if (cta.action === 'donation' && onDonateClick) {
      onDonateClick();
    } else if (cta.action === 'rsvp' && onRsvpClick) {
      onRsvpClick();
    } else if (cta.action === 'whatsapp' && cfg.whatsAppUrl) {
      window.open(cfg.whatsAppUrl, '_blank');
    } else if (cta.linkUrl) {
      window.location.href = cta.linkUrl;
    }
  };

  // CTA Render Helper
  const renderCtas = (align: 'center' | 'start' = 'center') => {
    const justifyClass = align === 'start' ? 'justify-start' : 'justify-center';
    return (
      <div className={`flex flex-wrap items-center ${justifyClass} gap-4 pt-2`}>
        {isHomeMode ? (
          <>
            <Link
              href={`/${eventSlug}`}
              className="maroon-button px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all border border-[#E65C00]/30"
            >
              <ExternalLink className="w-5 h-5 text-[#FF9A3C]" />
              <span>View Event</span>
            </Link>

            {cfg.whatsAppUrl && (
              <a
                href={cfg.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider flex items-center gap-2.5 hover:scale-105 transition-all shadow-md"
              >
                <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                <span>Join WhatsApp Group</span>
              </a>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => handleCtaClick(cfg.primaryCta)}
              className="gold-button px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider flex items-center gap-2.5 hover:scale-105 transition-all shadow-md"
            >
              {cfg.primaryCta.action === 'pooja' && <Flame className="w-5 h-5 fill-current text-white" />}
              {cfg.primaryCta.action === 'rsvp' && <Calendar className="w-5 h-5 text-white" />}
              {cfg.primaryCta.action === 'donation' && <Heart className="w-5 h-5 text-white" />}
              <span>{cfg.primaryCta.label}</span>
            </button>

            <button
              onClick={() => handleCtaClick(cfg.secondaryCta)}
              className="maroon-button px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all border border-[#E65C00]/30"
            >
              {cfg.secondaryCta.action === 'donation' && <Heart className="w-5 h-5 text-[#FF9A3C] fill-current" />}
              {cfg.secondaryCta.action === 'pooja' && <Flame className="w-5 h-5 text-[#FF9A3C] fill-current" />}
              {cfg.secondaryCta.action === 'whatsapp' && (
                <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
              )}
              <span>{cfg.secondaryCta.label}</span>
            </button>
          </>
        )}
      </div>
    );
  };

  // Loading Overlay for 3D Model
  const renderLoadingOverlay = () => (
    !modelLoaded && (
      <div className="absolute inset-0 z-30 bg-[#FFF8F0]/96 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
        <div className="relative w-20 h-20 rounded-full border-2 border-[#E65C00]/40 flex items-center justify-center bg-[#FFF0E0] overflow-hidden">
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-[#E65C00] animate-spin"
            style={{ animationDuration: '6s' }}
          />
          <img
            src="/assets/favicon.ico"
            alt="Loading Sanctum"
            className="w-full h-full object-contain rounded-full p-2"
          />
        </div>

        <div className="text-center space-y-2">
          <span className="text-xs font-black font-cinzel text-[#E65C00] tracking-widest uppercase block">
            {cfg.loadingText || 'ENTERING SANCTUM...'} {loadingProgress}%
          </span>
          <div className="w-48 h-2 bg-[#FFF0E0] rounded-full border border-[#E65C00]/30 overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-[#CC4000] via-[#E65C00] to-[#FF7A00] transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-[#6B3A2A]">{cfg.tagline}</p>
        </div>
      </div>
    )
  );

  /* ═══════════════════════════════════════════════════════════════════════
     3D MODEL VARIANTS
     ═══════════════════════════════════════════════════════════════════════ */

  // 3D Variant 1: Classic Divine Sanctum
  const render3dSanctum = () => (
    <>
      <div className="relative z-10 w-full h-[520px] sm:h-[600px] flex items-center justify-center">
        {renderLoadingOverlay()}
        <div ref={mountRef} className="w-full h-full pointer-events-none select-none" />
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-4 text-center space-y-6 -mt-8">
        <div className="inline-flex items-center gap-2 bg-white/80 border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-md">
          <Sparkles className="w-4 h-4 text-[#E65C00] animate-pulse" />
          <span className="text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
            {cfg.presenterBadge}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-decorative tracking-wider leading-tight gold-foil-text drop-shadow-[0_2px_12px_rgba(230,92,0,0.2)]">
            {cfg.title}
          </h1>
          <h2 className="text-xl sm:text-3xl font-bold font-cinzel text-[#3D1A00] tracking-widest uppercase">
            {cfg.subtitle}
          </h2>
        </div>

        {renderCtas('center')}
      </div>
    </>
  );

  // 3D Variant 2: Modern 2-Column Split Interactive Stage
  const render3dSplit = () => (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full my-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/90 border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-[#E65C00] animate-pulse" />
            <span className="text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
              {cfg.presenterBadge}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-decorative tracking-wider leading-tight gold-foil-text drop-shadow-[0_2px_12px_rgba(230,92,0,0.15)]">
              {cfg.title}
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-[#3D1A00] tracking-wider uppercase">
              {cfg.subtitle}
            </h2>
          </div>

          {cfg.tagline && (
            <p className="text-sm sm:text-base text-[#6B3A2A] leading-relaxed max-w-xl font-medium">
              {cfg.tagline}
            </p>
          )}

          {/* 3D Features Pill */}
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-[#FFF0E0] border border-[#E65C00]/30 px-3 py-1 rounded-full text-[#E65C00] font-bold">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Interactive 3D Stage</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-semibold shadow-sm">
              <Compass className="w-3.5 h-3.5 text-[#E65C00]" />
              <span>Full 360° Inspection</span>
            </span>
          </div>

          {renderCtas('start')}
        </div>

        {/* Right Column: Framed 3D Stage */}
        <div className="lg:col-span-5">
          <div className="relative group max-w-md mx-auto lg:max-w-none">
            <div
              className="absolute -inset-3 rounded-3xl opacity-35 blur-2xl transition-all group-hover:opacity-50"
              style={{ backgroundColor: cfg.primaryColor || '#E65C00' }}
            />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/80 aspect-[1/1] bg-gradient-to-b from-[#FFF8F0] to-[#FFF0E0]">
              {renderLoadingOverlay()}
              <div ref={mountRef} className="w-full h-full pointer-events-none select-none" />
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="bg-white/95 backdrop-blur-sm text-[#E65C00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow border border-[#E65C00]/20 flex items-center gap-1.5">
                  <RotateCw className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
                  <span>3D Interactive Stage</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 3D Variant 3: Exhibition Pedestal / Spotlight Showcase
  const render3dPedestal = () => (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center my-auto">
      {/* Overhead Spotlight Beam Effect */}
      <div
        className="absolute top-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${cfg.primaryColor || '#E65C00'}, transparent 70%)`,
        }}
      />

      {/* Floating Header */}
      <div className="text-center space-y-2 mb-2 z-20">
        <div className="inline-flex items-center gap-2 bg-white/90 border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-sm">
          <Award className="w-4 h-4 text-[#E65C00]" />
          <span className="text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
            {cfg.presenterBadge}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider uppercase">
          {cfg.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B3A2A] font-semibold tracking-wider">
          {cfg.subtitle}
        </p>
      </div>

      {/* 3D Model with Circular Pedestal Disc and Side HUDs */}
      <div className="relative w-full h-[460px] sm:h-[520px] flex items-center justify-center">
        {renderLoadingOverlay()}
        
        {/* Left Floating HUD Tag */}
        <div className="hidden md:flex flex-col gap-2 absolute left-6 top-1/3 z-20">
          <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#E65C00]/25 shadow-lg max-w-[200px] space-y-1">
            <span className="text-[10px] font-black uppercase text-[#E65C00] tracking-wider block">
              Artisan Craft
            </span>
            <p className="text-[11px] text-[#6B3A2A] leading-tight">
              Hand-sculpted eco-friendly natural clay with gold leaf adornment.
            </p>
          </div>
        </div>

        {/* Right Floating HUD Tag */}
        <div className="hidden md:flex flex-col gap-2 absolute right-6 top-1/3 z-20">
          <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#E65C00]/25 shadow-lg max-w-[200px] space-y-1 text-right">
            <span className="text-[10px] font-black uppercase text-[#E65C00] tracking-wider block">
              Sanctum Presence
            </span>
            <p className="text-[11px] text-[#6B3A2A] leading-tight">
              Full 360° rotational geometry rendered with high-fidelity PBR lighting.
            </p>
          </div>
        </div>

        {/* 3D Canvas */}
        <div ref={mountRef} className="w-full h-full pointer-events-none select-none z-10" />

        {/* Glowing Pedestal Disc beneath model */}
        <div
          className="absolute bottom-6 w-80 sm:w-96 h-10 rounded-full blur-md opacity-40 z-0"
          style={{
            background: `radial-gradient(ellipse at center, ${cfg.primaryColor || '#E65C00'}, transparent 75%)`,
          }}
        />
        <div className="absolute bottom-8 w-64 sm:w-80 h-3 rounded-full border border-[#E65C00]/40 z-0 shadow-inner" />
      </div>

      {/* Action Buttons Below Pedestal */}
      <div className="relative z-20 text-center pt-2">
        {renderCtas('center')}
      </div>
    </div>
  );

  // 3D Variant 4: Holographic Island / Celestial Rings
  const render3dFloating = () => (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center my-auto">
      {/* Concentric Rotating Holographic Rings */}
      <div className="relative w-full h-[480px] sm:h-[540px] flex items-center justify-center">
        {renderLoadingOverlay()}

        {/* Dual Concentric Rings */}
        <div
          className="absolute w-80 h-80 rounded-full border-2 border-dashed border-[#E65C00]/35 animate-spin pointer-events-none"
          style={{ animationDuration: '40s' }}
        />
        <div
          className="absolute w-96 h-96 rounded-full border border-dotted border-[#E65C00]/25 animate-spin pointer-events-none"
          style={{ animationDuration: '60s', animationDirection: 'reverse' }}
        />

        {/* Floating Feature Pills */}
        <div className="absolute top-12 left-8 sm:left-24 z-20 animate-bounce" style={{ animationDuration: '4s' }}>
          <span className="bg-white/90 backdrop-blur-sm border border-[#E65C00]/30 text-[#E65C00] text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Sacred Darshan</span>
          </span>
        </div>

        <div className="absolute top-12 right-8 sm:right-24 z-20 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
          <span className="bg-white/90 backdrop-blur-sm border border-[#E65C00]/30 text-[#E65C00] text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3" />
            <span>Maha Aarti Live</span>
          </span>
        </div>

        <div ref={mountRef} className="w-full h-full pointer-events-none select-none z-10" />
      </div>

      <div className="relative z-20 max-w-4xl mx-auto text-center space-y-4 -mt-10">
        <h1 className="text-4xl sm:text-6xl font-black font-decorative gold-foil-text tracking-wider">
          {cfg.title}
        </h1>
        <h2 className="text-base sm:text-xl font-bold font-cinzel text-[#3D1A00] tracking-widest uppercase">
          {cfg.subtitle}
        </h2>
        {renderCtas('center')}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════
     IMAGE HERO VARIANTS
     ═══════════════════════════════════════════════════════════════════════ */

  // Image Variant 1: Modern 2-Column Split Stage
  const renderImageSplit = () => (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full my-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/90 border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-[#E65C00] animate-pulse" />
            <span className="text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
              {cfg.presenterBadge}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-decorative tracking-wider leading-tight gold-foil-text drop-shadow-[0_2px_12px_rgba(230,92,0,0.15)]">
              {cfg.title}
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-[#3D1A00] tracking-wider uppercase">
              {cfg.subtitle}
            </h2>
          </div>

          {cfg.tagline && (
            <p className="text-sm sm:text-base text-[#6B3A2A] leading-relaxed max-w-xl font-medium">
              {cfg.tagline}
            </p>
          )}

          {renderCtas('start')}
        </div>

        <div className="lg:col-span-5">
          <div className="relative group max-w-md mx-auto lg:max-w-none">
            <div
              className="absolute -inset-3 rounded-3xl opacity-35 blur-2xl transition-all group-hover:opacity-50"
              style={{ backgroundColor: cfg.primaryColor || '#E65C00' }}
            />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/80 aspect-[4/3] sm:aspect-[16/11] bg-white">
              <img
                src={cfg.bannerImageUrl || '/assets/poster.jpg'}
                alt={cfg.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3D1A00]/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <span className="bg-white/95 backdrop-blur-sm text-[#3D1A00] text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                  {cfg.subtitle || cfg.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Image Variant 2: Cinematic Fullscreen Full-Bleed Banner
  const renderImageFullscreen = () => (
    <div className="relative z-10 w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Full-bleed background image with dark cinematic vignette */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-95 scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url('${cfg.bannerImageUrl || '/assets/poster.jpg'}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/80" />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${cfg.primaryColor || '#E65C00'}, transparent 60%)`,
        }}
      />

      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center space-y-6 py-16 text-white">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
            {cfg.presenterBadge}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-cinzel tracking-wider uppercase gold-foil-text drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            {cfg.title}
          </h1>
          <h2 className="text-lg sm:text-2xl font-bold tracking-widest text-slate-200 uppercase font-cinzel">
            {cfg.subtitle}
          </h2>
        </div>

        {cfg.tagline && (
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {cfg.tagline}
          </p>
        )}

        <div className="pt-2">
          {renderCtas('center')}
        </div>
      </div>
    </div>
  );

  // Image Variant 3: Elevated Floating 3D Showcase Card
  const renderImageCardShowcase = () => (
    <div className="relative z-20 max-w-5xl mx-auto px-4 py-12 w-full my-auto">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 bg-white/90 border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-sm">
          <Sparkles className="w-4 h-4 text-[#E65C00]" />
          <span className="text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
            {cfg.presenterBadge}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider uppercase">
          {cfg.title}
        </h1>
      </div>

      {/* Floating 3D Showcase Card */}
      <div className="temple-card rounded-3xl overflow-hidden shadow-2xl border-2 border-white/80 bg-white dark:bg-slate-900 group hover:scale-[1.01] transition-transform duration-500">
        <div className="relative aspect-[21/9] sm:aspect-[21/8] w-full overflow-hidden">
          <img
            src={cfg.bannerImageUrl || '/assets/poster.jpg'}
            alt={cfg.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap justify-between items-end gap-2 text-white">
            <span className="text-lg sm:text-2xl font-black uppercase font-cinzel text-white drop-shadow">
              {cfg.subtitle}
            </span>
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
              Official Showcase
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900">
          <p className="text-xs sm:text-sm text-[#6B3A2A] dark:text-slate-300 max-w-lg leading-relaxed text-center sm:text-left font-medium">
            {cfg.tagline || 'Experience vibrant cultural celebrations, music, and community spirit across the UK diaspora.'}
          </p>
          <div className="shrink-0">
            {renderCtas('start')}
          </div>
        </div>
      </div>
    </div>
  );

  // Image Variant 4: Modern Editorial Magazine Header
  const renderImageEditorial = () => (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full my-auto">
      <div className="border-b-2 border-[#E65C00]/20 pb-4 mb-8 flex flex-wrap justify-between items-center gap-3">
        <span className="text-xs font-black uppercase font-cinzel text-[#E65C00] tracking-widest">
          MITRA UK CULTURAL SPOTLIGHT
        </span>
        <span className="text-xs text-[#6B3A2A] font-semibold">
          {cfg.presenterBadge}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-6 text-left">
          <h1 className="text-4xl sm:text-6xl font-black font-cinzel text-[#3D1A00] tracking-tight leading-none uppercase">
            {cfg.title}
          </h1>

          <div
            className="w-16 h-1"
            style={{ backgroundColor: cfg.primaryColor || '#E65C00' }}
          />

          <h2 className="text-lg sm:text-xl font-bold font-cinzel text-[#E65C00] tracking-wider uppercase">
            {cfg.subtitle}
          </h2>

          <p className="text-xs sm:text-base text-slate-700 leading-relaxed font-serif italic border-l-2 border-[#E65C00]/40 pl-4">
            {cfg.tagline || 'A premier gathering of cultural excellence, heritage recitals, and diaspora harmony.'}
          </p>

          {renderCtas('start')}
        </div>

        <div className="lg:col-span-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-white group">
            <img
              src={cfg.bannerImageUrl || '/assets/poster.jpg'}
              alt={cfg.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 bg-white/90 text-[#3D1A00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
              Featured Event
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════
     VIDEO HERO VARIANTS
     ═══════════════════════════════════════════════════════════════════════ */

  // Video Variant 1: Cinematic Fullscreen Backdrop Loop
  const renderVideoCinema = () => (
    <div className="relative z-10 w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
      {cfg.videoUrl ? (
        <video
          src={cfg.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-75 scale-105"
          style={{ backgroundImage: `url('${cfg.bannerImageUrl || '/assets/poster.jpg'}')` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/80" />

      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center space-y-6 py-16 text-white">
        <div className="inline-flex items-center gap-2 bg-red-600/90 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
          <Video className="w-3.5 h-3.5 animate-pulse" />
          <span>CINEMATIC TEASER &amp; LIVE BROADCAST</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black font-cinzel tracking-wider uppercase gold-foil-text drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            {cfg.title}
          </h1>
          <h2 className="text-lg sm:text-2xl font-bold tracking-widest text-slate-200 uppercase font-cinzel">
            {cfg.subtitle}
          </h2>
        </div>

        {cfg.tagline && (
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {cfg.tagline}
          </p>
        )}

        <div className="pt-2">
          {renderCtas('center')}
        </div>
      </div>
    </div>
  );

  // Video Variant 2: Modern 2-Column Split Video Stage
  const renderVideoSplit = () => (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full my-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/90 border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-[#E65C00]" />
            <span className="text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
              {cfg.presenterBadge}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-decorative tracking-wider leading-tight gold-foil-text drop-shadow-[0_2px_12px_rgba(230,92,0,0.15)]">
              {cfg.title}
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-[#3D1A00] tracking-wider uppercase">
              {cfg.subtitle}
            </h2>
          </div>

          {cfg.tagline && (
            <p className="text-sm sm:text-base text-[#6B3A2A] leading-relaxed max-w-xl font-medium">
              {cfg.tagline}
            </p>
          )}

          {renderCtas('start')}
        </div>

        <div className="lg:col-span-5">
          <div className="relative group max-w-md mx-auto lg:max-w-none">
            <div
              className="absolute -inset-3 rounded-3xl opacity-35 blur-2xl transition-all group-hover:opacity-50"
              style={{ backgroundColor: cfg.primaryColor || '#E65C00' }}
            />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/80 aspect-[16/9] bg-slate-950 flex items-center justify-center">
              {cfg.videoUrl ? (
                <video
                  src={cfg.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={cfg.bannerImageUrl || '/assets/poster.jpg'}
                    alt={cfg.title}
                    className="w-full h-full object-cover brightness-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-xl animate-pulse">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 text-amber-400" />
                <span>HD Video Teaser</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Video Variant 3: Ambient Theater Screen
  const renderVideoTheater = () => (
    <div className="relative z-20 max-w-5xl mx-auto px-4 py-10 w-full my-auto text-center space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-white/90 border border-[#E65C00]/30 px-4 py-1.5 rounded-full shadow-sm">
          <Sparkles className="w-4 h-4 text-[#E65C00]" />
          <span className="text-xs font-extrabold text-[#E65C00] uppercase tracking-wider">
            {cfg.presenterBadge}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider uppercase">
          {cfg.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B3A2A] font-semibold tracking-wider">
          {cfg.subtitle}
        </p>
      </div>

      {/* Ambilight Theater Container */}
      <div className="relative group max-w-3xl mx-auto">
        <div
          className="absolute -inset-4 rounded-3xl opacity-40 blur-3xl transition-all group-hover:opacity-60"
          style={{ backgroundColor: cfg.primaryColor || '#E65C00' }}
        />
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[16/9] bg-black">
          {cfg.videoUrl ? (
            <video
              src={cfg.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={cfg.bannerImageUrl || '/assets/poster.jpg'}
                alt={cfg.title}
                className="w-full h-full object-cover brightness-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {renderCtas('center')}
    </div>
  );

  // Video Variant 4: 21:9 Cinema Scope Strip
  const renderVideoBannerStrip = () => (
    <div className="relative z-20 w-full py-8 my-auto space-y-6">
      <div className="max-w-7xl mx-auto px-4 text-center sm:text-left flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-[#E65C00] tracking-widest block">
            {cfg.presenterBadge}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black font-cinzel uppercase text-[#3D1A00]">
            {cfg.title}
          </h1>
        </div>
        <div>
          {renderCtas('start')}
        </div>
      </div>

      {/* 21:9 Panoramic Cinema Scope Bar */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] max-h-[460px] overflow-hidden border-y-4 border-white shadow-2xl bg-black">
        {cfg.videoUrl ? (
          <video
            src={cfg.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={cfg.bannerImageUrl || '/assets/poster.jpg'}
            alt={cfg.title}
            className="w-full h-full object-cover brightness-85"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none" />
        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end text-white pointer-events-none">
          <span className="text-xl sm:text-3xl font-black font-cinzel drop-shadow-md">
            {cfg.subtitle}
          </span>
          <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            CinemaScope Preview
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E0] to-[#FFF8F0] text-[#3D1A00] overflow-hidden flex flex-col justify-between pb-12">
      {/* Saffron Mandala Radial Background */}
      {shouldShowRadialAura && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#E65C00]/12 via-[#FFF3E0]/60 to-[#FFF8F0] z-0 pointer-events-none" />
      )}

      {/* Decorative lotus petal dots — top left & right */}
      {shouldShowCornerMotifs && (
        <>
          <div className="absolute top-16 left-8 w-24 h-24 opacity-10 pointer-events-none z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#E65C00]">
              <circle cx="50" cy="10" r="5" />
              <circle cx="85" cy="35" r="5" />
              <circle cx="85" cy="65" r="5" />
              <circle cx="50" cy="90" r="5" />
              <circle cx="15" cy="65" r="5" />
              <circle cx="15" cy="35" r="5" />
              <circle cx="50" cy="50" r="10" />
            </svg>
          </div>
          <div className="absolute top-16 right-8 w-24 h-24 opacity-10 pointer-events-none z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-[#E65C00]">
              <circle cx="50" cy="10" r="5" />
              <circle cx="85" cy="35" r="5" />
              <circle cx="85" cy="65" r="5" />
              <circle cx="50" cy="90" r="5" />
              <circle cx="15" cy="65" r="5" />
              <circle cx="15" cy="35" r="5" />
              <circle cx="50" cy="50" r="10" />
            </svg>
          </div>
        </>
      )}

      {/* Dispatch to selected Hero Type and Variant */}
      {cfg.heroType === '3d-model' && (
        variant === '3d-split' ? render3dSplit() :
        variant === '3d-pedestal' ? render3dPedestal() :
        variant === '3d-floating' ? render3dFloating() :
        render3dSanctum()
      )}

      {cfg.heroType === 'image' && (
        variant === 'image-fullscreen' ? renderImageFullscreen() :
        variant === 'image-card-showcase' ? renderImageCardShowcase() :
        variant === 'image-editorial' ? renderImageEditorial() :
        renderImageSplit()
      )}

      {cfg.heroType === 'video' && (
        variant === 'video-cinema' ? renderVideoCinema() :
        variant === 'video-theater' ? renderVideoTheater() :
        variant === 'video-banner-strip' ? renderVideoBannerStrip() :
        renderVideoSplit()
      )}

      {/* Scroll Cue Bell */}
      <div className="pt-6 flex justify-center z-20">
        <a
          href="#event-details"
          className="inline-flex flex-col items-center gap-2 text-[#E65C00] hover:text-[#CC4000] transition-colors group"
        >
          <span className="text-[11px] font-bold uppercase tracking-widest">{cfg.scrollCueText}</span>
          <div className="w-10 h-10 rounded-full border border-[#E65C00]/40 flex items-center justify-center group-hover:scale-110 group-hover:border-[#E65C00] transition-all bg-white/60">
            <span className="text-lg animate-bounce">🔔</span>
          </div>
        </a>
      </div>
    </section>
  );
}

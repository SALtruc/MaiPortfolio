import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { Study } from '../stories';
import { journeyStories } from '../stories';
import { projects } from '../content';
import { buildSolarWorkbench } from './michelin/buildSolarWorkbench';
import type { WorkbenchFocus } from './michelin/buildSolarWorkbench';
import './MichelinCase.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type FocusOption = {
  id: Exclude<WorkbenchFocus, 'overview'>;
  index: number;
  stepCode: string;
  shortLabel: string;
  metricValue: string;
  metricLabel: string;
  stageVerb: string;
};

const FOCUS_OPTIONS: FocusOption[] = [
  {
    id: 'vendors',
    index: 0,
    stepCode: '01',
    shortLabel: 'Vendors',
    metricValue: '12+',
    metricLabel: 'vendors coordinated',
    stageVerb: 'Gather',
  },
  {
    id: 'proposals',
    index: 1,
    stepCode: '02',
    shortLabel: 'Proposals',
    metricValue: '15+',
    metricLabel: 'proposals evaluated',
    stageVerb: 'Evaluate',
  },
  {
    id: 'departments',
    index: 2,
    stepCode: '03',
    shortLabel: 'Delivery',
    metricValue: '4+',
    metricLabel: 'internal departments',
    stageVerb: 'Follow through',
  },
];

const CANOPY_TILT = -0.31;

type SceneControls = {
  wake: () => void;
  rotate: (delta: number) => void;
  zoom: (delta: number) => void;
  resetView: () => void;
};

type EvidencePhoto = {
  image: string;
  alt: string;
  caption: string;
  contextTag: string;
};

export default function MichelinCase({ study, paused }: { study: Study; paused: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sceneControlsRef = useRef<SceneControls | null>(null);
  const blockClickUntilRef = useRef(0);

  const [focus, setFocus] = useState<WorkbenchFocus>('overview');
  const [webglStatus, setWebglStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [zoomedPhoto, setZoomedPhoto] = useState<EvidencePhoto | null>(null);

  const michelinProject = projects.find(p => p.id === 'michelin');
  const michelinJourney = journeyStories.find(item => item.company === 'Michelin');

  const activeIndex =
    focus === 'vendors' ? 0 : focus === 'proposals' ? 1 : focus === 'departments' ? 2 : -1;
  const activeOption = FOCUS_OPTIONS[activeIndex >= 0 ? activeIndex : 0];
  const activeDecision = study.decisions[activeIndex >= 0 ? activeIndex : 0] ?? study.decisions[0];

  const evidencePhotos: EvidencePhoto[] = [
    {
      image: study.image,
      alt: study.alt,
      caption:
        study.gallery[0]?.caption ??
        'The project context: coordinating with the people involved in delivery.',
      contextTag: 'Dealership site visit · Southern Vietnam',
    },
    ...study.gallery.map(item => ({
      image: item.image,
      alt: item.alt,
      caption: item.caption,
      contextTag: 'Project team & dealership context',
    })),
  ].filter((item, idx, arr) => arr.findIndex(other => other.image === item.image) === idx);

  // Keep modal dialog state synchronized
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (zoomedPhoto && !dialog.open) {
      dialog.showModal();
    } else if (!zoomedPhoto && dialog.open) {
      dialog.close();
    }
  }, [zoomedPhoto]);

  // Keep mutable state ref for the Three.js loop
  const liveStateRef = useRef({
    focus,
    activeIndex,
    paused,
    tiltRadians: CANOPY_TILT,
    onSelectFocus: (next: WorkbenchFocus) => setFocus(next),
  });

  useEffect(() => {
    liveStateRef.current = {
      focus,
      activeIndex,
      paused,
      tiltRadians: CANOPY_TILT,
      onSelectFocus: (next: WorkbenchFocus) => setFocus(next),
    };
    sceneControlsRef.current?.wake();
  }, [focus, activeIndex, paused]);

  // Three.js Interactive Solar-Finance Workbench
  useEffect(() => {
    const currentHost = canvasHostRef.current;
    if (!currentHost) return;
    const host: HTMLDivElement = currentHost;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'default',
      });
    } catch {
      setWebglStatus('failed');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-6.4, 6.4, 3.8, -3.8, 0.1, 80);
    const cameraOffset = new THREE.Vector3(6.6, 8.8, 11.4);
    const currentLookAt = new THREE.Vector3(0, 0.35, 0);
    const targetLookAt = new THREE.Vector3(0, 0.35, 0);
    camera.position.copy(cameraOffset).add(currentLookAt);
    camera.lookAt(currentLookAt);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTarget = pmrem.fromScene(room, 0.04);
    room.dispose();
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.4;

    const hemiLight = new THREE.HemisphereLight(0xfffaf0, 0x899aa6, 1.18);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e5, 3.1);
    sunLight.position.set(-4.5, 9.5, 5.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    Object.assign(sunLight.shadow.camera, {
      left: -7.2,
      right: 7.2,
      top: 5.8,
      bottom: -5.8,
      near: 1,
      far: 25,
    });
    sunLight.shadow.bias = -0.00015;
    sunLight.shadow.normalBias = 0.018;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xc8daf4, 0.72);
    fillLight.position.set(5.5, 4.2, -4.2);
    scene.add(fillLight);

    const groundGeo = new THREE.PlaneGeometry(70, 70);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.13 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.28;
    ground.receiveShadow = true;
    scene.add(ground);

    let rafId = 0;
    let disposed = false;
    let isVisible = true;
    let dirty = true;
    let lastTime = 0;
    let elapsed = 0;
    let yawAngle = 0;
    let targetYawAngle = 0;
    let userZoom = 1;
    let hoveredCluster = -1;
    let prevFocus: WorkbenchFocus | null = null;
    let prevTilt = 0;
    let width = 1;
    let height = 1;
    let frameCount = 0;

    function wake() {
      dirty = true;
      if (!rafId && !disposed && isVisible && !document.hidden) {
        rafId = requestAnimationFrame(renderFrame);
      }
    }

    const workbench = buildSolarWorkbench(renderer, wake);
    scene.add(workbench.root);

    const clusterBaseY = workbench.clusters.map(c => c.position.y);
    const modelBounds = new THREE.Box3().setFromObject(workbench.root);
    const fitCorners: THREE.Vector3[] = [];
    for (const x of [modelBounds.min.x, modelBounds.max.x]) {
      for (const y of [modelBounds.min.y, modelBounds.max.y + 0.2]) {
        for (const z of [modelBounds.min.z, modelBounds.max.z]) {
          fitCorners.push(new THREE.Vector3(x, y, z));
        }
      }
    }
    const fitPoint = new THREE.Vector3();
    function fitCompleteModel() {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const corner of fitCorners) {
        fitPoint.copy(corner).applyMatrix4(workbench.root.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
        minX = Math.min(minX, fitPoint.x); maxX = Math.max(maxX, fitPoint.x);
        minY = Math.min(minY, fitPoint.y); maxY = Math.max(maxY, fitPoint.y);
      }
      const aspect = width / Math.max(height, 1);
      let halfWidth = (maxX - minX) * 0.55;
      let halfHeight = (maxY - minY) * 0.56;
      if (halfWidth / halfHeight < aspect) halfWidth = halfHeight * aspect;
      else halfHeight = halfWidth / aspect;
      const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
      camera.left = centerX - halfWidth; camera.right = centerX + halfWidth;
      camera.top = centerY + halfHeight; camera.bottom = centerY - halfHeight;
      camera.updateProjectionMatrix();
    }
    const projected = new THREE.Vector3();
    const markerCache = FOCUS_OPTIONS.map(() => ({ transform: '', hover: '' }));

    function renderFrame(now: number) {
      rafId = 0;
      if (disposed || !isVisible || document.hidden) {
        lastTime = 0;
        return;
      }

      const {
        focus: currentFocus,
        activeIndex: activeCluster,
        paused: motionPaused,
        tiltRadians,
      } = liveStateRef.current;
      const reducedMotion =
        motionPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const dt = Math.min((now - (lastTime || now)) / 1000, 0.25);
      lastTime = now;

      if (currentFocus !== prevFocus || Math.abs(tiltRadians - prevTilt) > 0.001) {
        dirty = true;
        prevFocus = currentFocus;
        prevTilt = tiltRadians;
      }

      if (reducedMotion && !dirty) return;
      if (!reducedMotion) elapsed += dt;

      const smoothing = reducedMotion ? 1 : 1 - Math.exp(-8.5 * dt);

      yawAngle = THREE.MathUtils.lerp(yawAngle, targetYawAngle, smoothing);
      workbench.root.rotation.y = yawAngle;

      // Selection changes the objects, not the framing of the complete model.
      targetLookAt.set(0, 0.36, 0.02);
      currentLookAt.lerp(targetLookAt, smoothing);
      camera.position.copy(cameraOffset).add(currentLookAt);
      camera.lookAt(currentLookAt);
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, userZoom, smoothing);

      // Elevate selected cluster
      workbench.clusters.forEach((cluster, idx) => {
        const lift =
          idx === activeCluster ? 0.16 : idx === hoveredCluster && !reducedMotion ? 0.08 : 0;
        cluster.position.y = THREE.MathUtils.lerp(
          cluster.position.y,
          clusterBaseY[idx] + lift,
          smoothing,
        );
      });

      // Cluster 0: 12+ Vendor packets wave/step when focused
      workbench.vendorPackets.forEach((packet, idx) => {
        const baseY = (packet.userData.baseY as number) || 0.065;
        const wave =
          activeCluster === 0
            ? 0.04 + (idx % 3) * 0.018 + (reducedMotion ? 0 : Math.sin(elapsed * 2.2 + idx * 0.5) * 0.012)
            : 0;
        packet.position.y = THREE.MathUtils.lerp(packet.position.y, baseY + wave, smoothing);
      });

      // Cluster 1: 15+ Proposal sheets fan/step when focused
      workbench.proposalSheets.forEach((sheet, idx) => {
        const baseY = (sheet.userData.baseY as number) || 0.046;
        const fanLift = activeCluster === 1 ? idx * 0.009 : 0;
        sheet.position.y = THREE.MathUtils.lerp(sheet.position.y, baseY + fanLift, smoothing);
      });

      // Subtle pencil roll on proposals focus
      const targetPencilX = activeCluster === 1 ? 1.44 : 1.34;
      workbench.pencil.position.x = THREE.MathUtils.lerp(
        workbench.pencil.position.x,
        targetPencilX,
        smoothing,
      );

      // Cluster 2: 4+ Internal department blocks step up when focused
      workbench.departmentBlocks.forEach((block, idx) => {
        const baseY = (block.userData.baseY as number) || 0.085;
        const stepLift =
          activeCluster === 2
            ? 0.045 + idx * 0.016 + (reducedMotion ? 0 : Math.sin(elapsed * 2 + idx) * 0.008)
            : 0;
        block.position.y = THREE.MathUtils.lerp(block.position.y, baseY + stepLift, smoothing);
      });

      // Solar canopy tilt & photovoltaic cell illumination
      const breathTilt = reducedMotion ? 0 : Math.sin(elapsed * 0.9) * 0.012;
      const targetCanopyRotX =
        tiltRadians + (activeCluster === 2 ? -0.04 : 0) + breathTilt;
      workbench.solarCanopyPivot.rotation.x = THREE.MathUtils.lerp(
        workbench.solarCanopyPivot.rotation.x,
        targetCanopyRotX,
        smoothing,
      );

      workbench.solarCellMaterials.forEach((mat, idx) => {
        const isHighlighted =
          activeCluster === 2 ||
          activeCluster === -1 ||
          (activeCluster === 0 && idx < 4) ||
          (activeCluster === 1 && idx < 8);
        const targetEmissive = isHighlighted ? 0.22 : 0.05;
        mat.emissiveIntensity = THREE.MathUtils.lerp(
          mat.emissiveIntensity,
          targetEmissive,
          smoothing,
        );
      });

      workbench.connectorMaterials.forEach((mat, idx) => {
        const activeConduit = activeCluster === -1 || activeCluster === idx;
        mat.emissiveIntensity = THREE.MathUtils.lerp(
          mat.emissiveIntensity,
          activeConduit ? 0.26 : 0.05,
          smoothing,
        );
      });

      // Project 3D anchors to overlay buttons
      workbench.root.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      fitCompleteModel();

      workbench.anchors.forEach((anchor, idx) => {
        projected.copy(anchor);
        projected.y += workbench.clusters[idx].position.y - clusterBaseY[idx];
        workbench.root.localToWorld(projected).project(camera);

        const marker = markerRefs.current[idx];
        if (marker) {
          const x = THREE.MathUtils.clamp(
            (projected.x * 0.5 + 0.5) * width,
            42,
            Math.max(42, width - 42),
          );
          const y = THREE.MathUtils.clamp(
            (-projected.y * 0.5 + 0.5) * height,
            34,
            Math.max(34, height - 34),
          );
          const transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          const hoverState = idx === hoveredCluster ? 'true' : 'false';
          const cache = markerCache[idx];
          if (cache.transform !== transform) {
            marker.style.transform = transform;
            cache.transform = transform;
          }
          if (cache.hover !== hoverState) {
            marker.dataset.hover = hoverState;
            cache.hover = hoverState;
          }
        }
      });

      renderer.shadowMap.needsUpdate =
        dirty ||
        Math.abs(yawAngle - targetYawAngle) > 0.0005 ||
        Math.abs(workbench.solarCanopyPivot.rotation.x - targetCanopyRotX) > 0.001 ||
        workbench.clusters.some(
          (c, i) =>
            Math.abs(
              c.position.y -
                (clusterBaseY[i] +
                  (i === activeCluster ? 0.16 : i === hoveredCluster && !reducedMotion ? 0.08 : 0)),
            ) > 0.0005,
        );

      renderer.render(scene, camera);
      dirty = false;
      host.dataset.frames = String(++frameCount);
      host.dataset.viewAngle = yawAngle.toFixed(3);

      if (!reducedMotion) {
        rafId = requestAnimationFrame(renderFrame);
      }
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const hitTest = (event: PointerEvent): number => {
      const markerButton = (event.target as Element | null)?.closest?.(
        '[data-workbench-marker]',
      ) as HTMLElement | null;
      if (markerButton) return Number(markerButton.dataset.workbenchMarker);

      for (let i = 0; i < markerRefs.current.length; i++) {
        const rect = markerRefs.current[i]?.getBoundingClientRect();
        if (
          rect &&
          rect.width > 0 &&
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          return i;
        }
      }

      const bounds = renderer.domElement.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return -1;
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(workbench.root, true);
      if (!hits.length) return -1;

      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && obj.userData.focusIndex === undefined) {
        obj = obj.parent;
      }
      return typeof obj?.userData.focusIndex === 'number' ? obj.userData.focusIndex : -1;
    };

    let dragState: {
      id: number;
      startX: number;
      startY: number;
      startYaw: number;
      moved: boolean;
      locked: boolean;
    } | null = null;

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      blockClickUntilRef.current = 0;
      dragState = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startYaw: targetYawAngle,
        moved: false,
        locked: false,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (dragState && dragState.id === event.pointerId) {
        const dx = event.clientX - dragState.startX;
        const dy = event.clientY - dragState.startY;
        if (Math.hypot(dx, dy) > 8) dragState.moved = true;
        if (!dragState.locked && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy) * 1.25) {
          dragState.locked = true;
          host.setPointerCapture(event.pointerId);
        }
        if (dragState.locked) {
          targetYawAngle = THREE.MathUtils.clamp(dragState.startYaw + dx * 0.0032, -0.6, 0.6);
          wake();
        }
      } else if (event.pointerType === 'mouse') {
        const nextHover = hitTest(event);
        if (nextHover !== hoveredCluster) {
          hoveredCluster = nextHover;
          renderer.domElement.style.cursor = hoveredCluster >= 0 ? 'pointer' : 'grab';
          wake();
        }
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const current = dragState;
      dragState = null;
      if (host.hasPointerCapture(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
      if (current && current.id === event.pointerId) {
        blockClickUntilRef.current = performance.now() + 380;
        if (!current.moved) {
          const hitIndex = hitTest(event);
          if (hitIndex >= 0 && FOCUS_OPTIONS[hitIndex]) {
            liveStateRef.current.onSelectFocus(FOCUS_OPTIONS[hitIndex].id);
          }
        }
      }
      wake();
    };

    const handlePointerCancel = () => {
      if (dragState) blockClickUntilRef.current = performance.now() + 380;
      dragState = null;
      hoveredCluster = -1;
      wake();
    };

    const handlePointerLeave = () => {
      hoveredCluster = -1;
      renderer.domElement.style.cursor = 'grab';
      wake();
    };

    const canvas = renderer.domElement;
    host.addEventListener('pointerdown', handlePointerDown);
    host.addEventListener('pointermove', handlePointerMove);
    host.addEventListener('pointerup', handlePointerUp);
    host.addEventListener('pointercancel', handlePointerCancel);
    host.addEventListener('lostpointercapture', handlePointerCancel);
    host.addEventListener('pointerleave', handlePointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      const bounds = host.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const aspect = width / height;
      const span = Math.max(12.6, aspect * 7.6);
      camera.left = -span / 2;
      camera.right = span / 2;
      camera.top = span / aspect / 2;
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      wake();
    });
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        wake();
      } else {
        cancelAnimationFrame(rafId);
        rafId = 0;
        lastTime = 0;
      }
    });
    intersectionObserver.observe(host);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
        lastTime = 0;
      } else {
        wake();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(rafId);
      rafId = 0;
      isVisible = false;
      setWebglStatus('failed');
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);

    sceneControlsRef.current = {
      wake,
      rotate: (delta: number) => {
        targetYawAngle = THREE.MathUtils.clamp(targetYawAngle + delta, -0.6, 0.6);
        wake();
      },
      zoom: (delta: number) => {
        userZoom = THREE.MathUtils.clamp(userZoom + delta, 0.82, 1.32);
        wake();
      },
      resetView: () => {
        targetYawAngle = 0;
        userZoom = 1;
        liveStateRef.current.onSelectFocus('overview');
        wake();
      },
    };

    setWebglStatus('ready');
    wake();

    return () => {
      disposed = true;
      sceneControlsRef.current = null;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      host.removeEventListener('pointerdown', handlePointerDown);
      host.removeEventListener('pointermove', handlePointerMove);
      host.removeEventListener('pointerup', handlePointerUp);
      host.removeEventListener('pointercancel', handlePointerCancel);
      host.removeEventListener('lostpointercapture', handlePointerCancel);
      host.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      workbench.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      envTarget.dispose();
      pmrem.dispose();
      sunLight.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  useGSAP(() => {
    if (paused) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.mc-opening > *', { y: 16, opacity: 0, stagger: 0.07, duration: 0.6, ease: 'power3.out' });
      gsap.from('.mc-workbench-shell', { y: 24, opacity: 0, duration: 0.8, delay: 0.12, ease: 'power3.out' });
      gsap.from('.mc-stage-label', { y: 12, opacity: 0, stagger: 0.08, duration: 0.5, delay: 0.3, ease: 'power2.out' });
      for (const section of ['.mc-ledger-section', '.mc-evidence-section', '.mc-outcome-section']) {
        gsap.from(section, { y: 32, opacity: 0, duration: 0.65, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 88%', once: true } });
      }
      gsap.fromTo('.mc-story-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.mc-ledger-section', start: 'top 75%', end: 'bottom 75%', scrub: true } });
    });
    return () => media.revert();
  }, { scope: rootRef, dependencies: [paused], revertOnUpdate: true });

  useGSAP(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo('.mc-inspector-body', { y: 8, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' });
  }, { scope: rootRef, dependencies: [focus, paused], revertOnUpdate: true });

  const focusOrder: WorkbenchFocus[] = ['vendors', 'proposals', 'departments', 'overview'];

  const handleFocusKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIdx: number,
  ) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const total = focusOrder.length;
    const nextIdx =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? total - 1
          : (currentIdx + (event.key === 'ArrowRight' ? 1 : total - 1)) % total;
    setFocus(focusOrder[nextIdx]);
    focusTabRefs.current[nextIdx]?.focus();
  };

  const activeStage = activeIndex < 0 ? null : activeOption;

  return (
    <article className="case-michelin" ref={rootRef} aria-labelledby="michelin-case-title">
      <header className="mc-opening">
        <div>
          <p className="mc-kicker">Michelin Vietnam <span>{study.date}</span></p>
          <h1 id="michelin-case-title">Green Finance</h1>
          <p className="mc-opening-line">Bringing a solar energy decision out of scattered proposals.</p>
        </div>
        <p className="mc-opening-role"><span>My role</span><strong>{study.role}</strong><a href={study.source} target="_blank" rel="noreferrer">Original project record &#8599;</a></p>
      </header>

      <section className="mc-workbench-section" id="michelin-workbench" aria-label="Solar project coordination">
        <div className="mc-workbench-shell">
          <div className="mc-scene-column">
            <div className="mc-stage-toolbar">
              <p>Many inputs. One shared decision.</p>
              <div className="mc-camera-buttons" role="group" aria-label="Model view">
                <button type="button" aria-label="Rotate workbench left" disabled={webglStatus !== 'ready'} onClick={() => sceneControlsRef.current?.rotate(-0.16)}>&#8630;</button>
                <button type="button" aria-label="Rotate workbench right" disabled={webglStatus !== 'ready'} onClick={() => sceneControlsRef.current?.rotate(0.16)}>&#8631;</button>
                <button type="button" className="mc-reset-btn" disabled={webglStatus !== 'ready'} onClick={() => sceneControlsRef.current?.resetView()}>Reset view</button>
              </div>
            </div>
            <div className="mc-scene-frame">
              <div ref={canvasHostRef} className="mc-canvas-host" data-scene-state={webglStatus} data-active-focus={focus} role="group" aria-label="Solar coordination model. Drag horizontally to turn or choose a station.">
                <div className="mc-canvas-markers">
                  {FOCUS_OPTIONS.map(option => <button key={option.id} type="button" data-workbench-marker={option.index} ref={node => { markerRefs.current[option.index] = node; }} aria-label={`Focus ${option.metricValue} ${option.metricLabel}`} aria-pressed={focus === option.id} onClick={event => {
                    if (event.detail > 0 && performance.now() < blockClickUntilRef.current) { blockClickUntilRef.current = 0; return; }
                    setFocus(option.id);
                  }}><span>{option.metricValue}</span><small>{option.metricLabel}</small></button>)}
                </div>
              </div>
              {webglStatus === 'loading' && <p className="mc-model-loading" role="status">Preparing the solar model&hellip;</p>}
              {webglStatus === 'failed' && <div className="mc-model-fallback" role="img" aria-label="12 plus vendors, 15 plus proposals and 4 plus departments connected to the solar project decision">
                <svg viewBox="0 0 800 330" aria-hidden="true"><path className="mc-fallback-path" d="M135 165H660"/><g><rect x="55" y="70" width="180" height="190" rx="10"/><path d="M90 110h110M90 130h85M90 150h100"/><text x="90" y="205">12+</text><text x="90" y="235" className="mc-svg-caption">vendors</text></g><g><rect x="310" y="70" width="180" height="190" rx="10"/><path d="M345 110h110M345 130h85M345 150h100"/><text x="345" y="205">15+</text><text x="345" y="235" className="mc-svg-caption">proposals</text></g><g><path d="m565 110 125-35 55 55-125 35zM585 117l115-31M606 135l115-31M600 100l50 52M638 89l50 52M620 165v65M730 145v65"/><text x="580" y="250">4+</text><text x="635" y="250" className="mc-svg-caption">departments</text></g></svg>
                <p>The model is unavailable here. The project story and focus controls remain available.</p>
              </div>}
            </div>
            <div className="mc-stage-legend" role="group" aria-label="Choose project focus">
              {FOCUS_OPTIONS.map((option, index) => <button className={`mc-stage-label ${focus === option.id ? 'is-selected' : ''}`} key={option.id} type="button" ref={node => { focusTabRefs.current[index] = node; }} aria-pressed={focus === option.id} onClick={() => setFocus(option.id)} onKeyDown={event => handleFocusKeyDown(event,index)}><strong>{option.metricValue}</strong><span>{option.metricLabel}</span></button>)}
              <button type="button" className={`mc-overview-control ${focus === 'overview' ? 'is-selected' : ''}`} ref={node => { focusTabRefs.current[3] = node; }} aria-pressed={focus === 'overview'} onClick={() => setFocus('overview')} onKeyDown={event => handleFocusKeyDown(event,3)}>Whole project</button>
            </div>
            <p className="mc-model-caption">An illustrative model of the coordination process, rather than a site plan.</p>
          </div>
          <aside className="mc-inspector" aria-label="Selected project decision" aria-live="polite">
            <div className="mc-inspector-body" key={focus}>
              <p className="mc-inspector-kicker">{activeStage ? activeStage.stageVerb : 'The project'}</p>
              <h2>{activeStage ? activeDecision.title : 'Turning the inputs into a next step.'}</h2>
              <p className="mc-inspector-action">{activeStage ? activeDecision.action : study.question}</p>
              <div className="mc-inspector-note"><span>{activeStage ? 'Why it mattered' : 'My contribution'}</span><p>{activeStage ? activeDecision.why : 'I coordinated project information, evaluated proposals and supported the discussions that moved the solar project toward contract finalisation.'}</p></div>
            </div>
            <a className="mc-evidence-link" href="#michelin-evidence" onClick={event => { event.preventDefault(); document.getElementById('michelin-evidence')?.scrollIntoView({behavior: paused ? 'instant' : 'smooth'}); }}>See the dealership context <span aria-hidden="true">&#8595;</span></a>
          </aside>
        </div>
      </section>

      <section className="mc-ledger-section" aria-labelledby="mc-ledger-heading">
        <div className="mc-story-intro"><p className="mc-kicker">The work behind the model</p><h2 id="mc-ledger-heading">Clarity is something you build.</h2><p>{study.intro}</p></div>
        <div className="mc-story-decisions"><span className="mc-story-line" aria-hidden="true"/>{study.decisions.map((decision,index) => <article className="mc-story-decision" key={decision.title}><span className="mc-story-number">{index+1}</span><div><h3>{decision.title}</h3><p>{decision.action}</p></div><p>{decision.why}</p></article>)}</div>
      </section>

      <section className="mc-evidence-section" id="michelin-evidence" aria-labelledby="mc-evidence-heading">
        <div className="mc-evidence-heading"><p className="mc-kicker">On the ground</p><h2 id="mc-evidence-heading">The people behind the project.</h2></div>
        <div className="mc-evidence-layout">
          {evidencePhotos.map(photo => <figure className="mc-evidence-panel" key={photo.image}><button type="button" className="mc-evidence-zoom-btn" aria-label={`Enlarge evidence image: ${photo.alt}`} onClick={() => setZoomedPhoto(photo)}><img src={photo.image} alt={photo.alt} loading="lazy"/><span>Open photograph &#8599;</span></button><figcaption>{photo.caption}</figcaption></figure>)}
          <div className="mc-broader-scope-card"><h3>Beyond the solar project.</h3><p>{michelinJourney?.body}</p><p>Alongside project coordination, I supported monthly financial and operational reporting and the review of <strong>500+ documents spanning eight years</strong> for a tax audit.</p><p className="mc-practice-note">{michelinProject?.learning}</p></div>
        </div>
      </section>

      <section className="mc-outcome-section" aria-labelledby="mc-outcome-heading">
        <div className="mc-outcome-card"><p className="mc-kicker">What moved forward</p><h2 id="mc-outcome-heading">From discussion to contract finalisation.</h2><p>{study.outcome}</p><p className="mc-outcome-scope">My role was to support the coordination, evaluation and discussions that helped the team move forward.</p></div>
        <div className="mc-reflection-card"><p className="mc-kicker">What I carry forward</p><p className="mc-reflection-text">{study.lesson}</p>{michelinJourney?.carry && <p>{michelinJourney.carry}</p>}<a href={study.source} target="_blank" rel="noreferrer">Read the original project record &#8599;</a></div>
      </section>

      <dialog ref={dialogRef} className="mc-photo-dialog" onCancel={() => setZoomedPhoto(null)} onClose={() => setZoomedPhoto(null)} onClick={event => { if(event.target === event.currentTarget) setZoomedPhoto(null); }} aria-label="Enlarged Michelin dealership photograph"><div className="mc-dialog-bar"><span>{zoomedPhoto?.contextTag}</span><button type="button" autoFocus onClick={() => setZoomedPhoto(null)} aria-label="Close enlarged image">&times;</button></div>{zoomedPhoto && <><img src={zoomedPhoto.image} alt={zoomedPhoto.alt}/><p>{zoomedPhoto.caption}</p></>}</dialog>
    </article>
  );
}

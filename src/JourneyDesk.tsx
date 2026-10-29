import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ConvexHull } from 'three/addons/math/ConvexHull.js';
import { buildJourneyScene } from './desk/buildJourneyScene';

const names = ['Council notebook', 'CTM phone', 'Careers photo', 'Michelin folder', 'TikTok laptop'];
type Controls = { wake: () => void; rotate: (step: number) => void; zoom: (step: number) => void; reset: () => void };

// Footprint radii for the 3D selection ring under each of the 5 chapter objects
const targetRadii = [1.55, 1.12, 1.18, 1.42, 1.62];

export default function JourneyDesk({
  selected,
  paused,
  onSelect,
}: {
  selected: number;
  paused: boolean;
  onSelect: (chapter: number) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const state = useRef({ selected, paused, onSelect });
  const controls = useRef<Controls | null>(null);
  const blockClick = useRef(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    state.current = { selected, paused, onSelect };
    controls.current?.wake();
  }, [selected, paused, onSelect]);

  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
    } catch {
      setStatus('failed');
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    el.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-6.5, 6.5, 4, -4, 0.1, 80);
    const cameraOffset = new THREE.Vector3(6.2, 9.2, 12.0);
    const focus = new THREE.Vector3(0, 0.42, -0.05);
    camera.position.copy(cameraOffset).add(focus);
    camera.lookAt(focus);
    camera.updateMatrixWorld(true);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    room.dispose();
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.42;

    scene.add(new THREE.HemisphereLight(0xfffaf2, 0x8b9baa, 1.15));
    const sun = new THREE.DirectionalLight(0xfff7e8, 3.15);
    sun.position.set(-4, 9, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -7.5, right: 7.5, top: 6.5, bottom: -6.5, near: 1, far: 24 });
    sun.shadow.bias = -0.00015;
    sun.shadow.normalBias = 0.018;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xc4d4f0, 0.75);
    fill.position.set(5, 4, -4);
    scene.add(fill);

    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    let raf = 0;
    let disposed = false;
    let visible = true;
    let dirty = true;
    let lastTime = 0;
    let elapsed = 0;
    let angle = 0;
    let targetAngle = 0;
    let zoom = 1;
    let hover = -1;
    let previousSelected = -2;
    let frames = 0;
    let width = 1;
    let height = 1;

    function wake() {
      dirty = true;
      if (!raf && !disposed && visible && !document.hidden) {
        raf = requestAnimationFrame(render);
      }
    }

    const desk = buildJourneyScene(renderer, wake);
    scene.add(desk.root);

    // 3D selection highlight ring & warm focus light so selected objects stand out without clipping zoom
    const haloGroup = new THREE.Group();
    haloGroup.visible = false;
    haloGroup.position.set(0, 0.055, 0);
    desk.root.add(haloGroup);

    const haloOuterGeo = new THREE.RingGeometry(0.88, 1.0, 48);
    haloOuterGeo.rotateX(-Math.PI / 2);
    const haloOuterMat = new THREE.MeshBasicMaterial({
      color: 0x2952c8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const haloOuter = new THREE.Mesh(haloOuterGeo, haloOuterMat);
    haloGroup.add(haloOuter);

    const haloInnerGeo = new THREE.CircleGeometry(0.88, 48);
    haloInnerGeo.rotateX(-Math.PI / 2);
    const haloInnerMat = new THREE.MeshBasicMaterial({
      color: 0xfff9ec,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const haloInner = new THREE.Mesh(haloInnerGeo, haloInnerMat);
    haloInner.position.y = -0.003;
    haloGroup.add(haloInner);

    const focusLight = new THREE.PointLight(0xfff4dc, 0, 5.2, 1.6);
    focusLight.position.set(0, 2.1, 0);
    desk.root.add(focusLight);

    const baseY = desk.targets.map(target => target.position.y);
    const baseRotX = desk.targets.map(target => target.rotation.x);

    // Cache every real mesh's local bounds once, including instanced keycaps.
    // Ground, lighting and the decorative halo never influence the camera fit.
    const meshBounds: { mesh: THREE.Mesh; corners: THREE.Vector3[]; table: boolean }[] = [];
    desk.root.traverse(object => {
      if (!(object instanceof THREE.Mesh) || object === haloOuter || object === haloInner) return;
      let bounds = object.geometry.boundingBox;
      if (object instanceof THREE.InstancedMesh) {
        object.computeBoundingBox();
        bounds = object.boundingBox;
      } else if (!bounds) {
        object.geometry.computeBoundingBox();
        bounds = object.geometry.boundingBox;
      }
      if (!bounds || bounds.isEmpty()) return;
      const corners: THREE.Vector3[] = [];
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) corners.push(new THREE.Vector3(x, y, z));
        }
      }
      meshBounds.push({ mesh: object, corners, table: object.parent === desk.root && bounds.max.x - bounds.min.x > 9 });
    });

    desk.root.updateMatrixWorld(true);
    const rootInverse = desk.root.matrixWorld.clone().invert();
    const meshToRoot = new THREE.Matrix4();
    const fittingPoints: THREE.Vector3[] = [];
    const cachePose = (records: typeof meshBounds) => {
      desk.root.updateMatrixWorld(true);
      records.forEach(({ mesh, corners }) => {
        meshToRoot.multiplyMatrices(rootInverse, mesh.matrixWorld);
        corners.forEach(corner => fittingPoints.push(corner.clone().applyMatrix4(meshToRoot)));
      });
    };
    const belongsTo = (mesh: THREE.Object3D, ancestor: THREE.Object3D) => {
      for (let node: THREE.Object3D | null = mesh; node; node = node.parent) {
        if (node === ancestor) return true;
      }
      return false;
    };

    cachePose(meshBounds);
    // Reserve only the actual moving objects' lift/hinge/sway envelopes.
    // Sampling the small arcs plus the fit margin covers intermediate poses.
    desk.targets.forEach((target, index) => {
      const records = meshBounds.filter(({ mesh }) => belongsTo(mesh, target));
      for (let step = 1; step <= 4; step++) {
        const progress = step / 4;
        target.position.y = baseY[index] + 0.24 * progress;
        target.rotation.x = baseRotX[index] + (index === 1 || index === 3 ? 0.055 * progress : 0);
        if (index === 0) desk.coverHinge.rotation.z = 0.48 * progress;
        if (index === 4) desk.screen.rotation.x = -0.18 - 0.12 * progress;
        cachePose(records);
      }
      target.position.y = baseY[index];
      target.rotation.x = baseRotX[index];
      desk.coverHinge.rotation.z = 0;
      desk.screen.rotation.x = -0.18;
    });
    const plantBounds = meshBounds.filter(({ mesh }) => belongsTo(mesh, desk.plant));
    for (const sway of [-0.012, 0.012]) {
      desk.plant.rotation.z = sway;
      cachePose(plantBounds);
    }
    desk.plant.rotation.z = 0;
    desk.root.updateMatrixWorld(true);

    // A convex hull preserves every projected extreme at any rotation while
    // keeping the per-frame fit small. No synthetic upper table corners.
    const hull = new ConvexHull().setFromPoints(fittingPoints);
    const hullPoints = new Set<THREE.Vector3>();
    hull.faces.forEach(face => {
      let edge = face.edge;
      do {
        hullPoints.add(edge.head().point);
        edge = edge.next;
      } while (edge !== face.edge);
    });
    const sceneLocalBounds = [...hullPoints];

    const projected = new THREE.Vector3();
    const viewVec = new THREE.Vector3();
    const rootToView = new THREE.Matrix4();
    const worldToClip = new THREE.Matrix4();
    const meshToClip = new THREE.Matrix4();
    const markerCache = names.map(() => ({ transform: '', tip: '', hover: '', selected: '' }));

    function render(now: number) {
      raf = 0;
      if (disposed || !visible || document.hidden) {
        lastTime = 0;
        return;
      }
      const { selected: active, paused: still } = state.current;
      const dt = Math.min((now - (lastTime || now)) / 1000, 0.25);
      lastTime = now;

      if (active !== previousSelected) {
        dirty = true;
        previousSelected = active;
        hover = -1;
      }
      if (still && !dirty) return;
      if (!still) elapsed += dt;

      const smoothing = still ? 1 : 1 - Math.exp(-8.5 * dt);
      angle = THREE.MathUtils.lerp(angle, targetAngle, smoothing);
      desk.root.rotation.y = angle;

      // Lift and subtly tilt the selected or hovered object in place without panning the table off-screen
      desk.targets.forEach((target, i) => {
        const isSelected = i === active;
        const isHovered = i === hover && !still;
        const lift = isSelected ? 0.24 : isHovered ? 0.1 : 0;
        const tiltX = isSelected && (i === 1 || i === 3) ? 0.055 : 0;
        target.position.y = THREE.MathUtils.lerp(target.position.y, baseY[i] + lift, smoothing);
        target.rotation.x = THREE.MathUtils.lerp(target.rotation.x, baseRotX[i] + tiltX, smoothing);
      });

      const highlightIndex = active >= 0 ? active : hover;
      if (highlightIndex >= 0) {
        const target = desk.targets[highlightIndex];
        const radius = targetRadii[highlightIndex] ?? 1.3;
        const pulse = !still && active >= 0 ? 1 + Math.sin(elapsed * 2.6) * 0.025 : 1;
        haloGroup.visible = true;
        haloGroup.position.x = THREE.MathUtils.lerp(haloGroup.position.x, target.position.x, smoothing);
        haloGroup.position.z = THREE.MathUtils.lerp(haloGroup.position.z, target.position.z, smoothing);
        haloGroup.scale.setScalar(THREE.MathUtils.lerp(haloGroup.scale.x, radius * pulse, smoothing));
        haloOuterMat.opacity = THREE.MathUtils.lerp(haloOuterMat.opacity, active >= 0 ? 0.82 : 0.42, smoothing);
        haloInnerMat.opacity = THREE.MathUtils.lerp(haloInnerMat.opacity, active >= 0 ? 0.28 : 0.14, smoothing);
        focusLight.position.set(target.position.x, 2.25, target.position.z + 0.35);
        focusLight.intensity = THREE.MathUtils.lerp(focusLight.intensity, active >= 0 ? 1.65 : 0.75, smoothing);
      } else {
        haloOuterMat.opacity = THREE.MathUtils.lerp(haloOuterMat.opacity, 0, smoothing);
        haloInnerMat.opacity = THREE.MathUtils.lerp(haloInnerMat.opacity, 0, smoothing);
        focusLight.intensity = THREE.MathUtils.lerp(focusLight.intensity, 0, smoothing);
        if (haloOuterMat.opacity < 0.01) haloGroup.visible = false;
      }

      const targetCover = active === 0 ? 0.48 : hover === 0 && !still ? 0.16 : 0;
      const targetScreen = active === 4 ? -0.3 : -0.18;
      desk.coverHinge.rotation.z = THREE.MathUtils.lerp(desk.coverHinge.rotation.z, targetCover, smoothing);
      desk.screen.rotation.x = THREE.MathUtils.lerp(desk.screen.rotation.x, targetScreen, smoothing);
      desk.plant.rotation.z = still ? 0 : Math.sin(elapsed * 0.65) * 0.012;

      desk.root.updateMatrixWorld(true);
      camera.position.copy(cameraOffset).add(focus);
      camera.lookAt(focus);
      camera.updateMatrixWorld(true);

      // Fit the real geometry/motion envelope in camera space with modest margins.
      let viewMinX = Infinity;
      let viewMaxX = -Infinity;
      let viewMinY = Infinity;
      let viewMaxY = -Infinity;
      rootToView.multiplyMatrices(camera.matrixWorldInverse, desk.root.matrixWorld);
      for (let i = 0; i < sceneLocalBounds.length; i++) {
        viewVec.copy(sceneLocalBounds[i]).applyMatrix4(rootToView);
        if (viewVec.x < viewMinX) viewMinX = viewVec.x;
        if (viewVec.x > viewMaxX) viewMaxX = viewVec.x;
        if (viewVec.y < viewMinY) viewMinY = viewVec.y;
        if (viewVec.y > viewMaxY) viewMaxY = viewVec.y;
      }

      const aspect = Math.max(width / Math.max(height, 1), 0.4);
      const spanX = viewMaxX - viewMinX;
      const spanY = viewMaxY - viewMinY;
      const centerX = (viewMinX + viewMaxX) * 0.5;
      const centerY = (viewMinY + viewMaxY) * 0.5;
      const padX = width < 600 ? 1.10 : 1.06;
      const padY = width < 600 ? 1.12 : 1.08;
      const frustumW = Math.max(spanX * padX, spanY * padY * aspect);
      const frustumH = frustumW / aspect;

      camera.left = centerX - frustumW * 0.5;
      camera.right = centerX + frustumW * 0.5;
      camera.top = centerY + frustumH * 0.5;
      camera.bottom = centerY - frustumH * 0.5;
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, zoom, smoothing);
      camera.updateProjectionMatrix();

      // Update projected HTML markers for the 5 chapter objects
      desk.anchors.forEach((anchor, i) => {
        projected.copy(anchor);
        projected.y += desk.targets[i].position.y - baseY[i];
        desk.root.localToWorld(projected).project(camera);
        const marker = markers.current[i];
        if (marker) {
          const x = THREE.MathUtils.clamp((projected.x * 0.5 + 0.5) * width, 28, Math.max(28, width - 28));
          const y = THREE.MathUtils.clamp((-projected.y * 0.5 + 0.5) * height, 32, Math.max(32, height - 28));
          const transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`;
          const tip = `${y < 76 ? 'bottom' : 'top'}${x < 96 ? '-start' : x > width - 96 ? '-end' : ''}`;
          const isHover = i === hover ? 'true' : 'false';
          const isSelected = i === active ? 'true' : 'false';
          const cached = markerCache[i];
          if (cached.transform !== transform) {
            marker.style.transform = transform;
            cached.transform = transform;
          }
          if (cached.tip !== tip) {
            marker.dataset.tip = tip;
            cached.tip = tip;
          }
          if (cached.hover !== isHover) {
            marker.dataset.hover = isHover;
            cached.hover = isHover;
          }
          if (cached.selected !== isSelected) {
            marker.dataset.selected = isSelected;
            cached.selected = isSelected;
          }
        }
      });

      // Independently verify every current mesh bound, rather than reusing the
      // reduced fitting hull. All corners and matrices are reused between frames.
      let tMinX = Infinity;
      let tMaxX = -Infinity;
      let tMinY = Infinity;
      let tMaxY = -Infinity;
      let sMinX = Infinity;
      let sMaxX = -Infinity;
      let sMinY = Infinity;
      let sMaxY = -Infinity;
      worldToClip.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      for (const { mesh, corners, table } of meshBounds) {
        meshToClip.multiplyMatrices(worldToClip, mesh.matrixWorld);
        for (const corner of corners) {
          projected.copy(corner).applyMatrix4(meshToClip);
          const px = (projected.x * 0.5 + 0.5) * width;
          const py = (-projected.y * 0.5 + 0.5) * height;
          if (px < sMinX) sMinX = px;
          if (px > sMaxX) sMaxX = px;
          if (py < sMinY) sMinY = py;
          if (py > sMaxY) sMaxY = py;
          if (table) {
            if (px < tMinX) tMinX = px;
            if (px > tMaxX) tMaxX = px;
            if (py < tMinY) tMinY = py;
            if (py > tMaxY) tMaxY = py;
          }
        }
      }

      const settled =
        Math.abs(angle - targetAngle) <= 0.0005 &&
        Math.abs(camera.zoom - zoom) <= 0.0005 &&
        Math.abs(desk.coverHinge.rotation.z - targetCover) <= 0.001 &&
        Math.abs(desk.screen.rotation.x - targetScreen) <= 0.001 &&
        desk.targets.every(
          (target, i) =>
            Math.abs(target.position.y - (baseY[i] + (i === active ? 0.24 : i === hover && !still ? 0.1 : 0))) <= 0.0005,
        );

      renderer.shadowMap.needsUpdate = dirty || !settled;
      renderer.render(scene, camera);
      dirty = false;

      el.dataset.frames = String(++frames);
      el.dataset.viewAngle = angle.toFixed(3);
      el.dataset.zoom = camera.zoom.toFixed(3);
      el.dataset.selectedChapter = String(active);
      el.dataset.tableBounds = `${Math.round(tMinX)},${Math.round(tMinY)},${Math.round(tMaxX)},${Math.round(tMaxY)}`;
      el.dataset.sceneBounds = `${Math.round(sMinX)},${Math.round(sMinY)},${Math.round(sMaxX)},${Math.round(sMaxY)}`;
      el.dataset.boundsSource = 'all-mesh-geometry-boxes';
      el.dataset.boundsMeshCount = String(meshBounds.length);
      el.dataset.fitPointCount = String(sceneLocalBounds.length);
      el.dataset.wholeDeskVisible = String(
        tMinX >= 0 && tMaxX <= width && tMinY >= 0 && tMaxY <= height && sMinX >= 0 && sMaxX <= width && sMinY >= 0 && sMaxY <= height,
      );

      if (!still) raf = requestAnimationFrame(render);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hit = (e: PointerEvent) => {
      const marker = (e.target as Element | null)?.closest?.('[data-marker]') as HTMLElement | null;
      if (marker) return Number(marker.dataset.marker);
      for (let i = 0; i < markers.current.length; i++) {
        const rect = markers.current[i]?.getBoundingClientRect();
        if (
          rect &&
          rect.width > 0 &&
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          return i;
        }
      }
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(((e.clientX - bounds.left) / bounds.width) * 2 - 1, -((e.clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(desk.root, true);
      for (let h = 0; h < hits.length; h++) {
        let object: THREE.Object3D | null = hits[h].object;
        while (object && object.userData.chapter === undefined) object = object.parent;
        if (object && object.userData.chapter !== undefined) return object.userData.chapter as number;
      }
      return -1;
    };

    let drag: { id: number; x: number; y: number; start: number; moved: boolean; locked: boolean } | null = null;
    const down = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0 || (e.target as Element | null)?.closest?.('.j-desk-fallback')) return;
      blockClick.current = false;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, start: targetAngle, moved: false, locked: false };
    };
    const move = (e: PointerEvent) => {
      if (drag && drag.id === e.pointerId) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 9) drag.moved = true;
        if (!drag.locked && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy) * 1.25) {
          drag.locked = true;
          el.setPointerCapture(e.pointerId);
        }
        if (drag.locked) {
          targetAngle = THREE.MathUtils.clamp(drag.start + dx * 0.003, -0.65, 0.65);
          wake();
        }
      } else if (e.pointerType === 'mouse') {
        const next = hit(e);
        if (next !== hover) {
          hover = next;
          renderer.domElement.style.cursor = hover >= 0 ? 'pointer' : 'grab';
          wake();
        }
      }
    };
    const up = (e: PointerEvent) => {
      const current = drag;
      drag = null;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (current?.id === e.pointerId) {
        // Selection is already handled by pointerup. Its compatibility click
        // can arrive after a render or hit a marker moved by the story layout.
        blockClick.current = true;
        if (!current.moved) {
          const index = hit(e);
          if (index >= 0) {
            state.current.selected = index;
            state.current.onSelect(index);
          }
        }
      }
      wake();
    };
    const cancel = () => {
      if (drag) blockClick.current = true;
      drag = null;
      hover = -1;
      wake();
    };
    const leave = () => {
      hover = -1;
      renderer.domElement.style.cursor = 'grab';
      wake();
    };
    const canvas = renderer.domElement;
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('lostpointercapture', cancel);
    el.addEventListener('pointerleave', leave);

    const resize = new ResizeObserver(() => {
      const bounds = el.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      wake();
    });
    resize.observe(el);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
        lastTime = 0;
      }
    });
    intersection.observe(el);

    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        lastTime = 0;
      } else {
        wake();
      }
    };
    document.addEventListener('visibilitychange', visibility);

    const contextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      visible = false;
      setStatus('failed');
    };
    canvas.addEventListener('webglcontextlost', contextLost);

    controls.current = {
      wake,
      rotate: step => {
        targetAngle = THREE.MathUtils.clamp(targetAngle + step, -0.65, 0.65);
        wake();
      },
      zoom: step => {
        zoom = THREE.MathUtils.clamp(zoom + step, 0.8, 1.35);
        wake();
      },
      reset: () => {
        targetAngle = 0;
        zoom = 1;
        state.current.selected = -1;
        state.current.onSelect(-1);
        wake();
      },
    };
    setStatus('ready');
    wake();

    return () => {
      disposed = true;
      controls.current = null;
      cancelAnimationFrame(raf);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
      el.removeEventListener('lostpointercapture', cancel);
      el.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('webglcontextlost', contextLost);
      desk.dispose();
      haloOuterGeo.dispose();
      haloOuterMat.dispose();
      haloInnerGeo.dispose();
      haloInnerMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      environment.dispose();
      pmrem.dispose();
      sun.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  return (
    <div
      className="j-desk-wrap"
      onKeyDown={event => {
        if (event.key === 'Escape' && selected >= 0) controls.current?.reset();
      }}
    >
      <div className="j-desk-toolbar">
        <span>Drag to rotate · Select an object</span>
        <div role="group" aria-label="Desk view controls">
          <button type="button" aria-label="Rotate desk left" disabled={status !== 'ready'} onClick={() => controls.current?.rotate(-0.15)}>
            ↶
          </button>
          <button type="button" aria-label="Rotate desk right" disabled={status !== 'ready'} onClick={() => controls.current?.rotate(0.15)}>
            ↷
          </button>
          <button type="button" aria-label="Zoom out" disabled={status !== 'ready'} onClick={() => controls.current?.zoom(-0.1)}>
            −
          </button>
          <button type="button" aria-label="Zoom in" disabled={status !== 'ready'} onClick={() => controls.current?.zoom(0.1)}>
            +
          </button>
          <button
            type="button"
            className="j-reset"
            aria-pressed={selected < 0}
            disabled={status !== 'ready'}
            onClick={() => controls.current?.reset()}
          >
            Whole desk
          </button>
        </div>
      </div>
      <div className="j-desk-canvas" ref={host} data-scene-state={status} role="group" aria-label="Mai’s interactive 3D journey desk">
        <div className="j-markers">
          {names.map((name, index) => (
            <button
              key={name}
              type="button"
              data-marker={index}
              ref={node => {
                markers.current[index] = node;
              }}
              aria-label={`Explore ${name}`}
              aria-pressed={selected === index}
              onClick={event => {
                if (event.detail > 0 && blockClick.current) {
                  blockClick.current = false;
                  return;
                }
                state.current.selected = index;
                onSelect(index);
                controls.current?.wake();
              }}
            >
              <span>{index + 1}</span>
              <small>{name}</small>
            </button>
          ))}
        </div>
        {status !== 'ready' && (
          <div className="j-desk-fallback">
            <img src="/assets/mai-portrait.webp" alt="Mai at RMIT" />
            <p role="status">
              {status === 'loading'
                ? 'Making room for the next chapter…'
                : 'The 3D desk couldn’t load. You can still explore every chapter below.'}
            </p>
            {status === 'failed' && <button onClick={() => location.reload()}>Try the desk again</button>}
          </div>
        )}
      </div>
      <div className="j-desk-note">
        <span>{selected >= 0 ? `Selected: 0${selected + 1} · ${names[selected]}` : 'Five objects · Five chapters from 2024 to Now'}</span>
        {selected >= 0 ? (
          <button
            type="button"
            className="j-story-jump"
            onClick={() =>
              document.getElementById('journey-story-panel')?.scrollIntoView({ behavior: paused ? 'instant' : 'smooth', block: 'nearest' })
            }
          >
            Read chapter story ↓
          </button>
        ) : (
          <span>Whole desk in view</span>
        )}
      </div>
    </div>
  );
}

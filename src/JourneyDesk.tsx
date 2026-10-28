import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildJourneyScene } from './desk/buildJourneyScene';

const names = ['Council notebook', 'CTM phone', 'Careers photo', 'Michelin folder', 'TikTok laptop'];
type Controls = { wake: () => void; rotate: (step: number) => void; zoom: (step: number) => void; reset: () => void };

export default function JourneyDesk({ selected, paused, onSelect }: { selected: number; paused: boolean; onSelect: (chapter: number) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const state = useRef({ selected, paused, onSelect });
  const controls = useRef<Controls | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  useEffect(() => { state.current = { selected, paused, onSelect }; controls.current?.wake(); }, [selected, paused, onSelect]);

  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' }); }
    catch { setStatus('failed'); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.shadowMap.enabled = true; renderer.shadowMap.autoUpdate = false; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    el.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-6.5, 6.5, 4, -4, .1, 80);
    const cameraOffset = new THREE.Vector3(7, 9, 12);
    const focus = new THREE.Vector3(0, .2, 0);
    camera.position.copy(cameraOffset); camera.lookAt(focus);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment(); const environment = pmrem.fromScene(room, .04); room.dispose();
    scene.environment = environment.texture; scene.environmentIntensity = .4;
    scene.add(new THREE.HemisphereLight(0xfffaf2, 0x8b9baa, 1.15));
    const sun = new THREE.DirectionalLight(0xfff7e8, 3.1); sun.position.set(-4, 9, 5); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 1, far: 24 });
    sun.shadow.bias = -.00015; sun.shadow.normalBias = .018;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xc4d4f0, .7); fill.position.set(5, 4, -4); scene.add(fill);
    const groundGeo = new THREE.PlaneGeometry(80, 80), groundMat = new THREE.ShadowMaterial({ opacity: .14 });
    const ground = new THREE.Mesh(groundGeo, groundMat); ground.rotation.x = -Math.PI / 2; ground.position.y = -.3; ground.receiveShadow = true; scene.add(ground);
    let raf = 0, disposed = false, visible = true, dirty = true, lastTime = 0, elapsed = 0;
    let angle = 0, targetAngle = 0, zoom = 1, hover = -1, previousSelected = -2;
    let frames = 0, width = 1, height = 1;
    function wake() { dirty = true; if (!raf && !disposed && visible && !document.hidden) raf = requestAnimationFrame(render); }
    const desk = buildJourneyScene(renderer, wake); scene.add(desk.root);
    const baseY = desk.targets.map(target => target.position.y);
    const projected = new THREE.Vector3();
    function render(now: number) {
      raf = 0;
      if (disposed || !visible || document.hidden) { lastTime = 0; return; }
      const { selected: active, paused: still } = state.current;
      const dt = Math.min((now - (lastTime || now)) / 1000, .25); lastTime = now;
      if (active !== previousSelected) { dirty = true; previousSelected = active; hover = -1; }
      if (still && !dirty) return;
      if (!still) elapsed += dt;
      const smoothing = still ? 1 : 1 - Math.exp(-8 * dt);
      angle = THREE.MathUtils.lerp(angle, targetAngle, smoothing); desk.root.rotation.y = angle;
      const destination = active < 0 ? new THREE.Vector3(0, .2, 0) : desk.targets[active].position.clone().multiplyScalar(width < 600 ? .45 : .22);
      destination.y = .25;
      focus.lerp(destination, smoothing);
      camera.position.copy(cameraOffset).add(focus); camera.lookAt(focus);
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, zoom * (active >= 0 ? (width < 600 ? 1.25 : 1.08) : 1), smoothing);
      camera.updateProjectionMatrix();
      desk.targets.forEach((target, i) => { target.position.y = THREE.MathUtils.lerp(target.position.y, baseY[i] + (i === active ? .2 : i === hover && !still ? .1 : 0), smoothing); });
      desk.coverHinge.rotation.z = THREE.MathUtils.lerp(desk.coverHinge.rotation.z, active === 0 ? .3 : hover === 0 && !still ? .12 : 0, smoothing);
      desk.screen.rotation.x = THREE.MathUtils.lerp(desk.screen.rotation.x, active === 4 ? -.29 : -.18, smoothing);
      desk.plant.rotation.z = still ? 0 : Math.sin(elapsed * .65) * .012;
      desk.root.updateMatrixWorld(true); camera.updateMatrixWorld();
      desk.anchors.forEach((anchor, i) => {
        projected.copy(anchor); projected.y += desk.targets[i].position.y - baseY[i];
        desk.root.localToWorld(projected).project(camera);
        const marker = markers.current[i];
        if (marker) {
          const x = THREE.MathUtils.clamp((projected.x * .5 + .5) * width, 24, width - 24);
          const y = THREE.MathUtils.clamp((-projected.y * .5 + .5) * height, 24, height - 24);
          marker.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`;
        }
      });
      renderer.shadowMap.needsUpdate = dirty || Math.abs(angle - targetAngle) > .0005 || desk.targets.some((target, i) => Math.abs(target.position.y - (baseY[i] + (i === active ? .2 : i === hover && !still ? .1 : 0))) > .0005);
      renderer.render(scene, camera); dirty = false;
      el.dataset.frames = String(++frames); el.dataset.viewAngle = angle.toFixed(3);
      if (!still) raf = requestAnimationFrame(render);
    }
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const hit = (e: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set((e.clientX - bounds.left) / bounds.width * 2 - 1, -(e.clientY - bounds.top) / bounds.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(desk.root, true);
      if (!hits.length) return -1;
      let object: THREE.Object3D | null = hits[0].object;
      while (object && object.userData.chapter === undefined) object = object.parent;
      return object?.userData.chapter ?? -1;
    };
    let drag: { id: number; x: number; y: number; start: number; moved: boolean; locked: boolean } | null = null;
    const down = (e: PointerEvent) => { if (!e.isPrimary || e.button !== 0) return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY, start: targetAngle, moved: false, locked: false }; };
    const move = (e: PointerEvent) => {
      if (drag && drag.id === e.pointerId) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) > 9) drag.moved = true;
        if (!drag.locked && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy) * 1.25) { drag.locked = true; renderer.domElement.setPointerCapture(e.pointerId); }
        if (drag.locked) { targetAngle = THREE.MathUtils.clamp(drag.start + dx * .003, -.65, .65); wake(); }
      } else if (e.pointerType === 'mouse') {
        const next = hit(e); if (next !== hover) { hover = next; renderer.domElement.style.cursor = hover >= 0 ? 'pointer' : 'grab'; wake(); }
      }
    };
    const up = (e: PointerEvent) => {
      const current = drag; drag = null;
      if (renderer.domElement.hasPointerCapture(e.pointerId)) renderer.domElement.releasePointerCapture(e.pointerId);
      if (current?.id === e.pointerId && !current.moved) { const index = hit(e); if (index >= 0) state.current.onSelect(index); }
      wake();
    };
    const cancel = () => { drag = null; hover = -1; wake(); };
    const leave = () => { hover = -1; wake(); };
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', cancel); canvas.addEventListener('lostpointercapture', cancel); canvas.addEventListener('pointerleave', leave);
    const resize = new ResizeObserver(() => {
      const bounds = el.getBoundingClientRect(); width = bounds.width; height = bounds.height;
      if (!width || !height) return;
      renderer.setSize(width, height); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const aspect = width / height, span = Math.max(12.8, aspect * 7.7);
      camera.left = -span / 2; camera.right = span / 2; camera.top = span / aspect / 2; camera.bottom = -camera.top;
      camera.updateProjectionMatrix(); wake();
    }); resize.observe(el);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else { cancelAnimationFrame(raf); raf = 0; lastTime = 0; } }); intersection.observe(el);
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; lastTime = 0; } else wake(); };
    document.addEventListener('visibilitychange', visibility);
    const contextLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(raf); raf = 0; visible = false; setStatus('failed'); };
    canvas.addEventListener('webglcontextlost', contextLost);
    controls.current = {
      wake,
      rotate: step => { targetAngle = THREE.MathUtils.clamp(targetAngle + step, -.65, .65); wake(); },
      zoom: step => { zoom = THREE.MathUtils.clamp(zoom + step, .8, 1.35); wake(); },
      reset: () => { targetAngle = 0; zoom = 1; state.current.onSelect(-1); wake(); },
    };
    setStatus('ready'); wake();
    return () => {
      disposed = true; controls.current = null; cancelAnimationFrame(raf); resize.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel); canvas.removeEventListener('lostpointercapture', cancel); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('webglcontextlost', contextLost);
      desk.dispose(); groundGeo.dispose(); groundMat.dispose(); environment.dispose(); pmrem.dispose(); sun.shadow.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    };
  }, []);

  return <div className="j-desk-wrap">
    <div className="j-desk-toolbar"><span>Drag to look around · Pick an object</span><div role="group" aria-label="Desk view controls">
      <button aria-label="Rotate desk left" disabled={status !== 'ready'} onClick={() => controls.current?.rotate(-.15)}>↶</button>
      <button aria-label="Rotate desk right" disabled={status !== 'ready'} onClick={() => controls.current?.rotate(.15)}>↷</button>
      <button aria-label="Zoom out" disabled={status !== 'ready'} onClick={() => controls.current?.zoom(-.1)}>−</button>
      <button aria-label="Zoom in" disabled={status !== 'ready'} onClick={() => controls.current?.zoom(.1)}>+</button>
      <button className="j-reset" disabled={status !== 'ready'} onClick={() => controls.current?.reset()}>Whole desk</button>
    </div></div>
    <div className="j-desk-canvas" ref={host} data-scene-state={status} role="group" aria-label="Mai’s interactive 3D journey desk">
      <div className="j-markers">{names.map((name, index) => <button key={name} ref={node => { markers.current[index] = node; }} aria-label={`Explore ${name}`} aria-pressed={selected === index} onClick={() => onSelect(index)}><span>{index + 1}</span><small>{name}</small></button>)}</div>
      {status !== 'ready' && <div className="j-desk-fallback"><img src="/assets/mai-portrait.webp" alt="Mai at RMIT" /><p role="status">{status === 'loading' ? 'Making room for the next chapter…' : 'The 3D desk couldn’t load. You can still explore every chapter below.'}</p>{status === 'failed' && <button onClick={() => location.reload()}>Try the desk again</button>}</div>}
    </div>
    <div className="j-desk-note"><span>A few things I’ve learned along the way.</span><span>Always room for more.</span></div>
  </div>;
}

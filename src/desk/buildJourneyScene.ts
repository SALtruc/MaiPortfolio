import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Hand-built objects, adapted from Mai's original desk. All photos are genuine assets. */
export function buildJourneyScene(renderer: THREE.WebGLRenderer, invalidate: () => void) {
  const root = new THREE.Group();
  const resources = new Set<THREE.BufferGeometry | THREE.Material | THREE.Texture>();
  const geometryCache = new Map<string, THREE.BufferGeometry>();
  const material = (color: number, roughness = .65, metalness = 0) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    resources.add(value); return value;
  };
  const blue = material(0x315dd3, .38), ink = material(0x1e2939, .5);
  const paper = material(0xfff9ec, .92), white = material(0xf9f8f3, .38);
  const silver = material(0xb9c5cc, .27, .72), edge = material(0x717f88, .35, .7);
  const sage = material(0xb7cbbb, .92), coral = material(0xe49b7f, .65);
  const green = material(0x4f7960, .65), youngGreen = material(0x86aa71, .65);
  const add = (geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
    resources.add(geometry);
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(x, y, z); object.castShadow = true; object.receiveShadow = true;
    parent.add(object); return object;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0, radius = .03) => {
    const key = [w, h, d, radius].join(':');
    let geometry = geometryCache.get(key);
    if (!geometry) { geometry = new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, h / 2, w / 2, d / 2)); geometryCache.set(key, geometry); }
    return add(geometry, mat, parent, x, y, z);
  };
  const cylinder = (top: number, bottom: number, height: number, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => add(new THREE.CylinderGeometry(top, bottom, height, 40), mat, parent, x, y, z);
  const tube = (points: number[][], radius: number, mat: THREE.Material, parent: THREE.Object3D) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p as [number, number, number]))), 32, radius, 8, false), mat, parent);
  const texture = (draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w = 1024, h = 1024) => {
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    draw(canvas.getContext('2d')!, w, h);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); resources.add(tex); return tex;
  };
  const mapped = (map: THREE.Texture, unlit = false) => {
    const value = unlit ? new THREE.MeshBasicMaterial({ map, toneMapped: false }) : new THREE.MeshStandardMaterial({ map, roughness: .88 });
    resources.add(value); return value;
  };
  const surface = (w: number, h: number, mat: THREE.Material, parent: THREE.Object3D, x: number, y: number, z: number, flat = false) => {
    const object = add(new THREE.PlaneGeometry(w, h), mat, parent, x, y, z);
    if (flat) object.rotation.x = -Math.PI / 2;
    object.castShadow = false; return object;
  };
  let disposed = false;
  const loader = new THREE.TextureLoader();
  const photo = (url: string) => {
    const tex = loader.load(url, () => { if (disposed) tex.dispose(); else invalidate(); }, undefined, () => { if (!disposed) invalidate(); });
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); resources.add(tex); return tex;
  };
  const group = (x: number, y: number, z: number, angle = 0, chapter = -1) => {
    const value = new THREE.Group(); value.position.set(x, y, z); value.rotation.y = angle;
    if (chapter >= 0) value.userData.chapter = chapter;
    root.add(value); return value;
  };

  // Satin birch desktop: restrained grain, a layered edge and a stitched desk mat.
  const wood = texture((ctx, w, h) => {
    ctx.fillStyle = '#e1cbb0'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 430; i++) {
      const y = i * h / 430;
      ctx.strokeStyle = `rgba(117,85,53,${.025 + (i % 7) * .008})`;
      ctx.lineWidth = i % 5 === 0 ? 1.6 : .6;
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * .3, y + Math.sin(i * .7) * 8, w * .7, y - 7, w, y + 3); ctx.stroke();
    }
  }, 2048, 1024);
  const woodMat = new THREE.MeshStandardMaterial({ map: wood, roughness: .68 }); resources.add(woodMat);
  box(10.3, .24, 6.1, woodMat, root, 0, -.12, 0, .12);
  box(10.15, .045, 5.96, material(0xbca27e, .8), root, 0, -.24, 0, .02);
  box(9.94, .035, 5.82, paper, root, 0, -.265, 0, .015);
  box(5.9, .035, 3.55, sage, root, .5, .025, -.55, .016);
  for (let i = 0; i < 54; i++) box(.045, .005, .012, paper, root, -2.31 + i * .105, .046, 1.16, .002);

  // 01: Council notebook. Real page edges, chrome wire, ruled notes, cloth cover.
  const notebook = group(-2.15, .12, 1.12, -.16, 0);
  box(2.15, .075, 2.6, blue, notebook);
  for (let i = 0; i < 11; i++) box(2.03, .012, 2.48, i % 3 ? paper : white, notebook, .03, .05 + i * .014, 0, .005);
  const notes = texture((ctx, w, h) => {
    ctx.fillStyle = '#fff9ec'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d9dfe0'; ctx.lineWidth = 2;
    for (let y = 140; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(w - 65, y); ctx.stroke(); }
    ctx.fillStyle = '#254e9a'; ctx.font = '48px Georgia'; ctx.fillText('Listen first.', 100, 200);
    ctx.font = '30px sans-serif'; ctx.fillText('People behind the numbers.', 100, 330);
    ctx.fillText('Ask. Organise. Follow through.', 100, 450);
  });
  surface(1.94, 2.4, mapped(notes), notebook, .03, .211, 0, true);
  const coverHinge = new THREE.Group(); coverHinge.position.set(-1.04, .23, 0); notebook.add(coverHinge);
  box(2.15, .055, 2.6, blue, coverHinge, 1.04, 0, 0, .026);
  const cover = texture((ctx, w, h) => {
    ctx.fillStyle = '#315dd3'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { ctx.fillStyle = y % 8 ? '#ffffff05' : '#00000005'; ctx.fillRect(0, y, w, 1); }
    ctx.fillStyle = '#fff9ec'; ctx.font = '36px sans-serif'; ctx.fillText('NOTES TO GROW BY', 100, 140);
    ctx.font = 'bold 104px sans-serif'; ctx.fillText('People.', 100, 380); ctx.fillText('Then', 100, 500); ctx.fillText('numbers.', 100, 620);
    ctx.font = '31px sans-serif'; ctx.fillText('STUDENT COUNCIL', 100, 870); ctx.fillText('2024 — 2026', 100, 925);
  });
  surface(2.04, 2.5, mapped(cover), coverHinge, 1.04, .03, 0, true);
  for (let i = 0; i < 11; i++) { const ring = add(new THREE.TorusGeometry(.115, .018, 8, 28), silver, notebook, -1.07, .19, -1.12 + i * .224); ring.rotation.y = Math.PI / 2; }
  for (let i = 0; i < 3; i++) box(.18, .025, .28, [coral, sage, white][i], notebook, 1.08, .09 + i * .03, -.65 + i * .48, .008);
  box(.07, .013, 2.54, ink, coverHinge, 1.8, .037, 0, .005);

  // 02: A phone holding campaign notes, with camera lens, buttons and a charging lead.
  const phone = group(2.85, .12, 1.23, -.27, 1);
  box(1.02, .12, 1.97, coral, phone, 0, 0, 0, .06);
  box(.92, .026, 1.86, ink, phone, 0, .073, 0, .012);
  const phoneScreen = texture((ctx, w, h) => {
    ctx.fillStyle = '#f8f5ed'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#202d40'; ctx.font = 'bold 42px sans-serif'; ctx.fillText('A next step.', 45, 160);
    ctx.font = '24px sans-serif'; ctx.fillText('CTM / 2025', 45, 210);
    ['Content', 'Conversation', 'Follow-up'].forEach((text, i) => {
      ctx.fillStyle = ['#d9e4d8', '#f1c8b6', '#cedafb'][i]; ctx.fillRect(40, 290 + i * 180, w - 80, 140);
      ctx.fillStyle = '#202d40'; ctx.font = '32px sans-serif'; ctx.fillText(text, 65, 375 + i * 180);
    });
    ctx.fillStyle = '#315dd3'; ctx.fillRect(175, h - 40, w - 350, 7);
  }, 512, 1024);
  surface(.86, 1.77, mapped(phoneScreen, true), phone, 0, .088, 0, true);
  box(.2, .006, .034, ink, phone, 0, .092, -.8, .003);
  box(.026, .04, .25, edge, phone, .514, 0, -.3, .008);
  tube([[2.62,.09,2.23],[2.8,.06,2.62],[3.55,.06,2.5],[4.15,.06,2.75]], .019, white, root);

  // 03: The Career Ready badge and a real photo in a supported frame.
  const frame = group(-3.15, .12, -1.65, .12, 2);
  box(1.6, .12, .8, blue, frame, 0, .02, .12, .035);
  const frameFace = new THREE.Group(); frameFace.rotation.x = -.1; frame.add(frameFace);
  box(1.7, 1.98, .12, white, frameFace, 0, 1.05, 0, .04);
  const networkingPhoto = photo('/assets/mai-networking.webp'); networkingPhoto.repeat.x = .72; networkingPhoto.offset.x = .12;
  surface(1.48, 1.37, mapped(networkingPhoto, true), frameFace, 0, 1.22, .065);
  const label = texture((ctx, w, h) => { ctx.fillStyle = '#fffef9'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#294f9a'; ctx.font = '36px sans-serif'; ctx.fillText('Finding my voice.', 35, 65); ctx.font = '22px sans-serif'; ctx.fillText('RMIT CAREERS / 2025–26', 35, 110); }, 600, 140);
  surface(1.48, .35, mapped(label), frameFace, 0, .33, .065);
  tube([[-.5,.12,.1],[-.5,1.2,-.4],[0,1.5,-.45],[.5,1.2,-.4],[.5,.12,.1]], .035, silver, frame);
  const badge = box(.7, .025, .96, white, frame, .7, .09, .88, .012); badge.rotation.y = -.2;
  tube([[.4,.12,.48],[.05,.11,.6],[-.35,.1,.45],[-.35,.1,.15],[.1,.1,.05],[.65,.11,.4]], .045, blue, frame);

  // 04: A project folder with clipped analysis sheets and a mechanical pencil.
  const folder = group(.45, .12, 1.6, .12, 3);
  box(1.8, .07, 2.25, sage, folder, 0, 0, 0, .025);
  box(.6, .04, .2, sage, folder, -.53, 0, -1.17, .012);
  for (let i = 0; i < 4; i++) box(1.67, .012, 2.08, paper, folder, i * .016, .046 + i * .016, 0, .005);
  const report = texture((ctx, w, h) => {
    ctx.fillStyle = '#fff9ec'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#253c47'; ctx.font = 'bold 55px sans-serif'; ctx.fillText('A clearer picture.', 70, 130);
    ctx.font = '28px sans-serif'; ctx.fillText('MICHELIN / SOLAR ENERGY PROJECT', 70, 190);
    ctx.fillStyle = '#d7e5d4'; ctx.fillRect(70, 250, w - 140, 220);
    ctx.fillStyle = '#375f4e'; ctx.font = '40px sans-serif'; ctx.fillText('Inputs → understanding', 105, 380);
    ctx.strokeStyle = '#a9bbb1'; ctx.lineWidth = 2;
    for (let y = 550; y < 950; y += 65) { ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(w - 70, y); ctx.stroke(); }
    for (let x = 70; x <= w - 70; x += 220) { ctx.beginPath(); ctx.moveTo(x, 550); ctx.lineTo(x, 940); ctx.stroke(); }
    ctx.fillStyle = '#405c4c'; ctx.font = '26px sans-serif'; ctx.fillText('Organise. Check. Follow through.', 90, 1020);
  }, 1024, 1280);
  surface(1.62, 2.03, mapped(report), folder, .04, .105, 0, true);
  box(.48, .09, .2, ink, folder, 0, .14, -1.03, .02);
  const clip = add(new THREE.TorusGeometry(.095, .012, 8, 24, Math.PI * 1.6), silver, folder, 0, .23, -1.03); clip.rotation.x = Math.PI / 2;
  const pencil = cylinder(.025, .025, 1.65, blue, folder, 1.04, .09, 0); pencil.rotation.x = Math.PI / 2;
  const tip = add(new THREE.ConeGeometry(.026, .16, 12), silver, folder, 1.04, .09, -.9); tip.rotation.x = -Math.PI / 2;

  const solar = new THREE.Group(); solar.position.set(.39, .19, -.51); solar.rotation.x = -.18; folder.add(solar);
  box(.86, .045, .68, silver, solar, 0, 0, 0, .012);
  const solarCell = material(0x233e5f, .28, .35);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
    box(.188, .012, .19, solarCell, solar, -.3 + col * .2, .027, -.205 + row * .205, .006);
    box(.003, .003, .18, silver, solar, -.3 + col * .2, .035, -.205 + row * .205, .001);
  }

  // 05: Laptop. Separate keycaps, speaker grilles, bevels, hinge and a calm Day 1 screen.
  const laptop = group(.65, .13, -1.05, -.08, 4);
  box(2.85, .12, 1.95, silver, laptop, 0, 0, .1, .055);
  box(2.72, .025, 1.8, material(0xd5dce1, .35, .5), laptop, 0, .073, .1, .012);
  box(.93, .006, .53, edge, laptop, 0, .09, .65, .003);
  box(.9, .007, .5, silver, laptop, 0, .094, .65, .003);
  const keyGeometry = new RoundedBoxGeometry(.173, .035, .147, 2, .016); resources.add(keyGeometry);
  const keys = new THREE.InstancedMesh(keyGeometry, ink, 52); keys.castShadow = true; keys.receiveShadow = true;
  const dummy = new THREE.Object3D();
  for (let row = 0; row < 4; row++) for (let col = 0; col < 13; col++) { dummy.position.set(-1.15 + col * .192, .11, -.47 + row * .185); dummy.updateMatrix(); keys.setMatrixAt(row * 13 + col, dummy.matrix); }
  laptop.add(keys); box(.95, .033, .14, ink, laptop, 0, .11, .27, .015);
  for (const x of [-1.31, 1.31]) for (let i = 0; i < 17; i++) box(.045, .003, .017, edge, laptop, x, .091, -.55 + i * .048, .001);
  const hinge = cylinder(.065, .065, 2.4, edge, laptop, 0, .03, -.82); hinge.rotation.z = Math.PI / 2;
  const screen = new THREE.Group(); screen.position.set(0, .1, -.82); screen.rotation.x = -.18; laptop.add(screen);
  box(2.86, 1.94, .1, silver, screen, 0, .97, 0, .045);
  box(2.75, 1.83, .016, ink, screen, 0, .97, .057, .007);
  const display = texture((ctx, w, h) => {
    ctx.fillStyle = '#edf2ef'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#dae3df'; ctx.fillRect(0, 0, w, 58);
    ctx.fillStyle = '#294f47'; ctx.font = '24px sans-serif'; ctx.fillText('A NEW CHAPTER', 45, 39);
    ctx.font = 'bold 88px sans-serif'; ctx.fillText('Always', 70, 220); ctx.fillText('Day 1.', 70, 325);
    ctx.font = '26px sans-serif'; ctx.fillText('TIKTOK / BYTEDANCE', 75, 415);
    ctx.font = '23px sans-serif'; ctx.fillText('AI Data Service & Operations', 75, 463);
    ctx.fillStyle = '#c3d5bc'; ctx.beginPath(); ctx.ellipse(790, 280, 100, 140, .4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#537f60'; ctx.beginPath(); ctx.ellipse(880, 195, 65, 110, -.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#355642'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(810, 430); ctx.quadraticCurveTo(790, 290, 880, 170); ctx.stroke();
    ctx.fillStyle = '#fffefa'; ctx.fillRect(60, h - 60, w - 120, 30);
  }, 1024, 640);
  surface(2.6, 1.625, mapped(display, true), screen, 0, .99, .069);
  const webcam = add(new THREE.SphereGeometry(.016, 12, 8), material(0x263845, .15, .5), screen, 0, 1.88, .069);
  webcam.scale.z = .3;
  const sticker = texture((ctx, w, h) => { ctx.fillStyle = '#f2d7b8'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#345148'; ctx.font = 'bold 35px sans-serif'; ctx.fillText('keep growing', 20, 65); }, 300, 100);
  surface(.64, .21, mapped(sticker), laptop, .97, .096, .64, true);

  // Everyday details give the desk a lived-in scale: lamp, ceramic mug, books, sprout.
  const lamp = group(-4.35, .08, -2.1);
  cylinder(.48, .51, .13, coral, lamp, 0, 0, 0);
  tube([[0,.04,0],[0,.7,0],[.12,1.25,-.08],[.17,1.85,-.12],[.25,2,-.05]], .052, silver, lamp);
  const shade = add(new THREE.CylinderGeometry(.22, .48, .42, 48, 1, true), coral, lamp, .28, 1.87, 0); shade.rotation.z = -.3;
  cylinder(.41, .41, .012, paper, lamp, .34, 1.67, 0);
  tube([[-4.05,.05,-1.9],[-4.5,.05,-2.4],[-3.9,.05,-2.65],[-3.4,.05,-3.03]], .024, ink, root);
  const plant = group(3.78, .08, -1.85);
  const potProfile = [[.27,0],[.34,.04],[.41,.64],[.43,.7],[.38,.72],[.35,.65],[.31,.1]].map(([x,y]) => new THREE.Vector2(x,y));
  add(new THREE.LatheGeometry(potProfile, 48), white, plant);
  cylinder(.35,.35,.02,material(0x66543e,1),plant,0,.65,0);
  for (let i = 0; i < 6; i++) {
    const a = i * 2.4, x = Math.cos(a) * .44, z = Math.sin(a) * .4, y = 1.05 + (i % 3) * .24;
    tube([[0,.64,0],[x * .3,y * .8,z * .3],[x,y,z]], .013, green, plant);
    const leaf = add(new THREE.SphereGeometry(.23, 20, 12), i % 2 ? youngGreen : green, plant, x, y, z);
    leaf.scale.set(.65,.12,1.6); leaf.rotation.set(.25,a,-.3);
    tube([[x,y+.03,z-.12],[x,y+.04,z],[x,y+.03,z+.18]], .006, youngGreen, plant);
  }
  const books = group(3.65,.06,-.3,.1);
  ['Questions', 'Ideas', 'Next steps'].forEach((title,i) => {
    box(1.25,.035,.94,i%2?blue:coral,books,0,i*.2,0,.012);
    box(1.18,.13,.87,paper,books,.02,.08+i*.2,0,.008);
    box(1.25,.035,.94,i%2?blue:coral,books,0,.16+i*.2,0,.012);
    const spine=texture((ctx,w,h)=>{ctx.fillStyle=i%2?'#315dd3':'#e49b7f';ctx.fillRect(0,0,w,h);ctx.fillStyle=i%2?'#fff9ec':'#253c47';ctx.font='30px sans-serif';ctx.fillText(title,30,48)},400,70);
    surface(1.24,.17,mapped(spine),books,0,.08+i*.2,.48);
  });
  const mug = group(4,.1,1.15);
  cylinder(.5,.5,.035,sage,mug,0,0,0);
  const mugProfile=[[.25,0],[.32,.06],[.35,.62],[.34,.67],[.29,.66],[.28,.12]].map(([x,y])=>new THREE.Vector2(x,y));
  add(new THREE.LatheGeometry(mugProfile,48),white,mug,0,.02,0);
  cylinder(.29,.29,.012,material(0x614532,.35),mug,0,.57,0);
  add(new THREE.TorusGeometry(.22,.057,12,32),white,mug,.37,.35,0);
  const pencils=group(-4.05,.08,.1);
  cylinder(.27,.25,.53,sage,pencils,0,.27,0);
  cylinder(.23,.23,.015,ink,pencils,0,.54,0);
  for(let i=0;i<4;i++){const pen=cylinder(.026,.026,1.03,i%2?coral:blue,pencils,(i-1.5)*.09,.8,Math.sin(i)*.08);pen.rotation.z=(i-1.5)*.14;}
  // A folded paper plane, anchored on the desk rather than orbiting the reader.
  const airplane=group(-.65,.16,-2.25,-.35);
  const folded=new THREE.BufferGeometry();folded.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.55,-.4,0,.35,-.06,.15,.15,0,0,-.55,.4,0,.35,.06,.15,.15,0,0,-.55,-.06,.15,.15,0,-.08,.3,0,0,-.55,.06,.15,.15,0,-.08,.3],3));folded.computeVertexNormals();
  const planeMat=new THREE.MeshStandardMaterial({color:0xfff6db,side:THREE.DoubleSide,roughness:.85});resources.add(planeMat);add(folded,planeMat,airplane);

  const targets=[notebook,phone,frame,folder,laptop];
  const anchors=targets.map((g,i)=>g.position.clone().add(new THREE.Vector3(0,[.8,.35,2.3,.35,2.35][i],0)));
  return {root,targets,anchors,coverHinge,screen,plant,
    dispose:()=>{disposed=true;keys.dispose();resources.forEach(resource=>resource.dispose());}
  };
}

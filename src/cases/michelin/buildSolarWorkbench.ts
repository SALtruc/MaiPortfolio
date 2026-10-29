import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export type WorkbenchFocus = 'overview' | 'vendors' | 'proposals' | 'departments';

export interface SolarWorkbenchScene {
  root: THREE.Group;
  clusters: THREE.Group[];
  anchors: THREE.Vector3[];
  vendorPackets: THREE.Object3D[];
  proposalSheets: THREE.Object3D[];
  departmentBlocks: THREE.Object3D[];
  solarCanopyPivot: THREE.Group;
  solarCellMaterials: THREE.MeshStandardMaterial[];
  connectorMaterials: THREE.MeshStandardMaterial[];
  pencil: THREE.Object3D;
  dispose: () => void;
}

/**
 * Hand-built illustrative 3D solar-finance coordination workbench for the Michelin case study.
 * Stages the real process facts (12+ vendors, 15+ proposals, 4+ internal departments,
 * Southern Vietnam dealership contract finalisation) as tangible objects without inventing
 * confidential financial figures or kW telemetry.
 */
export function buildSolarWorkbench(
  renderer: THREE.WebGLRenderer,
  invalidate: () => void,
): SolarWorkbenchScene {
  const root = new THREE.Group();
  const resources = new Set<THREE.BufferGeometry | THREE.Material | THREE.Texture>();
  const geometryCache = new Map<string, THREE.BufferGeometry>();
  let disposed = false;

  const material = (
    color: number,
    roughness = 0.62,
    metalness = 0,
    emissive = 0x000000,
    emissiveIntensity = 0,
  ) => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      emissive,
      emissiveIntensity,
    });
    resources.add(mat);
    return mat;
  };

  const cobalt = material(0x2952c8, 0.38, 0.08);
  const ink = material(0x151e28, 0.48, 0.05);
  const paper = material(0xfbfaf5, 0.9, 0);
  const warmPaper = material(0xf5f1e4, 0.92, 0);
  const sage = material(0xdce5d8, 0.88, 0);
  const sageDeep = material(0x44614b, 0.58, 0.04);
  const forest = material(0x284c3e, 0.52, 0.06);
  const silver = material(0xc2cdd4, 0.28, 0.72);
  const aluminum = material(0x8b99a3, 0.34, 0.68);
  const amber = material(0xd48a29, 0.42, 0.18, 0xd48a29, 0.12);
  const terracotta = material(0xd98a6c, 0.62, 0.04);

  const add = (
    geometry: THREE.BufferGeometry,
    mat: THREE.Material,
    parent: THREE.Object3D,
    x = 0,
    y = 0,
    z = 0,
  ) => {
    resources.add(geometry);
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const box = (
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    parent: THREE.Object3D,
    x = 0,
    y = 0,
    z = 0,
    radius = 0.028,
  ) => {
    const key = [w, h, d, radius].join(':');
    let geometry = geometryCache.get(key);
    if (!geometry) {
      geometry = new RoundedBoxGeometry(
        w,
        h,
        d,
        3,
        Math.min(radius, w / 2, h / 2, d / 2),
      );
      geometryCache.set(key, geometry);
    }
    return add(geometry, mat, parent, x, y, z);
  };

  const cylinder = (
    top: number,
    bottom: number,
    height: number,
    mat: THREE.Material,
    parent: THREE.Object3D,
    x = 0,
    y = 0,
    z = 0,
  ) => add(new THREE.CylinderGeometry(top, bottom, height, 32), mat, parent, x, y, z);

  const tube = (
    points: [number, number, number][],
    radius: number,
    mat: THREE.Material,
    parent: THREE.Object3D,
  ) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(pt => new THREE.Vector3(pt[0], pt[1], pt[2])),
    );
    return add(new THREE.TubeGeometry(curve, 32, radius, 10, false), mat, parent);
  };

  const font = (size: number, weight = '600') =>
    `${weight} ${size}px "Outfit", "DM Sans", sans-serif`;

  const makeCanvasTexture = (
    draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
    w = 1024,
    h = 1024,
  ) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    resources.add(tex);
    document.fonts?.ready.then(() => {
      if (disposed) return;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h);
      tex.needsUpdate = true;
      invalidate();
    });
    return tex;
  };

  const mappedMaterial = (map: THREE.Texture, unlit = false) => {
    const mat = unlit
      ? new THREE.MeshBasicMaterial({ map, toneMapped: false })
      : new THREE.MeshStandardMaterial({ map, roughness: 0.86 });
    resources.add(mat);
    return mat;
  };

  const surface = (
    w: number,
    h: number,
    mat: THREE.Material,
    parent: THREE.Object3D,
    x = 0,
    y = 0,
    z = 0,
    flat = false,
  ) => {
    const plane = add(new THREE.PlaneGeometry(w, h), mat, parent, x, y, z);
    if (flat) plane.rotation.x = -Math.PI / 2;
    plane.castShadow = false;
    return plane;
  };

  const loader = new THREE.TextureLoader();
  const loadPhoto = (url: string) => {
    const tex = loader.load(
      url,
      () => {
        if (disposed) tex.dispose();
        else invalidate();
      },
      undefined,
      () => {
        if (!disposed) invalidate();
      },
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    resources.add(tex);
    return tex;
  };

  // --- Base Workbench & Architectural Drafting Mat ---
  const woodTex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#dfcab0';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 360; i++) {
      const y = (i * h) / 360;
      ctx.strokeStyle = `rgba(110, 78, 46, ${0.022 + (i % 6) * 0.007})`;
      ctx.lineWidth = i % 4 === 0 ? 1.5 : 0.7;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        w * 0.32,
        y + Math.sin(i * 0.6) * 7,
        w * 0.68,
        y - 6,
        w,
        y + 3,
      );
      ctx.stroke();
    }
  }, 2048, 1024);

  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.68 });
  resources.add(woodMat);

  box(10.8, 0.24, 6.2, woodMat, root, 0, -0.14, 0, 0.1);
  box(10.58, 0.04, 5.98, material(0xbfa482, 0.8), root, 0, -0.27, 0, 0.02);

  // Architectural drafting mat with subtle coordinate grid
  const matTex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#e7ede4';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(68, 97, 75, 0.13)';
    ctx.lineWidth = 1.5;
    for (let x = 64; x < w; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, h - 40);
      ctx.stroke();
    }
    for (let y = 64; y < h; y += 64) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 40, y);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(41, 82, 200, 0.26)';
    ctx.lineWidth = 3;
    ctx.strokeRect(42, 42, w - 84, h - 84);
    ctx.fillStyle = '#334e3d';
    ctx.font = font(24, '600');
    ctx.fillText('MICHELIN VIETNAM / SOLAR PROJECT COORDINATION', 72, 86);
    ctx.fillStyle = '#536b5c';
    ctx.font = font(20, '500');
    ctx.fillText('01 VENDOR INTAKE (12+)          02 PROPOSAL MATRIX (15+)          03 ALIGNMENT & ROLLOUT (4+ TEAMS)', 72, h - 62);
  }, 2048, 1152);

  box(9.8, 0.032, 5.3, sage, root, 0, 0.0, 0, 0.016);
  surface(9.56, 5.08, mappedMaterial(matTex), root, 0, 0.018, 0, true);

  // Connecting process conduits across the workbench
  const connector1Mat = material(0x2952c8, 0.35, 0.2, 0x2952c8, 0.08);
  const connector2Mat = material(0x44614b, 0.4, 0.15, 0x44614b, 0.06);
  const connector3Mat = material(0xd48a29, 0.38, 0.22, 0xd48a29, 0.12);
  const connectorMaterials = [connector1Mat, connector2Mat, connector3Mat];

  tube(
    [
      [-2.35, 0.05, 0.35],
      [-1.55, 0.07, 0.48],
      [-0.95, 0.05, 0.42],
    ],
    0.022,
    connector1Mat,
    root,
  );
  tube(
    [
      [0.72, 0.05, 0.36],
      [1.38, 0.08, 0.18],
      [1.92, 0.05, -0.05],
    ],
    0.022,
    connector2Mat,
    root,
  );
  tube(
    [
      [2.55, 0.06, 0.65],
      [2.72, 0.12, 0.15],
      [2.78, 0.18, -0.35],
    ],
    0.02,
    connector3Mat,
    root,
  );

  // =========================================================================
  // CLUSTER 0: 12+ VENDOR INPUTS (Left Workbench Zone)
  // =========================================================================
  const vendorsCluster = new THREE.Group();
  vendorsCluster.position.set(-3.18, 0.03, 0.22);
  vendorsCluster.rotation.y = 0.08;
  vendorsCluster.userData.focusIndex = 0;
  root.add(vendorsCluster);

  // Intake tray base
  box(2.36, 0.06, 3.12, forest, vendorsCluster, 0, 0, 0, 0.024);
  box(2.2, 0.024, 2.96, warmPaper, vendorsCluster, 0, 0.038, 0, 0.012);

  // Header placard on the vendor intake tray
  const vendorTrayTex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#fbfaf5';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2952c8';
    ctx.fillRect(0, 0, w, 84);
    ctx.fillStyle = '#ffffff';
    ctx.font = font(28, '700');
    ctx.fillText('01 · VENDOR INTAKE RAIL', 40, 54);
    ctx.fillStyle = '#151e28';
    ctx.font = font(56, '700');
    ctx.fillText('12+ Vendors', 40, 166);
    ctx.fillStyle = '#44614b';
    ctx.font = font(26, '600');
    ctx.fillText('Coordinated project information', 40, 214);
  }, 768, 256);
  surface(2.02, 0.68, mappedMaterial(vendorTrayTex), vendorsCluster, 0, 0.053, -1.04, true);

  // 12 physical vendor dossier packets arranged in a 3 cols × 4 rows stepped rack
  const vendorPackets: THREE.Object3D[] = [];
  const tabColors = [cobalt, sageDeep, terracotta, amber];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const packet = new THREE.Group();
      const px = -0.64 + col * 0.64;
      const pz = -0.36 + row * 0.48;
      const py = 0.065 + row * 0.012;
      packet.position.set(px, py, pz);
      packet.userData.baseY = py;
      packet.userData.focusIndex = 0;

      // Dossier card body
      box(0.54, 0.028, 0.36, idx % 2 === 0 ? paper : warmPaper, packet, 0, 0, 0, 0.008);
      // Colored index tab on each vendor dossier
      box(
        0.18,
        0.032,
        0.08,
        tabColors[idx % tabColors.length],
        packet,
        -0.14 + (idx % 3) * 0.12,
        0.006,
        -0.16,
        0.004,
      );
      // Ruled line strip on top of packet
      box(0.42, 0.006, 0.04, cobalt, packet, 0, 0.016, -0.04, 0.002);
      box(0.36, 0.005, 0.03, aluminum, packet, -0.03, 0.016, 0.05, 0.002);

      vendorsCluster.add(packet);
      vendorPackets.push(packet);
    }
  }

  // =========================================================================
  // CLUSTER 1: 15+ PROPOSALS EVALUATED (Center Workbench Zone)
  // =========================================================================
  const proposalsCluster = new THREE.Group();
  proposalsCluster.position.set(-0.12, 0.03, 0.36);
  proposalsCluster.rotation.y = -0.03;
  proposalsCluster.userData.focusIndex = 1;
  root.add(proposalsCluster);

  // Michelin deep-forest project folder
  box(2.42, 0.075, 2.98, forest, proposalsCluster, 0, 0, 0, 0.026);
  box(0.76, 0.046, 0.26, forest, proposalsCluster, -0.68, 0, -1.54, 0.014);

  // 15 layered proposal evaluation sheets inside the folder
  const proposalSheets: THREE.Object3D[] = [];
  for (let i = 0; i < 15; i++) {
    const sheet = new THREE.Group();
    const sy = 0.046 + i * 0.011;
    const sx = ((i % 3) - 1) * 0.018;
    const sz = ((i % 5) - 2) * 0.014;
    sheet.position.set(sx, sy, sz);
    sheet.rotation.y = ((i % 4) - 1.5) * 0.012;
    sheet.userData.baseY = sy;
    sheet.userData.focusIndex = 1;
    box(2.14, 0.009, 2.66, i % 2 === 0 ? paper : warmPaper, sheet, 0, 0, 0, 0.004);
    // Side comparison index tab for each of the 15 proposals
    box(
      0.09,
      0.011,
      0.13,
      i < 5 ? cobalt : i < 10 ? sageDeep : amber,
      sheet,
      1.09,
      0.002,
      -1.12 + i * 0.16,
      0.003,
    );
    proposalsCluster.add(sheet);
    proposalSheets.push(sheet);
  }

  // Top cover sheet with structured comparison matrix texture
  const matrixTex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, w, h);

    // Top banner
    ctx.fillStyle = '#284c3e';
    ctx.fillRect(56, 52, w - 112, 118);
    ctx.fillStyle = '#f5f4ee';
    ctx.font = font(25, '600');
    ctx.fillText('MICHELIN VIETNAM · GREEN FINANCE', 88, 98);
    ctx.font = font(44, '700');
    ctx.fillText('15+ Proposals Evaluated', 88, 148);

    // Subheader pill
    ctx.fillStyle = '#dce6dc';
    ctx.fillRect(56, 194, w - 112, 86);
    ctx.fillStyle = '#1f3b2e';
    ctx.font = font(30, '600');
    ctx.fillText('Comparable basis for cross-department discussion', 84, 248);

    // Matrix table header
    const tableTop = 316;
    ctx.fillStyle = '#2952c8';
    ctx.fillRect(56, tableTop, w - 112, 58);
    ctx.fillStyle = '#ffffff';
    ctx.font = font(22, '600');
    ctx.fillText('PROPOSAL SCOPE          VENDOR INPUT          DEPT REVIEW          STATUS', 82, tableTop + 37);

    // Matrix rows (illustrative structured bars, no fake dollar numbers)
    for (let r = 0; r < 8; r++) {
      const ry = tableTop + 68 + r * 82;
      ctx.fillStyle = r % 2 === 0 ? '#f4f6f2' : '#ffffff';
      ctx.fillRect(56, ry, w - 112, 72);
      ctx.fillStyle = '#2952c8';
      ctx.font = font(22, '700');
      ctx.fillText(`P-${String(r + 1).padStart(2, '0')}`, 80, ry + 44);

      // Bar representing structured criteria check
      ctx.fillStyle = '#c5d4c6';
      ctx.fillRect(190, ry + 24, 210, 22);
      ctx.fillStyle = '#44614b';
      ctx.fillRect(190, ry + 24, 145 + (r % 3) * 28, 22);

      ctx.fillStyle = '#d4dff6';
      ctx.fillRect(450, ry + 24, 210, 22);
      ctx.fillStyle = '#2952c8';
      ctx.fillRect(450, ry + 24, 150 + ((r + 1) % 3) * 25, 22);

      // Status pill
      ctx.fillStyle = r < 6 ? '#dce8dc' : '#f7e6c4';
      ctx.fillRect(720, ry + 18, 210, 36);
      ctx.fillStyle = r < 6 ? '#284c3e' : '#8a5612';
      ctx.font = font(20, '600');
      ctx.fillText(r < 6 ? 'COMPARED' : 'FOLLOW-UP', 754, ry + 43);
    }

    ctx.fillStyle = '#284c3e';
    ctx.font = font(28, '700');
    ctx.fillText('12+ vendors  →  15+ proposals  →  4+ internal departments', 78, h - 68);
  }, 1024, 1280);

  const topSheetParent = proposalSheets[proposalSheets.length - 1];
  surface(2.04, 2.54, mappedMaterial(matrixTex), topSheetParent, 0, 0.007, 0, true);

  // Binder clip & drafting pencil on the folder
  box(0.56, 0.09, 0.22, ink, proposalsCluster, 0, 0.22, -1.36, 0.02);
  const clip = add(
    new THREE.TorusGeometry(0.1, 0.014, 8, 24, Math.PI * 1.6),
    silver,
    proposalsCluster,
    0,
    0.31,
    -1.36,
  );
  clip.rotation.x = Math.PI / 2;

  const pencil = new THREE.Group();
  pencil.position.set(1.34, 0.09, 0.15);
  proposalsCluster.add(pencil);
  const pencilShaft = cylinder(0.028, 0.028, 1.95, cobalt, pencil, 0, 0, 0);
  pencilShaft.rotation.x = Math.PI / 2;
  const pencilTip = add(new THREE.ConeGeometry(0.029, 0.18, 14), silver, pencil, 0, 0, -1.06);
  pencilTip.rotation.x = -Math.PI / 2;

  // =========================================================================
  // CLUSTER 2: 4+ INTERNAL DEPARTMENTS & DEALERSHIP SOLAR CANOPY (Right Zone)
  // =========================================================================
  const departmentsCluster = new THREE.Group();
  departmentsCluster.position.set(3.05, 0.03, -0.05);
  departmentsCluster.rotation.y = -0.08;
  departmentsCluster.userData.focusIndex = 2;
  root.add(departmentsCluster);

  // Base platform for Dealership Rollout & Department Alignment
  box(2.88, 0.065, 3.62, warmPaper, departmentsCluster, 0, 0, 0, 0.028);
  box(2.72, 0.024, 3.46, sage, departmentsCluster, 0, 0.04, 0, 0.014);

  // 4+ Internal Department Alignment Blocks in the foreground of Cluster 2
  const departmentBlocks: THREE.Object3D[] = [];
  const deptTitles = ['FINANCE', 'PROCUREMENT', 'DEALERSHIPS', 'EXECUTION +'];
  for (let d = 0; d < 4; d++) {
    const block = new THREE.Group();
    const bx = -0.96 + d * 0.64;
    const bz = 1.22;
    const by = 0.085;
    block.position.set(bx, by, bz);
    block.userData.baseY = by;
    block.userData.focusIndex = 2;

    box(0.54, 0.11, 0.68, d === 3 ? cobalt : forest, block, 0, 0, 0, 0.018);
    const deptTex = makeCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = d === 3 ? '#2952c8' : '#284c3e';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#d48a29';
      ctx.fillRect(24, 24, w - 48, 12);
      ctx.fillStyle = '#ffffff';
      ctx.font = font(42, '700');
      ctx.fillText(`0${d + 1}`, 28, 92);
      ctx.font = font(24, '600');
      ctx.fillText(deptTitles[d], 28, 146);
    }, 256, 192);
    surface(0.48, 0.58, mappedMaterial(deptTex), block, 0, 0.058, 0, true);

    departmentsCluster.add(block);
    departmentBlocks.push(block);
  }

  // Southern Vietnam Dealership Canopy & Articulated 12-Bay Solar Array Model
  const dealershipBase = new THREE.Group();
  dealershipBase.position.set(0, 0.06, -0.38);
  departmentsCluster.add(dealershipBase);

  // Architectural plinth & columns of the dealership bay canopy
  box(2.44, 0.08, 1.98, paper, dealershipBase, 0, 0.04, 0, 0.02);
  const columnPositions: [number, number][] = [
    [-0.95, -0.68],
    [0.95, -0.68],
    [-0.95, 0.68],
    [0.95, 0.68],
  ];
  columnPositions.forEach(([cx, cz]) => {
    cylinder(0.055, 0.055, 0.72, silver, dealershipBase, cx, 0.42, cz);
  });

  // Dealership fascia sign in Michelin cobalt & warm paper
  box(2.38, 0.18, 1.88, paper, dealershipBase, 0, 0.78, 0, 0.02);
  box(2.42, 0.07, 0.06, cobalt, dealershipBase, 0, 0.81, 0.93, 0.01);
  const fasciaTex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#2952c8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.font = font(34, '700');
    ctx.fillText('SOUTHERN VIETNAM DEALERSHIPS · CONTRACT FINALISATION', 36, 56);
  }, 1024, 84);
  surface(2.32, 0.14, mappedMaterial(fasciaTex, true), dealershipBase, 0, 0.78, 0.945);

  // Framed real dealership team photograph standee beside the canopy
  const photoStand = new THREE.Group();
  photoStand.position.set(-0.78, 0.08, 0.52);
  photoStand.rotation.y = 0.22;
  photoStand.rotation.x = -0.12;
  dealershipBase.add(photoStand);
  box(0.86, 0.64, 0.05, paper, photoStand, 0, 0.32, 0, 0.014);
  const teamTexture = loadPhoto('/assets/michelin-team.webp');
  surface(0.76, 0.52, mappedMaterial(teamTexture, true), photoStand, 0, 0.34, 0.028);

  // Articulated Solar Canopy Pivot (tilts smoothly when user changes tilt or lens)
  const solarCanopyPivot = new THREE.Group();
  solarCanopyPivot.position.set(0, 0.94, 0);
  solarCanopyPivot.rotation.x = -0.26; // ~15 deg initial tilt
  dealershipBase.add(solarCanopyPivot);

  // Aluminum solar rack frame
  box(2.36, 0.065, 1.82, silver, solarCanopyPivot, 0, 0, 0, 0.018);
  box(2.26, 0.025, 1.72, ink, solarCanopyPivot, 0, 0.036, 0, 0.01);

  // 3 rows × 4 columns = 12 photovoltaic solar module bays
  const solarCellMaterials: THREE.MeshStandardMaterial[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const cellMat = material(0x1d3858, 0.24, 0.42, 0x2952c8, 0.06);
      solarCellMaterials.push(cellMat);
      const cx = -0.78 + col * 0.52;
      const cz = -0.52 + row * 0.52;
      box(0.47, 0.018, 0.47, cellMat, solarCanopyPivot, cx, 0.052, cz, 0.006);
      // Silver busbars across each solar module
      box(0.008, 0.005, 0.44, silver, solarCanopyPivot, cx - 0.1, 0.063, cz, 0.001);
      box(0.008, 0.005, 0.44, silver, solarCanopyPivot, cx + 0.1, 0.063, cz, 0.001);
      // Warm amber junction indicator at corner of module
      box(0.05, 0.006, 0.03, amber, solarCanopyPivot, cx + 0.18, 0.064, cz + 0.18, 0.002);
    }
  }

  const clusters = [vendorsCluster, proposalsCluster, departmentsCluster];
  const anchors = [
    new THREE.Vector3(-3.18, 0.55, -0.75),
    new THREE.Vector3(-0.12, 0.62, -0.82),
    new THREE.Vector3(3.05, 1.48, -0.35),
  ];

  return {
    root,
    clusters,
    anchors,
    vendorPackets,
    proposalSheets,
    departmentBlocks,
    solarCanopyPivot,
    solarCellMaterials,
    connectorMaterials,
    pencil,
    dispose: () => {
      disposed = true;
      resources.forEach(item => item.dispose());
    },
  };
}

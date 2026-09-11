import * as THREE from 'three';
import { grid, softSprite } from '../core/textures.js';

/** Muro con un vano recortado: así las habitaciones quedan comunicadas. */
export function wallWithDoor(w, h, doorW, doorH, doorX = 0) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, h);
  shape.lineTo(-w / 2, h);
  shape.closePath();
  const hole = new THREE.Path();
  const hw = doorW / 2;
  hole.moveTo(doorX - hw, 0);
  hole.lineTo(doorX + hw, 0);
  hole.lineTo(doorX + hw, doorH);
  hole.lineTo(doorX - hw, doorH);
  hole.closePath();
  shape.holes.push(hole);
  return new THREE.ShapeGeometry(shape);
}

/** Marco luminoso que subraya cada vano y guía la mirada hacia el fondo. */
export function doorFrame(w, h, color = 0x8fe6ff, intensity = 1.1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const t = 0.045;
  const pieces = [
    [w, t, 0, h],
    [w, t, 0, 0],
    [t, h, -w / 2, h / 2],
    [t, h, w / 2, h / 2]
  ];
  pieces.forEach(([pw, ph, px, py]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat);
    m.position.set(px, py, 0);
    g.add(m);
  });
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 1.15, h * 1.05),
    new THREE.MeshBasicMaterial({
      map: softSprite('rgba(255,255,255,0.85)'),
      color,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.14 * intensity
    })
  );
  halo.position.set(0, h / 2, -0.02);
  g.add(halo);
  return g;
}

/**
 * Cáscara arquitectónica de una habitación: suelo reflectante, paredes,
 * techo y vanos en los extremos. Todas comparten lenguaje material para
 * que el recorrido se sienta como un mismo edificio.
 */
export function roomShell({
  z,
  width = 22,
  height = 6.4,
  depth = 34,
  floor = 0x0a101c,
  wall = 0x0c1526,
  accent = 0x8fe6ff,
  doorW = 4.6,
  doorH = 3.6,
  ceiling = true,
  env = null
}) {
  const g = new THREE.Group();
  g.position.z = z;

  const floorMat = new THREE.MeshStandardMaterial({
    color: floor,
    roughness: 0.58,
    metalness: 0.45,
    envMap: env,
    envMapIntensity: 0.22
  });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMat);
  f.rotation.x = -Math.PI / 2;
  g.add(f);

  // Retícula tenue sobre el suelo: da escala y sensación de espacio.
  const gridTex = grid('rgba(150,205,255,0.10)').clone();
  gridTex.needsUpdate = true;
  gridTex.repeat.set(width / 6, depth / 6);
  const gm = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, opacity: 0.22, depthWrite: false })
  );
  gm.rotation.x = -Math.PI / 2;
  gm.position.y = 0.01;
  g.add(gm);

  const wallMat = new THREE.MeshStandardMaterial({
    color: wall,
    roughness: 0.7,
    metalness: 0.2,
    envMap: env,
    envMapIntensity: 0.4,
    side: THREE.DoubleSide
  });

  const left = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
  left.rotation.y = Math.PI / 2;
  left.position.set(-width / 2, height / 2, 0);
  g.add(left);

  const right = left.clone();
  right.rotation.y = -Math.PI / 2;
  right.position.x = width / 2;
  g.add(right);

  if (ceiling) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), wallMat);
    c.rotation.x = Math.PI / 2;
    c.position.y = height;
    g.add(c);
  }

  // Vanos: entrada (+Z) y salida (-Z).
  [1, -1].forEach((dir) => {
    const end = new THREE.Mesh(wallWithDoor(width, height, doorW, doorH), wallMat);
    end.position.set(0, 0, (dir * depth) / 2);
    if (dir === 1) end.rotation.y = Math.PI;
    g.add(end);
    const frame = doorFrame(doorW, doorH, accent);
    frame.position.set(0, 0, (dir * depth) / 2 - dir * 0.02);
    if (dir === 1) frame.rotation.y = Math.PI;
    g.add(frame);
  });

  // Cornisas de luz: el único "mobiliario" luminoso repetido en todo el viaje.
  const stripMat = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  [-1, 1].forEach((s) => {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(depth, 0.07), stripMat);
    strip.rotation.y = (s * Math.PI) / 2;
    strip.position.set((s * width) / 2 + s * -0.02, height - 0.55, 0);
    g.add(strip);
  });

  const ceilingGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.55, depth * 0.8),
    new THREE.MeshBasicMaterial({
      color: accent, transparent: true, opacity: 0.055,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  ceilingGlow.rotation.x = Math.PI / 2;
  ceilingGlow.position.y = height - 0.06;
  g.add(ceilingGlow);

  return g;
}

/** Panel de cristal donde aterriza el contenido real de cada sección. */
export function glassPanel(w, h, { color = 0x0e2338, opacity = 0.4, edge = 0x9fe8ff } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity,
      roughness: 0.08,
      metalness: 0,
      transmission: 0,
      side: THREE.DoubleSide
    })
  );
  g.add(body);
  const frame = doorFrame(w, h, edge, 0.6);
  frame.position.y = -h / 2;
  g.add(frame);
  return g;
}

/** Polvo suspendido: partículas mínimas, nunca protagonistas. */
export function dust(count, radius, height, color = 0xbfe4ff) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * radius;
    pos[i * 3 + 1] = Math.random() * height;
    pos[i * 3 + 2] = (Math.random() - 0.5) * radius;
    seed[i] = Math.random() * Math.PI * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.PointsMaterial({
    size: 0.055,
    map: softSprite(),
    color,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.drift = (t) => {
    const p = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      p.array[i * 3 + 1] += Math.sin(t * 0.35 + seed[i]) * 0.0016;
      if (p.array[i * 3 + 1] > height) p.array[i * 3 + 1] = 0;
    }
    p.needsUpdate = true;
  };
  return pts;
}

/** Objeto que reacciona con delicadeza al cursor. Nunca exagerado. */
export function reactive(obj, amount = 0.06) {
  const base = obj.position.clone();
  const baseRot = obj.rotation.clone();
  obj.userData.react = (mx, my) => {
    obj.position.x = base.x + mx * amount;
    obj.position.y = base.y + my * amount * 0.6;
    obj.rotation.y = baseRot.y + mx * amount * 0.5;
    obj.rotation.x = baseRot.x - my * amount * 0.35;
  };
  return obj;
}

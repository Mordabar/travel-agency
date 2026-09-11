import * as THREE from 'three';
import { roomShell, dust, doorFrame } from './common.js';
import { landscape, label } from '../core/textures.js';
import { plans, categories, waLink, waMessages } from '../content.js';

/**
 * 3. PLANES — TRAVEL GALLERY
 * Una galería tridimensional: los planes cuelgan como grandes ventanas
 * suspendidas a ambos lados del pasillo, no como una cuadrícula de fichas.
 *
 * Si Travel_Jet aún no ha suministrado el catálogo, la galería muestra
 * las tres rutas reales de la agencia. Nunca se inventa un plan.
 */
export function build({ env, quality, section }) {
  const g = new THREE.Group();

  g.add(roomShell({
    z: section.z,
    width: 26,
    height: 8,
    depth: 44,
    floor: 0x090f1d,
    wall: 0x0d1526,
    accent: 0xffd9a8,
    doorW: 5,
    doorH: 4.2,
    env
  }));

  // Fuente de piezas: planes reales si existen, si no las rutas reales.
  const items = plans.length
    ? plans.map((p) => ({
        id: `plan-${p.id}`,
        title: p.name,
        sub: p.destination || '',
        image: p.image || null,
        seed: p.id,
        href: waLink(waMessages.planNamed(p.name)),
        cta: `Cotizar ${p.name} por WhatsApp`
      }))
    : categories.map((c) => ({
        id: `ruta-${c.id}`,
        title: c.title,
        sub: c.blurb,
        image: null,
        seed: c.id,
        href: waLink(c.waMessage),
        cta: `${c.title} — Consultar por WhatsApp`
      }));

  const loader = new THREE.TextureLoader();
  const frames = [];
  const count = items.length;
  const span = 32;

  items.forEach((item, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const z = section.z + span / 2 - 5 - (i / Math.max(1, count - 1 || 1)) * span;
    const group = new THREE.Group();
    group.position.set(side * 7.4, 3.5, z);
    group.rotation.y = side * 0.42;

    const seedNum = typeof item.seed === 'string'
      ? item.seed.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
      : i * 13;

    const mat = new THREE.MeshBasicMaterial({
      map: landscape(seedNum, { tall: true }),
      toneMapped: false
    });
    // Si hay fotografía real del plan, sustituye al fondo generado.
    if (item.image) {
      loader.load(item.image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        mat.map = tex;
        mat.needsUpdate = true;
      });
    }

    const art = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 6.2), mat);
    group.add(art);
    group.add(doorFrame(4.75, 6.35, 0xffe0b0, 0.55).translateY(-3.17));

    const t = label(item.title.toUpperCase(), {
      color: '#fff6ea', font: '600 54px "Inter", system-ui, sans-serif', letter: 6
    });
    const a = t.userData?.aspect || 6;
    const cap = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2 / a),
      new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false })
    );
    cap.position.set(0, -3.55, 0.05);
    group.add(cap);

    const hit = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 7.6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = -0.6;
    hit.userData.interactive = { id: item.id, label: item.cta, href: item.href };
    group.add(hit);

    g.add(group);
    frames.push({ group, art, base: group.position.clone(), baseRotY: group.rotation.y, hover: 0, i });
  });

  // Haz de luz cenital que recorre la galería.
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffd9a8, transparent: true, opacity: 0.07,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(18, 40), beamMat);
  beam.rotation.x = -Math.PI / 2.2;
  beam.position.set(0, 6.2, section.z);
  g.add(beam);

  const motes = dust(Math.round(200 * quality.particles), 24, 8, 0xffe0b8);
  motes.position.z = section.z;
  g.add(motes);

  return {
    group: g,
    anchor: new THREE.Vector3(0, 1.25, section.z - 2),
    interactiveRoots: frames.map((f) => f.group),
    update({ elapsed, mouse, focus, hovered }) {
      frames.forEach((f) => {
        const isHover = hovered === items[f.i].id;
        f.hover += ((isHover ? 1 : 0) - f.hover) * 0.12;
        f.group.position.y = f.base.y + Math.sin(elapsed * 0.45 + f.i * 1.3) * 0.08 + f.hover * 0.25;
        f.group.position.x = f.base.x + mouse.x * 0.28 * focus;
        f.group.rotation.y = f.baseRotY - mouse.x * 0.07 * focus - f.hover * Math.sign(f.base.x) * 0.12;
        f.group.rotation.x = -mouse.y * 0.035 * focus;
        f.art.scale.setScalar(1 + f.hover * 0.05);
      });
      beam.material.opacity = 0.05 + Math.sin(elapsed * 0.7) * 0.015;
      motes.userData.drift(elapsed);
    }
  };
}

import * as THREE from 'three';
import { roomShell, dust } from './common.js';
import { landscape, label } from '../core/textures.js';
import { categories, waLink } from '../content.js';

/**
 * 2. DESTINATION ROOM — ¿A dónde quieres viajar?
 * Las tres categorías reales no son tarjetas: son portales abiertos en la
 * pared del fondo. Detrás de cada uno se ve ya el escenario que prometen,
 * y al acercar el cursor la atmósfera de la sala cambia hacia esa ruta.
 */
export function build({ env, quality, section }) {
  const g = new THREE.Group();

  g.add(roomShell({
    z: section.z,
    width: 30,
    height: 7.6,
    depth: 34,
    floor: 0x081321,
    wall: 0x0b1728,
    accent: 0x8fd8ff,
    doorW: 5.4,
    doorH: 4.4,
    env
  }));

  const schemes = { nacionales: 'tropic', internacionales: 'city', cruceros: 'ocean' };
  const portals = [];

  categories.forEach((cat, i) => {
    const x = 4.6 + (i - 1) * 7.6;
    const portal = new THREE.Group();
    portal.position.set(x, 0, section.z - 13.5);

    // El paisaje que se ve a través del portal.
    const tex = landscape(31 + i * 7, { scheme: schemes[cat.id], tall: true });
    const view = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 8.4),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
    );
    view.position.set(0, 4.2, -0.6);
    portal.add(view);

    // Arco del portal.
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(3.1, 0.075, 10, 44, Math.PI),
      new THREE.MeshBasicMaterial({
        color: cat.palette.accent, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
      })
    );
    arch.position.y = 5.3;
    portal.add(arch);
    // Patas verticales que prolongan el arco hasta el suelo.
    [-1, 1].forEach((sgn) => {
      const leg = new THREE.Mesh(
        new THREE.PlaneGeometry(0.05, 5.3),
        new THREE.MeshBasicMaterial({
          color: cat.palette.accent, transparent: true, opacity: 0.55,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
      );
      leg.position.set(sgn * 3.1, 2.65, 0);
      portal.add(leg);
    });

    // Rótulo de la categoría, dentro del mundo.
    const tex2 = label(cat.title.toUpperCase(), {
      color: '#eef7ff', font: '600 64px "Inter", system-ui, sans-serif', letter: 8,
      glow: `rgba(${(cat.palette.accent >> 16) & 255},${(cat.palette.accent >> 8) & 255},${cat.palette.accent & 255},0.7)`
    });
    const a = tex2.userData?.aspect || 6;
    const cap = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 5.6 / a),
      new THREE.MeshBasicMaterial({ map: tex2, transparent: true, toneMapped: false, depthWrite: false })
    );
    cap.position.set(0, 0.85, 0.25);
    portal.add(cap);

    // Zona sensible: consultar esa categoría por WhatsApp.
    const hit = new THREE.Mesh(
      new THREE.PlaneGeometry(6.3, 6.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.set(0, 3.2, 0.4);
    hit.userData.interactive = {
      id: `cat-${cat.id}`,
      label: `${cat.title} — Consultar por WhatsApp`,
      href: waLink(cat.waMessage)
    };
    portal.add(hit);

    g.add(portal);
    portals.push({ portal, view, arch, cat, base: portal.position.clone(), hover: 0 });
  });

  const motes = dust(Math.round(180 * quality.particles), 28, 7, 0xaadcff);
  motes.position.z = section.z;
  g.add(motes);

  return {
    group: g,
    anchor: new THREE.Vector3(-4, 1.35, section.z - 6),
    interactiveRoots: portals.map((p) => p.portal),
    update({ elapsed, mouse, focus, hovered }) {
      portals.forEach((p, i) => {
        const isHover = hovered === `cat-${p.cat.id}`;
        p.hover += ((isHover ? 1 : 0) - p.hover) * 0.12;
        const lift = p.hover * 0.35;
        p.portal.position.y = p.base.y + lift + Math.sin(elapsed * 0.6 + i) * 0.03;
        p.portal.position.x = p.base.x + mouse.x * (0.35 + i * 0.12) * focus;
        p.portal.rotation.y = -mouse.x * 0.06 * focus;
        p.view.material.opacity = 1;
        p.arch.material.opacity = 0.55 + p.hover * 0.45 + Math.sin(elapsed * 1.4 + i) * 0.06;
        p.view.scale.setScalar(1 + p.hover * 0.04);
      });
      motes.userData.drift(elapsed);
    }
  };
}

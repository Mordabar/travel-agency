import * as THREE from 'three';
import { roomShell, dust } from './common.js';
import { screen, label } from '../core/textures.js';
import { infoDesk, waLink, waMessages } from '../content.js';

/**
 * 8. TRAVEL INFORMATION DESK
 * En lugar de un FAQ tradicional, un pasillo de pantallas de cristal
 * suspendidas. Sólo contienen información existente; cuando la respuesta
 * requiere asesoría, el panel dirige a WhatsApp.
 */
export function build({ env, quality, section }) {
  const g = new THREE.Group();

  g.add(roomShell({
    z: section.z,
    width: 20,
    height: 6.4,
    depth: 32,
    floor: 0x071220,
    wall: 0x0a1726,
    accent: 0x8fe0f0,
    doorW: 4.4,
    doorH: 3.8,
    env
  }));

  const panels = [];
  infoDesk.forEach((item, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const tex = screen(item.q, item.a);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4.3, 2.5),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, toneMapped: false })
    );
    mesh.position.set(side * 5.1, 2.6 + (i % 2) * 0.9, section.z + 9 - i * 5.2);
    mesh.rotation.y = -side * 0.5;

    const hit = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.7), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.z = 0.04;
    hit.userData.interactive = {
      id: `info-${i}`,
      label: 'Consultar por WhatsApp',
      href: waLink(item.wa || waMessages.contact)
    };
    mesh.add(hit);

    g.add(mesh);
    panels.push({ mesh, base: mesh.position.clone(), baseRot: mesh.rotation.clone(), hover: 0, i });
  });

  const title = label('INFORMACIÓN ÚTIL', {
    color: '#bfeeff', font: '500 38px "Inter", system-ui, sans-serif', letter: 16
  });
  const tm = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5 / (title.userData?.aspect || 10)),
    new THREE.MeshBasicMaterial({ map: title, transparent: true, toneMapped: false, depthWrite: false })
  );
  tm.position.set(0, 5.2, section.z - 15.4);
  g.add(tm);

  const motes = dust(Math.round(140 * quality.particles), 18, 6, 0xa8e4f4);
  motes.position.z = section.z;
  g.add(motes);

  return {
    group: g,
    anchor: new THREE.Vector3(0, 1.1, section.z - 2),
    interactiveRoots: panels.map((p) => p.mesh),
    update({ elapsed, mouse, focus, hovered }) {
      panels.forEach((p) => {
        const isHover = hovered === `info-${p.i}`;
        p.hover += ((isHover ? 1 : 0) - p.hover) * 0.12;
        p.mesh.position.y = p.base.y + Math.sin(elapsed * 0.5 + p.i) * 0.05;
        p.mesh.rotation.y = p.baseRot.y - mouse.x * 0.06 * focus;
        p.mesh.material.opacity = 0.8 + p.hover * 0.2;
        p.mesh.scale.setScalar(1 + p.hover * 0.05);
      });
      motes.userData.drift(elapsed);
    }
  };
}

import * as THREE from 'three';
import { roomShell, dust, doorFrame } from './common.js';
import { marble, documentSheet, label } from '../core/textures.js';
import { license, brand } from '../content.js';

/**
 * 9. LICENCIA — TRUST ROOM
 * Dirección de arte deliberadamente sobria: mármol, metal, luz suave y
 * documentos suspendidos. Aquí el 3D se retira para que el documento se
 * lea con claridad. No se inventa ningún registro ni certificación.
 */
export function build({ env, quality, section }) {
  const g = new THREE.Group();

  const marbleTex = marble();
  marbleTex.repeat.set(3, 4);

  g.add(roomShell({
    z: section.z,
    width: 18,
    height: 7.2,
    depth: 30,
    floor: 0x1a1d22,
    wall: 0x181b21,
    accent: 0xdfe6ef,
    doorW: 4.2,
    doorH: 3.8,
    env
  }));

  // Revestimiento de mármol sobre las paredes: materialidad formal.
  const marbleMat = new THREE.MeshStandardMaterial({
    map: marbleTex, roughness: 0.22, metalness: 0.25, envMap: env, envMapIntensity: 0.9
  });
  [-1, 1].forEach((side) => {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(28, 7), marbleMat);
    panel.rotation.y = (-side * Math.PI) / 2;
    panel.position.set(side * 8.9, 3.5, section.z);
    g.add(panel);
  });
  const floorMarble = new THREE.Mesh(
    new THREE.PlaneGeometry(17.8, 29.8),
    new THREE.MeshStandardMaterial({
      map: marbleTex, roughness: 0.1, metalness: 0.6, envMap: env, envMapIntensity: 1.1
    })
  );
  floorMarble.rotation.x = -Math.PI / 2;
  floorMarble.position.set(0, 0.02, section.z);
  g.add(floorMarble);

  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(17.8, 29.8),
    new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.5, metalness: 0.1, envMap: env })
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, 7.18, section.z);
  g.add(ceil);

  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(17.8, 7.2),
    new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.3, metalness: 0.2, envMap: env })
  );
  back.position.set(0, 3.6, section.z - 13);
  g.add(back);

  // Documentos reales suspendidos. Si aún no hay archivos, se muestra la
  // ficha de la sociedad con los datos verificados y el resto en blanco.
  const sheets = license.documents.length
    ? license.documents.map((d) => ({ lines: [d.label, license.legalName, license.city], url: d.url }))
    : [{
        lines: [
          'Registro de la agencia',
          license.legalName,
          license.city,
          license.rnt || 'RNT: pendiente de publicación',
          license.nit ? `NIT ${license.nit}` : ''
        ].filter(Boolean),
        url: null
      }];

  const docs = [];
  sheets.forEach((s, i) => {
    const tex = documentSheet(s.lines);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 5.2),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.05, envMap: env })
    );
    const x = (i - (sheets.length - 1) / 2) * 4.6;
    mesh.position.set(x, 3.4, section.z - 7);
    g.add(mesh);
    const fr = doorFrame(4.1, 5.4, 0xdfe6ef, 0.4);
    fr.position.set(x, 3.4 - 2.7, section.z - 6.98);
    g.add(fr);
    if (s.url) {
      const hit = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.4), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(x, 3.4, section.z - 6.9);
      hit.userData.interactive = { id: `doc-${i}`, label: 'Ver documento', href: s.url };
      g.add(hit);
      docs.push({ mesh: hit, i });
    }
    docs.push({ mesh, base: mesh.position.clone(), i });
  });

  const title = label('LICENCIA', {
    color: '#f2f6fb', font: '500 40px "Inter", system-ui, sans-serif', letter: 22,
    glow: 'rgba(220,235,255,0.5)'
  });
  const tm = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4 / (title.userData?.aspect || 9)),
    new THREE.MeshBasicMaterial({ map: title, transparent: true, toneMapped: false, depthWrite: false })
  );
  tm.position.set(0, 6.4, section.z - 12);
  g.add(tm);

  // Luz suave y frontal: nada dramático en la sala de confianza.
  const soft = new THREE.PointLight(0xffffff, 26, 34, 2);
  soft.position.set(0, 5.6, section.z - 3);
  g.add(soft);

  const motes = dust(Math.round(80 * quality.particles), 16, 6.5, 0xdfe8f4);
  motes.position.z = section.z;
  g.add(motes);

  return {
    group: g,
    anchor: new THREE.Vector3(0, 1.05, section.z - 1),
    interactiveRoots: docs.map((d) => d.mesh),
    update({ elapsed, mouse, focus }) {
      docs.forEach((d) => {
        if (!d.base) return;
        d.mesh.position.y = d.base.y + Math.sin(elapsed * 0.4 + d.i) * 0.035;
        d.mesh.rotation.y = -mouse.x * 0.03 * focus;
      });
      motes.userData.drift(elapsed);
    }
  };
}

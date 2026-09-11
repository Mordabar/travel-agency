import * as THREE from 'three';
import { roomShell, dust, doorFrame } from './common.js';
import { postcard, paper, label } from '../core/textures.js';
import { testimonials, waLink, waMessages } from '../content.js';

/**
 * 7. OPINIONES — MEMORIES ROOM
 * Los testimonios reales cuelgan como postales escritas a mano.
 * Si Travel_Jet todavía no ha entregado testimonios verificados, la sala
 * se muestra preparada pero vacía: aquí no se fabrica una sola opinión.
 */
export function build({ env, quality, section }) {
  const g = new THREE.Group();

  g.add(roomShell({
    z: section.z,
    width: 22,
    height: 6.8,
    depth: 34,
    floor: 0x0a1120,
    wall: 0x0d1628,
    accent: 0xffdcb4,
    doorW: 4.6,
    doorH: 3.9,
    env
  }));

  const cards = [];
  const hasReal = testimonials.length > 0;
  const shown = hasReal ? testimonials : [];

  shown.forEach((t, i) => {
    const tex = postcard(t.text, t.name);
    const card = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 2.15),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0, envMap: env })
    );
    card.add(mesh);
    const side = i % 2 === 0 ? -1 : 1;
    card.position.set(side * (4.4 + (i % 3) * 1.1), 1.9 + ((i * 3) % 4) * 0.85, section.z + 11 - i * 3.4);
    card.rotation.y = -side * 0.4;
    card.rotation.z = (Math.random() - 0.5) * 0.1;

    // Hilo del que cuelga la postal: la sala se siente física.
    const thread = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 6.8 - card.position.y, 4),
      new THREE.MeshBasicMaterial({ color: 0xffdcb4, transparent: true, opacity: 0.25 })
    );
    thread.position.set(card.position.x, card.position.y + (6.8 - card.position.y) / 2 + 1.05, card.position.z);
    g.add(thread);

    const hit = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.5), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.z = 0.05;
    hit.userData.interactive = {
      id: `op-${i}`,
      label: 'Hablar con Travel_Jet',
      href: waLink(waMessages.opinions)
    };
    card.add(hit);

    g.add(card);
    cards.push({ card, base: card.position.clone(), baseRot: card.rotation.clone(), hover: 0, i });
  });

  // Cuando no hay testimonios reales, el espacio se lee como una sala
  // preparada: hilos y pinzas vacías esperando las primeras postales.
  if (!hasReal) {
    const paperTex = paper();
    for (let i = 0; i < 9; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const blank = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 1.7),
        new THREE.MeshStandardMaterial({
          map: paperTex, roughness: 0.9, metalness: 0, envMap: env,
          transparent: true, opacity: 0.22
        })
      );
      blank.position.set(side * (4.8 + (i % 3) * 1.2), 2.1 + ((i * 5) % 4) * 0.8, section.z + 10 - i * 2.6);
      blank.rotation.y = -side * 0.42;
      blank.rotation.z = (Math.random() - 0.5) * 0.12;
      g.add(blank);
      cards.push({ card: blank, base: blank.position.clone(), baseRot: blank.rotation.clone(), hover: 0, i });
    }
  }

  const title = label('OPINIONES', {
    color: '#ffe9d2', font: '500 40px "Inter", system-ui, sans-serif', letter: 20
  });
  const tm = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.2 / (title.userData?.aspect || 8)),
    new THREE.MeshBasicMaterial({ map: title, transparent: true, toneMapped: false, depthWrite: false })
  );
  tm.position.set(0, 5.5, section.z - 16.4);
  g.add(tm);
  const frame = doorFrame(9, 3.4, 0xffdcb4, 0.45);
  frame.position.set(0, 1.4, section.z - 16.5);
  g.add(frame);

  const motes = dust(Math.round(160 * quality.particles), 20, 6.5, 0xffe0bc);
  motes.position.z = section.z;
  g.add(motes);

  return {
    group: g,
    anchor: new THREE.Vector3(0, 1.15, section.z - 3),
    interactiveRoots: cards.map((c) => c.card),
    update({ elapsed, mouse, focus, hovered }) {
      cards.forEach((c) => {
        const isHover = hovered === `op-${c.i}`;
        c.hover += ((isHover ? 1 : 0) - c.hover) * 0.1;
        c.card.rotation.z = c.baseRot.z + Math.sin(elapsed * 0.6 + c.i) * 0.03;
        c.card.rotation.y = c.baseRot.y - mouse.x * 0.05 * focus;
        c.card.position.y = c.base.y + Math.sin(elapsed * 0.45 + c.i * 1.7) * 0.05 + c.hover * 0.12;
        c.card.scale.setScalar(1 + c.hover * 0.12);
      });
      motes.userData.drift(elapsed);
    }
  };
}

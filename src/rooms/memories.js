import * as THREE from 'three';
import { roomShell, dust, doorFrame } from './common.js';
import { landscape, paper, label } from '../core/textures.js';
import { waLink, waMessages, memoryPhotos } from '../content.js';

/**
 * 6. TRAVEL MEMORIES
 * Una sala en penumbra donde los recuerdos de viaje flotan: polaroids,
 * postales y ventanas con paisaje. La cámara camina despacio entre ellos;
 * algunos se inclinan al pasar el cursor y otros se acercan.
 * No es un carrusel: es un espacio.
 */
export function build({ env, quality, section }) {
  const g = new THREE.Group();

  g.add(roomShell({
    z: section.z,
    width: 24,
    height: 7,
    depth: 40,
    floor: 0x0b0d16,
    wall: 0x0f1120,
    accent: 0xffc89a,
    doorW: 4.8,
    doorH: 4,
    env
  }));

  const paperTex = paper();
  const loader = new THREE.TextureLoader();
  const cards = [];
  const total = Math.round(14 * quality.photos);

  for (let i = 0; i < total; i++) {
    const card = new THREE.Group();
    const w = 1.7 + Math.random() * 0.7;
    const h = w * 1.18;

    // Marco de polaroid.
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.85, metalness: 0, envMap: env })
    );
    card.add(back);
    const photoMat = new THREE.MeshBasicMaterial({ map: landscape(100 + i * 5), toneMapped: false });
    // Si Travel_Jet ha suministrado fotos reales, sustituyen a la ilustración.
    const real = memoryPhotos[i % Math.max(1, memoryPhotos.length)];
    if (memoryPhotos.length && real) {
      loader.load(real, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        photoMat.map = tex;
        photoMat.needsUpdate = true;
      });
    }
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.86, h * 0.72), photoMat);
    photo.position.set(0, h * 0.09, 0.012);
    card.add(photo);

    const ring = (Math.floor(i / 5) % 2) * 2 - 1;
    const angle = (i / total) * Math.PI * 2 * 1.6;
    const radius = 6.8 + (i % 3) * 1.5;
    card.position.set(
      Math.cos(angle) * radius * 0.95,
      1.4 + ((i * 7) % 5) * 0.75,
      section.z + 15 - (i / total) * 30 + ring * 0.4
    );
    card.rotation.set((Math.random() - 0.5) * 0.18, -Math.atan2(card.position.x, 3) * 0.7, (Math.random() - 0.5) * 0.22);

    const hit = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.2, h * 1.2), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.z = 0.05;
    hit.userData.interactive = {
      id: `memory-${i}`,
      label: 'Quiero vivir mi propio viaje',
      href: waLink(waMessages.memories)
    };
    card.add(hit);

    g.add(card);
    cards.push({ card, photo, base: card.position.clone(), baseRot: card.rotation.clone(), hover: 0, i });
  }

  // Ventana grande al fondo: un recuerdo que se volvió paisaje.
  const big = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 4.4),
    new THREE.MeshBasicMaterial({ map: landscape(240, { scheme: 'dusk' }), toneMapped: false })
  );
  big.position.set(0, 3.4, section.z - 19.4);
  g.add(big);
  const bigFrame = doorFrame(7.2, 4.6, 0xffc89a, 0.6);
  bigFrame.position.set(0, 1.1, section.z - 19.3);
  g.add(bigFrame);

  const title = label('RECUERDOS', {
    color: '#ffe9d2', font: '500 42px "Inter", system-ui, sans-serif', letter: 18
  });
  const tm = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4 / (title.userData?.aspect || 8)),
    new THREE.MeshBasicMaterial({ map: title, transparent: true, toneMapped: false, depthWrite: false })
  );
  tm.position.set(0, 6.1, section.z - 19.2);
  g.add(tm);

  const motes = dust(Math.round(240 * quality.particles), 22, 7, 0xffd6b0);
  motes.position.z = section.z;
  g.add(motes);

  return {
    group: g,
    anchor: new THREE.Vector3(0, 1.1, section.z - 4),
    interactiveRoots: cards.map((c) => c.card),
    update({ elapsed, mouse, focus, hovered }) {
      cards.forEach((c) => {
        const isHover = hovered === `memory-${c.i}`;
        c.hover += ((isHover ? 1 : 0) - c.hover) * 0.1;
        c.card.position.y = c.base.y + Math.sin(elapsed * 0.5 + c.i) * 0.06;
        c.card.position.x = c.base.x + mouse.x * (0.2 + (c.i % 4) * 0.07) * focus;
        c.card.rotation.z = c.baseRot.z + Math.sin(elapsed * 0.35 + c.i * 2) * 0.02;
        c.card.rotation.x = c.baseRot.x - mouse.y * 0.05 * focus - c.hover * 0.06;
        c.card.scale.setScalar(1 + c.hover * 0.22);
      });
      motes.userData.drift(elapsed);
    }
  };
}

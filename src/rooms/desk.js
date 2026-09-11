import * as THREE from 'three';
import { roomShell, dust, doorFrame, reactive } from './common.js';
import { landscape, label, softSprite } from '../core/textures.js';
import { contact, brand, waLink, waMessages } from '../content.js';

/**
 * 10. CONTACTO — TRAVEL DESK
 * El viaje termina donde empieza la conversación: un lounge cálido con
 * escritorio de atención, ventanal al atardecer y el acceso directo a
 * WhatsApp como pieza dominante del espacio.
 */
export function build({ env, quality, section }) {
  const g = new THREE.Group();

  g.add(roomShell({
    z: section.z,
    width: 22,
    height: 6.8,
    depth: 34,
    floor: 0x0b1220,
    wall: 0x101827,
    accent: 0xffc98a,
    doorW: 4.6,
    doorH: 3.9,
    ceiling: true,
    env
  }));

  // Ventanal del fondo: el atardecer cierra el recorrido.
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 6.4),
    new THREE.MeshBasicMaterial({ map: landscape(512, { scheme: 'dusk' }), toneMapped: false })
  );
  view.position.set(0, 3.6, section.z - 16.9);
  g.add(view);
  const vf = doorFrame(15.2, 6.6, 0xffd9a8, 0.6);
  vf.position.set(0, 0.4, section.z - 16.8);
  g.add(vf);

  // Escritorio de atención.
  const deskMat = new THREE.MeshStandardMaterial({
    color: 0x121c2b, roughness: 0.2, metalness: 0.9, envMap: env, envMapIntensity: 1.1
  });
  const top = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.16, 1.7), deskMat);
  top.position.set(0, 1.02, section.z - 9);
  g.add(top);
  const front = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1.02, 0.12), deskMat);
  front.position.set(0, 0.51, section.z - 8.2);
  g.add(front);
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(7.4, 0.07),
    new THREE.MeshBasicMaterial({
      color: 0x6ef0a8, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  glow.position.set(0, 0.96, section.z - 8.14);
  g.add(glow);

  // Placa de WhatsApp integrada en el escritorio: el CTA es un objeto.
  const plateTex = label('WHATSAPP', {
    color: '#e9fff2', font: '600 46px "Inter", system-ui, sans-serif', letter: 10,
    glow: 'rgba(110,240,168,0.8)'
  });
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4 / (plateTex.userData?.aspect || 7)),
    new THREE.MeshBasicMaterial({ map: plateTex, transparent: true, toneMapped: false, depthWrite: false })
  );
  plate.position.set(0, 1.72, section.z - 8.9);
  const plateHit = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.1), new THREE.MeshBasicMaterial({ visible: false }));
  plateHit.position.set(0, 1.72, section.z - 8.85);
  plateHit.userData.interactive = {
    id: 'desk-wa',
    label: 'Hablar por WhatsApp',
    href: waLink(waMessages.contact)
  };
  g.add(plate);
  g.add(plateHit);
  g.add(reactive(plate, 0.05));

  // Butacas del lounge: siluetas suaves, presencia humana.
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1a2434, roughness: 0.7, metalness: 0.1, envMap: env });
  [[-4.6, -3.4], [4.6, -3.4], [-4.6, 1.2], [4.6, 1.2]].forEach(([x, dz], i) => {
    const seat = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.42, 20), seatMat);
    base.position.y = 0.3;
    seat.add(base);
    const backRest = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.6, 20, 1, true, 0, Math.PI), seatMat);
    backRest.position.y = 0.78;
    backRest.rotation.y = Math.atan2(-x, 1);
    seat.add(backRest);
    seat.position.set(x, 0, section.z + dz);
    g.add(seat);
  });

  const lamp = new THREE.PointLight(0xffcf9a, 34, 34, 2);
  lamp.position.set(0, 5, section.z - 6);
  g.add(lamp);
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({
      map: softSprite('rgba(255,206,150,0.45)'), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.45
    })
  );
  halo.position.set(0, 3.4, section.z - 16.5);
  g.add(halo);

  const deskLamp = new THREE.PointLight(0xffe0bc, 16, 16, 2);
  deskLamp.position.set(0, 2.6, section.z - 7.4);
  g.add(deskLamp);

  const motes = dust(Math.round(180 * quality.particles), 20, 6.5, 0xffdcb0);
  motes.position.z = section.z;
  g.add(motes);

  return {
    group: g,
    anchor: new THREE.Vector3(0, 1.1, section.z - 3),
    interactiveRoots: [plateHit],
    update({ elapsed, mouse, focus, hovered }) {
      const hot = hovered === 'desk-wa';
      glow.material.opacity = 0.45 + Math.sin(elapsed * 1.6) * 0.12 + (hot ? 0.3 : 0);
      plate.scale.setScalar(1 + (hot ? 0.06 : 0) + Math.sin(elapsed * 0.8) * 0.005);
      lamp.intensity = 34 + Math.sin(elapsed * 1.1) * 1.8;
      plate.userData.react && plate.userData.react(mouse.x * focus, mouse.y * focus);
      motes.userData.drift(elapsed);
    }
  };
}

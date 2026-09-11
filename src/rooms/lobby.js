import * as THREE from 'three';
import { roomShell, dust, reactive, doorFrame } from './common.js';
import { landscape, label, softSprite } from '../core/textures.js';
import { brand } from '../content.js';

/**
 * 1. TRAVEL_JET LOBBY
 * La entrada física a la agencia: arquitectura cálida, grandes ventanales
 * hacia un paisaje, equipaje listo, un mapa volumétrico sobre la mesa y
 * el rótulo de la marca suspendido en el aire.
 */
export function build({ env, quality, section }) {
  const g = new THREE.Group();
  const anim = [];

  g.add(roomShell({
    z: section.z,
    width: 24,
    height: 7,
    depth: 36,
    floor: 0x0b1220,
    wall: 0x101a2c,
    accent: 0xffc98a,
    doorW: 5.2,
    doorH: 4.2,
    env
  }));

  // Grandes ventanales laterales con paisaje: el exterior ya es un viaje.
  const windows = new THREE.Group();
  [-1, 1].forEach((side, si) => {
    for (let i = 0; i < 3; i++) {
      const tex = landscape(11 + si * 3 + i, { scheme: i === 1 ? 'dusk' : si ? 'alpine' : 'tropic' });
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(7.4, 4.2),
        new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
      );
      win.rotation.y = (-side * Math.PI) / 2;
      win.position.set(side * 11.94, 3.3, section.z - 11 + i * 10);
      windows.add(win);
      const fr = doorFrame(7.6, 4.4, 0xffd9a8, 0.5);
      fr.rotation.y = (-side * Math.PI) / 2;
      fr.position.set(side * 11.9, 1.1, section.z - 11 + i * 10);
      windows.add(fr);
    }
  });
  g.add(windows);

  // Rótulo de marca suspendido.
  const signTex = label('AGENCIA DE VIAJES', {
    color: '#ffe8cd', font: '500 52px "Inter", system-ui, sans-serif', letter: 16,
    glow: 'rgba(255,206,150,0.7)'
  });
  const aspect = signTex.userData?.aspect || 4;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 6.4 / aspect),
    new THREE.MeshBasicMaterial({ map: signTex, transparent: true, toneMapped: false, depthWrite: false })
  );
  sign.position.set(2.6, 4.6, section.z - 15);
  g.add(reactive(sign, 0.22));
  anim.push(sign);

  // Mesa de mapas con un globo de rutas: el corazón del lobby.
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.3, 0.16, 48),
    new THREE.MeshStandardMaterial({ color: 0x16202f, roughness: 0.25, metalness: 0.9, envMap: env })
  );
  table.position.set(0, 0.95, section.z - 4);
  g.add(table);

  const globe = new THREE.Group();
  globe.position.set(0, 2.0, section.z - 4);
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 26, 18),
    new THREE.MeshBasicMaterial({ color: 0x7fd8ff, wireframe: true, transparent: true, opacity: 0.3 })
  );
  globe.add(wire);
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 32, 24),
    new THREE.MeshStandardMaterial({
      color: 0x0a2236, roughness: 0.2, metalness: 0.6, envMap: env,
      emissive: 0x0d3350, emissiveIntensity: 0.6
    })
  );
  globe.add(core);
  // Arcos de ruta que laten alrededor del globo.
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const curve = new THREE.EllipseCurve(0, 0, 1.15 + i * 0.05, 1.15 + i * 0.05, 0, Math.PI * (0.5 + Math.random() * 0.6));
    const geo = new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(42).map((p) => new THREE.Vector3(p.x, p.y, 0))
    );
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: 0xffd0a0, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending
    }));
    line.rotation.set(Math.random() * Math.PI, a, Math.random() * Math.PI);
    globe.add(line);
  }
  g.add(globe);
  anim.push(globe);

  // Equipaje: se desplaza unos centímetros con el cursor.
  const bagMat = new THREE.MeshStandardMaterial({ color: 0x1d2b3f, roughness: 0.35, metalness: 0.55, envMap: env });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xe8b878, roughness: 0.3, metalness: 0.8, envMap: env });
  const bags = [[-4.2, -1.5, 0.95], [-3.4, 0.6, 0.7], [4.1, -3.2, 1.1], [3.3, -1.2, 0.8]];
  bags.forEach(([x, dz, h], i) => {
    const bag = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(h * 0.72, h, h * 0.34), bagMat);
    body.position.y = h / 2;
    bag.add(body);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(h * 0.16, 0.022, 8, 20, Math.PI), accentMat);
    handle.position.y = h + h * 0.02;
    bag.add(handle);
    bag.position.set(x, 0, section.z + dz);
    bag.rotation.y = (i - 1.5) * 0.35;
    g.add(reactive(bag, 0.05));
    anim.push(bag);
  });

  // Luz cálida de recepción.
  const lamp = new THREE.PointLight(0xffcf9a, 22, 26, 2);
  lamp.position.set(0, 5.2, section.z - 2);
  g.add(lamp);
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshBasicMaterial({
      map: softSprite('rgba(255,208,150,0.5)'), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5
    })
  );
  halo.position.set(0, 4.6, section.z - 14.5);
  g.add(halo);

  const motes = dust(Math.round(220 * quality.particles), 22, 6.5, 0xffdcb0);
  motes.position.z = section.z;
  g.add(motes);

  return {
    group: g,
    anchor: new THREE.Vector3(-2.5, 2.2, section.z - 10),
    update({ elapsed, mouse, focus }) {
      globe.rotation.y = elapsed * 0.12;
      wire.rotation.y = -elapsed * 0.08;
      sign.position.y = 4.6 + Math.sin(elapsed * 0.5) * 0.06;
      lamp.intensity = 22 + Math.sin(elapsed * 1.3) * 1.4;
      motes.userData.drift(elapsed);
      anim.forEach((o) => o.userData.react && o.userData.react(mouse.x * focus, mouse.y * focus));
    }
  };
}

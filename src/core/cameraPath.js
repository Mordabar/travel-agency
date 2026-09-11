import * as THREE from 'three';
import { SECTIONS, GATES } from './sections.js';

/**
 * Una única trayectoria continua atraviesa las diez habitaciones.
 * No hay cortes entre secciones: la cámara viaja físicamente por
 * puertas, portales, mapas y nubes.
 */
function buildCurves() {
  const posPts = [];
  const tgtPts = [];
  SECTIONS.forEach((s, i) => {
    posPts.push(new THREE.Vector3(...s.cam.pos));
    tgtPts.push(new THREE.Vector3(...s.cam.target));
    const gate = GATES[i];
    if (gate) {
      posPts.push(new THREE.Vector3(...gate.pos));
      tgtPts.push(new THREE.Vector3(...gate.target));
    }
  });
  return {
    path: new THREE.CatmullRomCurve3(posPts, false, 'centripetal', 0.4),
    look: new THREE.CatmullRomCurve3(tgtPts, false, 'centripetal', 0.4),
    count: posPts.length
  };
}

export const curves = buildCurves();

/** Valor de progreso (0..1) en el que se encuentra cada sección. */
export const sectionU = SECTIONS.map((_, i) => (i * 2) / (curves.count - 1));

export function uForSection(id) {
  const i = SECTIONS.findIndex((s) => s.id === id);
  return i < 0 ? 0 : sectionU[i];
}

/** Sección activa y progreso local dentro de ella, para el overlay. */
export function resolveSection(u) {
  let index = 0;
  let best = Infinity;
  for (let i = 0; i < sectionU.length; i++) {
    const d = Math.abs(u - sectionU[i]);
    if (d < best) {
      best = d;
      index = i;
    }
  }
  const span = sectionU[1] - sectionU[0];
  // 1 en el centro de la habitación, 0 al salir de ella.
  const focus = Math.max(0, 1 - best / (span * 0.62));
  return { index, focus, section: SECTIONS[index] };
}

const _p = new THREE.Vector3();
const _t = new THREE.Vector3();

export function sample(u) {
  const c = THREE.MathUtils.clamp(u, 0, 1);
  curves.path.getPoint(c, _p);
  curves.look.getPoint(c, _t);
  return { pos: _p, target: _t };
}

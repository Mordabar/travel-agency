import './styles/main.css';
import { detectQuality } from './core/quality.js';
import { Experience } from './core/experience.js';
import { ScrollRig } from './ui/scrollRig.js';
import { Overlay } from './ui/overlay.js';
import { createNav } from './ui/nav.js';
import { createLoader } from './ui/loader.js';
import { SECTIONS } from './core/sections.js';

const quality = detectQuality();
document.documentElement.dataset.quality = quality.tier;
if (quality.reduced) document.documentElement.dataset.reduced = 'true';

const loader = createLoader();
const canvas = document.getElementById('scene');
const experience = new Experience(canvas, quality);

let built = 0;
experience.on('room', () => {
  built += 1;
  loader.set(Math.min(1, built / SECTIONS.length));
});

const rig = new ScrollRig(quality);
const overlay = new Overlay(document.getElementById('overlay'), experience, rig);
const nav = createNav(rig, experience);

rig.onChange = (p) => {
  experience.setProgress(p);
  nav.update(p);
};

// El lobby se prepara primero: la experiencia arranca sin esperar al resto.
experience.prime().then(() => {
  loader.set(0.35);
  experience.start();
  experience.buildRest();
  loader.ready(() => {
    // Pequeño empujón de cámara para que el viaje se sienta iniciado.
    rig.lenis.scrollTo(rig.lenis.limit * 0.012, { duration: 1.6 });
  });
});

// El overlay se actualiza en el mismo ciclo que el render.
function tick() {
  overlay.update();
  requestAnimationFrame(tick);
}
tick();

// Enlaces profundos: /#seccion-planes abre directamente esa sala.
window.addEventListener('load', () => {
  const hash = location.hash.replace('#seccion-', '');
  if (hash && SECTIONS.some((s) => s.id === hash)) {
    setTimeout(() => rig.goTo(hash, { duration: 0.1, immediate: true }), 60);
  }
});

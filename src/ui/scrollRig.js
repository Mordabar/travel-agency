import Lenis from 'lenis';
import { uForSection, sectionU } from '../core/cameraPath.js';
import { SECTIONS } from '../core/sections.js';

/**
 * El scroll es el motor del viaje: mueve la cámara por la curva continua.
 * Un menú permite saltar a cualquier sección sin recorrer todo el trayecto.
 */
export class ScrollRig {
  constructor({ reduced }) {
    this.reduced = reduced;
    this.progress = 0;
    this.spacer = document.getElementById('scroll-space');
    // Altura de recorrido: espacio suficiente para que cada sala respire.
    this.spacer.style.height = `${SECTIONS.length * 145}vh`;

    this.lenis = new Lenis({
      duration: reduced ? 0.1 : 1.5,
      smoothWheel: !reduced,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.35,
      lerp: reduced ? 1 : 0.075
    });

    this.lenis.on('scroll', ({ scroll, limit }) => {
      this.progress = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
      this.onChange && this.onChange(this.progress);
    });

    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Teclado: la experiencia debe ser navegable sin ratón.
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Home') this.goTo('inicio');
      if (e.key === 'End') this.goTo('contacto');
    });
  }

  get limit() {
    return this.lenis.limit;
  }

  goTo(sectionId, opts = {}) {
    const u = uForSection(sectionId);
    this.lenis.scrollTo(u * this.lenis.limit, {
      duration: this.reduced ? 0.2 : 2.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      ...opts
    });
  }

  nearestIndex() {
    let best = 0;
    let d = Infinity;
    sectionU.forEach((u, i) => {
      const dd = Math.abs(u - this.progress);
      if (dd < d) {
        d = dd;
        best = i;
      }
    });
    return best;
  }
}

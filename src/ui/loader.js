import { brand } from '../content.js';

/**
 * Cargador elegante: no bloquea la experiencia esperando todo el sitio.
 * Muestra progreso real de habitaciones construidas y entrega el control
 * en cuanto el lobby está listo.
 */
export function createLoader() {
  const el = document.getElementById('loader');
  const bar = el.querySelector('.loader__bar span');
  const enter = el.querySelector('.loader__enter');
  const hint = el.querySelector('.loader__hint');
  let value = 0;

  return {
    set(p) {
      value = Math.max(value, p);
      bar.style.transform = `scaleX(${value})`;
    },
    ready(onEnter) {
      hint.textContent = 'Experiencia lista';
      enter.hidden = false;
      enter.focus();
      enter.addEventListener('click', () => {
        el.classList.add('is-gone');
        document.body.classList.remove('is-locked');
        setTimeout(() => el.remove(), 1200);
        onEnter && onEnter();
      }, { once: true });
    }
  };
}

import { MENU, SECTIONS } from '../core/sections.js';
import { brand, waLink, waMessages } from '../content.js';

/**
 * Menú siempre accesible: permite saltar a cualquier sección real sin
 * recorrer todo el viaje. Incluye el botón flotante de WhatsApp y la
 * etiqueta que sigue al cursor cuando un objeto 3D es accionable.
 */
export function createNav(rig, experience) {
  const nav = document.getElementById('nav');
  nav.innerHTML = `
    <a class="nav__brand" href="#seccion-inicio" data-goto="inicio">Travel<span>_</span>Jet</a>
    <button class="nav__toggle" aria-expanded="false" aria-controls="nav-list">
      <span></span><span></span><span class="sr-only">Menú</span>
    </button>
    <ul class="nav__list" id="nav-list">
      ${MENU.map((s) => `<li><button data-goto="${s.id}" data-id="${s.id}">${s.label}</button></li>`).join('')}
    </ul>
    <a class="nav__wa" href="${waLink(waMessages.floating)}" target="_blank" rel="noopener">WhatsApp</a>`;

  const toggle = nav.querySelector('.nav__toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-goto]');
    if (!btn) return;
    e.preventDefault();
    rig.goTo(btn.dataset.goto);
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  const buttons = [...nav.querySelectorAll('[data-id]')];
  const progressBar = document.getElementById('progress');

  // Botón flotante persistente.
  const float = document.getElementById('wa-float');
  float.href = waLink(waMessages.floating);
  float.addEventListener('pointerenter', () => float.classList.add('is-hot'));
  float.addEventListener('pointerleave', () => float.classList.remove('is-hot'));

  // Etiqueta contextual del cursor sobre objetos accionables.
  const cursor = document.getElementById('cursor');
  experience.on('hover', (data) => {
    document.body.classList.toggle('is-pointing', !!data);
    if (data) cursor.textContent = data.label;
  });
  window.addEventListener('pointermove', (e) => {
    cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  }, { passive: true });
  window.addEventListener('click', () => experience.click());

  return {
    update(progress) {
      progressBar.style.transform = `scaleX(${progress})`;
      const idx = rig.nearestIndex();
      const active = SECTIONS[idx];
      // Las salas narrativas se asocian a la sección de menú anterior.
      let menuId = active.id;
      if (!active.menu) {
        for (let i = idx; i >= 0; i--) {
          if (SECTIONS[i].menu) {
            menuId = SECTIONS[i].id;
            break;
          }
        }
      }
      buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.id === menuId));
      document.title = `${active.label} · ${brand.name}`;
    }
  };
}

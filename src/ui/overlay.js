import * as THREE from 'three';
import { SECTIONS } from '../core/sections.js';
import { sectionU } from '../core/cameraPath.js';
import {
  brand, contact, categories, plans, testimonials, infoDesk, license,
  waLink, waMessages, telLink
} from '../content.js';

/**
 * Capa de contenido. El texto vive en HTML real —legible, seleccionable,
 * accesible e indexable— pero está anclado a un punto del espacio 3D:
 * cada panel se proyecta desde su habitación, así que se mueve con ella.
 * Si el 3D fallara, el contenido seguiría estando completo.
 */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function wa(msg, text, variant = 'primary') {
  return `<a class="btn btn--${variant}" href="${waLink(msg)}" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1a13 13 0 0 1-5.6-4.4c-.6-.8-1-1.7-1-2.6 0-.9.5-1.4.7-1.6.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .6.4l.8 1.9c.1.2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.5.8 1 1.4 1.8 2 .6.4 1.1.7 1.4.8.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.2.1.6 0 .9Z"/></svg>
    <span>${esc(text)}</span></a>`;
}

function scrollBtn(target, text) {
  return `<button class="btn btn--ghost" data-goto="${target}"><span>${esc(text)}</span></button>`;
}

function panelHTML(id) {
  switch (id) {
    case 'inicio':
      return `
        <p class="eyebrow">${esc(brand.city)}, ${esc(brand.region)} · ${esc(brand.country)}</p>
        <h1 class="display">Travel<span class="display__mark">_</span>Jet</h1>
        <p class="lead">${esc(brand.tagline)}</p>
        <p class="body">${esc(brand.intro)}</p>
        <div class="actions">
          ${scrollBtn('planes', 'Ver planes')}
          ${wa(waMessages.hero, 'Hablar por WhatsApp', 'wa')}
        </div>
        <p class="scroll-hint"><span></span>Desplázate para entrar</p>`;

    case 'destinos':
      return `
        <p class="eyebrow">Destination Room</p>
        <h2 class="title">¿A dónde quieres viajar?</h2>
        <ul class="routes">
          ${categories.map((c) => `
            <li class="route">
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.blurb)}</p>
              ${wa(c.waMessage, 'Consultar por WhatsApp', 'wa-sm')}
            </li>`).join('')}
        </ul>`;

    case 'planes': {
      const hasPlans = plans.length > 0;
      const body = hasPlans
        ? `<ul class="plans">${plans.map((p) => `
            <li class="plan">
              <h3>${esc(p.name)}</h3>
              ${p.destination ? `<p class="plan__dest">${esc(p.destination)}</p>` : ''}
              ${p.description ? `<p class="body">${esc(p.description)}</p>` : ''}
              ${p.includes?.length ? `<ul class="plan__inc">${p.includes.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
              ${p.price ? `<p class="plan__price">${esc(p.price)}</p>` : ''}
              ${p.promo ? `<p class="plan__promo">${esc(p.promo)}</p>` : ''}
              ${wa(waMessages.planNamed(p.name), 'Cotizar por WhatsApp', 'wa-sm')}
            </li>`).join('')}</ul>`
        : `<ul class="routes">${categories.map((c) => `
            <li class="route">
              <h3>${esc(c.title)}</h3>
              <p>${esc(c.blurb)}</p>
              ${wa(c.waMessage, 'Cotizar por WhatsApp', 'wa-sm')}
            </li>`).join('')}</ul>
           <p class="note">Los planes vigentes se arman a medida con la asesora de Travel_Jet.</p>`;
      return `
        <p class="eyebrow">Travel Gallery</p>
        <h2 class="title">Planes</h2>
        <p class="lead">${esc(brand.tagline)}</p>
        ${body}`;
    }

    case 'viaje':
      return `
        <p class="eyebrow">El viaje</p>
        <h2 class="title">La ruta se enciende</h2>
        <p class="body">Cada plan empieza con una línea en un mapa.</p>`;

    case 'horizonte':
      return `
        <p class="eyebrow">El destino</p>
        <h2 class="title">Esto es lo que significa viajar</h2>
        <div class="actions">${wa(waMessages.horizon, 'Quiero viajar', 'wa')}</div>`;

    case 'recuerdos':
      return `
        <p class="eyebrow">Travel Memories</p>
        <h2 class="title">Todo viaje termina siendo un recuerdo</h2>
        <div class="actions">${wa(waMessages.memories, 'Quiero vivir mi propio viaje', 'wa-sm')}</div>`;

    case 'opiniones': {
      const body = testimonials.length
        ? `<ul class="quotes">${testimonials.map((t) => `
            <li class="quote">
              <blockquote>${esc(t.text)}</blockquote>
              <cite>${esc(t.name)}${t.trip ? ` · ${esc(t.trip)}` : ''}</cite>
            </li>`).join('')}</ul>`
        : `<p class="body">Las opiniones publicadas en esta sala son las de viajeros reales de Travel_Jet. Aquí no se muestra ningún testimonio que la agencia no haya verificado.</p>`;
      return `
        <p class="eyebrow">Memories Room</p>
        <h2 class="title">Opiniones</h2>
        ${body}
        <div class="actions">${wa(waMessages.opinions, 'Hablar con Travel_Jet', 'wa')}</div>`;
    }

    case 'informacion':
      return `
        <p class="eyebrow">Travel Information Desk</p>
        <h2 class="title">Información útil</h2>
        <dl class="faq">
          ${infoDesk.map((i) => `<div class="faq__item"><dt>${esc(i.q)}</dt><dd>${esc(i.a)}</dd></div>`).join('')}
        </dl>
        <div class="actions">${wa(waMessages.contact, 'Consultar por WhatsApp', 'wa-sm')}</div>`;

    case 'licencia':
      return `
        <p class="eyebrow">Trust Room</p>
        <h2 class="title">Licencia</h2>
        <dl class="legal">
          <div><dt>Razón social</dt><dd>${esc(license.legalName)}</dd></div>
          <div><dt>Domicilio</dt><dd>${esc(license.city)}</dd></div>
          ${license.rnt ? `<div><dt>Registro Nacional de Turismo</dt><dd>${esc(license.rnt)}</dd></div>` : ''}
          ${license.nit ? `<div><dt>NIT</dt><dd>${esc(license.nit)}</dd></div>` : ''}
        </dl>
        <p class="body">${esc(license.note)}</p>
        ${license.documents.length
          ? `<ul class="docs">${license.documents.map((d) => `<li><a class="btn btn--ghost" href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.label)}</a></li>`).join('')}</ul>`
          : ''}
        <div class="actions">${wa(waMessages.license, 'Escribir a Travel_Jet', 'wa-sm')}</div>`;

    case 'contacto':
      return `
        <p class="eyebrow">Travel Desk</p>
        <h2 class="title">Hablemos de tu próximo viaje</h2>
        <div class="actions">${wa(waMessages.contact, 'Hablar por WhatsApp', 'wa')}</div>
        <ul class="contact">
          <li><span>WhatsApp y teléfono</span><a href="${telLink()}">${esc(contact.phoneDisplay)}</a></li>
          ${contact.email ? `<li><span>Correo</span><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>` : ''}
          <li><span>Oficina</span><p>${esc(contact.addressLine)}<br>${esc(contact.addressCity)}</p></li>
          <li><span>Redes</span><p>${contact.social.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(' · ')}</p></li>
        </ul>
        <footer class="site-footer">
          <p class="site-footer__brand">Travel<span>_</span>Jet</p>
          <nav class="site-footer__nav" aria-label="Pie de página">
            ${SECTIONS.filter((s) => s.menu).map((s) => `<button data-goto="${s.id}">${esc(s.label)}</button>`).join('')}
          </nav>
          <p class="site-footer__legal">
            ${esc(license.legalName)} · ${esc(contact.addressCity)}<br>
            © ${new Date().getFullYear()} ${esc(brand.name)}. Todos los derechos reservados.
          </p>
        </footer>`;

    default:
      return '';
  }
}

export class Overlay {
  constructor(root, experience, rig) {
    this.root = root;
    this.exp = experience;
    this.rig = rig;
    this.panels = SECTIONS.map((s) => {
      const el = document.createElement('article');
      el.className = `panel panel--${s.id}`;
      el.id = `seccion-${s.id}`;
      el.dataset.section = s.id;
      el.setAttribute('aria-label', s.label);
      el.innerHTML = `<div class="panel__inner">${panelHTML(s.id)}</div>`;
      root.appendChild(el);
      return { el, section: s, visible: false };
    });

    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-goto]');
      if (btn) {
        e.preventDefault();
        rig.goTo(btn.dataset.goto);
      }
    });

    this._v = new THREE.Vector3();
    this.narrow = window.innerWidth < 900;
    window.addEventListener('resize', () => {
      this.narrow = window.innerWidth < 900;
    }, { passive: true });
  }

  update() {
    const { camera } = this.exp;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const u = this.exp.progress;
    const span = sectionU[1] - sectionU[0];
    const navH = this.narrow ? 74 : 92;

    this.panels.forEach((p, i) => {
      const room = this.exp.rooms[i];
      // Ventana estrecha: sólo una sección habla a la vez.
      const d = Math.abs(u - sectionU[i]) / (span * 0.5);
      const opacity = d >= 1 ? 0 : Math.pow(1 - d * d, 1.4);

      if (opacity <= 0.004) {
        if (p.visible) {
          p.el.style.opacity = '0';
          p.el.style.visibility = 'hidden';
          p.el.setAttribute('aria-hidden', 'true');
          p.visible = false;
        }
        return;
      }

      if (!p.visible) {
        p.el.style.visibility = 'visible';
        p.el.removeAttribute('aria-hidden');
        p.visible = true;
      }
      p.el.style.opacity = opacity.toFixed(3);

      if (this.narrow) {
        p.el.style.transform = `translate3d(0, ${((1 - opacity) * 26).toFixed(1)}px, 0)`;
        return;
      }

      const rect = p.el.firstElementChild.getBoundingClientRect();
      const pw = rect.width || 420;
      const ph = rect.height || 320;

      // Composición editorial: el contenido se apoya a un lado y la
      // habitación queda visible. El anclaje 3D aporta la deriva sutil.
      let x = w * 0.5 - pw * 0.5;
      let y = h * 0.5 - ph * 0.5;
      if (room) {
        this._v.copy(room.anchor).project(camera);
        const px = (this._v.x * 0.5 + 0.5) * w;
        const py = (-this._v.y * 0.5 + 0.5) * h;
        const drift = THREE.MathUtils.clamp((px - w * 0.5) * 0.16, -46, 46);
        const driftY = THREE.MathUtils.clamp((py - h * 0.5) * 0.12, -34, 34);
        const side = p.section.panelSide ?? (i % 2 === 0 ? -1 : 1);
        x = w * 0.5 + side * w * 0.2 - pw * 0.5 + drift;
        y = h * 0.5 - ph * 0.5 + driftY;
      }

      // Nunca fuera de la pantalla ni bajo la barra de navegación.
      x = Math.min(Math.max(x, 24), w - pw - 24);
      y = Math.min(Math.max(y, navH), Math.max(navH, h - ph - 28));

      const lift = (1 - opacity) * 30;
      p.el.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + lift).toFixed(1)}px, 0)`;
    });
  }
}

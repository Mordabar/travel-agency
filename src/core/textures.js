import * as THREE from 'three';

/**
 * Todas las texturas de la experiencia son procedurales: se dibujan en
 * canvas en tiempo de carga. No hay banco de imágenes, ni descargas, ni
 * dependencia de assets externos. Esto mantiene el peso mínimo y evita
 * que el stock visual se convierta en protagonista.
 */

const cache = new Map();
function memo(key, build) {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
}

function canvas(size, h = size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = h;
  return c;
}

function finish(c, { repeat = false, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/* Ruido determinista para que cada recarga se vea igual. */
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Punto suave: partículas, nubes, destellos, luces de bokeh. */
export function softSprite(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  return memo(`sprite:${inner}:${outer}`, () => {
    const c = canvas(128);
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.55)'));
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return finish(c);
  });
}

/** Nube volumétrica falsa: billboard con bordes mullidos. */
export function cloudSprite() {
  return memo('cloud', () => {
    const c = canvas(256);
    const g = c.getContext('2d');
    const rnd = mulberry(77);
    g.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) {
      const x = 128 + (rnd() - 0.5) * 150;
      const y = 128 + (rnd() - 0.5) * 90;
      const r = 26 + rnd() * 52;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(255,255,255,0.30)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    return finish(c);
  });
}

/**
 * Paisaje estilizado: cielo en degradado, sol, capas de silueta y agua.
 * Es ilustración generada, no fotografía de stock. Cada `seed` produce un
 * paisaje distinto y estable.
 */
export function landscape(seed, opts = {}) {
  const key = `land:${seed}:${JSON.stringify(opts)}`;
  return memo(key, () => {
    const W = 640;
    const H = opts.tall ? 880 : 420;
    const c = canvas(W, H);
    const g = c.getContext('2d');
    const rnd = mulberry(seed);
    const scheme = opts.scheme || ['dusk', 'ocean', 'tropic', 'alpine', 'city'][seed % 5];

    const schemes = {
      dusk: { sky: ['#0b1c3a', '#2a4a7a', '#e9a15d', '#f6d9a8'], sun: '#ffd9a0', land: '#08121f', water: '#10233d' },
      ocean: { sky: ['#04121f', '#0d3a52', '#2b8fa3', '#bfeaf0'], sun: '#e9fbff', land: '#031019', water: '#0a2c3f' },
      tropic: { sky: ['#062430', '#0f5a63', '#4fd6c4', '#f2e9c8'], sun: '#fff3cf', land: '#04202a', water: '#0d5560' },
      alpine: { sky: ['#08142c', '#26406e', '#7aa0c8', '#e6eef8'], sun: '#ffffff', land: '#0a1426', water: '#122544' },
      city: { sky: ['#0a0f26', '#2b2350', '#7c5aa0', '#e8b98a'], sun: '#ffd2a6', land: '#070b18', water: '#0d1226' }
    };
    const p = schemes[scheme] || schemes.dusk;

    const sky = g.createLinearGradient(0, 0, 0, H * 0.68);
    sky.addColorStop(0, p.sky[0]);
    sky.addColorStop(0.45, p.sky[1]);
    sky.addColorStop(0.82, p.sky[2]);
    sky.addColorStop(1, p.sky[3]);
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    // Sol / halo
    const sx = W * (0.25 + rnd() * 0.5);
    const sy = H * (0.42 + rnd() * 0.14);
    const halo = g.createRadialGradient(sx, sy, 0, sx, sy, H * 0.42);
    halo.addColorStop(0, p.sun);
    halo.addColorStop(0.12, 'rgba(255,235,200,0.55)');
    halo.addColorStop(1, 'rgba(255,235,200,0)');
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = halo;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';

    // Nubes en banda
    for (let i = 0; i < 7; i++) {
      const y = H * (0.18 + rnd() * 0.34);
      const w = W * (0.18 + rnd() * 0.4);
      const h = 8 + rnd() * 16;
      g.fillStyle = `rgba(255,255,255,${0.05 + rnd() * 0.1})`;
      g.beginPath();
      g.ellipse(rnd() * W, y, w, h, 0, 0, Math.PI * 2);
      g.fill();
    }

    const horizon = H * (opts.tall ? 0.72 : 0.66);

    // Capas de relieve, de lejos a cerca
    const layers = scheme === 'ocean' ? 1 : 3;
    for (let l = 0; l < layers; l++) {
      const depth = l / Math.max(1, layers - 1 || 1);
      const base = horizon - (1 - depth) * H * 0.06;
      const amp = H * (0.16 - depth * 0.07);
      g.beginPath();
      g.moveTo(0, H);
      g.lineTo(0, base);
      let x = 0;
      let y = base;
      while (x < W) {
        const step = 26 + rnd() * 60;
        const ny = base - Math.abs(Math.sin((x / W) * (2 + l) * Math.PI + seed)) * amp * (0.5 + rnd() * 0.8);
        g.quadraticCurveTo(x + step * 0.5, (y + ny) * 0.5 - amp * 0.18, x + step, ny);
        x += step;
        y = ny;
      }
      g.lineTo(W, H);
      g.closePath();
      const shade = g.createLinearGradient(0, base - amp, 0, H);
      shade.addColorStop(0, mix(p.land, '#ffffff', 0.22 - depth * 0.16));
      shade.addColorStop(1, p.land);
      g.fillStyle = shade;
      g.fill();
    }

    // Agua con reflejo del sol
    if (scheme === 'ocean' || scheme === 'tropic' || rnd() > 0.45) {
      const water = g.createLinearGradient(0, horizon, 0, H);
      water.addColorStop(0, mix(p.water, '#ffffff', 0.22));
      water.addColorStop(1, p.water);
      g.fillStyle = water;
      g.fillRect(0, horizon, W, H - horizon);
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 60; i++) {
        const yy = horizon + rnd() * (H - horizon);
        const spread = 6 + ((yy - horizon) / (H - horizon)) * 90;
        g.fillStyle = `rgba(255,226,184,${0.03 + rnd() * 0.1})`;
        g.fillRect(sx - spread * rnd(), yy, spread * (0.4 + rnd()), 1.4);
      }
      g.globalCompositeOperation = 'source-over';
    }

    // Grano fino para que no se vea plano digital
    const img = g.getImageData(0, 0, W, H);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (rnd() - 0.5) * 9;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    return finish(c);
  });
}

function mix(a, b, t) {
  const pa = hex(a);
  const pb = hex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const gg = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${gg},${bl})`;
}
function hex(h) {
  if (h.startsWith('rgb')) return h.match(/\d+/g).map(Number);
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mármol pulido para la Trust Room. */
export function marble() {
  return memo('marble', () => {
    const S = 512;
    const c = canvas(S);
    const g = c.getContext('2d');
    const rnd = mulberry(41);
    g.fillStyle = '#e8e6e1';
    g.fillRect(0, 0, S, S);
    for (let i = 0; i < 26; i++) {
      g.beginPath();
      let x = rnd() * S;
      let y = rnd() * S;
      g.moveTo(x, y);
      for (let s = 0; s < 24; s++) {
        x += (rnd() - 0.4) * 34;
        y += (rnd() - 0.5) * 26;
        g.lineTo(x, y);
      }
      g.strokeStyle = `rgba(120,130,145,${0.05 + rnd() * 0.12})`;
      g.lineWidth = 0.6 + rnd() * 2.6;
      g.stroke();
    }
    for (let i = 0; i < 9; i++) {
      const grad = g.createRadialGradient(rnd() * S, rnd() * S, 0, rnd() * S, rnd() * S, 200);
      grad.addColorStop(0, 'rgba(255,255,255,0.5)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, S, S);
    }
    return finish(c, { repeat: true });
  });
}

/** Papel/postal: fondo cálido con fibra, para recuerdos y postales. */
export function paper() {
  return memo('paper', () => {
    const S = 256;
    const c = canvas(S);
    const g = c.getContext('2d');
    const rnd = mulberry(9);
    g.fillStyle = '#f4efe4';
    g.fillRect(0, 0, S, S);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(150,135,110,${rnd() * 0.09})`;
      g.fillRect(rnd() * S, rnd() * S, 1.4, 1.4);
    }
    return finish(c, { repeat: true });
  });
}

/** Entorno equirectangular para reflejos: noche azul con horizonte cálido. */
export function envCanvas() {
  const c = canvas(512, 256);
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#04070f');
  grad.addColorStop(0.42, '#0d1c33');
  grad.addColorStop(0.52, '#23405f');
  grad.addColorStop(0.62, '#3c5164');
  grad.addColorStop(0.75, '#11161f');
  grad.addColorStop(1, '#05070c');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 256);
  const warm = g.createRadialGradient(360, 128, 0, 360, 128, 190);
  warm.addColorStop(0, 'rgba(255,206,150,0.6)');
  warm.addColorStop(1, 'rgba(255,206,150,0)');
  g.fillStyle = warm;
  g.fillRect(0, 0, 512, 256);
  const cool = g.createRadialGradient(110, 100, 0, 110, 100, 160);
  cool.addColorStop(0, 'rgba(120,220,230,0.32)');
  cool.addColorStop(1, 'rgba(120,220,230,0)');
  g.fillStyle = cool;
  g.fillRect(0, 0, 512, 256);
  return c;
}

/** Retícula fina para suelos y cristales técnicos. */
export function grid(color = 'rgba(180,220,255,0.22)') {
  return memo(`grid:${color}`, () => {
    const S = 256;
    const c = canvas(S);
    const g = c.getContext('2d');
    g.clearRect(0, 0, S, S);
    g.strokeStyle = color;
    g.lineWidth = 1;
    for (let i = 0; i <= S; i += 32) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, S);
      g.moveTo(0, i);
      g.lineTo(S, i);
      g.stroke();
    }
    return finish(c, { repeat: true });
  });
}

/** Rótulo dibujado en canvas: señalética dentro del mundo 3D. */
export function label(text, opts = {}) {
  const {
    size = 128,
    color = '#eaf4ff',
    font = '600 96px "Inter", system-ui, sans-serif',
    letter = 10,
    glow = 'rgba(150,220,255,0.65)',
    pad = 60,
    align = 'center'
  } = opts;
  const key = `label:${text}:${JSON.stringify(opts)}`;
  return memo(key, () => {
    const probe = canvas(8);
    const pg = probe.getContext('2d');
    pg.font = font;
    const spaced = letter ? text.split('').join(String.fromCharCode(8202)) : text;
    const w = Math.ceil(pg.measureText(spaced).width + letter * text.length + pad * 2);
    const h = Math.ceil(size * 1.9);
    const c = canvas(Math.max(64, w), h);
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    g.font = font;
    g.textBaseline = 'middle';
    g.textAlign = align;
    g.letterSpacing = `${letter}px`;
    g.shadowColor = glow;
    g.shadowBlur = 38;
    g.fillStyle = color;
    const x = align === 'center' ? c.width / 2 : pad;
    g.fillText(text, x, h / 2);
    g.shadowBlur = 0;
    g.fillText(text, x, h / 2);
    const t = finish(c);
    t.userData = { aspect: c.width / c.height };
    return t;
  });
}

/** Lienzo de un documento formal, para la sala de Licencia. */
export function documentSheet(lines) {
  const key = `doc:${lines.join('|')}`;
  return memo(key, () => {
    const W = 600;
    const H = 800;
    const c = canvas(W, H);
    const g = c.getContext('2d');
    g.fillStyle = '#f7f5f0';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(40,60,90,0.35)';
    g.lineWidth = 3;
    g.strokeRect(22, 22, W - 44, H - 44);
    g.fillStyle = '#16304f';
    g.font = '600 40px "Inter", system-ui, sans-serif';
    g.textAlign = 'center';
    g.fillText(lines[0] || '', W / 2, 120);
    g.fillStyle = '#3d5677';
    g.font = '400 26px "Inter", system-ui, sans-serif';
    lines.slice(1).forEach((l, i) => g.fillText(l, W / 2, 200 + i * 46));
    g.strokeStyle = 'rgba(40,60,90,0.18)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) {
      const y = 430 + i * 34;
      g.beginPath();
      g.moveTo(90, y);
      g.lineTo(W - 90 - (i % 3) * 60, y);
      g.stroke();
    }
    return finish(c);
  });
}

/** Postal escrita: se usa sólo con testimonios reales de Travel_Jet. */
export function postcard(text, name) {
  return memo(`postcard:${text}:${name}`, () => {
    const W = 520;
    const H = 360;
    const c = canvas(W, H);
    const g = c.getContext('2d');
    g.fillStyle = '#f5efe2';
    g.fillRect(0, 0, W, H);
    const rnd = mulberry(text.length + 3);
    for (let i = 0; i < 2200; i++) {
      g.fillStyle = `rgba(150,135,110,${rnd() * 0.08})`;
      g.fillRect(rnd() * W, rnd() * H, 1.3, 1.3);
    }
    g.strokeStyle = 'rgba(30,60,90,0.25)';
    g.lineWidth = 2;
    g.strokeRect(18, 18, W - 36, H - 36);
    g.fillStyle = '#1d3550';
    g.font = '400 25px Georgia, serif';
    const words = String(text).split(' ');
    let line = '';
    let y = 92;
    words.forEach((w) => {
      if (g.measureText(line + w).width > W - 110) {
        g.fillText(line, 56, y);
        line = '';
        y += 36;
      }
      line += w + ' ';
    });
    g.fillText(line, 56, y);
    g.font = 'italic 500 24px Georgia, serif';
    g.fillStyle = '#4a6b8a';
    g.fillText(`— ${name}`, 56, Math.min(H - 52, y + 56));
    return finish(c);
  });
}

/** Pantalla informativa del Travel Information Desk. */
export function screen(title, body) {
  return memo(`screen:${title}:${body}`, () => {
    const W = 620;
    const H = 360;
    const c = canvas(W, H);
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(10,32,52,0.96)');
    grad.addColorStop(1, 'rgba(6,18,30,0.96)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(150,225,255,0.4)';
    g.lineWidth = 2;
    g.strokeRect(14, 14, W - 28, H - 28);
    g.fillStyle = '#9fe8ff';
    g.font = '600 30px "Inter", system-ui, sans-serif';
    wrap(g, title, 48, 88, W - 96, 38);
    g.fillStyle = '#d8ecf8';
    g.font = '400 25px "Inter", system-ui, sans-serif';
    wrap(g, body, 48, 196, W - 96, 36);
    return finish(c);
  });
}

function wrap(g, text, x, y, maxW, lh) {
  const words = String(text).split(' ');
  let line = '';
  words.forEach((w) => {
    if (g.measureText(line + w).width > maxW) {
      g.fillText(line, x, y);
      line = '';
      y += lh;
    }
    line += w + ' ';
  });
  g.fillText(line, x, y);
}

/** Cielo limpio para escenarios abiertos: sólo luz, sin relieve pintado. */
export function skyGradient() {
  return memo('skyGradient', () => {
    const W = 512;
    const H = 256;
    const c = canvas(W, H);
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#04101f');
    grad.addColorStop(0.34, '#0d3350');
    grad.addColorStop(0.66, '#2f7f95');
    grad.addColorStop(0.86, '#8ecdd0');
    grad.addColorStop(1, '#f2dcb4');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    const halo = g.createRadialGradient(150, 218, 0, 150, 218, 190);
    halo.addColorStop(0, 'rgba(255,232,190,0.9)');
    halo.addColorStop(1, 'rgba(255,232,190,0)');
    g.fillStyle = halo;
    g.fillRect(0, 0, W, H);
    const rnd = mulberry(5);
    for (let i = 0; i < 12; i++) {
      g.fillStyle = `rgba(255,255,255,${0.03 + rnd() * 0.05})`;
      g.beginPath();
      g.ellipse(rnd() * W, 60 + rnd() * 110, 40 + rnd() * 110, 5 + rnd() * 10, 0, 0, Math.PI * 2);
      g.fill();
    }
    return finish(c);
  });
}

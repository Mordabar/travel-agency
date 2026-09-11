/**
 * Nivel de calidad por dispositivo. La experiencia 3D nunca se elimina:
 * se adapta. En equipos modestos se reduce geometría, partículas,
 * sombras y postprocesado, pero la narrativa y la dirección de arte
 * se mantienen intactas.
 */
export function detectQuality() {
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let tier = 'high';
  if (coarse || w < 820 || cores <= 4 || mem <= 4) tier = 'medium';
  if (w < 560 && (cores <= 4 || mem <= 3)) tier = 'low';

  const presets = {
    high: { dpr: 1.85, particles: 1, bloom: true, shadows: true, clouds: 60, photos: 1, water: 128 },
    medium: { dpr: 1.5, particles: 0.55, bloom: false, shadows: false, clouds: 34, photos: 0.75, water: 72 },
    low: { dpr: 1.15, particles: 0.3, bloom: false, shadows: false, clouds: 18, photos: 0.55, water: 40 }
  };

  return { tier, reduced, coarse, ...presets[tier] };
}

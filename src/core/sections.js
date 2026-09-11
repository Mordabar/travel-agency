/**
 * Mapa físico del universo Travel_Jet.
 * Las habitaciones existen en un mismo espacio continuo sobre el eje -Z.
 * La cámara nunca corta: recorre una curva que atraviesa puertas,
 * pasillos, mapas, nubes y portales para pasar de una a otra.
 */
export const SECTIONS = [
  {
    id: 'inicio',
    panelSide: -1,
    label: 'Inicio',
    menu: true,
    z: 0,
    room: 'lobby',
    cam: { pos: [0, 1.65, 11], target: [0, 1.75, -6] },
    palette: { fog: 0x060c18, ambient: 0x24354f, key: 0xffd9a8, keyI: 1.5, fogNear: 14, fogFar: 80 }
  },
  {
    id: 'destinos',
    panelSide: -1,
    label: 'Destinos',
    menu: false,
    z: -70,
    room: 'destinations',
    cam: { pos: [0, 1.75, -60], target: [0, 1.8, -78] },
    palette: { fog: 0x071426, ambient: 0x2a3f60, key: 0x9fd8ff, keyI: 1.3, fogNear: 16, fogFar: 90 }
  },
  {
    id: 'planes',
    panelSide: -1,
    label: 'Planes',
    menu: true,
    z: -150,
    room: 'gallery',
    cam: { pos: [0, 1.8, -140], target: [0, 1.85, -160] },
    palette: { fog: 0x080f1f, ambient: 0x33405e, key: 0xffe3b4, keyI: 1.45, fogNear: 16, fogFar: 95 }
  },
  {
    id: 'viaje',
    open: true,
    panelSide: 1,
    label: 'El viaje',
    menu: false,
    z: -240,
    room: 'journey',
    cam: { pos: [0, 2.4, -228], target: [0, 2.3, -252] },
    palette: { fog: 0x0b1c38, ambient: 0x4a6a92, key: 0xfff0d0, keyI: 1.9, fogNear: 30, fogFar: 240 }
  },
  {
    id: 'horizonte',
    open: true,
    panelSide: -1,
    label: 'Horizonte',
    menu: false,
    z: -330,
    room: 'horizon',
    cam: { pos: [0, 2.2, -320], target: [0, 2.0, -344] },
    palette: { fog: 0x0a2a3a, ambient: 0x5a8098, key: 0xffd9a0, keyI: 2.1, fogNear: 40, fogFar: 320 }
  },
  {
    id: 'recuerdos',
    panelSide: 1,
    label: 'Recuerdos',
    menu: false,
    z: -410,
    room: 'memories',
    cam: { pos: [0, 1.7, -400], target: [0, 1.7, -420] },
    palette: { fog: 0x11131f, ambient: 0x4c4562, key: 0xffcf9e, keyI: 1.7, fogNear: 14, fogFar: 80 }
  },
  {
    id: 'opiniones',
    panelSide: -1,
    label: 'Opiniones',
    menu: true,
    z: -480,
    room: 'opinions',
    cam: { pos: [0, 1.7, -470], target: [0, 1.75, -490] },
    palette: { fog: 0x111a2c, ambient: 0x5a6480, key: 0xffe1bb, keyI: 1.9, fogNear: 14, fogFar: 78 }
  },
  {
    id: 'informacion',
    panelSide: 1,
    label: 'Información',
    menu: false,
    z: -545,
    room: 'info',
    cam: { pos: [0, 1.7, -536], target: [0, 1.75, -554] },
    palette: { fog: 0x0d1b28, ambient: 0x486878, key: 0xa8e6f0, keyI: 1.8, fogNear: 14, fogFar: 76 }
  },
  {
    id: 'licencia',
    panelSide: -1,
    label: 'Licencia',
    menu: true,
    z: -615,
    room: 'trust',
    cam: { pos: [0, 1.7, -606], target: [0, 1.8, -624] },
    palette: { fog: 0x101520, ambient: 0x5c6472, key: 0xffffff, keyI: 1.6, fogNear: 14, fogFar: 78 }
  },
  {
    id: 'contacto',
    panelSide: 1,
    label: 'Contacto',
    menu: true,
    z: -690,
    room: 'desk',
    cam: { pos: [0, 1.7, -680], target: [0, 1.7, -700] },
    palette: { fog: 0x0a1120, ambient: 0x36445e, key: 0xffd6a0, keyI: 1.5, fogNear: 14, fogFar: 82 }
  }
];

/** Puntos intermedios que fuerzan a la cámara a atravesar los pasos físicos. */
export const GATES = [
  { pos: [0, 1.7, -30], target: [0, 1.75, -48] },   // puerta lobby -> destinos
  { pos: [0, 1.8, -108], target: [0, 1.85, -126] }, // portal destinos -> galería
  { pos: [0, 2.0, -192], target: [0, 2.1, -212] },  // mapa que se ilumina
  { pos: [0, 2.6, -284], target: [0, 2.3, -302] },  // nubes -> ventana de cabina
  { pos: [0, 1.9, -368], target: [0, 1.8, -386] },  // playa -> recuerdo
  { pos: [0, 1.7, -446], target: [0, 1.72, -462] }, // recuerdos -> opiniones
  { pos: [0, 1.7, -512], target: [0, 1.74, -528] }, // opiniones -> información
  { pos: [0, 1.7, -580], target: [0, 1.78, -598] }, // pasillo -> licencia
  { pos: [0, 1.7, -652], target: [0, 1.72, -668] }  // puerta final -> travel desk
];

export const MENU = SECTIONS.filter((s) => s.menu);

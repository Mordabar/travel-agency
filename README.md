# Travel_Jet — 3D Room Traveling

Experiencia web tridimensional para **Travel_Jet**, agencia de viajes de
Bucaramanga (Santander, Colombia). No es una landing con objetos 3D añadidos:
toda la web es un único espacio continuo que el visitante recorre.

La cámara viaja por una sola curva que atraviesa diez habitaciones conectadas
físicamente —puertas, portales, un mapa que se enciende, nubes, la ventana de
una cabina, un océano, un pasillo de mármol— hasta llegar al escritorio de
atención. El menú permite saltar a cualquier sección sin recorrer todo.

```
Lobby → Destination Room → Travel Gallery → The Journey → Destination Experience
      → Travel Memories → Opiniones → Information Desk → Trust Room → Travel Desk
```

## Regla de contenido

**La narrativa visual es libre; la información comercial no.**

Todo dato de negocio —plan, precio, promoción, testimonio, licencia, contacto—
vive exclusivamente en `src/content.js`. Nada se inventa: los campos que
Travel_Jet aún no ha suministrado están en `null` o vacíos, y la interfaz
degrada con elegancia en lugar de rellenarlos.

### Qué falta por suministrar

| Campo en `src/content.js` | Estado |
| --- | --- |
| `plans` | vacío — la galería muestra las tres rutas reales mientras tanto |
| `testimonials` | vacío — la sala de opiniones no fabrica ninguna |
| `license.rnt`, `license.nit`, `license.documents` | pendientes |
| `contact.email`, `contact.hours` | pendientes |
| `memoryPhotos` | vacío — se usan ilustraciones generadas por código |

Para publicar el catálogo real basta con editar ese archivo y dejar las
imágenes en `public/planes/`, `public/recuerdos/` y `public/licencia/`
(cada carpeta lleva su propio LEEME).

## Arte sin banco de imágenes

No hay assets descargados ni fotografía de stock. Todas las texturas
—paisajes, mármol, papel, postales, pantallas, rótulos, entorno de reflejos—
se dibujan en canvas al cargar (`src/core/textures.js`), y el oleaje del
océano es un shader propio. El resultado pesa poco y mantiene una dirección
de arte coherente. Las fotografías reales de Travel_Jet, cuando existan,
sustituyen automáticamente a las ilustraciones.

## Conversión

WhatsApp es el único punto de conversión, con mensaje distinto según el
contexto (ruta nacional, internacional, cruceros, un plan concreto, opiniones,
contacto). Hay un botón flotante permanente y CTA contextuales en cada sala.
No existen pagos, reservas, cuentas ni cotizador.

## Rendimiento y accesibilidad

- Tres niveles de calidad automáticos según dispositivo (`src/core/quality.js`):
  ajustan resolución, partículas, nubes, segmentos de agua y postprocesado.
  El concepto 3D nunca se elimina en móvil, se adapta.
- Las habitaciones se construyen de forma progresiva en tiempo ocioso; sólo se
  renderizan las contiguas a la cámara.
- Todo el texto es HTML real: seleccionable, accesible e indexable. Los paneles
  se anclan a un punto del espacio 3D, pero nunca se salen de la pantalla.
- Se respeta `prefers-reduced-motion`: sin scroll suavizado ni parallax.
- Navegación por menú, teclado (`Home` / `End`) y enlaces profundos
  (`#seccion-planes`, `#seccion-licencia`…).

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción en dist/
npm run preview  # revisar el build
```

## Estructura

```
src/
  content.js          fuente única de la información comercial real
  core/               motor: render, cámara, trayectoria, calidad, texturas
  rooms/              una habitación por sección del recorrido
  ui/                 menú, paneles de contenido, scroll, cargador
public/               fotografías y documentos reales de Travel_Jet
```

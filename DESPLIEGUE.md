# Cómo publicar la web

## Lo importante en una frase

**Nunca subas los archivos del repositorio al hosting.** Sube únicamente el
contenido de la carpeta `dist/`.

## Por qué

`index.html` en la raíz del proyecto es el archivo de desarrollo. Apunta a
`/src/main.js`, que a su vez importa `three`, `gsap` y `lenis` por nombre.
El navegador no sabe resolver esos nombres: necesita que un compilador los
empaquete antes. Si subes el proyecto tal cual, el navegador no carga ni el
CSS ni el JavaScript, y la página aparece sin estilos, con el enlace
«Ir a contacto» suelto arriba y el icono de WhatsApp gigante en negro.

`npm run build` genera en `dist/` una versión ya empaquetada, con todo
resuelto y con rutas relativas, lista para cualquier hosting estático.

## Subida a Hostinger

1. Descarga la carpeta `dist/` de este repositorio (ya viene compilada).
2. En el Administrador de archivos de Hostinger, entra en `public_html`.
3. Borra lo que haya dentro de `public_html`.
4. Sube **el contenido** de `dist/`, no la carpeta en sí. Dentro de
   `public_html` debe quedar así:

```
public_html/
  index.html
  assets/
    index-*.js
    style-*.css
    three-*.js
  planes/
  recuerdos/
  licencia/
```

5. Recarga el dominio con `Ctrl + F5` para saltarte la caché.

Si ves `public_html/dist/index.html`, has subido la carpeta en lugar de su
contenido: mueve los archivos un nivel hacia arriba.

## Cuando cambies el contenido

Después de editar `src/content.js` (planes, opiniones, licencia, contacto):

```bash
npm install      # sólo la primera vez
npm run build
```

Y vuelve a subir el contenido de `dist/`.

## Comprobación rápida

Si algo falla, abre las herramientas de desarrollo del navegador (`F12`),
pestaña **Red**, y recarga:

- Errores 404 en `assets/…` → los archivos no se subieron o están en una
  subcarpeta equivocada.
- Errores en `/src/main.js` → se subió el proyecto en vez de `dist/`.

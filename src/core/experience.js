import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SECTIONS } from './sections.js';
import { sample, resolveSection, sectionU } from './cameraPath.js';
import { envCanvas } from './textures.js';

import * as lobby from '../rooms/lobby.js';
import * as destinations from '../rooms/destinations.js';
import * as gallery from '../rooms/gallery.js';
import * as journey from '../rooms/journey.js';
import * as horizon from '../rooms/horizon.js';
import * as memories from '../rooms/memories.js';
import * as opinions from '../rooms/opinions.js';
import * as info from '../rooms/info.js';
import * as trust from '../rooms/trust.js';
import * as desk from '../rooms/desk.js';

const BUILDERS = { lobby, destinations, gallery, journey, horizon, memories, opinions, info, trust, desk };

export class Experience {
  constructor(canvas, quality) {
    this.quality = quality;
    this.progress = 0;
    this.mouse = new THREE.Vector2();
    this.mouseSmooth = new THREE.Vector2();
    this.pointer = new THREE.Vector2(-2, -2);
    this.hovered = null;
    this.rooms = new Array(SECTIONS.length).fill(null);
    this.clock = new THREE.Clock();
    this.listeners = {};

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.tier !== 'low',
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.dpr));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.fogColor = new THREE.Color(SECTIONS[0].palette.fog);
    this.scene.background = this.fogColor.clone();
    this.scene.fog = new THREE.Fog(this.fogColor.clone(), 14, 74);

    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 900);

    // Entorno de reflejos generado en canvas: da materialidad sin descargas.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const equi = new THREE.CanvasTexture(envCanvas());
    equi.mapping = THREE.EquirectangularReflectionMapping;
    equi.colorSpace = THREE.SRGBColorSpace;
    this.env = pmrem.fromEquirectangular(equi).texture;
    equi.dispose();
    pmrem.dispose();

    this.ambient = new THREE.HemisphereLight(0x9fc4ff, 0x0a0f18, 0.85);
    this.scene.add(this.ambient);
    this.key = new THREE.DirectionalLight(0xffd9a8, 1.5);
    this.key.position.set(6, 12, 8);
    this.scene.add(this.key);
    this.fill = new THREE.DirectionalLight(0x6fb4ff, 0.22);
    this.fill.position.set(-6, 16, -4);
    this.scene.add(this.fill);

    if (quality.bloom) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 0.52, 0.9, 0.82
      );
      this.composer.addPass(bloom);
      this.composer.addPass(new OutputPass());
      this.composer.setPixelRatio(Math.min(window.devicePixelRatio, quality.dpr));
    }

    this.raycaster = new THREE.Raycaster();
    this._bindEvents();
  }

  on(evt, fn) {
    (this.listeners[evt] ||= []).push(fn);
  }
  emit(evt, payload) {
    (this.listeners[evt] || []).forEach((f) => f(payload));
  }

  _bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('pointermove', (e) => {
      this.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      this.pointer.copy(this.mouse);
    }, { passive: true });
    window.addEventListener('pointerleave', () => {
      this.mouse.set(0, 0);
      this.pointer.set(-2, -2);
    }, { passive: true });
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    // En pantallas verticales se abre el campo de visión para no perder la sala.
    this.camera.fov = w / h < 0.85 ? 68 : 52;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality.dpr));
    if (this.composer) {
      this.composer.setSize(w, h);
      this.composer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality.dpr));
    }
  }

  /** Construye una habitación bajo demanda: la carga es progresiva. */
  ensure(index) {
    if (index < 0 || index >= SECTIONS.length || this.rooms[index]) return;
    const section = SECTIONS[index];
    const mod = BUILDERS[section.room];
    const room = mod.build({ env: this.env, quality: this.quality, section });
    room.section = section;
    room.index = index;
    this.rooms[index] = room;
    this.scene.add(room.group);
    this.emit('room', { index, total: SECTIONS.length });
  }

  /** Prepara el lobby y su vecino; el resto llega en tiempo ocioso. */
  async prime() {
    this.ensure(0);
    this.ensure(1);
    await new Promise((r) => requestAnimationFrame(r));
    return this;
  }

  buildRest() {
    const queue = [];
    for (let i = 2; i < SECTIONS.length; i++) queue.push(i);
    const idle = window.requestIdleCallback || ((cb) => setTimeout(() => cb({ timeRemaining: () => 8 }), 24));
    const step = (deadline) => {
      while (queue.length && (deadline.timeRemaining() > 3 || deadline.didTimeout)) {
        this.ensure(queue.shift());
      }
      if (queue.length) idle(step, { timeout: 300 });
      else this.emit('ready');
    };
    idle(step, { timeout: 300 });
  }

  setProgress(u) {
    this.progress = THREE.MathUtils.clamp(u, 0, 1);
  }

  _updatePalette(u) {
    // La atmósfera evoluciona de forma continua entre habitaciones.
    let i = 0;
    for (let k = 0; k < sectionU.length - 1; k++) {
      if (u >= sectionU[k]) i = k;
    }
    const a = SECTIONS[i].palette;
    const b = SECTIONS[Math.min(i + 1, SECTIONS.length - 1)].palette;
    const span = sectionU[i + 1] !== undefined ? sectionU[i + 1] - sectionU[i] : 1;
    const t = THREE.MathUtils.smoothstep((u - sectionU[i]) / span, 0, 1);

    this.fogColor.set(a.fog).lerp(new THREE.Color(b.fog), t);
    this.scene.fog.color.copy(this.fogColor);
    this.scene.background.copy(this.fogColor);
    this.ambient.color.set(a.ambient).lerp(new THREE.Color(b.ambient), t);
    this.key.color.set(a.key).lerp(new THREE.Color(b.key), t);
    this.key.intensity = THREE.MathUtils.lerp(a.keyI, b.keyI, t);
    this.scene.fog.near = THREE.MathUtils.lerp(a.fogNear ?? 14, b.fogNear ?? 14, t);
    this.scene.fog.far = THREE.MathUtils.lerp(a.fogFar ?? 78, b.fogFar ?? 78, t);
  }

  _raycast(near) {
    if (this.quality.coarse || this.pointer.x < -1.5) {
      if (this.hovered) {
        this.hovered = null;
        this.emit('hover', null);
      }
      return;
    }
    const roots = [];
    near.forEach((r) => r && r.interactiveRoots && roots.push(...r.interactiveRoots));
    if (!roots.length) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(roots, true);
    const hit = hits.find((h) => h.object.userData.interactive);
    const data = hit ? hit.object.userData.interactive : null;
    const id = data ? data.id : null;
    if (id !== this.hovered) {
      this.hovered = id;
      this.current = data;
      this.emit('hover', data);
    }
  }

  click() {
    if (this.current && this.hovered) {
      window.open(this.current.href, '_blank', 'noopener');
      return true;
    }
    return false;
  }

  render() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;
    const u = this.progress;

    // Suavizado del cursor: nada brusco, todo cinematográfico.
    const damp = this.quality.reduced ? 0 : 1;
    this.mouseSmooth.lerp(this.mouse, 0.055 * damp);

    const { pos, target } = sample(u);
    this.camera.position.copy(pos);
    const look = target.clone();
    look.x += this.mouseSmooth.x * 1.5;
    look.y += this.mouseSmooth.y * 0.85;
    this.camera.lookAt(look);

    this._updatePalette(u);

    const { index, focus } = resolveSection(u);
    // Asegura que las salas vecinas existan antes de llegar a ellas.
    this.ensure(index);
    this.ensure(index + 1);
    this.ensure(index - 1);

    const near = [];
    for (let i = index - 1; i <= index + 1; i++) {
      const r = this.rooms[i];
      if (!r) continue;
      near.push(r);
      const localFocus = i === index ? focus : 0.35;
      r.update({
        elapsed,
        dt,
        mouse: this.mouseSmooth,
        focus: this.quality.reduced ? 0 : localFocus,
        progress: u,
        hovered: this.hovered
      });
      r.group.visible = true;
    }
    // Las salas lejanas se apagan: menos trabajo por fotograma y ninguna
    // habitación aparece flotando dentro de un escenario abierto.
    const camZ = this.camera.position.z;
    const openScene = SECTIONS[index].open;
    this.rooms.forEach((r, i) => {
      if (!r) return;
      const neighbour = i >= index - 1 && i <= index + 1;
      // En escenarios abiertos (cielo, océano) una sala vecina sólo aparece
      // cuando ya estamos entrando en ella: nada flota en el horizonte.
      const limit = openScene ? 52 : 120;
      r.group.visible = neighbour && (i === index || Math.abs(r.section.z - camZ) < limit);
    });

    this._raycast(near);

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  start() {
    const loop = () => {
      this.render();
      this._raf = requestAnimationFrame(loop);
    };
    loop();
  }
}

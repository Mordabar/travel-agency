import * as THREE from 'three';
import { softSprite, cloudSprite, skyGradient } from '../core/textures.js';

/**
 * 5. DESTINATION EXPERIENCE
 * El momento emocional del recorrido: la ventana de la cabina se abrió
 * sobre un océano. Agua con oleaje real por shader, bruma atmosférica,
 * islas lejanas y una brisa de partículas. No representa un destino
 * concreto de catálogo: transmite qué significa viajar.
 */
export function build({ quality, section }) {
  const g = new THREE.Group();
  const z0 = section.z;

  /* --- Agua: shader propio de oleaje + reflejo del sol --- */
  const seg = quality.water;
  const waterGeo = new THREE.PlaneGeometry(260, 200, seg, seg);
  const waterMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(0x0c3850) },
      uShallow: { value: new THREE.Color(0x2e93a6) },
      uFoam: { value: new THREE.Color(0xdff6ff) },
      uSun: { value: new THREE.Vector3(-26, 12, z0 - 96) },
      uAmp: { value: quality.tier === 'low' ? 0.22 : 0.42 }
    },
    vertexShader: `
      uniform float uTime; uniform float uAmp;
      varying vec3 vPos; varying float vWave;
      void main() {
        vec3 p = position;
        float w = sin(p.x * 0.13 + uTime * 0.9) * 0.55
                + sin(p.y * 0.19 - uTime * 0.7) * 0.35
                + sin((p.x + p.y) * 0.07 + uTime * 0.45) * 0.6;
        p.z += w * uAmp;
        vWave = w;
        vPos = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFoam; uniform float uTime;
      varying vec3 vPos; varying float vWave;
      void main() {
        // Lejos refleja cielo y luz; cerca, la profundidad del mar.
        float d = clamp((vPos.y + 40.0) / 150.0, 0.0, 1.0);
        vec3 col = mix(uDeep, uShallow, d);
        col = mix(col, vec3(0.72, 0.86, 0.92), pow(d, 3.5) * 0.72);
        float crest = smoothstep(0.9, 1.7, vWave);
        col = mix(col, uFoam, crest * 0.16);
        // Sendero de sol sobre el agua.
        float lane = exp(-pow((vPos.x + 26.0) * 0.045, 2.0));
        float sparkle = sin(vPos.y * 0.55 + uTime * 1.6) * 0.5 + 0.5;
        float near = smoothstep(0.0, 70.0, abs(vPos.y));
        col += vec3(1.0, 0.86, 0.68) * lane * (0.22 + sparkle * 0.26) * (1.0 - near * 0.4);

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -1.6, z0 - 40);
  g.add(water);

  /* --- Cielo: telón en degradado con sol bajo --- */
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(560, 230),
    new THREE.MeshBasicMaterial({ map: skyGradient(), toneMapped: false, depthWrite: false, fog: false })
  );
  sky.position.set(0, 62, z0 - 172);
  g.add(sky);

  const sun = new THREE.Mesh(
    new THREE.PlaneGeometry(110, 110),
    new THREE.MeshBasicMaterial({
      map: softSprite('rgba(255,232,196,1)'), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.75, fog: false
    })
  );
  sun.position.set(-26, 8, z0 - 150);
  g.add(sun);

  /* --- Islas lejanas: siluetas, profundidad atmosférica --- */
  const islandMat = new THREE.MeshBasicMaterial({ color: 0x08202c, transparent: true, opacity: 0.85 });
  [[-48, 0.8, -86, 26, 7], [34, 0.6, -74, 20, 5], [70, 0.5, -98, 30, 9]].forEach(([x, y, dz, w, h]) => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    for (let i = 0; i <= 12; i++) {
      const tX = -w / 2 + (i / 12) * w;
      shape.lineTo(tX, Math.sin((i / 12) * Math.PI) * h * (0.6 + Math.sin(i * 2.1) * 0.35));
    }
    shape.lineTo(w / 2, 0);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), islandMat);
    m.position.set(x, y - 1.6, z0 + dz);
    g.add(m);
  });

  /* --- Vegetación en primer plano: palmas que responden a la brisa --- */
  const palms = [];
  const palmMat = new THREE.MeshBasicMaterial({ color: 0x04141c, side: THREE.DoubleSide });

  // Una fronda es una hoja curva y afilada, no un rectángulo.
  function frondGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(1.1, 0.42, 2.6, 0.16);
    shape.quadraticCurveTo(1.4, -0.02, 0.9, -0.16);
    shape.quadraticCurveTo(0.4, -0.2, 0, 0);
    return new THREE.ShapeGeometry(shape);
  }
  const frondGeo = frondGeometry();

  for (let i = 0; i < (quality.tier === 'low' ? 3 : 6); i++) {
    const palm = new THREE.Group();
    // Tronco ligeramente curvado.
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.18, 1.9, 0),
      new THREE.Vector3(0.12, 3.8, 0),
      new THREE.Vector3(-0.2, 5.5, 0)
    ]);
    const trunk = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 12, 0.13, 7, false), palmMat);
    palm.add(trunk);

    const fronds = new THREE.Group();
    const leaves = 9;
    for (let f = 0; f < leaves; f++) {
      const leaf = new THREE.Mesh(frondGeo, palmMat);
      const holder = new THREE.Group();
      holder.add(leaf);
      holder.rotation.y = (f / leaves) * Math.PI * 2 + Math.random() * 0.2;
      // Las hojas nacen levantadas y caen hacia fuera.
      holder.rotation.z = -0.15 - (f % 3) * 0.28 - Math.random() * 0.2;
      leaf.scale.setScalar(0.9 + Math.random() * 0.45);
      fronds.add(holder);
    }
    fronds.position.set(-0.2, 5.5, 0);
    palm.add(fronds);

    const side = i % 2 === 0 ? -1 : 1;
    palm.position.set(side * (10 + Math.random() * 8), -1.6, z0 + 12 - i * 7);
    palm.scale.setScalar(1.1 + Math.random() * 0.5);
    g.add(palm);
    palms.push({ palm, fronds, phase: Math.random() * 6 });
  }

  /* --- Brisa: partículas ligeras, contenidas --- */
  const N = Math.round(260 * quality.particles);
  const bg = new THREE.BufferGeometry();
  const bp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    bp[i * 3] = (Math.random() - 0.5) * 70;
    bp[i * 3 + 1] = -1 + Math.random() * 16;
    bp[i * 3 + 2] = z0 + 14 - Math.random() * 70;
  }
  bg.setAttribute('position', new THREE.BufferAttribute(bp, 3));
  const breeze = new THREE.Points(bg, new THREE.PointsMaterial({
    size: 0.1, map: softSprite(), color: 0xfff0d8, transparent: true,
    opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  g.add(breeze);

  const mist = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 30),
    new THREE.MeshBasicMaterial({
      map: cloudSprite(), transparent: true, opacity: 0.25,
      depthWrite: false, color: 0xbfe0f0
    })
  );
  mist.position.set(0, 2, z0 - 60);
  g.add(mist);

  return {
    group: g,
    anchor: new THREE.Vector3(0, 1.0, z0 - 10),
    update({ elapsed, mouse, focus }) {
      waterMat.uniforms.uTime.value = elapsed;
      sun.material.opacity = 0.5 + Math.sin(elapsed * 0.6) * 0.07;
      palms.forEach((p, i) => {
        p.fronds.rotation.z = Math.sin(elapsed * 0.7 + p.phase) * 0.07;
        p.palm.rotation.z = Math.sin(elapsed * 0.4 + p.phase) * 0.02 + mouse.x * 0.01 * focus;
      });
      const arr = bg.attributes.position.array;
      for (let i = 0; i < N; i++) {
        arr[i * 3] += 0.03;
        arr[i * 3 + 1] += Math.sin(elapsed + i) * 0.004;
        if (arr[i * 3] > 35) arr[i * 3] = -35;
      }
      bg.attributes.position.needsUpdate = true;
      mist.position.x = Math.sin(elapsed * 0.1) * 8;
    }
  };
}

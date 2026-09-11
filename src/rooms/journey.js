import * as THREE from 'three';
import { cloudSprite, label, softSprite } from '../core/textures.js';
import { doorFrame } from './common.js';

/**
 * 4. THE JOURNEY — transición cinematográfica
 * Aquí el edificio se abre. Un mapa se enciende en la pared, la ruta se
 * dibuja, la cámara atraviesa el mapa y aparece el cielo. Un avión cruza
 * la escena como símbolo del acto de viajar (Travel_Jet no es aerolínea)
 * y la cabina enmarca la ventana por la que se entra al destino.
 */
export function build({ env, quality, section }) {
  const g = new THREE.Group();
  const z0 = section.z;

  /* --- Muro del mapa: la ruta se ilumina y se convierte en camino --- */
  const mapWall = new THREE.Group();
  mapWall.position.set(0, 0, z0 + 22);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x0a1526, roughness: 0.75, metalness: 0.2, envMap: env, side: THREE.DoubleSide
  });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), wallMat);
  wall.position.y = 4.5;
  mapWall.add(wall);

  // Constelación de puntos: un mapa abstracto, sin geografía inventada.
  const dotGeo = new THREE.BufferGeometry();
  const N = Math.round(700 * quality.particles);
  const dp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    dp[i * 3] = (Math.random() - 0.5) * 26;
    dp[i * 3 + 1] = 1 + Math.random() * 6.4;
    dp[i * 3 + 2] = 0.05;
  }
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({
    size: 0.07, map: softSprite(), color: 0x7fd8ff, transparent: true,
    opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  mapWall.add(dots);

  // La ruta trazada.
  const routePts = [
    new THREE.Vector3(-9, 2.4, 0.08), new THREE.Vector3(-4.5, 5.2, 0.08),
    new THREE.Vector3(0.5, 3.4, 0.08), new THREE.Vector3(5.6, 6.1, 0.08),
    new THREE.Vector3(10, 3.2, 0.08)
  ];
  const routeCurve = new THREE.CatmullRomCurve3(routePts);
  const routeGeo = new THREE.BufferGeometry().setFromPoints(routeCurve.getPoints(120));
  const routeMat = new THREE.LineBasicMaterial({
    color: 0xffd9a0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
  });
  const route = new THREE.Line(routeGeo, routeMat);
  routeGeo.setDrawRange(0, 0);
  mapWall.add(route);

  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff0d0 })
  );
  mapWall.add(pin);

  const mapTitle = label('LA RUTA', {
    color: '#cfe8ff', font: '500 46px "Inter", system-ui, sans-serif', letter: 14
  });
  const mt = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6 / (mapTitle.userData?.aspect || 6)),
    new THREE.MeshBasicMaterial({ map: mapTitle, transparent: true, toneMapped: false, depthWrite: false })
  );
  mt.position.set(0, 8.1, 0.1);
  mapWall.add(mt);
  g.add(mapWall);

  /* --- Cielo y nubes: el mapa se ha convertido en vuelo --- */
  const cloudTex = cloudSprite();
  const cloudMat = new THREE.MeshBasicMaterial({
    map: cloudTex, transparent: true, depthWrite: false, opacity: 0.85, color: 0xdce9ff
  });
  const clouds = [];
  const CN = quality.clouds;
  const cloudGeo = new THREE.PlaneGeometry(1, 1);
  const cloudMesh = new THREE.InstancedMesh(cloudGeo, cloudMat, CN);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < CN; i++) {
    const s = 10 + Math.random() * 26;
    clouds.push({
      x: (Math.random() - 0.5) * 90,
      y: -6 + Math.random() * 26,
      z: z0 + 12 - Math.random() * 62,
      s,
      sp: 0.25 + Math.random() * 0.7
    });
  }
  g.add(cloudMesh);

  // Sol bajo que recorta las nubes.
  const sun = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 34),
    new THREE.MeshBasicMaterial({
      map: softSprite('rgba(255,226,180,0.95)'), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55
    })
  );
  sun.position.set(-14, 9, z0 - 46);
  g.add(sun);

  /* --- El avión: narrativo, nunca comercial --- */
  const plane = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0c1420, roughness: 0.4, metalness: 0.9, envMap: env, envMapIntensity: 1.2
  });
  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 3.4, 6, 14), bodyMat);
  fuselage.rotation.z = Math.PI / 2;
  plane.add(fuselage);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.07, 4.6), bodyMat);
  plane.add(wing);
  const tailW = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 1.7), bodyMat);
  tailW.position.x = -1.8;
  plane.add(tailW);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.06), bodyMat);
  fin.position.set(-1.9, 0.5, 0);
  plane.add(fin);
  const trail = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 0.5),
    new THREE.MeshBasicMaterial({
      map: softSprite('rgba(255,255,255,0.5)'), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.35
    })
  );
  trail.position.x = -5.4;
  plane.add(trail);
  plane.position.set(0, 8, z0 - 20);
  plane.scale.setScalar(1.4);
  g.add(plane);

  /* --- Cabina: la ventana se convierte en el próximo escenario --- */
  const cabin = new THREE.Group();
  cabin.position.set(0, 0, z0 - 30);
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x151c28, roughness: 0.88, metalness: 0.12, envMap: env, side: THREE.DoubleSide
  });
  const shape = new THREE.Shape();
  shape.moveTo(-42, -22);
  shape.lineTo(42, -22);
  shape.lineTo(42, 34);
  shape.lineTo(-42, 34);
  shape.closePath();
  const hole = new THREE.Path();
  hole.absellipse(0, 2.4, 2.35, 3.2, 0, Math.PI * 2);
  shape.holes.push(hole);
  const cabinWall = new THREE.Mesh(new THREE.ShapeGeometry(shape), cabinMat);
  cabin.add(cabinWall);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.45, 0.07, 10, 60),
    new THREE.MeshBasicMaterial({ color: 0xbfe4ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending })
  );
  ring.position.set(0, 2.4, 0.03);
  ring.scale.set(1, 1.36, 1);
  cabin.add(ring);
  g.add(cabin);

  const frame = doorFrame(6.4, 5.2, 0xbfe4ff, 0.5);
  frame.position.set(0, -0.2, z0 - 29.6);
  g.add(frame);

  return {
    group: g,
    anchor: new THREE.Vector3(0, 1.1, z0 - 6),
    update({ elapsed, mouse, focus, progress }) {
      // La ruta se dibuja justo antes de atravesar el mapa.
      const draw = THREE.MathUtils.clamp((progress - 0.28) / 0.06, 0, 1);
      routeGeo.setDrawRange(0, Math.floor(draw * 121));
      routeMat.opacity = 0.35 + draw * 0.6;
      const head = routeCurve.getPoint(Math.max(0.001, draw));
      pin.position.copy(head);
      pin.material.opacity = draw;
      pin.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.18);
      dots.material.opacity = 0.22 + draw * 0.3;

      for (let i = 0; i < CN; i++) {
        const c = clouds[i];
        c.x += c.sp * 0.016;
        if (c.x > 52) c.x = -52;
        dummy.position.set(c.x + mouse.x * 0.6 * focus, c.y + Math.sin(elapsed * 0.2 + i) * 0.25, c.z);
        dummy.scale.setScalar(c.s);
        dummy.rotation.z = Math.sin(i) * 0.4;
        dummy.updateMatrix();
        cloudMesh.setMatrixAt(i, dummy.matrix);
      }
      cloudMesh.instanceMatrix.needsUpdate = true;

      const fly = (elapsed * 0.08) % 1;
      plane.position.x = -46 + fly * 92;
      plane.position.y = 8.2 + Math.sin(fly * Math.PI) * 2.2;
      plane.rotation.z = -0.06 + Math.sin(elapsed * 0.5) * 0.03;
      plane.rotation.y = 0.12;
      ring.material.opacity = 0.4 + Math.sin(elapsed * 1.2) * 0.12;
    }
  };
}

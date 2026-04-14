import * as THREE from 'three';

export function initForensicOrb(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Wait for browser to actually lay out the container before measuring
  setTimeout(() => _init(container), 100);
}

function _init(container) {
  // Clear any previous canvas (in case called again after loader)
  container.innerHTML = '';
  let W = container.clientWidth  || 500;
  let H = container.clientHeight || 500;
  if (W < 50) W = 500;
  if (H < 50) H = 500;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 100);
  camera.position.set(0, 0, 2.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ─── IRIS RING SYSTEM ───
  const irisGroup = new THREE.Group();
  scene.add(irisGroup);

  // Concentric rings — iris anatomy
  const rings = [
    { r0: 0.00, r1: 0.09,  op: 0.9,  label: 'pupil-fill' },
    { r0: 0.09, r1: 0.10,  op: 1.0,  label: 'pupil-edge' },
    { r0: 0.13, r1: 0.32,  op: 0.18, label: 'inner-iris'  },
    { r0: 0.32, r1: 0.52,  op: 0.12, label: 'mid-iris'    },
    { r0: 0.52, r1: 0.535, op: 0.8,  label: 'limbus'      },
    { r0: 0.56, r1: 0.565, op: 0.35, label: 'corona-1'    },
    { r0: 0.78, r1: 0.783, op: 0.22, label: 'corona-2'    },
    { r0: 1.05, r1: 1.053, op: 0.14, label: 'corona-3'    },
    { r0: 1.35, r1: 1.352, op: 0.08, label: 'outer'       },
    { r0: 1.70, r1: 1.702, op: 0.05, label: 'far-ring'    },
  ];

  rings.forEach(({ r0, r1, op }) => {
    const geo = new THREE.RingGeometry(r0, r1, 96);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff3232, transparent: true, opacity: op, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    irisGroup.add(new THREE.Mesh(geo, mat));
  });

  // Iris texture — radiating lines
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    const x1 = Math.cos(angle) * 0.13, y1 = Math.sin(angle) * 0.13;
    const x2 = Math.cos(angle) * 0.52, y2 = Math.sin(angle) * 0.52;
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)
    ]);
    const mat = new THREE.LineBasicMaterial({ color: 0xff3232, transparent: true, opacity: 0.06 });
    irisGroup.add(new THREE.Line(geo, mat));
  }

  // Iris texture — dot ring
  for (let i = 0; i < 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    const r = 0.42 + Math.random() * 0.08;
    const geo = new THREE.CircleGeometry(0.006, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff3232, transparent: true, opacity: 0.25 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
    irisGroup.add(mesh);
  }

  // ─── PUPIL (tracks mouse) ───
  const pupilGroup = new THREE.Group();
  pupilGroup.position.z = 0.01;
  irisGroup.add(pupilGroup);

  // Pupil dark fill
  const pdGeo = new THREE.CircleGeometry(0.09, 48);
  const pdMat = new THREE.MeshBasicMaterial({ color: 0x050101, side: THREE.DoubleSide });
  pupilGroup.add(new THREE.Mesh(pdGeo, pdMat));

  // Pupil red glint
  const pgGeo = new THREE.CircleGeometry(0.045, 32);
  const pgMat = new THREE.MeshBasicMaterial({ color: 0xff3232, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
  const pupilGlint = new THREE.Mesh(pgGeo, pgMat);
  pupilGroup.add(pupilGlint);

  // Specular highlight (white dot offset)
  const specGeo = new THREE.CircleGeometry(0.012, 16);
  const specMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
  const spec = new THREE.Mesh(specGeo, specMat);
  spec.position.set(0.02, 0.024, 0.01);
  pupilGroup.add(spec);

  // ─── ROTATING SCAN ARM ───
  const armGroup = new THREE.Group();
  irisGroup.add(armGroup);

  const armGeo = new THREE.PlaneGeometry(1.0, 0.004);
  const armMat = new THREE.MeshBasicMaterial({ color: 0xff3232, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
  const scanArm = new THREE.Mesh(armGeo, armMat);
  scanArm.position.x = 0.5;
  armGroup.add(scanArm);

  // Scan arc trail (gradient-fade fan)
  const arcSegs = 20;
  for (let i = 0; i < arcSegs; i++) {
    const arcLen = Math.PI * 0.35 * (i / arcSegs);
    const arcGeo = new THREE.RingGeometry(0.0, 1.0, 48, 1, 0, arcLen);
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0xff3232, transparent: true, opacity: 0.025 * (1 - i / arcSegs),
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending
    });
    armGroup.add(new THREE.Mesh(arcGeo, arcMat));
  }

  // ─── TILTED ORBITAL RINGS ───
  const orbGroup = new THREE.Group();
  scene.add(orbGroup);
  [
    { rx: Math.PI / 2, ry: 0,           r: 1.7,  op: 0.1  },
    { rx: 1.1,         ry: Math.PI / 4, r: 1.85, op: 0.07 },
    { rx: 0.4,         ry: 1.2,         r: 2.05, op: 0.05 },
  ].forEach(({ rx, ry, r, op }) => {
    const geo = new THREE.RingGeometry(r, r + 0.008, 128);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff3232, transparent: true, opacity: op, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = rx; ring.rotation.y = ry;
    orbGroup.add(ring);
  });

  // Orbiting dot on outer ring
  const odGeo = new THREE.CircleGeometry(0.025, 8);
  const odMat = new THREE.MeshBasicMaterial({ color: 0xff3232, blending: THREE.AdditiveBlending });
  const orbDot = new THREE.Mesh(odGeo, odMat);
  scene.add(orbDot);

  // ─── OUTER PARTICLE FIELD ───
  const pCount = 280;
  const pPos   = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r     = 1.1 + Math.random() * 0.9;
    pPos[i * 3]     = Math.cos(angle) * r;
    pPos[i * 3 + 1] = Math.sin(angle) * r;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xff3232, size: 0.012, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(pGeo, pMat));

  // ─── MOUSE ───
  let mx = 0.5, my = 0.5;
  let targetTiltX = 0, targetTiltY = 0, currentTiltX = 0, currentTiltY = 0;
  let targetPupilX = 0, targetPupilY = 0;
  let curPupilX = 0, curPupilY = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
  });

  // ─── RESIZE ───
  const ro = new ResizeObserver(() => {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);

  // ─── ANIMATE ───
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.012;

    // Iris tilt follows mouse subtly
    targetTiltX = (my - 0.5) * 0.5;
    targetTiltY = (mx - 0.5) * -0.5;
    currentTiltX += (targetTiltX - currentTiltX) * 0.04;
    currentTiltY += (targetTiltY - currentTiltY) * 0.04;
    irisGroup.rotation.x = currentTiltX;
    irisGroup.rotation.y = currentTiltY;
    orbGroup.rotation.x  = currentTiltX * 0.5 + t * 0.015;
    orbGroup.rotation.z  = t * 0.025;

    // Pupil track
    targetPupilX = (mx - 0.5) * 0.09;
    targetPupilY = (my - 0.5) * -0.09;
    curPupilX += (targetPupilX - curPupilX) * 0.06;
    curPupilY += (targetPupilY - curPupilY) * 0.06;
    pupilGroup.position.x = curPupilX;
    pupilGroup.position.y = curPupilY;

    // Pupil glint pulse
    const glintPulse = 0.6 + Math.sin(t * 2) * 0.15;
    pgMat.opacity = glintPulse;

    // Scan arm rotation
    armGroup.rotation.z = t * 1.1;

    // Orbiting dot
    orbDot.position.set(
      Math.cos(t * 0.7) * 1.7,
      Math.sin(t * 0.7) * 0.25,
      Math.sin(t * 0.7) * 1.7
    );

    // Slow breathe
    const bScale = 1 + Math.sin(t * 0.4) * 0.015;
    irisGroup.scale.setScalar(bScale);

    renderer.render(scene, camera);
  }
  animate();
}

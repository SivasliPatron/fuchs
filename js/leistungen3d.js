/* ============================================
   FUCHS MESSEBAU – Leistungen 3D Scene
   Interactive Booth Showcase – Blueprint to Reality
   ============================================ */
(function () {
  'use strict';

  function init() {
    var canvas = document.getElementById('leistungenCanvas');
    if (!canvas || typeof THREE === 'undefined') return;
    var container = canvas.parentElement;

    /* --- Renderer --- */
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();

    /* --- Environment map --- */
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileCubemapShader();
    var envS = new THREE.Scene();
    envS.add(new THREE.HemisphereLight(0xffeedd, 0x223355, 1.0));
    var ep = new THREE.PointLight(0xffffff, 0.6);
    ep.position.set(5, 5, 5);
    envS.add(ep);
    var envRT = pmrem.fromScene(envS, 0.04);
    scene.environment = envRT.texture;
    pmrem.dispose();

    /* --- Camera --- */
    var camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 80);
    camera.position.set(7, 4.5, 8);
    camera.lookAt(0, 1.2, 0);

    /* --- Helper: rounded rect shape --- */
    function rrect(w, h, r) {
      var s = new THREE.Shape();
      var hw = w / 2, hh = h / 2;
      s.moveTo(-hw + r, -hh);
      s.lineTo(hw - r, -hh);
      s.quadraticCurveTo(hw, -hh, hw, -hh + r);
      s.lineTo(hw, hh - r);
      s.quadraticCurveTo(hw, hh, hw - r, hh);
      s.lineTo(-hw + r, hh);
      s.quadraticCurveTo(-hw, hh, -hw, hh - r);
      s.lineTo(-hw, -hh + r);
      s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      return s;
    }

    /* === MATERIALS === */
    var mat = {
      floor: new THREE.MeshStandardMaterial({
        color: 0x0c0c12, roughness: 0.07, metalness: 0.05, envMapIntensity: 0.8
      }),
      platform: new THREE.MeshStandardMaterial({
        color: 0x151518, roughness: 0.1, metalness: 0.08, envMapIntensity: 0.9
      }),
      wallWhite: new THREE.MeshStandardMaterial({
        color: 0xf0ede8, roughness: 0.38, metalness: 0.02,
        side: THREE.DoubleSide, envMapIntensity: 0.3
      }),
      wallDark: new THREE.MeshStandardMaterial({
        color: 0x1a1a1e, roughness: 0.2, metalness: 0.08,
        side: THREE.DoubleSide, envMapIntensity: 0.5
      }),
      wood: new THREE.MeshStandardMaterial({
        color: 0x8b6234, roughness: 0.48, metalness: 0.0, envMapIntensity: 0.2
      }),
      metal: new THREE.MeshStandardMaterial({
        color: 0xe8e8e8, roughness: 0.05, metalness: 0.98, envMapIntensity: 2.2
      }),
      metalBrushed: new THREE.MeshStandardMaterial({
        color: 0xc8c8c8, roughness: 0.16, metalness: 0.95, envMapIntensity: 1.6
      }),
      metalDark: new THREE.MeshStandardMaterial({
        color: 0x2a2a2e, roughness: 0.12, metalness: 0.92, envMapIntensity: 1.2
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff, roughness: 0.0, metalness: 0.0,
        transmission: 0.94, thickness: 0.06, ior: 1.52,
        transparent: true, opacity: 0.18, envMapIntensity: 2.0
      }),
      led: new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffd4a0, emissiveIntensity: 3.2,
        roughness: 0.08, metalness: 0.0
      }),
      ledBlue: new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0x4488ff, emissiveIntensity: 2.0,
        roughness: 0.05, metalness: 0.0
      }),
      ledWhite: new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.8,
        roughness: 0.05, metalness: 0.0
      }),
      screen: new THREE.MeshStandardMaterial({
        color: 0x061224, emissive: 0x2266cc, emissiveIntensity: 0.8,
        roughness: 0.02, metalness: 0.15, envMapIntensity: 0.4
      }),
      copper: new THREE.MeshStandardMaterial({
        color: 0xb87333, roughness: 0.2, metalness: 0.9, envMapIntensity: 2.5
      }),
      sienna: new THREE.MeshStandardMaterial({
        color: 0xa0522d, roughness: 0.28, metalness: 0.1, envMapIntensity: 0.5
      }),
      gridLine: new THREE.MeshStandardMaterial({
        color: 0x2255aa, emissive: 0x1144aa, emissiveIntensity: 0.3,
        roughness: 0.5, transparent: true, opacity: 0.35
      }),
      fabric: new THREE.MeshStandardMaterial({
        color: 0x2a2a2d, roughness: 0.92, metalness: 0.0
      }),
      green: new THREE.MeshStandardMaterial({
        color: 0x1e4d2b, roughness: 0.6, metalness: 0.0
      })
    };

    var root = new THREE.Group();
    scene.add(root);

    /* === GROUND (reflective dark floor with blueprint grid) === */
    var ground = new THREE.Mesh(
      new THREE.CircleGeometry(9, 64),
      mat.floor
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    root.add(ground);

    /* Blueprint grid lines on floor */
    var gridGroup = new THREE.Group();
    for (var gi = -6; gi <= 6; gi++) {
      var hLine = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.002, 0.008),
        mat.gridLine
      );
      hLine.position.set(0, 0.001, gi);
      gridGroup.add(hLine);

      var vLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, 0.002, 12),
        mat.gridLine
      );
      vLine.position.set(gi, 0.001, 0);
      gridGroup.add(vLine);
    }
    root.add(gridGroup);

    /* === MAIN BOOTH (premium exhibition stand) === */
    var booth = new THREE.Group();

    /* --- Platform with rounded edges --- */
    var platShape = rrect(5.2, 4.0, 0.2);
    var platGeo = new THREE.ExtrudeGeometry(platShape, {
      depth: 0.14, bevelEnabled: true,
      bevelSize: 0.035, bevelThickness: 0.025, bevelSegments: 4
    });
    var platform = new THREE.Mesh(platGeo, mat.platform);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = 0;
    platform.receiveShadow = true;
    platform.castShadow = true;
    booth.add(platform);

    /* Platform LED strips (3 sides) */
    var ledF = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.016, 0.01), mat.led);
    ledF.position.set(0, 0.02, 1.95);
    booth.add(ledF);
    var ledL = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.016, 3.8), mat.led);
    ledL.position.set(-2.55, 0.02, 0);
    booth.add(ledL);
    var ledR = ledL.clone();
    ledR.position.x = 2.55;
    booth.add(ledR);

    /* --- Back wall (layered composition) --- */
    var bwMain = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 3.4, 0.1),
      mat.wallWhite
    );
    bwMain.position.set(0, 1.85, -1.9);
    bwMain.castShadow = true;
    bwMain.receiveShadow = true;
    booth.add(bwMain);

    /* Dark accent panel */
    var bwAccent = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 3.2, 0.06),
      mat.wallDark
    );
    bwAccent.position.set(-1.3, 1.75, -1.73);
    booth.add(bwAccent);

    /* Wood warm panel */
    var bwWood = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.2, 0.06),
      mat.wood
    );
    bwWood.position.set(1.6, 1.25, -1.73);
    booth.add(bwWood);

    /* Horizontal metal divider */
    var divider = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.03, 0.1),
      mat.metal
    );
    divider.position.set(0, 2.65, -1.72);
    booth.add(divider);

    /* Header band (brand bar) */
    var headerBand = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.65, 0.13),
      mat.wallDark
    );
    headerBand.position.set(0, 3.12, -1.73);
    booth.add(headerBand);

    /* LED accent under header */
    var headerLED = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.022, 0.025),
      mat.led
    );
    headerLED.position.set(0, 2.78, -1.65);
    booth.add(headerLED);

    /* === LOGO backlit panel === */
    var logoBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.4, 0.03),
      mat.ledWhite
    );
    logoBg.position.set(0, 3.12, -1.64);
    booth.add(logoBg);

    /* Logo "F" block */
    var logoF = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.28, 0.06),
      mat.copper
    );
    logoF.position.set(-0.4, 3.12, -1.62);
    booth.add(logoF);

    /* === LARGE SCREEN === */
    var screenFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 1.05, 0.06),
      mat.metalDark
    );
    screenFrame.position.set(0.15, 1.65, -1.7);
    booth.add(screenFrame);

    var screenDisplay = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, 0.91, 0.02),
      mat.screen
    );
    screenDisplay.position.set(0.15, 1.65, -1.66);
    booth.add(screenDisplay);

    var screenGlow = new THREE.PointLight(0x3366cc, 0.35, 2.5);
    screenGlow.position.set(0.15, 1.65, -1.3);
    booth.add(screenGlow);

    /* === SIDE WALL LEFT === */
    var swLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 3.4, 2.0),
      mat.wallWhite
    );
    swLeft.position.set(-2.38, 1.85, -0.85);
    swLeft.castShadow = true;
    booth.add(swLeft);

    /* Side graphic dark panel */
    var swGraphic = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 2.2, 1.1),
      mat.wallDark
    );
    swGraphic.position.set(-2.31, 1.3, -0.3);
    booth.add(swGraphic);

    /* Side vertical LED */
    var swLED = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 2.6, 0.01),
      mat.led
    );
    swLED.position.set(-2.33, 1.5, 0.15);
    booth.add(swLED);

    /* === GLASS PARTITION RIGHT === */
    var glassPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 2.4, 1.6),
      mat.glass
    );
    glassPanel.position.set(2.2, 1.35, -0.9);
    booth.add(glassPanel);

    /* Glass rails */
    var glRailGeo = new THREE.CylinderGeometry(0.014, 0.014, 1.6, 8);
    var glRailTop = new THREE.Mesh(glRailGeo, mat.metal);
    glRailTop.rotation.x = Math.PI / 2;
    glRailTop.position.set(2.2, 2.55, -0.9);
    booth.add(glRailTop);
    var glRailBot = glRailTop.clone();
    glRailBot.position.y = 0.16;
    booth.add(glRailBot);

    /* === ILLUMINATED COLUMNS === */
    function createColumn(x, z) {
      var cg = new THREE.Group();
      var shell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 3.1, 16),
        mat.metalBrushed
      );
      shell.position.y = 1.7;
      shell.castShadow = true;
      cg.add(shell);
      var strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 2.6, 0.01),
        mat.led
      );
      strip.position.set(0.05, 1.5, 0.05);
      cg.add(strip);
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.013, 8, 24),
        mat.copper
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.15;
      cg.add(ring);
      var cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.06, 0.035, 16),
        mat.copper
      );
      cap.position.y = 3.27;
      cg.add(cap);
      cg.position.set(x, 0, z);
      return cg;
    }
    booth.add(createColumn(-2.0, 0.2));
    booth.add(createColumn(2.0, 0.2));

    /* === OVERHEAD CANOPY FRAME === */
    var beamGeo = new THREE.CylinderGeometry(0.03, 0.03, 4.6, 12);
    var beamF = new THREE.Mesh(beamGeo, mat.metalBrushed);
    beamF.rotation.z = Math.PI / 2;
    beamF.position.set(0, 3.6, 1.1);
    beamF.castShadow = true;
    booth.add(beamF);
    var beamB = beamF.clone();
    beamB.position.z = -1.5;
    booth.add(beamB);
    var sideBeamGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.6, 12);
    var beamSL = new THREE.Mesh(sideBeamGeo, mat.metalBrushed);
    beamSL.rotation.x = Math.PI / 2;
    beamSL.position.set(-2.25, 3.6, -0.2);
    booth.add(beamSL);
    var beamSR = beamSL.clone();
    beamSR.position.x = 2.25;
    booth.add(beamSR);

    /* Canopy cross-braces */
    for (var ci = 0; ci < 3; ci++) {
      var cross = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 2.6, 8),
        mat.metalBrushed
      );
      cross.rotation.x = Math.PI / 2;
      cross.position.set(-1.5 + ci * 1.5, 3.6, -0.2);
      booth.add(cross);
    }

    /* Downlights on canopy */
    for (var di = 0; di < 4; di++) {
      var dLight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 0.05, 12),
        mat.metalDark
      );
      dLight.position.set(-1.5 + di * 1.0, 3.55, 0.3);
      booth.add(dLight);
      var dBulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 8),
        mat.ledWhite
      );
      dBulb.position.set(-1.5 + di * 1.0, 3.52, 0.3);
      booth.add(dBulb);
    }

    /* === RECEPTION COUNTER === */
    var counter = new THREE.Group();
    var cBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.05, 0.5),
      mat.wallDark
    );
    cBody.position.y = 0.525;
    counter.add(cBody);
    var cTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.035, 0.55),
      mat.metal
    );
    cTop.position.y = 1.07;
    counter.add(cTop);
    /* Counter front accent */
    var cAccent = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.6, 0.02),
      mat.sienna
    );
    cAccent.position.set(0, 0.55, 0.26);
    counter.add(cAccent);
    /* LED strip under counter top */
    var cLed = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.01, 0.01),
      mat.led
    );
    cLed.position.set(0, 1.04, 0.26);
    counter.add(cLed);

    counter.position.set(0.8, 0.14, 1.0);
    booth.add(counter);

    /* === PRODUCT PEDESTALS === */
    function createPedestal(x, z, h) {
      var pg = new THREE.Group();
      var base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.22, h, 24),
        mat.wallWhite
      );
      base.position.y = h / 2;
      base.castShadow = true;
      pg.add(base);
      var top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.2, 0.03, 24),
        mat.metal
      );
      top.position.y = h + 0.015;
      pg.add(top);
      var led = new THREE.Mesh(
        new THREE.TorusGeometry(0.21, 0.008, 6, 24),
        mat.led
      );
      led.rotation.x = Math.PI / 2;
      led.position.y = h - 0.02;
      pg.add(led);
      /* Product placeholder (abstract shape) */
      var product = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.12, 1),
        mat.copper
      );
      product.position.y = h + 0.15;
      product.castShadow = true;
      product.userData.isProduct = true;
      pg.add(product);
      pg.position.set(x, 0.14, z);
      return pg;
    }
    booth.add(createPedestal(-1.5, 0.8, 0.9));
    booth.add(createPedestal(-0.8, 1.3, 0.7));

    /* === SEATING AREA === */
    function createChair(x, z, ry) {
      var ch = new THREE.Group();
      var seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.06, 0.4),
        mat.fabric
      );
      seat.position.y = 0.42;
      ch.add(seat);
      /* Legs */
      var legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.42, 8);
      [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].forEach(function (p) {
        var leg = new THREE.Mesh(legGeo, mat.metalDark);
        leg.position.set(p[0], 0.21, p[1]);
        ch.add(leg);
      });
      ch.position.set(x, 0.14, z);
      ch.rotation.y = ry;
      return ch;
    }
    booth.add(createChair(-1.6, -0.6, 0.3));
    booth.add(createChair(-0.9, -0.9, -0.2));

    /* Small table between chairs */
    var sTable = new THREE.Group();
    var stTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.025, 16),
      mat.metal
    );
    stTop.position.y = 0.5;
    sTable.add(stTop);
    var stLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.03, 0.5, 10),
      mat.metalDark
    );
    stLeg.position.y = 0.25;
    sTable.add(stLeg);
    var stBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.015, 16),
      mat.metalDark
    );
    stBase.position.y = 0.008;
    sTable.add(stBase);
    sTable.position.set(-1.25, 0.14, -0.7);
    booth.add(sTable);

    /* === PLANT ACCENTS === */
    function createPlant(x, z, scale) {
      var pg = new THREE.Group();
      var pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.09, 0.22, 12),
        new THREE.MeshStandardMaterial({ color: 0xa09890, roughness: 0.8, metalness: 0.0 })
      );
      pot.position.y = 0.11;
      pg.add(pot);
      for (var fi = 0; fi < 4; fi++) {
        var leaf = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.08 - fi * 0.01, 1),
          mat.green
        );
        leaf.position.set(
          Math.sin(fi * 1.6) * 0.03,
          0.3 + fi * 0.06,
          Math.cos(fi * 2.1) * 0.025
        );
        leaf.rotation.set(fi * 0.3, fi * 0.5, fi * 0.2);
        leaf.castShadow = true;
        pg.add(leaf);
      }
      pg.position.set(x, 0.14, z);
      pg.scale.setScalar(scale);
      return pg;
    }
    booth.add(createPlant(2.0, 0.8, 1.0));
    booth.add(createPlant(-2.1, -1.2, 0.8));

    root.add(booth);

    /* === WIREFRAME OVERLAY (blueprint effect) === */
    var wireGroup = new THREE.Group();
    var wireMat = new THREE.LineBasicMaterial({
      color: 0x4488ff, transparent: true, opacity: 0.12, linewidth: 1
    });

    /* Wireframe of the main booth volumes */
    var wireBoxes = [
      { s: [5.2, 0.14, 4.0], p: [0, 0.07, 0] },
      { s: [4.8, 3.4, 0.1], p: [0, 1.85, -1.9] },
      { s: [0.1, 3.4, 2.0], p: [-2.38, 1.85, -0.85] },
      { s: [4.6, 0.65, 0.13], p: [0, 3.12, -1.73] }
    ];
    wireBoxes.forEach(function (wb) {
      var wGeo = new THREE.BoxGeometry(wb.s[0], wb.s[1], wb.s[2]);
      var edges = new THREE.EdgesGeometry(wGeo);
      var line = new THREE.LineSegments(edges, wireMat);
      line.position.set(wb.p[0], wb.p[1], wb.p[2]);
      wireGroup.add(line);
    });
    root.add(wireGroup);

    /* === FLOATING PARTICLES (ambient dust/energy) === */
    var particleCount = 120;
    var pGeo = new THREE.BufferGeometry();
    var pPos = new Float32Array(particleCount * 3);
    var pVel = new Float32Array(particleCount * 3);
    for (var pi = 0; pi < particleCount; pi++) {
      pPos[pi * 3] = (Math.random() - 0.5) * 10;
      pPos[pi * 3 + 1] = Math.random() * 5;
      pPos[pi * 3 + 2] = (Math.random() - 0.5) * 8;
      pVel[pi * 3] = (Math.random() - 0.5) * 0.003;
      pVel[pi * 3 + 1] = 0.001 + Math.random() * 0.002;
      pVel[pi * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xd4b896, size: 0.02, transparent: true,
      opacity: 0.25, sizeAttenuation: true, depthWrite: false
    }));
    root.add(particles);

    /* Blue accent particles (blueprint feel) */
    var bpCount = 60;
    var bpGeo = new THREE.BufferGeometry();
    var bpPos = new Float32Array(bpCount * 3);
    for (var bi = 0; bi < bpCount; bi++) {
      bpPos[bi * 3] = (Math.random() - 0.5) * 8;
      bpPos[bi * 3 + 1] = Math.random() * 4;
      bpPos[bi * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    bpGeo.setAttribute('position', new THREE.BufferAttribute(bpPos, 3));
    var bpParticles = new THREE.Points(bpGeo, new THREE.PointsMaterial({
      color: 0x4488ff, size: 0.015, transparent: true,
      opacity: 0.2, sizeAttenuation: true, depthWrite: false
    }));
    root.add(bpParticles);

    /* === LIGHTING === */
    scene.add(new THREE.AmbientLight(0xe8ddd0, 0.25));
    scene.add(new THREE.HemisphereLight(0xfff0dd, 0x151520, 0.45));

    var key = new THREE.DirectionalLight(0xfff0dd, 1.15);
    key.position.set(4, 10, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 25;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.0008;
    key.shadow.normalBias = 0.02;
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xa8c0e0, 0.3);
    fill.position.set(-5, 5, -3);
    scene.add(fill);

    var rim = new THREE.DirectionalLight(0xffe8cc, 0.2);
    rim.position.set(-3, 4, -6);
    scene.add(rim);

    /* Warm spot on booth */
    var spot = new THREE.SpotLight(0xffeedd, 0.5, 10, Math.PI / 7, 0.7, 1);
    spot.position.set(1, 5, 3);
    spot.target.position.set(0, 0.5, 0);
    spot.castShadow = true;
    scene.add(spot);
    scene.add(spot.target);

    /* Blue accent spot from behind */
    var blueSpot = new THREE.SpotLight(0x3366ff, 0.25, 12, Math.PI / 6, 0.8, 1);
    blueSpot.position.set(-3, 3, -4);
    blueSpot.target.position.set(0, 1, 0);
    scene.add(blueSpot);
    scene.add(blueSpot.target);

    /* === MOUSE INTERACTION === */
    var mouseX = 0, mouseY = 0;
    var targetRotY = 0, targetRotX = 0;
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    canvas.addEventListener('mouseleave', function () {
      mouseX = 0;
      mouseY = 0;
    });

    /* === RESIZE === */
    function resize() {
      var r = container.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
    }
    resize();
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);
    setTimeout(resize, 500);

    /* === ANIMATE === */
    var clock = new THREE.Clock();
    var products = [];
    booth.traverse(function (child) {
      if (child.userData && child.userData.isProduct) products.push(child);
    });

    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      /* Smooth mouse-follow rotation */
      targetRotY = mouseX * 0.25;
      targetRotX = mouseY * 0.08;
      root.rotation.y += (targetRotY + Math.sin(t * 0.15) * 0.15 - root.rotation.y) * 0.04;

      /* Subtle vertical sway */
      booth.position.y = Math.sin(t * 0.4) * 0.015;

      /* Wireframe pulse */
      var wPulse = 0.06 + Math.sin(t * 1.2) * 0.06;
      wireMat.opacity = wPulse;

      /* Grid pulse */
      mat.gridLine.opacity = 0.2 + Math.sin(t * 0.8) * 0.1;
      mat.gridLine.emissiveIntensity = 0.2 + Math.sin(t * 0.8) * 0.15;

      /* Product rotation */
      products.forEach(function (p, i) {
        p.rotation.y = t * 0.5 + i * Math.PI;
        p.rotation.x = Math.sin(t * 0.7 + i) * 0.15;
        p.position.y = p.parent.children[0].geometry.parameters.height + 0.15 + Math.sin(t * 0.8 + i * 2) * 0.03;
      });

      /* Particle animation */
      var pa = pGeo.attributes.position.array;
      for (var i = 0; i < particleCount; i++) {
        pa[i * 3] += pVel[i * 3] + Math.sin(t * 0.3 + i * 0.5) * 0.0002;
        pa[i * 3 + 1] += pVel[i * 3 + 1];
        pa[i * 3 + 2] += pVel[i * 3 + 2];
        if (pa[i * 3 + 1] > 5) {
          pa[i * 3 + 1] = 0;
          pa[i * 3] = (Math.random() - 0.5) * 10;
          pa[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      /* Blue particles drift */
      var ba = bpGeo.attributes.position.array;
      for (var j = 0; j < bpCount; j++) {
        ba[j * 3] += Math.sin(t * 0.2 + j * 0.7) * 0.001;
        ba[j * 3 + 1] += 0.0008 + Math.sin(t * 0.5 + j) * 0.0004;
        if (ba[j * 3 + 1] > 4) {
          ba[j * 3 + 1] = 0;
          ba[j * 3] = (Math.random() - 0.5) * 8;
        }
      }
      bpGeo.attributes.position.needsUpdate = true;

      /* Screen glow pulse */
      screenGlow.intensity = 0.3 + Math.sin(t * 1.8) * 0.1;

      renderer.render(scene, camera);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

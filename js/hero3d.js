/* ============================================
   FUCHS MESSEBAU – 3D Messestand Hero Scene
   Premium Exhibition Booth v3
   ============================================ */

(function () {
  'use strict';

  function init() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

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
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    /* --- Scene --- */
    var scene = new THREE.Scene();

    /* --- Environment map for realistic reflections --- */
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileCubemapShader();
    var envScene = new THREE.Scene();
    envScene.add(new THREE.HemisphereLight(0xffeedd, 0x223355, 1.2));
    var envPt = new THREE.PointLight(0xffffff, 0.8);
    envPt.position.set(5, 5, 5);
    envScene.add(envPt);
    var envRT = pmrem.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;
    pmrem.dispose();

    /* --- Camera --- */
    var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(8, 3.8, 9);
    camera.lookAt(0, 1.4, 0);

    /* --- Helper: rounded rectangle shape --- */
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
        color: 0x0e0e14, roughness: 0.08, metalness: 0.05, envMapIntensity: 0.6
      }),
      platform: new THREE.MeshStandardMaterial({
        color: 0x181820, roughness: 0.12, metalness: 0.08, envMapIntensity: 0.8
      }),
      wallWhite: new THREE.MeshStandardMaterial({
        color: 0xf0ede8, roughness: 0.4, metalness: 0.02,
        side: THREE.DoubleSide, envMapIntensity: 0.3
      }),
      wallDark: new THREE.MeshStandardMaterial({
        color: 0x1a1a1e, roughness: 0.22, metalness: 0.08,
        side: THREE.DoubleSide, envMapIntensity: 0.5
      }),
      wood: new THREE.MeshStandardMaterial({
        color: 0x8b6234, roughness: 0.5, metalness: 0.0, envMapIntensity: 0.2
      }),
      metal: new THREE.MeshStandardMaterial({
        color: 0xe8e8e8, roughness: 0.06, metalness: 0.98, envMapIntensity: 2.0
      }),
      metalBrushed: new THREE.MeshStandardMaterial({
        color: 0xc8c8c8, roughness: 0.18, metalness: 0.95, envMapIntensity: 1.5
      }),
      metalDark: new THREE.MeshStandardMaterial({
        color: 0x2a2a2e, roughness: 0.12, metalness: 0.92, envMapIntensity: 1.2
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff, roughness: 0.0, metalness: 0.0,
        transmission: 0.95, thickness: 0.06, ior: 1.52,
        transparent: true, opacity: 0.2, envMapIntensity: 2.0
      }),
      led: new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffd4a0, emissiveIntensity: 3.0,
        roughness: 0.1, metalness: 0.0
      }),
      ledWhite: new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.5,
        roughness: 0.05, metalness: 0.0
      }),
      screen: new THREE.MeshStandardMaterial({
        color: 0x061224, emissive: 0x2266cc, emissiveIntensity: 0.7,
        roughness: 0.03, metalness: 0.15, envMapIntensity: 0.4
      }),
      copper: new THREE.MeshStandardMaterial({
        color: 0xb87333, roughness: 0.22, metalness: 0.88, envMapIntensity: 2.2
      }),
      sienna: new THREE.MeshStandardMaterial({
        color: 0xa0522d, roughness: 0.3, metalness: 0.12, envMapIntensity: 0.5
      }),
      fabric: new THREE.MeshStandardMaterial({
        color: 0x2a2a2d, roughness: 0.92, metalness: 0.0
      }),
      green: new THREE.MeshStandardMaterial({
        color: 0x1e4d2b, roughness: 0.65, metalness: 0.0
      }),
      greenLight: new THREE.MeshStandardMaterial({
        color: 0x2d6b3a, roughness: 0.6, metalness: 0.0
      })
    };

    var booth = new THREE.Group();

    /* === GROUND === */
    var ground = new THREE.Mesh(
      new THREE.CircleGeometry(8, 64),
      mat.floor
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    booth.add(ground);

    /* === PLATFORM with rounded edges === */
    var platShape = rrect(5.6, 4.4, 0.25);
    var platGeo = new THREE.ExtrudeGeometry(platShape, {
      depth: 0.16, bevelEnabled: true,
      bevelSize: 0.04, bevelThickness: 0.03, bevelSegments: 4
    });
    var platform = new THREE.Mesh(platGeo, mat.platform);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = 0;
    platform.receiveShadow = true;
    platform.castShadow = true;
    booth.add(platform);

    /* Platform LED strips (3 sides) */
    var ledF = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.018, 0.012), mat.led);
    ledF.position.set(0, 0.02, 2.15);
    booth.add(ledF);
    var ledL = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 4.2), mat.led);
    ledL.position.set(-2.75, 0.02, 0);
    booth.add(ledL);
    var ledR = ledL.clone();
    ledR.position.x = 2.75;
    booth.add(ledR);

    /* === BACK WALL === */
    var bwMain = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 3.5, 0.1),
      mat.wallWhite
    );
    bwMain.position.set(0, 1.9, -2.1);
    bwMain.castShadow = true;
    bwMain.receiveShadow = true;
    booth.add(bwMain);

    /* Dark accent panel left */
    var bwAccent = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 3.3, 0.06),
      mat.wallDark
    );
    bwAccent.position.set(-1.55, 1.8, -1.93);
    booth.add(bwAccent);

    /* Wood panel right */
    var bwWood = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 2.4, 0.06),
      mat.wood
    );
    bwWood.position.set(1.8, 1.35, -1.93);
    booth.add(bwWood);

    /* Horizontal metal divider */
    var divider = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.035, 0.1),
      mat.metal
    );
    divider.position.set(0, 2.75, -1.92);
    booth.add(divider);

    /* Header band */
    var headerBand = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 0.7, 0.14),
      mat.wallDark
    );
    headerBand.position.set(0, 3.22, -1.93);
    booth.add(headerBand);

    /* LED accent line under header */
    var headerLED = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 0.025, 0.03),
      mat.led
    );
    headerLED.position.set(0, 2.86, -1.85);
    booth.add(headerLED);

    /* === LOGO === */
    /* Backlit panel */
    var logoBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.45, 0.03),
      mat.ledWhite
    );
    logoBg.position.set(0.1, 3.22, -1.84);
    booth.add(logoBg);

    /* Logo "F" block */
    var logoF = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.32, 0.06),
      mat.copper
    );
    logoF.position.set(-0.45, 3.22, -1.82);
    booth.add(logoF);

    /* === LARGE SCREEN === */
    var screenFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.1, 0.06),
      mat.metalDark
    );
    screenFrame.position.set(0.1, 1.7, -1.90);
    booth.add(screenFrame);

    var screenDisplay = new THREE.Mesh(
      new THREE.BoxGeometry(1.66, 0.96, 0.02),
      mat.screen
    );
    screenDisplay.position.set(0.1, 1.7, -1.86);
    booth.add(screenDisplay);

    /* Screen ambient glow light */
    var screenGlow = new THREE.PointLight(0x3366cc, 0.3, 2.5);
    screenGlow.position.set(0.1, 1.7, -1.5);
    booth.add(screenGlow);

    /* === SIDE WALL LEFT === */
    var swLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 3.5, 2.2),
      mat.wallWhite
    );
    swLeft.position.set(-2.58, 1.9, -0.95);
    swLeft.castShadow = true;
    booth.add(swLeft);

    /* Side wall graphic panel */
    var swGraphic = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 2.4, 1.2),
      mat.wallDark
    );
    swGraphic.position.set(-2.51, 1.35, -0.35);
    booth.add(swGraphic);

    /* Side wall vertical LED */
    var swLED = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 2.8, 0.012),
      mat.led
    );
    swLED.position.set(-2.53, 1.55, 0.16);
    booth.add(swLED);

    /* === GLASS PARTITION RIGHT === */
    var glassPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 2.5, 1.8),
      mat.glass
    );
    glassPanel.position.set(2.4, 1.4, -1.0);
    booth.add(glassPanel);

    /* Glass rails */
    var glRailGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.8, 8);
    var glRailTop = new THREE.Mesh(glRailGeo, mat.metal);
    glRailTop.rotation.x = Math.PI / 2;
    glRailTop.position.set(2.4, 2.65, -1.0);
    booth.add(glRailTop);
    var glRailBot = glRailTop.clone();
    glRailBot.position.y = 0.17;
    booth.add(glRailBot);

    /* === TALL ILLUMINATED COLUMNS (modern feature) === */
    function createColumn(x, z) {
      var colGroup = new THREE.Group();
      /* Metal shell */
      var shell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 3.2, 16),
        mat.metalBrushed
      );
      shell.position.y = 1.75;
      shell.castShadow = true;
      colGroup.add(shell);
      /* LED strip along column */
      var strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 2.8, 0.012),
        mat.led
      );
      strip.position.set(0.06, 1.55, 0.06);
      colGroup.add(strip);
      /* Base ring */
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.1, 0.015, 8, 24),
        mat.copper
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.16;
      colGroup.add(ring);
      /* Top cap */
      var cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.07, 0.04, 16),
        mat.copper
      );
      cap.position.y = 3.37;
      colGroup.add(cap);
      colGroup.position.set(x, 0, z);
      return colGroup;
    }
    booth.add(createColumn(-2.2, 0.2));
    booth.add(createColumn(2.2, 0.2));

    /* === OVERHEAD CANOPY (floating frame) === */
    var canopyMat = mat.metalBrushed;
    /* Outer frame - rounded tube profile */
    var canopyShape = new THREE.Shape();
    canopyShape.moveTo(-2.5, -1.5);
    canopyShape.lineTo(2.5, -1.5);
    canopyShape.lineTo(2.5, 1.2);
    canopyShape.lineTo(-2.5, 1.2);
    canopyShape.lineTo(-2.5, -1.5);

    /* Front beam */
    var beamF = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 5.0, 12),
      canopyMat
    );
    beamF.rotation.z = Math.PI / 2;
    beamF.position.set(0, 3.7, 1.2);
    beamF.castShadow = true;
    booth.add(beamF);
    /* Back beam */
    var beamB = beamF.clone();
    beamB.position.z = -2.0;
    booth.add(beamB);
    /* Side beams */
    var beamSR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 3.2, 12),
      canopyMat
    );
    beamSR.rotation.x = Math.PI / 2;
    beamSR.position.set(2.5, 3.7, -0.4);
    booth.add(beamSR);
    var beamSL = beamSR.clone();
    beamSL.position.x = -2.5;
    booth.add(beamSL);
    /* Cross members */
    var crossM = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 3.2, 8),
      canopyMat
    );
    crossM.rotation.x = Math.PI / 2;
    crossM.position.set(0, 3.7, -0.4);
    booth.add(crossM);

    /* Canopy vertical supports (thin cables/rods to back wall) */
    var cableGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6);
    [[-2.5, -2.0], [2.5, -2.0], [-2.5, 1.2], [2.5, 1.2]].forEach(function(p) {
      var cable = new THREE.Mesh(cableGeo, mat.metal);
      cable.position.set(p[0], 3.58, p[1]);
      booth.add(cable);
    });

    /* === TRACK SPOTLIGHTS === */
    function createSpot(x, z, rotZ) {
      var g = new THREE.Group();
      var arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6),
        mat.metalDark
      );
      arm.position.y = -0.09;
      g.add(arm);
      var head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.035, 0.12, 10),
        mat.metalDark
      );
      head.position.y = -0.24;
      head.rotation.z = rotZ || 0;
      g.add(head);
      var lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.03, 10),
        mat.ledWhite
      );
      lens.position.set(0, -0.31, 0.015);
      g.add(lens);
      g.position.set(x, 3.7, z);
      return g;
    }
    booth.add(createSpot(-1.6, -0.4, 0.1));
    booth.add(createSpot(0, -0.4, -0.05));
    booth.add(createSpot(1.6, -0.4, -0.1));
    booth.add(createSpot(-0.8, 0.8, 0.05));
    booth.add(createSpot(0.8, 0.8, -0.05));

    /* === RECEPTION COUNTER (clean L-shape) === */
    var ctrMain = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.05, 0.55),
      mat.wallDark
    );
    ctrMain.position.set(0.5, 0.645, 1.25);
    ctrMain.castShadow = true;
    booth.add(ctrMain);

    var ctrReturn = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 1.05, 0.8),
      mat.wallDark
    );
    ctrReturn.position.set(-0.3, 0.645, 0.9);
    ctrReturn.castShadow = true;
    booth.add(ctrReturn);

    /* Counter top */
    var ctrTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.035, 0.65),
      mat.metal
    );
    ctrTop.position.set(0.5, 1.19, 1.25);
    booth.add(ctrTop);

    var ctrTopReturn = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.035, 0.9),
      mat.metal
    );
    ctrTopReturn.position.set(-0.3, 1.19, 0.9);
    booth.add(ctrTopReturn);

    /* Counter front wood accent */
    var ctrWood = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.45, 0.02),
      mat.wood
    );
    ctrWood.position.set(0.5, 0.65, 1.53);
    booth.add(ctrWood);

    /* Counter base LED glow */
    var ctrLed = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.018, 0.012),
      mat.led
    );
    ctrLed.position.set(0.5, 0.14, 1.53);
    booth.add(ctrLed);

    /* === MEETING TABLE === */
    var tabletop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.03, 32),
      mat.metal
    );
    tabletop.position.set(-1.3, 0.78, 0.85);
    tabletop.castShadow = true;
    booth.add(tabletop);

    /* Table pillar */
    var pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.05, 0.62, 12),
      mat.metalBrushed
    );
    pillar.position.set(-1.3, 0.45, 0.85);
    booth.add(pillar);

    /* Table base */
    var tBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.02, 20),
      mat.metalDark
    );
    tBase.position.set(-1.3, 0.16, 0.85);
    booth.add(tBase);

    /* === BAR STOOLS === */
    function createStool(x, z) {
      var g = new THREE.Group();
      /* Seat */
      var seat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.15, 0.045, 16),
        mat.fabric
      );
      seat.position.y = 0.74;
      seat.castShadow = true;
      g.add(seat);
      /* Stem */
      var stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.022, 0.56, 10),
        mat.metalBrushed
      );
      stem.position.y = 0.44;
      g.add(stem);
      /* Foot ring */
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.008, 6, 20),
        mat.metal
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.33;
      g.add(ring);
      /* Base */
      var base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.015, 16),
        mat.metalDark
      );
      base.position.y = 0.16;
      g.add(base);
      g.position.set(x, 0, z);
      return g;
    }
    booth.add(createStool(-1.3, 0.25));
    booth.add(createStool(-0.78, 0.65));

    /* === PLANTS === */
    function createPlant(x, z, s) {
      var g = new THREE.Group();
      /* Pot (concrete look) */
      var potMat = new THREE.MeshStandardMaterial({
        color: 0x555555, roughness: 0.85, metalness: 0.02
      });
      var pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12 * s, 0.09 * s, 0.28 * s, 12),
        potMat
      );
      pot.position.y = 0.14 * s + 0.15;
      pot.castShadow = true;
      g.add(pot);
      /* Soil */
      var soil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11 * s, 0.11 * s, 0.02, 12),
        new THREE.MeshStandardMaterial({ color: 0x2a1f12, roughness: 0.95 })
      );
      soil.position.y = 0.28 * s + 0.15;
      g.add(soil);
      /* Trunk */
      var trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012 * s, 0.018 * s, 0.4 * s, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.7 })
      );
      trunk.position.y = 0.48 * s + 0.15;
      g.add(trunk);
      /* Foliage spheres */
      for (var i = 0; i < 4; i++) {
        var rad = (0.16 - i * 0.025) * s;
        var fol = new THREE.Mesh(
          new THREE.SphereGeometry(rad, 12, 8),
          i % 2 === 0 ? mat.green : mat.greenLight
        );
        fol.position.set(
          (Math.sin(i * 1.8)) * 0.06 * s,
          (0.65 + i * 0.09) * s + 0.15,
          (Math.cos(i * 2.1)) * 0.05 * s
        );
        fol.castShadow = true;
        g.add(fol);
      }
      g.position.set(x, 0, z);
      return g;
    }
    booth.add(createPlant(2.15, 0.8, 1.3));
    booth.add(createPlant(-2.2, 1.3, 1.0));
    booth.add(createPlant(1.85, -1.4, 0.75));

    /* === PRODUCT PEDESTALS (3 clean podiums) === */
    function createPedestal(x, z, h, topMat) {
      var g = new THREE.Group();
      var pedGeo = new THREE.CylinderGeometry(0.14, 0.16, h, 20);
      var ped = new THREE.Mesh(pedGeo, mat.wallWhite);
      ped.position.y = h / 2 + 0.15;
      ped.castShadow = true;
      ped.receiveShadow = true;
      g.add(ped);
      /* Object on top */
      var obj = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.12),
        topMat
      );
      obj.position.y = h + 0.21 + 0.06;
      obj.rotation.y = 0.4;
      obj.castShadow = true;
      g.add(obj);
      /* Accent ring at top */
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.008, 6, 24),
        mat.copper
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = h + 0.16;
      g.add(ring);
      g.position.set(x, 0, z);
      return g;
    }
    booth.add(createPedestal(-2.2, -0.8, 0.9, mat.copper));
    booth.add(createPedestal(-2.2, -1.4, 0.7, mat.sienna));

    /* === BROCHURE DISPLAY (wall-mounted, minimal) === */
    for (var bi = 0; bi < 3; bi++) {
      var shelf = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.012, 0.14),
        mat.metal
      );
      shelf.position.set(1.8, 0.5 + bi * 0.45, -1.82);
      shelf.castShadow = true;
      booth.add(shelf);
      /* Bracket */
      var bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.12, 0.01),
        mat.metalBrushed
      );
      bracket.position.set(1.8, 0.44 + bi * 0.45, -1.88);
      booth.add(bracket);
    }

    /* === POSITION AND ADD === */
    booth.position.y = -0.15;
    scene.add(booth);

    /* === GRID === */
    var grid = new THREE.GridHelper(16, 50, 0x1a1a2e, 0x121218);
    grid.position.y = -0.15;
    grid.material.transparent = true;
    grid.material.opacity = 0.1;
    scene.add(grid);

    /* === LIGHTING === */
    scene.add(new THREE.AmbientLight(0xd0d5e4, 0.3));
    scene.add(new THREE.HemisphereLight(0xf5ede4, 0x080814, 0.45));

    /* Key light */
    var keyLight = new THREE.DirectionalLight(0xfff0dd, 0.9);
    keyLight.position.set(5, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0008;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    /* Cool fill */
    var fillLight = new THREE.DirectionalLight(0xb0c4e8, 0.35);
    fillLight.position.set(-5, 7, -3);
    scene.add(fillLight);

    /* Rim light */
    var rimLight = new THREE.DirectionalLight(0xffeedd, 0.3);
    rimLight.position.set(-3, 5, -7);
    scene.add(rimLight);

    /* Booth accent lights */
    var warmPt1 = new THREE.PointLight(0xffaa55, 0.5, 6);
    warmPt1.position.set(0, 3.5, -1.0);
    scene.add(warmPt1);

    var warmPt2 = new THREE.PointLight(0xffcc88, 0.25, 4);
    warmPt2.position.set(0.5, 0.3, 2.0);
    scene.add(warmPt2);

    /* Column lights */
    var colLight1 = new THREE.PointLight(0xffd4a0, 0.3, 3);
    colLight1.position.set(-2.2, 2.5, 0.2);
    scene.add(colLight1);
    var colLight2 = new THREE.PointLight(0xffd4a0, 0.3, 3);
    colLight2.position.set(2.2, 2.5, 0.2);
    scene.add(colLight2);

    /* === PARTICLES === */
    var pCount = 80;
    var pGeo = new THREE.BufferGeometry();
    var pPos = new Float32Array(pCount * 3);
    for (var pi = 0; pi < pCount; pi++) {
      pPos[pi * 3] = (Math.random() - 0.5) * 12;
      pPos[pi * 3 + 1] = Math.random() * 5.5;
      pPos[pi * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xeeddcc,
      size: 0.018,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
      depthWrite: false
    }));
    scene.add(particles);

    /* === RESIZE === */
    function resize() {
      var wrapper = canvas.parentElement;
      if (!wrapper) return;
      var w = wrapper.offsetWidth;
      var h = wrapper.offsetHeight;
      if (w === 0) w = 500;
      if (h === 0) h = Math.round(w * 0.75);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);
    setTimeout(resize, 500);

    /* === ANIMATION === */
    var clock = new THREE.Clock();
    var baseAngle = 0.35;

    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      /* Gentle oscillating rotation — stays mostly front-facing */
      booth.rotation.y = baseAngle + Math.sin(t * 0.25) * 0.35;

      /* Subtle float */
      booth.position.y = -0.15 + Math.sin(t * 0.5) * 0.018;

      /* Particles drift */
      var pa = pGeo.attributes.position.array;
      for (var i = 0; i < pCount; i++) {
        pa[i * 3 + 1] += 0.0015;
        if (pa[i * 3 + 1] > 5.5) pa[i * 3 + 1] = 0;
        pa[i * 3] += Math.sin(t * 0.5 + i) * 0.0002;
      }
      pGeo.attributes.position.needsUpdate = true;

      /* Screen glow pulse */
      mat.screen.emissiveIntensity = 0.6 + Math.sin(t * 1.5) * 0.15;
      screenGlow.intensity = 0.25 + Math.sin(t * 1.5) * 0.1;

      /* Warm light subtle pulse */
      warmPt1.intensity = 0.5 + Math.sin(t * 0.7) * 0.08;

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

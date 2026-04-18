/* ============================================
   FUCHS MESSEBAU – About Section 3D Scene
   Workshop / Craftsmanship v3 – Premium
   ============================================ */
(function () {
  'use strict';

  function init() {
    var container = document.querySelector('.content-image');
    var canvas = document.getElementById('aboutCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

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
    renderer.toneMappingExposure = 0.95;
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();

    /* --- Environment map --- */
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileCubemapShader();
    var envS = new THREE.Scene();
    envS.add(new THREE.HemisphereLight(0xffeedd, 0x223344, 0.9));
    var ep1 = new THREE.PointLight(0xffffff, 0.5);
    ep1.position.set(4, 5, 3);
    envS.add(ep1);
    var ep2 = new THREE.PointLight(0xaaccff, 0.3);
    ep2.position.set(-3, 3, -2);
    envS.add(ep2);
    var envRT = pmrem.fromScene(envS, 0.04);
    scene.environment = envRT.texture;
    pmrem.dispose();

    /* --- Camera (tighter, more cinematic) --- */
    var camera = new THREE.PerspectiveCamera(28, 4 / 3, 0.1, 50);
    camera.position.set(2.8, 2.2, 3.5);
    camera.lookAt(0, 0.75, -0.2);

    /* --- Lathe helper --- */
    function lathe(points, seg) {
      return new THREE.LatheGeometry(
        points.map(function (p) { return new THREE.Vector2(p[0], p[1]); }),
        seg || 24
      );
    }

    /* === MATERIALS === */
    var m = {
      woodOak: new THREE.MeshStandardMaterial({
        color: 0x9e7c52, roughness: 0.45, metalness: 0.0, envMapIntensity: 0.25
      }),
      woodWalnut: new THREE.MeshStandardMaterial({
        color: 0x5a3a22, roughness: 0.4, metalness: 0.0, envMapIntensity: 0.2
      }),
      woodMaple: new THREE.MeshStandardMaterial({
        color: 0xd4a76a, roughness: 0.42, metalness: 0.0, envMapIntensity: 0.3
      }),
      steel: new THREE.MeshStandardMaterial({
        color: 0xe0e0e0, roughness: 0.06, metalness: 0.97, envMapIntensity: 2.5
      }),
      steelBrushed: new THREE.MeshStandardMaterial({
        color: 0xc0c0c0, roughness: 0.18, metalness: 0.94, envMapIntensity: 1.8
      }),
      steelDark: new THREE.MeshStandardMaterial({
        color: 0x282830, roughness: 0.12, metalness: 0.92, envMapIntensity: 1.4
      }),
      copper: new THREE.MeshStandardMaterial({
        color: 0xb87333, roughness: 0.18, metalness: 0.92, envMapIntensity: 2.8
      }),
      sienna: new THREE.MeshStandardMaterial({
        color: 0x1e3a5f, roughness: 0.28, metalness: 0.08, envMapIntensity: 0.5
      }),
      white: new THREE.MeshStandardMaterial({
        color: 0xf5f0ea, roughness: 0.35, metalness: 0.02, envMapIntensity: 0.4
      }),
      blueprint: new THREE.MeshStandardMaterial({
        color: 0x0d2240, roughness: 0.3, metalness: 0.0
      }),
      bpLine: new THREE.MeshStandardMaterial({
        color: 0x4a88c8, roughness: 0.35
      }),
      led: new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffd090, emissiveIntensity: 3.5,
        roughness: 0.05, metalness: 0.0
      }),
      concrete: new THREE.MeshStandardMaterial({
        color: 0xa09890, roughness: 0.85, metalness: 0.0, envMapIntensity: 0.1
      }),
      ceramic: new THREE.MeshStandardMaterial({
        color: 0xf2ebe0, roughness: 0.35, metalness: 0.03, envMapIntensity: 0.6
      }),
      ceramicDark: new THREE.MeshStandardMaterial({
        color: 0x3a3530, roughness: 0.4, metalness: 0.03, envMapIntensity: 0.5
      }),
      leather: new THREE.MeshStandardMaterial({
        color: 0x5c3d2e, roughness: 0.55, metalness: 0.0, envMapIntensity: 0.2
      }),
      green: new THREE.MeshStandardMaterial({ color: 0x1a4425, roughness: 0.55 }),
      greenL: new THREE.MeshStandardMaterial({ color: 0x2a5e35, roughness: 0.5 }),
      floor: new THREE.MeshStandardMaterial({
        color: 0xc8c0b5, roughness: 0.6, metalness: 0.0, envMapIntensity: 0.25
      })
    };

    var root = new THREE.Group();
    scene.add(root);

    /* === FLOOR (concrete with subtle reflections) === */
    var floor = new THREE.Mesh(new THREE.CircleGeometry(6, 64), m.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.005;
    floor.receiveShadow = true;
    root.add(floor);

    /* === WORKBENCH === */
    var bench = new THREE.Group();

    /* Tabletop – thick solid wood with rounded edge via ExtrudeGeometry */
    var ttShape = new THREE.Shape();
    var ttW = 1.25, ttD = 0.55, ttR = 0.06;
    ttShape.moveTo(-ttW + ttR, -ttD);
    ttShape.lineTo(ttW - ttR, -ttD);
    ttShape.quadraticCurveTo(ttW, -ttD, ttW, -ttD + ttR);
    ttShape.lineTo(ttW, ttD - ttR);
    ttShape.quadraticCurveTo(ttW, ttD, ttW - ttR, ttD);
    ttShape.lineTo(-ttW + ttR, ttD);
    ttShape.quadraticCurveTo(-ttW, ttD, -ttW, ttD - ttR);
    ttShape.lineTo(-ttW, -ttD + ttR);
    ttShape.quadraticCurveTo(-ttW, -ttD, -ttW + ttR, -ttD);
    var ttGeo = new THREE.ExtrudeGeometry(ttShape, {
      depth: 0.1, bevelEnabled: true,
      bevelSize: 0.025, bevelThickness: 0.02, bevelSegments: 4
    });
    var tabletop = new THREE.Mesh(ttGeo, m.woodWalnut);
    tabletop.rotation.x = -Math.PI / 2;
    tabletop.position.y = 0.88;
    tabletop.castShadow = true;
    tabletop.receiveShadow = true;
    bench.add(tabletop);

    /* Steel trestle legs (A-frame style) */
    function trestleLeg(xOff) {
      var g = new THREE.Group();
      /* Main angled legs */
      var legGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.88, 10);
      var l1 = new THREE.Mesh(legGeo, m.steelDark);
      l1.position.set(0.12, 0.44, 0);
      l1.rotation.z = 0.12;
      l1.castShadow = true;
      g.add(l1);
      var l2 = new THREE.Mesh(legGeo, m.steelDark);
      l2.position.set(-0.12, 0.44, 0);
      l2.rotation.z = -0.12;
      l2.castShadow = true;
      g.add(l2);
      /* Horizontal brace */
      var brace = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.32, 8),
        m.steelDark
      );
      brace.rotation.z = Math.PI / 2;
      brace.position.y = 0.28;
      g.add(brace);
      /* Foot plates */
      var footGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.008, 10);
      var f1 = new THREE.Mesh(footGeo, m.steelDark);
      f1.position.set(0.22, 0.004, 0);
      g.add(f1);
      var f2 = f1.clone();
      f2.position.x = -0.22;
      g.add(f2);
      g.position.x = xOff;
      return g;
    }
    bench.add(trestleLeg(-0.95));
    bench.add(trestleLeg(0.95));

    /* Steel stretcher bar between trestles */
    var stretcher = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 1.7, 8),
      m.steelDark
    );
    stretcher.rotation.z = Math.PI / 2;
    stretcher.position.set(0, 0.28, 0);
    bench.add(stretcher);

    root.add(bench);

    /* === ITEMS ON WORKBENCH === */

    /* --- Blueprint (rolled corners) --- */
    var bpGeo = new THREE.BoxGeometry(0.68, 0.003, 0.48);
    var bp = new THREE.Mesh(bpGeo, m.blueprint);
    bp.position.set(0.35, 0.99, -0.08);
    bp.rotation.y = 0.08;
    bp.receiveShadow = true;
    bench.add(bp);
    /* Grid lines */
    for (var gi = 0; gi < 6; gi++) {
      var gl = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.004, 0.003),
        m.bpLine
      );
      gl.position.set(0.35, 0.993, -0.28 + gi * 0.08);
      gl.rotation.y = 0.08;
      bench.add(gl);
    }
    for (var gv = 0; gv < 4; gv++) {
      var gvl = new THREE.Mesh(
        new THREE.BoxGeometry(0.003, 0.004, 0.36),
        m.bpLine
      );
      gvl.position.set(0.12 + gv * 0.15, 0.993, -0.08);
      gvl.rotation.y = 0.08;
      bench.add(gvl);
    }
    /* Booth outline on blueprint */
    var boothOutline = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.004, 0.16),
      new THREE.MeshStandardMaterial({
        color: 0x1e3a5f, roughness: 0.3, transparent: true, opacity: 0.45
      })
    );
    boothOutline.position.set(0.3, 0.994, -0.06);
    boothOutline.rotation.y = 0.08;
    bench.add(boothOutline);

    /* Rolled paper edge (cylinder to suggest a curl) */
    var rollGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.5, 10);
    var roll = new THREE.Mesh(rollGeo, m.white);
    roll.rotation.x = Math.PI / 2;
    roll.position.set(0.7, 0.997, -0.06);
    roll.rotation.z = 0.08;
    bench.add(roll);

    /* --- Wood sample blocks (different species, nice grain colors) --- */
    var woods = [
      { c: 0xd4a76a, n: 'Maple' },
      { c: 0x9e7c52, n: 'Oak' },
      { c: 0x5a3a22, n: 'Walnut' },
      { c: 0x8b5e3c, n: 'Cherry' }
    ];
    woods.forEach(function (w, i) {
      var block = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.055, 0.08),
        new THREE.MeshStandardMaterial({
          color: w.c, roughness: 0.4, metalness: 0.0, envMapIntensity: 0.25
        })
      );
      block.position.set(-0.75 + i * 0.14, 0.99 + i * 0.001, 0.28);
      block.rotation.y = (i - 1.5) * 0.06;
      block.castShadow = true;
      bench.add(block);
    });

    /* --- Steel ruler (prominent, reflective) --- */
    var ruler = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.003, 0.03),
      m.steel
    );
    ruler.position.set(0.75, 0.994, 0.15);
    ruler.rotation.y = -0.12;
    ruler.castShadow = true;
    bench.add(ruler);
    /* Ruler notches */
    for (var ri = 0; ri < 10; ri++) {
      var notch = new THREE.Mesh(
        new THREE.BoxGeometry(0.002, 0.004, 0.008),
        m.steelDark
      );
      notch.position.set(0.53 + ri * 0.045, 0.996, 0.15);
      notch.rotation.y = -0.12;
      bench.add(notch);
    }

    /* --- Pencils (2, crossed) --- */
    var pencilMat = new THREE.MeshStandardMaterial({ color: 0xe8b830, roughness: 0.45 });
    var pencilGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6);
    var pen1 = new THREE.Mesh(pencilGeo, pencilMat);
    pen1.rotation.z = Math.PI / 2;
    pen1.position.set(0.05, 0.993, 0.05);
    pen1.rotation.x = 0.15;
    bench.add(pen1);
    var pen2 = new THREE.Mesh(pencilGeo, pencilMat);
    pen2.rotation.z = Math.PI / 2;
    pen2.position.set(0.08, 0.997, 0.07);
    pen2.rotation.x = -0.2;
    pen2.rotation.y = 0.5;
    bench.add(pen2);

    /* --- Miniature booth model (hero piece) --- */
    var mini = new THREE.Group();

    /* Platform */
    var mPlat = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.012, 0.22),
      m.steelDark
    );
    mPlat.receiveShadow = true;
    mini.add(mPlat);
    /* Platform LED */
    var mLed = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.004, 0.004),
      m.led
    );
    mLed.position.set(0, 0.003, 0.108);
    mini.add(mLed);

    /* Back wall */
    var mWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 0.008),
      m.white
    );
    mWall.position.set(0, 0.106, -0.106);
    mini.add(mWall);
    /* Accent panel */
    var mAccent = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.18, 0.004),
      m.sienna
    );
    mAccent.position.set(-0.09, 0.096, -0.1);
    mini.add(mAccent);
    /* Header band */
    var mHeader = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.035, 0.012),
      m.steelDark
    );
    mHeader.position.set(0, 0.2, -0.1);
    mini.add(mHeader);
    /* Copper trim */
    var mTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.008, 0.006),
      m.copper
    );
    mTrim.position.set(0, 0.18, -0.099);
    mini.add(mTrim);
    /* Side wall */
    var mSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.006, 0.2, 0.14),
      m.white
    );
    mSide.position.set(-0.147, 0.106, -0.04);
    mini.add(mSide);
    /* Mini screen */
    var mScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.06, 0.004),
      new THREE.MeshStandardMaterial({
        color: 0x081828, emissive: 0x2266cc, emissiveIntensity: 0.8,
        roughness: 0.05, metalness: 0.1
      })
    );
    mScreen.position.set(0.05, 0.1, -0.098);
    mini.add(mScreen);
    /* Mini counter */
    var mCounter = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, 0.04),
      m.steelDark
    );
    mCounter.position.set(0.04, 0.036, 0.05);
    mini.add(mCounter);
    var mCtrTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.004, 0.045),
      m.steel
    );
    mCtrTop.position.set(0.04, 0.068, 0.05);
    mini.add(mCtrTop);

    mini.position.set(-0.55, 0.988, -0.05);
    mini.rotation.y = 0.4;
    mini.castShadow = true;
    bench.add(mini);

    /* Mini glow light */
    var miniGlow = new THREE.PointLight(0x4488cc, 0.15, 0.5);
    miniGlow.position.set(-0.55, 1.1, -0.05);
    bench.add(miniGlow);

    /* === COFFEE MUG (lathe-turned, realistic) === */
    var mugPts = [
      [0, 0], [0.035, 0.002], [0.038, 0.01],
      [0.032, 0.015], [0.032, 0.075],
      [0.036, 0.08], [0.036, 0.09],
      [0.034, 0.092], [0, 0.092]
    ];
    var mugGeo = lathe(mugPts, 20);
    var mugMesh = new THREE.Mesh(mugGeo, m.ceramic);
    mugMesh.position.set(0.9, 0.988, 0.32);
    mugMesh.castShadow = true;
    bench.add(mugMesh);
    /* Coffee liquid */
    var coffeeDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.032, 14),
      new THREE.MeshStandardMaterial({ color: 0x2c1808, roughness: 0.15, metalness: 0.1 })
    );
    coffeeDisc.rotation.x = -Math.PI / 2;
    coffeeDisc.position.set(0.9, 1.078, 0.32);
    bench.add(coffeeDisc);
    /* Handle (torus arc) */
    var mugHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.025, 0.006, 8, 12, Math.PI),
      m.ceramic
    );
    mugHandle.position.set(0.937, 1.035, 0.32);
    mugHandle.rotation.y = Math.PI / 2;
    mugHandle.rotation.x = Math.PI / 2;
    bench.add(mugHandle);

    /* === EASEL with DRAWING BOARD === */
    var easel = new THREE.Group();

    /* Board (thick, solid) */
    var boardGeo = new THREE.BoxGeometry(0.85, 1.1, 0.03);
    var boardMesh = new THREE.Mesh(boardGeo, m.white);
    boardMesh.castShadow = true;
    easel.add(boardMesh);

    /* Blueprint mounted on board */
    var eBp = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.88, 0.003),
      m.blueprint
    );
    eBp.position.z = 0.018;
    easel.add(eBp);

    /* Horizontal lines */
    for (var hi = 0; hi < 7; hi++) {
      var hl = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.005, 0.004),
        m.bpLine
      );
      hl.position.set(0, 0.34 - hi * 0.1, 0.021);
      easel.add(hl);
    }
    /* Booth layout shapes */
    var lShape1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.18, 0.004),
      new THREE.MeshStandardMaterial({
        color: 0x3870a8, roughness: 0.35, transparent: true, opacity: 0.4
      })
    );
    lShape1.position.set(-0.1, -0.06, 0.021);
    easel.add(lShape1);
    var lShape2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.1, 0.004),
      new THREE.MeshStandardMaterial({
        color: 0x1e3a5f, roughness: 0.35, transparent: true, opacity: 0.35
      })
    );
    lShape2.position.set(0.15, 0.08, 0.021);
    easel.add(lShape2);

    /* Copper binder clips */
    var clipG = new THREE.BoxGeometry(0.06, 0.02, 0.04);
    [-0.22, 0.22].forEach(function (cx) {
      var clip = new THREE.Mesh(clipG, m.copper);
      clip.position.set(cx, 0.44, 0.018);
      easel.add(clip);
    });

    /* A-frame legs */
    var eLeg = new THREE.CylinderGeometry(0.012, 0.018, 1.9, 8);
    var el1 = new THREE.Mesh(eLeg, m.woodWalnut);
    el1.position.set(-0.3, -0.35, -0.08);
    el1.rotation.x = 0.04;
    el1.rotation.z = -0.06;
    easel.add(el1);
    var el2 = new THREE.Mesh(eLeg, m.woodWalnut);
    el2.position.set(0.3, -0.35, -0.08);
    el2.rotation.x = 0.04;
    el2.rotation.z = 0.06;
    easel.add(el2);
    var el3 = new THREE.Mesh(eLeg, m.woodWalnut);
    el3.position.set(0, -0.22, -0.25);
    el3.rotation.x = 0.2;
    easel.add(el3);
    /* Ledge */
    var ledge = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.02, 0.04),
      m.woodWalnut
    );
    ledge.position.set(0, -0.5, 0.01);
    easel.add(ledge);

    easel.position.set(-1.4, 1.55, -0.95);
    easel.rotation.y = 0.22;
    root.add(easel);

    /* === DESK LAMP (architect style, precise geometry) === */
    var lamp = new THREE.Group();

    /* Heavy round base */
    var lBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.105, 0.02, 24),
      m.steelDark
    );
    lBase.position.y = 0.01;
    lamp.add(lBase);

    /* Base stem (short vertical) */
    var stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.06, 10),
      m.steelBrushed
    );
    stem.position.y = 0.05;
    lamp.add(stem);

    /* Joint 1 (base pivot) */
    var j1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), m.copper);
    j1.position.set(0, 0.08, 0);
    lamp.add(j1);

    /* --- Lower arm: from (0, 0.08) → (0.12, 0.35) --- */
    var a1dx = 0.12, a1dy = 0.27;
    var a1Len = Math.sqrt(a1dx * a1dx + a1dy * a1dy);     // ~0.295
    var a1Ang = Math.atan2(a1dx, a1dy);                     // ~0.42 rad
    var a1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, a1Len, 8),
      m.steelBrushed
    );
    a1.position.set(a1dx * 0.5, 0.08 + a1dy * 0.5, 0);    // midpoint
    a1.rotation.z = -a1Ang;                                  // tilt right
    lamp.add(a1);

    /* Joint 2 (elbow) */
    var j2 = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), m.copper);
    j2.position.set(0.12, 0.35, 0);
    lamp.add(j2);

    /* --- Upper arm: from (0.12, 0.35) → (0.04, 0.56) --- */
    var a2dx = -0.08, a2dy = 0.21;
    var a2Len = Math.sqrt(a2dx * a2dx + a2dy * a2dy);      // ~0.225
    var a2Ang = Math.atan2(a2dx, a2dy);                      // ~-0.365 rad
    var a2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, a2Len, 8),
      m.steelBrushed
    );
    a2.position.set(0.12 + a2dx * 0.5, 0.35 + a2dy * 0.5, 0);
    a2.rotation.z = -a2Ang;
    lamp.add(a2);

    /* Shade anchor at end of upper arm */
    var sx = 0.04, sy = 0.56;

    /* Shade (copper cone, open bottom) */
    var shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.07, 20, 1, true),
      m.copper
    );
    shade.position.set(sx, sy, 0);
    shade.castShadow = true;
    lamp.add(shade);

    /* Bulb */
    var bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 10, 10),
      m.led
    );
    bulb.position.set(sx, sy - 0.04, 0);
    lamp.add(bulb);

    /* Lamp glow */
    var lampGlow = new THREE.PointLight(0xffe0a0, 0.7, 2.2);
    lampGlow.position.set(sx, sy - 0.055, 0);
    lamp.add(lampGlow);

    lamp.position.set(1.05, 1.01, -0.25);
    bench.add(lamp);

    /* === PLANT (lathe pot, nicer foliage) === */
    var plantG = new THREE.Group();
    /* Concrete pot (lathe-turned) */
    var potGeo = lathe([
      [0, 0], [0.08, 0.005], [0.085, 0.02],
      [0.1, 0.06], [0.11, 0.18],
      [0.12, 0.2], [0.12, 0.22],
      [0.115, 0.225], [0.095, 0.225], [0, 0.225]
    ], 16);
    var pot = new THREE.Mesh(potGeo, m.concrete);
    pot.castShadow = true;
    plantG.add(pot);
    /* Soil */
    var soilD = new THREE.Mesh(
      new THREE.CircleGeometry(0.095, 14),
      new THREE.MeshStandardMaterial({ color: 0x251a0e, roughness: 0.95 })
    );
    soilD.rotation.x = -Math.PI / 2;
    soilD.position.y = 0.224;
    plantG.add(soilD);
    /* Trunk */
    var trk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.02, 0.3, 8),
      m.woodWalnut
    );
    trk.position.y = 0.37;
    plantG.add(trk);
    /* Foliage (icosahedrons for organic look) */
    for (var fli = 0; fli < 5; fli++) {
      var fRad = 0.1 - fli * 0.012;
      var fGeo = new THREE.IcosahedronGeometry(fRad, 1);
      var fMat = fli % 2 === 0 ? m.green : m.greenL;
      var fMesh = new THREE.Mesh(fGeo, fMat);
      fMesh.position.set(
        Math.sin(fli * 1.4) * 0.04,
        0.5 + fli * 0.065,
        Math.cos(fli * 2.0) * 0.035
      );
      fMesh.rotation.set(fli * 0.3, fli * 0.5, fli * 0.2);
      fMesh.castShadow = true;
      plantG.add(fMesh);
    }
    plantG.position.set(1.55, 0, -0.5);
    root.add(plantG);

    /* === WALL SHELF === */
    var wShelf = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.025, 0.2),
      m.woodOak
    );
    wShelf.position.set(-0.2, 1.55, -1.15);
    wShelf.castShadow = true;
    root.add(wShelf);
    /* L-brackets (steel) */
    [-0.6, 0.15].forEach(function (bx) {
      var brk = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.12, 0.01),
        m.steelDark
      );
      brk.position.set(bx, 1.48, -1.1);
      root.add(brk);
      var brkH = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.01, 0.12),
        m.steelDark
      );
      brkH.position.set(bx, 1.42, -1.08);
      root.add(brkH);
    });

    /* Books on shelf */
    var bookData = [
      { c: 0x1a2e4d, h: 0.18 },
      { c: 0x1e3a5f, h: 0.16 },
      { c: 0x2d4a2d, h: 0.17 },
      { c: 0x4a3020, h: 0.15 }
    ];
    bookData.forEach(function (b, i) {
      var bk = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, b.h, 0.13),
        new THREE.MeshStandardMaterial({ color: b.c, roughness: 0.6, envMapIntensity: 0.2 })
      );
      bk.position.set(-0.5 + i * 0.06, 1.55 + b.h / 2 + 0.013, -1.1);
      bk.rotation.z = i === 2 ? 0.06 : 0;
      bk.castShadow = true;
      root.add(bk);
    });

    /* Copper cube model on shelf */
    var cubeModel = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.08),
      m.copper
    );
    cubeModel.position.set(0.05, 1.605, -1.1);
    cubeModel.rotation.y = 0.5;
    cubeModel.castShadow = true;
    root.add(cubeModel);

    /* Small succulent */
    var succPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.028, 0.05, 10),
      m.ceramicDark
    );
    succPot.position.set(-0.2, 1.588, -1.1);
    root.add(succPot);
    var succLeaf = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.035, 1),
      m.greenL
    );
    succLeaf.position.set(-0.2, 1.64, -1.1);
    succLeaf.castShadow = true;
    root.add(succLeaf);

    /* === SAWDUST PARTICLES === */
    var dustN = 80;
    var dustGeo = new THREE.BufferGeometry();
    var dP = new Float32Array(dustN * 3);
    for (var d = 0; d < dustN; d++) {
      dP[d * 3] = (Math.random() - 0.5) * 5;
      dP[d * 3 + 1] = Math.random() * 3;
      dP[d * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dP, 3));
    var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xd4b896, size: 0.012, transparent: true,
      opacity: 0.22, sizeAttenuation: true, depthWrite: false
    }));
    root.add(dust);

    /* === LIGHTING === */
    scene.add(new THREE.AmbientLight(0xe8ddd0, 0.3));
    scene.add(new THREE.HemisphereLight(0xfff0dd, 0x151520, 0.4));

    /* Key light (warm, high contrast) */
    var key = new THREE.DirectionalLight(0xfff0dd, 1.1);
    key.position.set(3, 9, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.0008;
    key.shadow.normalBias = 0.02;
    scene.add(key);

    /* Cool fill */
    var fill = new THREE.DirectionalLight(0xa8c0e0, 0.3);
    fill.position.set(-4, 5, -2);
    scene.add(fill);

    /* Rim light */
    var rim = new THREE.DirectionalLight(0xffe8cc, 0.25);
    rim.position.set(-2, 4, -5);
    scene.add(rim);

    /* Warm spot on bench */
    var spot = new THREE.SpotLight(0xffeedd, 0.6, 8, Math.PI / 8, 0.7, 1);
    spot.position.set(0.5, 3.5, 1.5);
    spot.target.position.set(0, 0.7, 0);
    spot.castShadow = true;
    scene.add(spot);
    scene.add(spot.target);

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

    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      /* Smooth oscillating rotation */
      root.rotation.y = Math.sin(t * 0.22) * 0.25 + 0.3;

      /* Subtle float */
      bench.position.y = Math.sin(t * 0.5) * 0.012;

      /* Dust drift */
      var da = dustGeo.attributes.position.array;
      for (var i = 0; i < dustN; i++) {
        da[i * 3 + 1] += 0.0004 + Math.sin(t * 0.6 + i * 0.8) * 0.0003;
        if (da[i * 3 + 1] > 3) da[i * 3 + 1] = 0;
        da[i * 3] += Math.sin(t * 0.25 + i * 0.6) * 0.00015;
      }
      dustGeo.attributes.position.needsUpdate = true;

      /* Lamp glow pulse */
      lampGlow.intensity = 0.6 + Math.sin(t * 1.5) * 0.12;

      /* Mini screen glow pulse */
      miniGlow.intensity = 0.12 + Math.sin(t * 2.0) * 0.05;

      /* Cube model slow spin */
      cubeModel.rotation.y = t * 0.3;

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

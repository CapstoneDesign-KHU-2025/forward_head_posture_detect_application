'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ThreeDemModel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    /* =======================
     * Scene / Camera / Renderer
     * ======================= */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202230);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.05, 200);
    camera.position.set(3.0, 1.45, 0.01);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    // 가까이-멀리 수정
    controls.enableZoom = true;
    controls.zoomSpeed = 1.4;
    controls.minDistance = 0.25;
    controls.maxDistance = 20;
    (controls as any).zoomToCursor = true;

    controls.enablePan = true;
    controls.rotateSpeed = 0.9;
    controls.target.set(0, 1.45, 0);

    /* =======================
     * Connections
     * ======================= */
    // 손가락(17~22)은 숨길 거라 연결선에서 제외
    const BODY_CONNECTIONS = [
      [11, 13], [13, 15],                    // 팔
      [12, 14], [14, 16],
      [11, 12], [11, 23], [12, 24], [23, 24], // 몸통
      [23, 25], [25, 27], [27, 29], [29, 31], // 왼쪽 다리
      [24, 26], [26, 28], [28, 30], [30, 32]  // 오른쪽 다리
    ];
    const HEAD_CONNECTIONS = [
      [1, 2], [2, 3], [4, 5], [5, 6],
      [1, 0], [0, 4],
      [7, 1], [8, 4],
      [9, 0], [10, 0],
      [11, 0], [12, 0]
    ];
    const POSE_CONNECTIONS = [...BODY_CONNECTIONS, ...HEAD_CONNECTIONS];

    /* =======================
     * Index aliases
     * ======================= */
    const IDX = {
      NOSE: 0, L_EYE_IN: 1, L_EYE: 2, L_EYE_OUT: 3, R_EYE_IN: 4, R_EYE: 5, R_EYE_OUT: 6,
      L_EAR: 7, R_EAR: 8, MOUTH_L: 9, MOUTH_R: 10,
      L_SHOULDER: 11, R_SHOULDER: 12, L_ELBOW: 13, R_ELBOW: 14, L_WRIST: 15, R_WRIST: 16,
      L_PINKY: 17, R_PINKY: 18, L_INDEX: 19, R_INDEX: 20, L_THUMB: 21, R_THUMB: 22,
      L_HIP: 23, R_HIP: 24, L_KNEE: 25, R_KNEE: 26, L_ANKLE: 27, R_ANKLE: 28,
      L_HEEL: 29, R_HEEL: 30, L_FOOT: 31, R_FOOT: 32
    } as const;

    /* 숨길 포인트(손가락) */
    const HIDE_INDICES = new Set([17, 18, 19, 20, 21, 22]);

    /* =======================
     * Visualization options
     * ======================= */
    const BODY_SCALE = 1.15;
    const HEAD_SCALE = 1.35;
    const HEAD_POINT_SCALE = 1.1;
    const BODY_POINT_SCALE = 0.95;
    const FACE_SPREAD = 1.25;

    const ANGLE_SMOOTH_ALPHA = 0.2;
    const POINT_SMOOTH_ALPHA = 0.3;

    let IDEAL_NECK_ANGLE_DEG = 52; // 목각도
    (window as any).setIdealNeckAngle = (deg: number) => { IDEAL_NECK_ANGLE_DEG = Number(deg) || 0; };

    /* ===== WASD 이동(팬) ===== */
    const MOVE_BASE_SPEED = 1.5;   // 초당 이동 거리(그리드 단위)
    const MOVE_FAST_MULT = 2.5;    // Shift로 가속
    const pressed = new Set<string>();

    const keydown = (e: KeyboardEvent) => {
      // 입력 포커스가 인풋이 아닐 때만
      if (["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement as HTMLElement)?.tagName ?? "")) return;
      pressed.add(e.code);
      // 스페이스/화살표/스크롤 방지
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    };
    const keyup = (e: KeyboardEvent) => pressed.delete(e.code);

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);

    function applyKeyboardPan(dt: number) {
      if (!pressed.size) return;

      // 카메라의 로컬 앞/오른쪽(수평면) 벡터
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0; forward.normalize();

      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(forward, up).normalize(); // 오른쪽

      // 입력 해석
      let move = new THREE.Vector3();
      if (pressed.has("KeyW")) move.add(forward);
      if (pressed.has("KeyS")) move.sub(forward);
      if (pressed.has("KeyD")) move.add(right);
      if (pressed.has("KeyA")) move.sub(right);
      // (옵션) 수직 이동: Q/E
      if (pressed.has("KeyE")) move.add(up);
      if (pressed.has("KeyQ")) move.sub(up);

      if (move.lengthSq() === 0) return;
      move.normalize();

      // 속도(Shift 가속)
      const speed = MOVE_BASE_SPEED * (pressed.has("ShiftLeft") || pressed.has("ShiftRight") ? MOVE_FAST_MULT : 1);
      move.multiplyScalar(speed * dt);

      // OrbitControls 특성상 position과 target을 함께 평행이동해야 '팬'처럼 느껴짐
      camera.position.add(move);
      controls.target.add(move);
    }

    scene.add(new THREE.GridHelper(40, 40, 0x555566, 0x333344));

    /* ▼▼▼ 이동 허용 박스 정의 + 시각화 ▼▼▼ */
    const BOUNDS = { xMin: -5, xMax: 5, zMin: -5, zMax: 5, edgeMargin: 0.8 };
    (function drawBounds() {
      const w = BOUNDS.xMax - BOUNDS.xMin;
      const d = BOUNDS.zMax - BOUNDS.zMin;
      const h = 0.001;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x4444aa,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (BOUNDS.xMin + BOUNDS.xMax) / 2,
        0,
        (BOUNDS.zMin + BOUNDS.zMax) / 2
      );
      scene.add(mesh);
    })();
    /* ▲▲▲ 끝 ▲▲▲ */

    /* =======================
     * Joints / Lines
     * ======================= */
    const jointSpheres: THREE.Mesh[] = [];
    const sphereGeom = new THREE.SphereGeometry(0.026, 16, 16);
    const jointMat = new THREE.MeshBasicMaterial({ color: 0xff77ff });
    for (let i = 0; i < 33; i++) {
      const m = new THREE.Mesh(sphereGeom, jointMat);
      m.visible = !HIDE_INDICES.has(i);
      m.scale.setScalar(i <= 10 ? HEAD_POINT_SCALE : BODY_POINT_SCALE);
      scene.add(m);
      jointSpheres.push(m);
    }

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffe2 });
    const lineGeom = new THREE.BufferGeometry().setFromPoints(
      new Array(POSE_CONNECTIONS.length * 2).fill(0).map(() => new THREE.Vector3())
    );
    const lineMesh = new THREE.LineSegments(lineGeom, lineMaterial);
    scene.add(lineMesh);

    /* =======================
     * Guides & Angle label
     * ======================= */
    const guideMat = new THREE.LineBasicMaterial({
      color: 0xffff00,
      linewidth: 5,
      transparent: false,
      opacity: 1.0
    });
    const guideGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const guideLine = new THREE.Line(guideGeom, guideMat);
    scene.add(guideLine);

    const upRefMat = new THREE.LineBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.95 });
    const upRefGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const upRefLine = new THREE.Line(upRefGeom, upRefMat);
    scene.add(upRefLine);

    function makeTextSprite(text: string) {
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(mat);
      const aspect = canvas.width / canvas.height;
      sprite.scale.set(0.6 * aspect, 0.6, 1);
      (sprite as any).userData = { canvas, context: ctx, texture: tex };
      updateSpriteText(sprite, text);
      return sprite;
    }
    function updateSpriteText(sprite: THREE.Sprite, text: string) {
      const { canvas, context, texture } = (sprite as any).userData;
      const ctx: CanvasRenderingContext2D = context;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const [line1, line2] = text.split('\n');
      ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 8;
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.strokeText(line1, canvas.width / 2, canvas.height / 2 - 40);
      ctx.fillText(line1, canvas.width / 2, canvas.height / 2 - 40);
      if (line2) { ctx.strokeText(line2, canvas.width / 2, canvas.height / 2 + 40); ctx.fillText(line2, canvas.width / 2, canvas.height / 2 + 40); }
      texture.needsUpdate = true;
    }
    const angleSprite = makeTextSprite('0° (ideal 10°)\nΔ 0°');
    scene.add(angleSprite);

    /* =======================
     * Pose mode (stand / upper-only)
     * ======================= */
    let poseMode: 'stand' | 'upper' = "stand"; // "stand" 또는 "upper"
    const pose = new Array(33).fill(0).map(() => new THREE.Vector3(0, 0, 0));

    /* 모드에 따라 13~32 보이기/숨기기 */
    function applyVisibilityForMode(mode: 'stand' | 'upper') {
      const hideLower = (mode === "upper");
      for (let i = 13; i <= 32; i++) {
        (jointSpheres[i] as any).visible = !hideLower && !HIDE_INDICES.has(i);
      }
    }

    /* =======================
     * Base pose (mode별, 내부 기본 포즈)
     * ======================= */
    function applyBasePose(mode: 'stand' | 'upper' = "stand") {
      const shoulderHalf = 0.22, hipHalf = 0.14;

      if (mode === "stand") {
        const shoulderY = 1.45, hipY = 1.0, kneeY = 0.55, ankleY = 0.10;

        // 어깨
        pose[IDX.L_SHOULDER].set(-shoulderHalf, shoulderY, 0);
        pose[IDX.R_SHOULDER].set(+shoulderHalf, shoulderY, 0);

        // 팔(자연스럽게 옆으로)
        pose[IDX.L_ELBOW].set(-(shoulderHalf + 0.30), shoulderY - 0.22, 0);
        pose[IDX.R_ELBOW].set(+(shoulderHalf + 0.30), shoulderY - 0.22, 0);
        pose[IDX.L_WRIST].set(-(shoulderHalf + 0.50), shoulderY - 0.40, 0);
        pose[IDX.R_WRIST].set(+(shoulderHalf + 0.50), shoulderY - 0.40, 0);

        // 골반/다리(수직)
        pose[IDX.L_HIP].set(-hipHalf, hipY, 0);
        pose[IDX.R_HIP].set(+hipHalf, hipY, 0);
        pose[IDX.L_KNEE].set(-hipHalf, kneeY, 0);
        pose[IDX.R_KNEE].set(+hipHalf, kneeY, 0);
        pose[IDX.L_ANKLE].set(-hipHalf, ankleY, 0);
        pose[IDX.R_ANKLE].set(+hipHalf, ankleY, 0);
        pose[IDX.L_HEEL].set(-hipHalf, ankleY - 0.02, -0.05);
        pose[IDX.R_HEEL].set(+hipHalf, ankleY - 0.02, -0.05);
        pose[IDX.L_FOOT].set(-hipHalf, ankleY - 0.01, 0.10);
        pose[IDX.R_FOOT].set(+hipHalf, ankleY - 0.01, 0.10);

        // 머리 placeholder(0..10)
        for (let i = 0; i <= 10; i++) pose[i].set(0, shoulderY + 0.2, 0);

      } else { // upper-only (0~12만 표시)
        const shoulderY = 1.45;
        const shoulderZ = 0.0;

        // 어깨
        pose[IDX.L_SHOULDER].set(-shoulderHalf, shoulderY, shoulderZ);
        pose[IDX.R_SHOULDER].set(+shoulderHalf, shoulderY, shoulderZ);

        // 팔: 가볍게 벌림
        pose[IDX.L_ELBOW].set(-(shoulderHalf + 0.25), shoulderY - 0.20, 0.03);
        pose[IDX.R_ELBOW].set(+(shoulderHalf + 0.25), shoulderY - 0.20, 0.03);
        pose[IDX.L_WRIST].set(-(shoulderHalf + 0.42), shoulderY - 0.38, 0.02);
        pose[IDX.R_WRIST].set(+(shoulderHalf + 0.42), shoulderY - 0.38, 0.02);

        // 다리쪽 관절은 대충 모아두되 화면에는 숨김
        const hipY = 0.9;
        const hipZ = 0.0;
        const hipHalf2 = 0.14;
        pose[IDX.L_HIP].set(-hipHalf2, hipY, hipZ);
        pose[IDX.R_HIP].set(+hipHalf2, hipY, hipZ);
        pose[IDX.L_KNEE].set(-hipHalf2, hipY - 0.05, hipZ);
        pose[IDX.R_KNEE].set(+hipHalf2, hipY - 0.05, hipZ);
        pose[IDX.L_ANKLE].set(-hipHalf2, hipY - 0.10, hipZ);
        pose[IDX.R_ANKLE].set(+hipHalf2, hipY - 0.10, hipZ);
        pose[IDX.L_HEEL].set(-hipHalf2, hipY - 0.12, hipZ);
        pose[IDX.R_HEEL].set(+hipHalf2, hipY - 0.12, hipZ);
        pose[IDX.L_FOOT].set(-hipHalf2, hipY - 0.12, hipZ);
        pose[IDX.R_FOOT].set(+hipHalf2, hipY - 0.12, hipZ);

        // 머리 placeholder
        for (let i = 0; i <= 10; i++) pose[i].set(0, shoulderY + 0.2, shoulderZ);
      }
    }

    /* 초기 가시성 세팅 */
    applyVisibilityForMode(poseMode);

    /* =======================
     * 외부 포즈 입력 (전신 0..32)
     * ======================= */
    // 외부 포즈가 들어왔는지 플래그 + 공급자
    let useExternalPose = false;
    let externalPoseProvider: null | (() => THREE.Vector3[]) = null;

    (window as any).setBodyFromMediapipe = (landmarksOrResult: any, opts: any = {}) => {
      const {
        useWorld = true,
        yFlip = true,
        zFlip = true,
        scale = 1.0,
        recenter = true,
        offset = { x: 0, y: 0, z: 0 },
        snapToGround = true,
        groundY = 0,
        groundPadding = 0.0
      } = opts;

      // 33 추출
      let lm: any[] | null = null;
      if (Array.isArray(landmarksOrResult)) {
        lm = landmarksOrResult;
      } else if (landmarksOrResult && typeof landmarksOrResult === 'object') {
        if (useWorld && Array.isArray(landmarksOrResult.worldLandmarks)) {
          lm = landmarksOrResult.worldLandmarks;
        } else if (Array.isArray(landmarksOrResult.landmarks)) {
          lm = landmarksOrResult.landmarks;
        }
      }
      if (!lm || lm.length < 33) { console.warn('33 landmarks 필요'); return; }

      // 기준점: 양쪽 힙 중점
      const lHip = lm[IDX.L_HIP], rHip = lm[IDX.R_HIP];
      const root = (lHip && rHip)
        ? { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2, z: (lHip.z + rHip.z) / 2 }
        : { x: lm[0].x, y: lm[0].y, z: lm[0].z };

      // 씬 좌표로 변환
      const arr: THREE.Vector3[] = [];
      for (let i = 0; i < 33; i++) {
        const p = lm[i] || { x: 0, y: 0, z: 0 };
        let x = p.x, y = p.y, z = p.z;

        if (recenter) { x -= root.x; y -= root.y; z -= root.z; }
        if (yFlip) y = -y;
        if (zFlip) z = -z;

        x *= scale; y *= scale; z *= scale;

        x += offset.x; y += offset.y; z += offset.z;

        arr.push(new THREE.Vector3(x, y, z));
      }

      // === 지면 스냅
      if (snapToGround) {
        const footIdx = [IDX.L_ANKLE, IDX.R_ANKLE, IDX.L_HEEL, IDX.R_HEEL, IDX.L_FOOT, IDX.R_FOOT];
        let minY = Infinity;
        for (const idx of footIdx) {
          const v = arr[idx];
          if (v) minY = Math.min(minY, v.y);
        }
        if (isFinite(minY)) {
          const target = groundY + groundPadding;
          const dy = minY - target;
          if (Math.abs(dy) > 1e-9) {
            for (let i = 0; i < 33; i++) arr[i].y -= dy;
          }
        }
      }

      // 공급자 등록
      externalPoseProvider = () => arr;
      useExternalPose = true;
    };

    /* =======================
     * Head provider (neck-local, 0..10)
     * ======================= */
    let headProvider = (t: number) => {
      const pts: Record<number, THREE.Vector3> = {
        [IDX.NOSE]: new THREE.Vector3(0, 0.02, 0.09),
        [IDX.L_EYE_IN]: new THREE.Vector3(-0.022, 0.038, 0.070),
        [IDX.L_EYE]: new THREE.Vector3(-0.040, 0.040, 0.065),
        [IDX.L_EYE_OUT]: new THREE.Vector3(-0.060, 0.038, 0.055),
        [IDX.R_EYE_IN]: new THREE.Vector3(0.022, 0.038, 0.070),
        [IDX.R_EYE]: new THREE.Vector3(0.040, 0.040, 0.065),
        [IDX.R_EYE_OUT]: new THREE.Vector3(0.060, 0.038, 0.055),
        [IDX.L_EAR]: new THREE.Vector3(-0.095, 0.02, 0.0),
        [IDX.R_EAR]: new THREE.Vector3(0.095, 0.02, 0.0),
        [IDX.MOUTH_L]: new THREE.Vector3(-0.035, -0.006, 0.068),
        [IDX.MOUTH_R]: new THREE.Vector3(0.035, -0.006, 0.068),
      };
      const arr = new Array(11).fill(0).map(() => new THREE.Vector3());
      for (let k = 0; k <= 10; k++) {
        const v = (pts as any)[k] ?? new THREE.Vector3(0, 0, 0);
        arr[k].copy(v.multiplyScalar(FACE_SPREAD));
      }
      return arr;
    };

    /* =======================
     * Smoothing state
     * ======================= */
    let angleSmoothed: number | null = null;
    let earMidSmooth: THREE.Vector3 | null = null, shoulderMidSmooth: THREE.Vector3 | null = null;

    /* =======================
     * Per-frame update
     * ======================= */
    function updateFrame(t: number, dt: number) {
      // 외부 포즈가 있으면 그것 사용, 없으면 내부 기본 포즈
      if (useExternalPose && typeof externalPoseProvider === 'function') {
        const ext = externalPoseProvider();
        if (Array.isArray(ext) && ext.length >= 33) {
          for (let i = 0; i < 33; i++) {
            jointSpheres[i].position.copy(ext[i]);
          }
        }
      } else {
        // 내부 기본 포즈 계산
        applyBasePose(poseMode);

        // HEAD (0..10): neck anchor 기준 로컬
        const neckLocal = new THREE.Vector3(
          (pose[IDX.L_SHOULDER].x + pose[IDX.R_SHOULDER].x) / 2,
          (pose[IDX.L_SHOULDER].y + pose[IDX.R_SHOULDER].y) / 2 + 0.06,
          (pose[IDX.L_SHOULDER].z + pose[IDX.R_SHOULDER].z) / 2
        );
        const headLocal = headProvider(t);
        for (let k = 0; k <= 10; k++) {
          pose[k].copy(neckLocal).add(headLocal[k]);
        }

        // 스케일 적용(머리/몸)
        const rootLocal = new THREE.Vector3(
          (pose[IDX.L_HIP].x + pose[IDX.R_HIP].x) / 2,
          (pose[IDX.L_HIP].y + pose[IDX.R_HIP].y) / 2,
          (pose[IDX.L_HIP].z + pose[IDX.R_HIP].z) / 2
        );

        for (let i = 0; i < 33; i++) {
          let pLocal = pose[i].clone();
          if (i <= 10) pLocal.sub(neckLocal).multiplyScalar(HEAD_SCALE).add(neckLocal);
          else pLocal.sub(rootLocal).multiplyScalar(BODY_SCALE).add(rootLocal);
          jointSpheres[i].position.copy(pLocal);
        }
      }

      // 모드별 가시성
      applyVisibilityForMode(poseMode);

      // === Guides & Angle (reworked)
      const lSh = jointSpheres[IDX.L_SHOULDER].position;
      const rSh = jointSpheres[IDX.R_SHOULDER].position;
      const lEar = jointSpheres[IDX.L_EAR].position;
      const rEar = jointSpheres[IDX.R_EAR].position;

      const shoulderMidWorld = lSh.clone().add(rSh).multiplyScalar(0.5);
      const earMidWorld = lEar.clone().add(rEar).multiplyScalar(0.5);

      earMidSmooth = earMidSmooth ? earMidSmooth.lerp(earMidWorld, POINT_SMOOTH_ALPHA) : earMidWorld.clone();
      shoulderMidSmooth = shoulderMidSmooth ? shoulderMidSmooth.lerp(shoulderMidWorld, POINT_SMOOTH_ALPHA) : shoulderMidWorld.clone();

      const shoulderAxis = rSh.clone().sub(lSh).normalize();           // plane normal
      const upWorld = new THREE.Vector3(0, 1, 0);

      const upOnPlane = upWorld.clone().sub(
        shoulderAxis.clone().multiplyScalar(upWorld.dot(shoulderAxis))
      );
      if (upOnPlane.lengthSq() < 1e-9) upOnPlane.set(0, 1e-6, 0);
      upOnPlane.normalize();

      const rightLike = new THREE.Vector3().crossVectors(shoulderAxis, upOnPlane);
      let forward = new THREE.Vector3().crossVectors(rightLike, shoulderAxis);
      if (forward.lengthSq() < 1e-9) forward.copy(new THREE.Vector3(0, 0, 1));
      forward.normalize();

      let yellowVec = earMidSmooth.clone().sub(shoulderMidSmooth);
      yellowVec.sub(shoulderAxis.clone().multiplyScalar(yellowVec.dot(shoulderAxis)));
      if (yellowVec.lengthSq() < 1e-9) yellowVec.copy(upOnPlane);
      yellowVec.normalize();

      const theta = THREE.MathUtils.degToRad(IDEAL_NECK_ANGLE_DEG);
      let whiteVec = new THREE.Vector3(0, Math.sin(theta), Math.cos(theta)).normalize();

      const yellowAngleDegRaw = THREE.MathUtils.radToDeg(
        Math.atan2(yellowVec.dot(upOnPlane), yellowVec.dot(forward))
      );
      const yellowAngleDeg = Math.max(0, yellowAngleDegRaw);

      angleSmoothed = (angleSmoothed == null)
        ? yellowAngleDeg
        : THREE.MathUtils.lerp(angleSmoothed, yellowAngleDeg, ANGLE_SMOOTH_ALPHA);

      const delta = (angleSmoothed - IDEAL_NECK_ANGLE_DEG);
      updateSpriteText(
        angleSprite,
        `${angleSmoothed.toFixed(1)}° (ideal ${IDEAL_NECK_ANGLE_DEG}°)\nΔ ${delta.toFixed(1)}°`
      );

      angleSprite.position.copy(earMidSmooth.clone().add(new THREE.Vector3(0, 0.20, 0)));

      const guideLen = 0.7;
      const yellowEnd = shoulderMidSmooth.clone().add(yellowVec.clone().multiplyScalar(guideLen));
      (guideLine.material as THREE.LineBasicMaterial).color.set(0xffff00);
      guideLine.geometry.setFromPoints([shoulderMidSmooth, yellowEnd]);

      const whiteEnd = shoulderMidSmooth.clone().add(whiteVec.clone().multiplyScalar(guideLen));
      (upRefLine.material as THREE.LineBasicMaterial).color.set(0xffffff);
      upRefLine.geometry.setFromPoints([shoulderMidSmooth, whiteEnd]);

      // 스켈레톤 라인(손가락/숨김 제외)
      const pts: THREE.Vector3[] = [];
      for (const [a, b] of POSE_CONNECTIONS) {
        if (HIDE_INDICES.has(a) || HIDE_INDICES.has(b)) continue;
        if (!(jointSpheres[a] as any).visible || !(jointSpheres[b] as any).visible) continue;
        pts.push(jointSpheres[a].position, jointSpheres[b].position);
      }
      lineMesh.geometry.setFromPoints(pts);
    }

    /* =======================
     * Loop
     * ======================= */
    const clock = new THREE.Clock();
    let lastT = 0;
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = t - lastT; lastT = t;

      updateFrame(t, dt);
      applyKeyboardPan(dt);
      controls.update();
      camera.lookAt(controls.target);
      renderer.render(scene, camera);
    };
    animate();

    /* =======================
     * 샘플 MediaPipe 결과 (landmarks + worldLandmarks)
     * ======================= */
    (window as any).SAMPLE_MP = {
      landmarks: [
        { x: 0.4155453145503998, y: 0.6305375695228577, z: -1.757399320602417 },
        { x: 0.453133761882782, y: 0.5574392080307007, z: -1.7000477313995361 },
        { x: 0.4792403280735016, y: 0.5578248500823975, z: -1.7000463008880615 },
        { x: 0.5018416047096252, y: 0.557602047920227, z: -1.6998646259307861 },
        { x: 0.3843485116958618, y: 0.5635255575180054, z: -1.6811110973358154 },
        { x: 0.3648548126220703, y: 0.5664455890655518, z: -1.6813125610351562 },
        { x: 0.3497018814086914, y: 0.5692284107208252, z: -1.6813091039657593 },
        { x: 0.5473126173019409, y: 0.5785425901412964, z: -1.221659541130066 },
        { x: 0.3380371928215027, y: 0.5957660675048828, z: -1.1315677165985107 },
        { x: 0.4737843871116638, y: 0.6957162618637085, z: -1.5649802684783936 },
        { x: 0.38607317209243774, y: 0.705558180809021, z: -1.541456937789917 },
        { x: 0.750962495803833, y: 0.9054476022720337, z: -0.8587754964828491 },
        { x: 0.26526424288749695, y: 0.9804337620735168, z: -0.7241929173469543 },
        { x: 0.8953683972358704, y: 1.3192942142486572, z: -0.7400388121604919 },
        { x: 0.22031088173389435, y: 1.455984354019165, z: -0.5479068160057068 },
        { x: 0.900743305683136, y: 1.6281955242156982, z: -1.0343410968780518 },
        { x: 0.20400726795196533, y: 1.8071465492248535, z: -0.7875005006790161 },
        { x: 0.9324607849121094, y: 1.7349010705947876, z: -1.1397836208343506 },
        { x: 0.1773938536643982, y: 1.9294142723083496, z: -0.875320315361023 },
        { x: 0.8891888856887817, y: 1.7445052862167358, z: -1.2465462684631348 },
        { x: 0.21117103099822998, y: 1.9413914680480957, z: -1.0191152095794678 },
        { x: 0.8698639869689941, y: 1.7085604667663574, z: -1.0959763526916504 },
        { x: 0.2283298671245575, y: 1.8954880237579346, z: -0.8661426305770874 },
        { x: 0.7226417064666748, y: 1.7833548784255981, z: 0.004702439531683922 },
        { x: 0.397089421749115, y: 1.8191832304000854, z: 0.0064506931230425835 },
        { x: 0.7621083855628967, y: 2.4778828620910645, z: -0.09004358947277069 },
        { x: 0.4469093382358551, y: 2.471555471420288, z: -0.250405877828598 },
        { x: 0.8006247282028198, y: 3.0430452823638916, z: 0.7591897249221802 },
        { x: 0.49820655584335327, y: 3.0933451652526855, z: 0.3053274154663086 },
        { x: 0.8140320777893066, y: 3.128754138946533, z: 0.8463562726974487 },
        { x: 0.4988399147987366, y: 3.1909689903259277, z: 0.35340583324432373 },
        { x: 0.7629046440124512, y: 3.2453694343566895, z: 0.44748225808143616 },
        { x: 0.549705445766449, y: 3.2947847843170166, z: -0.12298025190830231 }
      ],
      worldLandmarks: [
        { x: -0.012, y: -0.451, z: -0.521 }, { x: 0.011, y: -0.482, z: -0.498 }, { x: 0.021, y: -0.483, z: -0.498 },
        { x: 0.032, y: -0.484, z: -0.498 }, { x: -0.025, y: -0.481, z: -0.501 }, { x: -0.035, y: -0.482, z: -0.501 },
        { x: -0.045, y: -0.483, z: -0.501 }, { x: 0.051, y: -0.461, z: -0.461 }, { x: -0.061, y: -0.460, z: -0.465 },
        { x: 0.018, y: -0.411, z: -0.445 }, { x: -0.008, y: -0.410, z: -0.449 }, { x: 0.215, y: -0.153, z: -0.312 },
        { x: -0.211, y: -0.149, z: -0.325 }, { x: 0.281, y: 0.051, z: -0.251 }, { x: -0.291, y: 0.059, z: -0.269 },
        { x: 0.321, y: 0.251, z: -0.301 }, { x: -0.341, y: 0.261, z: -0.321 }, { x: 0.345, y: 0.341, z: -0.354 },
        { x: -0.365, y: 0.351, z: -0.376 }, { x: 0.341, y: 0.356, z: -0.349 }, { x: -0.361, y: 0.365, z: -0.371 },
        { x: 0.301, y: 0.340, z: -0.311 }, { x: -0.321, y: 0.352, z: -0.332 }, { x: 0.151, y: 0.481, z: -0.221 },
        { x: -0.141, y: 0.485, z: -0.234 }, { x: 0.181, y: 0.751, z: -0.288 }, { x: -0.171, y: 0.761, z: -0.301 },
        { x: 0.201, y: 0.881, z: -0.341 }, { x: -0.191, y: 0.891, z: -0.358 }, { x: 0.198, y: 0.901, z: -0.337 },
        { x: -0.188, y: 0.911, z: -0.353 }, { x: 0.175, y: 0.915, z: -0.401 }, { x: -0.165, y: 0.922, z: -0.415 }
      ]
    };

    /* =======================
     * Resize
     * ======================= */
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.near = 0.01;
      camera.far = 500;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(containerRef.current);
    window.addEventListener('resize', onResize);

    /* =======================
     * landmarks <-> worldLandmarks 토글 UI
     * ======================= */
    (function makeLMToggleUI() {
      const ui = document.createElement('div');
      Object.assign(ui.style, {
        position: 'fixed', top: '12px', left: '12px', zIndex: 9999 as any,
        background: 'rgba(20,22,32,0.9)', color: '#fff',
        fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial',
        padding: '8px 10px', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px', backdropFilter: 'blur(6px)', boxShadow: '0 6px 16px rgba(0,0,0,0.25)'
      });

      const mkBtn = (t: string) => {
        const b = document.createElement('button'); b.textContent = t;
        Object.assign(b.style, {
          marginRight: '6px', padding: '6px 10px', borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)',
          color: '#fff', cursor: 'pointer', fontWeight: 600
        } as any);
        b.onmouseenter = () => b.style.background = 'rgba(255,255,255,0.14)';
        b.onmouseleave = () => b.style.background = (b.dataset.active === '1') ? 'rgba(0,255,226,0.25)' : 'rgba(255,255,255,0.08)';
        return b;
      };
      const setActive = (btn: HTMLButtonElement, on: boolean) => {
        btn.dataset.active = on ? '1' : '0';
        btn.style.background = on ? 'rgba(0,255,226,0.25)' : 'rgba(255,255,255,0.08)';
        btn.style.borderColor = on ? 'rgba(0,255,226,0.55)' : 'rgba(255,255,255,0.18)';
      };

      const btnWorld = mkBtn('worldLandmarks');
      const btnImg = mkBtn('landmarks');
      ui.append(btnWorld, btnImg);
      document.body.appendChild(ui);

      function apply(useWorld: boolean) {
        const src = (window as any).LAST_MP_RESULT || (window as any).SAMPLE_MP;
        if (!src) { console.warn('SAMPLE_MP 또는 LAST_MP_RESULT가 필요합니다.'); return; }
        const lm = useWorld ? (src.worldLandmarks || src.landmarks) : src.landmarks;
        if (!Array.isArray(lm) || lm.length < 33) { console.warn('landmarks 길이가 부족합니다.'); return; }

        (window as any).setBodyFromMediapipe({ landmarks: src.landmarks, worldLandmarks: src.worldLandmarks }, {
          useWorld: !!useWorld,
          yFlip: true,
          zFlip: true,
          scale: 1.0,
          recenter: true,
          offset: { x: 0, y: 1.0, z: 0 },
          snapToGround: true,
          groundY: 0,
          groundPadding: 0.0
        });

        setActive(btnWorld, useWorld);
        setActive(btnImg, !useWorld);
      }

      btnWorld.onclick = () => apply(true);
      btnImg.onclick = () => apply(false);
      apply(true);
    })();

    /* =======================
     * UI: 자세 토글 (서 있음 ↔ 상반신만)
     * ======================= */
    (function makePoseToggleUI() {
      const ui = document.createElement('div');
      Object.assign(ui.style, {
        position: 'fixed', bottom: '12px', left: '12px', zIndex: 9999 as any,
        background: 'rgba(20,22,32,0.9)', color: '#fff',
        padding: '8px 12px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)'
      });
      const btn = document.createElement('button');
      btn.textContent = "현재: 서 있는 자세";
      Object.assign(btn.style, {
        padding: '6px 12px', cursor: 'pointer',
        borderRadius: '8px', border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600
      } as any);
      btn.onmouseenter = () => btn.style.background = 'rgba(255,255,255,0.14)';
      btn.onmouseleave = () => btn.style.background = 'rgba(255,255,255,0.08)';
      btn.onclick = () => {
        poseMode = (poseMode === "stand") ? "upper" : "stand";
        btn.textContent = "현재: " + (poseMode === "stand" ? "서 있는 자세" : "상반신만(0~12)");
        applyVisibilityForMode(poseMode);
      };
      ui.appendChild(btn);
      document.body.appendChild(ui);
    })();

    /* ====== 클린업 ====== */
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      controls.dispose();
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // 렌더 타겟 컨테이너
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', overflow: 'hidden' }} />
  );
}

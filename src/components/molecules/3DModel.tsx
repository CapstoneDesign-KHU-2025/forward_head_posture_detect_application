'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* ========= TypeScript 보강 타입 ========= */
type Landmark = { x: number; y: number; z: number; visibility?: number; presence?: number };
type PoseResult = { landmarks?: Landmark[]; worldLandmarks?: Landmark[] };
type BodyOpts = {
  useWorld?: boolean;
  yFlip?: boolean;
  zFlip?: boolean;
  scale?: number;
  recenter?: boolean;
  offset?: { x: number; y: number; z: number };
  snapToGround?: boolean;
  groundY?: number;
  groundPadding?: number;
};
type PoseMode = 'stand' | 'upper';

declare global {
  interface Window {
    setIdealNeckAngle?: (deg: number) => void;
    setBodyFromMediapipe?: (landmarksOrResult: PoseResult | Landmark[], opts?: BodyOpts) => void;
    setHeadLandmarks?: (arr: Landmark[]) => void;
    setHeadFromMediapipe?: (
      landmarksOrResult: PoseResult | Landmark[],
      opts?: { useWorld?: boolean; zFlip?: boolean; scale?: number }
    ) => void;
    __anglePanel?: { set?: (absDeg: number, deltaDeg: number, idealDeg: number) => void };
    SAMPLE_MP?: PoseResult;
    LAST_MP_RESULT?: PoseResult;
  }
}

export default function ThreeDModel() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    /* =======================
     * Scene / Camera / Renderer
     * ======================= */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202230);

    const camera = new THREE.PerspectiveCamera(
      70,
      (containerRef.current.clientWidth || 1) / (containerRef.current.clientHeight || 1),
      0.05,
      200
    );
    camera.position.set(3.0, 1.45, 0.01);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth || window.innerWidth,
      containerRef.current.clientHeight || window.innerHeight
    );
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    containerRef.current.appendChild(renderer.domElement);

    // === Canvas가 드래그/제스처 이벤트를 직접 받도록 보장 ===
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.touchAction = 'none'; // 터치/트랙패드 제스처 방지
    renderer.domElement.oncontextmenu = (e) => e.preventDefault(); // 우클릭 메뉴 차단

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
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
    const BODY_CONNECTIONS: Array<[number, number]> = [
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [11, 12],
      [11, 23],
      [12, 24],
      [23, 24],
      [23, 25],
      [25, 27],
      [27, 29],
      [29, 31],
      [24, 26],
      [26, 28],
      [28, 30],
      [30, 32],
    ];
    const HEAD_CONNECTIONS: Array<[number, number]> = [
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [1, 0],
      [0, 4],
      [7, 1],
      [8, 4],
      [9, 0],
      [10, 0],
      [11, 0],
      [12, 0],
    ];
    const POSE_CONNECTIONS = [...BODY_CONNECTIONS, ...HEAD_CONNECTIONS];

    /* =======================
     * Index aliases
     * ======================= */
    const IDX = {
      NOSE: 0,
      L_EYE_IN: 1,
      L_EYE: 2,
      L_EYE_OUT: 3,
      R_EYE_IN: 4,
      R_EYE: 5,
      R_EYE_OUT: 6,
      L_EAR: 7,
      R_EAR: 8,
      MOUTH_L: 9,
      MOUTH_R: 10,
      L_SHOULDER: 11,
      R_SHOULDER: 12,
      L_ELBOW: 13,
      R_ELBOW: 14,
      L_WRIST: 15,
      R_WRIST: 16,
      L_PINKY: 17,
      R_PINKY: 18,
      L_INDEX: 19,
      R_INDEX: 20,
      L_THUMB: 21,
      R_THUMB: 22,
      L_HIP: 23,
      R_HIP: 24,
      L_KNEE: 25,
      R_KNEE: 26,
      L_ANKLE: 27,
      R_ANKLE: 28,
      L_HEEL: 29,
      R_HEEL: 30,
      L_FOOT: 31,
      R_FOOT: 32,
    } as const;

    // 하체 인덱스(골반~발) 전부
    const LOWER_SET = new Set<number>([23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
    /* 숨길 포인트(손가락) */
    const HIDE_INDICES = new Set<number>([13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);

    /* =======================
     * Visualization options
     * ======================= */
    const BODY_SCALE = 1.15;
    const HEAD_SCALE = 1.35;
    const HEAD_POINT_SCALE = 1.1;
    const BODY_POINT_SCALE = 0.95;

    const ANGLE_SMOOTH_ALPHA = 0.2;
    const POINT_SMOOTH_ALPHA = 0.3;

    let IDEAL_NECK_ANGLE_DEG = 52;
    window.setIdealNeckAngle = (deg: number) => {
      IDEAL_NECK_ANGLE_DEG = Number(deg) || 0;
    };

    /* Grid + Bounds */
    scene.add(new THREE.GridHelper(40, 40, 0x555566, 0x333344));
    const BOUNDS = { xMin: -5, xMax: 5, zMin: -5, zMax: 5, edgeMargin: 0.8 };
    (function drawBounds() {
      const w = BOUNDS.xMax - BOUNDS.xMin;
      const d = BOUNDS.zMax - BOUNDS.zMin;
      const geo = new THREE.BoxGeometry(w, 0.001, d);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x4444aa,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((BOUNDS.xMin + BOUNDS.xMax) / 2, 0, (BOUNDS.zMin + BOUNDS.zMax) / 2);
      scene.add(mesh);
    })();

    /* Joints / Lines */
    const jointSpheres: Array<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>> = [];
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

    /* Guides & Angle label */
    const guideMat = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 5, transparent: false, opacity: 1.0 });
    const guideGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const guideLine = new THREE.Line(guideGeom, guideMat);
    scene.add(guideLine);

    const upRefMat = new THREE.LineBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.95 });
    const upRefGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const upRefLine = new THREE.Line(upRefGeom, upRefMat);
    scene.add(upRefLine);

    function makeTextSprite(text: string): THREE.Sprite {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(mat);
      const aspect = canvas.width / canvas.height;
      sprite.scale.set(0.6 * aspect, 0.6, 1);
      (sprite.userData as any) = { canvas, context: ctx, texture: tex };
      updateSpriteText(sprite, text);
      return sprite;
    }

    function updateSpriteText(sprite: THREE.Sprite, text: string): void {
      const { canvas, context, texture } = sprite.userData as {
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;
        texture: THREE.CanvasTexture;
      };
      const ctx = context;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const [line1, line2] = text.split('\n');
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 8;
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.strokeText(line1, canvas.width / 2, canvas.height / 2 - 40);
      ctx.fillText(line1, canvas.width / 2, canvas.height / 2 - 40);
      if (line2) {
        ctx.strokeText(line2, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(line2, canvas.width / 2, canvas.height / 2 + 40);
      }
      texture.needsUpdate = true;
    }

    const angleSprite = makeTextSprite(`0° (ideal ${IDEAL_NECK_ANGLE_DEG}°)\nΔ 0°`);
    scene.add(angleSprite);

    /* Pose mode */
    let poseMode: PoseMode = 'stand';
    const pose: THREE.Vector3[] = new Array(33).fill(0).map(() => new THREE.Vector3(0, 0, 0));

    function applyVisibilityForMode(mode: PoseMode): void {
      const hideLower = mode === 'upper';

      // 0~32 모두 순회해 모드에 맞게 보이기/숨기기
      for (let i = 0; i <= 32; i++) {
        const isLower = LOWER_SET.has(i);
        const wantVisible =
          !HIDE_INDICES.has(i) && // 손가락 숨김 유지
          (!hideLower || !isLower); // 상반신 모드면 하체 숨김

        jointSpheres[i].visible = wantVisible;

        // 숨긴 조인트는 화면 밖으로 밀어둠
        if (!wantVisible) {
          jointSpheres[i].position.set(0, -9999, 0);
        }
      }
    }

    applyVisibilityForMode(poseMode);

    /* Base pose */
    function applyBasePose(mode: PoseMode = 'stand'): void {
      const shoulderHalf = 0.22,
        hipHalf = 0.14;
      if (mode === 'stand') {
        const shoulderY = 1.45,
          hipY = 1.0,
          kneeY = 0.55,
          ankleY = 0.1;
        pose[IDX.L_SHOULDER].set(-shoulderHalf, shoulderY, 0);
        pose[IDX.R_SHOULDER].set(+shoulderHalf, shoulderY, 0);
        pose[IDX.L_ELBOW].set(-(shoulderHalf + 0.3), shoulderY - 0.22, 0);
        pose[IDX.R_ELBOW].set(+(shoulderHalf + 0.3), shoulderY - 0.22, 0);
        pose[IDX.L_WRIST].set(-(shoulderHalf + 0.5), shoulderY - 0.4, 0);
        pose[IDX.R_WRIST].set(+(shoulderHalf + 0.5), shoulderY - 0.4, 0);
        pose[IDX.L_HIP].set(-hipHalf, hipY, 0);
        pose[IDX.R_HIP].set(+hipHalf, hipY, 0);
        pose[IDX.L_KNEE].set(-hipHalf, kneeY, 0);
        pose[IDX.R_KNEE].set(+hipHalf, kneeY, 0);
        pose[IDX.L_ANKLE].set(-hipHalf, ankleY, 0);
        pose[IDX.R_ANKLE].set(+hipHalf, ankleY, 0);
        pose[IDX.L_HEEL].set(-hipHalf, ankleY - 0.02, -0.05);
        pose[IDX.R_HEEL].set(+hipHalf, ankleY - 0.02, -0.05);
        pose[IDX.L_FOOT].set(-hipHalf, ankleY - 0.01, 0.1);
        pose[IDX.R_FOOT].set(+hipHalf, ankleY - 0.01, 0.1);
        for (let i = 0; i <= 10; i++) pose[i].set(0, shoulderY + 0.2, 0);
      } else {
        const shoulderY = 1.45,
          shoulderZ = 0.0;
        pose[IDX.L_SHOULDER].set(-shoulderHalf, shoulderY, shoulderZ);
        pose[IDX.R_SHOULDER].set(+shoulderHalf, shoulderY, shoulderZ);
        pose[IDX.L_ELBOW].set(-(shoulderHalf + 0.25), shoulderY - 0.2, 0.03);
        pose[IDX.R_ELBOW].set(+(shoulderHalf + 0.25), shoulderY - 0.2, 0.03);
        pose[IDX.L_WRIST].set(-(shoulderHalf + 0.42), shoulderY - 0.38, 0.02);
        pose[IDX.R_WRIST].set(+(shoulderHalf + 0.42), shoulderY - 0.38, 0.02);
        const hipY = 0.9,
          hipZ = 0.0,
          hipHalf2 = 0.14;
        pose[IDX.L_HIP].set(-hipHalf2, hipY, hipZ);
        pose[IDX.R_HIP].set(+hipHalf2, hipY, hipZ);
        pose[IDX.L_KNEE].set(-hipHalf2, hipY - 0.05, hipZ);
        pose[IDX.R_KNEE].set(+hipHalf2, hipY - 0.05, hipZ);
        pose[IDX.L_ANKLE].set(-hipHalf2, hipY - 0.1, hipZ);
        pose[IDX.R_ANKLE].set(+hipHalf2, hipY - 0.1, hipZ);
        pose[IDX.L_HEEL].set(-hipHalf2, hipY - 0.12, hipZ);
        pose[IDX.R_HEEL].set(+hipHalf2, hipY - 0.12, hipZ);
        pose[IDX.L_FOOT].set(-hipHalf2, hipY - 0.12, hipZ);
        pose[IDX.R_FOOT].set(+hipHalf2, hipY - 0.12, hipZ);
        for (let i = 0; i <= 10; i++) pose[i].set(0, shoulderY + 0.2, shoulderZ);
      }
    }

    /* 외부 포즈 입력 */
    let useExternalPose = false;
    let externalPoseProvider: (() => THREE.Vector3[]) | null = null;

    window.setBodyFromMediapipe = (landmarksOrResult: PoseResult | Landmark[], opts: BodyOpts = {}): void => {
      const {
        useWorld = true,
        yFlip = true,
        zFlip = true,
        scale = 1.0,
        recenter = true,
        offset = { x: 0, y: 0, z: 0 },
        snapToGround = true,
        groundY = 0,
        groundPadding = 0.0,
      } = opts;

      // 전환 직후 자국 방지
      applyVisibilityForMode(poseMode);
      for (let i = 0; i <= 32; i++) {
        if (!jointSpheres[i].visible) jointSpheres[i].position.set(0, -9999, 0);
      }
      lineMesh.geometry.setFromPoints([]);
      angleSmoothed = null;

      let lm: Landmark[] | null = null;
      if (Array.isArray(landmarksOrResult)) {
        lm = landmarksOrResult;
      } else if (landmarksOrResult && typeof landmarksOrResult === 'object') {
        if (useWorld && Array.isArray(landmarksOrResult.worldLandmarks)) lm = landmarksOrResult.worldLandmarks!;
        else if (Array.isArray(landmarksOrResult.landmarks)) lm = landmarksOrResult.landmarks!;
      }
      if (!lm || lm.length < 33) {
        console.warn('33 landmarks 필요');
        return;
      }

      const lHip = lm[IDX.L_HIP],
        rHip = lm[IDX.R_HIP];
      const root =
        lHip && rHip
          ? { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2, z: (lHip.z + rHip.z) / 2 }
          : { x: lm[0].x, y: lm[0].y, z: lm[0].z };

      const arr: THREE.Vector3[] = [];
      for (let i = 0; i < 33; i++) {
        const p = lm[i] || { x: 0, y: 0, z: 0 };
        let x = p.x,
          y = p.y,
          z = p.z;
        if (recenter) {
          x -= root.x;
          y -= root.y;
          z -= root.z;
        }
        if (yFlip) y = -y;
        if (zFlip) z = -z;
        x *= scale;
        y *= scale;
        z *= scale;
        x += offset.x;
        y += offset.y;
        z += offset.z;
        arr.push(new THREE.Vector3(x, y, z));
      }

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
          if (Math.abs(dy) > 1e-9) for (let i = 0; i < 33; i++) arr[i].y -= dy;
        }
      }

      externalPoseProvider = () => arr;
      useExternalPose = true;

      // --- 전환 잔상 제거 + 즉시 갱신 ---
        applyVisibilityForMode(poseMode);
        for (let i = 0; i <= 32; i++) {
        const p = arr[i];
        jointSpheres[i].position.copy(p);            // 새 좌표 즉시 반영
        if (!jointSpheres[i].visible) jointSpheres[i].position.set(0, -9999, 0);
        }
        clearLineMesh();                                // 이전 라인 버퍼 완전 제거
        rebuildLinesNow();                              // 새 라인 즉시 생성
        angleSmoothed = null;


      // 전환-한프레임 깜빡임/자국 방지
      applyVisibilityForMode(poseMode);
      for (let i = 0; i <= 32; i++) {
        if (!jointSpheres[i].visible) jointSpheres[i].position.set(0, -9999, 0);
      }
      lineMesh.geometry.setFromPoints([]);
      angleSmoothed = null;
    };

    /* Head provider (neck-local, 0..10) */
    let headProvider: (t: number) => THREE.Vector3[] = (_t: number) => {
      const FACE_SPREAD = 1.25;
      const pts: Record<number, THREE.Vector3> = {
        [IDX.NOSE]: new THREE.Vector3(0, 0.02, 0.09),
        [IDX.L_EYE_IN]: new THREE.Vector3(-0.022, 0.038, 0.07),
        [IDX.L_EYE]: new THREE.Vector3(-0.04, 0.04, 0.065),
        [IDX.L_EYE_OUT]: new THREE.Vector3(-0.06, 0.038, 0.055),
        [IDX.R_EYE_IN]: new THREE.Vector3(0.022, 0.038, 0.07),
        [IDX.R_EYE]: new THREE.Vector3(0.04, 0.04, 0.065),
        [IDX.R_EYE_OUT]: new THREE.Vector3(0.06, 0.038, 0.055),
        [IDX.L_EAR]: new THREE.Vector3(-0.095, 0.02, 0.0),
        [IDX.R_EAR]: new THREE.Vector3(0.095, 0.02, 0.0),
        [IDX.MOUTH_L]: new THREE.Vector3(-0.035, -0.006, 0.068),
        [IDX.MOUTH_R]: new THREE.Vector3(0.035, -0.006, 0.068),
      };
      const arr = new Array(11).fill(0).map(() => new THREE.Vector3());
      for (let k = 0; k <= 10; k++) {
        const v = (pts[k] ?? new THREE.Vector3(0, 0, 0)).multiplyScalar(FACE_SPREAD);
        arr[k].copy(v);
      }
      return arr;
    };

    /* Smoothing state */
    let angleSmoothed: number | null = null;
    let earMidSmooth: THREE.Vector3 | null = null;
    let shoulderMidSmooth: THREE.Vector3 | null = null;

    // =============================
// 자국 제거 / 라인 즉시 재빌드 유틸
// =============================
function clearLineMesh() {
  lineMesh.geometry.dispose();
  lineMesh.geometry = new THREE.BufferGeometry();
}

    function rebuildLinesNow() {
    const pts: THREE.Vector3[] = [];
    const activeConnections =
        poseMode === 'upper'
        ? POSE_CONNECTIONS.filter(([a,b]) => !LOWER_SET.has(a) && !LOWER_SET.has(b))
        : POSE_CONNECTIONS;

    for (const [a,b] of activeConnections) {
        if (HIDE_INDICES.has(a) || HIDE_INDICES.has(b)) continue;
        if (!jointSpheres[a].visible || !jointSpheres[b].visible) continue;
        pts.push(jointSpheres[a].position, jointSpheres[b].position);
    }
    lineMesh.geometry.setFromPoints(pts);
    }


    /* Per-frame update */
    function updateFrame(t: number, dt: number): void {
      const BODY_SCALE = 1.15;
      const HEAD_SCALE = 1.35;

      if (useExternalPose && typeof externalPoseProvider === 'function') {
        const ext = externalPoseProvider();
        if (Array.isArray(ext) && ext.length >= 33) {
          for (let i = 0; i < 33; i++) jointSpheres[i].position.copy(ext[i]);
        }
      } else {
        applyBasePose(poseMode);
        const neckLocal = new THREE.Vector3(
          (pose[IDX.L_SHOULDER].x + pose[IDX.R_SHOULDER].x) / 2,
          (pose[IDX.L_SHOULDER].y + pose[IDX.R_SHOULDER].y) / 2 + 0.06,
          (pose[IDX.L_SHOULDER].z + pose[IDX.R_SHOULDER].z) / 2
        );
        const headLocal = headProvider(t);
        for (let k = 0; k <= 10; k++) pose[k].copy(neckLocal).add(headLocal[k]);

        const rootLocal = new THREE.Vector3(
          (pose[IDX.L_HIP].x + pose[IDX.R_HIP].x) / 2,
          (pose[IDX.L_HIP].y + pose[IDX.R_HIP].y) / 2,
          (pose[IDX.L_HIP].z + pose[IDX.R_HIP].z) / 2
        );
        for (let i = 0; i < 33; i++) {
          const pLocal = pose[i].clone();
          if (i <= 10) pLocal.sub(neckLocal).multiplyScalar(HEAD_SCALE).add(neckLocal);
          else pLocal.sub(rootLocal).multiplyScalar(BODY_SCALE).add(rootLocal);
          jointSpheres[i].position.copy(pLocal);
        }
      }

      applyVisibilityForMode(poseMode);

      const lSh = jointSpheres[IDX.L_SHOULDER].position;
      const rSh = jointSpheres[IDX.R_SHOULDER].position;
      const lEar = jointSpheres[IDX.L_EAR].position;
      const rEar = jointSpheres[IDX.R_EAR].position;

      const shoulderMidWorld = lSh.clone().add(rSh).multiplyScalar(0.5);
      const earMidWorld = lEar.clone().add(rEar).multiplyScalar(0.5);

      earMidSmooth = earMidSmooth ? earMidSmooth.lerp(earMidWorld, POINT_SMOOTH_ALPHA) : earMidWorld.clone();
      shoulderMidSmooth = shoulderMidSmooth
        ? shoulderMidSmooth.lerp(shoulderMidWorld, POINT_SMOOTH_ALPHA)
        : shoulderMidWorld.clone();

      const shoulderAxis = rSh.clone().sub(lSh).normalize();
      const upWorld = new THREE.Vector3(0, 1, 0);

      const upOnPlane = upWorld.clone().sub(shoulderAxis.clone().multiplyScalar(upWorld.dot(shoulderAxis)));
      if (upOnPlane.lengthSq() < 1e-9) upOnPlane.set(0, 1e-6, 0);
      upOnPlane.normalize();

      const rightLike = new THREE.Vector3().crossVectors(shoulderAxis, upOnPlane);
      let forward = new THREE.Vector3().crossVectors(rightLike, shoulderAxis);
      if (forward.lengthSq() < 1e-9) forward.set(0, 0, 1);
      forward.normalize();

      let yellowVec = earMidSmooth.clone().sub(shoulderMidSmooth);
      yellowVec.sub(shoulderAxis.clone().multiplyScalar(yellowVec.dot(shoulderAxis)));
      if (yellowVec.lengthSq() < 1e-9) yellowVec.copy(upOnPlane);
      yellowVec.normalize();

      const theta = THREE.MathUtils.degToRad(IDEAL_NECK_ANGLE_DEG);
      let whiteVec = new THREE.Vector3(0, Math.sin(theta), Math.cos(theta)).normalize();
      let whiteOnPlane = whiteVec.clone().sub(shoulderAxis.clone().multiplyScalar(whiteVec.dot(shoulderAxis)));
      if (whiteOnPlane.lengthSq() < 1e-9) whiteOnPlane.copy(upOnPlane);
      whiteOnPlane.normalize();

      const worldUp = new THREE.Vector3(0, 1, 0);
      const worldFwd = new THREE.Vector3(0, 0, 1);
      const yellowWorld = earMidSmooth.clone().sub(shoulderMidSmooth).normalize();
      const absYellowWorldDeg = Math.max(
        0,
        THREE.MathUtils.radToDeg(Math.atan2(yellowWorld.dot(worldUp), yellowWorld.dot(worldFwd)))
      );
      const deltaWorldInstant = absYellowWorldDeg - IDEAL_NECK_ANGLE_DEG;
      const deltaAbs = Math.abs(deltaWorldInstant);

      angleSmoothed =
        angleSmoothed == null ? deltaAbs : THREE.MathUtils.lerp(angleSmoothed, deltaAbs, ANGLE_SMOOTH_ALPHA);

      updateSpriteText(
        angleSprite,
        `${absYellowWorldDeg.toFixed(1)}° (ideal ${IDEAL_NECK_ANGLE_DEG.toFixed(0)}°)\nΔ ${angleSmoothed!.toFixed(
          1
        )}°`
      );
      window.__anglePanel?.set?.(absYellowWorldDeg, deltaAbs, IDEAL_NECK_ANGLE_DEG);
      angleSprite.position.copy(earMidSmooth.clone().add(new THREE.Vector3(0, 0.2, 0)));

      const guideLen = 0.7;
      const yellowEnd = shoulderMidSmooth.clone().add(yellowVec.clone().multiplyScalar(guideLen));
      guideLine.geometry.setFromPoints([shoulderMidSmooth, yellowEnd]);

      const whiteEnd = shoulderMidSmooth.clone().add(whiteOnPlane.clone().multiplyScalar(guideLen));
      upRefLine.geometry.setFromPoints([shoulderMidSmooth, whiteEnd]);

      const pts: THREE.Vector3[] = [];

      // 상반신 모드면 하체를 아예 안 그리는 동적 필터
      const activeConnections =
        poseMode === 'upper'
          ? POSE_CONNECTIONS.filter(([a, b]) => !LOWER_SET.has(a) && !LOWER_SET.has(b))
          : POSE_CONNECTIONS;

      for (const [a, b] of activeConnections) {
        if (HIDE_INDICES.has(a) || HIDE_INDICES.has(b)) continue;
        if (!jointSpheres[a].visible || !jointSpheres[b].visible) continue;
        pts.push(jointSpheres[a].position, jointSpheres[b].position);
      }

      lineMesh.geometry.setFromPoints(pts);
    }

    /* Loop */
    const clock = new THREE.Clock();
    let lastT = 0;
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = t - lastT;
      lastT = t;
      updateFrame(t, dt);
      controls.update();
      camera.lookAt(controls.target);
      renderer.render(scene, camera);
    };
    animate();

    /* (구) 머리만 API — 유지 */
    window.setHeadLandmarks = (arr: Landmark[]) => {
      if (!Array.isArray(arr) || arr.length < 11) return;
      const pts = arr.map((p) => new THREE.Vector3(p.x, p.y, p.z));
      useExternalPose = false;
      externalPoseProvider = null;
      headProvider = () => pts;
    };

    window.setHeadFromMediapipe = (
      landmarksOrResult: PoseResult | Landmark[],
      opts: { useWorld?: boolean; zFlip?: boolean; scale?: number } = {}
    ) => {
      const { useWorld = true, zFlip = true, scale = 1 } = opts;

      let lm: Landmark[] | null = null;
      if (Array.isArray(landmarksOrResult)) lm = landmarksOrResult;
      else if (landmarksOrResult && typeof landmarksOrResult === 'object') {
        if (useWorld && Array.isArray(landmarksOrResult.worldLandmarks)) lm = landmarksOrResult.worldLandmarks!;
        else if (Array.isArray(landmarksOrResult.landmarks)) lm = landmarksOrResult.landmarks!;
      }
      if (!lm || lm.length < 33) return;

      const lSh = lm[IDX.L_SHOULDER];
      const rSh = lm[IDX.R_SHOULDER];
      if (!lSh || !rSh) return;

      const neck = { x: (lSh.x + rSh.x) * 0.5, y: (lSh.y + rSh.y) * 0.5, z: (lSh.z + rSh.z) * 0.5 };

      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 10; i++) {
        const p = lm[i];
        if (!p) {
          pts.push(new THREE.Vector3(0, 0, 0));
          continue;
        }
        let x = (p.x - neck.x) * scale;
        let y = (p.y - neck.y) * scale;
        let z = (p.z - neck.z) * scale;
        if (zFlip) z = -z;
        pts.push(new THREE.Vector3(x, y, z));
      }

      useExternalPose = false;
      externalPoseProvider = null;
      headProvider = () => pts;
    };

    /* 샘플 MediaPipe 결과 */
    window.SAMPLE_MP = {
      landmarks: [
        { x: 0.5344623327255249, y: 0.4381331205368042, z: -2.0504345893859863 },
        { x: 0.578197181224823, y: 0.329526424407959, z: -1.9545238018035889 },
        { x: 0.607315719127655, y: 0.3274890184402466, z: -1.9544756412506104 },
        { x: 0.6346192359924316, y: 0.3260079622268677, z: -1.9535071849822998 },
        { x: 0.48420652747154236, y: 0.33621761202812195, z: -1.9527218341827393 },
        { x: 0.45205777883529663, y: 0.339145302772522, z: -1.9530613422393799 },
        { x: 0.4258602261543274, y: 0.3433015048503876, z: -1.9529097080230713 },
        { x: 0.682876706123352, y: 0.3583425283432007, z: -1.3177567720413208 },
        { x: 0.3998519480228424, y: 0.377156525850296, z: -1.3102575540542603 },
        { x: 0.5987958908081055, y: 0.5474404096603394, z: -1.8071632385253906 },
        { x: 0.4883880019187927, y: 0.5480131506919861, z: -1.8067207336425781 },
        { x: 0.9082999229431152, y: 0.8622617721557617, z: -0.9771121740341187 },
        { x: 0.2339840829372406, y: 0.8939523696899414, z: -0.9377877116203308 },
        { x: 1.0598008632659912, y: 1.4300646781921387, z: -1.1581965684890747 },
        { x: 0.11022641509771347, y: 1.5365948677062988, z: -1.3167239427566528 },
        { x: 1.0566918849945068, y: 1.88307523727417, z: -1.9541689157485962 },
        { x: 0.1586792767047882, y: 1.9163670539855957, z: -2.296396255493164 },
        { x: 1.1022355556488037, y: 2.0399177074432373, z: -2.163754940032959 },
        { x: 0.13920193910598755, y: 2.0716445446014404, z: -2.552614212036133 },
        { x: 1.0339287519454956, y: 2.0611376762390137, z: -2.277296781539917 },
        { x: 0.20519831776618958, y: 2.054564952850342, z: -2.6389150619506836 },
        { x: 1.002015233039856, y: 2.007009506225586, z: -2.0407845973968506 },
        { x: 0.22585558891296387, y: 1.9996609687805176, z: -2.3805015087127686 },
        { x: 0.8302753567695618, y: 1.9871139526367188, z: 0.051122188568115234 },
        { x: 0.39570415019989014, y: 2.014944553375244, z: -0.037289053201675415 },
        { x: 0.8327456712722778, y: 2.898559808731079, z: -0.09401891380548477 },
        { x: 0.43382859230041504, y: 2.9152002334594727, z: -0.13983774185180664 },
        { x: 0.8324098587036133, y: 3.72046160697937, z: 1.0118640661239624 },
        { x: 0.4450617730617523, y: 3.695319175720215, z: 0.7039086222648621 },
        { x: 0.8396326899528503, y: 3.8574228286743164, z: 1.1249027252197266 },
        { x: 0.44315552711486816, y: 3.8161065578460693, z: 0.7778902649879456 },
        { x: 0.7843129634857178, y: 3.995889186859131, z: 0.553639829158783 },
        { x: 0.5013456344604492, y: 3.973928928375244, z: 0.15865787863731384 },
      ],
      worldLandmarks: [
        { x: -0.012, y: -0.451, z: -0.521 },
        { x: 0.011, y: -0.482, z: -0.498 },
        { x: 0.021, y: -0.483, z: -0.498 },
        { x: 0.032, y: -0.484, z: -0.498 },
        { x: -0.025, y: -0.481, z: -0.501 },
        { x: -0.035, y: -0.482, z: -0.501 },
        { x: -0.045, y: -0.483, z: -0.501 },
        { x: 0.051, y: -0.461, z: -0.461 },
        { x: -0.061, y: -0.46, z: -0.465 },
        { x: 0.018, y: -0.411, z: -0.445 },
        { x: -0.008, y: -0.41, z: -0.449 },
        { x: 0.215, y: -0.153, z: -0.312 },
        { x: -0.211, y: -0.149, z: -0.325 },
        { x: 0.281, y: 0.051, z: -0.251 },
        { x: -0.291, y: 0.059, z: -0.269 },
        { x: 0.321, y: 0.251, z: -0.301 },
        { x: -0.341, y: 0.261, z: -0.321 },
        { x: 0.345, y: 0.341, z: -0.354 },
        { x: -0.365, y: 0.351, z: -0.376 },
        { x: 0.341, y: 0.356, z: -0.349 },
        { x: -0.361, y: 0.365, z: -0.371 },
        { x: 0.301, y: 0.34, z: -0.311 },
        { x: -0.321, y: 0.352, z: -0.332 },
        { x: 0.151, y: 0.481, z: -0.221 },
        { x: -0.141, y: 0.485, z: -0.234 },
        { x: 0.181, y: 0.751, z: -0.288 },
        { x: -0.171, y: 0.761, z: -0.301 },
        { x: 0.201, y: 0.881, z: -0.341 },
        { x: -0.191, y: 0.891, z: -0.358 },
        { x: 0.198, y: 0.901, z: -0.337 },
        { x: -0.188, y: 0.911, z: -0.353 },
        { x: 0.175, y: 0.915, z: -0.401 },
        { x: -0.165, y: 0.922, z: -0.415 },
      ],
    };

    /* Resize */
    const onResize = () => {
      if (!containerRef.current) return;
      camera.aspect = (containerRef.current.clientWidth || 1) / (containerRef.current.clientHeight || 1);
      camera.near = 0.01;
      camera.far = 500;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth || window.innerWidth,
        containerRef.current.clientHeight || window.innerHeight
      );
    };
    window.addEventListener('resize', onResize);

    /* landmarks/worldLandmarks 토글 UI + 우측 패널 */
    (function makeLMToggleUI() {
      const ui = document.createElement('div');
      Object.assign(ui.style, {
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 2,
        background: 'rgba(20,22,32,0.9)',
        color: '#fff',
        fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial',
        padding: '8px 10px',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
      });

      window.__anglePanel = (() => {
        const ui2 = document.createElement('div');
        Object.assign(ui2.style, {
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 2,
          background: 'rgba(20,22,32,0.9)',
          color: '#fff',
          fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial',
          padding: '10px 12px',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
          minWidth: '180px',
        });
        const title = document.createElement('div');
        title.textContent = 'Neck Angle';
        Object.assign(title.style, { fontWeight: '700', marginBottom: '6px', opacity: 0.9 });
        const absLine = document.createElement('div');
        const deltaLine = document.createElement('div');
        const idealLine = document.createElement('div');
        Object.assign(absLine.style, { fontSize: '14px', marginTop: '2px' });
        Object.assign(deltaLine.style, { fontSize: '14px', marginTop: '2px' });
        Object.assign(idealLine.style, { fontSize: '12px', marginTop: '6px', opacity: 0.8 });
        ui2.append(title, absLine, deltaLine, idealLine);
        containerRef.current!.appendChild(ui2);
        return {
          set(absDeg: number, deltaDeg: number, idealDeg: number) {
            absLine.textContent = `Absolute: ${absDeg.toFixed(1)}°`;
            deltaLine.textContent = `Δ vs Ideal: ${deltaDeg.toFixed(1)}°`;
            idealLine.textContent = `Ideal: ${idealDeg.toFixed(1)}°`;
            const warn =
              Math.abs(deltaDeg) >= 15
                ? 'rgba(255,120,120,0.9)'
                : Math.abs(deltaDeg) >= 8
                ? 'rgba(255,200,120,0.9)'
                : 'rgba(255,255,255,0.95)';
            (deltaLine.style as any).color = warn;
          },
        };
      })();

      const mkBtn = (t: string) => {
        const b = document.createElement('button');
        b.textContent = t;
        Object.assign(b.style, {
          marginRight: '6px',
          padding: '6px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 600,
        });
        b.onmouseenter = () => (b.style.background = 'rgba(255,255,255,0.14)');
        b.onmouseleave = () =>
          (b.style.background =
            (b as any).dataset.active === '1' ? 'rgba(0,255,226,0.25)' : 'rgba(255,255,255,0.08)');
        return b;
      };
      const setActive = (btn: HTMLButtonElement, on: boolean) => {
        (btn as any).dataset.active = on ? '1' : '0';
        btn.style.background = on ? 'rgba(0,255,226,0.25)' : 'rgba(255,255,255,0.08)';
        btn.style.borderColor = on ? 'rgba(0,255,226,0.55)' : 'rgba(255,255,255,0.18)';
      };
      const btnWorld = mkBtn('worldLandmarks') as HTMLButtonElement;
      const btnImg = mkBtn('landmarks') as HTMLButtonElement;
      ui.append(btnWorld, btnImg);
      containerRef.current!.appendChild(ui);

      function apply(useWorld: boolean) {
        const src = window.LAST_MP_RESULT || window.SAMPLE_MP;
        if (!src) {
          console.warn('SAMPLE_MP 또는 LAST_MP_RESULT가 필요합니다.');
          return;
        }
        const lm = useWorld ? (src.worldLandmarks || src.landmarks) : src.landmarks;
        if (!Array.isArray(lm) || lm.length < 33) {
          console.warn('landmarks 길이가 부족합니다.');
          return;
        }

        window.setBodyFromMediapipe?.(
          { landmarks: src.landmarks, worldLandmarks: src.worldLandmarks },
          {
            useWorld: !!useWorld,
            yFlip: true,
            zFlip: true,
            scale: 1.0,
            recenter: true,
            offset: { x: 0, y: 1.0, z: 0 },
            snapToGround: true,
            groundY: 0,
            groundPadding: 0.0,
          }
        );
        // --- 토글 전환 후 잔상 제거 ---
        applyVisibilityForMode(poseMode);
        for (let i = 0; i <= 32; i++) {
        if (!jointSpheres[i].visible) jointSpheres[i].position.set(0, -9999, 0);
        }
        clearLineMesh();
        rebuildLinesNow();
        angleSmoothed = null;


        setActive(btnWorld, useWorld);
        setActive(btnImg, !useWorld);
      }

      btnWorld.onclick = () => apply(true);
      btnImg.onclick = () => apply(false);
      apply(true);
    })();

    /* 자세 토글 UI */
    (function makePoseToggleUI() {
      const ui = document.createElement('div');
      Object.assign(ui.style, {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 2,
        background: 'rgba(20,22,32,0.9)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(6px)',
      });
      const btn = document.createElement('button');
      btn.textContent = '현재: 서 있는 자세';
      Object.assign(btn.style, {
        padding: '6px 12px',
        cursor: 'pointer',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        fontWeight: 600,
      });
      btn.onmouseenter = () => (btn.style.background = 'rgba(255,255,255,0.14)');
      btn.onmouseleave = () => (btn.style.background = 'rgba(255,255,255,0.08)');
      btn.onclick = () => {
        poseMode = poseMode === 'stand' ? 'upper' : 'stand';
        btn.textContent = '현재: ' + (poseMode === 'stand' ? '서 있는 자세' : '상반신만(0~12)');
        applyVisibilityForMode(poseMode);
      };
      ui.appendChild(btn);
      containerRef.current!.appendChild(ui);
    })();

    /* WASD 이동(팬) */
    const MOVE_BASE_SPEED = 1.5;
    const MOVE_FAST_MULT = 2.5;

    // 1) animate 전에 미리 초기화
    const pressed = new Set<string>();

    // 2) 키보드 팬 로직
    function applyKeyboardPan(dt: number) {
      if (pressed.size === 0) return;

      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(forward, up).normalize();

      const move = new THREE.Vector3();
      if (pressed.has('KeyW')) move.add(forward);
      if (pressed.has('KeyS')) move.sub(forward);
      if (pressed.has('KeyD')) move.add(right);
      if (pressed.has('KeyA')) move.sub(right);
      if (pressed.has('KeyE')) move.add(up);
      if (pressed.has('KeyQ')) move.sub(up);

      if (move.lengthSq() === 0) return;
      move.normalize();

      const speed =
        MOVE_BASE_SPEED * ((pressed.has('ShiftLeft') || pressed.has('ShiftRight')) ? MOVE_FAST_MULT : 1);

      camera.position.addScaledVector(move, speed * dt);
      controls.target.addScaledVector(move, speed * dt);
    }

    // 3) 이벤트 핸들러
    const keydown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement as HTMLElement | null)?.tagName ?? ''))
        return;
      pressed.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    };
    const keyup = (e: KeyboardEvent) => {
      pressed.delete(e.code);
    };

    // 4) 리스너 등록
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);

    /* Cleanup */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      try {
        containerRef.current?.removeChild(renderer.domElement);
      } catch {}
      Array.from(containerRef.current?.children || []).forEach((el) => {
        if (el !== renderer.domElement) el.remove();
      });
      renderer.dispose();
      sphereGeom.dispose();
      lineGeom.dispose();
      guideLine.geometry.dispose();
      upRefLine.geometry.dispose();
      jointMat.dispose();
      lineMaterial.dispose();
      guideMat.dispose();
      upRefMat.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} />;
}

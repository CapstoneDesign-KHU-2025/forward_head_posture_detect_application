'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/* ========= TypeScript 타입 ========= */
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

// 공통 mixer (현재 모드에 따라 mixerUpper / mixerFull 중 하나를 가리킴)
let mixer: THREE.AnimationMixer | null = null;
let idleAction: THREE.AnimationAction | null = null;

// Idle / Walking 따로
let mixerUpper: THREE.AnimationMixer | null = null;  // Idle.fbx용
let mixerFull: THREE.AnimationMixer | null = null;   // Walking.fbx용
let remUpper: THREE.Object3D | null = null;          // Idle.fbx 오브젝트
let remFull: THREE.Object3D | null = null;           // Walking.fbx 오브젝트

// ★ 여기 두 개 숫자만 수정
const INITIAL_IDEAL_NECK_ANGLE_DEG = 52;  // 기준(거북목 기준) 각도
const INITIAL_USER_NECK_ANGLE_DEG = 85;   // 사용자 실제 목 각도

declare global {
  interface Window {
    setIdealNeckAngle?: (deg: number) => void;
    setUserNeckAngle?: (deg: number) => void;
    setBodyFromMediapipe?: (landmarksOrResult: PoseResult | Landmark[], opts?: BodyOpts) => void;
    setHeadLandmarks?: (arr: Landmark[]) => void;
    setHeadFromMediapipe?: (
      landmarksOrResult: PoseResult | Landmark[],
      opts?: { useWorld?: boolean; zFlip?: boolean; scale?: number }
    ) => void;
    __anglePanel?: { set?: (absDeg: number, deltaDeg: number, idealDeg: number) => void };
    SAMPLE_MP?: PoseResult;
    LAST_MP_RESULT?: PoseResult;
    __REM?: THREE.Object3D;

    // 디버깅용(콘솔에서 카메라/컨트롤 확인)
    __CAMERA?: THREE.PerspectiveCamera;
    __CONTROLS?: OrbitControls;
  }
}

export default function ThreeDModel() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const currentContainer = containerRef.current;

    /* ======================= *
     * 인덱스/연결 정의
     * ======================= */
    const BODY_CONNECTIONS: Array<[number, number]> = [
      [11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [27, 29], [29, 31], [24, 26], [26, 28], [28, 30], [30, 32],
    ];
    const HEAD_CONNECTIONS: Array<[number, number]> = [
      [1, 2], [2, 3], [4, 5], [5, 6], [1, 0], [0, 4], [7, 1], [8, 4], [9, 0],
      [10, 0], [11, 0], [12, 0],
    ];
    const POSE_CONNECTIONS = [...BODY_CONNECTIONS, ...HEAD_CONNECTIONS];

    const IDX = {
      NOSE: 0, L_EYE_IN: 1, L_EYE: 2, L_EYE_OUT: 3, R_EYE_IN: 4, R_EYE: 5, R_EYE_OUT: 6,
      L_EAR: 7, R_EAR: 8, MOUTH_L: 9, MOUTH_R: 10, L_SHOULDER: 11, R_SHOULDER: 12,
      L_ELBOW: 13, R_ELBOW: 14, L_WRIST: 15, R_WRIST: 16, L_PINKY: 17, R_PINKY: 18,
      L_INDEX: 19, R_INDEX: 20, L_THUMB: 21, R_THUMB: 22, L_HIP: 23, R_HIP: 24,
      L_KNEE: 25, R_KNEE: 26, L_ANKLE: 27, R_ANKLE: 28, L_HEEL: 29, R_HEEL: 30,
      L_FOOT: 31, R_FOOT: 32,
    } as const;

    const LOWER_SET = new Set<number>([23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
    const HIDE_INDICES = new Set<number>([17, 18, 19, 20, 21, 22]); // 손가락 숨김

    /* ======================= *
     * 시각화 옵션
     * ======================= */
    const HEAD_POINT_SCALE = 1.1;
    const BODY_POINT_SCALE = 0.95;
    const ANGLE_SMOOTH_ALPHA = 0.2;
    let IDEAL_NECK_ANGLE_DEG = INITIAL_IDEAL_NECK_ANGLE_DEG;
    let USER_NECK_ANGLE_DEG = INITIAL_USER_NECK_ANGLE_DEG;
    const BOUNDS = { xMin: -5, xMax: 5, zMin: -5, zMax: 5 };

    // ★ 카메라 프리셋 (원하는 값으로 계속 수정 가능)
    // upper body (상반신) 뷰
    const CAMERA_UPPER_POS    = new THREE.Vector3(1.3, 3.5, 0.1);
    const CAMERA_UPPER_TARGET = new THREE.Vector3(0.1, 3.5, -0.2);

    // full body (전신) 뷰 – 지금 스샷 비슷하게 옆에서 보는 느낌
    const CAMERA_FULL_POS     = new THREE.Vector3(3.2, 3.2, -0.3);
    const CAMERA_FULL_TARGET  = new THREE.Vector3(0.1, 2.4, -0.5);

    /* ======================= *
     * Three.js 핵심 변수
     * ======================= */
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let clock: THREE.Clock;
    let rafId: number;

    // 점/선
    const jointSpheres: Array<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>> = [];
    let lineMesh: THREE.LineSegments;
    let guideLine: THREE.Line;
    let upRefLine: THREE.Line;
    let angleSprite: THREE.Sprite;

    /* ======================= *
     * 포즈 상태
     * ======================= */
    let poseMode: PoseMode = 'upper';
    const pose: THREE.Vector3[] = new Array(33).fill(0).map(() => new THREE.Vector3());
    let useExternalPose = false;
    let externalPoseProvider: (() => THREE.Vector3[]) | null = null;
    let headProvider: (t: number) => THREE.Vector3[] = createDefaultHeadProvider();

    let angleSmoothed: number | null = null;
    // 현재 활성 FBX 캐릭터에 붙는 목 기준선(노란/흰색) 관리
    let neckLines: { yellow: THREE.Line; white: THREE.Line } | null = null;

    const pressedKeys = new Set<string>();

    /* ======================= *
     * 유틸
     * ======================= */
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
      const { canvas, context, texture } = sprite.userData as any;
      const ctx = context as CanvasRenderingContext2D;
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
    function findBoneByRegex(root: THREE.Object3D, re: RegExp) {
      let found: THREE.Bone | undefined;
      root.traverse((o: any) => {
        if (found) return;
        if (o.isBone && re.test(o.name)) found = o as THREE.Bone;
      });
      return found;
    }
    function childDirInBind(bone: THREE.Bone) {
      const bw = new THREE.Vector3();
      bone.getWorldPosition(bw);
      const sum = new THREE.Vector3();
      let n = 0;
      for (const c of bone.children) {
        if ((c as any).isBone) {
          const cw = new THREE.Vector3();
          (c as THREE.Bone).getWorldPosition(cw);
          sum.add(cw.sub(bw));
          n++;
        }
      }
      if (n === 0) return new THREE.Vector3(0, 1, 0);
      return sum.multiplyScalar(1 / n).normalize();
    }

    /* ======================= *
     * 초기화
     * ======================= */
    function initSceneAndCamera() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x202230);

      camera = new THREE.PerspectiveCamera(
        70,
        (currentContainer.clientWidth || 1) / (currentContainer.clientHeight || 1),
        0.05,
        200
      );
      camera.position.copy(CAMERA_UPPER_POS);
    }
    function initRenderer() {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      currentContainer.appendChild(renderer.domElement);
    }
    function initLighting() {
      scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.6));
      const dir = new THREE.DirectionalLight(0xffffff, 1.1);
      dir.position.set(3, 6, 4);
      dir.castShadow = true;
      dir.shadow.mapSize.set(2048, 2048);
      dir.shadow.camera.near = 0.1;
      dir.shadow.camera.far = 50;
      scene.add(dir);
    }
    function initFloor() {
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshStandardMaterial({ color: 0x1a1e2a, metalness: 0, roughness: 1 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
    }
    function initControls() {
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.touchAction = 'none';
      renderer.domElement.oncontextmenu = (e) => e.preventDefault();

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.zoomSpeed = 1.4;
      controls.minDistance = 0.25;
      controls.maxDistance = 20;
      (controls as any).zoomToCursor = true;
      controls.rotateSpeed = 0.9;
      controls.target.copy(CAMERA_UPPER_TARGET);

      // ★ 콘솔에서 카메라 위치 쉽게 읽으려고 window에 등록
      (window as any).__CAMERA = camera;
      (window as any).__CONTROLS = controls;
    }
    function initHelpers() {
      scene.add(new THREE.GridHelper(40, 40, 0x555566, 0x333344));
      const w = BOUNDS.xMax - BOUNDS.xMin;
      const d = BOUNDS.zMax - BOUNDS.zMax + (BOUNDS.zMax - BOUNDS.zMin);
      // 위 줄은 z 크기 계산을 두 번 한 건데, 간단히 다시 계산
      const depth = BOUNDS.zMax - BOUNDS.zMin;

      const geo = new THREE.BoxGeometry(w, 0.001, depth);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x4444aa,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((BOUNDS.xMin + BOUNDS.xMax) / 2, 0, (BOUNDS.zMin + BOUNDS.zMax) / 2);
      scene.add(mesh);
    }

    // ★ FBX 공통 세팅 함수 (Idle / Walking 둘 다 여기 사용)
    function setupFBXCharacter(object: THREE.Object3D): THREE.AnimationMixer {
      object.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const m of mats) {
            if (m?.map) (m.map as any).colorSpace = THREE.SRGBColorSpace;
            m.side = THREE.DoubleSide;
            m.needsUpdate = true;
          }
        }
      });

      // 스케일/위치 마음에 안 들면 여기서 조정
      object.scale.setScalar(0.01);
      scene.add(object);

      const rig: Record<string, THREE.Bone | undefined> = {};
      rig.hips = findBoneByRegex(object, /(Hips|Pelvis)/i);
      rig.spine = findBoneByRegex(object, /(Spine|Spine1|Spine01)/i);
      rig.neck = findBoneByRegex(object, /(Neck)/i);
      rig.head = findBoneByRegex(object, /(Head)/i);
      rig.lShoulder = findBoneByRegex(object, /(LeftShoulder|Shoulder_L)/i);
      rig.rShoulder = findBoneByRegex(object, /(RightShoulder|Shoulder_R)/i);
      rig.lUpArm = findBoneByRegex(object, /(LeftArm|UpperArm_L|Arm_L)/i);
      rig.rUpArm = findBoneByRegex(object, /(RightArm|UpperArm_R|Arm_R)/i);
      object.userData.__rig = rig;

      const bindDirs = new Map<THREE.Bone, THREE.Vector3>();
      Object.values(rig).forEach((b) => {
        if (b) bindDirs.set(b, childDirInBind(b));
      });
      object.userData.__bindDirs = bindDirs;

      const bindWorldQ = new Map<THREE.Bone, THREE.Quaternion>();
      const bindAimY = new Map<THREE.Bone, THREE.Vector3>();
      const tmpQ = new THREE.Quaternion();
      const tmpV = new THREE.Vector3(0, 1, 0);
      Object.values(rig).forEach((b) => {
        if (!b) return;
        b.updateWorldMatrix(true, false);
        b.getWorldQuaternion(tmpQ);
        bindWorldQ.set(b, tmpQ.clone());
        bindAimY.set(b, tmpV.clone().applyQuaternion(tmpQ));
      });
      object.userData.__bindWorldQ = bindWorldQ;
      object.userData.__bindAimY = bindAimY;

      const localMixer = new THREE.AnimationMixer(object);
      const clips: THREE.AnimationClip[] = (object as any).animations || [];
      if (clips.length > 0) {
        const clip = clips[0];
        const action = localMixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.enabled = true;
        action.reset();
        action.play();
        localMixer.timeScale = 0.3;
        idleAction = action;
      } else {
        console.warn('FBX 내 애니메이션이 없습니다.');
      }

      return localMixer;
    }

    // ★ Idle.fbx(upper) + Walking.fbx(full) 둘 다 로드
    function loadCharacters() {
      const loader = new FBXLoader();

      // upper 모드용 Idle.fbx
      loader.load(
        '/models/Idle.fbx',
        (object) => {
          const localMixer = setupFBXCharacter(object);
          remUpper = object;
          mixerUpper = localMixer;

          // 처음에는 upper 모드가 기본
          window.__REM = object;
          mixer = localMixer;
          object.visible = true;
        },
        undefined,
        (e) => console.error('Idle.fbx load error:', e)
      );

      // full body 모드용 Walking.fbx
      loader.load(
        '/models/Walking.fbx',
        (object) => {
          const localMixer = setupFBXCharacter(object);
          remFull = object;
          mixerFull = localMixer;

          // 시작 때는 숨겨둠
          object.visible = false;

          // 위치/스케일 더 손보고 싶으면 여기서
          // object.position.set(0, 0, 0);
        },
        undefined,
        (e) => console.error('Walking.fbx load error:', e)
      );
    }

    function initPoseVisuals() {
      const sphereGeom = new THREE.SphereGeometry(0.026, 16, 16);
      const jointMat = new THREE.MeshBasicMaterial({
        color: 0xff77ff,
        transparent: true,
        opacity: 0.0,
      }); // 안 보이게

      for (let i = 0; i < 33; i++) {
        const m = new THREE.Mesh(sphereGeom, jointMat);
        m.visible = false; // 관절 숨김
        m.scale.setScalar(i <= 10 ? HEAD_POINT_SCALE : BODY_POINT_SCALE);
        scene.add(m);
        jointSpheres.push(m);
      }
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffe2 });
      const lineGeom = new THREE.BufferGeometry().setFromPoints(
        new Array(POSE_CONNECTIONS.length * 2).fill(0).map(() => new THREE.Vector3())
      );
      lineMesh = new THREE.LineSegments(lineGeom, lineMaterial);
      lineMesh.visible = false;
      scene.add(lineMesh);
    }

    function initAngleGuides() {
      const guideMat = new THREE.LineBasicMaterial({ color: 0xffff00 });
      guideLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        guideMat
      );
      guideLine.visible = false;
      scene.add(guideLine);

      const upRefMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
      });
      upRefLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        upRefMat
      );
      upRefLine.visible = false;
      scene.add(upRefLine);

      angleSprite = makeTextSprite(`0° (ideal ${IDEAL_NECK_ANGLE_DEG}°)\nΔ 0°`);
      angleSprite.visible = true;
      scene.add(angleSprite);
    }

    function initUI() {
      // 각도 패널(우하단)
      const anglePanel = document.createElement('div');
      Object.assign(anglePanel.style, {
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        zIndex: 3,
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
      anglePanel.append(title, absLine, deltaLine, idealLine);
      currentContainer.appendChild(anglePanel);
      window.__anglePanel = {
        set(absDeg: number, deltaDeg: number, idealDeg: number) {
          absLine.textContent = `Absolute: ${absDeg.toFixed(1)}°`;
          deltaLine.textContent = `Δ vs Ideal: ${deltaDeg.toFixed(1)}°`;
          idealLine.textContent = `Ideal: ${idealDeg.toFixed(1)}°`;
          (deltaLine.style as any).color =
            Math.abs(deltaDeg) >= 15
              ? 'rgba(255,120,120,0.9)'
              : Math.abs(deltaDeg) >= 8
              ? 'rgba(255,200,120,0.9)'
              : 'rgba(255,255,255,0.95)';
        },
      };

      // world/landmarks 토글(지금은 숨김)
      const srcPanel = document.createElement('div');
      Object.assign(srcPanel.style, {
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 3,
        background: 'rgba(20,22,32,0.9)',
        color: '#fff',
        padding: '8px 10px',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        backdropFilter: 'blur(6px)',
      });
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
            (b as any).dataset.active === '1'
              ? 'rgba(0,255,226,0.25)'
              : 'rgba(255,255,255,0.08)');
        return b;
      };
      const setActive = (btn: HTMLButtonElement, on: boolean) => {
        (btn as any).dataset.active = on ? '1' : '0';
        btn.style.background = on ? 'rgba(0,255,226,0.25)' : 'rgba(255,255,255,0.08)';
        btn.style.borderColor = on ? 'rgba(0,255,226,0.55)' : 'rgba(255,255,255,0.18)';
      };
      const btnWorld = mkBtn('worldLandmarks');
      const btnImg = mkBtn('landmarks');
      srcPanel.append(btnWorld, btnImg);
      currentContainer.appendChild(srcPanel);
      srcPanel.style.display = 'none';

      const applyLandmarkSource = (useWorld: boolean) => {
        const src = window.LAST_MP_RESULT || window.SAMPLE_MP;
        if (!src) return;
        window.setBodyFromMediapipe?.(
          { landmarks: src.landmarks, worldLandmarks: src.worldLandmarks },
          {
            useWorld,
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
        applyVisibilityForMode(poseMode);
        rebuildLinesNow();
        angleSmoothed = null;
        setActive(btnWorld, useWorld);
        setActive(btnImg, !useWorld);
      };
      btnWorld.onclick = () => applyLandmarkSource(true);
      btnImg.onclick = () => applyLandmarkSource(false);

      // full/upper 토글 (좌하단) – Upper body 버튼을 앞으로
      const modePanel = document.createElement('div');
      Object.assign(modePanel.style, {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 3,
        background: 'rgba(20,22,32,0.9)',
        color: '#fff',
        padding: '8px 10px',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        backdropFilter: 'blur(6px)',
      });
      const btnUpper = mkBtn('Upper body');
      const btnFull = mkBtn('Full body');
      modePanel.append(btnUpper, btnFull); // ← Upper 먼저
      currentContainer.appendChild(modePanel);

      const setPoseModeUI = (mode: PoseMode) => {
        poseMode = mode;
        setActive(btnFull, mode === 'stand');
        setActive(btnUpper, mode === 'upper');
        applyVisibilityForMode(mode);
        rebuildLinesNow();

        // 모드에 따라 FBX / mixer / 카메라 동기화
        if (mode === 'upper') {
          // Idle.fbx 활성
          if (remUpper) {
            remUpper.visible = true;
            window.__REM = remUpper;
          }
          if (remFull) remFull.visible = false;

          mixer = mixerUpper ?? null;

          // upper 카메라 프리셋
          camera.position.copy(CAMERA_UPPER_POS);
          controls.target.copy(CAMERA_UPPER_TARGET);
        } else {
          // Walking.fbx 활성
          if (remUpper) remUpper.visible = false;
          if (remFull) {
            remFull.visible = true;
            window.__REM = remFull;
          }

          mixer = mixerFull ?? null;

          // full body 카메라 프리셋
          camera.position.copy(CAMERA_FULL_POS);
          controls.target.copy(CAMERA_FULL_TARGET);
        }
      };
      btnFull.onclick = () => setPoseModeUI('stand');
      btnUpper.onclick = () => setPoseModeUI('upper');

      // 초기 상태
      setPoseModeUI('upper');
      applyLandmarkSource(true);
    }

    function initEventListeners() {
      const onResize = () => {
        camera.aspect =
          (currentContainer.clientWidth || 1) / (currentContainer.clientHeight || 1);
        camera.updateProjectionMatrix();
        renderer.setSize(
          currentContainer.clientWidth,
          currentContainer.clientHeight
        );
      };
      const onKeydown = (e: KeyboardEvent) => {
        if (
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(
            (document.activeElement as HTMLElement | null)?.tagName ?? ''
          )
        )
          return;
        pressedKeys.add(e.code);
        if (
          ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)
        )
          e.preventDefault();
      };
      const onKeyup = (e: KeyboardEvent) => {
        pressedKeys.delete(e.code);
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('keydown', onKeydown);
      window.addEventListener('keyup', onKeyup);
      return () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', onKeydown);
        window.removeEventListener('keyup', onKeyup);
      };
    }

    /* ======================= *
     * 외부 API
     * ======================= */
    function applyVisibilityForMode(mode: PoseMode): void {
      const hideLower = mode === 'upper';
      for (let i = 0; i <= 32; i++) {
        const isLower = LOWER_SET.has(i);
        const wantVisible = !HIDE_INDICES.has(i) && (!hideLower || !isLower);
        jointSpheres[i].visible = wantVisible;
        if (!wantVisible) jointSpheres[i].position.set(0, -9999, 0);
      }
    }
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
        const shoulderY = 1.45;
        pose[IDX.L_SHOULDER].set(-0.22, shoulderY, 0);
        pose[IDX.R_SHOULDER].set(+0.22, shoulderY, 0);
        pose[IDX.L_ELBOW].set(-0.47, shoulderY - 0.2, 0.03);
        pose[IDX.R_ELBOW].set(+0.47, shoulderY - 0.2, 0.03);
        pose[IDX.L_WRIST].set(-0.64, shoulderY - 0.38, 0.02);
        pose[IDX.R_WRIST].set(+0.64, shoulderY - 0.38, 0.02);
        const hipY = 0.9,
          hipHalf2 = 0.14;
        pose[IDX.L_HIP].set(-hipHalf2, hipY, 0);
        pose[IDX.R_HIP].set(+hipHalf2, hipY, 0);
        pose[IDX.L_KNEE].set(-hipHalf2, hipY - 0.05, 0);
        pose[IDX.R_KNEE].set(+hipHalf2, hipY - 0.05, 0);
        pose[IDX.L_ANKLE].set(-hipHalf2, hipY - 0.1, 0);
        pose[IDX.R_ANKLE].set(+hipHalf2, hipY - 0.1, 0);
        for (let i = 0; i <= 10; i++) pose[i].set(0, shoulderY + 0.2, 0);
      }
    }
    function createDefaultHeadProvider() {
      return (_t: number) => {
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
          arr[k].copy((pts[k] ?? new THREE.Vector3()).multiplyScalar(FACE_SPREAD));
        }
        return arr;
      };
    }
    function rebuildLinesNow() {
      const pts: THREE.Vector3[] = [];
      const active =
        poseMode === 'upper'
          ? POSE_CONNECTIONS.filter(
              ([a, b]) => !LOWER_SET.has(a) && !LOWER_SET.has(b)
            )
          : POSE_CONNECTIONS;
      for (const [a, b] of active) {
        if (!jointSpheres[a].visible || !jointSpheres[b].visible) continue;
        if (HIDE_INDICES.has(a) || HIDE_INDICES.has(b)) continue;
        pts.push(jointSpheres[a].position, jointSpheres[b].position);
      }
      lineMesh.geometry.setFromPoints(pts);
    }
    function applyKeyboardPan(dt: number) {
      if (pressedKeys.size === 0) return;
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(fwd, up).normalize();
      const move = new THREE.Vector3();
      if (pressedKeys.has('KeyW')) move.add(fwd);
      if (pressedKeys.has('KeyS')) move.sub(fwd);
      if (pressedKeys.has('KeyD')) move.add(right);
      if (pressedKeys.has('KeyA')) move.sub(right);
      if (pressedKeys.has('KeyE')) move.add(up);
      if (pressedKeys.has('KeyQ')) move.sub(up);
      if (move.lengthSq() === 0) return;
      move.normalize();
      const speed =
        1.5 * (pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight') ? 2.5 : 1);
      camera.position.addScaledVector(move, speed * dt);
      controls.target.addScaledVector(move, speed * dt);
    }

    function setupGlobalAPI() {
      window.setIdealNeckAngle = (deg: number) => {
        IDEAL_NECK_ANGLE_DEG = Number(deg) || 0;
      };
      window.setUserNeckAngle = (deg: number) => {
        USER_NECK_ANGLE_DEG = Number(deg) || 0;
      };

      window.setBodyFromMediapipe = (landmarksOrResult: PoseResult | Landmark[], opts: BodyOpts = {}) => {
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

        applyVisibilityForMode(poseMode);

        let lm: Landmark[] | null = null;
        if (Array.isArray(landmarksOrResult)) lm = landmarksOrResult;
        else if (landmarksOrResult && typeof landmarksOrResult === 'object') {
          if (useWorld && Array.isArray(landmarksOrResult.worldLandmarks))
            lm = landmarksOrResult.worldLandmarks!;
          else if (Array.isArray(landmarksOrResult.landmarks))
            lm = landmarksOrResult.landmarks!;
        }
        if (!lm || lm.length < 33) return;

        const lHip = lm[IDX.L_HIP],
          rHip = lm[IDX.R_HIP];
        const root =
          lHip && rHip
            ? {
                x: (lHip.x + rHip.x) / 2,
                y: (lHip.y + rHip.y) / 2,
                z: (lHip.z + rHip.z) / 2,
              }
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
          const footIdx = [
            IDX.L_ANKLE,
            IDX.R_ANKLE,
            IDX.L_HEEL,
            IDX.R_HEEL,
            IDX.L_FOOT,
            IDX.R_FOOT,
          ];
          let minY = Infinity;
          for (const idx of footIdx) {
            const v = arr[idx];
            if (v) minY = Math.min(minY, v.y);
          }
          if (isFinite(minY)) {
            const target = groundY + groundPadding;
            const dy = minY - target;
            if (Math.abs(dy) > 1e-9)
              for (let i = 0; i < 33; i++) arr[i].y -= dy;
          }
        }

        externalPoseProvider = () => arr;
        useExternalPose = true;

        for (let i = 0; i <= 32; i++) jointSpheres[i].position.copy(arr[i]);
        applyVisibilityForMode(poseMode);
        rebuildLinesNow();
        angleSmoothed = null;
      };

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
          if (useWorld && Array.isArray(landmarksOrResult.worldLandmarks))
            lm = landmarksOrResult.worldLandmarks!;
          else if (Array.isArray(landmarksOrResult.landmarks))
            lm = landmarksOrResult.landmarks!;
        }
        if (!lm || lm.length < 33) return;
        const lSh = lm[IDX.L_SHOULDER];
        const rSh = lm[IDX.R_SHOULDER];
        if (!lSh || !rSh) return;
        const neck = {
          x: (lSh.x + rSh.x) * 0.5,
          y: (lSh.y + rSh.y) * 0.5,
          z: (lSh.z + rSh.z) * 0.5,
        };
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

      // 샘플
      window.SAMPLE_MP = {
        landmarks: [
          { x: 0.5344623, y: 0.4381331, z: -2.0504346 },
          { x: 0.5781972, y: 0.3295264, z: -1.9545238 },
          { x: 0.6073157, y: 0.327489, z: -1.9544756 },
          { x: 0.6346192, y: 0.326008, z: -1.9535072 },
          { x: 0.4842065, y: 0.3362176, z: -1.9527218 },
          { x: 0.4520578, y: 0.3391453, z: -1.9530613 },
          { x: 0.4258602, y: 0.3433015, z: -1.9529097 },
          { x: 0.6828767, y: 0.3583425, z: -1.3177568 },
          { x: 0.3998519, y: 0.3771565, z: -1.3102576 },
          { x: 0.5987959, y: 0.5474404, z: -1.8071632 },
          { x: 0.488388, y: 0.5480131, z: -1.8067207 },
          { x: 0.9082999, y: 0.8622618, z: -0.9771122 },
          { x: 0.2339841, y: 0.8939523, z: -0.9377877 },
          { x: 1.0598009, y: 1.4300647, z: -1.1581966 },
          { x: 0.1102264, y: 1.5365949, z: -1.3167239 },
          { x: 1.0566919, y: 1.8830752, z: -1.9541689 },
          { x: 0.1586793, y: 1.9163671, z: -2.2963963 },
          { x: 1.1022356, y: 2.0399177, z: -2.163755 },
          { x: 0.1392019, y: 2.0716445, z: -2.5526142 },
          { x: 1.0339288, y: 2.0611377, z: -2.2772968 },
          { x: 0.2051983, y: 2.054565, z: -2.6389151 },
          { x: 1.0020152, y: 2.0070095, z: -2.0407846 },
          { x: 0.2258556, y: 1.999661, z: -2.3805015 },
          { x: 0.8302754, y: 1.987114, z: 0.05112219 },
          { x: 0.3957042, y: 2.0149446, z: -0.03728905 },
          { x: 0.8327457, y: 2.8985598, z: -0.09401891 },
          { x: 0.4338286, y: 2.9152002, z: -0.1398377 },
          { x: 0.8324099, y: 3.7204616, z: 1.0118641 },
          { x: 0.4450618, y: 3.6953192, z: 0.7039086 },
          { x: 0.8396327, y: 3.8574228, z: 1.1249027 },
          { x: 0.4431555, y: 3.8161066, z: 0.7778903 },
          { x: 0.784313, y: 3.9958892, z: 0.5536398 },
          { x: 0.5013456, y: 3.9739289, z: 0.1586579 },
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
    }

    /* ======================= *
     * 프레임 업데이트
     * ======================= */
    function updateFrame(t: number, dt: number): void {
      const BODY_SCALE = 1.15;
      const HEAD_SCALE = 1.35;

      // 1) 포즈 점 업데이트 (필요 시)
      if (useExternalPose && typeof externalPoseProvider === 'function') {
        const ext = externalPoseProvider();
        if (Array.isArray(ext) && ext.length >= 33) {
          for (let i = 0; i < 33; i++) jointSpheres[i].position.copy(ext[i]);
        }
      } else {
        if (!mixer) {
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
      }

      applyVisibilityForMode(poseMode);

      // 2) FBX 목/머리 회전 + 기준선/사용자선 (FBX 위에만 표시)
      const rem = (window as any).__REM as THREE.Object3D | undefined;
      if (rem && mixer) {
        const rig = rem.userData.__rig as Record<string, THREE.Bone | undefined>;
        const bindWorldQ: Map<THREE.Bone, THREE.Quaternion> = rem.userData.__bindWorldQ;

        const lShPos = new THREE.Vector3();
        const rShPos = new THREE.Vector3();
        rig.lShoulder?.getWorldPosition(lShPos);
        rig.rShoulder?.getWorldPosition(rShPos);

        const shoulderMid = lShPos.clone().add(rShPos).multiplyScalar(0.5);
        const shoulderAxis = rShPos.clone().sub(lShPos).normalize(); // 좌→우

        const worldUp = new THREE.Vector3(0, 1, 0);
        const worldFwd = new THREE.Vector3(0, 0, 1);

        // 사용자 각도와 기준 각도의 차이로 목/머리 굽힘 정도 결정
        const deltaDeg = USER_NECK_ANGLE_DEG - IDEAL_NECK_ANGLE_DEG;
        const bendRad = THREE.MathUtils.degToRad(
          THREE.MathUtils.clamp(deltaDeg, -45, 45)
        );
        const qNeck = new THREE.Quaternion().setFromAxisAngle(
          shoulderAxis,
          bendRad * 0.7
        );
        const qHead = new THREE.Quaternion().setFromAxisAngle(
          shoulderAxis,
          bendRad * 0.3
        );

        const applyExtraWorldRotationFromBind = (
          bone: THREE.Bone | undefined,
          extraWorldQ: THREE.Quaternion,
          slerp = 0.65
        ) => {
          if (!bone) return;
          const baseWorldQ = (bindWorldQ.get(bone) || new THREE.Quaternion()).clone();
          const targetWorldQ = extraWorldQ.clone().multiply(baseWorldQ);
          const parent = bone.parent as THREE.Object3D | null;
          const parentQ = new THREE.Quaternion();
          if (parent) parent.getWorldQuaternion(parentQ);
          const targetLocalQ = parentQ.clone().invert().multiply(targetWorldQ);
          bone.quaternion.slerp(targetLocalQ, slerp);
        };

        applyExtraWorldRotationFromBind(rig.neck, qNeck);
        applyExtraWorldRotationFromBind(rig.head, qHead);

        rem.updateMatrixWorld(true);

        // === FBX에서 목 기준으로 기준선(흰색) + 사용자선(노란색) 표시 ===
        const neckBone = rig.neck;
        if (neckBone) {
          const neckPos = new THREE.Vector3();
          neckBone.getWorldPosition(neckPos);

          const headPos = new THREE.Vector3();
          if (rig.head) rig.head.getWorldPosition(headPos);

          // 각도 텍스트는 머리 위에 띄우기
          const headOffset = new THREE.Vector3(0, 0.9, 0);
          angleSprite.position.copy(headPos).add(headOffset);

          const makeDirFromAngle = (deg: number) => {
            const rad = THREE.MathUtils.degToRad(deg);
            const v = new THREE.Vector3()
              .addScaledVector(worldFwd, Math.cos(rad)) // 0° = 앞
              .addScaledVector(worldUp, Math.sin(rad)); // 90° = 위
            // 어깨축 방향 성분 제거해서 어깨 평면 위로 투영
            return v
              .sub(shoulderAxis.clone().multiplyScalar(v.dot(shoulderAxis)))
              .normalize();
          };

          const idealDir = makeDirFromAngle(IDEAL_NECK_ANGLE_DEG);
          const userDir = makeDirFromAngle(USER_NECK_ANGLE_DEG);

          const yellowMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
          const whiteMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
          const yellowGeo = new THREE.BufferGeometry().setFromPoints([
            neckPos,
            neckPos.clone().add(userDir.clone().multiplyScalar(1.0)), // 노란색 = 사용자 각도
          ]);
          const whiteGeo = new THREE.BufferGeometry().setFromPoints([
            neckPos,
            neckPos.clone().add(idealDir.clone().multiplyScalar(1.0)), // 흰색 = 기준 각도
          ]);

          // 이전에 만들어둔 목 기준선 제거
          if (neckLines) {
            scene.remove(neckLines.yellow);
            scene.remove(neckLines.white);
          }

          // 현재 활성 FBX 기준으로 새 선 2개 생성
          const yellowLine = new THREE.Line(yellowGeo, yellowMaterial);
          const whiteLine = new THREE.Line(whiteGeo, whiteMaterial);
          scene.add(yellowLine, whiteLine);
          neckLines = { yellow: yellowLine, white: whiteLine };
        }
      }

      // 3) 패널/텍스트 갱신: 사용자 각도 vs 기준각
      const absNeckDeg = USER_NECK_ANGLE_DEG;
      const deltaWorldInstant = USER_NECK_ANGLE_DEG - IDEAL_NECK_ANGLE_DEG;
      const deltaAbs = Math.abs(deltaWorldInstant);

      angleSmoothed =
        angleSmoothed == null
          ? deltaAbs
          : THREE.MathUtils.lerp(angleSmoothed, deltaAbs, ANGLE_SMOOTH_ALPHA);

      updateSpriteText(
        angleSprite,
        `${absNeckDeg.toFixed(1)}° (ideal ${IDEAL_NECK_ANGLE_DEG.toFixed(
          0
        )}°)\nΔ ${angleSmoothed!.toFixed(1)}°`
      );
      window.__anglePanel?.set?.(absNeckDeg, deltaWorldInstant, IDEAL_NECK_ANGLE_DEG);

      // 4) 포즈 라인 갱신
      rebuildLinesNow();
    }

    function animate() {
      rafId = requestAnimationFrame(animate);

      const dtRaw = clock.getDelta();
      const dt = Math.max(1 / 120, Math.min(dtRaw, 1 / 30));

      const t = clock.elapsedTime;

      if (mixer) mixer.update(dt);

      updateFrame(t, dt);
      applyKeyboardPan(dt);

      controls.update();
      camera.lookAt(controls.target);
      renderer.render(scene, camera);
    }

    /* ======================= *
     * 실행
     * ======================= */
    initSceneAndCamera();
    initRenderer();
    initLighting();
    initFloor();
    initControls();
    initHelpers();
    initPoseVisuals();
    initAngleGuides();
    loadCharacters(); // Idle + Walking 모두 로드
    initUI();
    const cleanupEvents = initEventListeners();
    setupGlobalAPI();

    applyBasePose(poseMode);
    applyVisibilityForMode(poseMode);

    clock = new THREE.Clock();
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      cleanupEvents();

      Array.from(currentContainer.children).forEach((el) => {
        if (el !== renderer.domElement) el.remove();
      });
      try {
        currentContainer.removeChild(renderer.domElement);
      } catch {}

      renderer.dispose();
      scene.traverse((o: any) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m: any) => m.dispose());
          else o.material.dispose();
        }
      });

      if (neckLines) {
        scene.remove(neckLines.yellow);
        scene.remove(neckLines.white);
        neckLines = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    />
  );
}

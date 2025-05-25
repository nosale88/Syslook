import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

// 상수 및 가격 정보
const STAGE_UNIT_PRICE_PLYWOOD = 20000;
const STAGE_UNIT_PRICE_DECOTILE_USED = 6173;
const STAGE_UNIT_PRICE_DECOTILE_NEW = 30864;
const TRUSS_PRICE_PER_METER = 15000; // 기본 트러스용
const LAYHER_PRICE_PER_CUBIC_METER = 35000; // 레이허 가격 (예: m^3 당) / 임시값
const LIGHTING_PRICE_SPOT = 50000; // 스팟 조명 가격 (임시)
const LIGHTING_PRICE_POINT = 30000; // 포인트 조명 가격 (임시)
const GRID_SIZE = 0.1; // 그리드 크기 상수 (10cm)

// 객체 타입 정의
interface SceneObject {
  id: string;
  type: 'stage' | 'truss' | 'layher' | 'lighting';
  mesh: THREE.Mesh | THREE.Group;
  properties: any;
  price: number;
}

// 로컬스토리지 저장용 객체 데이터 타입
interface SavedSceneObjectData {
  id: string;
  type: 'stage' | 'truss' | 'layher' | 'lighting';
  properties: any;
  price: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; order: THREE.EulerOrder }; // Euler order 포함
}

interface SavedSceneState {
  objects: SavedSceneObjectData[];
  objectIdCounter: number;
}

// 스테이지 속성 인터페이스
interface StageProperties {
  width: number;
  depth: number;
  height: number;
  material: string;
}

// 트러스 속성 인터페이스
interface TrussProperties {
  width: number;
  depth: number;
  height: number;
  stageHeight?: number;
}

// 레이허 속성 인터페이스
interface LayherProperties {
  width: number;
  depth: number;
  height: number;
}

// 조명 속성 인터페이스
interface LightingProperties {
  type: 'spot' | 'point';
  color: string; // hex color string (e.g., "#ffffff")
  intensity: number;
  distance?: number; // for point/spot
  angle?: number;    // for spot
  penumbra?: number; // for spot
  decay?: number;    // for point/spot
  // 위치(position)는 mesh 자체의 position으로 관리
  targetPosition?: { x: number; y: number; z: number }; // for spot light target
}

// 컴포넌트 프롭스 인터페이스
interface Stage3DConfiguratorProps {
  onQuotationChange?: (items: QuotationItem[]) => void;
  initialObjects?: SceneObject[]; // 초기 객체 로드를 위한 프롭 추가
}

// 견적 항목 인터페이스
interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const Stage3DConfigurator: React.FC<Stage3DConfiguratorProps> = ({ onQuotationChange, initialObjects }) => {
  // 상태 관리
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(initialObjects || []);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]); // 상세 견적 항목 상태 추가
  const [objectIdCounter, setObjectIdCounter] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState<'object' | 'template' | 'data'>('object');

  // refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const dragControlsRef = useRef<DragControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const LOCAL_STORAGE_KEY = 'syslookSceneDataV2'; // 키 이름 변경하여 이전 데이터와 충돌 방지

  // 가격 계산 함수
  const calculateStagePrice = (props: StageProperties): number => {
    const area = props.width * props.depth;
    let unitPrice = STAGE_UNIT_PRICE_PLYWOOD;
    if (props.material === 'decotile_used') unitPrice = STAGE_UNIT_PRICE_DECOTILE_USED;
    else if (props.material === 'decotile_new') unitPrice = STAGE_UNIT_PRICE_DECOTILE_NEW;
    return area * unitPrice;
  };

  const calculateTrussPrice = (props: TrussProperties): number => {
    const perimeter = (props.width + props.depth) * 2;
    const totalLength = perimeter + (4 * props.height);
    return totalLength * TRUSS_PRICE_PER_METER;
  };

  const calculateLayherPrice = (props: LayherProperties): number => {
    const volume = props.width * props.depth * props.height;
    return volume * LAYHER_PRICE_PER_CUBIC_METER;
  };

  const calculateLightingPrice = (props: LightingProperties): number => {
    switch (props.type) {
      case 'spot':
        return LIGHTING_PRICE_SPOT;
      case 'point':
        return LIGHTING_PRICE_POINT;
      default:
        return 0;
    }
  };

  // 총 견적 업데이트 함수
  const updateTotalQuote = (currentObjects?: SceneObject[]) => {
    const objectsToSum = currentObjects || sceneObjects;
    let total = 0;
    objectsToSum.forEach(obj => total += obj.price);
    setTotalPrice(total);

    const newQuotationItems: QuotationItem[] = objectsToSum.map(obj => ({
      id: obj.id,
      description: `${obj.type} - ${obj.properties.width}x${obj.properties.depth}x${obj.properties.height || (obj.properties.stageHeight ? obj.properties.stageHeight + obj.properties.height : obj.properties.height)}${obj.type === 'lighting' ? ` (${obj.properties.type})` : ''}m`,
      quantity: 1,
      unitPrice: obj.price,
      amount: obj.price,
    }));
    setQuotationItems(newQuotationItems);

    if (onQuotationChange) {
      onQuotationChange(newQuotationItems);
    }
  };

  // 3D 객체 생성 함수
  const createStageMesh = (props: StageProperties): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry(props.width, props.height, props.depth);
    let color = 0x888888;
    if (props.material === 'plywood_carpet_black') color = 0x333333;
    else if (props.material === 'plywood_carpet_red') color = 0xcc0000;
    else if (props.material === 'plywood_carpet_gray') color = 0x777777;
    else if (props.material.startsWith('decotile')) color = 0x1a1a1a;
    const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7, metalness: 0.1 });
    const stageMesh = new THREE.Mesh(geometry, material);
    stageMesh.castShadow = true;
    stageMesh.receiveShadow = true;
    stageMesh.position.y = props.height / 2;
    return stageMesh;
  };

  const createTrussMesh = (props: TrussProperties, stageMesh?: THREE.Mesh | THREE.Group): THREE.Group => {
    const group = new THREE.Group();
    const trussRadius = 0.1;
    const trussMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5, metalness: 0.8 });

    const stageWidth = props.width;
    const stageDepth = props.depth;
    const trussStructureHeight = props.height;
    const stagePlatformHeight = props.stageHeight || 0.6;

    const postPositions = [
      { x: -stageWidth / 2, z: -stageDepth / 2 }, { x: stageWidth / 2, z: -stageDepth / 2 },
      { x: -stageWidth / 2, z: stageDepth / 2 },  { x: stageWidth / 2, z: stageDepth / 2 },
    ];
    postPositions.forEach(pos => {
      const geometry = new THREE.CylinderGeometry(trussRadius, trussRadius, trussStructureHeight, 12);
      const post = new THREE.Mesh(geometry, trussMaterial);
      post.position.set(pos.x, stagePlatformHeight + trussStructureHeight / 2, pos.z);
      post.castShadow = true;
      group.add(post);
    });
    let beamGeom = new THREE.BoxGeometry(stageWidth, trussRadius * 2, trussRadius * 2);
    let beam = new THREE.Mesh(beamGeom, trussMaterial);
    beam.position.set(0, stagePlatformHeight + trussStructureHeight - trussRadius, -stageDepth / 2);
    beam.castShadow = true; group.add(beam);
    beam = new THREE.Mesh(beamGeom.clone(), trussMaterial);
    beam.position.set(0, stagePlatformHeight + trussStructureHeight - trussRadius, stageDepth / 2);
    beam.castShadow = true; group.add(beam);
    beamGeom = new THREE.BoxGeometry(trussRadius * 2, trussRadius * 2, stageDepth);
    beam = new THREE.Mesh(beamGeom, trussMaterial);
    beam.position.set(-stageWidth / 2, stagePlatformHeight + trussStructureHeight - trussRadius, 0);
    beam.castShadow = true; group.add(beam);
    beam = new THREE.Mesh(beamGeom.clone(), trussMaterial);
    beam.position.set(stageWidth / 2, stagePlatformHeight + trussStructureHeight - trussRadius, 0);
    beam.castShadow = true; group.add(beam);
    
    if (stageMesh) {
        group.position.copy(stageMesh.position);
        group.position.y = 0;
    }
    return group;
  };

  const createLayherMesh = (props: LayherProperties): THREE.Group => {
    const group = new THREE.Group();
    const layherMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5, metalness: 0.8 });

    const geometry = new THREE.BoxGeometry(props.width, props.height, props.depth);
    const layher = new THREE.Mesh(geometry, layherMaterial);
    layher.castShadow = true;
    layher.receiveShadow = true;
    layher.position.y = props.height / 2;
    group.add(layher);

    return group;
  };

  const createLightingMesh = (props: LightingProperties): THREE.Group => {
    const group = new THREE.Group();
    // 시각적 표현 (예: 작은 구 또는 아이콘)
    const visualizerGeometry = new THREE.SphereGeometry(0.2, 16, 8);
    const visualizerMaterial = new THREE.MeshBasicMaterial({ color: props.color, wireframe: true });
    const visualizer = new THREE.Mesh(visualizerGeometry, visualizerMaterial);
    visualizer.name = "lighting_visualizer"; // 드래그 및 선택을 위해
    group.add(visualizer);

    let light: THREE.Light;
    switch (props.type) {
      case 'spot':
        const spotLight = new THREE.SpotLight(props.color, props.intensity, props.distance, props.angle, props.penumbra, props.decay);
        spotLight.castShadow = true;
        // 스팟라이트의 타겟 설정 (기본적으로 (0,0,0)을 향하지만, 조절 가능해야 함)
        // targetPosition이 있으면 해당 위치로, 없으면 조명의 위치보다 아래로 향하게 설정
        if (props.targetPosition) {
          spotLight.target.position.set(props.targetPosition.x, props.targetPosition.y, props.targetPosition.z);
        } else {
          // group에 target을 추가하고, target의 위치를 조명의 위치보다 아래로 설정
          const targetObject = new THREE.Object3D();
          targetObject.position.set(0, -1, 0); // 기본값: 조명 바로 아래
          group.add(targetObject); // group에 추가해야 조명과 함께 이동
          spotLight.target = targetObject;
        }
        group.add(spotLight.target); // target도 씬에 추가되어야 함 (또는 group에)
        light = spotLight;
        break;
      case 'point':
        const pointLight = new THREE.PointLight(props.color, props.intensity, props.distance, props.decay);
        // pointLight.castShadow = true; // PointLight 그림자는 성능에 영향이 큼. 필요시 활성화
        light = pointLight;
        break;
      default:
        // 기본값 또는 오류 처리
        light = new THREE.PointLight(0xffffff, 0, 0); // 보이지 않는 조명
        break;
    }
    light.name = "actual_light";
    group.add(light);
    // 초기 위치 설정 (예: 약간 위쪽)
    group.position.y = 2; // 기본 높이
    return group;
  };

  // 요소 추가 함수
  const addStage = () => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    const defaultProps: StageProperties = {
      width: 5.46, depth: 3.64, height: 0.6,
      material: 'plywood_carpet_black'
    };
    const stageMesh = createStageMesh(defaultProps);
    const newObj: SceneObject = {
      id: `stage-${newIdCounter}`,
      type: 'stage',
      mesh: stageMesh,
      properties: defaultProps,
      price: calculateStagePrice(defaultProps)
    };
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(stageMesh);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  const addTruss = () => {
    if (!sceneRef.current) return;
    const lastStage = sceneObjects.slice().reverse().find(obj => obj.type === 'stage');
    if (!lastStage) {
      alert("트러스를 배치할 무대가 필요합니다. 먼저 무대를 추가해주세요.");
      return;
    }
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    const defaultTrussProps: TrussProperties = { 
      width: lastStage.properties.width, 
      depth: lastStage.properties.depth, 
      height: 3.0, 
      stageHeight: lastStage.properties.height 
    };
    const trussMeshGroup = createTrussMesh(defaultTrussProps, lastStage.mesh);
    const newObj: SceneObject = {
      id: `truss-${newIdCounter}`,
      type: 'truss',
      mesh: trussMeshGroup,
      properties: defaultTrussProps,
      price: calculateTrussPrice(defaultTrussProps)
    };
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(trussMeshGroup);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  const addLayher = () => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    const defaultLayherProps: LayherProperties = {
      width: 5.46, depth: 3.64, height: 2.0
    };
    const layherMeshGroup = createLayherMesh(defaultLayherProps);
    const newObj: SceneObject = {
      id: `layher-${newIdCounter}`,
      type: 'layher',
      mesh: layherMeshGroup,
      properties: defaultLayherProps,
      price: calculateLayherPrice(defaultLayherProps)
    };
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(layherMeshGroup);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  const addLighting = () => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    const defaultLightingProps: LightingProperties = {
      type: 'spot',
      color: '#ffffff',
      intensity: 1,
      distance: 100,
      angle: Math.PI / 4,
      penumbra: 0.1,
      decay: 1,
    };
    const lightingMeshGroup = createLightingMesh(defaultLightingProps);
    const newObj: SceneObject = {
      id: `lighting-${newIdCounter}`,
      type: 'lighting',
      mesh: lightingMeshGroup,
      properties: defaultLightingProps,
      price: calculateLightingPrice(defaultLightingProps)
    };
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(lightingMeshGroup);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  // 객체 삭제 함수
  const deleteSelectedObject = () => {
    if (!selectedObject || !sceneRef.current) return;

    sceneRef.current.remove(selectedObject.mesh);
    if (selectedObject.mesh instanceof THREE.Mesh) {
      if (selectedObject.mesh.geometry) selectedObject.mesh.geometry.dispose();
      if (selectedObject.mesh.material) {
        if (Array.isArray(selectedObject.mesh.material)) {
          selectedObject.mesh.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          selectedObject.mesh.material.dispose();
        }
      }
    } else if (selectedObject.mesh instanceof THREE.Group) { 
      selectedObject.mesh.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m: THREE.Material) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    }

    const updatedObjects = sceneObjects.filter(obj => obj.id !== selectedObject.id);
    setSceneObjects(updatedObjects);
    deselectObject();
    updateTotalQuote(updatedObjects);
  };

  // 속성 패널 렌더링 함수
  const renderPropertiesPanel = () => {
    if (!selectedObject) return null;

    switch (selectedObject.type) {
      case 'stage':
        const stageProps = selectedObject.properties as StageProperties;
        return (
          <>
            <div>
              <label htmlFor="propWidth" className="block text-sm font-medium text-gray-700 mb-1">가로 (m):</label>
              <input type="number" id="propWidth" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={stageProps.width} />
            </div>
            <div>
              <label htmlFor="propDepth" className="block text-sm font-medium text-gray-700 mb-1">세로 (m):</label>
              <input type="number" id="propDepth" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={stageProps.depth} />
            </div>
            <div>
              <label htmlFor="propHeight" className="block text-sm font-medium text-gray-700 mb-1">높이 (m):</label>
              <input type="number" id="propHeight" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={stageProps.height} />
            </div>
            <div>
              <label htmlFor="propMaterial" className="block text-sm font-medium text-gray-700 mb-1">바닥 재질:</label>
              <select id="propMaterial" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" defaultValue={stageProps.material}>
                <option value="plywood_carpet_black">기본 (합판 + 파이텍스 검정)</option>
                <option value="plywood_carpet_red">기본 (합판 + 파이텍스 빨강)</option>
                <option value="plywood_carpet_gray">기본 (합판 + 파이텍스 회색)</option>
                <option value="decotile_used">데코타일 (중고 - 검정)</option>
                <option value="decotile_new">데코타일 (신품 - 검정)</option>
              </select>
            </div>
          </>
        );
      case 'truss':
        const trussProps = selectedObject.properties as TrussProperties;
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">기준 무대 가로: {trussProps.width.toFixed(2)}m (참고용)</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">기준 무대 세로: {trussProps.depth.toFixed(2)}m (참고용)</label>
            </div>
            <div>
              <label htmlFor="propTrussHeight" className="block text-sm font-medium text-gray-700 mb-1">트러스 높이 (m):</label>
              <input type="number" id="propTrussHeight" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={trussProps.height} />
            </div>
            <div className="md:col-span-2"><p className="text-sm text-gray-500">참고: 현재 트러스의 가로/세로는 연결된 무대의 크기를 따릅니다. 위치는 드래그로 조정하세요.</p></div>
          </>
        );
      case 'layher':
        const layherProps = selectedObject.properties as LayherProperties;
        return (
          <>
            <div>
              <label htmlFor="propWidth" className="block text-sm font-medium text-gray-700 mb-1">가로 (m):</label>
              <input type="number" id="propWidth" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={layherProps.width} />
            </div>
            <div>
              <label htmlFor="propDepth" className="block text-sm font-medium text-gray-700 mb-1">세로 (m):</label>
              <input type="number" id="propDepth" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={layherProps.depth} />
            </div>
            <div>
              <label htmlFor="propHeight" className="block text-sm font-medium text-gray-700 mb-1">높이 (m):</label>
              <input type="number" id="propHeight" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={layherProps.height} />
            </div>
          </>
        );
      case 'lighting':
        const lightingProps = selectedObject.properties as LightingProperties;
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">조명 타입: {lightingProps.type}</label>
            </div>
            <div>
              <label htmlFor="propColor" className="block text-sm font-medium text-gray-700 mb-1">색상:</label>
              <input type="color" id="propColor" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" defaultValue={lightingProps.color} />
            </div>
            <div>
              <label htmlFor="propIntensity" className="block text-sm font-medium text-gray-700 mb-1">강도:</label>
              <input type="number" id="propIntensity" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={lightingProps.intensity} />
            </div>
            {lightingProps.type === 'spot' && (
              <>
                <div>
                  <label htmlFor="propDistance" className="block text-sm font-medium text-gray-700 mb-1">거리:</label>
                  <input type="number" id="propDistance" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={lightingProps.distance} />
                </div>
                <div>
                  <label htmlFor="propAngle" className="block text-sm font-medium text-gray-700 mb-1">각도:</label>
                  <input type="number" id="propAngle" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={lightingProps.angle} />
                </div>
                <div>
                  <label htmlFor="propPenumbra" className="block text-sm font-medium text-gray-700 mb-1">펜움브라:</label>
                  <input type="number" id="propPenumbra" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" step="0.1" defaultValue={lightingProps.penumbra} />
                </div>
              </>
            )}
          </>
        );
      default:
        return <p>선택된 요소의 속성을 편집할 수 없습니다.</p>;
    }
  };

  // 속성 적용 함수
  const applyProperties = () => {
    if (!selectedObject || !sceneRef.current) return;

    const props = { ...selectedObject.properties }; 
    let newMesh: THREE.Mesh | THREE.Group | undefined;
    let newPrice = selectedObject.price;
    let propertiesChanged = false;

    if (selectedObject.type === 'stage') {
      const newWidth = parseFloat((document.getElementById('propWidth') as HTMLInputElement).value);
      const newDepth = parseFloat((document.getElementById('propDepth') as HTMLInputElement).value);
      const newHeight = parseFloat((document.getElementById('propHeight') as HTMLInputElement).value);
      const newMaterial = (document.getElementById('propMaterial') as HTMLSelectElement).value;

      if (props.width !== newWidth || props.depth !== newDepth || props.height !== newHeight || props.material !== newMaterial) {
        props.width = newWidth;
        props.depth = newDepth;
        props.height = newHeight;
        props.material = newMaterial;
        newMesh = createStageMesh(props as StageProperties);
        newPrice = calculateStagePrice(props as StageProperties);
        propertiesChanged = true;
      }
    } else if (selectedObject.type === 'truss') {
      const newTrussHeight = parseFloat((document.getElementById('propTrussHeight') as HTMLInputElement).value);
      if (props.height !== newTrussHeight) {
        props.height = newTrussHeight;
        newMesh = createTrussMesh(props as TrussProperties, undefined); 
        newPrice = calculateTrussPrice(props as TrussProperties);
        propertiesChanged = true;
      }
    } else if (selectedObject.type === 'layher') {
      const newWidth = parseFloat((document.getElementById('propWidth') as HTMLInputElement).value);
      const newDepth = parseFloat((document.getElementById('propDepth') as HTMLInputElement).value);
      const newHeight = parseFloat((document.getElementById('propHeight') as HTMLInputElement).value);
      if (props.width !== newWidth || props.depth !== newDepth || props.height !== newHeight) {
        props.width = newWidth;
        props.depth = newDepth;
        props.height = newHeight;
        newMesh = createLayherMesh(props as LayherProperties);
        newPrice = calculateLayherPrice(props as LayherProperties);
        propertiesChanged = true;
      }
    } else if (selectedObject.type === 'lighting') {
      const newColor = (document.getElementById('propColor') as HTMLInputElement).value;
      const newIntensity = parseFloat((document.getElementById('propIntensity') as HTMLInputElement).value);
      const newDistance = parseFloat((document.getElementById('propDistance') as HTMLInputElement).value);
      const newAngle = parseFloat((document.getElementById('propAngle') as HTMLInputElement).value);
      const newPenumbra = parseFloat((document.getElementById('propPenumbra') as HTMLInputElement).value);

      if (props.color !== newColor || props.intensity !== newIntensity || props.distance !== newDistance || props.angle !== newAngle || props.penumbra !== newPenumbra) {
        props.color = newColor;
        props.intensity = newIntensity;
        props.distance = newDistance;
        props.angle = newAngle;
        props.penumbra = newPenumbra;
        newMesh = createLightingMesh(props as LightingProperties);
        newPrice = calculateLightingPrice(props as LightingProperties);
        propertiesChanged = true;
      }
    }

    if (propertiesChanged && newMesh) {
      newMesh.position.copy(selectedObject.mesh.position);
      newMesh.rotation.copy(selectedObject.mesh.rotation);

      sceneRef.current.remove(selectedObject.mesh);
      if (selectedObject.mesh instanceof THREE.Mesh) {
        if (selectedObject.mesh.geometry) selectedObject.mesh.geometry.dispose();
        if (selectedObject.mesh.material) {
          if (Array.isArray(selectedObject.mesh.material)) {
            selectedObject.mesh.material.forEach((m: THREE.Material) => m.dispose());
          } else {
            selectedObject.mesh.material.dispose();
          }
        }
      } else if (selectedObject.mesh instanceof THREE.Group) { 
        selectedObject.mesh.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m: THREE.Material) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }

      const updatedObject = {
        ...selectedObject,
        mesh: newMesh,
        properties: props,
        price: newPrice,
      };

      const updatedObjects = sceneObjects.map(obj => obj.id === selectedObject.id ? updatedObject : obj);
      setSceneObjects(updatedObjects);
      sceneRef.current.add(newMesh);
      updateTotalQuote(updatedObjects);
      
      setTimeout(() => selectObject(updatedObject), 0);
    } else if (propertiesChanged) {
      const updatedObject = {
        ...selectedObject,
        properties: props,
        price: newPrice,
      };
      const updatedObjects = sceneObjects.map(obj => obj.id === selectedObject.id ? updatedObject : obj);
      setSceneObjects(updatedObjects);
      updateTotalQuote(updatedObjects);
      setTimeout(() => selectObject(updatedObject), 0);
    }
  };

  // 재귀적으로 객체의 emissive 속성을 설정하는 헬퍼 함수
  const setMaterialEmissiveRecursive = (object: THREE.Object3D, hex: number) => {
    if (object instanceof THREE.Mesh) {
      const material = object.material;
      if (Array.isArray(material)) {
        material.forEach((mat: THREE.Material) => {
          if (mat && 'emissive' in mat && mat.emissive instanceof THREE.Color) {
            mat.emissive.setHex(hex);
          }
        });
      } else if (material && 'emissive' in material && (material as any).emissive instanceof THREE.Color) {
        ((material as any).emissive as THREE.Color).setHex(hex);
      }
    } else if (object instanceof THREE.Group) {
      object.children.forEach(child => {
        setMaterialEmissiveRecursive(child, hex);
      });
    }
  };

  // 씬 초기화
  useEffect(() => {
    if (!canvasRef.current) return;

    setLoading(true);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);
    sceneRef.current = scene;

    const container = canvasRef.current.parentElement;
    if (!container) return;
    
    const camera = new THREE.PerspectiveCamera(
      60, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      2000
    );
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 3;
    orbitControls.maxDistance = 100;
    orbitControlsRef.current = orbitControls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0xcccccc);
    scene.add(gridHelper);
    
    const planeGeometry = new THREE.PlaneGeometry(50, 50);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.01;
    plane.receiveShadow = true;
    scene.add(plane);

    const animate = () => {
      requestAnimationFrame(animate);
      if (orbitControlsRef.current) orbitControlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    setLoading(false);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) rendererRef.current.dispose();
      if (orbitControlsRef.current) orbitControlsRef.current.dispose();
      if (dragControlsRef.current) dragControlsRef.current.dispose();
    };
  }, []);

  // 캔버스 클릭 이벤트 핸들러
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !sceneRef.current || !cameraRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      sceneObjects.map(obj => obj.mesh), 
      true
    );

    if (intersects.length > 0) {
      let clickedMesh = intersects[0].object;
      
      while (clickedMesh.parent && clickedMesh.parent !== sceneRef.current) {
        const parentObj = sceneObjects.find(obj => obj.mesh === clickedMesh.parent);
        if (parentObj) {
          clickedMesh = clickedMesh.parent;
          break;
        }
        clickedMesh = clickedMesh.parent;
      }
      
      const foundObject = sceneObjects.find(obj => obj.mesh === clickedMesh);
      if (foundObject) {
        selectObject(foundObject);
      } else {
        deselectObject();
      }
    } else {
      deselectObject();
    }
  };

  // 선택 해제 함수
  const deselectObject = () => {
    if (selectedObject) {
      setMaterialEmissiveRecursive(selectedObject.mesh, 0x000000);
      setSelectedObject(null);
    }
    if (dragControlsRef.current) {
      dragControlsRef.current.dispose();
      dragControlsRef.current = null;
    }
  };

  // 객체 선택 함수
  const selectObject = (objToSelect: SceneObject) => {
    if (selectedObject) {
      setMaterialEmissiveRecursive(selectedObject.mesh, 0x000000);
    }
    setMaterialEmissiveRecursive(objToSelect.mesh, 0xaaaaaa); 

    setSelectedObject(objToSelect);
    setupDragControls(objToSelect); 
  };

  // 드래그 컨트롤 설정 함수
  const setupDragControls = (targetObject: SceneObject) => {
    if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;
    
    if (dragControlsRef.current) {
      dragControlsRef.current.dispose();
    }

    const controls = new DragControls([targetObject.mesh], cameraRef.current, rendererRef.current.domElement);
    
    controls.addEventListener('dragstart', (event: Event & { object: THREE.Object3D }) => {
      if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
      setMaterialEmissiveRecursive(event.object, 0xcccccc); 
    });

    controls.addEventListener('drag', (event: Event & { object: THREE.Object3D }) => {
      event.object.position.x = Math.round(event.object.position.x / GRID_SIZE) * GRID_SIZE;
      event.object.position.z = Math.round(event.object.position.z / GRID_SIZE) * GRID_SIZE;
    });

    controls.addEventListener('dragend', (event: Event & { object: THREE.Object3D }) => {
      if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
      setMaterialEmissiveRecursive(event.object, 0xaaaaaa);
      
      const updatedObjects = sceneObjects.map(obj => {
        if (obj.id === targetObject.id) {
          return { ...obj, mesh: event.object as THREE.Mesh | THREE.Group }; 
        }
        return obj;
      });
      setSceneObjects(updatedObjects);
    });

    dragControlsRef.current = controls;
  };

  // 씬 정리 및 객체 제거 헬퍼 함수
  const clearSceneAndObjects = () => {
    if (sceneRef.current) {
      sceneObjects.forEach(obj => {
        if (obj.mesh) {
          sceneRef.current?.remove(obj.mesh);
          if (obj.mesh instanceof THREE.Mesh) {
            if (obj.mesh.geometry) obj.mesh.geometry.dispose();
            if (obj.mesh.material) {
              if (Array.isArray(obj.mesh.material)) {
                obj.mesh.material.forEach(m => m.dispose());
              } else {
                obj.mesh.material.dispose();
              }
            }
          } else if (obj.mesh instanceof THREE.Group) { 
            obj.mesh.traverse((child: any) => {
              if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                  } else {
                    child.material.dispose();
                  }
                }
              }
              if (child instanceof THREE.Light) {
                child.dispose(); // 조명 객체도 명시적으로 dispose
              }
            });
          }
        }
      });
    }
    setSceneObjects([]);
    setSelectedObject(null);
    setTotalPrice(0);
    setQuotationItems([]);
    // objectIdCounter는 유지하거나 필요에 따라 초기화. 현재는 유지하는 것으로 가정.
  };

  // 씬 저장 함수
  const handleSaveScene = () => {
    if (!sceneObjects) return;
    console.log("Saving scene to localStorage...");
    const dataToSave: SavedSceneObjectData[] = sceneObjects.map(obj => ({
      id: obj.id,
      type: obj.type,
      properties: obj.properties,
      price: obj.price,
      position: { x: obj.mesh.position.x, y: obj.mesh.position.y, z: obj.mesh.position.z },
      rotation: { 
        x: obj.mesh.rotation.x, 
        y: obj.mesh.rotation.y, 
        z: obj.mesh.rotation.z, 
        order: obj.mesh.rotation.order 
      },
    }));

    const sceneState: SavedSceneState = {
      objects: dataToSave,
      objectIdCounter: objectIdCounter,
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sceneState));
      alert('씬이 로컬 스토리지에 저장되었습니다!');
    } catch (error) {
      console.error("Error saving scene to localStorage:", error);
      alert('씬 저장에 실패했습니다. 콘솔을 확인해주세요.');
    }
  };

  // 씬을 이미지로 저장하는 함수
  const handleSaveSceneAsImage = () => {
    if (rendererRef.current && cameraRef.current && sceneRef.current) {
      try {
        // 현재 렌더링 상태를 보장하기 위해 한 프레임 렌더링
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        
        const dataURL = rendererRef.current.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'scene_capture.png';
        link.href = dataURL;
        document.body.appendChild(link); // Firefox에서 필요할 수 있음
        link.click();
        document.body.removeChild(link);
        alert('씬 이미지가 저장되었습니다!');
      } catch (error) {
        console.error("Error saving scene as image:", error);
        alert('씬 이미지 저장에 실패했습니다. 콘솔을 확인해주세요.');
      }
    } else {
      alert('렌더러 또는 씬이 준비되지 않아 이미지를 저장할 수 없습니다.');
    }
  };

  // 씬 불러오기 함수
  const handleLoadScene = () => {
    console.log("Attempting to load scene from localStorage...");
    try {
      const savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDataString) {
        const savedState: SavedSceneState = JSON.parse(savedDataString);
        
        setLoading(true); // 로딩 시작
        clearSceneAndObjects();
        
        // React 상태 업데이트 및 Three.js 정리가 반영될 시간을 약간 줌
        setTimeout(() => {
          if (!sceneRef.current) {
            console.error("Scene reference is not available for loading objects.");
            setLoading(false);
            return;
          }

          const loadedObjects: SceneObject[] = [];
          savedState.objects.forEach(data => {
            let mesh: THREE.Mesh | THREE.Group | undefined;
            const price = data.price; // 저장된 가격 사용 또는 필요시 재계산

            switch (data.type) {
              case 'stage':
                mesh = createStageMesh(data.properties as StageProperties);
                // price = calculateStagePrice(data.properties as StageProperties); // 필요시 재계산
                break;
              case 'truss':
                // 트러스는 연결된 무대가 없을 수 있으므로, 생성 함수에서 이를 처리해야 함.
                // 여기서는 단순화를 위해 undefined를 전달하거나, 저장된 stageHeight를 사용.
                const trussProps = data.properties as TrussProperties;
                mesh = createTrussMesh(trussProps, undefined); // 연결된 stageMesh는 불러오기 시점에는 찾기 어려움
                // price = calculateTrussPrice(trussProps);
                break;
              case 'layher':
                mesh = createLayherMesh(data.properties as LayherProperties);
                // price = calculateLayherPrice(data.properties as LayherProperties);
                break;
              case 'lighting':
                mesh = createLightingMesh(data.properties as LightingProperties);
                // price = calculateLightingPrice(data.properties as LightingProperties);
                break;
            }

            if (mesh) {
              mesh.position.set(data.position.x, data.position.y, data.position.z);
              mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.order as THREE.EulerOrder);
              sceneRef.current?.add(mesh);
              loadedObjects.push({
                id: data.id,
                type: data.type,
                mesh: mesh,
                properties: data.properties,
                price: price, 
              });
            }
          });

          setSceneObjects(loadedObjects);
          setObjectIdCounter(savedState.objectIdCounter);
          updateTotalQuote(loadedObjects); // 견적 업데이트
          setLoading(false); // 로딩 완료
          alert('씬을 로컬 스토리지에서 불러왔습니다!');
        }, 150); // 지연 시간을 약간 늘려 안정성 확보

      } else {
        alert('저장된 씬 데이터가 없습니다.');
      }
    } catch (error) {
      console.error("Error loading scene from localStorage:", error);
      setLoading(false);
      alert('씬 불러오기에 실패했습니다. 콘솔을 확인해주세요.');
    }
  };

  return (
    <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
      <div className="flex flex-col md:flex-row justify-center items-start">
        <div className="md:w-1/2 xl:w-1/3 p-4">
          <section className="p-4 border border-gray-300 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">요소 추가</h2>
            <div className="space-y-2">
              <button 
                onClick={addStage}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              >
                무대 추가
              </button>
              <button 
                onClick={addTruss}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
              >
                트러스 추가
              </button>
              <button 
                onClick={addLayher}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
              >
                레이허 추가
              </button>
              <button 
                onClick={addLighting}
                className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75"
              >
                조명 추가
              </button>
            </div>
          </section>

          <section className="p-4 border border-gray-300 rounded-lg shadow mt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">속성 편집</h2>
            {renderPropertiesPanel()}
            {selectedObject && (
              <div className="mt-4">
                <button 
                  onClick={applyProperties}
                  className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                >
                  속성 적용
                </button>
              </div>
            )}
          </section>

          <section className="p-4 border border-gray-300 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">데이터 관리</h2>
            <div className="space-y-2">
              <button 
                onClick={handleSaveScene}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              >
                현재 씬 저장 (로컬)
              </button>
              <button 
                onClick={handleLoadScene}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
              >
                씬 불러오기 (로컬)
              </button>
              <button 
                onClick={handleSaveSceneAsImage} 
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 mt-2"
              >
                현재 씬 이미지로 저장 (PNG)
              </button>
            </div>
          </section>

          <section className="p-4 border border-gray-300 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">선택된 요소</h2>
            <div className="text-indigo-600 font-medium">
              {selectedObject 
                ? `${selectedObject.type} (ID: ${selectedObject.id})` 
                : '선택된 요소 없음'}
            </div>
            <button 
              className="py-2 px-4 bg-white hover:bg-gray-50 text-indigo-700 font-semibold rounded-lg shadow-md border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 w-full mt-2"
              onClick={() => deleteSelectedObject()}
              disabled={!selectedObject}
            >
              선택 요소 삭제
            </button>
          </section>
        </div>

        <div className="md:col-span-2">
          <div className="w-full h-[400px] md:h-[500px] relative shadow-lg rounded-lg">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full bg-gray-200 rounded-lg"
              onClick={handleCanvasClick}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 text-white text-xl rounded-lg">
                로딩 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stage3DConfigurator;

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import QuotationTemplateModal, { QuotationData as ModalQuotationData } from '../components/quotation/QuotationTemplateModal';
import StageTypeSelectModal from '../components/StageTypeSelectModal';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

// 상수 및 가격 정보
import STAGE_SET_TEMPLATES, { StageSetTemplate } from './StageSetTemplates';
const STAGE_UNIT_PRICE_PLYWOOD = 20000;
const STAGE_UNIT_PRICE_DECOTILE_USED = 6173;
const STAGE_UNIT_PRICE_DECOTILE_NEW = 30864;
const TRUSS_PRICE_PER_METER = 15000;
const LAYHER_PRICE_PER_CUBIC_METER = 35000;
const LIGHTING_PRICE_SPOT = 50000;
const LIGHTING_PRICE_POINT = 30000;
const GRID_SIZE = 0.1;

// 타입 정의
type LEDScreenProperties = {
  width: number;
  height: number;
  depth?: number;
  resolution?: 'low' | 'medium' | 'high';
  installationType?: 'wall-mounted' | 'ground-stacked' | 'flown';
  pixelPitch?: number;
  brightness?: number;
  content?: string;
};

type SpeakerProperties = {
  type: 'main' | 'monitor';
  width: number;
  height: number;
  depth: number;
  power?: number;
};

type ChairProperties = {
  type: 'standard' | 'vip' | 'standing';
  width?: number;
  depth?: number;
  rows: number;
  columns: number;
  spacing: number;
};

type DecorationProperties = {
  type: string;
  width: number;
  height: number;
  color: string;
};

interface SceneObject {
  id: string;
  type: 'stage' | 'truss' | 'layher' | 'lighting' | 'led_screen' | 'speaker' | 'chair' | 'decoration';
  mesh: THREE.Mesh | THREE.Group;
  properties: any;
  price: number;
}

interface SavedSceneObjectData {
  id: string;
  type: 'stage' | 'truss' | 'layher' | 'lighting' | 'led_screen' | 'speaker' | 'chair' | 'decoration';
  properties: any;
  price: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; order: THREE.EulerOrder };
}

interface SavedSceneState {
  objects: SavedSceneObjectData[];
  objectIdCounter: number;
}

interface StageProperties {
  width: number;
  depth: number;
  height: number;
  material: string;
  stageType?: 'basic' | 't' | 'arch' | 'round';
}

interface TrussProperties {
  width: number;
  depth: number;
  height: number;
  stageHeight?: number;
  stageType?: 'basic' | 't' | 'arch' | 'round';
}

interface LayherProperties {
  width: number;
  depth: number;
  height: number;
  stageType?: 'basic' | 't' | 'arch' | 'round';
}

interface LightingProperties {
  type: 'spot' | 'point';
  color: string;
  intensity: number;
  distance?: number;
  angle?: number;
  penumbra?: number;
  decay?: number;
  targetPosition?: { x: number; y: number; z: number };
}

interface ThreeDConfiguratorProps {
  onQuotationChange?: (items: QuotationItem[]) => void;
  initialObjects?: SceneObject[];
}

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const ThreeDConfigurator: React.FC<ThreeDConfiguratorProps> = ({ onQuotationChange, initialObjects }) => {
  // Three.js refs
  const mountRef = useRef<HTMLDivElement>(null);
  const gizmoRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const dragControlsRef = useRef<DragControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const initialCameraPositionRef = useRef<THREE.Vector3 | null>(null);
  const initialCameraLookAtRef = useRef<THREE.Vector3 | null>(null);

  // Transform mode state
  const [currentTransformMode, setCurrentTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');

  // 팝업 상태
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [showStageTypeModal, setShowStageTypeModal] = useState(false);

  // 상태 관리
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(initialObjects || []);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [objectIdCounter, setObjectIdCounter] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // 기본 상태 관리
  const [gridVisible, setGridVisible] = useState(true);
  const [axesVisible, setAxesVisible] = useState(true);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);

  // 가격 계산 함수들
  const calculateStagePrice = (props: StageProperties, stageType?: 'basic' | 't' | 'arch' | 'round'): number => {
    let area: number;
    
    if (stageType === 'arch') {
      // 반원형 무대의 면적 계산 (π * r²) / 2
      const radius = props.width / 2;
      area = (Math.PI * radius * radius) / 2;
    } else if (stageType === 'round') {
      // 원형 무대의 면적 계산 π * r²
      const radius = props.width / 2;
      area = Math.PI * radius * radius;
    } else {
      // 사각형 무대의 면적 계산
      area = props.width * props.depth;
    }
    
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

  // 3D 객체 생성 함수들
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

  const createTrussMesh = (props: TrussProperties): THREE.Group => {
    const group = new THREE.Group();
    const trussRadius = 0.1;
    const trussMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5, metalness: 0.8 });

    const stageWidth = props.width;
    const stageDepth = props.depth;
    const trussStructureHeight = props.height;
    const stagePlatformHeight = props.stageHeight || 0.6;

    // 기본 트러스 구조 생성
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

    // 빔 추가
    let beamGeom = new THREE.BoxGeometry(stageWidth, trussRadius * 2, trussRadius * 2);
    let beam = new THREE.Mesh(beamGeom, trussMaterial);
    beam.position.set(0, stagePlatformHeight + trussStructureHeight - trussRadius, -stageDepth / 2);
    beam.castShadow = true; 
    group.add(beam);

    beam = new THREE.Mesh(beamGeom.clone(), trussMaterial);
    beam.position.set(0, stagePlatformHeight + trussStructureHeight - trussRadius, stageDepth / 2);
    beam.castShadow = true; 
    group.add(beam);

    beamGeom = new THREE.BoxGeometry(trussRadius * 2, trussRadius * 2, stageDepth);
    beam = new THREE.Mesh(beamGeom, trussMaterial);
    beam.position.set(-stageWidth / 2, stagePlatformHeight + trussStructureHeight - trussRadius, 0);
    beam.castShadow = true; 
    group.add(beam);

    beam = new THREE.Mesh(beamGeom.clone(), trussMaterial);
    beam.position.set(stageWidth / 2, stagePlatformHeight + trussStructureHeight - trussRadius, 0);
    beam.castShadow = true; 
    group.add(beam);

    return group;
  };

  const createLayherMesh = (props: LayherProperties): THREE.Group => {
    const group = new THREE.Group();
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.5, metalness: 0.8 });
    const pipeRadius = 0.048 / 2;

    const halfWidth = props.width / 2;
    const halfDepth = props.depth / 2;

    // 수직 기둥 4개
    const postPositions = [
      { x: -halfWidth, z: -halfDepth }, { x: halfWidth, z: -halfDepth },
      { x: -halfWidth, z: halfDepth },  { x: halfWidth, z: halfDepth }
    ];
    
    postPositions.forEach(pos => {
      const geometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, props.height, 16);
      const post = new THREE.Mesh(geometry, metalMaterial);
      post.position.set(pos.x, props.height / 2, pos.z);
      post.castShadow = true;
      group.add(post);
    });

    return group;
  };

  const createLightingMesh = (props: LightingProperties): THREE.Group => {
    const group = new THREE.Group();
    
    // 시각적 표현
    const visualizerGeometry = new THREE.SphereGeometry(0.2, 16, 8);
    const visualizerMaterial = new THREE.MeshBasicMaterial({ color: props.color, wireframe: true });
    const visualizer = new THREE.Mesh(visualizerGeometry, visualizerMaterial);
    visualizer.name = "lighting_visualizer";
    group.add(visualizer);

    let light: THREE.Light;
    switch (props.type) {
      case 'spot':
        const spotLight = new THREE.SpotLight(props.color, props.intensity, props.distance, props.angle, props.penumbra, props.decay);
        spotLight.castShadow = true;
        if (props.targetPosition) {
          spotLight.target.position.set(props.targetPosition.x, props.targetPosition.y, props.targetPosition.z);
        } else {
          const targetObject = new THREE.Object3D();
          targetObject.position.set(0, -1, 0);
          group.add(targetObject);
          spotLight.target = targetObject;
        }
        group.add(spotLight.target);
        light = spotLight;
        break;
      case 'point':
        const pointLight = new THREE.PointLight(props.color, props.intensity, props.distance, props.decay);
        light = pointLight;
        break;
      default:
        light = new THREE.PointLight(0xffffff, 0, 0);
        break;
    }
    
    light.name = "actual_light";
    group.add(light);
    group.position.y = 2;
    return group;
  };

  // 요소 추가 함수들
  const addStage = () => {
    setShowStageTypeModal(true);
  };

  const handleStageTypeSelect = (type: 'basic' | 't' | 'arch' | 'round') => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    let props: StageProperties;
    let mesh: THREE.Mesh | THREE.Group;
    
    switch (type) {
      case 'basic':
        props = { width: 5.46, depth: 3.64, height: 0.6, material: 'plywood_carpet_black' };
        mesh = createStageMesh(props);
        break;
      case 't':
        props = { width: 5.46, depth: 3.64, height: 0.6, material: 'plywood_carpet_black' };
        const group = new THREE.Group();
        const main = createStageMesh(props);
        group.add(main);
        const tProps = { width: 2.0, depth: 1.2, height: 0.6, material: 'plywood_carpet_black' };
        const tMesh = createStageMesh(tProps);
        tMesh.position.set(0, 0, props.depth / 2 + tProps.depth / 2);
        group.add(tMesh);
        mesh = group;
        break;
      case 'arch':
        props = { width: 5.46, depth: 2.73, height: 0.6, material: 'plywood_carpet_black' };
        // 반원형 무대 생성
        const archRadius = props.width / 2;
        const archGeometry = new THREE.CylinderGeometry(archRadius, archRadius, props.height, 32, 1, false, 0, Math.PI);
        let color = 0x888888;
        if (props.material === 'plywood_carpet_black') color = 0x333333;
        else if (props.material === 'plywood_carpet_red') color = 0xcc0000;
        else if (props.material === 'plywood_carpet_gray') color = 0x777777;
        else if (props.material.startsWith('decotile')) color = 0x1a1a1a;
        const archMaterial = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7, metalness: 0.1 });
        mesh = new THREE.Mesh(archGeometry, archMaterial);
        // 반원형 무대를 올바른 방향으로 회전
        mesh.rotation.y = Math.PI / 2;
        break;
      case 'round':
        props = { width: 3.0, depth: 3.0, height: 0.6, material: 'plywood_carpet_black' };
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.5, 0.6, 64),
          new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
        );
        break;
      default:
        return;
    }
    
    const newObj: SceneObject = {
      id: `stage-${newIdCounter}`,
      type: 'stage',
      mesh,
      properties: { ...props, stageType: type },
      price: calculateStagePrice(props, type)
    };
    
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(mesh);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
    setShowStageTypeModal(false);
  };

  const addTruss = () => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    const defaultTrussProps: TrussProperties = { 
      width: 5.0, 
      depth: 3.0, 
      height: 3.0, 
      stageHeight: 0.5 
    };
    
    const trussMeshGroup = createTrussMesh(defaultTrussProps);
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
      width: 5.46,
      depth: 3.64,
      height: 2.0,
      stageType: 'basic'
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

  // 견적 관련 함수들
  const aggregateQuotationItems = (objects: SceneObject[]): QuotationItem[] => {
    const groupedItems: Map<string, QuotationItem> = new Map();

    objects.forEach(obj => {
      let key = "";
      let description = "";
      const props = obj.properties;

      switch (obj.type) {
        case 'stage':
          const stageProps = props as StageProperties;
          const stageTypeText = stageProps.stageType === 'arch' ? '아치형' : 
                               stageProps.stageType === 'round' ? '원형' : 
                               stageProps.stageType === 't' ? 'T자형' : '기본형';
          key = `stage-${stageProps.stageType}-${stageProps.width}-${stageProps.depth}-${stageProps.height}-${stageProps.material}`;
          if (stageProps.stageType === 'arch') {
            const radius = stageProps.width / 2;
            description = `${stageTypeText} 스테이지 (반지름: ${radius.toFixed(2)}m, 높이: ${stageProps.height.toFixed(2)}m, 재질: ${stageProps.material})`;
          } else if (stageProps.stageType === 'round') {
            const radius = stageProps.width / 2;
            description = `${stageTypeText} 스테이지 (반지름: ${radius.toFixed(2)}m, 높이: ${stageProps.height.toFixed(2)}m, 재질: ${stageProps.material})`;
          } else {
            description = `${stageTypeText} 스테이지 (${stageProps.width.toFixed(2)}m x ${stageProps.depth.toFixed(2)}m x ${stageProps.height.toFixed(2)}m, 재질: ${stageProps.material})`;
          }
          break;
        case 'truss':
          const trussProps = props as TrussProperties;
          key = `truss-${trussProps.width}-${trussProps.depth}-${trussProps.height}`;
          description = `트러스 (${trussProps.width.toFixed(2)}m x ${trussProps.depth.toFixed(2)}m x ${trussProps.height.toFixed(2)}m)`;
          break;
        case 'layher':
          const layherProps = props as LayherProperties;
          key = `layher-${layherProps.width}-${layherProps.depth}-${layherProps.height}`;
          description = `레이허 (${layherProps.width.toFixed(2)}m x ${layherProps.depth.toFixed(2)}m x ${layherProps.height.toFixed(2)}m)`;
          break;
        case 'lighting':
          const lightingProps = props as LightingProperties;
          key = `lighting-${lightingProps.type}-${lightingProps.color}-${lightingProps.intensity}`;
          description = `조명 (타입: ${lightingProps.type}, 색상: ${lightingProps.color}, 강도: ${lightingProps.intensity})`;
          break;
        default:
          key = `unknown-${obj.id}`;
          description = `알 수 없는 항목 (${obj.id})`;
          break;
      }

      if (groupedItems.has(key)) {
        const existingItem = groupedItems.get(key)!;
        existingItem.quantity += 1;
        existingItem.amount = existingItem.quantity * existingItem.unitPrice;
      } else {
        groupedItems.set(key, {
          id: key, 
          description: description,
          quantity: 1,
          unitPrice: obj.price, 
          amount: obj.price,
        });
      }
    });

    return Array.from(groupedItems.values());
  };

  const updateTotalQuote = (currentObjects?: SceneObject[]) => {
    const objectsToProcess = currentObjects || sceneObjects;
    const aggregatedItems = aggregateQuotationItems(objectsToProcess);
    setQuotationItems(aggregatedItems);

    const newTotalPrice = aggregatedItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalPrice(newTotalPrice);

    if (onQuotationChange) {
      onQuotationChange(aggregatedItems);
    }
  };

  // 객체 선택/해제 함수들
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

  const selectObject = (objToSelect: SceneObject) => {
    if (selectedObject) {
      setMaterialEmissiveRecursive(selectedObject.mesh, 0x000000);
    }
    setMaterialEmissiveRecursive(objToSelect.mesh, 0xaaaaaa); 
    setSelectedObject(objToSelect);
    setupDragControls(objToSelect); 
  };

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

  // 드래그 컨트롤 설정
  const setupDragControls = (targetObject: SceneObject) => {
    if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;
    
    if (dragControlsRef.current) {
      dragControlsRef.current.dispose();
    }

    const controls = new DragControls([targetObject.mesh], cameraRef.current, rendererRef.current.domElement);
    
    interface DragControlsEvent {
      type: 'dragstart' | 'drag' | 'dragend';
      object: THREE.Object3D;
    }

    const onDragStart = (event: DragControlsEvent) => {
      if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
      setMaterialEmissiveRecursive(event.object, 0xcccccc); 
    };

    const onDrag = (event: DragControlsEvent) => {
      event.object.position.x = Math.round(event.object.position.x / GRID_SIZE) * GRID_SIZE;
      event.object.position.z = Math.round(event.object.position.z / GRID_SIZE) * GRID_SIZE;
    };

    const onDragEnd = (event: DragControlsEvent) => {
      if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
      setMaterialEmissiveRecursive(event.object, 0xaaaaaa);
      
      const updatedObjects = sceneObjects.map(obj => {
        if (obj.id === targetObject.id) {
          return { ...obj, mesh: event.object as THREE.Mesh | THREE.Group }; 
        }
        return obj;
      });
      setSceneObjects(updatedObjects);
    };

    controls.addEventListener('dragstart', onDragStart);
    controls.addEventListener('drag', onDrag);
    controls.addEventListener('dragend', onDragEnd);

    dragControlsRef.current = controls;
  };

  // 카메라 및 뷰 컨트롤
  const resetCamera = () => {
    if (cameraRef.current && orbitControlsRef.current && initialCameraPositionRef.current && initialCameraLookAtRef.current) {
      cameraRef.current.position.copy(initialCameraPositionRef.current);
      orbitControlsRef.current.target.copy(initialCameraLookAtRef.current);
      orbitControlsRef.current.update();
    }
  };

  const toggleGrid = () => {
    const newGridVisible = !gridVisible;
    setGridVisible(newGridVisible);
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = newGridVisible;
    }
  };

  const toggleAxes = () => {
    setAxesVisible(!axesVisible);
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = !axesVisible;
    }
  };

  // 캔버스 클릭 이벤트 핸들러
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current || !sceneRef.current || !cameraRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
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

  // 모달 핸들러
  const handleOpenQuotationModal = () => {
    setIsQuotationModalOpen(true);
  };

  const handleCloseQuotationModal = () => {
    setIsQuotationModalOpen(false);
  };

  // 씬 초기화
  useEffect(() => {
    if (!mountRef.current) return;

    setLoading(true);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);
    sceneRef.current = scene;

    const container = mountRef.current;
    
    const camera = new THREE.PerspectiveCamera(
      60, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      2000
    );
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement); 

    const orbitControls = new OrbitControls(camera, renderer.domElement); 
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 3;
    orbitControls.maxDistance = 100;
    orbitControlsRef.current = orbitControls;

    // Store initial camera state
    if (!initialCameraPositionRef.current) {
      initialCameraPositionRef.current = camera.position.clone();
    }
    if (!initialCameraLookAtRef.current) {
      initialCameraLookAtRef.current = orbitControls.target.clone();
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0xcccccc);
    gridHelper.visible = gridVisible;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.visible = axesVisible;
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;

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
      if (mountRef.current && rendererRef.current && rendererRef.current.domElement) {
        if (mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (orbitControlsRef.current) {
        orbitControlsRef.current.dispose();
        orbitControlsRef.current = null;
      }
      if (dragControlsRef.current) {
        dragControlsRef.current.dispose();
        dragControlsRef.current = null;
      }
      sceneRef.current = null;
      cameraRef.current = null;
      gridHelperRef.current = null;
      axesHelperRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-row h-full">
      {/* Left Column: Controls */}
      <div className="w-80 bg-white p-4 overflow-y-auto flex-shrink-0 border-r border-gray-300 space-y-4">
        <section className="p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            요소 추가
          </h2>
          <div className="space-y-3">
            <button 
              onClick={addStage}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transform transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 flex items-center justify-center"
            >
              무대 추가
            </button>
            <button 
              onClick={addTruss}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transform transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 flex items-center justify-center"
            >
              트러스 추가
            </button>
            <button 
              onClick={addLayher}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transform transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 flex items-center justify-center"
            >
              레이허 추가
            </button>
            <button 
              onClick={addLighting}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transform transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 flex items-center justify-center"
            >
              조명 추가
            </button>
          </div>
        </section>

        {/* 견적 관리 섹션 */}
        <section className="p-5 bg-gradient-to-r from-sky-50 to-cyan-100 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            견적 관리
          </h2>
          <div className="bg-white p-4 rounded-lg shadow-inner mb-4 space-y-3 max-h-60 overflow-y-auto">
            {quotationItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">견적 항목이 없습니다. 요소를 추가하여 견적을 생성하세요.</p>
            ) : (
              quotationItems.map((item, index) => (
                <div key={item.id || index} className="text-sm border-b border-gray-200 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                  <p className="font-semibold text-gray-700">{item.description}</p>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>수량: {item.quantity}</span>
                    <span>단가: {item.unitPrice.toLocaleString()}원</span>
                    <span className="font-medium">합계: {item.amount.toLocaleString()}원</span>
                  </div>
                </div>
              ))
            )}
          </div>
          {quotationItems.length > 0 && (
            <div className="text-right font-bold text-lg text-gray-800 mb-4">
              총 견적 금액: {totalPrice.toLocaleString()}원
            </div>
          )}
          <button
            onClick={handleOpenQuotationModal}
            disabled={quotationItems.length === 0}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transform transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            견적서 생성하기
          </button>
        </section>
      </div>

      {/* Center Column: 3D Viewer */}
      <div className="flex-grow p-2 relative bg-gray-200 flex flex-col">
        <div className="absolute top-3 left-3 z-10 w-24 h-24" ref={gizmoRef}></div>
        <div ref={mountRef} onClick={handleCanvasClick} className="w-full h-full bg-gray-300 border border-gray-400 rounded-md shadow-inner cursor-grab active:cursor-grabbing flex-grow"></div>
        <div className="absolute bottom-3 right-3 flex space-x-2 z-10">
          <button onClick={resetCamera} className="py-2 px-3 bg-white text-sm rounded-md shadow hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">카메라 초기화</button>
          <button onClick={toggleGrid} className="py-2 px-3 bg-white text-sm rounded-md shadow hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">그리드 {gridVisible ? '숨기기' : '표시'}</button>
          <button onClick={toggleAxes} className="py-2 px-3 bg-white text-sm rounded-md shadow hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">좌표축 {axesVisible ? '숨기기' : '표시'}</button>
        </div>
      </div>

      {/* Modals */}
      {isQuotationModalOpen && (
        <QuotationTemplateModal
          isOpen={isQuotationModalOpen}
          onClose={handleCloseQuotationModal}
          quotationData={{
            id: `QT-${Date.now()}`,
            client: '클라이언트 이름 (임시)',
            title: '3D 구성 견적서',
            amount: totalPrice,
            status: '초안',
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
            items: quotationItems,
            description: '3D 구성을 통해 생성된 견적입니다.',
            terms: '세부 조건은 협의 후 결정됩니다.',
            companyInfo: {
              name: '시스룩 (Syslook)',
              address: '서울특별시 강남구 테헤란로 123, 4층',
              phone: '02-123-4567',
              email: 'contact@syslook.com',
              logo: '/images/logo.png'
            },
                         clientInfo: {
               name: '고객사명 입력',
               address: '',
               phone: '',
               email: ''
             }
          }}
        />
      )}
      
      {showStageTypeModal && (
        <StageTypeSelectModal
          open={showStageTypeModal}
          onClose={() => setShowStageTypeModal(false)}
          onSelect={handleStageTypeSelect}
        />
      )}
    </div>
  );
};

export default ThreeDConfigurator; 
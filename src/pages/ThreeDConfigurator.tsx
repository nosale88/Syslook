import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import QuotationTemplateModal, { QuotationData as ModalQuotationData } from '../components/quotation/QuotationTemplateModal';
import StageTypeSelectModal from '../components/StageTypeSelectModal';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { ChevronDown, ChevronRight, Square, Lightbulb, Volume2, Users, Palette, Camera, Zap, Search, Plus, Layout, Trash2 } from 'lucide-react';

// 상수 및 가격 정보
const STAGE_UNIT_PRICE_PLYWOOD = 20000;
const STAGE_UNIT_PRICE_DECOTILE_USED = 6173;
const STAGE_UNIT_PRICE_DECOTILE_NEW = 30864;
const TRUSS_PRICE_PER_METER = 15000;
const LAYHER_PRICE_PER_CUBIC_METER = 35000;
const LIGHTING_PRICE_SPOT = 50000;
const LIGHTING_PRICE_POINT = 30000;
const LIGHTING_PRICE_WASH = 80000;
const LIGHTING_PRICE_BEAM = 120000;
const LIGHTING_PRICE_STROBE = 60000;
const LIGHTING_PRICE_LASER = 200000;
const GRID_SIZE = 0.1;

// 확장된 타입 정의
type LEDScreenProperties = {
  width: number;
  height: number;
  depth?: number;
  resolution?: 'low' | 'medium' | 'high' | 'ultra';
  installationType?: 'wall-mounted' | 'ground-stacked' | 'flown' | 'curved';
  pixelPitch?: number;
  brightness?: number;
  content?: string;
};

type SpeakerProperties = {
  type: 'main' | 'monitor' | 'subwoofer' | 'line-array' | 'delay';
  width: number;
  height: number;
  depth: number;
  power?: number;
  frequency?: string;
};

type ChairProperties = {
  type: 'standard' | 'vip' | 'standing' | 'round-table' | 'cocktail-table' | 'bench';
  shape?: 'rectangular' | 'circular' | 'u-shape' | 'theater';
  width?: number;
  depth?: number;
  rows: number;
  columns: number;
  spacing: number;
  tableSize?: number;
};

type DecorationProperties = {
  type: 'backdrop' | 'banner' | 'flower' | 'arch' | 'balloon' | 'fabric-draping' | 'neon-sign';
  width: number;
  height: number;
  color: string;
  material?: string;
  style?: string;
};

type SpecialEffectProperties = {
  type: 'fog-machine' | 'bubble-machine' | 'confetti-cannon' | 'pyrotechnics' | 'co2-jet';
  intensity: number;
  duration?: number;
  color?: string;
  coverage?: number;
};

type CameraProperties = {
  type: 'fixed' | 'ptz' | 'crane' | 'steadicam' | 'drone';
  resolution: '1080p' | '4K' | '8K';
  range?: number;
  height?: number;
};

interface SceneObject {
  id: string;
  type: 'stage' | 'truss' | 'layher' | 'lighting' | 'led_screen' | 'speaker' | 'chair' | 'decoration' | 'special_effect' | 'camera';
  mesh: THREE.Mesh | THREE.Group;
  properties: any;
  price: number;
}

interface StageProperties {
  width: number;
  depth: number;
  height: number;
  material: string;
  stageType?: 'basic' | 't' | 'arch' | 'round' | 'runway' | 'thrust';
}

interface TrussProperties {
  width: number;
  depth: number;
  height: number;
  stageHeight?: number;
  stageType?: 'basic' | 't' | 'arch' | 'round';
  trussType?: 'box' | 'triangle' | 'circle';
}

interface LayherProperties {
  width: number;
  depth: number;
  height: number;
  stageType?: 'basic' | 't' | 'arch' | 'round';
}

interface LightingProperties {
  type: 'spot' | 'point' | 'wash' | 'beam' | 'strobe' | 'laser' | 'led-strip' | 'par' | 'fresnel';
  color: string;
  intensity: number;
  distance?: number;
  angle?: number;
  penumbra?: number;
  decay?: number;
  targetPosition?: { x: number; y: number; z: number };
  dmxChannel?: number;
  gobo?: string;
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

// 카테고리 정의
const ELEMENT_CATEGORIES = [
  {
    id: 'templates',
    name: '템플릿',
    icon: Layout,
    color: 'from-purple-500 to-indigo-600',
    items: [
      { id: 'concert-hall', name: '콘서트 홀', description: '아치형 무대 + 좌석 + 트러스 + 조명', action: 'loadConcertHallTemplate' },
    ]
  },
  {
    id: 'stage',
    name: '무대 & 구조',
    icon: Square,
    color: 'from-green-500 to-teal-600',
    items: [
      { id: 'stage', name: '무대', description: '기본/T자/아치/원형/런웨이', action: 'addStage' },
      { id: 'truss', name: '트러스', description: '박스/삼각/원형 트러스', action: 'addTruss' },
      { id: 'layher', name: '레이허', description: '비계 구조물', action: 'addLayher' },
    ]
  },
  {
    id: 'lighting',
    name: '조명',
    icon: Lightbulb,
    color: 'from-orange-500 to-amber-600',
    items: [
      { id: 'spot', name: '스팟 조명', description: '집중 조명', action: 'addLighting', subType: 'spot' },
      { id: 'wash', name: '워시 조명', description: '면 조명', action: 'addLighting', subType: 'wash' },
      { id: 'beam', name: '빔 조명', description: '무빙 빔', action: 'addLighting', subType: 'beam' },
      { id: 'strobe', name: '스트로브', description: '섬광 조명', action: 'addLighting', subType: 'strobe' },
      { id: 'laser', name: '레이저', description: '레이저 쇼', action: 'addLighting', subType: 'laser' },
      { id: 'led-strip', name: 'LED 스트립', description: '라인 조명', action: 'addLighting', subType: 'led-strip' },
    ]
  },
  {
    id: 'audio',
    name: '음향',
    icon: Volume2,
    color: 'from-indigo-500 to-blue-600',
    items: [
      { id: 'main-speaker', name: '메인 스피커', description: '주 음향 시스템', action: 'addSpeaker', subType: 'main' },
      { id: 'monitor', name: '모니터 스피커', description: '무대 모니터링', action: 'addSpeaker', subType: 'monitor' },
      { id: 'subwoofer', name: '서브우퍼', description: '저음 전용', action: 'addSpeaker', subType: 'subwoofer' },
      { id: 'line-array', name: '라인 어레이', description: '대형 음향', action: 'addSpeaker', subType: 'line-array' },
      { id: 'delay', name: '딜레이 스피커', description: '후방 보조', action: 'addSpeaker', subType: 'delay' },
    ]
  },
  {
    id: 'seating',
    name: '좌석 & 테이블',
    icon: Users,
    color: 'from-emerald-500 to-green-600',
    items: [
      { id: 'standard-chair', name: '일반 의자', description: '기본 좌석', action: 'addChair', subType: 'standard' },
      { id: 'vip-chair', name: 'VIP 의자', description: '프리미엄 좌석', action: 'addChair', subType: 'vip' },
      { id: 'round-table', name: '원형 테이블', description: '연회용 테이블', action: 'addChair', subType: 'round-table' },
      { id: 'cocktail-table', name: '칵테일 테이블', description: '스탠딩 테이블', action: 'addChair', subType: 'cocktail-table' },
      { id: 'bench', name: '벤치', description: '긴 의자', action: 'addChair', subType: 'bench' },
      { id: 'standing', name: '스탠딩 구역', description: '입석 공간', action: 'addChair', subType: 'standing' },
    ]
  },
  {
    id: 'visual',
    name: '영상 & 디스플레이',
    icon: Camera,
    color: 'from-red-500 to-pink-600',
    items: [
      { id: 'led-screen', name: 'LED 스크린', description: '대형 디스플레이', action: 'addLEDScreen' },
      { id: 'projector', name: '프로젝터', description: '영상 투사', action: 'addProjector' },
      { id: 'camera', name: '카메라', description: '촬영 장비', action: 'addCamera' },
    ]
  },
  {
    id: 'decoration',
    name: '장식 & 연출',
    icon: Palette,
    color: 'from-rose-500 to-pink-600',
    items: [
      { id: 'backdrop', name: '백드롭', description: '배경막', action: 'addDecoration', subType: 'backdrop' },
      { id: 'banner', name: '배너', description: '현수막', action: 'addDecoration', subType: 'banner' },
      { id: 'flower', name: '화분', description: '식물 장식', action: 'addDecoration', subType: 'flower' },
      { id: 'arch', name: '아치 게이트', description: '입구 장식', action: 'addDecoration', subType: 'arch' },
      { id: 'balloon', name: '풍선 장식', description: '파티 장식', action: 'addDecoration', subType: 'balloon' },
      { id: 'fabric-draping', name: '패브릭 드레이핑', description: '천 장식', action: 'addDecoration', subType: 'fabric-draping' },
    ]
  },
  {
    id: 'effects',
    name: '특수 효과',
    icon: Zap,
    color: 'from-purple-500 to-violet-600',
    items: [
      { id: 'fog-machine', name: '연기 머신', description: '안개 효과', action: 'addSpecialEffect', subType: 'fog-machine' },
      { id: 'bubble-machine', name: '버블 머신', description: '비누방울', action: 'addSpecialEffect', subType: 'bubble-machine' },
      { id: 'confetti-cannon', name: '컨페티 캐논', description: '색종이 발사', action: 'addSpecialEffect', subType: 'confetti-cannon' },
      { id: 'co2-jet', name: 'CO2 제트', description: '이산화탄소 분사', action: 'addSpecialEffect', subType: 'co2-jet' },
    ]
  },
];

const ThreeDConfiguratorEnhanced: React.FC<ThreeDConfiguratorProps> = ({ onQuotationChange, initialObjects }) => {
  // Three.js refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const dragControlsRef = useRef<DragControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const initialCameraPositionRef = useRef<THREE.Vector3 | null>(null);
  const initialCameraLookAtRef = useRef<THREE.Vector3 | null>(null);

  // UI 상태
  const [activeCategory, setActiveCategory] = useState<string>('templates');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['templates']));
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 팝업 상태
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

  // 카테고리 토글
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // 검색 필터링
  const getFilteredCategories = () => {
    if (!searchTerm) return ELEMENT_CATEGORIES;
    
    return ELEMENT_CATEGORIES.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.items.length > 0);
  };

  // 가격 계산 함수들
  const calculateStagePrice = (props: StageProperties, stageType?: string): number => {
    let area: number;
    
    if (stageType === 'arch') {
      const radius = props.width / 2;
      area = (Math.PI * radius * radius) / 2;
    } else if (stageType === 'round') {
      const radius = props.width / 2;
      area = Math.PI * radius * radius;
    } else {
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
      case 'spot': return LIGHTING_PRICE_SPOT;
      case 'point': return LIGHTING_PRICE_POINT;
      case 'wash': return LIGHTING_PRICE_WASH;
      case 'beam': return LIGHTING_PRICE_BEAM;
      case 'strobe': return LIGHTING_PRICE_STROBE;
      case 'laser': return LIGHTING_PRICE_LASER;
      default: return 50000;
    }
  };

  const calculateLEDScreenPrice = (props: LEDScreenProperties): number => {
    const area = props.width * props.height;
    let unitPrice = 50000;
    
    if (props.resolution === 'high') unitPrice *= 2;
    else if (props.resolution === 'medium') unitPrice *= 1.5;
    else if (props.resolution === 'ultra') unitPrice *= 3;
    
    if (props.installationType === 'flown') unitPrice *= 1.3;
    else if (props.installationType === 'wall-mounted') unitPrice *= 1.1;
    
    return area * unitPrice;
  };

  const calculateSpeakerPrice = (props: SpeakerProperties): number => {
    let basePrice = 150000;
    
    if (props.type === 'main') basePrice = 300000;
    else if (props.type === 'monitor') basePrice = 150000;
    else if (props.type === 'subwoofer') basePrice = 100000;
    else if (props.type === 'line-array') basePrice = 200000;
    else if (props.type === 'delay') basePrice = 50000;
    
    const volume = props.width * props.height * props.depth;
    return basePrice + (volume * 10000);
  };

  const calculateChairPrice = (props: ChairProperties): number => {
    let unitPrice = 5000;
    
    if (props.type === 'vip') unitPrice = 15000;
    else if (props.type === 'standing') unitPrice = 0;
    else if (props.type === 'round-table') unitPrice = 25000;
    else if (props.type === 'cocktail-table') unitPrice = 20000;
    else if (props.type === 'bench') unitPrice = 8000;
    
    return props.rows * props.columns * unitPrice;
  };

  const calculateDecorationPrice = (props: DecorationProperties): number => {
    const area = props.width * props.height;
    let unitPrice = 20000;
    
    if (props.type === 'backdrop') unitPrice = 30000;
    else if (props.type === 'banner') unitPrice = 15000;
    else if (props.type === 'flower') unitPrice = 50000;
    else if (props.type === 'arch') unitPrice = 80000;
    else if (props.type === 'balloon') unitPrice = 10000;
    else if (props.type === 'fabric-draping') unitPrice = 25000;
    
    return area * unitPrice;
  };

  // 3D 객체 생성 함수들
  const createStageMesh = (props: StageProperties): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry(props.width, props.height, props.depth);
    let color = 0x888888;
    if (props.material === 'plywood_carpet_black') color = 0x333333;
    else if (props.material === 'plywood_carpet_red') color = 0xcc0000;
    else if (props.material === 'plywood_carpet_gray') color = 0x777777;
    else if (props.material.startsWith('decotile')) color = 0x1a1a1a;
    const material = new THREE.MeshLambertMaterial({ color: color });
    const stageMesh = new THREE.Mesh(geometry, material);
    stageMesh.position.y = props.height / 2;
    return stageMesh;
  };

    const createTrussMesh = (props: TrussProperties): THREE.Group => {
    const group = new THREE.Group();
    const trussRadius = 0.03;
    const trussMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xB8B8B8
    });

    const stageWidth = props.width;
    const stageDepth = props.depth;
    const trussStructureHeight = props.height;
    const stagePlatformHeight = props.stageHeight || 0.6;

    // 수직 기둥들 (4개 코너)
    const postPositions = [
      { x: -stageWidth / 2, z: -stageDepth / 2 }, 
      { x: stageWidth / 2, z: -stageDepth / 2 },
      { x: -stageWidth / 2, z: stageDepth / 2 },  
      { x: stageWidth / 2, z: stageDepth / 2 },
    ];
    
    postPositions.forEach(pos => {
      // 메인 수직 기둥
      const geometry = new THREE.CylinderGeometry(trussRadius * 1.2, trussRadius * 1.2, trussStructureHeight, 8);
      const post = new THREE.Mesh(geometry, trussMaterial);
      post.position.set(pos.x, stagePlatformHeight + trussStructureHeight / 2, pos.z);
      group.add(post);
      
      // 수직 격자 구조 (각 기둥마다)
      for (let h = 1; h < 4; h++) {
        const y = stagePlatformHeight + (trussStructureHeight / 4) * h;
        
        // X 방향 격자
        if (pos.x === -stageWidth / 2) { // 좌측 기둥들만
          const xBeam = new THREE.CylinderGeometry(trussRadius * 0.7, trussRadius * 0.7, stageWidth, 6);
          const xBeamMesh = new THREE.Mesh(xBeam, trussMaterial);
          xBeamMesh.rotation.z = Math.PI / 2;
          xBeamMesh.position.set(0, y, pos.z);
          group.add(xBeamMesh);
        }
        
        // Z 방향 격자
        if (pos.z === -stageDepth / 2) { // 전면 기둥들만
          const zBeam = new THREE.CylinderGeometry(trussRadius * 0.7, trussRadius * 0.7, stageDepth, 6);
          const zBeamMesh = new THREE.Mesh(zBeam, trussMaterial);
          zBeamMesh.rotation.x = Math.PI / 2;
          zBeamMesh.position.set(pos.x, y, 0);
          group.add(zBeamMesh);
        }
      }
    });

    // 상단 프레임 (조명 매달 부분)
    const topY = stagePlatformHeight + trussStructureHeight;
    
    // 상단 메인 빔들
    const mainBeamPositions = [
      { start: [-stageWidth/2, topY, -stageDepth/2], end: [stageWidth/2, topY, -stageDepth/2] }, // 전면
      { start: [-stageWidth/2, topY, stageDepth/2], end: [stageWidth/2, topY, stageDepth/2] },   // 후면
      { start: [-stageWidth/2, topY, -stageDepth/2], end: [-stageWidth/2, topY, stageDepth/2] }, // 좌측
      { start: [stageWidth/2, topY, -stageDepth/2], end: [stageWidth/2, topY, stageDepth/2] },   // 우측
    ];
    
    mainBeamPositions.forEach((beam, index) => {
      const length = index < 2 ? stageWidth : stageDepth;
      const geometry = new THREE.CylinderGeometry(trussRadius * 1.1, trussRadius * 1.1, length, 8);
      const beamMesh = new THREE.Mesh(geometry, trussMaterial);
      
      if (index < 2) { // 전후 빔
        beamMesh.rotation.z = Math.PI / 2;
        beamMesh.position.set(0, topY, beam.start[2]);
      } else { // 좌우 빔
        beamMesh.rotation.x = Math.PI / 2;
        beamMesh.position.set(beam.start[0], topY, 0);
      }
      
      group.add(beamMesh);
    });

    // 상단 격자 구조 (조명 매달기용) - 간소화
    const gridSpacing = 2.0;
    for (let x = -stageWidth/2 + gridSpacing; x < stageWidth/2; x += gridSpacing) {
      const crossBeam = new THREE.CylinderGeometry(trussRadius * 0.6, trussRadius * 0.6, stageDepth, 6);
      const crossBeamMesh = new THREE.Mesh(crossBeam, trussMaterial);
      crossBeamMesh.rotation.x = Math.PI / 2;
      crossBeamMesh.position.set(x, topY, 0);
      group.add(crossBeamMesh);
    }

    // 대각선 보강재 (X자 형태)
    postPositions.forEach(pos => {
      for (let h = 0; h < 3; h++) {
        const y1 = stagePlatformHeight + (trussStructureHeight / 3) * h;
        const y2 = stagePlatformHeight + (trussStructureHeight / 3) * (h + 1);
        
        // 각 면에 X자 보강재
        if (pos.x === -stageWidth / 2 && pos.z === -stageDepth / 2) {
          // 전면 X자
          const diagLength = Math.sqrt(Math.pow(stageWidth, 2) + Math.pow(trussStructureHeight/3, 2));
          
          // 좌상-우하 대각선
          const diag1 = new THREE.CylinderGeometry(trussRadius * 0.5, trussRadius * 0.5, diagLength, 6);
          const diag1Mesh = new THREE.Mesh(diag1, trussMaterial);
          diag1Mesh.position.set(0, (y1 + y2) / 2, -stageDepth / 2);
          diag1Mesh.rotation.z = Math.atan((y2 - y1) / stageWidth);
          group.add(diag1Mesh);
          
          // 우상-좌하 대각선
          const diag2Mesh = new THREE.Mesh(diag1, trussMaterial);
          diag2Mesh.position.set(0, (y1 + y2) / 2, -stageDepth / 2);
          diag2Mesh.rotation.z = -Math.atan((y2 - y1) / stageWidth);
          group.add(diag2Mesh);
        }
      }
    });

    return group;
  };

  const createLayherMesh = (props: LayherProperties): THREE.Group => {
    const group = new THREE.Group();
    const metalMaterial = new THREE.MeshLambertMaterial({ color: 0x505050 });
    const pipeRadius = 0.048 / 2;

    const halfWidth = props.width / 2;
    const halfDepth = props.depth / 2;

    const postPositions = [
      { x: -halfWidth, z: -halfDepth }, { x: halfWidth, z: -halfDepth },
      { x: -halfWidth, z: halfDepth },  { x: halfWidth, z: halfDepth }
    ];
    
    postPositions.forEach(pos => {
      const geometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, props.height, 8);
      const post = new THREE.Mesh(geometry, metalMaterial);
      post.position.set(pos.x, props.height / 2, pos.z);
      group.add(post);
    });

    return group;
  };

    const createLightingMesh = (props: LightingProperties): THREE.Group => {
    const group = new THREE.Group();
    
    // 조명 기구 본체 (간소화)
    const lightBodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
    const lightBodyMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2A2A2A
    });
    const lightBody = new THREE.Mesh(lightBodyGeometry, lightBodyMaterial);
    group.add(lightBody);
    
    // 조명 렌즈/전면부
    const lensGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8);
    const lensMaterial = new THREE.MeshBasicMaterial({ 
      color: props.color === '#ffffff' ? 0xF0F0F0 : parseInt(props.color.replace('#', '0x'))
    });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.position.y = -0.225;
    group.add(lens);

    // 실제 조명 (Three.js Light) - 간소화
    let light: THREE.Light;
    switch (props.type) {
      case 'spot':
        const spotLight = new THREE.SpotLight(props.color, props.intensity * 0.5, props.distance, props.angle, props.penumbra, props.decay);
        spotLight.position.set(0, -0.2, 0);
        spotLight.target.position.set(0, -5, 0);
        light = spotLight;
        break;
      case 'point':
        const pointLight = new THREE.PointLight(props.color, props.intensity * 0.5, props.distance, props.decay);
        pointLight.position.set(0, -0.2, 0);
        light = pointLight;
        break;
      case 'wash':
        const washLight = new THREE.SpotLight(props.color, props.intensity * 0.5, props.distance || 50, Math.PI / 3, 0.3, 1);
        washLight.position.set(0, -0.2, 0);
        washLight.target.position.set(0, -10, 0);
        light = washLight;
        break;
      case 'beam':
        const beamLight = new THREE.SpotLight(props.color, props.intensity * 0.5, props.distance || 100, Math.PI / 8, 0.1, 1);
        beamLight.position.set(0, -0.2, 0);
        beamLight.target.position.set(0, -15, 0);
        light = beamLight;
        break;
      case 'strobe':
        const strobeLight = new THREE.PointLight(props.color, props.intensity, props.distance || 30);
        strobeLight.position.set(0, -0.2, 0);
        light = strobeLight;
        break;
      case 'laser':
        const laserLight = new THREE.SpotLight(props.color, props.intensity * 0.5, props.distance || 200, Math.PI / 16, 0, 2);
        laserLight.position.set(0, -0.2, 0);
        laserLight.target.position.set(0, -20, 0);
        light = laserLight;
        break;
      default:
        light = new THREE.PointLight(0xffffff, 0, 0);
        break;
    }
    
    light.name = "actual_light";
    group.add(light);
    
    // 조명 방향 조정 (아래쪽을 향하도록)
    group.rotation.x = Math.PI;
    
    return group;
  };

  const createLEDScreenMesh = (props: LEDScreenProperties): THREE.Group => {
    const group = new THREE.Group();
    
    const screenGeometry = new THREE.BoxGeometry(props.width, props.height, props.depth || 0.1);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.y = props.height / 2;
    group.add(screen);
    
    const frameThickness = 0.05;
    const frameGeometry = new THREE.BoxGeometry(
      props.width + frameThickness * 2, 
      props.height + frameThickness * 2, 
      frameThickness
    );
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = props.height / 2;
    frame.position.z = -(props.depth || 0.1) / 2 - frameThickness / 2;
    group.add(frame);
    
    return group;
  };

  const createSpeakerMesh = (props: SpeakerProperties): THREE.Group => {
    const group = new THREE.Group();
    
    const speakerGeometry = new THREE.BoxGeometry(props.width, props.height, props.depth);
    const speakerMaterial = new THREE.MeshLambertMaterial({ 
      color: props.type === 'main' ? 0x222222 : 
             props.type === 'monitor' ? 0x444444 :
             props.type === 'subwoofer' ? 0x555555 :
             props.type === 'line-array' ? 0x666666 : 0x777777 
    });
    const speaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
    speaker.position.y = props.height / 2;
    group.add(speaker);
    
    const grillGeometry = new THREE.CircleGeometry(Math.min(props.width, props.height) * 0.3, 16);
    const grillMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x111111
    });
    const grill = new THREE.Mesh(grillGeometry, grillMaterial);
    grill.position.set(0, props.height / 2, props.depth / 2 + 0.01);
    group.add(grill);
    
    return group;
  };

  const createChairMesh = (props: ChairProperties): THREE.Group => {
    const group = new THREE.Group();
    
    const chairWidth = props.width || 0.5;
    const chairDepth = props.depth || 0.5;
    const chairHeight = 0.8;
    
    for (let row = 0; row < props.rows; row++) {
      for (let col = 0; col < props.columns; col++) {
        if (props.type === 'round-table') {
          // 원형 테이블
          const tableGeometry = new THREE.CylinderGeometry(props.tableSize || 1, props.tableSize || 1, 0.05, 32);
          const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
          const table = new THREE.Mesh(tableGeometry, tableMaterial);
          table.position.set(
            col * (chairWidth + props.spacing) - (props.columns - 1) * (chairWidth + props.spacing) / 2,
            0.75,
            row * (chairDepth + props.spacing) - (props.rows - 1) * (chairDepth + props.spacing) / 2
          );
          group.add(table);
        } else if (props.type !== 'standing') {
          // 개선된 의자 모델
          const chairGroup = new THREE.Group();
          
          // 좌석
          const seatGeometry = new THREE.BoxGeometry(chairWidth * 0.9, 0.08, chairDepth * 0.9);
          const seatMaterial = new THREE.MeshLambertMaterial({ 
            color: props.type === 'vip' ? 0x8B0000 : 0x2C5AA0
          });
          const seat = new THREE.Mesh(seatGeometry, seatMaterial);
          seat.position.y = 0.45;
          chairGroup.add(seat);
          
          // 등받이
          const backGeometry = new THREE.BoxGeometry(chairWidth * 0.9, chairHeight * 0.6, 0.05);
          const backMaterial = new THREE.MeshLambertMaterial({ 
            color: props.type === 'vip' ? 0x8B0000 : 0x2C5AA0
          });
          const back = new THREE.Mesh(backGeometry, backMaterial);
          back.position.set(0, 0.7, -chairDepth * 0.4);
          chairGroup.add(back);
          
          // 다리 4개
          const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6);
          const legMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
          
          const legPositions = [
            [-chairWidth * 0.35, 0.225, -chairDepth * 0.35],
            [chairWidth * 0.35, 0.225, -chairDepth * 0.35],
            [-chairWidth * 0.35, 0.225, chairDepth * 0.35],
            [chairWidth * 0.35, 0.225, chairDepth * 0.35]
          ];
          
          legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            chairGroup.add(leg);
          });
          
          chairGroup.position.set(
            col * (chairWidth + props.spacing) - (props.columns - 1) * (chairWidth + props.spacing) / 2,
            0,
            row * (chairDepth + props.spacing) - (props.rows - 1) * (chairDepth + props.spacing) / 2
          );
          
          group.add(chairGroup);
        } else {
          // 스탠딩 구역
          const standingGeometry = new THREE.PlaneGeometry(chairWidth, chairDepth);
          const standingMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x90EE90,
            transparent: true,
            opacity: 0.3
          });
          const standing = new THREE.Mesh(standingGeometry, standingMaterial);
          standing.rotation.x = -Math.PI / 2;
          standing.position.set(
            col * (chairWidth + props.spacing) - (props.columns - 1) * (chairWidth + props.spacing) / 2,
            0.01,
            row * (chairDepth + props.spacing) - (props.rows - 1) * (chairDepth + props.spacing) / 2
          );
          group.add(standing);
        }
      }
    }
    
    return group;
  };

  const createDecorationMesh = (props: DecorationProperties): THREE.Group => {
    const group = new THREE.Group();
    
    switch (props.type) {
      case 'backdrop':
        const backdropGeometry = new THREE.PlaneGeometry(props.width, props.height);
        const backdropMaterial = new THREE.MeshLambertMaterial({ 
          color: props.color,
          side: THREE.DoubleSide
        });
        const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
        backdrop.position.y = props.height / 2;
        group.add(backdrop);
        break;
        
      case 'arch':
        const archGeometry = new THREE.TorusGeometry(props.width / 2, 0.2, 8, 32, Math.PI);
        const archMaterial = new THREE.MeshLambertMaterial({ color: props.color });
        const arch = new THREE.Mesh(archGeometry, archMaterial);
        arch.position.y = props.height / 2;
        arch.rotation.x = Math.PI / 2;
        group.add(arch);
        break;
        
      case 'flower':
        const potGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.4, 8);
        const potMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.y = 0.2;
        group.add(pot);
        
        const flowerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const flowerMaterial = new THREE.MeshLambertMaterial({ color: props.color });
        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        flower.position.y = 0.6;
        group.add(flower);
        break;
    }
    
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
      case 'arch':
        props = { width: 5.46, depth: 2.73, height: 0.6, material: 'plywood_carpet_black' };
        const archRadius = props.width / 2;
        const archGeometry = new THREE.CylinderGeometry(archRadius, archRadius, props.height, 16, 1, false, 0, Math.PI);
        const archMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        mesh = new THREE.Mesh(archGeometry, archMaterial);
        mesh.rotation.y = Math.PI / 2;
        break;
      case 'round':
        props = { width: 3.0, depth: 3.0, height: 0.6, material: 'plywood_carpet_black' };
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.5, 0.6, 16),
          new THREE.MeshLambertMaterial({ color: 0x3b82f6 })
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
    // 무대 밖 위치에 생성 (우측)
    trussMeshGroup.position.set(8, 0, 0);
    
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
    // 무대 밖 위치에 생성 (좌측)
    layherMeshGroup.position.set(-8, 0, 0);
    
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

  const addLighting = (lightType: string = 'spot') => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    const defaultLightingProps: LightingProperties = {
      type: lightType as any,
      color: '#ffffff',
      intensity: 1,
      distance: 100,
      angle: Math.PI / 4,
      penumbra: 0.1,
      decay: 1,
    };
    
    const lightingMeshGroup = createLightingMesh(defaultLightingProps);
    // 무대 밖 위치에 생성 (상단)
    lightingMeshGroup.position.set(0, 3, 8);
    
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

  const addLEDScreen = () => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    const defaultLEDScreenProps: LEDScreenProperties = {
      width: 3,
      height: 2,
      depth: 0.1,
      resolution: 'medium',
      installationType: 'ground-stacked',
      pixelPitch: 3.9,
      brightness: 5000
    };
    
    const ledScreenMesh = createLEDScreenMesh(defaultLEDScreenProps);
    // 무대 밖 위치에 생성 (후방)
    ledScreenMesh.position.set(0, 0, -8);
    
    const newObj: SceneObject = {
      id: `led-screen-${newIdCounter}`,
      type: 'led_screen',
      mesh: ledScreenMesh,
      properties: defaultLEDScreenProps,
      price: calculateLEDScreenPrice(defaultLEDScreenProps)
    };
    
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(ledScreenMesh);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  const addSpeaker = (speakerType: string = 'main') => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    const defaultSpeakerProps: SpeakerProperties = {
      type: speakerType as any,
      width: 0.6,
      height: 1.2,
      depth: 0.4,
      power: 500
    };
    
    const speakerMesh = createSpeakerMesh(defaultSpeakerProps);
    // 무대 밖 위치에 생성 (우측 전방)
    speakerMesh.position.set(6, 0, 6);
    
    const newObj: SceneObject = {
      id: `speaker-${newIdCounter}`,
      type: 'speaker',
      mesh: speakerMesh,
      properties: defaultSpeakerProps,
      price: calculateSpeakerPrice(defaultSpeakerProps)
    };
    
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(speakerMesh);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  const addChair = (chairType: string = 'standard') => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    const defaultChairProps: ChairProperties = {
      type: chairType as any,
      width: 0.5,
      depth: 0.5,
      rows: 5,
      columns: 10,
      spacing: 0.1
    };
    
    const chairMesh = createChairMesh(defaultChairProps);
    // 무대 밖 위치에 생성 (전방 관객석)
    chairMesh.position.set(0, 0, 10);
    
    const newObj: SceneObject = {
      id: `chair-${newIdCounter}`,
      type: 'chair',
      mesh: chairMesh,
      properties: defaultChairProps,
      price: calculateChairPrice(defaultChairProps)
    };
    
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(chairMesh);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  const addDecoration = (decorationType: string = 'backdrop') => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    const defaultDecorationProps: DecorationProperties = {
      type: decorationType as any,
      width: 4,
      height: 3,
      color: '#ffffff'
    };
    
    const decorationMesh = createDecorationMesh(defaultDecorationProps);
    // 무대 밖 위치에 생성 (좌측 전방)
    decorationMesh.position.set(-6, 0, 6);
    
    const newObj: SceneObject = {
      id: `decoration-${newIdCounter}`,
      type: 'decoration',
      mesh: decorationMesh,
      properties: defaultDecorationProps,
      price: calculateDecorationPrice(defaultDecorationProps)
    };
    
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(decorationMesh);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  const addSpecialEffect = (effectType: string = 'fog-machine') => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    // 특수 효과는 간단한 박스로 표현
    const effectGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
    const effectMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const effectMesh = new THREE.Mesh(effectGeometry, effectMaterial);
    effectMesh.position.y = 0.15;
    // 무대 밖 위치에 생성 (우측 후방)
    effectMesh.position.set(6, 0.15, -6);
    
    const newObj: SceneObject = {
      id: `effect-${newIdCounter}`,
      type: 'special_effect',
      mesh: effectMesh,
      properties: { type: effectType, intensity: 50 },
      price: 100000
    };
    
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(effectMesh);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  const addCamera = () => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    // 카메라는 간단한 박스로 표현
    const cameraGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.4);
    const cameraMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const cameraMesh = new THREE.Mesh(cameraGeometry, cameraMaterial);
    // 무대 밖 위치에 생성 (좌측 후방, 높이 1.5m)
    cameraMesh.position.set(-6, 1.5, -6);
    
    const newObj: SceneObject = {
      id: `camera-${newIdCounter}`,
      type: 'camera',
      mesh: cameraMesh,
      properties: { type: 'fixed', resolution: '4K' },
      price: 150000
    };
    
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(cameraMesh);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  const addProjector = () => {
    if (!sceneRef.current) return;
    const newIdCounter = objectIdCounter + 1;
    setObjectIdCounter(newIdCounter);
    
    // 프로젝터는 간단한 박스로 표현
    const projectorGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.3);
    const projectorMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const projectorMesh = new THREE.Mesh(projectorGeometry, projectorMaterial);
    // 무대 밖 위치에 생성 (중앙 후방, 높이 2m)
    projectorMesh.position.set(0, 2, -10);
    
    const newObj: SceneObject = {
      id: `projector-${newIdCounter}`,
      type: 'led_screen', // 프로젝터도 영상 장비로 분류
      mesh: projectorMesh,
      properties: { type: 'projector', lumens: 5000 },
      price: 80000
    };
    
    const updatedObjects = [...sceneObjects, newObj];
    setSceneObjects(updatedObjects);
    sceneRef.current.add(projectorMesh);
    updateTotalQuote(updatedObjects);
    selectObject(newObj);
  };

  // 아치형 트러스 생성 함수
  const createArchTruss = (radius: number, height: number, segments: number = 12): THREE.Group => {
    const group = new THREE.Group();
    const trussMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xB8B8B8
    });
    const trussRadius = 0.04;
    
    // 메인 아치 구조 (외부)
    for (let i = 0; i <= segments; i++) {
      const angle = (Math.PI * i) / segments;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius + height;
      
      if (i < segments) {
        const nextAngle = (Math.PI * (i + 1)) / segments;
        const nextX = Math.cos(nextAngle) * radius;
        const nextY = Math.sin(nextAngle) * radius + height;
        
        const segmentLength = Math.sqrt(
          Math.pow(nextX - x, 2) + Math.pow(nextY - y, 2)
        );
        
        const segmentGeometry = new THREE.CylinderGeometry(trussRadius * 1.2, trussRadius * 1.2, segmentLength, 6);
        const segment = new THREE.Mesh(segmentGeometry, trussMaterial);
        
        segment.position.set((x + nextX) / 2, (y + nextY) / 2, 0);
        segment.rotation.z = Math.atan2(nextY - y, nextX - x) - Math.PI / 2;
        
        group.add(segment);
      }
    }
    
    // 내부 아치 구조 (격자용)
    const innerRadius = radius * 0.85;
    for (let i = 0; i <= segments; i++) {
      const angle = (Math.PI * i) / segments;
      const x = Math.cos(angle) * innerRadius;
      const y = Math.sin(angle) * innerRadius + height;
      
      if (i < segments) {
        const nextAngle = (Math.PI * (i + 1)) / segments;
        const nextX = Math.cos(nextAngle) * innerRadius;
        const nextY = Math.sin(nextAngle) * innerRadius + height;
        
        const segmentLength = Math.sqrt(
          Math.pow(nextX - x, 2) + Math.pow(nextY - y, 2)
        );
        
        const segmentGeometry = new THREE.CylinderGeometry(trussRadius * 0.8, trussRadius * 0.8, segmentLength, 6);
        const segment = new THREE.Mesh(segmentGeometry, trussMaterial);
        
        segment.position.set((x + nextX) / 2, (y + nextY) / 2, 0);
        segment.rotation.z = Math.atan2(nextY - y, nextX - x) - Math.PI / 2;
        
        group.add(segment);
      }
    }
    
    // 방사형 연결 빔들 (외부-내부 연결)
    for (let i = 0; i <= segments; i += 2) {
      const angle = (Math.PI * i) / segments;
      const outerX = Math.cos(angle) * radius;
      const outerY = Math.sin(angle) * radius + height;
      const innerX = Math.cos(angle) * innerRadius;
      const innerY = Math.sin(angle) * innerRadius + height;
      
      const beamLength = Math.sqrt(
        Math.pow(outerX - innerX, 2) + Math.pow(outerY - innerY, 2)
      );
      
      const beamGeometry = new THREE.CylinderGeometry(trussRadius * 0.6, trussRadius * 0.6, beamLength, 6);
      const beam = new THREE.Mesh(beamGeometry, trussMaterial);
      
      beam.position.set((outerX + innerX) / 2, (outerY + innerY) / 2, 0);
      beam.rotation.z = Math.atan2(outerY - innerY, outerX - innerX) - Math.PI / 2;
      
      group.add(beam);
    }
    
    // 지지 기둥 (격자 구조)
    const supportHeight = height;
    const postRadius = trussRadius * 1.5;
    
    // 좌측 지지 기둥
    const leftPost = new THREE.CylinderGeometry(postRadius, postRadius, supportHeight, 8);
    const leftPostMesh = new THREE.Mesh(leftPost, trussMaterial);
    leftPostMesh.position.set(-radius, supportHeight / 2, 0);
    group.add(leftPostMesh);
    
    // 우측 지지 기둥
    const rightPost = new THREE.CylinderGeometry(postRadius, postRadius, supportHeight, 8);
    const rightPostMesh = new THREE.Mesh(rightPost, trussMaterial);
    rightPostMesh.position.set(radius, supportHeight / 2, 0);
    group.add(rightPostMesh);
    
    // 지지 기둥 격자 구조
    for (let h = 1; h < 4; h++) {
      const y = (supportHeight / 4) * h;
      
      // 좌측 기둥 격자
      const leftBrace = new THREE.CylinderGeometry(trussRadius * 0.7, trussRadius * 0.7, 0.8, 6);
      const leftBraceMesh = new THREE.Mesh(leftBrace, trussMaterial);
      leftBraceMesh.position.set(-radius, y, 0);
      leftBraceMesh.rotation.x = Math.PI / 2;
      group.add(leftBraceMesh);
      
      // 우측 기둥 격자
      const rightBraceMesh = new THREE.Mesh(leftBrace, trussMaterial);
      rightBraceMesh.position.set(radius, y, 0);
      rightBraceMesh.rotation.x = Math.PI / 2;
      group.add(rightBraceMesh);
    }
    
    // 조명 매달기용 상단 격자
    const topY = height + radius;
    for (let x = -radius + 1; x < radius; x += 1.5) {
      const hangPoint = new THREE.CylinderGeometry(trussRadius * 0.5, trussRadius * 0.5, 0.6, 6);
      const hangPointMesh = new THREE.Mesh(hangPoint, trussMaterial);
      
      // 아치 곡선에 맞춰 Y 위치 계산
      const archY = Math.sqrt(radius * radius - x * x) + height;
      hangPointMesh.position.set(x, archY, 0);
      hangPointMesh.rotation.x = Math.PI / 2;
      group.add(hangPointMesh);
    }
    
    return group;
  };

  // 템플릿 로드 함수
  const loadConcertHallTemplate = () => {
    if (!sceneRef.current) return;
    
    // 기존 객체들 제거
    sceneObjects.forEach(obj => {
      sceneRef.current?.remove(obj.mesh);
    });
    setSceneObjects([]);
    
    const newObjects: SceneObject[] = [];
    let idCounter = 0;
    
    // 1. 아치형 무대 (더 큰 크기)
    const stageProps: StageProperties = { width: 12, depth: 6, height: 0.8, material: 'plywood_carpet_black', stageType: 'arch' };
    const archRadius = stageProps.width / 2;
    const archGeometry = new THREE.CylinderGeometry(archRadius, archRadius, stageProps.height, 64, 1, false, 0, Math.PI);
    const archMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2A2A2A, 
      roughness: 0.8, 
      metalness: 0.1 
    });
    const stageMesh = new THREE.Mesh(archGeometry, archMaterial);
    stageMesh.rotation.y = Math.PI / 2;
    stageMesh.position.set(0, stageProps.height / 2, 0);
    stageMesh.castShadow = true;
    stageMesh.receiveShadow = true;
    
    newObjects.push({
      id: `stage-${++idCounter}`,
      type: 'stage',
      mesh: stageMesh,
      properties: stageProps,
      price: calculateStagePrice(stageProps, 'arch')
    });
    sceneRef.current.add(stageMesh);
    
    // 2. 메인 아치형 트러스 (무대 위)
    const mainArchTruss = createArchTruss(8, 6, 12);
    mainArchTruss.position.set(0, 0.8, 0);
    newObjects.push({
      id: `arch-truss-${++idCounter}`,
      type: 'truss',
      mesh: mainArchTruss,
      properties: { width: 16, depth: 2, height: 6, stageHeight: 0.8 },
      price: calculateTrussPrice({ width: 16, depth: 2, height: 6, stageHeight: 0.8 })
    });
    sceneRef.current.add(mainArchTruss);
    
    // 3. 좌우 사이드 트러스 타워
    const sidetrussProps: TrussProperties = { width: 2, depth: 2, height: 5, stageHeight: 0.8 };
    
    // 좌측 트러스 타워
    const leftTruss = createTrussMesh(sidetrussProps);
    leftTruss.position.set(-10, 0, 0);
    newObjects.push({
      id: `truss-${++idCounter}`,
      type: 'truss',
      mesh: leftTruss,
      properties: sidetrussProps,
      price: calculateTrussPrice(sidetrussProps)
    });
    sceneRef.current.add(leftTruss);
    
    // 우측 트러스 타워
    const rightTruss = createTrussMesh(sidetrussProps);
    rightTruss.position.set(10, 0, 0);
    newObjects.push({
      id: `truss-${++idCounter}`,
      type: 'truss',
      mesh: rightTruss,
      properties: sidetrussProps,
      price: calculateTrussPrice(sidetrussProps)
    });
    sceneRef.current.add(rightTruss);
    
    // 4. 후방 LED 스크린 (더 큰 크기)
    const ledProps: LEDScreenProperties = {
      width: 10, height: 6, depth: 0.15, resolution: 'ultra', installationType: 'wall-mounted'
    };
    const ledScreen = createLEDScreenMesh(ledProps);
    ledScreen.position.set(0, ledProps.height / 2, -4);
    newObjects.push({
      id: `led-screen-${++idCounter}`,
      type: 'led_screen',
      mesh: ledScreen,
      properties: ledProps,
      price: calculateLEDScreenPrice(ledProps)
    });
    sceneRef.current.add(ledScreen);
    
    // 5. 메인 스피커 시스템 (라인 어레이)
    const mainSpeakerProps: SpeakerProperties = { type: 'line-array', width: 1.2, height: 2.5, depth: 0.8 };
    
    // 좌측 메인 스피커
    const leftMainSpeaker = createSpeakerMesh(mainSpeakerProps);
    leftMainSpeaker.position.set(-6, 0, 3);
    newObjects.push({
      id: `speaker-${++idCounter}`,
      type: 'speaker',
      mesh: leftMainSpeaker,
      properties: mainSpeakerProps,
      price: calculateSpeakerPrice(mainSpeakerProps)
    });
    sceneRef.current.add(leftMainSpeaker);
    
    // 우측 메인 스피커
    const rightMainSpeaker = createSpeakerMesh(mainSpeakerProps);
    rightMainSpeaker.position.set(6, 0, 3);
    newObjects.push({
      id: `speaker-${++idCounter}`,
      type: 'speaker',
      mesh: rightMainSpeaker,
      properties: mainSpeakerProps,
      price: calculateSpeakerPrice(mainSpeakerProps)
    });
    sceneRef.current.add(rightMainSpeaker);
    
    // 6. 사이드 스피커 (딜레이)
    const delaySpeakerProps: SpeakerProperties = { type: 'delay', width: 0.8, height: 1.5, depth: 0.6 };
    
    // 좌측 딜레이 스피커
    const leftDelay = createSpeakerMesh(delaySpeakerProps);
    leftDelay.position.set(-12, 0, 8);
    newObjects.push({
      id: `speaker-${++idCounter}`,
      type: 'speaker',
      mesh: leftDelay,
      properties: delaySpeakerProps,
      price: calculateSpeakerPrice(delaySpeakerProps)
    });
    sceneRef.current.add(leftDelay);
    
    // 우측 딜레이 스피커
    const rightDelay = createSpeakerMesh(delaySpeakerProps);
    rightDelay.position.set(12, 0, 8);
    newObjects.push({
      id: `speaker-${++idCounter}`,
      type: 'speaker',
      mesh: rightDelay,
      properties: delaySpeakerProps,
      price: calculateSpeakerPrice(delaySpeakerProps)
    });
    sceneRef.current.add(rightDelay);
    
    // 7. 좌석 배치 (더 많은 섹션과 현실적인 배치)
    const chairProps: ChairProperties = { type: 'standard', width: 0.5, depth: 0.5, rows: 12, columns: 16, spacing: 0.08 };
    
    // 중앙 좌석 (메인 섹션)
    const centerChairs = createChairMesh(chairProps);
    centerChairs.position.set(0, 0, 12);
    newObjects.push({
      id: `chair-${++idCounter}`,
      type: 'chair',
      mesh: centerChairs,
      properties: chairProps,
      price: calculateChairPrice(chairProps)
    });
    sceneRef.current.add(centerChairs);
    
    // 좌측 좌석 (각도 조정)
    const leftChairProps: ChairProperties = { ...chairProps, columns: 12, rows: 10 };
    const leftChairs = createChairMesh(leftChairProps);
    leftChairs.position.set(-12, 0, 12);
    leftChairs.rotation.y = Math.PI / 8;
    newObjects.push({
      id: `chair-${++idCounter}`,
      type: 'chair',
      mesh: leftChairs,
      properties: leftChairProps,
      price: calculateChairPrice(leftChairProps)
    });
    sceneRef.current.add(leftChairs);
    
    // 우측 좌석 (각도 조정)
    const rightChairs = createChairMesh(leftChairProps);
    rightChairs.position.set(12, 0, 12);
    rightChairs.rotation.y = -Math.PI / 8;
    newObjects.push({
      id: `chair-${++idCounter}`,
      type: 'chair',
      mesh: rightChairs,
      properties: leftChairProps,
      price: calculateChairPrice(leftChairProps)
    });
    sceneRef.current.add(rightChairs);
    
    // 8. VIP 좌석 (전방)
    const vipChairProps: ChairProperties = { type: 'vip', width: 0.6, depth: 0.6, rows: 3, columns: 20, spacing: 0.1 };
    const vipChairs = createChairMesh(vipChairProps);
    vipChairs.position.set(0, 0, 8);
    newObjects.push({
      id: `chair-${++idCounter}`,
      type: 'chair',
      mesh: vipChairs,
      properties: vipChairProps,
      price: calculateChairPrice(vipChairProps)
    });
    sceneRef.current.add(vipChairs);
    
    // 9. 조명 시스템 (다양한 위치)
    const washLightProps: LightingProperties = {
      type: 'wash', color: '#ffffff', intensity: 1.5, distance: 150
    };
    
    // 아치 트러스 위 조명 (5개)
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 3;
      const light = createLightingMesh(washLightProps);
      light.position.set(x, 7.5, 0);
      newObjects.push({
        id: `lighting-${++idCounter}`,
        type: 'lighting',
        mesh: light,
        properties: washLightProps,
        price: calculateLightingPrice(washLightProps)
      });
      sceneRef.current.add(light);
    }
    
    // 사이드 트러스 조명
    const sideLightProps: LightingProperties = {
      type: 'spot', color: '#ffffff', intensity: 1.2, distance: 100
    };
    
    // 좌측 사이드 조명
    const leftSideLight = createLightingMesh(sideLightProps);
    leftSideLight.position.set(-10, 6, 0);
    newObjects.push({
      id: `lighting-${++idCounter}`,
      type: 'lighting',
      mesh: leftSideLight,
      properties: sideLightProps,
      price: calculateLightingPrice(sideLightProps)
    });
    sceneRef.current.add(leftSideLight);
    
    // 우측 사이드 조명
    const rightSideLight = createLightingMesh(sideLightProps);
    rightSideLight.position.set(10, 6, 0);
    newObjects.push({
      id: `lighting-${++idCounter}`,
      type: 'lighting',
      mesh: rightSideLight,
      properties: sideLightProps,
      price: calculateLightingPrice(sideLightProps)
    });
    sceneRef.current.add(rightSideLight);
    
    // 10. 무대 모니터 스피커
    const monitorProps: SpeakerProperties = { type: 'monitor', width: 0.6, height: 0.4, depth: 0.4 };
    
    // 무대 전면 모니터들
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 3;
      const monitor = createSpeakerMesh(monitorProps);
      monitor.position.set(x, 0.8, 1);
      monitor.rotation.x = -Math.PI / 6; // 각도 조정
      newObjects.push({
        id: `speaker-${++idCounter}`,
        type: 'speaker',
        mesh: monitor,
        properties: monitorProps,
        price: calculateSpeakerPrice(monitorProps)
      });
      sceneRef.current.add(monitor);
    }
    
    // 상태 업데이트
    setSceneObjects(newObjects);
    setObjectIdCounter(idCounter);
    updateTotalQuote(newObjects);
    
    // 카메라 위치 조정 (전체 뷰를 잘 볼 수 있도록)
    if (cameraRef.current && orbitControlsRef.current) {
      cameraRef.current.position.set(25, 15, 25);
      orbitControlsRef.current.target.set(0, 3, 8);
      orbitControlsRef.current.update();
    }
  };

  // 요소 추가 핸들러
  const handleElementAdd = (action: string, subType?: string) => {
    switch (action) {
      case 'addStage': addStage(); break;
      case 'addTruss': addTruss(); break;
      case 'addLayher': addLayher(); break;
      case 'addLighting': addLighting(subType); break;
      case 'addLEDScreen': addLEDScreen(); break;
      case 'addSpeaker': addSpeaker(subType); break;
      case 'addChair': addChair(subType); break;
      case 'addDecoration': addDecoration(subType); break;
      case 'addSpecialEffect': addSpecialEffect(subType); break;
      case 'addCamera': addCamera(); break;
      case 'addProjector': addProjector(); break;
      case 'loadConcertHallTemplate': loadConcertHallTemplate(); break;
    }
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
          description = `${stageTypeText} 스테이지 (${Math.round(stageProps.width)}m x ${Math.round(stageProps.depth)}m)`;
          break;
        case 'lighting':
          const lightingProps = props as LightingProperties;
          key = `lighting-${lightingProps.type}-${lightingProps.color}-${lightingProps.intensity}`;
          description = `${lightingProps.type} 조명 (${lightingProps.color})`;
          break;
        case 'speaker':
          const speakerProps = props as SpeakerProperties;
          key = `speaker-${speakerProps.type}-${speakerProps.width}-${speakerProps.height}`;
          description = `${speakerProps.type} 스피커`;
          break;
        case 'chair':
          const chairProps = props as ChairProperties;
          key = `chair-${chairProps.type}-${chairProps.rows}-${chairProps.columns}`;
          description = `${chairProps.type} 좌석 (${chairProps.rows}x${chairProps.columns})`;
          break;
        default:
          key = `${obj.type}-${obj.id}`;
          description = `${obj.type} (${obj.id})`;
          break;
      }

      if (groupedItems.has(key)) {
        const existingItem = groupedItems.get(key)!;
        existingItem.quantity += 1;
        existingItem.amount = Math.round(existingItem.quantity * existingItem.unitPrice);
      } else {
        groupedItems.set(key, {
          id: key, 
          description: description,
          quantity: 1,
          unitPrice: Math.round(obj.price), 
          amount: Math.round(obj.price),
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

  // 3D 요소 초기화
  const clearAllObjects = () => {
    if (!sceneRef.current) return;
    
    // 확인 다이얼로그
    const confirmed = window.confirm(
      '모든 3D 요소를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
    );
    
    if (!confirmed) return;
    
    // 기존 객체들 제거
    sceneObjects.forEach(obj => {
      sceneRef.current?.remove(obj.mesh);
    });
    
    // 선택된 객체 해제
    if (selectedObject) {
      deselectObject();
    }
    
    // 드래그 컨트롤 해제
    if (dragControlsRef.current) {
      dragControlsRef.current.dispose();
      dragControlsRef.current = null;
    }
    
    // 상태 초기화
    setSceneObjects([]);
    setSelectedObject(null);
    setTotalPrice(0);
    setQuotationItems([]);
    setObjectIdCounter(0);
    
    // 견적 변경 콜백 호출
    if (onQuotationChange) {
      onQuotationChange([]);
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
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement); 

    const orbitControls = new OrbitControls(camera, renderer.domElement); 
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 3;
    orbitControls.maxDistance = 100;
    orbitControlsRef.current = orbitControls;

    if (!initialCameraPositionRef.current) {
      initialCameraPositionRef.current = camera.position.clone();
    }
    if (!initialCameraLookAtRef.current) {
      initialCameraLookAtRef.current = orbitControls.target.clone();
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(15, 20, 10);
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
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xf0f0f0, 
      transparent: true, 
      opacity: 0.5 
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.01;
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
    <div className="flex flex-row h-screen">
      {/* Enhanced Left Panel */}
      <div className="w-96 bg-white border-r border-gray-300 flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
            <Square className="w-6 h-6 mr-2 text-blue-600" />
            무대 구성 요소
          </h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="요소 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {getFilteredCategories().map((category) => {
            const IconComponent = category.icon;
            const isExpanded = expandedCategories.has(category.id);

  return (
              <div key={category.id} className="border-b border-gray-100">
                {/* Category Header */}
            <button 
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <IconComponent className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="font-medium text-gray-800">{category.name}</span>
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.items.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
            </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="bg-gray-50">
                    {category.items.map((item) => (
            <button 
                        key={item.id}
                                                 onClick={() => handleElementAdd(item.action, (item as any).subType)}
                        className={`w-full p-3 pl-12 text-left hover:bg-white transition-colors border-l-4 border-transparent hover:border-blue-400 group`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-700 group-hover:text-blue-600">
                              {item.name}
          </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.description}
          </div>
              </div>
                          <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </div>
              </button>
                    ))}
            </div>
          )}
              </div>
            );
          })}
        </div>

        {/* Quote Summary - Fixed */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gradient-to-r from-sky-50 to-cyan-50">
          <h3 className="font-bold text-gray-800 mb-3">견적 요약</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
              {quotationItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">
                요소를 추가하여 견적을 생성하세요
              </p>
              ) : (
                quotationItems.map((item, index) => (
                <div key={item.id || index} className="text-xs bg-white p-2 rounded border">
                  <div className="font-medium text-gray-700 truncate">{item.description}</div>
                  <div className="flex justify-between text-gray-600 mt-1">
                    <span>수량: {item.quantity}</span>
                    <span className="font-medium">{Math.round(item.amount).toLocaleString()}원</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          
            {quotationItems.length > 0 && (
            <>
              <div className="text-right font-bold text-lg text-gray-800 mt-3 pt-3 border-t border-gray-200">
                총 견적: {Math.round(totalPrice).toLocaleString()}원
              </div>
            <button
              onClick={handleOpenQuotationModal}
                className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
            >
                견적서 생성
            </button>
            </>
          )}
        </div>
      </div>

      {/* 3D Viewer - Fixed Size */}
      <div className="flex-1 p-2 relative bg-gray-200 h-full">
        <div ref={mountRef} onClick={handleCanvasClick} className="w-full h-full bg-gray-300 border border-gray-400 rounded-md shadow-inner cursor-grab active:cursor-grabbing"></div>
        <div className="absolute bottom-3 right-3 flex flex-col space-y-2 z-10">
          <div className="flex space-x-2">
            <button onClick={resetCamera} className="py-2 px-3 bg-white text-sm rounded-md shadow hover:bg-gray-100 transition-colors">카메라 초기화</button>
            <button onClick={toggleGrid} className="py-2 px-3 bg-white text-sm rounded-md shadow hover:bg-gray-100 transition-colors">그리드 {gridVisible ? '숨기기' : '표시'}</button>
            <button onClick={toggleAxes} className="py-2 px-3 bg-white text-sm rounded-md shadow hover:bg-gray-100 transition-colors">좌표축 {axesVisible ? '숨기기' : '표시'}</button>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={clearAllObjects} 
              className="py-2 px-3 bg-red-500 text-white text-sm rounded-md shadow hover:bg-red-600 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>전체 초기화</span>
            </button>
          </div>
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

export default ThreeDConfiguratorEnhanced; 
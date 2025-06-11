import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three-stdlib';
import QuotationTemplateModal from '../components/quotation/QuotationTemplateModal';
import StageTypeSelectModal from '../components/StageTypeSelectModal';
import { imageAnalysisService } from '../services/imageAnalysisService';
import toast from 'react-hot-toast';
import { 
  ChevronRight, 
  Square, 
  Plus, 
  Trash2,
  Upload,
  Download,
  Settings,
  X,
  Image as ImageIcon,
  Sparkles,
  Undo,
  Redo,
  RotateCcw,
  Save,
  FolderOpen,
  Camera,
  Copy,
  Home,
  RotateCw,
  Move3d,
  Rotate3d,
  Scale,
  Grid,
  Layers,
  Calculator
} from 'lucide-react';

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
  initialObjects?: any[];
  isSidebarOpen?: boolean;
}

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const ThreeDConfiguratorEnhanced: React.FC<ThreeDConfiguratorProps> = ({ isSidebarOpen = true }) => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [showStageTypeModal, setShowStageTypeModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // UI 상태
  const [activeTab, setActiveTab] = useState<string>('models');
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [zoomLevel, setZoomLevel] = useState(50); // 0-100 범위의 줌 레벨

  // Models panel state
  const [showModelsPanel, setShowModelsPanel] = useState(true);
  const [selectedModelCategory, setSelectedModelCategory] = useState('all');
  const [selectedModelTab, setSelectedModelTab] = useState('library'); // 라이브러리/템플릿 탭
  const [modelSearchQuery, setModelSearchQuery] = useState(''); // 검색어

  // Background panel state
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('indoor'); // 배경 종류
  const [backgroundMode, setBackgroundMode] = useState('preset'); // 'preset' | 'solid' | 'gradient'
  const [solidColor, setSolidColor] = useState('#ffffff');
  const [gradientStart, setGradientStart] = useState('#87CEEB');
  const [gradientEnd, setGradientEnd] = useState('#ffffff');
  const [gradientDirection, setGradientDirection] = useState('linear');
  const [gradientAngle, setGradientAngle] = useState(0);

  // Quote panel state
  const [showQuotePanel, setShowQuotePanel] = useState(false);
  const [showQuotationTemplateModal, setShowQuotationTemplateModal] = useState(false);

  // 현재 씬의 모든 요소들을 가져와서 견적 항목으로 변환하는 함수
  const getSceneQuotationItems = (): QuotationItem[] => {
    if (!sceneRef.current) return [];
    
    const items: QuotationItem[] = [];
    const sceneObjects = sceneRef.current.children.filter(child => 
      child.userData.isSceneObject || 
      child.userData.isStageElement || 
      child.userData.isLibraryItem ||
      child.userData.type === 'stage' ||
      child.userData.type === 'truss' ||
      child.userData.type === 'layher' ||
      child.userData.type === 'lighting' ||
      child.userData.type === 'led_screen' ||
      child.userData.type === 'speaker' ||
      child.userData.type === 'chair' ||
      child.userData.type === 'decoration' ||
      child.userData.type === 'special_effect' ||
      child.userData.type === 'camera'
    );

    sceneObjects.forEach((obj, index) => {
      const type = obj.userData.type || 'unknown';
      const properties = obj.userData.properties || {};
      const price = calculateElementPrice(type, properties);
      
      const typeNames: { [key: string]: string } = {
        'stage': '무대',
        'truss': '트러스',
        'layher': '레이어',
        'lighting': '조명',
        'led_screen': 'LED 스크린',
        'speaker': '스피커',
        'chair': '좌석',
        'decoration': '장식',
        'special_effect': '특수효과',
        'camera': '카메라'
      };

      items.push({
        id: obj.uuid,
        description: `${typeNames[type] || type} (${properties.width || 1}x${properties.depth || 1}${properties.height ? `x${properties.height}` : ''})`,
        quantity: 1,
        unitPrice: price,
        amount: price
      });
    });

    return items;
  };

  // 견적서 템플릿 선택 모달 열기
  const openQuotationTemplateModal = () => {
    setShowQuotationTemplateModal(true);
  };

  // 선택한 템플릿으로 견적서 생성
  const generateQuotationWithTemplate = (templateId: string) => {
    const quotationItems = getSceneQuotationItems();
    const totalAmount = quotationItems.reduce((sum, item) => sum + item.amount, 0);
    
    // 새 견적서 생성
    const newQuote = {
      id: `Q${new Date().getFullYear()}${String(Date.now()).slice(-3).padStart(3, '0')}`,
      clientName: '3D 구성 고객',
      eventName: '3D 구성 기반 행사',
      date: new Date().toISOString().split('T')[0],
      amount: Math.round(totalAmount * 1.1), // 부가세 포함
      status: '승인대기',
      validUntil: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
      items: quotationItems.map(item => ({
        name: item.description,
        quantity: item.quantity,
        price: item.unitPrice,
        days: 1
      })),
      description: '3D 구성기를 통해 생성된 견적서입니다.',
      terms: '세부 조건은 협의 후 결정됩니다.',
      templateId: templateId
    };

    // 기존 견적서 목록 가져오기
    const existingQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    
    // 새 견적서를 목록 맨 앞에 추가
    const updatedQuotes = [newQuote, ...existingQuotes];
    
    // 로컬 스토리지에 업데이트된 목록 저장
    localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
    
    // 모달 닫기
    setShowQuotationTemplateModal(false);
    setShowQuotePanel(false);
    
    // 견적서 목록 페이지로 이동
    navigate('/quotes');
    
    // 성공 메시지
    toast.success('견적서가 성공적으로 생성되었습니다!');
  };

  const modelCategories = [
    { id: 'structure', name: '구조/플랫폼', icon: '🏗️' },
    { id: 'visual', name: '시각장비', icon: '📺' },
    { id: 'audio', name: '음향시스템', icon: '🔊' },
    { id: 'control', name: '제어/전원', icon: '⚡' },
    { id: 'audience', name: '관객시설', icon: '🪑' },
    { id: 'additional', name: '부가요소', icon: '✨' }
  ];

  // 무대 템플릿 데이터
  const stageTemplates = [
    {
      id: 1,
      name: '프로시니엄형',
      description: '가장 일반적인 박스형 무대',
      usage: '콘서트, 연극, 발표회',
      preview: '/api/placeholder/120/80',
      type: 'proscenium'
    },
    {
      id: 2,
      name: '원형 무대',
      description: '360도 관객이 둘러싼 형태',
      usage: '토크쇼, 서커스, 무용',
      preview: '/api/placeholder/120/80',
      type: 'arena'
    },
    {
      id: 3,
      name: 'T자형',
      description: '중앙으로 길게 돌출된 무대',
      usage: '패션쇼, 팬미팅, 콘서트',
      preview: '/api/placeholder/120/80',
      type: 'runway'
    },
    {
      id: 4,
      name: '와이드형',
      description: '매우 넓게 확장된 무대',
      usage: '대형 콘서트, 페스티벌',
      preview: '/api/placeholder/120/80',
      type: 'wide'
    },
    {
      id: 5,
      name: '아레나형',
      description: '사방에 관중석, 중앙 무대',
      usage: '스타디움 공연, e스포츠',
      preview: '/api/placeholder/120/80',
      type: 'stadium'
    },
    {
      id: 6,
      name: '트러스트형',
      description: '3면 관객석, 앞쪽 돌출',
      usage: '뮤지컬, 소극장 공연',
      preview: '/api/placeholder/120/80',
      type: 'thrust'
    },
    {
      id: 7,
      name: '모듈형',
      description: '조립·분해 가능한 설계',
      usage: '다목적 행사, 이동식 공연',
      preview: '/api/placeholder/120/80',
      type: 'modular'
    },
    {
      id: 8,
      name: '하이브리드형',
      description: '여러 형태를 조합한 설계',
      usage: '특별 이벤트, 복합 공연',
      preview: '/api/placeholder/120/80',
      type: 'hybrid'
    },
    {
      id: 9,
      name: '인터랙티브형',
      description: '무대와 관객 공간 경계 허물어짐',
      usage: '몰입형 퍼포먼스, 전시형 공연',
      preview: '/api/placeholder/120/80',
      type: 'immersive'
    }
  ];

  const modelItems = {
    structure: [
      { id: 1, name: '무대단', preview: '/api/placeholder/120/80', size: '8m x 6m', type: 'platform' },
      { id: 2, name: '레이허 시스템', preview: '/api/placeholder/120/80', size: '모듈형', type: 'layher' },
      { id: 3, name: '트러스', preview: '/api/placeholder/120/80', length: '12m', type: 'truss' },
      { id: 4, name: '백월', preview: '/api/placeholder/120/80', size: '10m x 8m', type: 'backdrop' },
      { id: 5, name: '계단/램프', preview: '/api/placeholder/120/80', size: '3m', type: 'stairs' },
      { id: 6, name: '발판/피트', preview: '/api/placeholder/120/80', height: '0.5m-2m', type: 'feet' }
    ],
    visual: [
      { id: 1, name: 'LED 스크린', preview: '/api/placeholder/120/80', size: '6m x 4m', type: 'led_screen' },
      { id: 2, name: '프로젝션 시스템', preview: '/api/placeholder/120/80', power: '15000 루멘', type: 'projector' },
      { id: 3, name: '무빙라이트', preview: '/api/placeholder/120/80', power: '300W', type: 'moving_light' },
      { id: 4, name: '워시라이트', preview: '/api/placeholder/120/80', power: '200W', type: 'wash_light' },
      { id: 5, name: '레이저 시스템', preview: '/api/placeholder/120/80', power: '10W RGB', type: 'laser' },
      { id: 6, name: '연막장치', preview: '/api/placeholder/120/80', category: '드라이아이스', type: 'fog_machine' }
    ],
    audio: [
      { id: 1, name: '메인 스피커', preview: '/api/placeholder/120/80', power: '2000W', type: 'main_speaker' },
      { id: 2, name: '모니터 스피커', preview: '/api/placeholder/120/80', power: '800W', type: 'monitor' },
      { id: 3, name: '서브우퍼', preview: '/api/placeholder/120/80', power: '1500W', type: 'subwoofer' },
      { id: 4, name: '믹싱 콘솔', preview: '/api/placeholder/120/80', channels: '32채널', type: 'mixer' },
      { id: 5, name: '무선 마이크', preview: '/api/placeholder/120/80', frequency: 'UHF', type: 'wireless_mic' },
      { id: 6, name: '라인 어레이', preview: '/api/placeholder/120/80', power: '3000W', type: 'line_array' }
    ],
    control: [
      { id: 1, name: '콘트롤 부스', preview: '/api/placeholder/120/80', size: '3m x 2m', type: 'control_booth' },
      { id: 2, name: '파워 디스트리뷰션', preview: '/api/placeholder/120/80', capacity: '400A', type: 'power_dist' },
      { id: 3, name: '신호 분배기', preview: '/api/placeholder/120/80', ports: '16포트', type: 'signal_splitter' },
      { id: 4, name: '네트워크 라우터', preview: '/api/placeholder/120/80', speed: '1Gbps', type: 'router' }
    ],
    audience: [
      { id: 1, name: '관객석', preview: '/api/placeholder/120/80', capacity: '500석', type: 'seating' },
      { id: 2, name: '안전 펜스', preview: '/api/placeholder/120/80', length: '50m', type: 'barrier' },
      { id: 3, name: '캐노피/텐트', preview: '/api/placeholder/120/80', size: '20m x 15m', type: 'canopy' },
      { id: 4, name: '통로', preview: '/api/placeholder/120/80', width: '2m', type: 'walkway' },
      { id: 5, name: '사이드 스크린', preview: '/api/placeholder/120/80', size: '4m x 3m', type: 'side_screen' }
    ],
    additional: [
      { id: 1, name: '회전무대', preview: '/api/placeholder/120/80', diameter: '8m', type: 'rotating_stage' },
      { id: 2, name: '카메라 시스템', preview: '/api/placeholder/120/80', resolution: '4K', type: 'camera' },
      { id: 3, name: 'AR/VR 시스템', preview: '/api/placeholder/120/80', category: '몰입형', type: 'ar_vr' },
      { id: 4, name: '인터랙티브 장비', preview: '/api/placeholder/120/80', category: '터치스크린', type: 'interactive' }
    ]
  };

  // Three.js 레퍼런스
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  
  // 선택 및 변형 관련 상태
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const [selectedObjectProperties, setSelectedObjectProperties] = useState<any>(null);
  const [showTransformControls, setShowTransformControls] = useState(false);
  const [transformMode, setTransformMode] = useState<'translate' | 'scale' | 'rotate'>('translate');
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const transformControlsRef = useRef<any>(null);

  // 더블클릭 편집 관련 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editingProperty, setEditingProperty] = useState<'width' | 'height' | 'depth' | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 크기 입력 필드를 위한 로컬 상태
  const [localScaleValues, setLocalScaleValues] = useState({
    x: '',
    y: '',
    z: ''
  });

  // 위치 입력 필드를 위한 로컬 상태
  const [localPositionValues, setLocalPositionValues] = useState({
    x: '',
    y: '',
    z: ''
  });

  // 사용자가 현재 입력 중인 필드 추적
  
  // 씬 객체들 관리
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Undo/Redo 기능을 위한 상태
  const [sceneHistory, setSceneHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);

  // 호버 상태
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(null);

  // 선택된 객체가 변경될 때 로컬 입력 상태 업데이트 (사용자가 입력 중이 아닐 때만)
  useEffect(() => {
    if (selectedObjectProperties && !focusedField) {
      setLocalScaleValues({
        x: selectedObjectProperties.scale.x.toFixed(1),
        y: selectedObjectProperties.scale.y.toFixed(1),
        z: selectedObjectProperties.scale.z.toFixed(1)
      });
      setLocalPositionValues({
        x: selectedObjectProperties.position.x.toFixed(1),
        y: selectedObjectProperties.position.y.toFixed(1),
        z: selectedObjectProperties.position.z.toFixed(1)
      });
    }
  }, [selectedObjectProperties, focusedField]);

  // 키보드 단축키 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z: Undo
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undoAction();
      }
      // Ctrl+Y: Redo
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        redoAction();
      }
      // Ctrl+D: 객체 복제
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        duplicateSelectedObject();
      }
      // Delete: 선택된 객체 삭제
      if (event.key === 'Delete') {
        event.preventDefault();
        deleteSelectedObjectAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, sceneHistory, selectedObject]);

  // 초기 씬 상태 저장
  useEffect(() => {
    if (sceneRef.current && sceneHistory.length === 0) {
      saveSceneState();
    }
  }, [sceneRef.current]);

  // 즉시 업데이트 함수 (유효한 숫자만)
  const immediateUpdateScale = (axis: 'x' | 'y' | 'z', value: string) => {
    // 빈 문자열이나 소수점만 있는 경우 무시
    if (value === '' || value === '.' || value === '-') {
      return;
    }
    
    const numValue = parseFloat(value);
    // 유효한 양수인 경우에만 업데이트
    if (!isNaN(numValue) && numValue > 0 && isFinite(numValue)) {
      updateObjectProperty('scale', axis, numValue);
    }
  };

  // 위치 즉시 업데이트 함수
  const immediateUpdatePosition = (axis: 'x' | 'y' | 'z', value: string) => {
    // 빈 문자열이나 소수점만 있는 경우 무시
    if (value === '' || value === '.' || value === '-') {
      return;
    }
    
    const numValue = parseFloat(value);
    // 유효한 숫자인 경우에만 업데이트 (위치는 음수도 허용)
    if (!isNaN(numValue) && isFinite(numValue)) {
      updateObjectProperty('position', axis, numValue);
    }
  };

  // 씬 상태를 히스토리에 저장
  const saveSceneState = () => {
    if (!sceneRef.current) return;
    
    const sceneState = {
      objects: sceneRef.current.children
        .filter(child => 
          child.userData.isSceneObject || 
          child.userData.isStageElement || 
          child.userData.isLibraryItem ||
          child.userData.type === 'stage' ||
          child.userData.type === 'truss' ||
          child.userData.type === 'layher'
        )
        .map(obj => ({
          uuid: obj.uuid,
          id: obj.userData.id || obj.uuid,
          type: obj.userData.type || 'unknown',
          position: obj.position.toArray(),
          rotation: obj.rotation.toArray(),
          scale: obj.scale.toArray(),
          visible: obj.visible,
          userData: obj.userData
        }))
    };
    
    console.log('Saving scene state with', sceneState.objects.length, 'objects');
    
    const newHistory = sceneHistory.slice(0, historyIndex + 1);
    newHistory.push(sceneState);
    setSceneHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo 기능
  const undoAction = () => {
    console.log('Undo clicked:', { historyIndex, historyLength: sceneHistory.length });
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      restoreSceneState(sceneHistory[historyIndex - 1]);
    }
  };

  // Redo 기능
  const redoAction = () => {
    console.log('Redo clicked:', { historyIndex, historyLength: sceneHistory.length });
    if (historyIndex < sceneHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      restoreSceneState(sceneHistory[historyIndex + 1]);
    }
  };

  // 씬 상태 복원
  const restoreSceneState = (sceneState: any) => {
    if (!sceneRef.current) return;
    
    console.log('Restoring scene state with', sceneState.objects.length, 'objects');
    
    // 모든 3D 요소를 숨김
    sceneRef.current.children.forEach(child => {
      if (child.userData.isSceneObject || 
          child.userData.isStageElement || 
          child.userData.isLibraryItem ||
          child.userData.type === 'stage' ||
          child.userData.type === 'truss' ||
          child.userData.type === 'layher') {
        child.visible = false;
      }
    });
    
    // 저장된 상태의 객체들만 보이도록 설정
    sceneState.objects.forEach((objData: any) => {
      const existingObject = sceneRef.current!.children.find(child => 
        child.uuid === objData.uuid
      );
      
      if (existingObject) {
        existingObject.visible = objData.visible;
        existingObject.position.fromArray(objData.position);
        existingObject.rotation.fromArray(objData.rotation);
        existingObject.scale.fromArray(objData.scale);
      }
    });
  };

  // 씬 리셋 기능
  const resetScene = () => {
    console.log('Reset scene clicked');
    if (!sceneRef.current) return;
    
    // 기본적인 씬 요소(조명, 바닥, 그리드)를 제외한 모든 객체 제거
    const objectsToRemove = sceneRef.current.children.filter(child => 
      child.userData.isStageElement || 
      child.userData.isLibraryItem || 
      child.userData.isSceneObject ||
      child.userData.type === 'stage' ||
      child.userData.type === 'truss' ||
      child.userData.type === 'layher'
    );
    
    console.log('Objects to remove:', objectsToRemove.length);
    objectsToRemove.forEach(obj => {
      if (sceneRef.current) {
        sceneRef.current.remove(obj);
      }
    });
    
    // 상태 초기화
    setSelectedObject(null);
    setSelectedObjectProperties(null);
    setSceneObjects([]);
    setQuotationItems([]);
    
    // 히스토리는 유지하되 현재 상태만 저장
    saveSceneState();
    
    toast.success('모든 3D 요소가 삭제되었습니다!');
  };

  // 선택된 객체 삭제
  const deleteSelectedObjectAction = () => {
    console.log('Delete clicked:', { hasSelectedObject: !!selectedObject, hasScene: !!sceneRef.current });
    if (selectedObject && sceneRef.current) {
      saveSceneState(); // 삭제 전 상태 저장
      sceneRef.current.remove(selectedObject);
      setSelectedObject(null);
      setSelectedObjectProperties(null);
      setShowTransformControls(false);
    }
  };

  // 씬 저장 기능
  const saveSceneToFile = () => {
    if (!sceneRef.current) return;
    
    const sceneData = {
      objects: sceneObjects.map(obj => ({
        id: obj.id,
        type: obj.type,
        properties: obj.properties,
        position: obj.mesh.position.toArray(),
        rotation: obj.mesh.rotation.toArray(),
        scale: obj.mesh.scale.toArray(),
        price: obj.price
      })),
      timestamp: Date.now(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(sceneData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `scene_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('씬이 저장되었습니다!');
  };

  // 씬 불러오기 기능
  const loadSceneFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const sceneData = JSON.parse(text);
        
        // 기존 객체들 제거
        sceneObjects.forEach(obj => {
          if (sceneRef.current) {
            sceneRef.current.remove(obj.mesh);
          }
        });
        setSceneObjects([]);
        
        toast.success('씬이 로드되었습니다!');
        saveSceneState();
      } catch (error) {
        toast.error('파일 로드 중 오류가 발생했습니다.');
        console.error('Scene load error:', error);
      }
    };
    input.click();
  };

  // 스크린샷 기능
  const takeScreenshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const canvas = rendererRef.current.domElement;
    
    // 캔버스를 이미지로 변환
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scene_screenshot_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('스크린샷이 저장되었습니다!');
    }, 'image/png');
  };

  // 선택된 객체 복제
  const duplicateSelectedObject = () => {
    if (!selectedObject || !sceneRef.current) return;
    
    const originalObj = sceneObjects.find(obj => obj.mesh === selectedObject);
    if (!originalObj) return;

    // 객체 복제
    const clonedMesh = originalObj.mesh.clone();
    clonedMesh.position.x += 2; // 약간 옆으로 이동
    
    sceneRef.current.add(clonedMesh);
    
    const newObject: SceneObject = {
      id: `${originalObj.type}_${Date.now()}`,
      type: originalObj.type,
      mesh: clonedMesh,
      properties: { ...originalObj.properties },
      price: originalObj.price
    };
    
    setSceneObjects(prev => [...prev, newObject]);
    saveSceneState();
    toast.success('객체가 복제되었습니다!');
  };

  // 카메라 위치 리셋
  const resetCameraPosition = () => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    
    // 카메라를 기본 위치로 리셋
    cameraRef.current.position.set(10, 10, 10);
    cameraRef.current.lookAt(0, 0, 0);
    orbitControlsRef.current.reset();
    
    toast.success('카메라가 초기 위치로 리셋되었습니다!');
  };

  // 와이어프레임 토글
  const toggleWireframe = () => {
    if (!sceneRef.current) return;
    
    let wireframeEnabled = false;
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
        child.material.wireframe = !child.material.wireframe;
        wireframeEnabled = child.material.wireframe;
      }
    });
    
    toast.success(`와이어프레임 모드가 ${wireframeEnabled ? '활성화' : '비활성화'}되었습니다!`);
  };

  // 그리드만 토글
  const toggleGridOnly = () => {
    if (!sceneRef.current) return;
    
    const existingGrid = sceneRef.current.getObjectByName('grid');
    if (existingGrid) {
      existingGrid.visible = !existingGrid.visible;
    }
  };

  // 바닥 전체 토글 (그리드 + 바닥면)
  const toggleFloor = () => {
    if (!sceneRef.current) return;
    
    const grid = sceneRef.current.getObjectByName('grid');
    const floor = sceneRef.current.getObjectByName('floor');
    
    if (grid && floor) {
      const isVisible = grid.visible;
      grid.visible = !isVisible;
      floor.visible = !isVisible;
    }
  };

  // 줌 레벨 변경 함수 (0-100 범위를 카메라 거리로 변환)
  const updateZoomLevel = (level: number) => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    
    setZoomLevel(level);
    
    // 줌 레벨을 카메라 거리로 변환 (0=가장 가까이, 100=가장 멀리)
    const minDistance = 5;   // 최소 거리
    const maxDistance = 100; // 최대 거리
    const targetDistance = minDistance + ((100 - level) / 100) * (maxDistance - minDistance);
    
    // OrbitControls를 통해 카메라 거리 설정
    const currentTarget = orbitControlsRef.current.target.clone();
    const direction = cameraRef.current.position.clone().sub(currentTarget).normalize();
    const newPosition = currentTarget.clone().add(direction.multiplyScalar(targetDistance));
    
    cameraRef.current.position.copy(newPosition);
    orbitControlsRef.current.update();
  };

  // 마우스 휠이나 OrbitControls로 줌이 변경될 때 슬라이더 업데이트
  const updateZoomSliderFromCamera = () => {
    if (!cameraRef.current || !orbitControlsRef.current) return;
    
    const currentDistance = cameraRef.current.position.distanceTo(orbitControlsRef.current.target);
    const minDistance = 5;
    const maxDistance = 100;
    
    // 현재 거리를 0-100 범위로 변환
    const newZoomLevel = Math.max(0, Math.min(100, 
      100 - ((currentDistance - minDistance) / (maxDistance - minDistance)) * 100
    ));
    
    setZoomLevel(Math.round(newZoomLevel));
  };

  // 탭 클릭 핸들러
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'edit') {
      setShowUploadPanel(true);
      setShowModelsPanel(false);
      setShowBackgroundPanel(false);
      setShowQuotePanel(false);
    } else if (tab === 'models') {
      setShowUploadPanel(false);
      setShowModelsPanel(true);
      setShowBackgroundPanel(false);
      setShowQuotePanel(false);
    } else if (tab === 'background') {
      setShowUploadPanel(false);
      setShowModelsPanel(false);
      setShowBackgroundPanel(true);
      setShowQuotePanel(false);
    } else if (tab === 'quote') {
      setShowUploadPanel(false);
      setShowModelsPanel(false);
      setShowBackgroundPanel(false);
      setShowQuotePanel(true);
    } else {
      setShowUploadPanel(false);
      setShowModelsPanel(false);
      setShowBackgroundPanel(false);
      setShowQuotePanel(false);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setUploadedImages(prev => [...prev, ...newImages]);
      
      // 첫 번째 이미지 분석
      if (newImages.length > 0) {
        await analyzeAndGenerate3DElements(newImages[0]);
      }
    }
  };

  // 파일 다운로드 핸들러


  // 이미지 분석 및 3D 요소 생성
  const analyzeAndGenerate3DElements = async (file: File) => {
    const loadingToast = toast.loading('이미지를 분석하여 3D 요소를 생성하는 중...');
    
    try {
      // Gemini API 사용 (API 키가 있는 경우)
      let analysisResult;
      try {
        analysisResult = await imageAnalysisService.analyzeImageWithGemini(file);
        toast.success('AI 이미지 분석 완료!', { id: loadingToast });
      } catch (error) {
        console.log('Gemini API 사용 불가, 기본 분석 사용');
        analysisResult = await imageAnalysisService.analyzeImageWithTensorFlow(file);
        toast.success('이미지 분석 완료 (기본 모드)', { id: loadingToast });
      }

      // 분석 결과를 3D 요소로 변환
      const threeDElements = imageAnalysisService.convertToThreeJSElements(analysisResult);
      
      // 3D 씬에 요소들 추가
      if (sceneRef.current && threeDElements.elements.length > 0) {
        for (const element of threeDElements.elements) {
          await add3DElementToScene(element);
        }
        
        // 제안사항 표시
        if (threeDElements.suggestions.length > 0) {
          toast.success(`감지 완료: ${threeDElements.suggestions.join(', ')}`);
        }
      } else {
        // 아무것도 감지되지 않은 경우
        toast.success('명확한 무대 요소가 감지되지 않았습니다. 수동으로 요소를 추가해주세요.');
      }

    } catch (error) {
      console.error('이미지 분석 오류:', error);
      toast.error('이미지 분석 중 오류가 발생했습니다.', { id: loadingToast });
    }
  };

  // 3D 요소를 씬에 추가하는 함수
  const add3DElementToScene = async (element: any) => {
    if (!sceneRef.current || !rendererRef.current) return;

    // 변경 전 상태 저장 (Undo를 위해)
    saveSceneState();

    let mesh;
    const { type, properties, position, confidence } = element;

    switch (type) {
      case 'stage':
        // 기존 addProsceniumStage 함수와 유사하게 구현
        const stageGeometry = new THREE.BoxGeometry(
          properties.width,
          properties.height,
          properties.depth
        );
        const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        mesh = new THREE.Mesh(stageGeometry, stageMaterial);
        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.isStageElement = true;
        break;

      case 'lighting':
        // 조명 추가
        const light = new THREE.SpotLight(
          properties.color,
          properties.intensity,
          properties.distance,
          properties.angle
        );
        light.position.set(position.x, position.y, position.z);
        sceneRef.current.add(light);
        
        // 조명 시각화용 메쉬
        const lightGeometry = new THREE.SphereGeometry(0.1);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: properties.color });
        mesh = new THREE.Mesh(lightGeometry, lightMaterial);
        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.isStageElement = true;
        break;

      case 'speaker':
        // 스피커 추가
        const speakerGeometry = new THREE.BoxGeometry(
          properties.width,
          properties.height,
          properties.depth
        );
        const speakerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        mesh = new THREE.Mesh(speakerGeometry, speakerMaterial);
        mesh.position.set(position.x, position.y, position.z);
        mesh.userData.isStageElement = true;
        break;

      case 'chair':
        // 관객석 추가 (여러 의자)
        const chairGroup = new THREE.Group();
        for (let row = 0; row < properties.rows; row++) {
          for (let col = 0; col < properties.columns; col++) {
            const chairGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
            const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
            const chair = new THREE.Mesh(chairGeometry, chairMaterial);
            chair.position.set(
              col * properties.spacing,
              0.4,
              row * properties.spacing
            );
            chairGroup.add(chair);
          }
        }
        chairGroup.position.set(position.x, position.y, position.z);
        chairGroup.userData.isStageElement = true;
        sceneRef.current.add(chairGroup);
        
        // 견적 아이템 추가
        const chairPrice = calculateElementPrice(type, properties);
        const chairQuotationItem: QuotationItem = {
          id: `ai-${Date.now()}-${Math.random()}`,
          description: `AI 감지: ${type} (신뢰도: ${Math.round(confidence * 100)}%)`,
          quantity: 1,
          unitPrice: chairPrice,
          amount: chairPrice
        };
        setQuotationItems(prev => [...prev, chairQuotationItem]);
        return; // 그룹이므로 별도 처리

      case 'screen':
        // LED 스크린 추가
        const screenGroup = new THREE.Group();
        
        // 스크린 패널
        const screenGeometry = new THREE.PlaneGeometry(
          properties.width,
          properties.height
        );
        const screenMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x000033,
          side: THREE.DoubleSide 
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screenGroup.add(screen);
        
        // 프레임
        const frameGeometry = new THREE.BoxGeometry(
          properties.width + 0.2,
          properties.height + 0.2,
          0.1
        );
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -0.05;
        screenGroup.add(frame);
        
        screenGroup.position.set(position.x, position.y, position.z);
        screenGroup.userData.isLibraryItem = true;
        sceneRef.current.add(screenGroup);
        
        // 견적 아이템 추가
        const screenPrice = calculateElementPrice(type, properties);
        const screenQuotationItem: QuotationItem = {
          id: `ai-${Date.now()}-${Math.random()}`,
          description: `AI 감지: LED 스크린 (신뢰도: ${Math.round(confidence * 100)}%)`,
          quantity: 1,
          unitPrice: screenPrice,
          amount: screenPrice
        };
        setQuotationItems(prev => [...prev, screenQuotationItem]);
        return;

      case 'truss':
        // 트러스 구조 추가
        const trussGroup = new THREE.Group();
        
        // 메인 빔들
        const mainBeamGeometry = new THREE.BoxGeometry(properties.width, 0.15, 0.15);
        const beamMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        
        // 상단 빔
        const topBeam = new THREE.Mesh(mainBeamGeometry, beamMaterial);
        topBeam.position.set(0, 0.2, 0);
        trussGroup.add(topBeam);
        
        // 하단 빔
        const bottomBeam = new THREE.Mesh(mainBeamGeometry, beamMaterial);
        bottomBeam.position.set(0, -0.2, 0);
        trussGroup.add(bottomBeam);
        
        // 대각선 브레이스들
        const braceGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
        const braceMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
        
        for (let i = -2; i <= 2; i += 1) {
          if (i * (properties.width / 6) <= properties.width / 2) {
            const brace1 = new THREE.Mesh(braceGeometry, braceMaterial);
            brace1.position.set(i * (properties.width / 6), 0, 0);
            brace1.rotation.z = Math.PI / 4;
            trussGroup.add(brace1);
            
            const brace2 = new THREE.Mesh(braceGeometry, braceMaterial);
            brace2.position.set(i * (properties.width / 6) + 0.3, 0, 0);
            brace2.rotation.z = -Math.PI / 4;
            trussGroup.add(brace2);
          }
        }
        
        trussGroup.position.set(position.x, position.y, position.z);
        trussGroup.userData.isLibraryItem = true;
        sceneRef.current.add(trussGroup);
        
        // 견적 아이템 추가
        const trussPrice = calculateElementPrice(type, properties);
        const trussQuotationItem: QuotationItem = {
          id: `ai-${Date.now()}-${Math.random()}`,
          description: `AI 감지: 트러스 구조 (신뢰도: ${Math.round(confidence * 100)}%)`,
          quantity: 1,
          unitPrice: trussPrice,
          amount: trussPrice
        };
        setQuotationItems(prev => [...prev, trussQuotationItem]);
        return;

      case 'decoration':
        // 장식 요소 추가 (배너/배경막)
        const decorationGeometry = new THREE.PlaneGeometry(
          properties.width,
          properties.height
        );
        const decorationMaterial = new THREE.MeshLambertMaterial({ 
          color: properties.color,
          side: THREE.DoubleSide 
        });
        mesh = new THREE.Mesh(decorationGeometry, decorationMaterial);
        mesh.position.set(position.x, position.y + properties.height/2, position.z);
        mesh.userData.isLibraryItem = true;
        break;

      default:
        return;
    }

    if (mesh) {
      // 신뢰도가 낮은 요소는 투명도 조정
      if (confidence < 0.7) {
        if (mesh.material instanceof THREE.Material) {
          mesh.material.transparent = true;
          mesh.material.opacity = 0.7;
        }
      }

      sceneRef.current.add(mesh);

      // 견적 아이템 추가
      const price = calculateElementPrice(type, properties);
      const quotationItem: QuotationItem = {
        id: `ai-${Date.now()}-${Math.random()}`,
        description: `AI 감지: ${type} (신뢰도: ${Math.round(confidence * 100)}%)`,
        quantity: 1,
        unitPrice: price,
        amount: price
      };
      
      setQuotationItems(prev => [...prev, quotationItem]);

      // 변경 후 상태 저장 (새로운 요소 추가 완료)
      saveSceneState();
    }
  };

  // 배경 변경 함수
  const changeBackground = (backgroundType: string, customColor?: string) => {
    if (!sceneRef.current) return;

    setSelectedBackground(backgroundType);

    switch (backgroundType) {
      case 'indoor':
        sceneRef.current.background = new THREE.Color(0xffffff);
        break;
      
      case 'outdoor':
        sceneRef.current.background = new THREE.Color(0x87CEEB);
        break;
      
      case 'studio':
        sceneRef.current.background = new THREE.Color(0x404040);
        break;
      
      case 'gradient':
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        if (context) {
          const gradient = context.createLinearGradient(0, 0, 0, 256);
          gradient.addColorStop(0, '#87CEEB');
          gradient.addColorStop(1, '#ffffff');
          context.fillStyle = gradient;
          context.fillRect(0, 0, 256, 256);
          
          const texture = new THREE.CanvasTexture(canvas);
          sceneRef.current.background = texture;
        }
        break;
      
      case 'hdri':
        sceneRef.current.background = new THREE.Color(0x2c3e50);
        break;
      
      case 'transparent':
        sceneRef.current.background = null;
        if (rendererRef.current) {
          rendererRef.current.setClearColor(0x000000, 0);
        }
        break;

      case 'solid':
        // 커스텀 단색 배경
        sceneRef.current.background = new THREE.Color(customColor || solidColor);
        break;

      case 'custom_gradient':
        // 커스텀 그라데이션 배경
        const gradCanvas = document.createElement('canvas');
        gradCanvas.width = 256;
        gradCanvas.height = 256;
        const gradContext = gradCanvas.getContext('2d');
        if (gradContext) {
          let gradient;
          if (gradientDirection === 'linear') {
            const angle = (gradientAngle * Math.PI) / 180;
            const x1 = Math.cos(angle) * 128 + 128;
            const y1 = Math.sin(angle) * 128 + 128;
            const x2 = 256 - x1;
            const y2 = 256 - y1;
            gradient = gradContext.createLinearGradient(x1, y1, x2, y2);
          } else {
            gradient = gradContext.createRadialGradient(128, 128, 0, 128, 128, 128);
          }
          gradient.addColorStop(0, gradientStart);
          gradient.addColorStop(1, gradientEnd);
          gradContext.fillStyle = gradient;
          gradContext.fillRect(0, 0, 256, 256);
          
          const texture = new THREE.CanvasTexture(gradCanvas);
          sceneRef.current.background = texture;
        }
        break;
      
      default:
        sceneRef.current.background = new THREE.Color(0xffffff);
    }
  };

  // 색상 적용 함수
  const applyCustomBackground = () => {
    if (backgroundMode === 'solid') {
      changeBackground('solid');
    } else if (backgroundMode === 'gradient') {
      changeBackground('custom_gradient');
    }
  };

  // 요소별 가격 계산
  const calculateElementPrice = (type: string, properties: any): number => {
    switch (type) {
      case 'stage':
        return STAGE_UNIT_PRICE_PLYWOOD * (properties.width || 4) * (properties.depth || 3);
      case 'lighting':
        return LIGHTING_PRICE_SPOT;
      case 'speaker':
        if (properties.speakerType === 'monitor') {
          return 80000; // 모니터 스피커
        }
        return 200000; // 메인 스피커
      case 'chair':
        return 15000 * (properties.rows || 1) * (properties.columns || 1);
      case 'screen':
        return 500000 * (properties.width || 2) * (properties.height || 1.5);
      case 'truss':
        return TRUSS_PRICE_PER_METER * (properties.width || 6);
      case 'decoration':
        return 30000 * (properties.width || 1) * (properties.height || 1);
      default:
        return 50000; // 기본 가격
    }
  };

  // Three.js 초기화
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene 생성
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera 생성
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(-25, 15, -35);
    camera.lookAt(0, -3, 10);
    cameraRef.current = camera;

    // Renderer 생성
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // 조명 추가 (더 밝게)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 컨트롤 설정
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    orbitControlsRef.current = controls;

    // OrbitControls 변경 이벤트 리스너 (줌 슬라이더 업데이트를 위해)
    controls.addEventListener('change', () => {
      // 즉시 업데이트로 반응성 향상
      updateZoomSliderFromCamera();
    });

    // 커스텀 하얀색 그리드 생성
    const gridGroup = new THREE.Group();
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff, 
      opacity: 1.0, 
      transparent: false 
    });
    
    // 수직선들 (Z축 방향)
    for (let i = -40; i <= 40; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, 0, -40),
        new THREE.Vector3(i, 0, 40)
      ]);
      const line = new THREE.Line(geometry, gridMaterial);
      gridGroup.add(line);
    }
    
    // 수평선들 (X축 방향)
    for (let i = -40; i <= 40; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-40, 0, i),
        new THREE.Vector3(40, 0, i)
      ]);
      const line = new THREE.Line(geometry, gridMaterial);
      gridGroup.add(line);
    }
    
    gridGroup.position.set(0, -3, 0);
    gridGroup.name = 'grid';
    scene.add(gridGroup);

    // 바닥면 추가 (더 큰 크기)
    const floorGeometry = new THREE.PlaneGeometry(80, 80);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -3.01, 0);
    floor.name = 'floor';
    scene.add(floor);

    // TransformControls 설정
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('translate');
    transformControls.setSize(0.8);
    scene.add(transformControls);
    transformControlsRef.current = transformControls;

    // TransformControls 이벤트 리스너
    (transformControls as any).addEventListener('dragging-changed', (event: any) => {
      controls.enabled = !event.value;
    });

    // TransformControls 객체 변경 이벤트 (Y축 제한 적용)
    (transformControls as any).addEventListener('objectChange', () => {
      const attachedObject = (transformControls as any).object;
      if (attachedObject && attachedObject.position.y < -3) {
        attachedObject.position.y = -3;
        // 선택된 객체의 속성도 업데이트
        if (selectedObject && selectedObjectProperties) {
          const newProperties = { ...selectedObjectProperties };
          newProperties.position.y = -3;
          setSelectedObjectProperties(newProperties);
        }
      }
    });

    // 마우스 클릭 이벤트 리스너 (객체 선택 및 더블클릭 감지)
    const handleMouseClick = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      
      // 선택 가능한 객체들만 체크 (바닥, 그리드 제외)
      const selectableObjects = sceneRef.current.children.filter(child => 
        child.userData.isStageElement || child.userData.isLibraryItem
      );
      
      const intersects = raycasterRef.current.intersectObjects(selectableObjects, true);
      
      if (intersects.length > 0) {
        const selectedObj = intersects[0].object;
        let parentObj = selectedObj;
        
        // Group인 경우 parent 찾기
        while (parentObj.parent && parentObj.parent !== sceneRef.current) {
          parentObj = parentObj.parent as THREE.Object3D;
        }
        
        // 더블클릭 감지
        clickCountRef.current++;
        
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
        }
        
        if (clickCountRef.current === 1) {
          // 단일 클릭 - 300ms 대기
          clickTimerRef.current = setTimeout(() => {
            clickCountRef.current = 0;
            
            // 이전 선택 객체의 효과 제거 (모든 선택된 객체들의 선택 해제)
            if (selectedObject && selectedObject !== parentObj) {
              setObjectSelection(selectedObject, false);
            }
            
            // 혹시라도 다른 선택된 객체가 있을 수 있으니 모든 객체 체크해서 선택 해제
            if (sceneRef.current) {
              sceneRef.current.children.forEach(child => {
                if (child !== parentObj && (child.userData.isSelected || 
                    (child instanceof THREE.Group && child.children.some(subChild => 
                      subChild.userData && subChild.userData.isSelected)))) {
                  setObjectSelection(child, false);
                }
              });
            }
            
            // 단일 클릭 처리 (기존 선택 로직)
            setSelectedObject(parentObj);
            
            // 선택 효과 적용
            setObjectSelection(parentObj, true);
            
            setSelectedObjectProperties({
              position: { 
                x: parentObj.position.x, 
                y: parentObj.position.y, 
                z: parentObj.position.z 
              },
              scale: { 
                x: parentObj.scale.x, 
                y: parentObj.scale.y, 
                z: parentObj.scale.z 
              },
              rotation: {
                x: parentObj.rotation.x,
                y: parentObj.rotation.y,
                z: parentObj.rotation.z
              }
            });
            transformControls.attach(parentObj);
            setShowTransformControls(true);
            
            // 편집 패널로 자동 전환
            setActiveTab('edit');
            setShowUploadPanel(true);
            setShowModelsPanel(false);
            setShowBackgroundPanel(false);
          }, 300);
        } else if (clickCountRef.current === 2) {
          // 더블클릭 처리 - 더이상 편집 모드 활성화하지 않음
          clickCountRef.current = 0;
        }
      } else {
        // 빈 공간 클릭 시 선택 해제
        if (selectedObject) {
          setObjectSelection(selectedObject, false);
          setSelectedObject(null);
          setSelectedObjectProperties(null);
          transformControls.detach();
          setShowTransformControls(false);
        }
      }
    };

    // 이벤트 리스너 등록 (호버 제거, 클릭만 유지)
    renderer.domElement.addEventListener('click', handleMouseClick);

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 리사이즈 핸들러
    const handleResize = () => {
      if (mountRef.current && cameraRef.current && rendererRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    setLoading(false);

    // 초기 줌 레벨 설정
    setTimeout(() => {
      updateZoomSliderFromCamera();
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleMouseClick);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 객체 변형 모드 변경
  const changeTransformMode = (mode: 'translate' | 'scale' | 'rotate') => {
    setTransformMode(mode);
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(mode);
    }
  };

  // 객체 속성 업데이트
  const updateObjectProperty = (property: string, axis: string, value: number) => {
    if (!selectedObject || !selectedObjectProperties) return;
    
    // Y축 위치 제한: 바닥(-3) 아래로 내려가지 못하게 함
    if (property === 'position' && axis === 'y' && value < -3) {
      value = -3;
    }
    
    const newProperties = { ...selectedObjectProperties };
    newProperties[property][axis] = value;
    setSelectedObjectProperties(newProperties);
    
    if (property === 'position') {
      selectedObject.position[axis as 'x' | 'y' | 'z'] = value;
    } else if (property === 'scale') {
      selectedObject.scale[axis as 'x' | 'y' | 'z'] = value;
    } else if (property === 'rotation') {
      selectedObject.rotation[axis as 'x' | 'y' | 'z'] = value;
    }
  };

  // 편집 모드 관련 함수들
  const startEditing = (property: 'width' | 'height' | 'depth') => {
    if (!selectedObject) return;
    
    setIsEditing(true);
    setEditingProperty(property);
    
    switch (property) {
      case 'width':
        setTempValue(selectedObject.scale.x.toFixed(1));
        break;
      case 'height':
        setTempValue(selectedObject.scale.y.toFixed(1));
        break;
      case 'depth':
        setTempValue(selectedObject.scale.z.toFixed(1));
        break;
    }
  };

  const confirmEdit = () => {
    if (!selectedObject || !editingProperty) return;
    
    const value = parseFloat(tempValue);
    if (isNaN(value) || value <= 0) return;
    
    switch (editingProperty) {
      case 'width':
        selectedObject.scale.x = value;
        break;
      case 'height':
        selectedObject.scale.y = value;
        break;
      case 'depth':
        selectedObject.scale.z = value;
        break;
    }
    
    // 속성 업데이트
    if (selectedObjectProperties) {
      const newProperties = { ...selectedObjectProperties };
      newProperties.scale[editingProperty === 'width' ? 'x' : editingProperty === 'height' ? 'y' : 'z'] = value;
      setSelectedObjectProperties(newProperties);
    }
    
    setIsEditing(false);
    setEditingProperty(null);
    setTempValue('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingProperty(null);
    setTempValue('');
  };

  // 선택 효과 함수들 (호버 대신 선택시 불투명 효과)
  const setObjectSelection = (object: THREE.Object3D, isSelected: boolean) => {
    console.log(`setObjectSelection called: isSelected=${isSelected}, object:`, object);
    
    if (isSelected) {
      // 선택시 - 불투명 효과 적용 (0.6 opacity)
      if (object instanceof THREE.Mesh && object.material) {
        if (!object.userData.isSelected) {
          console.log('Applying selection to Mesh object');
          object.userData.originalOpacity = object.material.opacity;
          object.userData.originalTransparent = object.material.transparent;
          object.userData.isSelected = true;
          
          object.material.transparent = true;
          object.material.opacity = 0.6;
          object.material.needsUpdate = true;
        }
      } else if (object instanceof THREE.Group) {
        console.log('Applying selection to Group object');
        object.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material && !child.userData.isSelected) {
            console.log('Applying selection to child mesh');
            child.userData.originalOpacity = child.material.opacity;
            child.userData.originalTransparent = child.material.transparent;
            child.userData.isSelected = true;
            
            child.material.transparent = true;
            child.material.opacity = 0.6;
            child.material.needsUpdate = true;
          }
        });
      }
    } else {
      // 선택 해제 - 원본 상태 복원
      console.log('Removing selection from object');
      if (object instanceof THREE.Mesh && object.userData.isSelected) {
        console.log('Restoring Mesh material');
        if (object.userData.originalOpacity !== undefined) {
          object.material.opacity = object.userData.originalOpacity;
        }
        if (object.userData.originalTransparent !== undefined) {
          object.material.transparent = object.userData.originalTransparent;
        }
        object.material.needsUpdate = true;
        
        object.userData.isSelected = false;
        delete object.userData.originalOpacity;
        delete object.userData.originalTransparent;
      } else if (object instanceof THREE.Group) {
        console.log('Restoring Group materials');
        object.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.isSelected) {
            console.log('Restoring child mesh material');
            if (child.userData.originalOpacity !== undefined) {
              child.material.opacity = child.userData.originalOpacity;
            }
            if (child.userData.originalTransparent !== undefined) {
              child.material.transparent = child.userData.originalTransparent;
            }
            child.material.needsUpdate = true;
            
            child.userData.isSelected = false;
            delete child.userData.originalOpacity;
            delete child.userData.originalTransparent;
          }
        });
      }
    }
  };

  // 객체 삭제
  const deleteSelectedObject = () => {
    if (!selectedObject || !sceneRef.current) return;
    
    sceneRef.current.remove(selectedObject);
    setSelectedObject(null);
    setSelectedObjectProperties(null);
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
    setShowTransformControls(false);
    setIsEditing(false);
    setEditingProperty(null);
  };

  const addModelToScene = (item: any) => {
    // 라이브러리 아이템을 3D 씬에 추가
    console.log('Adding model to scene:', item);
    addLibraryItem(item);
  };

  const addStageTemplateToScene = (template: any) => {
    // 무대 템플릿을 3D 뷰어에 추가하는 로직
    console.log('Adding stage template to scene:', template);
    
    if (!sceneRef.current) return;

    // 변경 전 상태 저장 (Undo를 위해)
    saveSceneState();

    // 기존 무대 요소들 제거 (바닥과 그리드 제외)
    const objectsToRemove = sceneRef.current.children.filter(child => 
      child.userData.isStageElement
    );
    objectsToRemove.forEach(obj => sceneRef.current?.remove(obj));

    // 템플릿 타입에 따라 다른 무대 구성 요소 추가
    switch (template.type) {
      case 'proscenium':
        addProsceniumStage();
        break;
      case 'arena':
        addArenaStage();
        break;
      case 'runway':
        addRunwayStage();
        break;
      case 'wide':
        addWideStage();
        break;
      case 'stadium':
        addStadiumStage();
        break;
      case 'thrust':
        addThrustStage();
        break;
      case 'modular':
        addModularStage();
        break;
      case 'hybrid':
        addHybridStage();
        break;
      case 'immersive':
        addImmersiveStage();
        break;
    }

    // 변경 후 상태 저장 (새로운 템플릿 추가 완료)
    saveSceneState();
  };

  // 각 무대 타입별 완성된 무대 생성 함수들
  const addProsceniumStage = () => {
    if (!sceneRef.current) return;
    
    // 메인 무대 (그리드 중심에 배치)
    const stageGeometry = new THREE.BoxGeometry(8, 0.5, 6);
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, -2.75, 0);  // 그리드 중심으로 이동
    stage.userData.isStageElement = true;
    sceneRef.current.add(stage);

    // 백월 (배경) - 무대 뒤쪽에 배치
    const backdropGeometry = new THREE.BoxGeometry(10, 8, 0.2);
    const backdropMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.set(0, 1.25, 3);  // 무대 중심 기준으로 뒤쪽
    backdrop.userData.isStageElement = true;
    sceneRef.current.add(backdrop);

    // 트러스 (상단) - 무대 위쪽에 배치
    const trussGeometry = new THREE.BoxGeometry(12, 0.3, 0.3);
    const trussMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const truss = new THREE.Mesh(trussGeometry, trussMaterial);
    truss.position.set(0, 6, 0);  // 무대 중심 위쪽
    truss.userData.isStageElement = true;
    sceneRef.current.add(truss);

    // 조명 (무빙라이트) - 트러스에 매달린 형태
    for (let i = -2; i <= 2; i++) {
      const lightGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
      const lightMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(i * 2, 5.5, 0);  // 무대 중심 기준
      light.userData.isStageElement = true;
      sceneRef.current.add(light);
    }

    // 메인 스피커 - 무대 양쪽에 배치
    const speakerGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.6);
    const speakerMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const leftSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
    leftSpeaker.position.set(-5, 0, -2);  // 무대 중심 기준 왼쪽
    leftSpeaker.userData.isStageElement = true;
    sceneRef.current.add(leftSpeaker);

    const rightSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
    rightSpeaker.position.set(5, 0, -2);  // 무대 중심 기준 오른쪽
    rightSpeaker.userData.isStageElement = true;
    sceneRef.current.add(rightSpeaker);

    // 관객석 - 무대 앞쪽에 배치
    for (let row = 0; row < 5; row++) {
      for (let seat = 0; seat < 10; seat++) {
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
        seatMesh.position.set((seat - 4.5) * 0.6, -2.5, -5 - row * 0.8);  // 무대 앞쪽으로 이동
        seatMesh.userData.isStageElement = true;
        sceneRef.current.add(seatMesh);
      }
    }
  };

  const addArenaStage = () => {
    if (!sceneRef.current) return;
    
    // 원형 무대 (그리드 중심에 배치)
    const stageGeometry = new THREE.CylinderGeometry(4, 4, 0.5, 16);
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, -2.75, 0);  // 그리드 중심
    stage.userData.isStageElement = true;
    sceneRef.current.add(stage);

    // 원형 트러스 (상단) - 무대 중심 위쪽
    const trussGeometry = new THREE.TorusGeometry(5, 0.2, 8, 16);
    const trussMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const truss = new THREE.Mesh(trussGeometry, trussMaterial);
    truss.position.set(0, 6, 0);  // 무대 중심 위쪽
    truss.userData.isStageElement = true;
    sceneRef.current.add(truss);

    // 조명 (원형 배치) - 무대 중심 기준
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lightGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
      const lightMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(Math.cos(angle) * 4.5, 5.5, Math.sin(angle) * 4.5);
      light.userData.isStageElement = true;
      sceneRef.current.add(light);
    }

    // LED 스크린 (원형 배치) - 무대 중심 기준
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const screenGeometry = new THREE.BoxGeometry(3, 2, 0.1);
      const screenMaterial = new THREE.MeshLambertMaterial({ color: 0x000066 });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(Math.cos(angle) * 7, 1, Math.sin(angle) * 7);
      screen.rotation.y = -angle;
      screen.userData.isStageElement = true;
      sceneRef.current.add(screen);
    }

    // 관객석 (원형 배치) - 무대 중심 기준
    for (let ring = 0; ring < 4; ring++) {
      const radius = 9 + ring * 1.5;
      const seats = Math.floor(radius * 4);
      for (let i = 0; i < seats; i++) {
        const angle = (i / seats) * Math.PI * 2;
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
        seatMesh.position.set(Math.cos(angle) * radius, -2.5, Math.sin(angle) * radius);
        seatMesh.rotation.y = -angle;
        seatMesh.userData.isStageElement = true;
        sceneRef.current.add(seatMesh);
      }
    }
  };

  const addRunwayStage = () => {
    if (!sceneRef.current) return;
    
    // 메인 무대
    const mainStageGeometry = new THREE.BoxGeometry(8, 0.5, 4);
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const mainStage = new THREE.Mesh(mainStageGeometry, stageMaterial);
    mainStage.position.set(0, -2.75, 4);
    mainStage.userData.isStageElement = true;
    sceneRef.current.add(mainStage);

    // 런웨이
    const runwayGeometry = new THREE.BoxGeometry(2, 0.5, 10);
    const runway = new THREE.Mesh(runwayGeometry, stageMaterial);
    runway.position.set(0, -2.75, -2);
    runway.userData.isStageElement = true;
    sceneRef.current.add(runway);

    // 백월
    const backdropGeometry = new THREE.BoxGeometry(10, 8, 0.2);
    const backdropMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.set(0, 1.25, 6);
    backdrop.userData.isStageElement = true;
    sceneRef.current.add(backdrop);

    // 런웨이 조명 (양쪽)
    for (let i = -4; i <= 4; i++) {
      const lightGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
      const lightMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
      
      const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
      leftLight.position.set(-1.2, -2.4, i);
      leftLight.userData.isStageElement = true;
      sceneRef.current.add(leftLight);
      
      const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
      rightLight.position.set(1.2, -2.4, i);
      rightLight.userData.isStageElement = true;
      sceneRef.current.add(rightLight);
    }

    // 관객석 (양쪽)
    for (let side = 0; side < 2; side++) {
      const xPos = side === 0 ? -4 : 4;
      for (let row = 0; row < 4; row++) {
        for (let seat = 0; seat < 8; seat++) {
          const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
          const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
          const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
          seatMesh.position.set(xPos + (side === 0 ? -row : row) * 0.8, -2.5, (seat - 3.5) * 0.8);
          seatMesh.userData.isStageElement = true;
          sceneRef.current.add(seatMesh);
        }
      }
    }
  };

  const addWideStage = () => {
    if (!sceneRef.current) return;
    
    // 와이드 무대
    const stageGeometry = new THREE.BoxGeometry(15, 0.5, 4);
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, -2.75, 2);
    stage.userData.isStageElement = true;
    sceneRef.current.add(stage);

    // 백월 (와이드)
    const backdropGeometry = new THREE.BoxGeometry(17, 8, 0.2);
    const backdropMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.set(0, 1.25, 4);
    backdrop.userData.isStageElement = true;
    sceneRef.current.add(backdrop);

    // 트러스 (와이드)
    const trussGeometry = new THREE.BoxGeometry(18, 0.3, 0.3);
    const trussMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const truss = new THREE.Mesh(trussGeometry, trussMaterial);
    truss.position.set(0, 6, 2);
    truss.userData.isStageElement = true;
    sceneRef.current.add(truss);

    // LED 스크린 (와이드 배치)
    for (let i = -2; i <= 2; i++) {
      const screenGeometry = new THREE.BoxGeometry(3, 2, 0.1);
      const screenMaterial = new THREE.MeshLambertMaterial({ color: 0x000066 });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(i * 3.5, 1, 4);
      screen.userData.isStageElement = true;
      sceneRef.current.add(screen);
    }

    // 관객석 (와이드 배치)
    for (let row = 0; row < 6; row++) {
      for (let seat = 0; seat < 20; seat++) {
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
        seatMesh.position.set((seat - 9.5) * 0.6, -2.5, -3 - row * 0.8);
        seatMesh.userData.isStageElement = true;
        sceneRef.current.add(seatMesh);
      }
    }
  };

  const addStadiumStage = () => {
    if (!sceneRef.current) return;
    
    // 스타디움형 중앙 무대
    const stageGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 8);
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, -2.75, 0);
    stage.userData.isStageElement = true;
    sceneRef.current.add(stage);

    // 상단 트러스 (사각형)
    const trussGeometry = new THREE.BoxGeometry(12, 0.3, 12);
    const trussMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const truss = new THREE.Mesh(trussGeometry, trussMaterial);
    truss.position.set(0, 8, 0);
    truss.userData.isStageElement = true;
    sceneRef.current.add(truss);

    // LED 스크린 (4면)
    const positions = [[6, 2, 0], [-6, 2, 0], [0, 2, 6], [0, 2, -6]];
    const rotations = [0, Math.PI, Math.PI/2, -Math.PI/2];
    
    positions.forEach((pos, i) => {
      const screenGeometry = new THREE.BoxGeometry(4, 3, 0.1);
      const screenMaterial = new THREE.MeshLambertMaterial({ color: 0x000066 });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(pos[0], pos[1], pos[2]);
      screen.rotation.y = rotations[i];
      screen.userData.isStageElement = true;
      sceneRef.current.add(screen);
    });

    // 관객석 (스타디움 형태)
    for (let tier = 0; tier < 3; tier++) {
      const radius = 8 + tier * 2;
      const height = tier * 1.5;
      const seats = Math.floor(radius * 6);
      
      for (let i = 0; i < seats; i++) {
        const angle = (i / seats) * Math.PI * 2;
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
        seatMesh.position.set(
          Math.cos(angle) * radius, 
          -2.5 + height, 
          Math.sin(angle) * radius
        );
        seatMesh.rotation.y = -angle;
        seatMesh.userData.isStageElement = true;
        sceneRef.current.add(seatMesh);
      }
    }
  };

  const addThrustStage = () => {
    if (!sceneRef.current) return;
    
    // 메인 무대 (직사각형)
    const mainStageGeometry = new THREE.BoxGeometry(6, 0.5, 4);
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const mainStage = new THREE.Mesh(mainStageGeometry, stageMaterial);
    mainStage.position.set(0, -2.75, 3);
    mainStage.userData.isStageElement = true;
    sceneRef.current.add(mainStage);

    // 돌출 무대 (반원형)
    const thrustGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 16, 1, false, 0, Math.PI);
    const thrustStage = new THREE.Mesh(thrustGeometry, stageMaterial);
    thrustStage.position.set(0, -2.75, 0);
    thrustStage.rotation.y = Math.PI;
    thrustStage.userData.isStageElement = true;
    sceneRef.current.add(thrustStage);

    // 백월
    const backdropGeometry = new THREE.BoxGeometry(8, 8, 0.2);
    const backdropMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.set(0, 1.25, 5);
    backdrop.userData.isStageElement = true;
    sceneRef.current.add(backdrop);

    // 관객석 (3면 배치)
    const seatConfigs = [
      { startAngle: 0.3, endAngle: 2.8, radius: 5 },
      { startAngle: 0.5, endAngle: 2.6, radius: 7 },
      { startAngle: 0.7, endAngle: 2.4, radius: 9 }
    ];

    seatConfigs.forEach(config => {
      const seats = Math.floor((config.endAngle - config.startAngle) * config.radius * 3);
      for (let i = 0; i < seats; i++) {
        const angle = config.startAngle + (i / seats) * (config.endAngle - config.startAngle);
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
        seatMesh.position.set(
          Math.cos(angle) * config.radius,
          -2.5,
          Math.sin(angle) * config.radius - 2
        );
        seatMesh.rotation.y = -angle;
        seatMesh.userData.isStageElement = true;
        sceneRef.current.add(seatMesh);
      }
    });
  };

  const addModularStage = () => {
    if (!sceneRef.current) return;
    
    // 모듈형 무대 (6개 모듈)
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const positions = [
      [-2, -2.75, 0], [0, -2.75, 0], [2, -2.75, 0],
      [-2, -2.75, 2], [0, -2.75, 2], [2, -2.75, 2]
    ];

    positions.forEach(pos => {
      const moduleGeometry = new THREE.BoxGeometry(1.8, 0.5, 1.8);
      const module = new THREE.Mesh(moduleGeometry, stageMaterial);
      module.position.set(pos[0], pos[1], pos[2]);
      module.userData.isStageElement = true;
      sceneRef.current.add(module);
    });

    // 각 모듈별 조명
    positions.forEach(pos => {
      const lightGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
      const lightMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(pos[0], 4, pos[2]);
      light.userData.isStageElement = true;
      sceneRef.current.add(light);
    });

    // 관객석 (U자형)
    for (let side = 0; side < 3; side++) {
      let xRange, zRange;
      if (side === 0) { // 왼쪽
        xRange = [-6, -4];
        zRange = [-1, 3];
      } else if (side === 1) { // 정면
        xRange = [-4, 4];
        zRange = [-3, -1];
      } else { // 오른쪽
        xRange = [4, 6];
        zRange = [-1, 3];
      }

      for (let x = xRange[0]; x <= xRange[1]; x += 0.6) {
        for (let z = zRange[0]; z <= zRange[1]; z += 0.6) {
          const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
          const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
          const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
          seatMesh.position.set(x, -2.5, z);
          seatMesh.userData.isStageElement = true;
          sceneRef.current.add(seatMesh);
        }
      }
    }
  };

  const addHybridStage = () => {
    if (!sceneRef.current) return;
    
    // 하이브리드: 원형 + 직사각형
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    // 원형 부분
    const circleGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 16);
    const circleStage = new THREE.Mesh(circleGeometry, stageMaterial);
    circleStage.position.set(-2, -2.75, 1);
    circleStage.userData.isStageElement = true;
    sceneRef.current.add(circleStage);

    // 직사각형 부분
    const rectGeometry = new THREE.BoxGeometry(6, 0.5, 4);
    const rectStage = new THREE.Mesh(rectGeometry, stageMaterial);
    rectStage.position.set(2, -2.75, 1);
    rectStage.userData.isStageElement = true;
    sceneRef.current.add(rectStage);

    // 연결 브릿지
    const bridgeGeometry = new THREE.BoxGeometry(2, 0.5, 2);
    const bridge = new THREE.Mesh(bridgeGeometry, stageMaterial);
    bridge.position.set(0, -2.75, 1);
    bridge.userData.isStageElement = true;
    sceneRef.current.add(bridge);

    // LED 스크린 (양쪽)
    const screenGeometry = new THREE.BoxGeometry(4, 3, 0.1);
    const screenMaterial = new THREE.MeshLambertMaterial({ color: 0x000066 });
    
    const leftScreen = new THREE.Mesh(screenGeometry, screenMaterial);
    leftScreen.position.set(-2, 1, 4);
    leftScreen.userData.isStageElement = true;
    sceneRef.current.add(leftScreen);

    const rightScreen = new THREE.Mesh(screenGeometry, screenMaterial);
    rightScreen.position.set(2, 1, 4);
    rightScreen.userData.isStageElement = true;
    sceneRef.current.add(rightScreen);

    // 관객석 (양쪽 섹션)
    for (let section = 0; section < 2; section++) {
      const xOffset = section === 0 ? -6 : 6;
      for (let row = 0; row < 4; row++) {
        for (let seat = 0; seat < 6; seat++) {
          const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
          const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
          const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
          seatMesh.position.set(
            xOffset + (section === 0 ? -row : row) * 0.6, 
            -2.5, 
            (seat - 2.5) * 0.6
          );
          seatMesh.userData.isStageElement = true;
          sceneRef.current.add(seatMesh);
        }
      }
    }
  };

  const addImmersiveStage = () => {
    if (!sceneRef.current) return;
    
    // 인터랙티브 다중 무대
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    // 중앙 메인 무대
    const mainGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 8);
    const mainStage = new THREE.Mesh(mainGeometry, stageMaterial);
    mainStage.position.set(0, -2.75, 0);
    mainStage.userData.isStageElement = true;
    sceneRef.current.add(mainStage);

    // 위성 무대들 (불규칙 배치)
    const satellitePositions = [
      [4, -2.75, 3], [-3, -2.75, 4], [5, -2.75, -2], [-4, -2.75, -3]
    ];

    satellitePositions.forEach(pos => {
      const satGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 6);
      const satellite = new THREE.Mesh(satGeometry, stageMaterial);
      satellite.position.set(pos[0], pos[1], pos[2]);
      satellite.userData.isStageElement = true;
      sceneRef.current.add(satellite);
    });

    // 연결 통로
    const pathways = [
      { start: [0, 0], end: [4, 3], width: 0.8 },
      { start: [0, 0], end: [-3, 4], width: 0.8 },
      { start: [0, 0], end: [5, -2], width: 0.8 },
      { start: [0, 0], end: [-4, -3], width: 0.8 }
    ];

    pathways.forEach(path => {
      const length = Math.sqrt(Math.pow(path.end[0] - path.start[0], 2) + Math.pow(path.end[1] - path.start[1], 2));
      const angle = Math.atan2(path.end[1] - path.start[1], path.end[0] - path.start[0]);
      
      const pathGeometry = new THREE.BoxGeometry(length, 0.3, path.width);
      const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
      const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
      
      pathMesh.position.set(
        (path.start[0] + path.end[0]) / 2,
        -2.6,
        (path.start[1] + path.end[1]) / 2
      );
      pathMesh.rotation.y = angle;
      pathMesh.userData.isStageElement = true;
      sceneRef.current.add(pathMesh);
    });

    // 관객석 (원형 둘러쌈)
    for (let ring = 0; ring < 3; ring++) {
      const radius = 8 + ring * 1.5;
      const seats = Math.floor(radius * 4);
      
      for (let i = 0; i < seats; i++) {
        const angle = (i / seats) * Math.PI * 2;
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
        seatMesh.position.set(
          Math.cos(angle) * radius,
          -2.5,
          Math.sin(angle) * radius
        );
        seatMesh.rotation.y = -angle;
        seatMesh.userData.isStageElement = true;
        sceneRef.current.add(seatMesh);
      }
    }
  };

  // 개별 라이브러리 요소 추가 함수
  const addLibraryItem = (item: any) => {
    if (!sceneRef.current) return;

    // 변경 전 상태 저장 (Undo를 위해)
    saveSceneState();

    const position = [Math.random() * 6 - 3, -2.5, Math.random() * 6 - 3];

    switch (item.type) {
      case 'platform':
        // 무대 플랫폼 - 다리와 표면으로 구성
        const platformGroup = new THREE.Group();
        
        // 플랫폼 표면
        const platformTop = new THREE.BoxGeometry(4, 0.15, 3);
        const platformTopMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const platformSurface = new THREE.Mesh(platformTop, platformTopMaterial);
        platformSurface.position.set(0, 0.4, 0);
        platformGroup.add(platformSurface);
        
        // 플랫폼 다리들
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const legPositions = [[-1.8, -1.5, -1.3], [1.8, -1.5, -1.3], [-1.8, -1.5, 1.3], [1.8, -1.5, 1.3]];
        
        legPositions.forEach(pos => {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          leg.position.set(pos[0], pos[1], pos[2]);
          platformGroup.add(leg);
        });
        
        platformGroup.position.set(position[0], position[1], position[2]);
        platformGroup.userData.isLibraryItem = true;
        sceneRef.current.add(platformGroup);
        break;

      case 'truss':
        // 상세한 트러스 구조
        const trussGroup = new THREE.Group();
        
        // 메인 빔들
        const mainBeamGeometry = new THREE.BoxGeometry(6, 0.15, 0.15);
        const beamMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        
        // 상단 빔
        const topBeam = new THREE.Mesh(mainBeamGeometry, beamMaterial);
        topBeam.position.set(0, 0.2, 0);
        trussGroup.add(topBeam);
        
        // 하단 빔
        const bottomBeam = new THREE.Mesh(mainBeamGeometry, beamMaterial);
        bottomBeam.position.set(0, -0.2, 0);
        trussGroup.add(bottomBeam);
        
        // 대각선 브레이스들
        const braceGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
        const braceMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
        
        for (let i = -2; i <= 2; i += 1) {
          const brace1 = new THREE.Mesh(braceGeometry, braceMaterial);
          brace1.position.set(i, 0, 0);
          brace1.rotation.z = Math.PI / 4;
          trussGroup.add(brace1);
          
          const brace2 = new THREE.Mesh(braceGeometry, braceMaterial);
          brace2.position.set(i + 0.5, 0, 0);
          brace2.rotation.z = -Math.PI / 4;
          trussGroup.add(brace2);
        }
        
        trussGroup.position.set(position[0], 3, position[2]);
        trussGroup.userData.isLibraryItem = true;
        sceneRef.current.add(trussGroup);
        break;

      case 'led_screen':
        // 상세한 LED 스크린
        const screenGroup = new THREE.Group();
        
        // 스크린 패널
        const screenGeometry = new THREE.BoxGeometry(3, 2, 0.08);
        const screenMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screenGroup.add(screen);
        
        // LED 픽셀 시뮬레이션
        const pixelGeometry = new THREE.SphereGeometry(0.02, 4, 4);
        const pixelMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x0066ff,
          emissive: 0x002244
        });
        
        for (let x = -1.4; x <= 1.4; x += 0.1) {
          for (let y = -0.9; y <= 0.9; y += 0.1) {
            const pixel = new THREE.Mesh(pixelGeometry, pixelMaterial);
            pixel.position.set(x, y, 0.05);
            screenGroup.add(pixel);
          }
        }
        
        // 프레임
        const frameGeometry = new THREE.BoxGeometry(3.2, 2.2, 0.15);
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 0, -0.08);
        screenGroup.add(frame);
        
        screenGroup.position.set(position[0], 1, position[2]);
        screenGroup.userData.isLibraryItem = true;
        sceneRef.current.add(screenGroup);
        break;

      case 'moving_light':
        // 상세한 무빙라이트
        const lightGroup = new THREE.Group();
        
        // 베이스
        const baseGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.2, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, -0.4, 0);
        lightGroup.add(base);
        
        // 요크 (회전 부분)
        const yokeGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
        const yokeMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const yoke = new THREE.Mesh(yokeGeometry, yokeMaterial);
        lightGroup.add(yoke);
        
        // 헤드 (조명부)
        const headGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 12);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.rotation.x = Math.PI / 2;
        head.position.set(0, 0, 0.3);
        lightGroup.add(head);
        
        // 렌즈
        const movingLightLensGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 12);
        const movingLightLensMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xffffff,
          transparent: true,
          opacity: 0.8
        });
        const movingLightLens = new THREE.Mesh(movingLightLensGeometry, movingLightLensMaterial);
        movingLightLens.rotation.x = Math.PI / 2;
        movingLightLens.position.set(0, 0, 0.53);
        lightGroup.add(movingLightLens);
        
        lightGroup.position.set(position[0], 3, position[2]);
        lightGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(lightGroup);
        break;

      case 'main_speaker':
        // 상세한 메인 스피커
        const speakerGroup = new THREE.Group();
        
        // 캐비닛
        const cabinetGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.6);
        const cabinetMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
        speakerGroup.add(cabinet);
        
        // 우퍼 (저음 스피커)
        const wooferGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
        const wooferMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const woofer = new THREE.Mesh(wooferGeometry, wooferMaterial);
        woofer.rotation.x = Math.PI / 2;
        woofer.position.set(0, -0.3, 0.31);
        speakerGroup.add(woofer);
        
        // 트위터 (고음 스피커)
        const tweeterGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12);
        const tweeterMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const tweeter = new THREE.Mesh(tweeterGeometry, tweeterMaterial);
        tweeter.rotation.x = Math.PI / 2;
        tweeter.position.set(0, 0.4, 0.31);
        speakerGroup.add(tweeter);
        
        // 그릴 패턴
        for (let y = -0.6; y <= 0.6; y += 0.15) {
          for (let x = -0.3; x <= 0.3; x += 0.1) {
            if (Math.abs(y) > 0.15 || Math.abs(x) > 0.2) {
              const holeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6);
              const holeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
              const hole = new THREE.Mesh(holeGeometry, holeMaterial);
              hole.rotation.x = Math.PI / 2;
              hole.position.set(x, y, 0.32);
              speakerGroup.add(hole);
            }
          }
        }
        
        speakerGroup.position.set(position[0], -1.75, position[2]);
        speakerGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(speakerGroup);
        break;

      case 'seating':
        // 상세한 좌석 배치
        const seatingGroup = new THREE.Group();
        
        for (let row = 0; row < 3; row++) {
          for (let seat = 0; seat < 5; seat++) {
            const chairGroup = new THREE.Group();
            
            // 시트
            const seatGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.35);
            const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
            const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
            seatMesh.position.set(0, 0.25, 0);
            chairGroup.add(seatMesh);
            
            // 등받이
            const backGeometry = new THREE.BoxGeometry(0.35, 0.4, 0.05);
            const backMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
            const backrest = new THREE.Mesh(backGeometry, backMaterial);
            backrest.position.set(0, 0.4, -0.15);
            chairGroup.add(backrest);
            
            // 다리들
            const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
            const legMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
            const legPositions = [[-0.15, 0, -0.15], [0.15, 0, -0.15], [-0.15, 0, 0.15], [0.15, 0, 0.15]];
            
            legPositions.forEach(pos => {
              const leg = new THREE.Mesh(legGeometry, legMaterial);
              leg.position.set(pos[0], pos[1], pos[2]);
              chairGroup.add(leg);
            });
            
            chairGroup.position.set(
              (seat - 2) * 0.6,
              0,
              row * 0.6
            );
            seatingGroup.add(chairGroup);
          }
        }
        
        seatingGroup.position.set(position[0], position[1], position[2]);
        seatingGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(seatingGroup);
        break;

      case 'control_booth':
        // 상세한 조정실
        const boothGroup = new THREE.Group();
        
        // 메인 구조
        const boothGeometry = new THREE.BoxGeometry(2, 1.5, 1.5);
        const boothMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const booth = new THREE.Mesh(boothGeometry, boothMaterial);
        boothGroup.add(booth);
        
        // 창문
        const windowGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.02);
        const windowMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x87CEEB, 
          transparent: true, 
          opacity: 0.7 
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(0, 0.2, 0.76);
        boothGroup.add(window);
        
        // 콘솔
        const consoleGeometry = new THREE.BoxGeometry(1.8, 0.1, 0.8);
        const consoleMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const console = new THREE.Mesh(consoleGeometry, consoleMaterial);
        console.position.set(0, -0.2, 0.3);
        boothGroup.add(console);
        
        // 모니터들
        for (let i = -0.6; i <= 0.6; i += 0.6) {
          const monitorGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.05);
          const monitorMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
          const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
          monitor.position.set(i, 0.05, 0.67);
          boothGroup.add(monitor);
        }
        
        boothGroup.position.set(position[0], -1.25, position[2]);
        boothGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(boothGroup);
        break;

      case 'layher':
        // 레이허 시스템 (비계 시스템)
        const layherGroup = new THREE.Group();
        
        // 수직 포스트들
        const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        
        for (let x = -1; x <= 1; x += 2) {
          for (let z = -1; z <= 1; z += 2) {
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.set(x, 0, z);
            layherGroup.add(post);
          }
        }
        
        // 수평 빔들
        const layherBeamGeometry = new THREE.BoxGeometry(2.2, 0.08, 0.08);
        const layherBeamMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
        
                  for (let y = -0.8; y <= 0.8; y += 0.8) {
            // X 방향 빔들
            for (let z = -1; z <= 1; z += 2) {
              const beam = new THREE.Mesh(layherBeamGeometry, layherBeamMaterial);
              beam.position.set(0, y, z);
              layherGroup.add(beam);
            }
            
            // Z 방향 빔들
            const beamZ = new THREE.BoxGeometry(0.08, 0.08, 2.2);
            for (let x = -1; x <= 1; x += 2) {
              const beam = new THREE.Mesh(beamZ, layherBeamMaterial);
              beam.position.set(x, y, 0);
              layherGroup.add(beam);
            }
          }
        
        layherGroup.position.set(position[0], -1, position[2]);
        layherGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(layherGroup);
        break;

      case 'backdrop':
        // 백드롭 (배경막)
        const backdropGroup = new THREE.Group();
        
        // 메인 백드롭 천
        const backdropGeometry = new THREE.PlaneGeometry(6, 4);
        const backdropMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x2C3E50,
          side: THREE.DoubleSide
        });
        const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
        backdrop.position.set(0, 1, 0);
        backdropGroup.add(backdrop);
        
        // 상단 트러스 바
        const topBarGeometry = new THREE.CylinderGeometry(0.05, 0.05, 6.5, 8);
        const topBarMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const topBar = new THREE.Mesh(topBarGeometry, topBarMaterial);
        topBar.rotation.z = Math.PI / 2;
        topBar.position.set(0, 3.2, 0);
        backdropGroup.add(topBar);
        
        // 지지 케이블들
        const cableGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1, 4);
        const cableMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        for (let x = -2.5; x <= 2.5; x += 1.25) {
          const cable = new THREE.Mesh(cableGeometry, cableMaterial);
          cable.position.set(x, 2.7, 0);
          backdropGroup.add(cable);
        }
        
        backdropGroup.position.set(position[0], position[1], position[2]);
        backdropGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(backdropGroup);
        break;

      case 'stairs':
        // 계단/램프
        const stairsGroup = new THREE.Group();
        
        // 계단 스텝들
        const stepGeometry = new THREE.BoxGeometry(1.5, 0.15, 0.3);
        const stepMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        for (let i = 0; i < 6; i++) {
          const step = new THREE.Mesh(stepGeometry, stepMaterial);
          step.position.set(0, i * 0.15, i * 0.3);
          stairsGroup.add(step);
        }
        
        // 난간
        const railGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2, 8);
        const railMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        
        for (let side = -1; side <= 1; side += 2) {
          const rail = new THREE.Mesh(railGeometry, railMaterial);
          rail.position.set(side * 0.8, 0.6, 0.9);
          rail.rotation.z = Math.atan(0.9 / 1.8);
          stairsGroup.add(rail);
        }
        
        stairsGroup.position.set(position[0], position[1], position[2]);
        stairsGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(stairsGroup);
        break;

      case 'feet':
        // 발판/피트 (높이 조절 발판)
        const feetGroup = new THREE.Group();
        
        // 베이스 플레이트
        const feetBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8);
        const feetBaseMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const feetBase = new THREE.Mesh(feetBaseGeometry, feetBaseMaterial);
        feetBase.position.set(0, -0.98, 0);
        feetGroup.add(feetBase);
        
        // 조절 가능한 기둥
        const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(0, -0.5, 0);
        feetGroup.add(pole);
        
        // 상단 플레이트
        const topPlate = new THREE.Mesh(feetBaseGeometry, feetBaseMaterial);
        topPlate.position.set(0, 0.02, 0);
        feetGroup.add(topPlate);
        
        // 조절 나사 표시
        for (let i = 0; i < 4; i++) {
          const screwGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6);
          const screwMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
          const screw = new THREE.Mesh(screwGeometry, screwMaterial);
          const angle = (i / 4) * Math.PI * 2;
          screw.position.set(Math.cos(angle) * 0.2, -0.5, Math.sin(angle) * 0.2);
          feetGroup.add(screw);
        }
        
        feetGroup.position.set(position[0], position[1], position[2]);
        feetGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(feetGroup);
        break;

      case 'projector':
        // 프로젝션 시스템
        const projectorGroup = new THREE.Group();
        
        // 프로젝터 본체
        const projectorBody = new THREE.BoxGeometry(0.8, 0.3, 0.5);
        const projectorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const projector = new THREE.Mesh(projectorBody, projectorMaterial);
        projectorGroup.add(projector);
        
        // 렌즈
        const projectorLensGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12);
        const projectorLensMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x000000,
          transparent: true,
          opacity: 0.8
        });
        const projectorLens = new THREE.Mesh(projectorLensGeometry, projectorLensMaterial);
        projectorLens.rotation.x = Math.PI / 2;
        projectorLens.position.set(0, 0, 0.33);
        projectorGroup.add(projectorLens);
        
        // 마운트
        const mountGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const mountMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const mount = new THREE.Mesh(mountGeometry, mountMaterial);
        mount.position.set(0, -0.45, 0);
        projectorGroup.add(mount);
        
        // 빔 시각화
        const projectorBeamGeometry = new THREE.ConeGeometry(2, 8, 8);
        const projectorBeamMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xffffff,
          transparent: true,
          opacity: 0.1
        });
        const projectorBeam = new THREE.Mesh(projectorBeamGeometry, projectorBeamMaterial);
        projectorBeam.rotation.x = Math.PI / 2;
        projectorBeam.position.set(0, 0, 4.5);
        projectorGroup.add(projectorBeam);
        
        projectorGroup.position.set(position[0], 2, position[2]);
        projectorGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(projectorGroup);
        break;

      case 'wash_light':
        // 워시라이트
        const washGroup = new THREE.Group();
        
        // 워시라이트 본체
        const washBodyGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 12);
        const washBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const washBody = new THREE.Mesh(washBodyGeometry, washBodyMaterial);
        washGroup.add(washBody);
        
        // 전면 렌즈
        const washLensGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 12);
        const washLensMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xffffff,
          transparent: true,
          opacity: 0.7
        });
        const washLens = new THREE.Mesh(washLensGeometry, washLensMaterial);
        washLens.position.set(0, 0, 0.22);
        washGroup.add(washLens);
        
        // 마운트 요크
        const washYokeGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16, Math.PI);
        const washYokeMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const washYoke = new THREE.Mesh(washYokeGeometry, washYokeMaterial);
        washYoke.rotation.x = Math.PI / 2;
        washGroup.add(washYoke);
        
        // 클램프
        const clampGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        const clampMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const clamp = new THREE.Mesh(clampGeometry, clampMaterial);
        clamp.position.set(0, -0.4, 0);
        washGroup.add(clamp);
        
        washGroup.position.set(position[0], 2.5, position[2]);
        washGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(washGroup);
        break;

      case 'laser':
        // 레이저 시스템
        const laserGroup = new THREE.Group();
        
        // 레이저 본체
        const laserBodyGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.6);
        const laserBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const laserBody = new THREE.Mesh(laserBodyGeometry, laserBodyMaterial);
        laserGroup.add(laserBody);
        
        // 레이저 출구
        const laserExitGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
        const laserExitMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const laserExit = new THREE.Mesh(laserExitGeometry, laserExitMaterial);
        laserExit.rotation.x = Math.PI / 2;
        laserExit.position.set(0, 0, 0.35);
        laserGroup.add(laserExit);
        
        // 레이저 빔들 (여러 색상)
        const colors = [0xff0000, 0x00ff00, 0x0000ff];
        for (let i = 0; i < 3; i++) {
          const laserBeamGeometry = new THREE.CylinderGeometry(0.005, 0.005, 10, 4);
          const laserBeamMaterial = new THREE.MeshLambertMaterial({ 
            color: colors[i],
            transparent: true,
            opacity: 0.6
          });
          const laserBeam = new THREE.Mesh(laserBeamGeometry, laserBeamMaterial);
          laserBeam.rotation.x = Math.PI / 2;
          laserBeam.position.set((i - 1) * 0.1, 0, 5.3);
          laserGroup.add(laserBeam);
        }
        
        // 스캔 미러
        const mirrorGeometry = new THREE.PlaneGeometry(0.05, 0.05);
        const mirrorMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xcccccc,
          transparent: true,
          opacity: 0.8
        });
        const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        mirror.position.set(0, 0, 0.25);
        laserGroup.add(mirror);
        
        laserGroup.position.set(position[0], 2, position[2]);
        laserGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(laserGroup);
        break;

      case 'fog_machine':
        // 연막장치
        const fogGroup = new THREE.Group();
        
        // 기계 본체
        const fogBodyGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.6);
        const fogBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const fogBody = new THREE.Mesh(fogBodyGeometry, fogBodyMaterial);
        fogGroup.add(fogBody);
        
        // 연기 출구
        const outletGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8);
        const outletMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const outlet = new THREE.Mesh(outletGeometry, outletMaterial);
        outlet.rotation.x = Math.PI / 2;
        outlet.position.set(0, 0, 0.4);
        fogGroup.add(outlet);
        
        // 연기 효과 (파티클처럼 보이는 작은 구들)
        for (let i = 0; i < 20; i++) {
          const smokeGeometry = new THREE.SphereGeometry(0.05, 6, 6);
          const smokeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xdddddd,
            transparent: true,
            opacity: 0.3
          });
          const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
          smoke.position.set(
            (Math.random() - 0.5) * 2,
            Math.random() * 1,
            0.5 + Math.random() * 2
          );
          fogGroup.add(smoke);
        }
        
        // 제어 패널
        const fogPanelGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.05);
        const fogPanelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const fogPanel = new THREE.Mesh(fogPanelGeometry, fogPanelMaterial);
        fogPanel.position.set(0.25, 0.1, 0.33);
        fogGroup.add(fogPanel);
        
        fogGroup.position.set(position[0], position[1], position[2]);
        fogGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(fogGroup);
        break;

      case 'monitor':
        // 모니터 스피커
        const monitorGroup = new THREE.Group();
        
        // 캐비닛 (작은 크기)
        const monitorCabinetGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.3);
        const monitorCabinetMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const monitorCabinet = new THREE.Mesh(monitorCabinetGeometry, monitorCabinetMaterial);
        monitorGroup.add(monitorCabinet);
        
        // 드라이버
        const monitorDriverGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12);
        const monitorDriverMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const monitorDriver = new THREE.Mesh(monitorDriverGeometry, monitorDriverMaterial);
        monitorDriver.rotation.x = Math.PI / 2;
        monitorDriver.position.set(0, 0, 0.16);
        monitorGroup.add(monitorDriver);
        
        // 틸트 스탠드
        const standGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
        const standMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(0, -0.7, 0);
        monitorGroup.add(stand);
        
        // 베이스
        const monitorBaseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8);
        const monitorBase = new THREE.Mesh(monitorBaseGeometry, standMaterial);
        monitorBase.position.set(0, -1.1, 0);
        monitorGroup.add(monitorBase);
        
        monitorGroup.position.set(position[0], position[1], position[2]);
        monitorGroup.userData.isLibraryItem = true;
        if (sceneRef.current) sceneRef.current.add(monitorGroup);
        break;

      case 'subwoofer':
        // 서브우퍼
        const subwooferGroup = new THREE.Group();
        
        // 큰 캐비닛
        const subCabinetGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const subCabinetMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const subCabinet = new THREE.Mesh(subCabinetGeometry, subCabinetMaterial);
        subwooferGroup.add(subCabinet);
        
        // 대형 우퍼
        const subWooferGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
        const subWooferMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const subWoofer = new THREE.Mesh(subWooferGeometry, subWooferMaterial);
        subWoofer.rotation.x = Math.PI / 2;
        subWoofer.position.set(0, 0, 0.61);
        subwooferGroup.add(subWoofer);
        
        // 포트 (bass reflex)
        const portGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
        const portMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const port = new THREE.Mesh(portGeometry, portMaterial);
        port.rotation.x = Math.PI / 2;
        port.position.set(0, -0.3, 0.61);
        subwooferGroup.add(port);
        
        // 핸들
        const handleGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        for (let side = -1; side <= 1; side += 2) {
          const handle = new THREE.Mesh(handleGeometry, handleMaterial);
          handle.position.set(side * 0.5, 0.4, 0.61);
          handle.rotation.x = Math.PI / 2;
          subwooferGroup.add(handle);
        }
        
        subwooferGroup.position.set(position[0], -0.4, position[2]);
        subwooferGroup.userData.isLibraryItem = true;
        sceneRef.current.add(subwooferGroup);
        break;

      case 'mixer':
        // 믹싱 콘솔
        const mixerGroup = new THREE.Group();
        
        // 콘솔 본체
        const mixerBodyGeometry = new THREE.BoxGeometry(1.5, 0.2, 1);
        const mixerBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const mixerBody = new THREE.Mesh(mixerBodyGeometry, mixerBodyMaterial);
        mixerBody.rotation.x = -Math.PI / 12; // 약간 기울임
        mixerGroup.add(mixerBody);
        
        // 페이더들
        for (let i = 0; i < 8; i++) {
          const faderGeometry = new THREE.BoxGeometry(0.03, 0.1, 0.08);
          const faderMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
          const fader = new THREE.Mesh(faderGeometry, faderMaterial);
          fader.position.set((i - 3.5) * 0.15, 0.15, 0.2);
          mixerGroup.add(fader);
          
          // 노브들
          for (let j = 0; j < 4; j++) {
            const knobGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.02, 8);
            const knobMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
            const knob = new THREE.Mesh(knobGeometry, knobMaterial);
            knob.position.set((i - 3.5) * 0.15, 0.12, (j - 1.5) * 0.1);
            mixerGroup.add(knob);
          }
        }
        
        // 마스터 섹션
        const masterGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.3);
        const masterMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const master = new THREE.Mesh(masterGeometry, masterMaterial);
        master.position.set(0.6, 0.12, -0.2);
        mixerGroup.add(master);
        
        // 스크린
        const mixerScreenGeometry = new THREE.PlaneGeometry(0.15, 0.08);
        const mixerScreenMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x004400,
          emissive: 0x002200
        });
        const mixerScreen = new THREE.Mesh(mixerScreenGeometry, mixerScreenMaterial);
        mixerScreen.position.set(0.6, 0.18, -0.1);
        mixerScreen.rotation.x = -Math.PI / 12;
        mixerGroup.add(mixerScreen);
        
        mixerGroup.position.set(position[0], -2, position[2]);
        mixerGroup.userData.isLibraryItem = true;
        sceneRef.current.add(mixerGroup);
        break;

      case 'wireless_mic':
        // 무선 마이크 시스템
        const micGroup = new THREE.Group();
        
        // 수신기
        const receiverGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.3);
        const receiverMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const receiver = new THREE.Mesh(receiverGeometry, receiverMaterial);
        micGroup.add(receiver);
        
        // 안테나들
        for (let i = -1; i <= 1; i += 2) {
          const antennaGeometry = new THREE.CylinderGeometry(0.002, 0.002, 0.3, 4);
          const antennaMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
          const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
          antenna.position.set(i * 0.15, 0.2, -0.1);
          micGroup.add(antenna);
        }
        
        // 마이크 핸드헬드
        const micHandleGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 8);
        const micHandleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const micHandle = new THREE.Mesh(micHandleGeometry, micHandleMaterial);
        micHandle.position.set(0.3, 0.2, 0.1);
        micGroup.add(micHandle);
        
        // 마이크 헤드
        const micHeadGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const micHeadMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const micHead = new THREE.Mesh(micHeadGeometry, micHeadMaterial);
        micHead.position.set(0.3, 0.33, 0.1);
        micGroup.add(micHead);
        
        // LED 표시등들
        for (let i = 0; i < 3; i++) {
          const ledGeometry = new THREE.SphereGeometry(0.005, 4, 4);
          const ledMaterial = new THREE.MeshLambertMaterial({ 
            color: i === 0 ? 0x00ff00 : 0x666666,
            emissive: i === 0 ? 0x002200 : 0x000000
          });
          const led = new THREE.Mesh(ledGeometry, ledMaterial);
          led.position.set(i * 0.03 - 0.03, 0.06, 0.16);
          micGroup.add(led);
        }
        
        micGroup.position.set(position[0], -2, position[2]);
        micGroup.userData.isLibraryItem = true;
        sceneRef.current.add(micGroup);
        break;

      case 'line_array':
        // 라인 어레이 스피커
        const lineArrayGroup = new THREE.Group();
        
        // 메인 박스들 (수직으로 배열)
        for (let i = 0; i < 6; i++) {
          const boxGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.6);
          const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
          const box = new THREE.Mesh(boxGeometry, boxMaterial);
          box.position.set(0, i * 0.35, 0);
          lineArrayGroup.add(box);
          
          // 각 박스의 드라이버들
          for (let j = 0; j < 2; j++) {
            const driverGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12);
            const driverMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
            const driver = new THREE.Mesh(driverGeometry, driverMaterial);
            driver.rotation.x = Math.PI / 2;
            driver.position.set((j - 0.5) * 0.3, i * 0.35, 0.31);
            lineArrayGroup.add(driver);
          }
        }
        
        // 플라잉 하드웨어
        const flywareGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.1);
        const flywareMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const flyware = new THREE.Mesh(flywareGeometry, flywareMaterial);
        flyware.position.set(0, 2.2, -0.35);
        lineArrayGroup.add(flyware);
        
        // 체인/케이블
        const chainGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1, 4);
        const chainMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const chain = new THREE.Mesh(chainGeometry, chainMaterial);
        chain.position.set(0, 3, -0.35);
        lineArrayGroup.add(chain);
        
        lineArrayGroup.position.set(position[0], 0, position[2]);
        lineArrayGroup.userData.isLibraryItem = true;
        sceneRef.current.add(lineArrayGroup);
        break;

      case 'power_dist':
        // 파워 디스트리뷰션
        const powerGroup = new THREE.Group();
        
        // 메인 박스
        const powerBoxGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.6);
        const powerBoxMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const powerBox = new THREE.Mesh(powerBoxGeometry, powerBoxMaterial);
        powerGroup.add(powerBox);
        
        // 메인 입력 케이블
        const mainCableGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
        const mainCableMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const mainCable = new THREE.Mesh(mainCableGeometry, mainCableMaterial);
        mainCable.rotation.x = Math.PI / 2;
        mainCable.position.set(0, 0, -0.55);
        powerGroup.add(mainCable);
        
        // 출력 소켓들
        for (let i = 0; i < 8; i++) {
          const socketGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6);
          const socketMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
          const socket = new THREE.Mesh(socketGeometry, socketMaterial);
          socket.rotation.x = Math.PI / 2;
          socket.position.set(
            (i % 4 - 1.5) * 0.15,
            Math.floor(i / 4) * 0.3 - 0.15,
            0.31
          );
          powerGroup.add(socket);
        }
        
        // 인디케이터 LED들
        for (let i = 0; i < 8; i++) {
          const ledGeometry = new THREE.SphereGeometry(0.01, 4, 4);
          const ledMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00ff00,
            emissive: 0x003300
          });
          const led = new THREE.Mesh(ledGeometry, ledMaterial);
          led.position.set(
            (i % 4 - 1.5) * 0.15,
            Math.floor(i / 4) * 0.3 - 0.05,
            0.31
          );
          powerGroup.add(led);
        }
        
        powerGroup.position.set(position[0], position[1], position[2]);
        powerGroup.userData.isLibraryItem = true;
        sceneRef.current.add(powerGroup);
        break;

      case 'signal_splitter':
        // 신호 분배기
        const splitterGroup = new THREE.Group();
        
        // 1U 랙 박스
        const rackGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.4);
        const rackMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        splitterGroup.add(rack);
        
        // 전면 패널
        const panelGeometry = new THREE.PlaneGeometry(0.78, 0.08);
        const panelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(0, 0, 0.21);
        splitterGroup.add(panel);
        
        // XLR 입력들
        for (let i = 0; i < 4; i++) {
          const xlrGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.03, 6);
          const xlrMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
          const xlr = new THREE.Mesh(xlrGeometry, xlrMaterial);
          xlr.rotation.x = Math.PI / 2;
          xlr.position.set((i - 1.5) * 0.15, 0, 0.22);
          splitterGroup.add(xlr);
        }
        
        // XLR 출력들 (후면)
        for (let i = 0; i < 16; i++) {
          const xlrOutGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6);
          const xlrOutMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
          const xlrOut = new THREE.Mesh(xlrOutGeometry, xlrOutMaterial);
          xlrOut.rotation.x = Math.PI / 2;
          xlrOut.position.set(
            (i % 8 - 3.5) * 0.08,
            Math.floor(i / 8) * 0.04 - 0.02,
            -0.22
          );
          splitterGroup.add(xlrOut);
        }
        
        splitterGroup.position.set(position[0], -2, position[2]);
        splitterGroup.userData.isLibraryItem = true;
        sceneRef.current.add(splitterGroup);
        break;

      case 'router':
        // 네트워크 라우터
        const routerGroup = new THREE.Group();
        
        // 라우터 본체
        const routerBodyGeometry = new THREE.BoxGeometry(0.6, 0.08, 0.4);
        const routerBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const routerBody = new THREE.Mesh(routerBodyGeometry, routerBodyMaterial);
        routerGroup.add(routerBody);
        
        // 안테나들
        for (let i = 0; i < 4; i++) {
          const antennaGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.2, 4);
          const antennaMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
          const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
          antenna.position.set((i - 1.5) * 0.1, 0.15, -0.15);
          antenna.rotation.z = (Math.random() - 0.5) * 0.5; // 약간의 각도 변화
          routerGroup.add(antenna);
        }
        
        // 이더넷 포트들
        for (let i = 0; i < 8; i++) {
          const portGeometry = new THREE.BoxGeometry(0.02, 0.01, 0.015);
          const portMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
          const port = new THREE.Mesh(portGeometry, portMaterial);
          port.position.set((i - 3.5) * 0.03, -0.035, 0.21);
          routerGroup.add(port);
        }
        
        // 상태 LED들
        for (let i = 0; i < 8; i++) {
          const ledGeometry = new THREE.SphereGeometry(0.002, 4, 4);
          const ledMaterial = new THREE.MeshLambertMaterial({ 
            color: Math.random() > 0.5 ? 0x00ff00 : 0xff6600,
            emissive: Math.random() > 0.5 ? 0x003300 : 0x331100
          });
          const led = new THREE.Mesh(ledGeometry, ledMaterial);
          led.position.set((i - 3.5) * 0.03, 0.015, 0.21);
          routerGroup.add(led);
        }
        
        routerGroup.position.set(position[0], -2, position[2]);
        routerGroup.userData.isLibraryItem = true;
        sceneRef.current.add(routerGroup);
        break;

      default:
        // 기본 박스 형태
        const defaultGeometry = new THREE.BoxGeometry(1, 1, 1);
        const defaultMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
        defaultMesh.position.set(position[0], position[1] + 0.5, position[2]);
        defaultMesh.userData.isLibraryItem = true;
        sceneRef.current.add(defaultMesh);
        break;
    }

    // 변경 후 상태 저장 (새로운 요소 추가 완료)
    saveSceneState();
  };

  return (
    <div className="relative h-screen bg-gray-50">
      {/* 좌측 세로 툴바 - 더 컴팩트하게 */}
      <div className={`w-16 bg-white shadow-md flex flex-col items-center py-3 space-y-3 z-30 border-r border-gray-200 fixed ${isSidebarOpen ? 'left-72' : 'left-16'} top-0 h-full transition-all duration-300`}>
        {/* 3D 요소 버튼 */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleTabClick('models')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1 transition-colors ${
              activeTab === 'models' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Square className="w-5 h-5" />
          </button>
          <span className={`text-xs ${
            activeTab === 'models' ? 'text-blue-600' : 'text-gray-600'
          }`}>3D 요소</span>
        </div>

        {/* 배경 버튼 */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleTabClick('background')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1 transition-colors ${
              activeTab === 'background' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <span className={`text-xs ${
            activeTab === 'background' ? 'text-green-600' : 'text-gray-600'
          }`}>배경</span>
        </div>

        {/* 편집 버튼 */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleTabClick('edit')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1 transition-colors ${
              activeTab === 'edit' 
                ? 'bg-purple-100 text-purple-600' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <span className={`text-xs font-medium ${
            activeTab === 'edit' ? 'text-purple-600' : 'text-gray-600'
          }`}>편집</span>
        </div>

        {/* 견적 버튼 */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleTabClick('quote')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1 transition-colors ${
              activeTab === 'quote' 
                ? 'bg-orange-100 text-orange-600' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calculator className="w-5 h-5" />
          </button>
          <span className={`text-xs ${
            activeTab === 'quote' ? 'text-orange-600' : 'text-gray-600'
          }`}>견적</span>
        </div>


      </div>

      {/* 메인 3D 뷰어 영역 - 전체 화면 */}
      <div className={`fixed inset-0 ${isSidebarOpen ? 'pl-[364px]' : 'pl-[140px]'} transition-all duration-300`}>
        <div 
          ref={mountRef} 
          className="w-full h-full"
        />

        {/* 편집 패널 - Edit 탭 활성화시에만 표시 */}
        {showUploadPanel && (
          <div 
            className={`fixed top-4 ${isSidebarOpen ? 'left-[364px]' : 'left-[140px]'} w-80 bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col`}
            style={{ zIndex: 99999 }}
          >
            {/* 패널 헤더 - 상단 라운드 */}
            <div className="p-4 border-b border-gray-100 rounded-t-2xl bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">편집 패널</h3>
                <button
                  onClick={() => setShowUploadPanel(false)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto rounded-b-2xl">
              <div className="p-4 pb-6 space-y-6">

              {/* Transform Controls Panel */}
              {selectedObject && selectedObjectProperties && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-blue-800">
                  🎯 {selectedObject ? (() => {
                    const type = selectedObjectProperties?.type;
                    const typeNames: { [key: string]: string } = {
                      'stage': '무대',
                      'truss': '트러스',
                      'layher': '레이어',
                      'lighting': '조명',
                      'led_screen': 'LED 스크린',
                      'speaker': '스피커',
                      'chair': '의자',
                      'decoration': '장식',
                      'special_effect': '특수효과',
                      'camera': '카메라'
                    };
                    return selectedObjectProperties?.name || typeNames[type] || type || '선택된 객체';
                  })() : '선택된 객체'}
                </h4>
                    <button
                      onClick={deleteSelectedObject}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Transform Mode Buttons */}
                  <div className="flex mb-4 bg-white rounded-lg p-1 border">
                    <button
                      onClick={() => changeTransformMode('translate')}
                      className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                        transformMode === 'translate'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      📍 이동
                    </button>
                    <button
                      onClick={() => changeTransformMode('scale')}
                      className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                        transformMode === 'scale'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      📏 크기
                    </button>
                    <button
                      onClick={() => changeTransformMode('rotate')}
                      className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                        transformMode === 'rotate'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      🔄 회전
                    </button>
                  </div>

                  {/* Position Controls */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">📍 위치</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">X</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={localPositionValues.x}
                              onFocus={() => setFocusedField('position-x')}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                setLocalPositionValues(prev => ({ ...prev, x: inputValue }));
                                
                                // 유효한 숫자면 즉시 업데이트
                                immediateUpdatePosition('x', inputValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.x) || 0;
                                  const increment = e.shiftKey ? 1 : 0.1;
                                  const newValue = (currentValue + increment).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, x: newValue }));
                                  updateObjectProperty('position', 'x', parseFloat(newValue));
                                } else if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.x) || 0;
                                  const decrement = e.shiftKey ? 1 : 0.1;
                                  const newValue = (currentValue - decrement).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, x: newValue }));
                                  updateObjectProperty('position', 'x', parseFloat(newValue));
                                }
                              }}
                              onBlur={(e) => {
                                setFocusedField(null);
                                const inputValue = e.target.value.trim();
                                
                                // 빈 값인 경우 0으로 설정
                                if (inputValue === '' || inputValue === '.') {
                                  const fixedValue = '0';
                                  setLocalPositionValues(prev => ({ ...prev, x: fixedValue }));
                                  updateObjectProperty('position', 'x', 0);
                                  return;
                                }
                                
                                const value = parseFloat(inputValue);
                                if (isNaN(value) || !isFinite(value)) {
                                  const fixedValue = '0';
                                  setLocalPositionValues(prev => ({ ...prev, x: fixedValue }));
                                  updateObjectProperty('position', 'x', 0);
                                } else {
                                  // 유효한 값이면 그대로 유지하고 업데이트
                                  updateObjectProperty('position', 'x', value);
                                }
                              }}
                              className="w-full px-2 py-1 pr-6 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute right-1 top-0 h-full flex flex-col">
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.x) || 0;
                                  const newValue = (currentValue + 0.1).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, x: newValue }));
                                  updateObjectProperty('position', 'x', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.x) || 0;
                                  const newValue = (currentValue - 0.1).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, x: newValue }));
                                  updateObjectProperty('position', 'x', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Y</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={localPositionValues.y}
                              onFocus={() => setFocusedField('position-y')}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                setLocalPositionValues(prev => ({ ...prev, y: inputValue }));
                                
                                // 유효한 숫자면 즉시 업데이트
                                immediateUpdatePosition('y', inputValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.y) || 0;
                                  const increment = e.shiftKey ? 1 : 0.1;
                                  const newValue = (currentValue + increment).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, y: newValue }));
                                  updateObjectProperty('position', 'y', parseFloat(newValue));
                                } else if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.y) || 0;
                                  const decrement = e.shiftKey ? 1 : 0.1;
                                  const newValue = (currentValue - decrement).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, y: newValue }));
                                  updateObjectProperty('position', 'y', parseFloat(newValue));
                                }
                              }}
                              onBlur={(e) => {
                                setFocusedField(null);
                                const inputValue = e.target.value.trim();
                                
                                // 빈 값인 경우 0으로 설정
                                if (inputValue === '' || inputValue === '.') {
                                  const fixedValue = '0';
                                  setLocalPositionValues(prev => ({ ...prev, y: fixedValue }));
                                  updateObjectProperty('position', 'y', 0);
                                  return;
                                }
                                
                                const value = parseFloat(inputValue);
                                if (isNaN(value) || !isFinite(value)) {
                                  const fixedValue = '0';
                                  setLocalPositionValues(prev => ({ ...prev, y: fixedValue }));
                                  updateObjectProperty('position', 'y', 0);
                                } else {
                                  // 유효한 값이면 그대로 유지하고 업데이트
                                  updateObjectProperty('position', 'y', value);
                                }
                              }}
                              className="w-full px-2 py-1 pr-6 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute right-1 top-0 h-full flex flex-col">
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.y) || 0;
                                  const newValue = (currentValue + 0.1).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, y: newValue }));
                                  updateObjectProperty('position', 'y', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.y) || 0;
                                  const newValue = (currentValue - 0.1).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, y: newValue }));
                                  updateObjectProperty('position', 'y', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Z</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={localPositionValues.z}
                              onFocus={() => setFocusedField('position-z')}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                setLocalPositionValues(prev => ({ ...prev, z: inputValue }));
                                
                                // 유효한 숫자면 즉시 업데이트
                                immediateUpdatePosition('z', inputValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.z) || 0;
                                  const increment = e.shiftKey ? 1 : 0.1;
                                  const newValue = (currentValue + increment).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, z: newValue }));
                                  updateObjectProperty('position', 'z', parseFloat(newValue));
                                } else if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.z) || 0;
                                  const decrement = e.shiftKey ? 1 : 0.1;
                                  const newValue = (currentValue - decrement).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, z: newValue }));
                                  updateObjectProperty('position', 'z', parseFloat(newValue));
                                }
                              }}
                              onBlur={(e) => {
                                setFocusedField(null);
                                const inputValue = e.target.value.trim();
                                
                                // 빈 값인 경우 0으로 설정
                                if (inputValue === '' || inputValue === '.') {
                                  const fixedValue = '0';
                                  setLocalPositionValues(prev => ({ ...prev, z: fixedValue }));
                                  updateObjectProperty('position', 'z', 0);
                                  return;
                                }
                                
                                const value = parseFloat(inputValue);
                                if (isNaN(value) || !isFinite(value)) {
                                  const fixedValue = '0';
                                  setLocalPositionValues(prev => ({ ...prev, z: fixedValue }));
                                  updateObjectProperty('position', 'z', 0);
                                } else {
                                  // 유효한 값이면 그대로 유지하고 업데이트
                                  updateObjectProperty('position', 'z', value);
                                }
                              }}
                              className="w-full px-2 py-1 pr-6 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute right-1 top-0 h-full flex flex-col">
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.z) || 0;
                                  const newValue = (currentValue + 0.1).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, z: newValue }));
                                  updateObjectProperty('position', 'z', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localPositionValues.z) || 0;
                                  const newValue = (currentValue - 0.1).toFixed(1);
                                  setLocalPositionValues(prev => ({ ...prev, z: newValue }));
                                  updateObjectProperty('position', 'z', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scale Controls */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">📏 크기</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">가로</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={localScaleValues.x}
                              onFocus={() => setFocusedField('scale-x')}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                setLocalScaleValues(prev => ({ ...prev, x: inputValue }));
                                
                                // 유효한 숫자면 즉시 업데이트
                                immediateUpdateScale('x', inputValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.x) || 0.1;
                                  const increment = e.shiftKey ? 1 : 0.1;
                                  const newValue = Math.max(0.1, currentValue + increment).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, x: newValue }));
                                  updateObjectProperty('scale', 'x', parseFloat(newValue));
                                } else if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.x) || 0.1;
                                  const decrement = e.shiftKey ? 1 : 0.1;
                                  const newValue = Math.max(0.1, currentValue - decrement).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, x: newValue }));
                                  updateObjectProperty('scale', 'x', parseFloat(newValue));
                                }
                              }}
                              onBlur={(e) => {
                                setFocusedField(null);
                                const inputValue = e.target.value.trim();
                                
                                // 빈 값이거나 잘못된 입력인 경우 기본값으로 설정
                                if (inputValue === '' || inputValue === '.' || inputValue === '-' || inputValue === '0') {
                                  const fixedValue = '0.1';
                                  setLocalScaleValues(prev => ({ ...prev, x: fixedValue }));
                                  updateObjectProperty('scale', 'x', 0.1);
                                  return;
                                }
                                
                                const value = parseFloat(inputValue);
                                if (isNaN(value) || value <= 0 || !isFinite(value)) {
                                  const fixedValue = '0.1';
                                  setLocalScaleValues(prev => ({ ...prev, x: fixedValue }));
                                  updateObjectProperty('scale', 'x', 0.1);
                                } else {
                                  // 유효한 값이면 그대로 유지하고 업데이트
                                  updateObjectProperty('scale', 'x', value);
                                }
                              }}
                              className="w-full px-2 py-1 pr-6 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="가로"
                            />
                            <div className="absolute right-1 top-0 h-full flex flex-col">
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.x) || 0.1;
                                  const newValue = Math.max(0.1, currentValue + 0.1).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, x: newValue }));
                                  updateObjectProperty('scale', 'x', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.x) || 0.1;
                                  const newValue = Math.max(0.1, currentValue - 0.1).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, x: newValue }));
                                  updateObjectProperty('scale', 'x', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">높이</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={localScaleValues.y}
                              onFocus={() => setFocusedField('scale-y')}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                setLocalScaleValues(prev => ({ ...prev, y: inputValue }));
                                
                                // 유효한 숫자면 즉시 업데이트
                                immediateUpdateScale('y', inputValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.y) || 0.1;
                                  const increment = e.shiftKey ? 1 : 0.1;
                                  const newValue = Math.max(0.1, currentValue + increment).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, y: newValue }));
                                  updateObjectProperty('scale', 'y', parseFloat(newValue));
                                } else if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.y) || 0.1;
                                  const decrement = e.shiftKey ? 1 : 0.1;
                                  const newValue = Math.max(0.1, currentValue - decrement).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, y: newValue }));
                                  updateObjectProperty('scale', 'y', parseFloat(newValue));
                                }
                              }}
                              onBlur={(e) => {
                                setFocusedField(null);
                                const inputValue = e.target.value.trim();
                                
                                // 빈 값이거나 잘못된 입력인 경우 기본값으로 설정
                                if (inputValue === '' || inputValue === '.' || inputValue === '-' || inputValue === '0') {
                                  const fixedValue = '0.1';
                                  setLocalScaleValues(prev => ({ ...prev, y: fixedValue }));
                                  updateObjectProperty('scale', 'y', 0.1);
                                  return;
                                }
                                
                                const value = parseFloat(inputValue);
                                if (isNaN(value) || value <= 0 || !isFinite(value)) {
                                  const fixedValue = '0.1';
                                  setLocalScaleValues(prev => ({ ...prev, y: fixedValue }));
                                  updateObjectProperty('scale', 'y', 0.1);
                                } else {
                                  // 유효한 값이면 그대로 유지하고 업데이트
                                  updateObjectProperty('scale', 'y', value);
                                }
                              }}
                              className="w-full px-2 py-1 pr-6 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="높이"
                            />
                            <div className="absolute right-1 top-0 h-full flex flex-col">
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.y) || 0.1;
                                  const newValue = Math.max(0.1, currentValue + 0.1).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, y: newValue }));
                                  updateObjectProperty('scale', 'y', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.y) || 0.1;
                                  const newValue = Math.max(0.1, currentValue - 0.1).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, y: newValue }));
                                  updateObjectProperty('scale', 'y', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">세로</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={localScaleValues.z}
                              onFocus={() => setFocusedField('scale-z')}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                setLocalScaleValues(prev => ({ ...prev, z: inputValue }));
                                
                                // 유효한 숫자면 즉시 업데이트
                                immediateUpdateScale('z', inputValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.z) || 0.1;
                                  const increment = e.shiftKey ? 1 : 0.1;
                                  const newValue = Math.max(0.1, currentValue + increment).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, z: newValue }));
                                  updateObjectProperty('scale', 'z', parseFloat(newValue));
                                } else if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.z) || 0.1;
                                  const decrement = e.shiftKey ? 1 : 0.1;
                                  const newValue = Math.max(0.1, currentValue - decrement).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, z: newValue }));
                                  updateObjectProperty('scale', 'z', parseFloat(newValue));
                                }
                              }}
                              onBlur={(e) => {
                                setFocusedField(null);
                                const inputValue = e.target.value.trim();
                                
                                // 빈 값이거나 잘못된 입력인 경우 기본값으로 설정
                                if (inputValue === '' || inputValue === '.' || inputValue === '-' || inputValue === '0') {
                                  const fixedValue = '0.1';
                                  setLocalScaleValues(prev => ({ ...prev, z: fixedValue }));
                                  updateObjectProperty('scale', 'z', 0.1);
                                  return;
                                }
                                
                                const value = parseFloat(inputValue);
                                if (isNaN(value) || value <= 0 || !isFinite(value)) {
                                  const fixedValue = '0.1';
                                  setLocalScaleValues(prev => ({ ...prev, z: fixedValue }));
                                  updateObjectProperty('scale', 'z', 0.1);
                                } else {
                                  // 유효한 값이면 그대로 유지하고 업데이트
                                  updateObjectProperty('scale', 'z', value);
                                }
                              }}
                              className="w-full px-2 py-1 pr-6 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="세로"
                            />
                            <div className="absolute right-1 top-0 h-full flex flex-col">
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.z) || 0.1;
                                  const newValue = Math.max(0.1, currentValue + 0.1).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, z: newValue }));
                                  updateObjectProperty('scale', 'z', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const currentValue = parseFloat(localScaleValues.z) || 0.1;
                                  const newValue = Math.max(0.1, currentValue - 0.1).toFixed(1);
                                  setLocalScaleValues(prev => ({ ...prev, z: newValue }));
                                  updateObjectProperty('scale', 'z', parseFloat(newValue));
                                }}
                                className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[8px] leading-none"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rotation Controls */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">🔄 회전 (도)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">X</label>
                          <input
                            type="text"
                            value={(selectedObjectProperties.rotation.x * 180 / Math.PI).toFixed(1)}
                            onChange={(e) => updateObjectProperty('rotation', 'x', parseFloat(e.target.value) * Math.PI / 180)}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                const currentValue = (selectedObjectProperties.rotation.x * 180 / Math.PI) || 0;
                                const increment = e.shiftKey ? 1 : 0.1;
                                const newValue = currentValue + increment;
                                updateObjectProperty('rotation', 'x', newValue * Math.PI / 180);
                              } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const currentValue = (selectedObjectProperties.rotation.x * 180 / Math.PI) || 0;
                                const decrement = e.shiftKey ? 1 : 0.1;
                                const newValue = currentValue - decrement;
                                updateObjectProperty('rotation', 'x', newValue * Math.PI / 180);
                              }
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Y</label>
                          <input
                            type="text"
                            value={(selectedObjectProperties.rotation.y * 180 / Math.PI).toFixed(1)}
                            onChange={(e) => updateObjectProperty('rotation', 'y', parseFloat(e.target.value) * Math.PI / 180)}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                const currentValue = (selectedObjectProperties.rotation.y * 180 / Math.PI) || 0;
                                const increment = e.shiftKey ? 1 : 0.1;
                                const newValue = currentValue + increment;
                                updateObjectProperty('rotation', 'y', newValue * Math.PI / 180);
                              } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const currentValue = (selectedObjectProperties.rotation.y * 180 / Math.PI) || 0;
                                const decrement = e.shiftKey ? 1 : 0.1;
                                const newValue = currentValue - decrement;
                                updateObjectProperty('rotation', 'y', newValue * Math.PI / 180);
                              }
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Z</label>
                          <input
                            type="text"
                            value={(selectedObjectProperties.rotation.z * 180 / Math.PI).toFixed(1)}
                            onChange={(e) => updateObjectProperty('rotation', 'z', parseFloat(e.target.value) * Math.PI / 180)}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                const currentValue = (selectedObjectProperties.rotation.z * 180 / Math.PI) || 0;
                                const increment = e.shiftKey ? 1 : 0.1;
                                const newValue = currentValue + increment;
                                updateObjectProperty('rotation', 'z', newValue * Math.PI / 180);
                              } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const currentValue = (selectedObjectProperties.rotation.z * 180 / Math.PI) || 0;
                                const decrement = e.shiftKey ? 1 : 0.1;
                                const newValue = currentValue - decrement;
                                updateObjectProperty('rotation', 'z', newValue * Math.PI / 180);
                              }
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!selectedObject && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 text-center mb-2">
                    🖱️ 3D 뷰어에서 객체를 선택하세요
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 클릭: 객체 선택</p>
                    <p>• 더블클릭: 크기 편집</p>
                  </div>
                </div>
              )}


            </div>
            </div>
          </div>
        )}

        {/* Models Panel */}
        {showModelsPanel && (
          <div 
            className={`fixed top-4 ${isSidebarOpen ? 'left-[364px]' : 'left-[140px]'} w-80 bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col`}
            style={{ zIndex: 99999 }}
          >
            {/* 패널 헤더 - 상단 라운드 */}
            <div className="p-4 border-b border-gray-100 rounded-t-2xl bg-white flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">3D 무대 요소</h3>
            </div>

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto p-4 rounded-b-2xl"
                 style={{ maxHeight: 'calc(100vh - 120px)' }}>
              
              {/* Library/Template/Image Upload Tabs */}
              <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedModelTab('library')}
                  className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                    selectedModelTab === 'library'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  라이브러리
                </button>
                <button
                  onClick={() => setSelectedModelTab('template')}
                  className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                    selectedModelTab === 'template'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  템플릿
                </button>
                <button
                  onClick={() => setSelectedModelTab('imageUpload')}
                  className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                    selectedModelTab === 'imageUpload'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  이미지 업로드
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="무대 요소 검색..."
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {modelSearchQuery && (
                    <button 
                      className="absolute right-3 top-2.5 hover:text-gray-600"
                      onClick={() => setModelSearchQuery('')}
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedModelCategory('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedModelCategory === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {modelCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedModelCategory(category.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedModelCategory === category.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content based on selected tab */}
              {selectedModelTab === 'imageUpload' ? (
                <div className="space-y-4">
                  {/* 이미지 업로드 섹션 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      📷 이미지 업로드
                    </h4>
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50">
                      <ImageIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-4">
                        이미지를 업로드하면 AI가 분석하여<br/>
                        자동으로 3D 요소를 생성합니다
                      </p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <span className="inline-flex items-center px-6 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md">
                          <Upload className="w-5 h-5 mr-2" />
                          이미지 선택
                        </span>
                      </label>
                    </div>

                    {/* 업로드된 이미지 목록 */}
                    {uploadedImages.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">업로드된 이미지 ({uploadedImages.length}개)</h5>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={URL.createObjectURL(image)} 
                                  alt={`uploaded-${index}`}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                                  <p className="text-xs text-gray-500">{(image.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => analyzeAndGenerate3DElements(image)}
                                  className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors"
                                  title="AI로 이미지 분석하여 3D 요소 생성"
                                >
                                  AI 분석
                                </button>
                                <button 
                                  onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  title="이미지 제거"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 도움말 */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h6 className="text-sm font-medium text-blue-800 mb-2">💡 사용 팁</h6>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• 무대, 조명, 스피커 등이 포함된 이미지가 좋습니다</li>
                        <li>• 여러 이미지를 한 번에 업로드할 수 있습니다</li>
                        <li>• AI 분석 후 생성된 요소는 3D 뷰어에서 편집 가능합니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : selectedModelTab === 'library' ? (
                <>
                  {/* Category Tabs - 기존 3x3 그리드 */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {modelCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedModelCategory(category.id)}
                        className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                          selectedModelCategory === category.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-lg mb-1">{category.icon}</div>
                        {category.name}
                      </button>
                    ))}
                  </div>

                  {/* Model Items Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      // 아이템 선택 로직
                      let allItems;
                      if (modelSearchQuery) {
                        // 검색어가 있을 때는 모든 아이템에서 검색
                        allItems = Object.values(modelItems).flat();
                      } else if (selectedModelCategory === 'all') {
                        // All 탭이 선택되고 검색어가 없을 때는 모든 아이템 표시
                        allItems = Object.values(modelItems).flat();
                      } else {
                        // 특정 카테고리가 선택되고 검색어가 없을 때는 해당 카테고리만
                        allItems = modelItems[selectedModelCategory as keyof typeof modelItems] || [];
                      }
                      
                      // 검색 필터링
                      const filteredItems = allItems.filter((item) => {
                        if (!modelSearchQuery) return true;
                        const searchLower = modelSearchQuery.toLowerCase();
                        return item.name.toLowerCase().includes(searchLower) ||
                               item.type.toLowerCase().includes(searchLower) ||
                               ((item as any).size && (item as any).size.toLowerCase().includes(searchLower)) ||
                               ((item as any).power && (item as any).power.toLowerCase().includes(searchLower)) ||
                               ((item as any).capacity && (item as any).capacity.toLowerCase().includes(searchLower));
                      });

                      // 검색 결과가 없을 때
                      if (filteredItems.length === 0 && modelSearchQuery) {
                        return (
                          <div className="col-span-2 text-center py-8">
                            <div className="text-gray-400 mb-2">
                              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <p className="text-gray-500 text-sm">'{modelSearchQuery}'에 대한 검색 결과가 없습니다.</p>
                            <p className="text-gray-400 text-xs mt-1">다른 검색어를 시도해보세요.</p>
                          </div>
                        );
                      }

                      // 검색 결과 렌더링
                      return filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                        onClick={() => addModelToScene(item)}
                      >
                        <div className="mb-2 w-full h-16 rounded-md overflow-hidden">
                          {/* 3D 요소 썸네일 */}
                          {item.type === 'platform' && (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center relative">
                              <div className="w-12 h-2 bg-amber-400 rounded-sm shadow-md transform -skew-x-12"></div>
                              <div className="absolute bottom-1 left-2 w-10 h-1 bg-amber-500 rounded-sm opacity-60"></div>
                            </div>
                          )}
                          {item.type === 'layher' && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                              <div className="grid grid-cols-3 gap-1">
                                <div className="w-2 h-6 bg-gray-400 rounded-sm"></div>
                                <div className="w-2 h-6 bg-gray-400 rounded-sm"></div>
                                <div className="w-2 h-6 bg-gray-400 rounded-sm"></div>
                              </div>
                              <div className="absolute top-2 left-2 w-8 h-1 bg-gray-500 rounded-sm"></div>
                              <div className="absolute bottom-2 left-2 w-8 h-1 bg-gray-500 rounded-sm"></div>
                            </div>
                          )}
                          {item.type === 'truss' && (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                              <div className="w-16 h-3 bg-slate-400 rounded-sm relative">
                                <div className="absolute -top-1 left-1 w-1 h-5 bg-slate-500 rounded-sm"></div>
                                <div className="absolute -top-1 right-1 w-1 h-5 bg-slate-500 rounded-sm"></div>
                                <div className="absolute top-0 left-2 w-12 h-1 bg-slate-300 rounded-sm"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'backdrop' && (
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
                              <div className="w-14 h-12 bg-blue-200 rounded-sm border-2 border-blue-300 flex items-center justify-center">
                                <div className="w-8 h-6 bg-blue-300 rounded-sm opacity-70"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'led_screen' && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
                              <div className="w-12 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                                <div className="grid grid-cols-4 gap-px">
                                  {Array.from({length: 8}).map((_, i) => (
                                    <div key={i} className={`w-1 h-1 rounded-sm ${
                                      i % 3 === 0 ? 'bg-blue-400' : i % 3 === 1 ? 'bg-green-400' : 'bg-red-400'
                                    }`}></div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {item.type === 'moving_light' && (
                            <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-orange-200 flex items-center justify-center relative">
                              <div className="w-6 h-6 bg-gray-700 rounded-full relative">
                                <div className="absolute inset-1 bg-yellow-300 rounded-full"></div>
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-yellow-200 opacity-70 rounded-t-full"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'main_speaker' && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                              <div className="w-8 h-12 bg-gray-700 rounded border border-gray-600">
                                <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto mt-1"></div>
                                <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto mt-1"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto mt-1"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'seating' && (
                            <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center relative">
                              <div className="grid grid-cols-4 gap-1">
                                {Array.from({length: 8}).map((_, i) => (
                                  <div key={i} className="w-2 h-3 bg-red-400 rounded-t-sm"></div>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.type === 'stairs' && (
                            <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center relative">
                              <div className="relative">
                                <div className="w-2 h-6 bg-stone-400"></div>
                                <div className="w-3 h-5 bg-stone-500 -ml-1 -mt-1"></div>
                                <div className="w-4 h-4 bg-stone-600 -ml-1 -mt-1"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'projector' && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center relative">
                              <div className="w-8 h-5 bg-gray-800 rounded-sm relative">
                                <div className="absolute -right-1 top-1 w-2 h-3 bg-gray-900 rounded-sm"></div>
                                <div className="absolute left-1 top-1 w-2 h-1 bg-blue-300 rounded-sm"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'wash_light' && (
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center relative">
                              <div className="w-6 h-6 bg-gray-600 rounded-full relative">
                                <div className="absolute inset-1 bg-purple-300 rounded-full"></div>
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-purple-200 opacity-60 rounded-t-full"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'monitor' && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
                              <div className="w-10 h-6 bg-gray-600 rounded border border-gray-500 transform rotate-12">
                                <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto mt-1"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'subwoofer' && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
                              <div className="w-10 h-10 bg-gray-800 rounded border border-gray-600">
                                <div className="w-6 h-6 bg-gray-700 rounded-full mx-auto mt-2 border-2 border-gray-500"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'control_booth' && (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
                              <div className="w-12 h-8 bg-blue-300 rounded-sm border border-blue-400 relative">
                                <div className="absolute top-1 left-1 w-2 h-1 bg-blue-500 rounded-sm"></div>
                                <div className="absolute top-1 right-1 w-2 h-1 bg-blue-500 rounded-sm"></div>
                                <div className="absolute bottom-1 left-2 w-8 h-2 bg-blue-400 rounded-sm"></div>
                              </div>
                            </div>
                          )}
                          {item.type === 'barrier' && (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative">
                              <div className="flex space-x-1">
                                <div className="w-1 h-8 bg-orange-400 rounded-sm"></div>
                                <div className="w-1 h-8 bg-orange-400 rounded-sm"></div>
                                <div className="w-1 h-8 bg-orange-400 rounded-sm"></div>
                                <div className="w-1 h-8 bg-orange-400 rounded-sm"></div>
                              </div>
                              <div className="absolute top-2 left-2 w-8 h-1 bg-orange-500 rounded-sm"></div>
                              <div className="absolute bottom-2 left-2 w-8 h-1 bg-orange-500 rounded-sm"></div>
                            </div>
                          )}
                          {item.type === 'camera' && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative">
                              <div className="w-8 h-6 bg-gray-700 rounded-sm relative">
                                <div className="absolute -left-1 top-1 w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600"></div>
                                <div className="absolute -left-1 top-1 w-3 h-3 bg-gray-900 rounded-full mx-auto"></div>
                              </div>
                            </div>
                          )}
                          {/* 기본 썸네일 */}
                          {!['platform', 'layher', 'truss', 'backdrop', 'led_screen', 'moving_light', 'main_speaker', 'seating', 'stairs', 'projector', 'wash_light', 'monitor', 'subwoofer', 'control_booth', 'barrier', 'camera'].includes(item.type) && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <div className="w-8 h-8 bg-gray-400 rounded transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-800 mb-1">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {'size' in item && `크기: ${item.size}`}
                          {'power' in item && `전력: ${item.power}`}
                          {'capacity' in item && `수용: ${item.capacity}`}
                          {'length' in item && `길이: ${item.length}`}
                          {'diameter' in item && `직경: ${item.diameter}`}
                          {'height' in item && `높이: ${item.height}`}
                          {'type' in item && `타입: ${item.type}`}
                          {'resolution' in item && `해상도: ${item.resolution}`}
                        </div>
                      </div>
                    ));
                    })()}
                  </div>
                </>
              ) : (
                /* Template Tab Content */
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">완성된 무대 템플릿</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {stageTemplates.filter((template) => {
                      if (!modelSearchQuery) return true;
                      const searchLower = modelSearchQuery.toLowerCase();
                      return template.name.toLowerCase().includes(searchLower) ||
                             template.description.toLowerCase().includes(searchLower) ||
                             template.usage.toLowerCase().includes(searchLower) ||
                             template.type.toLowerCase().includes(searchLower);
                    }).length === 0 && modelSearchQuery ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">'{modelSearchQuery}'에 대한 템플릿 검색 결과가 없습니다.</p>
                        <p className="text-gray-400 text-xs mt-1">다른 검색어를 시도해보세요.</p>
                      </div>
                    ) : (
                      stageTemplates.filter((template) => {
                        if (!modelSearchQuery) return true;
                        const searchLower = modelSearchQuery.toLowerCase();
                        return template.name.toLowerCase().includes(searchLower) ||
                               template.description.toLowerCase().includes(searchLower) ||
                               template.usage.toLowerCase().includes(searchLower) ||
                               template.type.toLowerCase().includes(searchLower);
                      }).map((template) => (
                      <div
                        key={template.id}
                        className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                        onClick={() => addStageTemplateToScene(template)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-16 h-12 flex-shrink-0 rounded overflow-hidden">
                            {/* 무대 템플릿 썸네일 */}
                            {template.type === 'proscenium' && (
                              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center relative">
                                <div className="w-12 h-8 bg-amber-400 rounded-sm"></div>
                                <div className="absolute bottom-1 left-2 w-8 h-1 bg-amber-500"></div>
                              </div>
                            )}
                            {template.type === 'arena' && (
                              <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative">
                                <div className="w-6 h-6 bg-green-400 rounded-full"></div>
                                <div className="absolute inset-1 border-2 border-green-500 rounded-full"></div>
                              </div>
                            )}
                            {template.type === 'runway' && (
                              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center relative">
                                <div className="w-2 h-8 bg-purple-400 rounded-sm"></div>
                                <div className="w-8 h-3 bg-purple-400 rounded-sm absolute"></div>
                              </div>
                            )}
                            {template.type === 'wide' && (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
                                <div className="w-14 h-4 bg-blue-400 rounded-sm"></div>
                                <div className="absolute bottom-1 left-1 w-12 h-1 bg-blue-500"></div>
                              </div>
                            )}
                            {template.type === 'stadium' && (
                              <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center relative">
                                <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-red-300 rounded-full"></div>
                              </div>
                            )}
                            {template.type === 'thrust' && (
                              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative">
                                <div className="w-8 h-6 bg-orange-400 rounded-sm"></div>
                                <div className="w-3 h-8 bg-orange-400 rounded-sm absolute"></div>
                              </div>
                            )}
                            {template.type === 'modular' && (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                                <div className="grid grid-cols-2 gap-1">
                                  <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                                  <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                                  <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                                  <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                                </div>
                              </div>
                            )}
                            {template.type === 'hybrid' && (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center relative">
                                <div className="w-6 h-4 bg-indigo-400 rounded-sm"></div>
                                <div className="w-3 h-6 bg-indigo-400 rounded-full absolute"></div>
                              </div>
                            )}
                            {template.type === 'immersive' && (
                              <div className="w-full h-full bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center relative">
                                <div className="w-8 h-2 bg-cyan-400 rounded-full"></div>
                                <div className="w-6 h-6 bg-cyan-300 rounded-full absolute opacity-50"></div>
                                <div className="w-4 h-4 bg-cyan-500 rounded-full absolute"></div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800 mb-1">{template.name}</div>
                            <div className="text-xs text-gray-600 mb-1">{template.description}</div>
                            <div className="text-xs text-blue-600">{template.usage}</div>
                          </div>
                        </div>
                      </div>
                    )))}
                  </div>
                </div>
              )}


            </div>
          </div>
        )}

        {/* Background Panel */}
        {showBackgroundPanel && (
          <div 
            className={`fixed top-4 ${isSidebarOpen ? 'left-[364px]' : 'left-[140px]'} w-80 bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col`}
            style={{ zIndex: 99999 }}
          >
            {/* 패널 헤더 - 상단 라운드 */}
            <div className="p-4 border-b border-gray-100 rounded-t-2xl bg-white flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">배경 설정</h3>
            </div>

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto p-4 rounded-b-2xl"
                 style={{ maxHeight: 'calc(100vh - 120px)' }}>
              
              {/* 배경 모드 탭 */}
              <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setBackgroundMode('preset')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    backgroundMode === 'preset'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  기본 배경
                </button>
                <button
                  onClick={() => setBackgroundMode('solid')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    backgroundMode === 'solid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  단색 배경
                </button>
                <button
                  onClick={() => setBackgroundMode('gradient')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    backgroundMode === 'gradient'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  그라데이션
                </button>
              </div>

              {/* 기본 배경 */}
              {backgroundMode === 'preset' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">배경 테마 선택</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* 실내 스튜디오 */}
                    <button
                      onClick={() => changeBackground('white')}
                      className="group p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="w-full h-8 bg-white border border-gray-200 rounded mb-2"></div>
                      <div className="text-xs font-medium text-gray-800">실내 스튜디오</div>
                      <div className="text-xs text-gray-500">화이트 톤</div>
                    </button>

                    {/* 야외 하늘 */}
                    <button
                      onClick={() => changeBackground('skyblue')}
                      className="group p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="w-full h-8 bg-gradient-to-b from-blue-400 to-blue-300 rounded mb-2"></div>
                      <div className="text-xs font-medium text-gray-800">야외 하늘</div>
                      <div className="text-xs text-gray-500">하늘 블루</div>
                    </button>

                    {/* 프로페셔널 */}
                    <button
                      onClick={() => changeBackground('gray')}
                      className="group p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="w-full h-8 bg-gradient-to-b from-gray-400 to-gray-500 rounded mb-2"></div>
                      <div className="text-xs font-medium text-gray-800">프로페셔널</div>
                      <div className="text-xs text-gray-500">중성 그레이</div>
                    </button>

                    {/* 자연 그라데이션 */}
                    <button
                      onClick={() => changeBackground('gradient')}
                      className="group p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div 
                        className="w-full h-8 rounded mb-2"
                        style={{
                          background: 'linear-gradient(to bottom, #87CEEB, #ffffff)'
                        }}
                      ></div>
                      <div className="text-xs font-medium text-gray-800">자연 그라데이션</div>
                      <div className="text-xs text-gray-500">하늘→지평선</div>
                    </button>

                    {/* 다크 모드 */}
                    <button
                      onClick={() => changeBackground('dark')}
                      className="group p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="w-full h-8 bg-gradient-to-b from-gray-700 to-gray-900 rounded mb-2"></div>
                      <div className="text-xs font-medium text-gray-800">다크 모드</div>
                      <div className="text-xs text-gray-500">어두운 톤</div>
                    </button>

                    {/* 투명 */}
                    <button
                      onClick={() => changeBackground('transparent')}
                      className="group p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div 
                        className="w-full h-8 rounded mb-2 border border-gray-200"
                        style={{
                          backgroundImage: 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
                          backgroundSize: '6px 6px',
                          backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
                        }}
                      ></div>
                      <div className="text-xs font-medium text-gray-800">투명</div>
                      <div className="text-xs text-gray-500">배경 제거</div>
                    </button>
                  </div>
                </div>
              )}

              {/* 단색 배경 선택 */}
              {backgroundMode === 'solid' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    🎨 단색 배경 설정
                  </h4>
                  
                  {/* 현재 선택된 색상 미리보기 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">현재 선택된 색상</label>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-16 h-16 rounded-xl border-2 border-gray-300 shadow-inner"
                        style={{ backgroundColor: solidColor }}
                      ></div>
                      <div className="flex-1">
                        <input
                          type="color"
                          value={solidColor}
                          onChange={(e) => setSolidColor(e.target.value)}
                          className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition-colors"
                        />
                        <div className="text-xs text-gray-500 mt-1 font-mono">{solidColor.toUpperCase()}</div>
                      </div>
                    </div>
                  </div>

                  {/* 색상 팔레트 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">인기 색상 팔레트</label>
                    <div className="grid grid-cols-9 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      {[
                        // 흰색/회색 계열
                        '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D', '#495057', '#343A40',
                        // 파란색 계열
                        '#E7F3FF', '#CCE7FF', '#99D6FF', '#66C2FF', '#33A1FF', '#0080FF', '#0066CC', '#004C99', '#003366',
                        // 초록색 계열
                        '#E8F8F5', '#D1F2EB', '#A3E4D7', '#76D7C4', '#48C9B0', '#1ABC9C', '#17A085', '#138D75', '#0E6B5D',
                        // 빨간색 계열
                        '#FDEDEC', '#FADBD8', '#F5B7B1', '#F1948A', '#EC7063', '#E74C3C', '#CB4335', '#B03A2E', '#922B21',
                        // 노란색 계열
                        '#FEF9E7', '#FCF3CF', '#F9E79F', '#F7DC6F', '#F4D03F', '#F1C40F', '#D4AC0D', '#B7950B', '#9A7D0A',
                        // 보라색 계열
                        '#F4ECF7', '#E8DAEF', '#D2B4DE', '#BB8FCE', '#A569BD', '#8E44AD', '#7D3C98', '#6C3483', '#5B2C6F',
                        // 주황색 계열
                        '#FEF2E7', '#FDEBD0', '#FAD7A0', '#F8C471', '#F5B041', '#F39C12', '#E67E22', '#D35400', '#A04000'
                      ].map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setSolidColor(color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-md ${
                            solidColor === color 
                              ? 'border-blue-500 ring-2 ring-blue-200 scale-110 shadow-lg' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={applyCustomBackground}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    ✨ 색상 적용하기
                  </button>
                </div>
              )}

              {/* 그라데이션 배경 설정 */}
              {backgroundMode === 'gradient' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">그라데이션 배경 설정</h4>
                  
                  {/* 미리보기 */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-2">미리보기</label>
                    <div 
                      className="w-full h-16 rounded-lg border border-gray-200"
                      style={{
                        background: gradientDirection === 'linear' 
                          ? `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`
                          : `radial-gradient(circle, ${gradientStart}, ${gradientEnd})`
                      }}
                    ></div>
                  </div>

                  {/* 그라데이션 타입 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">그라데이션 타입</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setGradientDirection('linear')}
                        className={`p-2 rounded-md text-xs font-medium transition-colors ${
                          gradientDirection === 'linear'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        선형 그라데이션
                      </button>
                      <button
                        onClick={() => setGradientDirection('radial')}
                        className={`p-2 rounded-md text-xs font-medium transition-colors ${
                          gradientDirection === 'radial'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        원형 그라데이션
                      </button>
                    </div>
                  </div>

                  {/* 시작 색상 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">시작 색상</label>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: gradientStart }}
                      ></div>
                      <div className="flex-1">
                        <input
                          type="color"
                          value={gradientStart}
                          onChange={(e) => setGradientStart(e.target.value)}
                          className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                        />
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{gradientStart.toUpperCase()}</div>
                    </div>
                  </div>

                  {/* 끝 색상 */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">끝 색상</label>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: gradientEnd }}
                      ></div>
                      <div className="flex-1">
                        <input
                          type="color"
                          value={gradientEnd}
                          onChange={(e) => setGradientEnd(e.target.value)}
                          className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                        />
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{gradientEnd.toUpperCase()}</div>
                    </div>
                  </div>

                  {/* 각도 조절 (선형 그라데이션만) */}
                  {gradientDirection === 'linear' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        방향: {gradientAngle}°
                      </label>
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={gradientAngle}
                          onChange={(e) => setGradientAngle(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="grid grid-cols-4 gap-1">
                          <button 
                            onClick={() => setGradientAngle(0)}
                            className="p-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                          >
                            ↑
                          </button>
                          <button 
                            onClick={() => setGradientAngle(90)}
                            className="p-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                          >
                            →
                          </button>
                          <button 
                            onClick={() => setGradientAngle(180)}
                            className="p-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                          >
                            ↓
                          </button>
                          <button 
                            onClick={() => setGradientAngle(270)}
                            className="p-2 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                          >
                            ←
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={applyCustomBackground}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    그라데이션 적용
                  </button>
                </div>
              )}

              {/* 추가 옵션 */}
              {backgroundMode === 'preset' && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">배경 옵션</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-600">그림자 표시</label>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-600">반사 효과</label>
                    <input type="checkbox" className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-600">안개 효과</label>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
                </div>
              )}

              {/* 닫기 버튼 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowBackgroundPanel(false)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  ✅ 완료하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 견적 패널 */}
        {showQuotePanel && (
          <div 
            className={`fixed top-4 ${isSidebarOpen ? 'left-[364px]' : 'left-[140px]'} w-80 bg-white rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col`}
            style={{ zIndex: 99999 }}
          >
            {/* 패널 헤더 */}
            <div className="p-4 border-b border-gray-100 rounded-t-2xl bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">견적 정보</h3>
                </div>
                <button
                  onClick={() => setShowQuotePanel(false)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto rounded-b-2xl">
              <div className="p-4 pb-6 space-y-6">
                
                {/* 현재 추가된 요소들 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">📋 추가된 요소들</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(() => {
                      const items = getSceneQuotationItems();
                      if (items.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">📭</div>
                            <p className="text-sm">아직 추가된 요소가 없습니다</p>
                          </div>
                        );
                      }
                      return items.map((item, index) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-800">{item.description}</p>
                            <p className="text-xs text-gray-500">수량: {item.quantity}개</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              ₩{item.unitPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* 견적 요약 */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">💰 견적 요약</h4>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                    {(() => {
                      const items = getSceneQuotationItems();
                      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">총 항목 수:</span>
                            <span className="text-sm font-medium text-gray-800">{items.length}개</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">부가세 (10%):</span>
                            <span className="text-sm font-medium text-gray-800">₩{(totalAmount * 0.1).toLocaleString()}</span>
                          </div>
                          <hr className="border-orange-200" />
                          <div className="flex justify-between items-center">
                            <span className="text-base font-semibold text-gray-800">총 견적 금액:</span>
                            <span className="text-lg font-bold text-orange-600">₩{(totalAmount * 1.1).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 견적서 템플릿 버튼 */}
                <div className="space-y-3">
                  <button
                    onClick={openQuotationTemplateModal}
                    disabled={getSceneQuotationItems().length === 0}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                      getSceneQuotationItems().length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                    }`}
                  >
                    📄 견적서 템플릿 선택
                  </button>
                  
                  <div className="text-xs text-gray-500 text-center">
                    * 새 탭에서 열립니다
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 우측 플로팅 툴바 - 4개 핵심 기능만 */}
        <div className={`fixed top-4 right-4 flex flex-col space-y-2 z-50 transition-all duration-300`}>
          <button 
            onClick={undoAction}
            disabled={historyIndex <= 0}
            className={`w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer ${
              historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
            title="실행 취소 (Ctrl+Z)"
            style={{ pointerEvents: 'auto' }}
          >
            <Undo className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={redoAction}
            disabled={historyIndex >= sceneHistory.length - 1}
            className={`w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer ${
              historyIndex >= sceneHistory.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
            title="다시 실행 (Ctrl+Y)"
            style={{ pointerEvents: 'auto' }}
          >
            <Redo className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={resetScene}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-200 hover:bg-red-50 cursor-pointer"
            title="생성된 3D 요소 모두 삭제"
            style={{ pointerEvents: 'auto' }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
          <button 
            onClick={takeScreenshot}
            className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-200 hover:bg-gray-50 cursor-pointer"
            title="이미지 저장"
            style={{ pointerEvents: 'auto' }}
          >
            <Camera className="w-4 h-4 text-gray-600" />
          </button>
        </div>


      </div>

      {/* 하단 컨트롤 바 - 컴팩트 */}
      <div className={`fixed bottom-4 ${isSidebarOpen ? 'left-1/2' : 'left-1/2'} transform -translate-x-1/2 z-30`}>
        <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-lg">
          {/* 그리드만 토글 */}
          <button 
            onClick={toggleGridOnly}
            className={`p-1.5 rounded-lg transition-colors ${
              sceneRef.current?.getObjectByName('grid')?.visible ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="그리드 토글"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* 바닥 전체 토글 */}
          <button 
            onClick={toggleFloor}
            className={`p-1.5 rounded-lg transition-colors ${
              sceneRef.current?.getObjectByName('floor')?.visible ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="바닥 전체 토글"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* 구분선 */}
          <div className="w-px h-5 bg-gray-300"></div>

          {/* 줌 슬라이더 */}
          <div className="relative w-20 h-1.5 bg-gray-300 rounded-full">
            <div 
              className="absolute h-full bg-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${zoomLevel}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="100"
              value={zoomLevel}
              onChange={(e) => updateZoomLevel(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* 구분선 */}
          <div className="w-px h-5 bg-gray-300"></div>

          {/* AI이미지 생성 버튼 */}
          <button
            onClick={() => {
              setActiveTab('edit');
              setShowUploadPanel(true);
              setShowModelsPanel(false);
              setShowBackgroundPanel(false);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-xs font-medium"
            title="AI로 이미지 분석하여 3D 요소 생성"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI이미지 생성</span>
          </button>
        </div>
      </div>

      {/* 3D 요소 생성 모달 */}
      {showElementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start pl-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full ml-2 max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">3D 요소 추가</h2>
                <button
                  onClick={() => setShowElementModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* 스테이지 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full h-32 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-16 h-8 bg-blue-500 rounded"></div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">스테이지</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">무대 설치</p>
                </div>

                {/* 조명 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full h-32 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">조명</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">무대 조명</p>
                </div>

                {/* 스피커 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full h-32 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-10 h-12 bg-green-500 rounded"></div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">스피커</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">음향 시스템</p>
                </div>

                {/* LED 스크린 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full h-32 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-16 h-10 bg-purple-500 rounded"></div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">LED 스크린</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">디스플레이</p>
                </div>

                {/* 의자 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full h-32 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-red-500 rounded"></div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">의자</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">관객석</p>
                </div>

                {/* 트러스 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-16 h-2 bg-gray-500 rounded"></div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">트러스</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">구조물</p>
                </div>

                {/* 장식 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full h-32 bg-pink-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-6 h-10 bg-pink-500 rounded-full"></div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">장식</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">데코레이션</p>
                </div>

                {/* 특수 효과 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full h-32 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">특수 효과</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">연출 효과</p>
                </div>

                {/* 카메라 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full h-32 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-10 h-6 bg-indigo-500 rounded"></div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center">카메라</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">촬영 장비</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowElementModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => setShowElementModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 견적서 템플릿 선택 모달 */}
      {showQuotationTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">견적서 템플릿 선택</h2>
                <button
                  onClick={() => setShowQuotationTemplateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
                {/* 템플릿 1 - 파란색 */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => generateQuotationWithTemplate('template-1')}
                >
                  <div className="w-full h-48 bg-blue-50 rounded-lg border-2 border-blue-200 flex flex-col p-3 mb-3">
                    <div className="bg-blue-600 text-white text-xs p-2 rounded mb-2">견적서</div>
                    <div className="bg-blue-100 h-4 rounded mb-1"></div>
                    <div className="bg-blue-100 h-3 rounded mb-2 w-3/4"></div>
                    <div className="flex-1 bg-white rounded p-2">
                      <div className="bg-gray-200 h-2 rounded mb-1"></div>
                      <div className="bg-gray-200 h-2 rounded mb-1 w-2/3"></div>
                      <div className="bg-gray-200 h-2 rounded w-1/2"></div>
                    </div>
                    <div className="bg-blue-500 text-white text-xs p-1 rounded text-center mt-1">시스룩 (Syslook)</div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center group-hover:text-blue-600">클래식 블루</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">전문적이고 신뢰감 있는 디자인</p>
                </div>

                {/* 템플릿 2 - 녹색 */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => generateQuotationWithTemplate('template-2')}
                >
                  <div className="w-full h-48 bg-green-50 rounded-lg border-2 border-green-200 flex flex-col p-3 mb-3">
                    <div className="bg-green-600 text-white text-xs p-2 rounded mb-2">견적서</div>
                    <div className="bg-green-100 h-4 rounded mb-1"></div>
                    <div className="bg-green-100 h-3 rounded mb-2 w-3/4"></div>
                    <div className="flex-1 bg-white rounded p-2">
                      <div className="bg-gray-200 h-2 rounded mb-1"></div>
                      <div className="bg-gray-200 h-2 rounded mb-1 w-2/3"></div>
                      <div className="bg-gray-200 h-2 rounded w-1/2"></div>
                    </div>
                    <div className="bg-green-500 text-white text-xs p-1 rounded text-center mt-1">시스룩 (Syslook)</div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center group-hover:text-green-600">모던 그린</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">친환경적이고 성장감 있는 디자인</p>
                </div>

                {/* 템플릿 3 - 보라색 */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => generateQuotationWithTemplate('template-3')}
                >
                  <div className="w-full h-48 bg-purple-50 rounded-lg border-2 border-purple-200 flex flex-col p-3 mb-3">
                    <div className="bg-purple-600 text-white text-xs p-2 rounded mb-2">견적서</div>
                    <div className="bg-purple-100 h-4 rounded mb-1"></div>
                    <div className="bg-purple-100 h-3 rounded mb-2 w-3/4"></div>
                    <div className="flex-1 bg-white rounded p-2">
                      <div className="bg-gray-200 h-2 rounded mb-1"></div>
                      <div className="bg-gray-200 h-2 rounded mb-1 w-2/3"></div>
                      <div className="bg-gray-200 h-2 rounded w-1/2"></div>
                    </div>
                    <div className="bg-purple-500 text-white text-xs p-1 rounded text-center mt-1">시스룩 (Syslook)</div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center group-hover:text-purple-600">프리미엄 퍼플</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">고급스럽고 창의적인 디자인</p>
                </div>

                {/* 템플릿 4 - 다크 */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => generateQuotationWithTemplate('template-4')}
                >
                  <div className="w-full h-48 bg-gray-50 rounded-lg border-2 border-gray-300 flex flex-col p-3 mb-3">
                    <div className="bg-gray-800 text-white text-xs p-2 rounded mb-2">견적서</div>
                    <div className="bg-gray-200 h-4 rounded mb-1"></div>
                    <div className="bg-gray-200 h-3 rounded mb-2 w-3/4"></div>
                    <div className="flex-1 bg-white rounded p-2 border">
                      <div className="bg-gray-300 h-2 rounded mb-1"></div>
                      <div className="bg-gray-300 h-2 rounded mb-1 w-2/3"></div>
                      <div className="bg-gray-300 h-2 rounded w-1/2"></div>
                    </div>
                    <div className="bg-gray-700 text-white text-xs p-1 rounded text-center mt-1">시스룩 (Syslook)</div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center group-hover:text-gray-700">엘레간트 다크</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">세련되고 미니멀한 디자인</p>
                </div>

                {/* 템플릿 5 - 주황색 */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => generateQuotationWithTemplate('template-5')}
                >
                  <div className="w-full h-48 bg-orange-50 rounded-lg border-2 border-orange-200 flex flex-col p-3 mb-3">
                    <div className="bg-orange-600 text-white text-xs p-2 rounded mb-2">견적서</div>
                    <div className="bg-orange-100 h-4 rounded mb-1"></div>
                    <div className="bg-orange-100 h-3 rounded mb-2 w-3/4"></div>
                    <div className="flex-1 bg-white rounded p-2">
                      <div className="bg-gray-200 h-2 rounded mb-1"></div>
                      <div className="bg-gray-200 h-2 rounded mb-1 w-2/3"></div>
                      <div className="bg-gray-200 h-2 rounded w-1/2"></div>
                    </div>
                    <div className="bg-orange-500 text-white text-xs p-1 rounded text-center mt-1">시스룩 (Syslook)</div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center group-hover:text-orange-600">에너지 오렌지</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">활동적이고 역동적인 디자인</p>
                </div>

                {/* 템플릿 6 - 청록색 */}
                <div 
                  className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => generateQuotationWithTemplate('template-6')}
                >
                  <div className="w-full h-48 bg-teal-50 rounded-lg border-2 border-teal-200 flex flex-col p-3 mb-3">
                    <div className="bg-teal-600 text-white text-xs p-2 rounded mb-2">견적서</div>
                    <div className="bg-teal-100 h-4 rounded mb-1"></div>
                    <div className="bg-teal-100 h-3 rounded mb-2 w-3/4"></div>
                    <div className="flex-1 bg-white rounded p-2">
                      <div className="bg-gray-200 h-2 rounded mb-1"></div>
                      <div className="bg-gray-200 h-2 rounded mb-1 w-2/3"></div>
                      <div className="bg-gray-200 h-2 rounded w-1/2"></div>
                    </div>
                    <div className="bg-teal-500 text-white text-xs p-1 rounded text-center mt-1">시스룩 (Syslook)</div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-center group-hover:text-teal-600">프레시 틸</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">신선하고 혁신적인 디자인</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  원하는 템플릿을 클릭하면 견적서가 새 탭에서 열립니다
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 기존 모달들 - 좌측 정렬 */}
      {isQuotationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start pl-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full ml-2 max-h-[90vh] overflow-hidden">
            <QuotationTemplateModal
              isOpen={isQuotationModalOpen}
              onClose={() => setIsQuotationModalOpen(false)}
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
          </div>
        </div>
      )}
      
      {showStageTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start pl-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full ml-2 max-h-[90vh] overflow-hidden">
            <StageTypeSelectModal
              open={showStageTypeModal}
              onClose={() => setShowStageTypeModal(false)}
              onSelect={() => {}}
            />
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">3D 뷰어를 로딩 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDConfiguratorEnhanced; 
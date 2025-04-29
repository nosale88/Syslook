import { Equipment, BudgetAllocation, EventTemplate } from '../types';

export const eventTypes = [
  '기업 세미나',
  '결혼식',
  '콘서트',
  '컨퍼런스',
  '전시회',
  '댄스 행사',
  '직접 입력'
];

export const equipmentCategories = [
  '음향/영상',
  '조명',
  '무대/구조물',
  '전력/케이블',
  '위생/편의',
  '안전/보안',
  '통신',
  '식음료',
  '교통/주차',
  '참가자편의',
  '행사운영',
  '기타장비'
];

export const eventTemplates: Record<string, EventTemplate> = {
  '기업 세미나': {
    defaultBudget: 5000000,
    minAttendees: 50,
    maxAttendees: 200,
    budgetAllocations: [
      { category: '음향/영상', percentage: 30, amount: 0 },
      { category: '조명', percentage: 15, amount: 0 },
      { category: '무대/구조물', percentage: 20, amount: 0 },
      { category: '전력/케이블', percentage: 10, amount: 0 },
      { category: '위생/편의', percentage: 5, amount: 0 },
      { category: '안전/보안', percentage: 5, amount: 0 },
      { category: '통신', percentage: 5, amount: 0 },
      { category: '기타장비', percentage: 10, amount: 0 }
    ],
    recommendedEquipment: ['전문 음향 시스템', '프로젝터 세트', '무선 마이크 시스템']
  },
  '결혼식': {
    defaultBudget: 8000000,
    minAttendees: 100,
    maxAttendees: 300,
    budgetAllocations: [
      { category: '음향/영상', percentage: 20, amount: 0 },
      { category: '조명', percentage: 25, amount: 0 },
      { category: '무대/구조물', percentage: 15, amount: 0 },
      { category: '식음료', percentage: 20, amount: 0 },
      { category: '참가자편의', percentage: 10, amount: 0 },
      { category: '기타장비', percentage: 10, amount: 0 }
    ],
    recommendedEquipment: ['웨딩 조명 세트', '포토존 장비', '음향 시스템']
  },
  '콘서트': {
    defaultBudget: 15000000,
    minAttendees: 200,
    maxAttendees: 1000,
    budgetAllocations: [
      { category: '음향/영상', percentage: 35, amount: 0 },
      { category: '조명', percentage: 25, amount: 0 },
      { category: '무대/구조물', percentage: 20, amount: 0 },
      { category: '전력/케이블', percentage: 10, amount: 0 },
      { category: '안전/보안', percentage: 5, amount: 0 },
      { category: '기타장비', percentage: 5, amount: 0 }
    ],
    recommendedEquipment: ['프리미엄 음향 시스템', '무대 조명 세트', '특수 효과 장비']
  },
  '컨퍼런스': {
    defaultBudget: 10000000,
    minAttendees: 150,
    maxAttendees: 500,
    budgetAllocations: [
      { category: '음향/영상', percentage: 30, amount: 0 },
      { category: '조명', percentage: 15, amount: 0 },
      { category: '무대/구조물', percentage: 20, amount: 0 },
      { category: '통신', percentage: 15, amount: 0 },
      { category: '참가자편의', percentage: 10, amount: 0 },
      { category: '기타장비', percentage: 10, amount: 0 }
    ],
    recommendedEquipment: ['대형 스크린', '화상회의 장비', '동시통역 시스템']
  },
  '전시회': {
    defaultBudget: 12000000,
    minAttendees: 100,
    maxAttendees: 800,
    budgetAllocations: [
      { category: '음향/영상', percentage: 15, amount: 0 },
      { category: '조명', percentage: 30, amount: 0 },
      { category: '무대/구조물', percentage: 25, amount: 0 },
      { category: '전력/케이블', percentage: 10, amount: 0 },
      { category: '참가자편의', percentage: 10, amount: 0 },
      { category: '기타장비', percentage: 10, amount: 0 }
    ],
    recommendedEquipment: ['전시 부스 시스템', '스포트라이트 세트', '디지털 사이니지']
  },
  '댄스 행사': {
    defaultBudget: 7000000,
    minAttendees: 50,
    maxAttendees: 300,
    budgetAllocations: [
      { category: '음향/영상', percentage: 35, amount: 0 },
      { category: '조명', percentage: 30, amount: 0 },
      { category: '무대/구조물', percentage: 20, amount: 0 },
      { category: '전력/케이블', percentage: 5, amount: 0 },
      { category: '위생/편의', percentage: 5, amount: 0 },
      { category: '기타장비', percentage: 5, amount: 0 }
    ],
    recommendedEquipment: ['프리미엄 스피커 시스템', '댄스플로어 조명', '이동식 댄스 플로어']
  }
};

export const defaultBudgetAllocations: BudgetAllocation[] = [
  { category: '음향/영상', percentage: 25, amount: 0 },
  { category: '조명', percentage: 20, amount: 0 },
  { category: '무대/구조물', percentage: 20, amount: 0 },
  { category: '전력/케이블', percentage: 10, amount: 0 },
  { category: '위생/편의', percentage: 5, amount: 0 },
  { category: '안전/보안', percentage: 5, amount: 0 },
  { category: '통신', percentage: 5, amount: 0 },
  { category: '기타장비', percentage: 10, amount: 0 }
];

export const sampleEquipment: Equipment[] = [
  {
    id: '1',
    name: '전문 음향 시스템',
    category: '음향/영상',
    price: 1500000,
    description: '최대 200명까지 수용 가능한 고품질 스피커 및 앰프 시스템',
    image: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&q=80&w=1000',
    specs: {
      '출력': '2000W',
      '주파수 응답': '20Hz-20kHz',
      '스피커 수': '4개',
      '블루투스': '지원',
      'USB 입력': '지원'
    },
    alternatives: [
      'JBL PRO 시리즈',
      'BOSE 이벤트 시스템',
      'YAMAHA 프로페셔널'
    ]
  },
  {
    id: '2',
    name: '무대 플랫폼',
    category: '무대/구조물',
    price: 2000000,
    description: '6x4m 크기의 계단이 포함된 높은 무대',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000',
    specs: {
      '크기': '6m x 4m',
      '높이': '60cm',
      '하중': '최대 1000kg',
      '재질': '알루미늄 합금',
      '부속품': '계단, 안전 난간'
    },
    alternatives: [
      '접이식 모듈형 무대',
      '이동식 컴팩트 무대',
      '대형 메인 스테이지'
    ]
  },
  {
    id: '3',
    name: 'LED 파 조명',
    category: '조명',
    price: 800000,
    description: '8개 세트 LED 파 조명과 컨트롤러',
    image: 'https://images.unsplash.com/photo-1504501650895-2441b7915699?auto=format&fit=crop&q=80&w=1000',
    specs: {
      'LED 개수': '54개/유닛',
      '밝기': '2000 루멘',
      'DMX 채널': '8/16채널',
      '색상': 'RGBW',
      '제어': 'DMX512'
    },
    alternatives: [
      'RGB 레이저 조명',
      'LED 빔 무빙헤드',
      'LED 매트릭스 패널'
    ]
  },
  {
    id: '4',
    name: '발전기 세트',
    category: '전력/케이블',
    price: 3000000,
    description: '대형 행사용 이동식 발전기 시스템',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e694?auto=format&fit=crop&q=80&w=1000',
    specs: {
      '출력': '100kVA',
      '연료': '디젤',
      '연속 가동': '최대 48시간',
      '소음레벨': '65dB 이하',
      '비상 백업': '지원'
    },
    alternatives: [
      '소형 발전기',
      '태양광 발전 시스템',
      '하이브리드 발전기'
    ]
  },
  {
    id: '5',
    name: '통신 관제 시스템',
    category: '통신',
    price: 1200000,
    description: '행사장 전체 통신 관리 시스템',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1000',
    specs: {
      '채널 수': '32채널',
      '통신 범위': '2km',
      '배터리': '12시간',
      '암호화': 'AES-256',
      '동시 접속': '최대 100대'
    },
    alternatives: [
      '디지털 무전기 세트',
      '통신 중계기',
      '위성 통신 장비'
    ]
  }
];

export const equipmentDetails = {
  '음향/영상': [
    'PA 시스템 (스피커, 앰프, 믹서)',
    '마이크 (유선, 무선, 핀 마이크)',
    '모니터 스피커',
    'LED 스크린/프로젝터',
    '영상 믹서/스위처',
    '카메라 장비',
    '디지털 믹싱 콘솔',
    '음향 처리 장비',
    '인이어 모니터링 시스템',
    '마이크 스탠드',
    '멀티트랙 레코더',
    '영상 송출 시스템',
    '동시통역 시스템',
    '음향/영상 통신 시스템'
  ],
  '조명': [
    '무대 조명',
    '이벤트 조명',
    '배경 조명',
    '조명 콘솔/컨트롤러',
    'LED 월',
    '레이저 조명',
    '특수 효과 조명',
    '포그/스모크 머신',
    '조명용 트러스',
    'DMX 컨트롤러',
    '응급 조명',
    '건축물 조명',
    '장식용 조명',
    'UV/블랙라이트'
  ],
  '무대/구조물': [
    '무대 플랫폼',
    '텐트/천막',
    '가설 울타리',
    '행사용 가구',
    '현수막 구조물',
    '모듈형 무대',
    '관람석',
    '트러스 구조물',
    '무대 스커트',
    '장식용 구조물',
    '간이 창고',
    '무대 덮개',
    '이동식 플로어링',
    '모듈형 부스'
  ],
  '전력/케이블': [
    '발전기',
    '전력 분배함',
    '전원 케이블',
    '신호 케이블',
    '비상용 발전기',
    'UPS',
    '전력 모니터링 장비',
    '방수용 전기 커버',
    '전원 분배함',
    '배터리 팩',
    '케이블 프로텍터',
    '전압 조정기',
    'DMX 케이블',
    '광섬유 케이블'
  ],
  '위생/편의': [
    '이동식 화장실',
    '손 세정대',
    '쓰레기통',
    'VIP 화장실',
    '샤워 시설',
    '드레싱룸',
    '급수 장치',
    '손 소독제',
    '쓰레기 처리',
    '위생용품',
    '청소 장비',
    '정수 시스템',
    '환기 시스템',
    '위생 검사 장비'
  ],
  '안전/보안': [
    '소화기',
    '응급 처치 키트',
    '안전 표지판',
    '바리케이드',
    'CCTV',
    '응급 의료 부스',
    'AED',
    '구급 침대',
    '안전 통제 시스템',
    '출입 통제',
    '금속 탐지기',
    '보안요원 장비',
    '비상 출구 표시',
    '재난 대응 키트'
  ],
  '통신': [
    '무전기',
    '와이파이 중계기',
    '인터넷 장비',
    '통신 관제 센터',
    '이동통신 중계기',
    '통신 백업 시스템',
    '위성 통신 장비',
    '네트워크 장비',
    '통신 케이블',
    '휴대전화 충전소',
    '인터컴 시스템',
    '방송 통신 장비',
    '안내 방송 시스템',
    '신호 증폭기'
  ],
  '식음료': [
    '이동식 주방',
    '냉장/냉동 시설',
    '음식 보관 시스템',
    '가열/보온 장비',
    '주방 용품',
    '서빙 장비',
    '바/카운터',
    '음료 디스펜서',
    '얼음 제조기',
    '식기 세척기',
    '식품 진열대',
    '케이터링 카트',
    '커피 머신',
    '바비큐 장비'
  ],
  '교통/주차': [
    '주차 안내 시스템',
    '교통 통제 장비',
    '주차장 표시',
    '차량 유도 표지판',
    '셔틀버스 정류장',
    '자전거 보관대',
    '전기차 충전소',
    '교통 통제봉',
    '주차 차단기',
    '임시 도로 표지판',
    '차량 계수 시스템',
    '주차 티켓 발급기',
    'VIP 주차 구역',
    '헬리콥터 착륙장'
  ],
  '참가자편의': [
    '휴식 공간 가구',
    '그늘막/파라솔',
    '미스트 쿨링',
    '온열 장치',
    '물 공급 스테이션',
    '핸드폰 충전소',
    '유아 시설',
    '장애인 시설',
    '임시 보관함',
    '안내 데스크',
    '탈의실',
    'ATM 기기',
    '흡연 구역',
    '정보 스크린'
  ],
  '행사운영': [
    '통제 센터 장비',
    '스태프 식별 장비',
    '타임키핑 장비',
    '행사 진행 컴퓨터',
    '티켓팅 시스템',
    '현금 관리 시스템',
    '행사 기록 장비',
    '기상 대비 장비',
    '이벤트 조정 시스템',
    '예약 관리 시스템',
    '바코드 스캐너',
    '명찰 제작 시스템',
    '행사 기록 드론',
    'VIP 관리 시스템'
  ],
  '기타장비': [
    '냉난방 장치',
    '운송 장비',
    '이동식 발전차',
    '이동식 지붕',
    '방수 덮개',
    '전문 청소 장비',
    '고소작업차',
    '제작/수리 공구',
    '물품 운반 장비',
    '중장비',
    '차량 견인 장비',
    '공기 압축기',
    '방역 장비',
    '제설 장비'
  ]
};
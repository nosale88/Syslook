// 다양한 무대 템플릿 정의 (10종)
export interface StageSetTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  objects: any[];
}

const STAGE_SET_TEMPLATES: StageSetTemplate[] = [
  {
    id: 'basic',
    name: '기본형',
    description: '가장 단순한 사각형 무대',
    objects: [
      { id: 'stage-1', type: 'stage', properties: { width: 6, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 120000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  },
  {
    id: 'wide',
    name: '와이드형',
    description: '넓고 낮은 무대, 대형 이벤트에 적합',
    objects: [
      { id: 'stage-1', type: 'stage', properties: { width: 14, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 250000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'layher-1', type: 'layher', properties: { width: 14, depth: 2, height: 4 }, price: 400000, position: { x: 0, y: 2, z: -3 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  },
  {
    id: 't-shape',
    name: 'T자형',
    description: '런웨이/패션쇼에 적합한 T자형 무대',
    objects: [
      { id: 'stage-main', type: 'stage', properties: { width: 8, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 180000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'stage-runway', type: 'stage', properties: { width: 2, depth: 8, height: 0.6, material: 'plywood_carpet_black' }, price: 120000, position: { x: 0, y: 0, z: 6 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  },
  {
    id: 'circle',
    name: '원형',
    description: '360도 관람형 원형 무대',
    objects: [
      { id: 'stage-1', type: 'stage', properties: { width: 6, depth: 6, height: 0.6, material: 'plywood_carpet_black' }, price: 180000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'layher-1', type: 'layher', properties: { width: 8, depth: 8, height: 4 }, price: 360000, position: { x: 0, y: 2, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  },
  {
    id: 'multi',
    name: '멀티존',
    description: '여러 구역으로 분리된 복합 무대',
    objects: [
      { id: 'stage-main', type: 'stage', properties: { width: 8, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 180000, position: { x: -5, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'stage-sub', type: 'stage', properties: { width: 4, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 90000, position: { x: 7, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'layher-1', type: 'layher', properties: { width: 12, depth: 2, height: 4 }, price: 350000, position: { x: 1, y: 2, z: -3 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  },
  {
    id: 'led-wall',
    name: 'LED 월형',
    description: '대형 LED 스크린이 포함된 무대',
    objects: [
      { id: 'stage-1', type: 'stage', properties: { width: 10, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 200000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'led-1', type: 'led_screen', properties: { width: 8, height: 4, depth: 0.1, resolution: 'high', installationType: 'ground-stacked', content: '#ff0000' }, price: 800000, position: { x: 0, y: 2.5, z: -2.5 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  },
  {
    id: 'festival',
    name: '페스티벌형',
    description: '야외 페스티벌에 적합한 대형 구조',
    objects: [
      { id: 'stage-1', type: 'stage', properties: { width: 16, depth: 8, height: 1, material: 'plywood_carpet_black' }, price: 400000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'layher-1', type: 'layher', properties: { width: 18, depth: 4, height: 7 }, price: 800000, position: { x: 0, y: 3.5, z: -6 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'lighting-1', type: 'lighting', properties: { type: 'spot', color: '#ffffff', intensity: 1 }, price: 50000, position: { x: 0, y: 8, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  },
  {
    id: 'side-stage',
    name: '사이드 스테이지',
    description: '보조 무대가 양쪽에 배치된 형태',
    objects: [
      { id: 'stage-main', type: 'stage', properties: { width: 8, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 180000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'stage-left', type: 'stage', properties: { width: 4, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 90000, position: { x: -7, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'stage-right', type: 'stage', properties: { width: 4, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 90000, position: { x: 7, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  },
  {
    id: 'catwalk',
    name: '캣워크형',
    description: '중앙 런웨이와 양쪽 좌석 구역',
    objects: [
      { id: 'stage-main', type: 'stage', properties: { width: 8, depth: 4, height: 0.6, material: 'plywood_carpet_black' }, price: 180000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'stage-catwalk', type: 'stage', properties: { width: 2, depth: 10, height: 0.6, material: 'plywood_carpet_black' }, price: 150000, position: { x: 0, y: 0, z: 7 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'layher-1', type: 'layher', properties: { width: 10, depth: 2, height: 4 }, price: 350000, position: { x: 0, y: 2, z: -3 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  },
  {
    id: 'theater',
    name: '극장형',
    description: '좌석과 음향장비가 포함된 공연장 스타일',
    objects: [
      { id: 'stage-1', type: 'stage', properties: { width: 10, depth: 6, height: 0.6, material: 'plywood_carpet_black' }, price: 250000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'speaker-main', type: 'speaker', properties: { type: 'main', width: 1, height: 1.5, depth: 0.7, power: 2000 }, price: 300000, position: { x: -5.5, y: 0.75, z: 2 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } },
      { id: 'speaker-sub', type: 'speaker', properties: { type: 'subwoofer', width: 1.2, height: 1.2, depth: 1, power: 3000 }, price: 400000, position: { x: 5.5, y: 0.6, z: 2 }, rotation: { x: 0, y: 0, z: 0, order: 'XYZ' } }
    ]
  }
];

export default STAGE_SET_TEMPLATES;

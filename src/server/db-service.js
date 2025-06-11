// DB 서비스 - Supabase 연동
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: './.env' });

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bpklymkhwnegrqucanyj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwa2x5bWtod25lZ3JxdWNhbnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNTI5OTYsImV4cCI6MjA1OTgyODk5Nn0.1qO5tu7zcD4oIr5zPUQJL-NdAOJjX-W8DbIcZ09MZHo';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 설정이 올바르지 않습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key 가용 여부:', supabaseKey ? '있음' : '없음');

export const supabase = createClient(supabaseUrl, supabaseKey);
// 모의 데이터 (실제 DB 연결이 안될 경우 사용)
const mockSystems = [
  {
    "id": "1",
    "name": "웹 서버 1",
    "description": "프로덕션 웹 서버입니다.",
    "status": "online",
    "ip_address": "192.168.1.10",
    "created_at": "2025-04-14T07:39:12.520Z"
  },
  {
    "id": "2",
    "name": "데이터베이스 서버",
    "description": "메인 PostgreSQL 데이터베이스 서버입니다.",
    "status": "online",
    "ip_address": "192.168.1.20",
    "created_at": "2025-04-14T07:39:12.521Z"
  },
  {
    "id": "3",
    "name": "백업 서버",
    "description": "백업 및 복구 서버입니다.",
    "status": "offline",
    "ip_address": "192.168.1.30",
    "created_at": "2025-04-14T07:39:12.521Z"
  }
];
const mockMetrics = [
  {
    "id": "1-metric-0",
    "system_id": "1",
    "cpu_usage": 62.379662816884675,
    "memory_usage": 56.269683895538456,
    "disk_usage": 48.346095740609286,
    "network_in": 977.8109870846474,
    "network_out": 240.15411591829582,
    "timestamp": "2025-04-14T07:39:12.521Z"
  },
  {
    "id": "1-metric-1",
    "system_id": "1",
    "cpu_usage": 47.56358558812062,
    "memory_usage": 62.34415597864991,
    "disk_usage": 85.65358208125369,
    "network_in": 844.4449440314277,
    "network_out": 405.26168273821406,
    "timestamp": "2025-04-14T06:39:12.521Z"
  },
  {
    "id": "1-metric-2",
    "system_id": "1",
    "cpu_usage": 29.417836147635356,
    "memory_usage": 41.33781516635491,
    "disk_usage": 63.69399435680889,
    "network_in": 752.185945549164,
    "network_out": 134.62343903599373,
    "timestamp": "2025-04-14T05:39:12.521Z"
  },
  {
    "id": "1-metric-3",
    "system_id": "1",
    "cpu_usage": 78.12450104505733,
    "memory_usage": 30.100782612801,
    "disk_usage": 37.02077661671399,
    "network_in": 372.66103023564455,
    "network_out": 368.09377353390914,
    "timestamp": "2025-04-14T04:39:12.521Z"
  },
  {
    "id": "1-metric-4",
    "system_id": "1",
    "cpu_usage": 53.718835527433505,
    "memory_usage": 19.53784105034202,
    "disk_usage": 99.14685815197373,
    "network_in": 961.4465506557002,
    "network_out": 686.5323354453383,
    "timestamp": "2025-04-14T03:39:12.521Z"
  },
  {
    "id": "2-metric-0",
    "system_id": "2",
    "cpu_usage": 64.84323721930146,
    "memory_usage": 70.40338208984662,
    "disk_usage": 84.01674958024171,
    "network_in": 285.8250336819097,
    "network_out": 279.0818034250959,
    "timestamp": "2025-04-14T07:39:12.521Z"
  },
  {
    "id": "2-metric-1",
    "system_id": "2",
    "cpu_usage": 38.51419001632337,
    "memory_usage": 23.215855589640256,
    "disk_usage": 28.097666711286816,
    "network_in": 583.1116617428636,
    "network_out": 454.7953933886519,
    "timestamp": "2025-04-14T06:39:12.521Z"
  },
  {
    "id": "2-metric-2",
    "system_id": "2",
    "cpu_usage": 43.51782269296884,
    "memory_usage": 1.9778146456788104,
    "disk_usage": 46.477235692985715,
    "network_in": 31.357226857402722,
    "network_out": 41.75155809992748,
    "timestamp": "2025-04-14T05:39:12.521Z"
  },
  {
    "id": "2-metric-3",
    "system_id": "2",
    "cpu_usage": 87.92148696429969,
    "memory_usage": 29.96266666162024,
    "disk_usage": 7.807573599893081,
    "network_in": 843.7518511357254,
    "network_out": 491.7190922968957,
    "timestamp": "2025-04-14T04:39:12.521Z"
  },
  {
    "id": "2-metric-4",
    "system_id": "2",
    "cpu_usage": 72.92418625704093,
    "memory_usage": 44.14993181284195,
    "disk_usage": 77.27044887834786,
    "network_in": 381.46589204196266,
    "network_out": 850.8350242487479,
    "timestamp": "2025-04-14T03:39:12.521Z"
  },
  {
    "id": "3-metric-0",
    "system_id": "3",
    "cpu_usage": 30.788325828119902,
    "memory_usage": 39.524733376967006,
    "disk_usage": 9.46610214962471,
    "network_in": 145.0258904170434,
    "network_out": 802.6270793692993,
    "timestamp": "2025-04-14T07:39:12.521Z"
  },
  {
    "id": "3-metric-1",
    "system_id": "3",
    "cpu_usage": 77.75286656487243,
    "memory_usage": 37.29402222924001,
    "disk_usage": 38.18683595005663,
    "network_in": 772.9973771350125,
    "network_out": 169.63464734049595,
    "timestamp": "2025-04-14T06:39:12.521Z"
  },
  {
    "id": "3-metric-2",
    "system_id": "3",
    "cpu_usage": 23.61652641469476,
    "memory_usage": 14.49084514766621,
    "disk_usage": 27.538756982934665,
    "network_in": 349.82707859490625,
    "network_out": 23.852121977448792,
    "timestamp": "2025-04-14T05:39:12.521Z"
  },
  {
    "id": "3-metric-3",
    "system_id": "3",
    "cpu_usage": 95.24981585630941,
    "memory_usage": 33.70329903163376,
    "disk_usage": 21.18702622471167,
    "network_in": 774.8117028401473,
    "network_out": 406.7427629035858,
    "timestamp": "2025-04-14T04:39:12.521Z"
  },
  {
    "id": "3-metric-4",
    "system_id": "3",
    "cpu_usage": 92.16692771453255,
    "memory_usage": 74.7483162459503,
    "disk_usage": 21.81961999487234,
    "network_in": 864.9578494607676,
    "network_out": 270.245991459819,
    "timestamp": "2025-04-14T03:39:12.521Z"
  }
];

// 시스템 정보 조회
export async function getSystems() {
  try {
    // 실제 Supabase 쿼리 시도
    const { data, error } = await supabase
      .from('systems')
      .select('*');
    
    if (error) {
      console.warn('Supabase 쿼리 오류, 모의 데이터 사용:', error);
      return mockSystems;
    }
    
    return data.length > 0 ? data : mockSystems;
  } catch (error) {
    console.error('시스템 정보 조회 중 예외 발생:', error);
    return mockSystems;
  }
}

// 시스템 상세 정보 조회
export async function getSystemById(id) {
  try {
    // 실제 Supabase 쿼리 시도
    const { data, error } = await supabase
      .from('systems')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.warn(`시스템 ID ${id} 조회 오류, 모의 데이터 사용:`, error);
      return mockSystems.find(s => s.id === id) || null;
    }
    
    return data || mockSystems.find(s => s.id === id) || null;
  } catch (error) {
    console.error(`시스템 ID ${id} 조회 중 예외 발생:`, error);
    return mockSystems.find(s => s.id === id) || null;
  }
}

// 시스템 메트릭 조회
export async function getSystemMetrics(systemId) {
  try {
    // 실제 Supabase 쿼리 시도
    const { data, error } = await supabase
      .from('system_metrics')
      .select('*')
      .eq('system_id', systemId)
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (error) {
      console.warn(`시스템 ID ${systemId}의 메트릭 조회 오류, 모의 데이터 사용:`, error);
      return mockMetrics.filter(m => m.system_id === systemId);
    }
    
    return data.length > 0 ? data : mockMetrics.filter(m => m.system_id === systemId);
  } catch (error) {
    console.error(`시스템 ID ${systemId}의 메트릭 조회 중 예외 발생:`, error);
    return mockMetrics.filter(m => m.system_id === systemId);
  }
}

// 키워드로 시스템 검색
export async function searchSystems(keyword) {
  try {
    // 실제 Supabase 쿼리 시도
    const { data, error } = await supabase
      .from('systems')
      .select('*')
      .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    
    if (error) {
      console.warn(`키워드 "${keyword}" 검색 오류, 모의 데이터 사용:`, error);
      return mockSystems.filter(s => 
        s.name.toLowerCase().includes(keyword.toLowerCase()) || 
        (s.description && s.description.toLowerCase().includes(keyword.toLowerCase()))
      );
    }
    
    return data.length > 0 ? data : mockSystems.filter(s => 
      s.name.toLowerCase().includes(keyword.toLowerCase()) || 
      (s.description && s.description.toLowerCase().includes(keyword.toLowerCase()))
    );
  } catch (error) {
    console.error(`키워드 "${keyword}" 검색 중 예외 발생:`, error);
    return mockSystems.filter(s => 
      s.name.toLowerCase().includes(keyword.toLowerCase()) || 
      (s.description && s.description.toLowerCase().includes(keyword.toLowerCase()))
    );
  }
}

// 시스템 상태별 조회
export async function getSystemsByStatus(status) {
  try {
    // 실제 Supabase 쿼리 시도
    const { data, error } = await supabase
      .from('systems')
      .select('*')
      .eq('status', status);
    
    if (error) {
      console.warn(`상태 "${status}" 시스템 조회 오류, 모의 데이터 사용:`, error);
      return mockSystems.filter(s => s.status === status);
    }
    
    return data.length > 0 ? data : mockSystems.filter(s => s.status === status);
  } catch (error) {
    console.error(`상태 "${status}" 시스템 조회 중 예외 발생:`, error);
    return mockSystems.filter(s => s.status === status);
  }
}
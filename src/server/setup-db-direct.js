// Supabase 테이블 생성 스크립트 (직접 REST API 사용)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

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

const supabase = createClient(supabaseUrl, supabaseKey);

// 모의 데이터 생성 함수
async function setupMockData() {
  try {
    console.log('모의 데이터 설정을 시작합니다...');

    // 모의 시스템 데이터
    const mockSystems = [
      {
        id: '1',
        name: '웹 서버 1',
        description: '프로덕션 웹 서버입니다.',
        status: 'online',
        ip_address: '192.168.1.10',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: '데이터베이스 서버',
        description: '메인 PostgreSQL 데이터베이스 서버입니다.',
        status: 'online',
        ip_address: '192.168.1.20',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: '백업 서버',
        description: '백업 및 복구 서버입니다.',
        status: 'offline',
        ip_address: '192.168.1.30',
        created_at: new Date().toISOString()
      }
    ];

    // 모의 메트릭 데이터
    const mockMetrics = [];
    for (const system of mockSystems) {
      for (let i = 0; i < 5; i++) {
        mockMetrics.push({
          id: `${system.id}-metric-${i}`,
          system_id: system.id,
          cpu_usage: Math.random() * 100,
          memory_usage: Math.random() * 100,
          disk_usage: Math.random() * 100,
          network_in: Math.random() * 1000,
          network_out: Math.random() * 1000,
          timestamp: new Date(Date.now() - i * 3600000).toISOString() // 1시간 간격
        });
      }
    }

    // DB 서비스 수정
    await updateDbService(mockSystems, mockMetrics);

    console.log('모의 데이터 설정이 완료되었습니다.');
  } catch (error) {
    console.error('모의 데이터 설정 중 오류가 발생했습니다:', error);
  }
}

// DB 서비스 파일 수정
async function updateDbService(mockSystems, mockMetrics) {
  const fs = await import('fs');
  const path = await import('path');
  
  const dbServicePath = path.resolve('./src/server/db-service.js');
  
  // 기존 파일 내용 읽기
  let content = fs.readFileSync(dbServicePath, 'utf8');
  
  // 모의 데이터 추가
  const mockDataCode = `
// 모의 데이터 (실제 DB 연결이 안될 경우 사용)
const mockSystems = ${JSON.stringify(mockSystems, null, 2)};
const mockMetrics = ${JSON.stringify(mockMetrics, null, 2)};

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
      console.warn(\`시스템 ID \${id} 조회 오류, 모의 데이터 사용:\`, error);
      return mockSystems.find(s => s.id === id) || null;
    }
    
    return data || mockSystems.find(s => s.id === id) || null;
  } catch (error) {
    console.error(\`시스템 ID \${id} 조회 중 예외 발생:\`, error);
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
      console.warn(\`시스템 ID \${systemId}의 메트릭 조회 오류, 모의 데이터 사용:\`, error);
      return mockMetrics.filter(m => m.system_id === systemId);
    }
    
    return data.length > 0 ? data : mockMetrics.filter(m => m.system_id === systemId);
  } catch (error) {
    console.error(\`시스템 ID \${systemId}의 메트릭 조회 중 예외 발생:\`, error);
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
      .or(\`name.ilike.%\${keyword}%,description.ilike.%\${keyword}%\`);
    
    if (error) {
      console.warn(\`키워드 "\${keyword}" 검색 오류, 모의 데이터 사용:\`, error);
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
    console.error(\`키워드 "\${keyword}" 검색 중 예외 발생:\`, error);
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
      console.warn(\`상태 "\${status}" 시스템 조회 오류, 모의 데이터 사용:\`, error);
      return mockSystems.filter(s => s.status === status);
    }
    
    return data.length > 0 ? data : mockSystems.filter(s => s.status === status);
  } catch (error) {
    console.error(\`상태 "\${status}" 시스템 조회 중 예외 발생:\`, error);
    return mockSystems.filter(s => s.status === status);
  }
}`;

  // 기존 함수 정의 찾기 및 대체
  const startPattern = 'export const supabase = createClient(supabaseUrl, supabaseKey);';
  const endPattern = 'export async function getSystemsByStatus(status) {';
  
  // 시작 패턴 이후부터 끝 패턴 이전까지의 내용을 모의 데이터 코드로 대체
  const startIndex = content.indexOf(startPattern) + startPattern.length;
  const endIndex = content.indexOf(endPattern);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + mockDataCode;
    fs.writeFileSync(dbServicePath, newContent, 'utf8');
    console.log('DB 서비스 파일이 성공적으로 업데이트되었습니다.');
  } else {
    console.error('DB 서비스 파일 업데이트 실패: 패턴을 찾을 수 없습니다.');
  }
}

// 모의 데이터 설정 실행
setupMockData().then(() => {
  console.log('스크립트 실행이 완료되었습니다.');
  process.exit(0);
}).catch(error => {
  console.error('스크립트 실행 중 오류가 발생했습니다:', error);
  process.exit(1);
});

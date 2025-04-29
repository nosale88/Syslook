// Supabase 테이블 생성 스크립트
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('데이터베이스 설정을 시작합니다...');

    // systems 테이블 생성
    const { error: systemsError } = await supabase.rpc('create_systems_table');
    
    if (systemsError) {
      console.error('systems 테이블 생성 오류:', systemsError);
      
      // 직접 SQL 실행 시도
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.systems (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'offline',
            ip_address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlError) {
        console.error('SQL 실행 오류:', sqlError);
      } else {
        console.log('systems 테이블이 성공적으로 생성되었습니다.');
      }
    } else {
      console.log('systems 테이블이 성공적으로 생성되었습니다.');
    }

    // system_metrics 테이블 생성
    const { error: metricsError } = await supabase.rpc('create_system_metrics_table');
    
    if (metricsError) {
      console.error('system_metrics 테이블 생성 오류:', metricsError);
      
      // 직접 SQL 실행 시도
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.system_metrics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            system_id UUID REFERENCES public.systems(id),
            cpu_usage REAL,
            memory_usage REAL,
            disk_usage REAL,
            network_in REAL,
            network_out REAL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlError) {
        console.error('SQL 실행 오류:', sqlError);
      } else {
        console.log('system_metrics 테이블이 성공적으로 생성되었습니다.');
      }
    } else {
      console.log('system_metrics 테이블이 성공적으로 생성되었습니다.');
    }

    // 샘플 데이터 추가
    const { error: insertError } = await supabase
      .from('systems')
      .insert([
        { 
          name: '웹 서버 1', 
          description: '프로덕션 웹 서버입니다.', 
          status: 'online',
          ip_address: '192.168.1.10'
        },
        { 
          name: '데이터베이스 서버', 
          description: '메인 PostgreSQL 데이터베이스 서버입니다.', 
          status: 'online',
          ip_address: '192.168.1.20'
        },
        { 
          name: '백업 서버', 
          description: '백업 및 복구 서버입니다.', 
          status: 'offline',
          ip_address: '192.168.1.30'
        }
      ]);
    
    if (insertError) {
      console.error('샘플 데이터 추가 오류:', insertError);
    } else {
      console.log('샘플 시스템 데이터가 성공적으로 추가되었습니다.');
    }

    // 샘플 메트릭 데이터 추가
    const { data: systems } = await supabase
      .from('systems')
      .select('id');
    
    if (systems && systems.length > 0) {
      for (const system of systems) {
        const { error: metricsInsertError } = await supabase
          .from('system_metrics')
          .insert([
            {
              system_id: system.id,
              cpu_usage: Math.random() * 100,
              memory_usage: Math.random() * 100,
              disk_usage: Math.random() * 100,
              network_in: Math.random() * 1000,
              network_out: Math.random() * 1000
            }
          ]);
        
        if (metricsInsertError) {
          console.error(`시스템 ID ${system.id}의 메트릭 데이터 추가 오류:`, metricsInsertError);
        }
      }
      
      console.log('샘플 메트릭 데이터가 성공적으로 추가되었습니다.');
    }

    console.log('데이터베이스 설정이 완료되었습니다.');
  } catch (error) {
    console.error('데이터베이스 설정 중 오류가 발생했습니다:', error);
  }
}

// 데이터베이스 설정 실행
setupDatabase().then(() => {
  console.log('스크립트 실행이 완료되었습니다.');
  process.exit(0);
}).catch(error => {
  console.error('스크립트 실행 중 오류가 발생했습니다:', error);
  process.exit(1);
});

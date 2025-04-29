-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- RLS 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "사용자는 자신의 프로필만 볼 수 있음" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "사용자는 자신의 프로필만 수정할 수 있음" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 시스템 정보 테이블
CREATE TABLE IF NOT EXISTS systems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- RLS 정책 설정
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "인증된 사용자는 시스템을 볼 수 있음" ON systems
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "사용자는 자신의 시스템만 수정할 수 있음" ON systems
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 시스템만 삭제할 수 있음" ON systems
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "사용자는 시스템을 생성할 수 있음" ON systems
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 시스템 모니터링 데이터 테이블
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  system_id UUID REFERENCES systems(id) ON DELETE CASCADE,
  cpu_usage DECIMAL,
  memory_usage DECIMAL,
  disk_usage DECIMAL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "인증된 사용자는 시스템 메트릭을 볼 수 있음" ON system_metrics
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM systems WHERE systems.id = system_metrics.system_id AND systems.user_id = auth.uid())
  );

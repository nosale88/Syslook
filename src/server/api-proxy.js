// API 프록시 서버
// Vertex AI API 키를 안전하게 관리하기 위한 서버 측 프록시
// Supabase DB 연동을 통한 실시간 정보 제공
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dbService from './db-service.js';

// ES 모듈에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정
app.use(cors());
app.use(express.json());

// API 키 및 모델 설정
const API_KEY = process.env.VITE_VERTEX_AI_API_KEY;
const MODEL = process.env.VITE_VERTEX_AI_MODEL || 'gemini-1.5-pro';

// 상태 확인 엔드포인트
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'API 프록시 서버가 실행 중입니다.' });
});

// Supabase 연결 테스트 엔드포인트
app.get('/api/test-db', async (req, res) => {
  try {
    // 테스트 테이블 생성 시도
    const { error: createError } = await dbService.supabase
      .from('systems')
      .insert([
        { 
          name: '테스트 서버 1', 
          description: '테스트용 서버입니다.', 
          status: 'online',
          ip_address: '192.168.1.1'
        }
      ])
      .select();
    
    if (createError) {
      console.log('테이블 생성 오류:', createError);
    }
    
    // 시스템 정보 조회 시도
    const { data, error } = await dbService.supabase
      .from('systems')
      .select('*');
    
    if (error) {
      return res.status(500).json({ error: error.message, details: error });
    }
    
    res.json({ success: true, data, message: 'Supabase 연결 테스트 성공' });
  } catch (error) {
    console.error('Supabase 연결 테스트 오류:', error);
    res.status(500).json({ error: error.message || '알 수 없는 오류가 발생했습니다.' });
  }
});

// Vertex AI 채팅 엔드포인트
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: '메시지가 필요합니다.' });
    }
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
    }
    
    // 메시지 분석 및 DB 쿼리 수행
    let dbData = null;
    let contextInfo = '';
    const lowerMessage = message.toLowerCase();
    
    // Syslook 시스템 관련 키워드 검색
    const systemKeywords = [
      '시스템', 'system', '장비', '서버', 'server', '장치', '목록', '현황', '정보',
      '상태', 'status', '하드웨어', 'hardware', '장비 목록', '시스템 목록', '서버 목록'
    ];
    
    // 시스템 관련 질문인지 확인
    const isSystemRelatedQuery = systemKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // 이 서비스의 장비/시스템 관련 질문인지 확인
    const isAboutThisService = lowerMessage.includes('이 서비스') || 
                              lowerMessage.includes('이 시스템') || 
                              lowerMessage.includes('이 장비') || 
                              lowerMessage.includes('syslook');
    
    // 시스템 정보 요청 처리
    if (isSystemRelatedQuery || isAboutThisService) {
      // 특정 시스템 이름이나 ID를 찾음
      const systemNameMatch = message.match(/["']([^"']+)["']/) || 
                             message.match(/(\w+)\s*(시스템|정보|서버|장비|장치)/);
      
      if (systemNameMatch && systemNameMatch[1] && !isAboutThisService) {
        // 특정 시스템 정보 조회
        const systemName = systemNameMatch[1];
        const systems = await dbService.searchSystems(systemName);
        
        if (systems && systems.length > 0) {
          dbData = systems;
          contextInfo = `시스템 '${systemName}'에 대한 정보를 찾았습니다.`;
          
          // 메트릭 정보도 요청하는지 확인
          if (lowerMessage.includes('메트릭') || lowerMessage.includes('상태') || lowerMessage.includes('metric')) {
            const systemId = systems[0].id;
            const metrics = await dbService.getSystemMetrics(systemId);
            
            if (metrics && metrics.length > 0) {
              contextInfo += ` 그리고 해당 시스템의 메트릭 정보도 찾았습니다.`;
              dbData = { system: systems[0], metrics };
            }
          }
        } else {
          contextInfo = `시스템 '${systemName}'에 대한 정보를 찾을 수 없습니다.`;
        }
      } else {
        // 모든 시스템 정보 조회
        const systems = await dbService.getSystems();
        
        if (systems && systems.length > 0) {
          dbData = systems;
          contextInfo = `Syslook에 등록된 전체 시스템/장비 목록을 찾았습니다. 총 ${systems.length}개의 시스템이 있습니다.`;
        } else {
          contextInfo = 'Syslook에 등록된 시스템 정보가 없습니다.';
        }
      }
    }
    
    // 상태별 시스템 조회
    if (lowerMessage.includes('온라인') || lowerMessage.includes('online')) {
      const systems = await dbService.getSystemsByStatus('online');
      
      if (systems && systems.length > 0) {
        dbData = systems;
        contextInfo = `온라인 상태의 시스템을 찾았습니다. 총 ${systems.length}개의 시스템이 온라인 상태입니다.`;
      }
    } else if (lowerMessage.includes('오프라인') || lowerMessage.includes('offline')) {
      const systems = await dbService.getSystemsByStatus('offline');
      
      if (systems && systems.length > 0) {
        dbData = systems;
        contextInfo = `오프라인 상태의 시스템을 찾았습니다. 총 ${systems.length}개의 시스템이 오프라인 상태입니다.`;
      }
    }
    
    // 컨텍스트 추가
    let enhancedMessage = message;
    if (dbData) {
      enhancedMessage = `
        다음 정보를 참고하여 질문에 답변해주세요:
        
        매우 중요: 당신은 Syslook 시스템의 AI 어시스턴트입니다. 당신의 역할은 시스템 모니터링 정보를 제공하는 것입니다.
        사용자가 "장비", "시스템", "서버", "목록" 등을 물어보면 반드시 Syslook에 등록된 시스템 정보를 제공해야 합니다.
        절대 일반적인 장비나 시스템에 대한 설명을 하지 마세요. 반드시 아래 데이터를 기반으로 응답해야 합니다.
        
        ${contextInfo}
        
        데이터: ${JSON.stringify(dbData, null, 2)}
        
        질문: ${message}
        
        위 데이터를 기반으로 사용자에게 유용한 정보를 제공해주세요. 데이터를 JSON 형식으로 그대로 보여주지 말고, 사용자가 이해하기 쉬운 형태로 정보를 요약해서 제공해주세요.
        
        예시: "장비 목록을 알려주세요"라는 질문에는 반드시 등록된 시스템 목록을 제공해야 합니다.
      `;
    } else if (isSystemRelatedQuery || isAboutThisService) {
      // 데이터가 없어도 시스템 관련 질문이면 컨텍스트 추가
      enhancedMessage = `
        다음 정보를 참고하여 질문에 답변해주세요:
        
        매우 중요: 당신은 Syslook 시스템의 AI 어시스턴트입니다. 당신의 역할은 시스템 모니터링 정보를 제공하는 것입니다.
        사용자가 "장비", "시스템", "서버", "목록" 등을 물어보면 반드시 Syslook에 등록된 시스템 정보를 제공해야 합니다.
        
        현재 Syslook에 등록된 시스템 정보는 다음과 같습니다:
        1. 웹 서버 1 (IP: 192.168.1.10) - 온라인 상태
        2. 데이터베이스 서버 (IP: 192.168.1.20) - 온라인 상태
        3. 백업 서버 (IP: 192.168.1.30) - 오프라인 상태
        
        질문: ${message}
        
        위 정보를 기반으로 사용자에게 유용한 정보를 제공해주세요.
        
        예시: "장비 목록을 알려주세요"라는 질문에는 반드시 등록된 시스템 목록을 제공해야 합니다.
      `;
    }
    
    // Vertex AI 클라이언트 초기화
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });
    
    // 대화 기록이 비어있지 않고 첫 번째 메시지가 'assistant'인 경우 제외
    const processedHistory = history && history.length > 0 && history[0].role === 'assistant'
      ? history.slice(1)
      : history || [];
    
    // 채팅 세션 생성
    const chat = model.startChat({
      history: processedHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    });
    
    // 메시지 전송 - 강화된 메시지 사용
    const result = await chat.sendMessage(enhancedMessage);
    const response = result.response;
    const text = response.text();
    
    res.json({ text });
  } catch (error) {
    console.error('AI 메시지 처리 중 오류:', error);
    res.status(500).json({ error: error.message || '알 수 없는 오류가 발생했습니다.' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`API 프록시 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

export default app;

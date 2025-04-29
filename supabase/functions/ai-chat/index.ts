// Supabase Edge Function for AI Chat
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

// 환경 변수에서 API 키 가져오기
const API_KEY = Deno.env.get('VERTEX_AI_API_KEY');
const MODEL = Deno.env.get('VERTEX_AI_MODEL') || 'gemini-1.5-pro';

serve(async (req) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 });
  }

  try {
    // API 키 확인
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API 키가 설정되지 않았습니다.' }),
        { headers, status: 500 }
      );
    }

    // 요청 본문 파싱
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: '잘못된 JSON 형식입니다.' }),
        { headers, status: 400 }
      );
    }
    
    const message = body?.message;
    const history = body?.history || [];

    if (!message) {
      return new Response(
        JSON.stringify({ error: '메시지가 필요합니다.' }),
        { headers, status: 400 }
      );
    }

    // Google Generative AI 초기화
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    // 채팅 기록 형식 변환
    const formattedHistory = Array.isArray(history) ? history.map(msg => ({
      role: msg?.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg?.content || '' }],
    })) : [];

    // 채팅 세션 생성
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    // 응답 생성
    const result = await chat.sendMessage(message);
    if (!result || !result.response) {
      throw new Error('AI 응답을 받을 수 없습니다.');
    }
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('AI 응답이 비어 있습니다.');
    }

    return new Response(
      JSON.stringify({ text }),
      { headers, status: 200 }
    );
  } catch (error) {
    console.error('AI 메시지 처리 중 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || '알 수 없는 오류가 발생했습니다.' 
      }),
      { headers, status: 500 }
    );
  }
});
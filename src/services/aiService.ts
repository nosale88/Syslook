/**
 * Vertex AI 서비스 인터페이스
 */
export interface AIResponse {
  text: string;
  error?: string;
}

/**
 * Vertex AI 서비스 클래스
 */
export class AIService {
  // Netlify Functions URL
  private static netlifyFunctionsUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:8888/.netlify/functions'
    : '/.netlify/functions';
  
  // Supabase URL (Edge Function 사용 시)
  private static supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  private static edgeFunctionName = 'ai-chat-function';
  
  // 사용할 API 서버 유형 ('netlify' 또는 'edge')
  private static apiType = 'netlify';
  
  /**
   * 채팅 메시지 전송
   */
  static async sendMessage(message: string, history: Array<{role: string, content: string}> = []): Promise<AIResponse> {
    try {
      console.log('AI 메시지 전송 시작', { message, historyLength: history.length });
      
      // API URL 결정
      let url, headers;
      
      if (this.apiType === 'netlify') {
        // Netlify Functions 사용
        url = `${this.netlifyFunctionsUrl}/ai-chat`;
        headers = {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
      } else {
        // Supabase Edge Function 사용
        url = `${this.supabaseUrl}/functions/v1/${this.edgeFunctionName}`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
      }
      
      console.log('요청 URL:', url);
      console.log('API 유형:', this.apiType);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          history
        }),
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `서버 오류: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('오류 응답 파싱 실패:', e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return { text: data.text };
    } catch (error) {
      console.error('AI 메시지 전송 중 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return {
        text: '',
        error: errorMessage
      };
    }
  }
  
  /**
   * 서버 연결 상태 확인
   */
  static async checkServerStatus(): Promise<boolean> {
    try {
      let url, headers;
      
      if (this.apiType === 'netlify') {
        // Netlify Functions 상태 확인
        console.log('Netlify Functions 상태 확인 중...');
        url = `${this.netlifyFunctionsUrl}/ai-chat`;
        headers = {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
      } else {
        // Edge Function 상태 확인
        console.log('Edge Function 상태 확인 중...');
        url = `${this.supabaseUrl}/functions/v1/${this.edgeFunctionName}`;
        headers = {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
      }
      
      console.log('상태 확인 URL:', url);
      
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers,
        mode: 'cors',
        credentials: 'omit'
      });
      return response.ok;
    } catch (error) {
      console.error('Edge Function 상태 확인 중 오류:', error);
      return false;
    }
  }
  
  /**
   * API 서버가 구성되었는지 확인
   */
  static isConfigured(): boolean {
    return Boolean(this.supabaseUrl);
  }
}
import { supabase } from '../lib/supabase';

// Vertex AI 이미지 생성 서비스
export interface ImageGenerationRequest {
  prompt: string;
  selectedEquipment?: string[];
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
}

export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    // 환경 변수에서 프로젝트 ID와 API 키 가져오기
    const projectId = import.meta.env.VITE_VERTEX_PROJECT_ID || 'your-project-id';
    const apiKeyFromEnv = import.meta.env.VITE_VERTEX_API_KEY;
    
    // Vertex AI API 엔드포인트
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagegeneration:predict`;
    
    // API 키 결정 (환경 변수 우선, 없으면 Supabase에서 시도)
    let apiKey = apiKeyFromEnv;
    
    if (!apiKey) {
      try {
        // Supabase에서 API 키 가져오기 시도
        const { data, error } = await supabase
          .from('api_keys')
          .select('key_value')
          .eq('key_name', 'VERTEX_API_KEY')
          .single();
        
        if (!error && data?.key_value) {
          apiKey = data.key_value;
        }
      } catch (dbError) {
        console.error('Supabase에서 API 키를 가져오는 중 오류:', dbError);
      }
    }
    
    if (!apiKey) {
      throw new Error('Vertex API 키를 찾을 수 없습니다. 환경 변수 VITE_VERTEX_API_KEY를 설정하거나 Supabase에 api_keys 테이블을 구성하세요.');
    }

    // 선택된 장비 정보를 프롬프트에 추가
    let enhancedPrompt = request.prompt;
    if (request.selectedEquipment && request.selectedEquipment.length > 0) {
      enhancedPrompt += ` with equipment: ${request.selectedEquipment.join(', ')}`;
    }
    
    // Vertex AI API 요청 설정
    const requestBody = {
      instances: [
        {
          prompt: enhancedPrompt
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        negativePrompt: "blurry, distorted, low quality"
      }
    };
    
    // API 요청
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`이미지 생성 API 오류: ${response.status} ${errorText}`);
    }
    
    const responseData = await response.json();
    
    // 응답에서 이미지 URL 추출
    const imageUrl = responseData.predictions[0].images[0];
    
    return {
      imageUrl,
      prompt: enhancedPrompt
    };
  } catch (error) {
    console.error('이미지 생성 중 오류:', error);
    throw error;
  }
}

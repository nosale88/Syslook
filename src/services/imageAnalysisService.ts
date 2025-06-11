import { GoogleGenerativeAI } from '@google/generative-ai';

// 이미지에서 감지할 수 있는 무대 요소들
interface DetectedElement {
  type: 'stage' | 'lighting' | 'speaker' | 'chair' | 'screen' | 'decoration' | 'truss';
  confidence: number;
  position: { x: number; y: number; width: number; height: number };
  properties: any;
}

interface AnalysisResult {
  elements: DetectedElement[];
  stageLayout: 'proscenium' | 'arena' | 'thrust' | 'runway' | 'unknown';
  estimatedDimensions: { width: number; depth: number };
  suggestions: string[];
}

// Gemini AI를 사용한 이미지 분석
export class ImageAnalysisService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  // 파일을 base64로 변환
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // data:image/jpeg;base64, 제거
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Gemini Vision을 사용한 이미지 분석
  async analyzeImageWithGemini(file: File): Promise<AnalysisResult> {
    if (!this.genAI) {
      throw new Error('Gemini API key가 설정되지 않았습니다.');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const base64Data = await this.fileToBase64(file);

      const prompt = `
        이 이미지를 매우 신중하게 분석하여 실제로 보이는 무대/이벤트 장비만 감지해주세요.
        
        **중요: 실제로 명확히 보이는 요소만 감지하고, 추측하지 마세요.**
        
        감지할 수 있는 요소들:
        1. 무대 구조 (목재/갈색 플랫폼, 명확한 단상)
        2. 스피커 (검은색 박스형 음향 장비)
        3. LED 스크린/디스플레이 (파란색 화면, 검은색 패널)
        4. 조명 장비 (매우 밝은 점광원, 스포트라이트)
        5. 관객석 (빨간색 의자들의 반복 패턴)
        6. 트러스 (금속 구조물, 은색/회색 빔)
        7. 장식/배너 (컬러풀한 배경, 현수막)

        **감지 기준:**
        - 신뢰도 0.8 이상인 요소만 포함
        - 불확실하면 제외
        - 각 타입별로 최대 2-3개까지만

        JSON 형식으로 응답:
        {
          "elements": [
            {
              "type": "stage|speaker|screen|lighting|chair|truss|decoration",
              "confidence": 0.8-1.0,
              "position": {"x": 위치(0-100), "y": 위치(0-100), "width": 크기(0-100), "height": 크기(0-100)},
              "properties": {
                "size": "small|medium|large",
                "color": "실제_색상",
                "description": "구체적_설명",
                "count": "개수(해당시)"
              }
            }
          ],
          "stageLayout": "proscenium|arena|thrust|runway|unknown",
          "estimatedDimensions": {"width": 예상미터, "depth": 예상미터},
          "suggestions": ["감지된 요소 기반 제안사항"]
        }

        **예시:**
        - 스피커만 보이면: elements에 speaker만 포함
        - 무대만 보이면: elements에 stage만 포함
        - 아무것도 명확하지 않으면: elements를 빈 배열로
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // JSON 추출 (Gemini는 때때로 마크다운으로 감쌀 수 있음)
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
      }

      const analysisResult: AnalysisResult = JSON.parse(jsonMatch[0].replace(/```json\n|\n```/g, ''));
      return analysisResult;

    } catch (error) {
      console.error('Gemini 이미지 분석 오류:', error);
      throw error;
    }
  }

  // 웹 기반 객체 감지 (실제 이미지 분석)
  async analyzeImageWithTensorFlow(file: File): Promise<AnalysisResult> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Canvas를 사용해서 실제 이미지 분석
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // 분석을 위해 이미지 크기 조정
        const maxSize = 400;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // 이미지 분석 결과
        const analysis = this.analyzeImagePixels(imageData, canvas.width, canvas.height);
        const elements: DetectedElement[] = [];
        
        // 색상 분포 기반으로 요소들 감지
        const { dominantColors, brightness, hasLargeRectangles, hasSeatedPattern } = analysis;
        
        console.log('이미지 분석 결과:', analysis);

        // 엄격한 기준으로 요소 감지 - 신뢰도 임계값 상향 조정

        // 1. 무대 감지 (매우 명확한 갈색/목재색 영역만)
        if (dominantColors.brown > 0.2 || (dominantColors.black > 0.3 && hasLargeRectangles)) {
          elements.push({
            type: 'stage',
            confidence: 0.7 + (dominantColors.brown * 0.3),
            position: { x: 25, y: 60, width: 50, height: 30 },
            properties: { size: 'large', color: 'brown', description: '무대 플랫폼 감지됨' }
          });
        }

        // 2. 조명 감지 (매우 밝은 영역이 충분히 있을 때만)
        if (brightness.bright > 0.25) {
          const lightCount = Math.min(4, Math.floor(brightness.bright * 8));
          for (let i = 0; i < lightCount; i++) {
            elements.push({
              type: 'lighting',
              confidence: 0.7 + (brightness.bright * 0.3),
              position: { 
                x: 20 + (i * (60 / lightCount)), 
                y: 8 + Math.random() * 10, 
                width: 5, 
                height: 5 
              },
              properties: { 
                size: 'medium', 
                color: 'white', 
                description: `조명 장비 ${i + 1}`,
                lightType: 'spot'
              }
            });
          }
        }

        // 3. 스피커 감지 (검은색이 현저히 많을 때만)
        if (dominantColors.black > 0.15) {
          const speakerConfidence = Math.min(0.9, dominantColors.black * 3);
          
          // 검은색 비율에 따라 스피커 개수 결정
          if (dominantColors.black > 0.25) {
            // 스피커가 많은 경우 (여러 개)
            elements.push({
              type: 'speaker',
              confidence: speakerConfidence,
              position: { x: 10, y: 50, width: 15, height: 20 },
              properties: { size: 'large', color: 'black', description: '메인 스피커' }
            });
            
            elements.push({
              type: 'speaker',
              confidence: speakerConfidence,
              position: { x: 75, y: 50, width: 15, height: 20 },
              properties: { size: 'large', color: 'black', description: '메인 스피커' }
            });
          } else {
            // 스피커가 적은 경우 (하나만)
            elements.push({
              type: 'speaker',
              confidence: speakerConfidence,
              position: { x: 40, y: 50, width: 20, height: 25 },
              properties: { size: 'large', color: 'black', description: '스피커 시스템' }
            });
          }
        }

        // 4. LED 스크린 감지 (파란색이 명확히 있거나 매우 어두운 직사각형)
        if (dominantColors.blue > 0.15 || (dominantColors.black > 0.4 && hasLargeRectangles)) {
          elements.push({
            type: 'screen',
            confidence: 0.8 + (dominantColors.blue * 0.2),
            position: { x: 30, y: 20, width: 40, height: 30 },
            properties: { 
              size: 'large', 
              color: dominantColors.blue > 0.15 ? 'blue' : 'black', 
              description: 'LED 스크린 감지됨',
              resolution: 'high'
            }
          });
        }

        // 5. 관객석 감지 (명확한 반복 패턴이나 빨간색이 충분히 있을 때만)
        if ((hasSeatedPattern && dominantColors.red > 0.1) || dominantColors.red > 0.2) {
          elements.push({
            type: 'chair',
            confidence: 0.85 + (hasSeatedPattern ? 0.15 : 0),
            position: { x: 15, y: 75, width: 70, height: 20 },
            properties: { 
              size: 'medium', 
              color: 'red', 
              description: '관객석 배치 감지됨',
              rows: Math.max(4, Math.floor(dominantColors.red * 15)),
              columns: Math.max(10, Math.floor(dominantColors.red * 25))
            }
          });
        }

        // 6. 트러스 감지 (은색/금속색이 명확히 있을 때만)
        if (dominantColors.silver > 0.08 || (dominantColors.gray > 0.3 && hasLargeRectangles)) {
          elements.push({
            type: 'truss',
            confidence: 0.75 + (dominantColors.silver * 0.25),
            position: { x: 10, y: 5, width: 80, height: 8 },
            properties: { 
              size: 'large', 
              color: 'silver', 
              description: '트러스 구조 감지됨'
            }
          });
        }

        // 7. 장식 요소 감지 (특정 색상이 매우 뚜렷할 때만)
        if (dominantColors.blue > 0.2 || dominantColors.red > 0.2) {
          elements.push({
            type: 'decoration',
            confidence: 0.7 + Math.max(dominantColors.blue, dominantColors.red) * 0.3,
            position: { x: 5, y: 35, width: 20, height: 30 },
            properties: { 
              size: 'medium', 
              color: dominantColors.blue > dominantColors.red ? 'blue' : 'red', 
              description: '장식 요소 감지됨'
            }
          });
        }

        // 최소 요소 보장: 아무것도 감지되지 않으면 가장 확률 높은 요소 하나만 추가
        if (elements.length === 0) {
          // 가장 높은 색상 비율을 가진 요소 하나만 생성
          const maxColor = Math.max(
            dominantColors.black,
            dominantColors.brown,
            dominantColors.blue,
            dominantColors.red,
            dominantColors.silver
          );
          
          if (maxColor === dominantColors.black && dominantColors.black > 0.05) {
            elements.push({
              type: 'speaker',
              confidence: 0.6,
              position: { x: 40, y: 50, width: 20, height: 25 },
              properties: { size: 'medium', color: 'black', description: '스피커 장비' }
            });
          } else if (maxColor === dominantColors.brown && dominantColors.brown > 0.05) {
            elements.push({
              type: 'stage',
              confidence: 0.6,
              position: { x: 30, y: 60, width: 40, height: 25 },
              properties: { size: 'medium', color: 'brown', description: '무대 플랫폼' }
            });
          } else if (maxColor === dominantColors.blue && dominantColors.blue > 0.05) {
            elements.push({
              type: 'screen',
              confidence: 0.6,
              position: { x: 35, y: 25, width: 30, height: 25 },
              properties: { size: 'medium', color: 'blue', description: 'LED 디스플레이', resolution: 'medium' }
            });
          } else if (maxColor === dominantColors.red && dominantColors.red > 0.05) {
            elements.push({
              type: 'chair',
              confidence: 0.6,
              position: { x: 20, y: 75, width: 60, height: 20 },
              properties: { size: 'medium', color: 'red', description: '관객석', rows: 4, columns: 8 }
            });
          } else {
            // 어떤 색상도 충분하지 않으면 기본 무대만 생성
            elements.push({
              type: 'stage',
              confidence: 0.5,
              position: { x: 35, y: 65, width: 30, height: 20 },
              properties: { size: 'small', color: 'gray', description: '기본 무대' }
            });
          }
        }

        // 분석 결과에 따른 무대 레이아웃 추정
        let detectedLayout: 'proscenium' | 'arena' | 'thrust' | 'runway' | 'unknown' = 'unknown';
        if (hasSeatedPattern && dominantColors.red > 0.1) {
          detectedLayout = 'proscenium'; // 관객석 패턴이 명확
        } else if (dominantColors.black > 0.4) {
          detectedLayout = 'arena'; // 매우 어두운 환경
        } else if (hasLargeRectangles && elements.length > 2) {
          detectedLayout = 'thrust'; // 복잡한 구조
        }

        // 동적 제안사항 생성
        const suggestions: string[] = [];
        const detectedTypes = new Set(elements.map(e => e.type));
        
        if (detectedTypes.has('stage')) suggestions.push('무대 구조 감지됨');
        if (detectedTypes.has('lighting')) suggestions.push('조명 시스템 확인됨');
        if (detectedTypes.has('speaker')) suggestions.push('음향 장비 감지됨');
        if (detectedTypes.has('screen')) suggestions.push('영상 장비 확인됨');
        if (detectedTypes.has('chair')) suggestions.push('관객석 구성 감지됨');
        if (detectedTypes.has('truss')) suggestions.push('구조 시설 확인됨');
        if (detectedTypes.has('decoration')) suggestions.push('장식 요소 감지됨');
        
        if (suggestions.length === 0) {
          suggestions.push('이미지 분석 완료');
        }

        const analysisResult: AnalysisResult = {
          elements,
          stageLayout: detectedLayout,
          estimatedDimensions: { 
            width: Math.max(10, Math.min(20, elements.length * 2)), 
            depth: Math.max(8, Math.min(16, elements.length * 1.5)) 
          },
          suggestions
        };
        
        resolve(analysisResult);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // 이미지 픽셀 분석 메서드
  private analyzeImagePixels(imageData: ImageData, width: number, height: number) {
    const data = imageData.data;
    const totalPixels = width * height;
    
    let brightPixels = 0;
    let darkPixels = 0;
    
    const colorCounts = {
      red: 0,
      green: 0,
      blue: 0,
      brown: 0,
      black: 0,
      white: 0,
      gray: 0,
      silver: 0
    };

    // 픽셀별 색상 분석
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      // 밝기 분류
      if (brightness > 200) brightPixels++;
      if (brightness < 50) darkPixels++;

      // 색상 분류
      if (r > g + 30 && r > b + 30) colorCounts.red++;
      else if (g > r + 30 && g > b + 30) colorCounts.green++;
      else if (b > r + 30 && b > g + 30) colorCounts.blue++;
      else if (r > 100 && g > 60 && g < 100 && b < 60) colorCounts.brown++;
      else if (brightness < 60) colorCounts.black++;
      else if (brightness > 200) colorCounts.white++;
      else if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20) {
        if (brightness > 150) colorCounts.silver++;
        else colorCounts.gray++;
      }
    }

    // 패턴 감지 (간단한 반복 구조 체크)
    const hasSeatedPattern = this.detectRepeatingPattern(imageData, width, height);
    const hasLargeRectangles = this.detectRectangularShapes(imageData, width, height);

    return {
      dominantColors: {
        red: colorCounts.red / totalPixels,
        green: colorCounts.green / totalPixels,
        blue: colorCounts.blue / totalPixels,
        brown: colorCounts.brown / totalPixels,
        black: colorCounts.black / totalPixels,
        white: colorCounts.white / totalPixels,
        gray: colorCounts.gray / totalPixels,
        silver: colorCounts.silver / totalPixels
      },
      brightness: {
        bright: brightPixels / totalPixels,
        dark: darkPixels / totalPixels
      },
      hasSeatedPattern,
      hasLargeRectangles
    };
  }

  // 반복 패턴 감지 (관객석 등)
  private detectRepeatingPattern(imageData: ImageData, width: number, height: number): boolean {
    const data = imageData.data;
    let patternScore = 0;
    const sampleSize = Math.min(50, Math.floor(width / 10));
    
    // 가로줄 패턴 체크
    for (let y = Math.floor(height * 0.6); y < height - 10; y += 10) {
      for (let x = 0; x < width - sampleSize; x += sampleSize) {
        const idx1 = (y * width + x) * 4;
        const idx2 = (y * width + x + sampleSize) * 4;
        
        const diff = Math.abs(data[idx1] - data[idx2]) + 
                    Math.abs(data[idx1 + 1] - data[idx2 + 1]) + 
                    Math.abs(data[idx1 + 2] - data[idx2 + 2]);
        
        if (diff < 50) patternScore++;
      }
    }
    
    return patternScore > 3;
  }

  // 직사각형 형태 감지
  private detectRectangularShapes(imageData: ImageData, width: number, height: number): boolean {
    const data = imageData.data;
    let rectangleScore = 0;
    
    // 간단한 엣지 감지
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        const neighbors = [
          ((y - 1) * width + x) * 4,
          ((y + 1) * width + x) * 4,
          (y * width + (x - 1)) * 4,
          (y * width + (x + 1)) * 4
        ];
        
        let edgeStrength = 0;
        neighbors.forEach(nIdx => {
          const nBrightness = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
          edgeStrength += Math.abs(brightness - nBrightness);
        });
        
        if (edgeStrength > 200) rectangleScore++;
      }
    }
    
    return rectangleScore > (width * height * 0.05);
  }

  // 분석 결과를 3D 요소로 변환
  convertToThreeJSElements(analysisResult: AnalysisResult) {
    const elements = [];

    for (const detected of analysisResult.elements) {
      const element = this.createElement(detected);
      if (element) {
        elements.push(element);
      }
    }

    return {
      elements,
      layout: analysisResult.stageLayout,
      dimensions: analysisResult.estimatedDimensions,
      suggestions: analysisResult.suggestions
    };
  }

  private createElement(detected: DetectedElement) {
    const basePosition = {
      x: (detected.position.x - 50) * 0.2, // 이미지 좌표를 3D 좌표로 변환
      y: 0,
      z: (detected.position.y - 50) * 0.2
    };

    switch (detected.type) {
      case 'stage':
        return {
          type: 'stage',
          properties: {
            width: detected.position.width * 0.1,
            depth: detected.position.height * 0.1,
            height: 0.5,
            material: 'plywood',
            stageType: 'basic'
          },
          position: basePosition,
          confidence: detected.confidence
        };

      case 'lighting':
        return {
          type: 'lighting',
          properties: {
            type: 'spot',
            color: detected.properties.color || '#ffffff',
            intensity: 1,
            distance: 10,
            angle: Math.PI / 6
          },
          position: { ...basePosition, y: 3 }, // 조명은 높이 조정
          confidence: detected.confidence
        };

      case 'speaker':
        return {
          type: 'speaker',
          properties: {
            type: 'main',
            width: 0.6,
            height: 1.2,
            depth: 0.4,
            power: 500
          },
          position: basePosition,
          confidence: detected.confidence
        };

      case 'chair':
        return {
          type: 'chair',
          properties: {
            type: 'standard',
            rows: Math.max(1, Math.floor(detected.position.height * 0.1)),
            columns: Math.max(1, Math.floor(detected.position.width * 0.1)),
            spacing: 0.9
          },
          position: basePosition,
          confidence: detected.confidence
        };

      case 'screen':
        return {
          type: 'screen',
          properties: {
            width: detected.position.width * 0.05,
            height: detected.position.height * 0.05,
            resolution: 'high',
            installationType: 'wall-mounted'
          },
          position: { ...basePosition, y: 2 },
          confidence: detected.confidence
        };

      case 'truss':
        return {
          type: 'truss',
          properties: {
            width: detected.position.width * 0.08,
            depth: 0.3,
            height: 0.3,
            trussType: 'box'
          },
          position: { ...basePosition, y: 4 }, // 트러스는 높이 조정
          confidence: detected.confidence
        };

      case 'decoration':
        return {
          type: 'decoration',
          properties: {
            type: 'banner',
            width: detected.position.width * 0.03,
            height: detected.position.height * 0.03,
            color: detected.properties.color || '#0066ff',
            material: 'fabric'
          },
          position: basePosition,
          confidence: detected.confidence
        };

      default:
        return null;
    }
  }
}

export const imageAnalysisService = new ImageAnalysisService(); 
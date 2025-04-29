/**
 * 로컬 스토리지 유틸리티 함수
 */

// 로컬 스토리지 키
const CHAT_HISTORY_KEY = 'syslook_chat_history';
const MAX_CHAT_HISTORY = 50; // 최대 저장할 채팅 메시지 수

// 채팅 메시지 인터페이스
export interface StoredChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO 문자열
}

/**
 * 채팅 기록 저장
 */
export const saveChatHistory = (messages: StoredChatMessage[]): void => {
  try {
    // 최대 메시지 수 제한
    const limitedMessages = messages.slice(-MAX_CHAT_HISTORY);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(limitedMessages));
  } catch (error) {
    console.error('채팅 기록 저장 중 오류:', error);
  }
};

/**
 * 채팅 기록 불러오기
 */
export const loadChatHistory = (): StoredChatMessage[] => {
  try {
    const storedData = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!storedData) return [];
    
    return JSON.parse(storedData) as StoredChatMessage[];
  } catch (error) {
    console.error('채팅 기록 불러오기 중 오류:', error);
    return [];
  }
};

/**
 * 채팅 기록 삭제
 */
export const clearChatHistory = (): void => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.error('채팅 기록 삭제 중 오류:', error);
  }
};

/**
 * 로컬 스토리지 사용 가능 여부 확인
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

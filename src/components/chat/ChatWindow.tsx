import { useState, useRef, useEffect } from 'react';
import { FiX, FiSend, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { AIService } from '../../services/aiService';
import { saveChatHistory, loadChatHistory, clearChatHistory, isStorageAvailable, StoredChatMessage } from '../../utils/storageUtils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow = ({ onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // 메시지가 변경되면 로컬 스토리지에 저장
    if (storageAvailable && messages.length > 0) {
      const storedMessages: StoredChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }));
      saveChatHistory(storedMessages);
    }
  }, [messages, storageAvailable]);

  // 채팅창 열릴 때 입력 필드에 포커스 및 로컬 스토리지 확인
  useEffect(() => {
    inputRef.current?.focus();
    
    // 로컬 스토리지 사용 가능 여부 확인
    const available = isStorageAvailable();
    setStorageAvailable(available);
    
    // 로컬 스토리지에서 채팅 기록 불러오기
    if (available) {
      const storedMessages = loadChatHistory();
      if (storedMessages.length > 0) {
        const convertedMessages: ChatMessage[] = storedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(convertedMessages);
      }
    }
  }, []);
  
  // 서버 상태 확인
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const isOnline = await AIService.checkServerStatus();
        setServerStatus(isOnline ? 'online' : 'offline');
      } catch (error) {
        console.error('서버 상태 확인 오류:', error);
        setServerStatus('offline');
      }
    };
    
    checkServerStatus();
    
    // 5초마다 서버 상태 확인
    const intervalId = setInterval(checkServerStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // 서버가 오프라인인 경우 상태 다시 확인
    if (serverStatus === 'offline') {
      try {
        const isOnline = await AIService.checkServerStatus();
        setServerStatus(isOnline ? 'online' : 'offline');
        if (!isOnline) {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
              timestamp: new Date()
            }
          ]);
          return;
        }
      } catch (error) {
        console.error('서버 상태 확인 오류:', error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
            timestamp: new Date()
          }
        ]);
        return;
      }
    }
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setRetryCount(0); // 재시도 횟수 초기화
    
    const sendMessageWithRetry = async (retries = 3) => {
      try {
        // 이전 대화 내역 변환
        const history = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // AI 응답 요청
        const response = await AIService.sendMessage(userMessage.content, history);
        
        if (response.error) {
          // 오류가 발생했지만 재시도 가능한 경우
          if (retries > 0 && response.error.includes('서버')) {
            console.log(`메시지 전송 재시도 중... (${3 - retries + 1}/3)`);
            setRetryCount(3 - retries + 1);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
            return sendMessageWithRetry(retries - 1);
          }
          
          // 재시도 횟수를 모두 소진했거나 다른 오류인 경우
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: `오류가 발생했습니다: ${response.error}`,
              timestamp: new Date()
            }
          ]);
        } else {
          // 정상 응답 표시
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: response.text,
              timestamp: new Date()
            }
          ]);
        }
      } catch (error) {
        console.error('메시지 전송 중 오류:', error);
        
        // 네트워크 오류인 경우 재시도
        if (retries > 0) {
          console.log(`메시지 전송 재시도 중... (${3 - retries + 1}/3)`);
          setRetryCount(3 - retries + 1);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
          return sendMessageWithRetry(retries - 1);
        }
        
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: '죄송합니다. 메시지를 처리하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            timestamp: new Date()
          }
        ]);
      } finally {
        setIsLoading(false);
        setRetryCount(0);
      }
    };
    
    // 재시도 로직을 포함한 메시지 전송 시작
    sendMessageWithRetry();
  };

  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      className="fixed bottom-20 right-6 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl z-50 flex flex-col overflow-hidden dark:bg-gray-800 dark:text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* 헤더 */}
      <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center bg-blue-500 text-white">
        <h3 className="font-medium">AI 어시스턴트</h3>
        <div className="flex items-center space-x-2">
          {storageAvailable && messages.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('채팅 기록을 모두 지우시겠습니까?')) {
                  clearChatHistory();
                  setMessages([]);
                }
              }}
              className="text-white hover:bg-blue-600 rounded-full p-1"
              aria-label="채팅 기록 지우기"
              title="채팅 기록 지우기"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-600 rounded-full p-1"
            aria-label="채팅 닫기"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 서버 상태 표시 */}
      {serverStatus !== 'online' && (
        <div className={`p-2 text-center text-xs ${serverStatus === 'checking' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {serverStatus === 'checking' ? '서버 연결 확인 중...' : '서버에 연결할 수 없습니다. 재연결 중...'}
        </div>
      )}
      
      {/* 메시지 영역 */}
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
            <p className="mb-2">안녕하세요! 시스템에 대해 문의하고 싶은 내용을 입력해주세요.</p>
            <p className="text-sm">예시: "시스템 상태를 확인하는 방법은 무엇인가요?"</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-3 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block rounded-lg px-3 py-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-left mb-3">
            <div className="inline-block rounded-lg px-3 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white">
              <div className="flex flex-col">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                {retryCount > 0 && (
                  <div className="text-xs mt-1">
                    재시도 중... ({retryCount}/3)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-3 border-t dark:border-gray-700">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={`bg-blue-500 text-white rounded-r-lg px-3 py-2 ${
              !input.trim() || isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600'
            }`}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
        {!AIService.isConfigured() && (
          <p className="text-xs text-red-500 mt-1">
            Vertex AI API 키가 설정되지 않았습니다. .env 파일을 확인하세요.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ChatWindow;

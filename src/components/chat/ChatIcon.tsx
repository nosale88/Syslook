import { useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from './ChatWindow';

const ChatIcon = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={toggleChat}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
          aria-label="채팅 열기"
        >
          <FiMessageSquare className="w-6 h-6" />
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <ChatWindow onClose={toggleChat} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatIcon;

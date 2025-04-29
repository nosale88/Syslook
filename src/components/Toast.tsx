import React, { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, isVisible, onClose }) => {
  const icons = {
    success: <CheckCircle className="h-6 w-6 text-green-400" />,
    error: <XCircle className="h-6 w-6 text-red-400" />,
    info: <AlertCircle className="h-6 w-6 text-blue-400" />,
  };

  const backgrounds = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  };

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={isVisible}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`max-w-sm w-full ${backgrounds[type]} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">{icons[type]}</div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${textColors[type]}`}>
                    {message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className={`rounded-md inline-flex ${textColors[type]} hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    onClick={onClose}
                  >
                    <span className="sr-only">닫기</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default Toast;
'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, UtensilsCrossed } from 'lucide-react';

interface ManualInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

const ManualInputModal: React.FC<ManualInputModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [text, setText] = useState('');

  const handleConfirm = () => {
    if (text.trim()) {
      onConfirm(text.trim());
      setText('');
      onClose();
    }
  };

  const handleClose = () => {
    setText('');
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border-4 border-orange-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 relative">
              <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={24} />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <UtensilsCrossed className="mr-2 text-orange-500" />
                Опишите ваш прием пищи
              </h3>
              
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Например: 'Два яйца, тост с маслом, кофе с молоком'"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={4}
                autoFocus
              />

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!text.trim()}
                  className="px-6 py-2 rounded-lg text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors flex items-center"
                >
                  <Send className="mr-2" size={16} />
                  Отправить
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManualInputModal; 
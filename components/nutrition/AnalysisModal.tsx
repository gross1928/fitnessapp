
'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, BarChart, Beef, Wheat, Droplets, List, X, UtensilsCrossed, MessageSquare, Save, Send } from 'lucide-react';
import { NutritionData } from '@/types';

interface AnalysisModalProps {
  isOpen: boolean;
  isLoading: boolean;
  loadingText?: string;
  analysisResult: NutritionData | null;
  analysisError: string | null;
  onClose: () => void;
  uploadProgress: number;
  onSave?: (data: NutritionData) => void;
  onSendFeedback?: (data: NutritionData, feedback: string) => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ 
  isOpen, 
  isLoading, 
  loadingText = 'Анализ...',
  analysisResult, 
  analysisError, 
  onClose, 
  uploadProgress,
  onSave,
  onSendFeedback
}) => {
  const [feedback, setFeedback] = useState('');
  // Устанавливаем showFeedback в true по умолчанию
  const [showFeedback, setShowFeedback] = useState(true);

  const totalWeight = analysisResult?.ingredients.reduce((sum, ing) => sum + ing.weight_grams, 0) || 0;

  const handleSave = () => {
    if (analysisResult && onSave) {
      onSave(analysisResult);
      setFeedback('');
      setShowFeedback(false);
      onClose();
    }
  };

  const handleSendFeedback = () => {
    if (analysisResult && onSendFeedback && feedback.trim()) {
      onSendFeedback(analysisResult, feedback.trim());
      setFeedback('');
    }
  };

  const handleClose = () => {
    setFeedback('');
    setShowFeedback(false);
    onClose();
  };

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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border-4 border-orange-500 max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 p-6 relative">
              <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={24} />
              </button>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{loadingText}</h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <motion.div
                      className="bg-orange-500 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.5, ease: "linear" }}
                    />
                  </div>
                  <p className="text-orange-500 font-bold text-xl mt-4">{uploadProgress}%</p>
                </div>
              ) : analysisError ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <UtensilsCrossed className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Ошибка анализа</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-6">{analysisError}</p>
                  <button
                    onClick={handleClose}
                    className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              ) : null}
            </div>

            {/* Скроллируемый контент */}
            {analysisResult && !isLoading && !analysisError && (
              <div className="flex-1 overflow-y-auto px-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
                    <UtensilsCrossed className="mr-3 text-orange-500" />
                    КБЖУ Блюда
                  </h2>
                  <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">{analysisResult.dish_name}</p>
                  {totalWeight > 0 && (
                    <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
                      Общий вес: {totalWeight} г
                    </p>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <div className="flex items-center text-gray-800 dark:text-white font-semibold">
                        <BarChart className="mr-3 text-orange-500" />
                        <span>Калории</span>
                      </div>
                      <span className="font-bold text-lg">{analysisResult.total_nutrition.calories} ккал</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg">
                      <div className="flex items-center text-gray-800 dark:text-white">
                        <Beef className="mr-3 text-orange-500" />
                        <span>Белки</span>
                      </div>
                      <span className="font-bold text-lg">{analysisResult.total_nutrition.proteins} г</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <div className="flex items-center text-gray-800 dark:text-white">
                        <Droplets className="mr-3 text-orange-500" />
                        <span>Жиры</span>
                      </div>
                      <span className="font-bold text-lg">{analysisResult.total_nutrition.fats} г</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg">
                      <div className="flex items-center text-gray-800 dark:text-white">
                        <Wheat className="mr-3 text-orange-500" />
                        <span>Углеводы</span>
                      </div>
                      <span className="font-bold text-lg">{analysisResult.total_nutrition.carbs} г</span>
                    </div>
                  </div>

                  {/* Убираем блок Состав */}

                  {/* Поле для комментариев */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <MessageSquare className="mr-2 text-orange-500" size={20} />
                      Есть уточнения?
                    </h3>
                    
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Например: 'Добавь острый соус 20г' или 'Это была большая порция, увеличь в 1.5 раза'"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Кнопки */}
            {analysisResult && !isLoading && !analysisError && (
              <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Save className="mr-2" size={18} />
                    Сохранить
                  </button>
                  
                  <button
                    onClick={handleSendFeedback}
                    disabled={!feedback.trim()}
                    className={`flex-1 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                      !feedback.trim()
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <Send className="mr-2" size={18} />
                    Отправить
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalysisModal; 
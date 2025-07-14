
'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, BarChart, Beef, Wheat, Droplets, List, X, UtensilsCrossed } from 'lucide-react';
import { NutritionData } from '@/types';

interface AnalysisModalProps {
  isOpen: boolean;
  isLoading: boolean;
  analysisResult: NutritionData | null;
  analysisError: string | null; // Добавлено свойство для ошибки
  onClose: () => void;
  uploadProgress: number;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, isLoading, analysisResult, analysisError, onClose, uploadProgress }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border-4 border-orange-500" // Рамка стала толще
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 relative">
              <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={24} />
              </button>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Анализ изображения...</h3>
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
              ) : analysisError ? ( // Если есть ошибка, показываем ее
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <UtensilsCrossed className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Ошибка анализа</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-6">{analysisError}</p>
                  <button
                    onClick={onClose}
                    className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              ) : analysisResult && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
                    <UtensilsCrossed className="mr-3 text-orange-500" />
                    КБЖУ Блюда
                  </h2>
                  <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300 mb-6">{analysisResult.dish_name}</p>

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

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                     <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                       <List className="mr-2 text-orange-500"/>
                       Состав
                     </h3>
                     <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {analysisResult.ingredients.map((ing, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{ing.name}</span>
                          <span className="font-medium">{ing.weight_grams} г</span>
                        </li>
                      ))}
                     </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalysisModal; 
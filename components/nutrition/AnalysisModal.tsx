
'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, BarChart, Beef, Wheat, Droplets, Percent, X } from 'lucide-react';

interface NutritionData {
  detected_food: string;
  estimated_calories: number;
  estimated_nutrition: {
    proteins: number;
    fats: number;
    carbs: number;
  };
  confidence: number;
}

interface AnalysisModalProps {
  isOpen: boolean;
  isLoading: boolean;
  analysisResult: NutritionData | null;
  onClose: () => void;
  uploadProgress: number;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, isLoading, analysisResult, onClose, uploadProgress }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border-2 border-orange-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
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
              ) : analysisResult && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Bot className="mr-3 text-orange-500" />
                    Анализ Блюда
                  </h2>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6">{analysisResult.detected_food}</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-800 dark:text-white">
                        <BarChart className="mr-3 text-orange-500" />
                        <span>Калории</span>
                      </div>
                      <span className="font-bold text-lg">{analysisResult.estimated_calories} ккал/100г</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-800 dark:text-white">
                        <Beef className="mr-3 text-orange-500" />
                        <span>Белки</span>
                      </div>
                      <span className="font-bold text-lg">{analysisResult.estimated_nutrition.proteins} г</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-800 dark:text-white">
                        <Droplets className="mr-3 text-orange-500" />
                        <span>Жиры</span>
                      </div>
                      <span className="font-bold text-lg">{analysisResult.estimated_nutrition.fats} г</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-800 dark:text-white">
                        <Wheat className="mr-3 text-orange-500" />
                        <span>Углеводы</span>
                      </div>
                      <span className="font-bold text-lg">{analysisResult.estimated_nutrition.carbs} г</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center">
                     <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Percent className="mr-2 text-orange-500" />
                        <span className="font-semibold">Уверенность: {analysisResult.confidence}%</span>
                     </div>
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
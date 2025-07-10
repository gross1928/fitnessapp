'use client'

import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: number
  target?: number
  unit: string
  icon: React.ReactNode
  color: 'nutrition' | 'hydration' | 'heart' | 'weight' | 'sleep' | 'analysis'
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
  className?: string
}

const colorVariants = {
  nutrition: 'gradient-orange',
  hydration: 'gradient-blue', 
  heart: 'gradient-red',
  weight: 'gradient-green',
  sleep: 'gradient-purple',
  analysis: 'gradient-gray'
}

export function MetricCard({
  title,
  value,
  target,
  unit,
  icon,
  color,
  trend,
  onClick,
  className
}: MetricCardProps) {
  const percentage = target ? Math.min((value / target) * 100, 100) : 100
  const isClickable = !!onClick
  
  return (
    <div 
      className={cn(
        'p-4 rounded-2xl shadow-lg text-white relative overflow-hidden transition-all duration-300',
        colorVariants[color],
        isClickable && 'cursor-pointer hover:scale-105 hover:shadow-xl',
        className
      )}
      onClick={onClick}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      
      <div className="relative z-10">
        {/* Header with icon and trend */}
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            {icon}
          </div>
          {trend && (
            <div className={cn(
              'flex items-center text-sm font-medium',
              trend.isPositive ? 'text-green-100' : 'text-red-100'
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
        
        {/* Value and target */}
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">
              {value.toLocaleString('ru-RU', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 1 
              })}
            </span>
            <span className="text-sm opacity-80 ml-1">{unit}</span>
          </div>
          {target && (
            <span className="text-xs opacity-70">
              из {target.toLocaleString('ru-RU')}
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        {target && (
          <div className="space-y-1">
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-1000 ease-out shadow-sm" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs opacity-70 text-right">
              {Math.round(percentage)}%
            </div>
          </div>
        )}
      </div>
      
      {/* Click indicator */}
      {isClickable && (
        <div className="absolute bottom-2 right-2 opacity-30">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      )}
    </div>
  )
}

export default MetricCard 
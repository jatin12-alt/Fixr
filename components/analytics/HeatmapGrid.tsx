'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface HeatmapData {
  hour: number
  dayOfWeek: number
  failureCount: number
}

interface HeatmapGridProps {
  data: HeatmapData[]
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hours = Array.from({ length: 24 }, (_, i) => i)

// Color scale for failure count
const getColorForCount = (count: number): string => {
  if (count === 0) return 'bg-gray-800'
  if (count <= 2) return 'bg-yellow-900/50'
  if (count <= 5) return 'bg-orange-900/50'
  if (count <= 10) return 'bg-red-900/50'
  return 'bg-red-800'
}

const getBorderColor = (count: number): string => {
  if (count === 0) return 'border-gray-700'
  if (count <= 2) return 'border-yellow-700'
  if (count <= 5) return 'border-orange-700'
  if (count <= 10) return 'border-red-700'
  return 'border-red-600'
}

export function HeatmapGrid({ data }: HeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ hour: number; dayOfWeek: number } | null>(null)

  // Create a map for quick lookup
  const dataMap = new Map<string, number>()
  data.forEach(item => {
    dataMap.set(`${item.hour}-${item.dayOfWeek}`, item.failureCount)
  })

  const getCellData = (hour: number, dayOfWeek: number) => {
    return dataMap.get(`${hour}-${dayOfWeek}`) || 0
  }

  const getTooltipContent = (hour: number, dayOfWeek: number) => {
    const count = getCellData(hour, dayOfWeek)
    if (count === 0) return null
    
    return (
      <div className="absolute z-10 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl pointer-events-none"
        style={{
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-4px)',
          marginBottom: '8px'
        }}
      >
        <p className="text-white text-sm font-medium">
          {count} failure{count !== 1 ? 's' : ''}
        </p>
        <p className="text-gray-400 text-xs">
          {days[dayOfWeek]} {hour.toString().padStart(2, '0')}:00
        </p>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.failureCount), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Failure Heatmap</h3>
        <p className="text-sm text-gray-400">
          Pipeline failures by hour and day of week (last 30 days)
        </p>
      </div>

      {/* Heatmap grid scroll container */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[700px]">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12 shrink-0"></div> {/* Spacer */}
            <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className="text-xs text-gray-500 text-center"
                >
                  {hour % 2 === 0 ? hour.toString() : ''}
                </div>
              ))}
            </div>
          </div>

      {/* Heatmap grid */}
      <div className="flex">
        {/* Day labels */}
        <div className="w-12 pr-2">
          {days.map((day, dayIndex) => (
            <div 
              key={day}
              className="h-6 flex items-center justify-end text-xs text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid cells */}
        <div className="flex-1">
          {days.map((_, dayIndex) => (
            <div key={dayIndex} className="grid gap-1 mb-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
              {hours.map(hour => {
                const count = getCellData(hour, dayIndex)
                const isHovered = hoveredCell?.hour === hour && hoveredCell?.dayOfWeek === dayIndex
                
                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className={`relative h-6 rounded-sm border cursor-pointer transition-all hover:scale-110 ${getColorForCount(count)} ${getBorderColor(count)}`}
                    onMouseEnter={() => setHoveredCell({ hour, dayOfWeek: dayIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      opacity: isHovered ? 1 : 0.8 + (count / maxCount) * 0.2,
                    }}
                  >
                    {isHovered && getTooltipContent(hour, dayIndex)}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-4">
        <span className="text-sm text-gray-400">Less</span>
        <div className="flex items-center space-x-1">
          {[
            { color: 'bg-gray-800', border: 'border-gray-700' },
            { color: 'bg-yellow-900/50', border: 'border-yellow-700' },
            { color: 'bg-orange-900/50', border: 'border-orange-700' },
            { color: 'bg-red-900/50', border: 'border-red-700' },
            { color: 'bg-red-800', border: 'border-red-600' },
          ].map((item, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-sm border ${item.color} ${item.border}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-400">More</span>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {data.reduce((sum, d) => sum + d.failureCount, 0)}
          </p>
          <p className="text-xs text-gray-400">Total Failures</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {data.filter(d => d.failureCount > 0).length}
          </p>
          <p className="text-xs text-gray-400">Active Hours</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {hours.reduce((maxHour, hour) => {
              const hourTotal = days.reduce((sum, _, dayIndex) => 
                sum + getCellData(hour, dayIndex), 0
              )
              const currentMax = days.reduce((sum, _, dayIndex) => 
                sum + getCellData(maxHour, dayIndex), 0
              )
              return hourTotal > currentMax ? hour : maxHour
            }, 0).toString().padStart(2, '0')}:00
          </p>
          <p className="text-xs text-gray-400">Peak Hour</p>
        </div>
      </div>
    </motion.div>
  )
}

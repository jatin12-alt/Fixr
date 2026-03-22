'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

interface DateRange {
  startDate: Date
  endDate: Date
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const presetRanges = [
  { label: 'Today', days: 0 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState(
    value.startDate.toISOString().split('T')[0]
  )
  const [customEnd, setCustomEnd] = useState(
    value.endDate.toISOString().split('T')[0]
  )

  const handlePresetClick = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    onChange({ startDate, endDate })
    setShowCustom(false)
  }

  const handleCustomApply = () => {
    const startDate = new Date(customStart)
    const endDate = new Date(customEnd)
    
    if (startDate <= endDate) {
      onChange({ startDate, endDate })
      setShowCustom(false)
    }
  }

  const isPresetActive = (days: number) => {
    const diffTime = Math.abs(value.endDate.getTime() - value.startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return diffDays === 0 && 
        value.startDate.toDateString() === new Date().toDateString()
    }
    
    return diffDays === days && 
      value.endDate.toDateString() === new Date().toDateString()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:border-cyan-500 transition-colors"
      >
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-white text-sm">
          {formatDate(value.startDate)} - {formatDate(value.endDate)}
        </span>
      </button>

      {showCustom && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 left-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 p-4 min-w-[300px]"
        >
          {/* Preset buttons */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Quick select</p>
            <div className="grid grid-cols-4 gap-2">
              {presetRanges.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.days)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    isPresetActive(preset.days)
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom date inputs */}
          <div className="border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400 mb-2">Custom range</p>
            <div className="space-y-3">
              <div>
                <label htmlFor="start-date" className="block text-xs text-gray-500 mb-1">Start date</label>
                <input
                  id="start-date"
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                  aria-label="Start date"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-xs text-gray-500 mb-1">End date</label>
                <input
                  id="end-date"
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                  aria-label="End date"
                />
              </div>
              <button
                onClick={handleCustomApply}
                className="w-full px-4 py-2 bg-cyan-500 text-white rounded text-sm hover:bg-cyan-600 transition-colors"
              >
                Apply Range
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

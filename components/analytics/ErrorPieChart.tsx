'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts'

interface ErrorData {
  errorType: string
  count: number
  percentage: number
}

interface ErrorPieChartProps {
  data: ErrorData[]
  onErrorTypeClick?: (errorType: string) => void
}

const COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
]

export function ErrorPieChart({ data, onErrorTypeClick }: ErrorPieChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handlePieClick = (data: any, index: number) => {
    setSelectedIndex(index)
    if (onErrorTypeClick) {
      onErrorTypeClick(data.errorType)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-gray-400 text-sm">
            Count: {payload[0].value}
          </p>
          <p className="text-cyan-400 text-sm">
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null // Hide labels for small slices

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    )
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <button
            key={index}
            onClick={() => handlePieClick(entry.payload, index)}
            className={`flex items-center space-x-2 text-sm transition-colors ${
              selectedIndex === index ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
          </button>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <p className="text-gray-400">No errors in the selected period</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Error Breakdown</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              onClick={handlePieClick}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    filter: selectedIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{data[selectedIndex].errorType}</p>
              <p className="text-gray-400 text-sm">
                {data[selectedIndex].count} occurrences ({data[selectedIndex].percentage.toFixed(1)}%)
              </p>
            </div>
            <button
              onClick={() => setSelectedIndex(null)}
              className="text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

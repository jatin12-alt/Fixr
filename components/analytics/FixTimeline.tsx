'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Clock, Wrench, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface FixTimelineProps {
  fixes: Array<{
    id: string
    repoName: string
    fixDescription: string
    timeSaved: number
    appliedAt: string
  }>
}

export function FixTimeline({ fixes }: FixTimelineProps) {
  const [visibleFixes, setVisibleFixes] = useState(5)

  if (fixes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center"
      >
        <Wrench className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No AI Fixes Yet</h3>
        <p className="text-gray-400">
          AI fixes will appear here when they're applied to your repositories.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent AI Fixes</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <BarChart3 className="h-4 w-4" />
          <span>{fixes.length} total fixes</span>
        </div>
      </div>

      <div className="space-y-4">
        {fixes.slice(0, visibleFixes).map((fix, index) => (
          <motion.div
            key={fix.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 pb-4 border-l-2 border-gray-700 last:border-l-0"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 top-2 w-4 h-4 bg-cyan-500 rounded-full border-2 border-gray-900 -translate-x-1/2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full m-0.5" />
            </div>

            {/* Content */}
            <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{fix.repoName}</h4>
                  <p className="text-gray-300 text-sm">{fix.fixDescription}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <div className="text-right">
                    <p className="text-green-400 text-sm font-medium">
                      +{fix.timeSaved}h saved
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatDistanceToNow(new Date(fix.appliedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Applied automatically</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wrench className="h-3 w-3" />
                    <span>AI Fix</span>
                  </div>
                </div>
                <button className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors text-xs">
                  <span>View Details</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show More button */}
      {fixes.length > visibleFixes && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisibleFixes(prev => Math.min(prev + 5, fixes.length))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-cyan-500 transition-colors"
          >
            Show {Math.min(5, fixes.length - visibleFixes)} More
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {fixes.reduce((sum, fix) => sum + fix.timeSaved, 0)}h
            </p>
            <p className="text-xs text-gray-400">Total Time Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {fixes.length > 0 
                ? (fixes.reduce((sum, fix) => sum + fix.timeSaved, 0) / fixes.length).toFixed(1)
                : 0}h
            </p>
            <p className="text-xs text-gray-400">Avg Time per Fix</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {new Set(fixes.map(f => f.repoName)).size}
            </p>
            <p className="text-xs text-gray-400">Repositories Helped</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

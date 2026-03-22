'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'

interface RepoData {
  repoName: string
  healthScore: number
  totalRuns: number
  successRate: number
  lastRun: string
}

type SortField = 'repoName' | 'healthScore' | 'totalRuns' | 'successRate' | 'lastRun'
type SortDirection = 'asc' | 'desc'

interface RepoTableProps {
  data: RepoData[]
}

export function RepoTable({ data }: RepoTableProps) {
  const [sortField, setSortField] = useState<SortField>('healthScore')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    // Handle special cases
    if (sortField === 'lastRun') {
      aValue = a.lastRun === 'Never' ? 0 : new Date(a.lastRun).getTime()
      bValue = b.lastRun === 'Never' ? 0 : new Date(b.lastRun).getTime()
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-600" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-cyan-400" />
      : <ArrowDown className="h-4 w-4 text-cyan-400" />
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 75) return 'bg-cyan-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const formatLastRun = (lastRun: string) => {
    if (lastRun === 'Never') return 'Never'
    const date = new Date(lastRun)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-2">📦</div>
        <p className="text-gray-400">No repositories with pipeline data</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Repository Leaderboard</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('repoName')}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span>Repository</span>
                  {getSortIcon('repoName')}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('healthScore')}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span>Health Score</span>
                  {getSortIcon('healthScore')}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('totalRuns')}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span>Runs</span>
                  {getSortIcon('totalRuns')}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('successRate')}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span>Success Rate</span>
                  {getSortIcon('successRate')}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('lastRun')}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <span>Last Run</span>
                  {getSortIcon('lastRun')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((repo, index) => (
              <motion.tr
                key={repo.repoName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4">
                  <Link 
                    href={`/dashboard/repos/${repo.repoName}`}
                    className="text-white font-medium hover:text-cyan-400 transition-colors"
                  >
                    {repo.repoName}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthScoreColor(repo.healthScore)}`}
                        style={{ width: `${repo.healthScore}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {repo.healthScore.toFixed(0)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-300">{repo.totalRuns}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`font-medium ${
                    repo.successRate >= 90 ? 'text-green-400' :
                    repo.successRate >= 75 ? 'text-cyan-400' :
                    repo.successRate >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {repo.successRate.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-400 text-sm">
                    {formatLastRun(repo.lastRun)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

/**
 * A/B Testing Admin Dashboard
 * View experiment results and manage tests
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Play, 
  Pause, 
  Square, 
  TrendingUp,
  Users,
  Target,
  Award
} from 'lucide-react'
import { allExperiments } from '@/lib/ab-testing-experiments'
import { abTesting } from '@/lib/ab-testing'

export default function ABTestingDashboard() {
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null)
  const [results, setResults] = useState<any[]>([])

  // Load results when experiment is selected
  useEffect(() => {
    if (selectedExperiment) {
      try {
        const experimentResults = abTesting.getResults(selectedExperiment)
        setResults(experimentResults)
      } catch (error) {
        console.error('Failed to load results:', error)
        setResults([])
      }
    }
  }, [selectedExperiment])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">A/B Testing Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Manage experiments and view results
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Play className="w-4 h-4" />
          New Experiment
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active Experiments</span>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">
            {allExperiments.filter(e => e.status === 'running').length}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Users</span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-gray-500">Across all experiments</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Conversions</span>
            <Target className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-gray-500">Total conversions tracked</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Avg. Confidence</span>
            <Award className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-gray-500">Statistical significance</p>
        </div>
      </div>

      {/* Experiments List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Experiments
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {allExperiments.map((experiment) => (
              <div
                key={experiment.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedExperiment === experiment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:border-blue-300'
                }`}
                onClick={() => setSelectedExperiment(experiment.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{experiment.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      experiment.status === 'running' ? 'bg-green-100 text-green-800' :
                      experiment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {experiment.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 border rounded hover:bg-gray-50">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 border rounded hover:bg-gray-50">
                      <Pause className="w-4 h-4" />
                    </button>
                    <button className="p-2 border rounded hover:bg-gray-50">
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {experiment.description}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    Traffic: {experiment.trafficPercentage}%
                  </span>
                  <span className="text-gray-500">
                    Variants: {experiment.variants.length}
                  </span>
                  <span className="text-gray-500">
                    Goals: {experiment.goals.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Panel */}
      {selectedExperiment && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Results: {allExperiments.find(e => e.id === selectedExperiment)?.name}
            </h2>
          </div>
          <div className="p-6">
            {results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result, index) => {
                  const variant = allExperiments
                    .find(e => e.id === selectedExperiment)
                    ?.variants.find(v => v.id === result.variantId)

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{variant?.name || result.variantId}</span>
                        <span className="text-sm text-gray-500">
                          {result.totalUsers} users
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(result.conversionRate * 100, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Conversion Rate: {(result.conversionRate * 100).toFixed(2)}%
                        </span>
                        <span className="text-gray-500">
                          Conversions: {result.conversions}
                        </span>
                        {result.confidence && (
                          <span className="px-2 py-1 text-xs border rounded">
                            Confidence: {(result.confidence * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Winner Announcement */}
                {results.length >= 2 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <Award className="w-5 h-5" />
                      <span className="font-semibold">
                        Leading Variant: {
                          results.reduce((max, r) => 
                            r.conversionRate > max.conversionRate ? r : max
                          , results[0]).variantId
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No data yet. Start the experiment to collect results.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

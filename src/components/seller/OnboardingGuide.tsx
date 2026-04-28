'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, CheckCircle, Circle, X, HelpCircle, ArrowRight } from 'lucide-react'

type Task = {
  id: string
  title: string
  description: string
  completed: boolean
  action?: () => void
}

type OnboardingGuideProps = {
  onClose: () => void
}

export default function OnboardingGuide({ onClose }: OnboardingGuideProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'complete_profile',
      title: 'Complete Your Profile',
      description: 'Add your company information, logo, and contact details to build trust with buyers.',
      completed: false,
    },
    {
      id: 'add_first_product',
      title: 'Add Your First Product',
      description: 'Create your first product listing with images, description, and pricing.',
      completed: false,
    },
    {
      id: 'upload_brochure',
      title: 'Upload Product Brochure',
      description: 'Add a PDF brochure to provide detailed product information to potential buyers.',
      completed: false,
    },
    {
      id: 'customize_store',
      title: 'Customize Your Store',
      description: 'Choose your booth theme color and layout to make your store stand out.',
      completed: false,
    },
    {
      id: 'publish_products',
      title: 'Publish All Products',
      description: 'Make sure all your products are published and visible to buyers.',
      completed: false,
    },
  ])

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('seller_onboarding_progress')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setTasks(prevTasks => 
        prevTasks.map(task => ({
          ...task,
          completed: progress[task.id] || false
        }))
      )
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    const progress = tasks.reduce((acc, task) => {
      acc[task.id] = task.completed
      return acc
    }, {} as Record<string, boolean>)
    localStorage.setItem('seller_onboarding_progress', JSON.stringify(progress))
  }, [tasks])

  const markTaskComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    )
  }

  const handleNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1)
    }
  }

  const currentTask = tasks[currentTaskIndex]
  const completedCount = tasks.filter(t => t.completed).length
  const progress = (completedCount / tasks.length) * 100

  if (!isExpanded) {
    return (
      <div className="fixed left-4 bottom-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed left-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Getting Started Guide</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-white hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm opacity-90">
          {completedCount} of {tasks.length} tasks completed
        </div>
        <div className="mt-2 bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              index === currentTaskIndex
                ? 'border-blue-500 bg-blue-50'
                : task.completed
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setCurrentTaskIndex(index)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : index === currentTaskIndex ? (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${
                  task.completed ? 'text-green-900 line-through' : 'text-gray-900'
                }`}>
                  {task.title}
                </h4>
                {index === currentTaskIndex && (
                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentTaskIndex === 0}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentTask.completed ? (
            <span className="text-green-600 text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Completed
            </span>
          ) : (
            <button
              onClick={() => markTaskComplete(currentTask.id)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center"
            >
              Mark Complete
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={currentTaskIndex === tasks.length - 1}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        
        {completedCount === tasks.length && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-800 font-medium">🎉 Congratulations!</p>
            <p className="text-xs text-green-700 mt-1">You've completed all onboarding tasks.</p>
          </div>
        )}
      </div>
    </div>
  )
}

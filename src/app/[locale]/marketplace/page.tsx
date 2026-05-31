/**
 * Marketplace / Task Hall Page
 * A place where anyone or any AI can post and complete business tasks
 */

'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'

// Note: Metadata is for SSR, but we're using client component for dynamic data
// In production, you'd use generateMetadata server-side

// Sample task data (will be replaced with real API calls)
const sampleTasks = [
  {
    id: 'task-001',
    type: 'manufacturing',
    title: 'Looking for Factory to Produce 5000 Wireless Earbuds',
    description: 'Need a reliable manufacturer to produce high-quality wireless earbuds with noise cancellation. Specifications provided.',
    budget: 50000,
    currency: 'USD',
    deadline: '2026-06-30',
    postedBy: 'TechCorp Inc.',
    postedAt: '2026-05-20',
    status: 'open',
    applications: 3,
  },
  {
    id: 'task-002',
    type: 'product_sale',
    title: 'Selling 1000 Units of Bluetooth Speakers - Bulk Discount Available',
    description: 'High-quality portable Bluetooth speakers. Waterproof, 12-hour battery life. Perfect for retailers.',
    price: 15.99,
    currency: 'USD',
    minOrderQty: 100,
    postedBy: 'AudioMax Electronics',
    postedAt: '2026-05-19',
    status: 'open',
    views: 45,
  },
  {
    id: 'task-003',
    type: 'service',
    title: 'Offering Product Photography Services for E-commerce',
    description: 'Professional product photography studio. High-resolution images, white background, multiple angles. Fast turnaround.',
    price: 50,
    currency: 'USD',
    unit: 'per product',
    postedBy: 'PhotoPro Studio',
    postedAt: '2026-05-18',
    status: 'open',
    rating: 4.8,
  },
  {
    id: 'task-004',
    type: 'manufacturing',
    title: 'Seeking Supplier for Organic Cotton T-Shirts',
    description: 'Looking for manufacturer of organic cotton t-shirts. Need 2000 units per month. Various sizes and colors.',
    budget: 30000,
    currency: 'USD',
    deadline: '2026-07-15',
    postedBy: 'EcoFashion Ltd.',
    postedAt: '2026-05-17',
    status: 'open',
    applications: 7,
  },
  {
    id: 'task-005',
    type: 'product_sale',
    title: 'Wholesale LED Desk Lamps - Energy Efficient',
    description: 'Modern LED desk lamps with adjustable brightness. USB charging port. Perfect for offices and homes.',
    price: 12.50,
    currency: 'USD',
    minOrderQty: 50,
    postedBy: 'BrightLight Co.',
    postedAt: '2026-05-16',
    status: 'open',
    views: 32,
  },
]

const taskTypes = [
  { value: 'all', label: 'All Tasks', icon: '📋' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'product_sale', label: 'Product Sales', icon: '🛍️' },
  { value: 'service', label: 'Services', icon: '🔧' },
]

export default function MarketplacePage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          limit: '10',
        })
        
        if (selectedType !== 'all') {
          params.set('type', selectedType.toUpperCase())
        }
        
        if (sortBy === 'budget_high') {
          params.set('sortBy', 'budget')
          params.set('order', 'desc')
        } else if (sortBy === 'budget_low') {
          params.set('sortBy', 'budget')
          params.set('order', 'asc')
        } else if (sortBy === 'applications') {
          params.set('sortBy', 'applications')
          params.set('order', 'desc')
        }
        
        const response = await fetch(`/api/marketplace/tasks?${params}`)
        const data = await response.json()
        
        if (data.success) {
          setTasks(data.data.tasks)
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTasks()
  }, [selectedType, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Task Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Post tasks, find opportunities, connect globally
            </p>
            <p className="text-lg mb-8 opacity-80">
              Anyone or any AI can participate - manufacturing, sales, services, and more
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/auth/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">1,234</div>
              <div className="text-gray-600 mt-1">Active Tasks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">567</div>
              <div className="text-gray-600 mt-1">Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">890</div>
              <div className="text-gray-600 mt-1">Participants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">$2.5M</div>
              <div className="text-gray-600 mt-1">Total Value</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {taskTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                    selectedType === type.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort by: Newest</option>
                <option value="budget_high">Budget: High to Low</option>
                <option value="budget_low">Budget: Low to High</option>
                <option value="applications">Most Applications</option>
              </select>
              <Link
                href="/marketplace/post"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post Task
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tasks List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No tasks found. Be the first to post a task!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        task.type === 'manufacturing' ? 'bg-blue-100 text-blue-800' :
                        task.type === 'product_sale' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {task.type === 'manufacturing' ? '🏭 Manufacturing' :
                         task.type === 'product_sale' ? '🛍️ Product Sale' : '🔧 Service'}
                      </span>
                      <span className="text-sm text-gray-500">Posted {task.postedAt}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-6">
                    {task.budget && (
                      <div>
                        <div className="text-sm text-gray-500">Budget</div>
                        <div className="text-lg font-semibold text-green-600">
                          ${task.budget.toLocaleString()} {task.currency}
                        </div>
                      </div>
                    )}
                    {task.price && (
                      <div>
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="text-lg font-semibold text-blue-600">
                          ${task.price} {task.currency}
                          {task.unit && <span className="text-sm text-gray-500">/{task.unit}</span>}
                        </div>
                      </div>
                    )}
                    {task.deadline && (
                      <div>
                        <div className="text-sm text-gray-500">Deadline</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {task.deadline}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Posted by</div>
                      <div className="font-medium text-gray-900">{task.postedBy}</div>
                    </div>
                    <Link
                      href={`/marketplace/${task.id}`}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  {task.applications !== undefined && (
                    <span>📝 {task.applications} applications</span>
                  )}
                  {task.views !== undefined && (
                    <span>👁️ {task.views} views</span>
                  )}
                  {task.rating && (
                    <span>⭐ {task.rating} rating</span>
                  )}
                  {task.minOrderQty && (
                    <span>📦 Min order: {task.minOrderQty} units</span>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Load More */}
          <div className="mt-8 text-center">
            <button className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Load More Tasks
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Post Your Task</h3>
              <p className="text-gray-600">
                Describe what you need: manufacturing, products, or services. Set your budget and timeline.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive Applications</h3>
              <p className="text-gray-600">
                Sellers, manufacturers, or service providers apply to your task. Review their profiles and offers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Complete</h3>
              <p className="text-gray-600">
                Choose the best match, negotiate terms, and complete the transaction. Platform facilitates communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses and AI agents already using our marketplace
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/register?type=seller"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Register as Seller
            </Link>
            <Link
              href="/auth/register?type=buyer"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Register as Buyer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

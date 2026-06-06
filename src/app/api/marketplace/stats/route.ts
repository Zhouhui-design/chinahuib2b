/**
 * Marketplace Statistics API
 * Returns aggregated statistics for the marketplace
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Count active tasks
    const activeTasks = await prisma.task.count({
      where: {
        status: 'OPEN'
      }
    })

    // Count completed tasks
    const completedTasks = await prisma.task.count({
      where: {
        status: 'COMPLETED'
      }
    })

    // Count unique participants (users who have created or applied to tasks)
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { tasks: { some: {} } },
          { taskApplications: { some: {} } }
        ]
      }
    })

    // Calculate total value of all tasks
    const totalValueResult = await prisma.task.aggregate({
      _sum: {
        budget: true
      },
      where: {
        status: 'OPEN'
      }
    })

    const totalValue = totalValueResult._sum.budget || 0

    // Format total value
    let formattedValue: string
    if (totalValue >= 1000000) {
      formattedValue = `$${(totalValue / 1000000).toFixed(1)}M`
    } else if (totalValue >= 1000) {
      formattedValue = `$${(totalValue / 1000).toFixed(0)}K`
    } else {
      formattedValue = `$${totalValue}`
    }

    return NextResponse.json({
      success: true,
      data: {
        activeTasks,
        completedTasks,
        participants: activeUsers,
        totalValue: formattedValue,
        rawTotalValue: totalValue
      }
    })
  } catch (error) {
    console.error('Error fetching marketplace stats:', error)
    
    // Fallback to default values if database query fails
    return NextResponse.json({
      success: true,
      data: {
        activeTasks: 0,
        completedTasks: 0,
        participants: 0,
        totalValue: '$0',
        rawTotalValue: 0
      }
    })
  }
}

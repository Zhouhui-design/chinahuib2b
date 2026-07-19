#!/usr/bin/env ts-node

import { loadEnvConfig } from '@next/env'
import { PrismaClient } from '@prisma/client'
import { sendMaintenanceNotification } from '../src/lib/email-service'

loadEnvConfig(process.cwd())

const prisma = new PrismaClient()

async function getAllUserEmails(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { email: { not: '' } },
    select: { email: true },
  })
  return users.map(u => u.email!).filter(Boolean)
}

async function createMaintenanceNotice(title: string, content: string, estimatedDuration: number = 30) {
  const notice = await prisma.maintenanceNotice.create({
    data: {
      title,
      content,
      status: 'PENDING',
      estimatedDuration,
      scheduledStart: new Date(),
    },
  })

  const emails = await getAllUserEmails()
  
  if (emails.length > 0) {
    const result = await sendMaintenanceNotification(emails, title, content)
    console.log(`邮件通知发送结果: ${result.success ? '成功' : '失败'} - ${result.message}`)
    
    await prisma.maintenanceNotice.update({
      where: { id: notice.id },
      data: { notifiedUsers: emails.length },
    })
  }

  return notice
}

async function startMaintenance(noticeId: string) {
  const notice = await prisma.maintenanceNotice.update({
    where: { id: noticeId },
    data: { 
      status: 'IN_PROGRESS',
      scheduledStart: new Date(),
    },
  })
  return notice
}

async function completeMaintenance(noticeId: string, updateContent: string) {
  const notice = await prisma.maintenanceNotice.update({
    where: { id: noticeId },
    data: { 
      status: 'COMPLETED',
      actualEndTime: new Date(),
      content: updateContent,
    },
  })

  const emails = await getAllUserEmails()
  
  if (emails.length > 0) {
    const result = await sendMaintenanceNotification(emails, `更新完成: ${notice.title}`, updateContent)
    console.log(`更新内容推送结果: ${result.success ? '成功' : '失败'} - ${result.message}`)
  }

  return notice
}

async function listNotices() {
  const notices = await prisma.maintenanceNotice.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  
  console.log('\n=== 维护通知列表 ===')
  notices.forEach(n => {
    console.log(`ID: ${n.id}`)
    console.log(`标题: ${n.title}`)
    console.log(`状态: ${n.status}`)
    console.log(`预计时长: ${n.estimatedDuration}分钟`)
    console.log(`通知用户数: ${n.notifiedUsers}`)
    console.log(`创建时间: ${new Date(n.createdAt).toLocaleString('zh-CN')}`)
    console.log('---')
  })
}

async function main() {
  const action = process.argv[2]

  try {
    switch (action) {
      case 'create': {
        const title = process.argv[3] || '系统维护通知'
        const content = process.argv[4] || '系统即将进行维护，请提前保存您的工作。'
        const duration = parseInt(process.argv[5] || '30') || 30
        
        console.log(`创建维护通知: ${title}`)
        const notice = await createMaintenanceNotice(title, content, duration)
        console.log(`通知创建成功，ID: ${notice.id}`)
        break
      }

      case 'start': {
        const noticeId = process.argv[3]
        if (!noticeId) {
          console.error('请提供通知ID')
          process.exit(1)
        }
        
        const notice = await startMaintenance(noticeId)
        console.log(`维护已开始: ${notice.title}`)
        break
      }

      case 'complete': {
        const noticeId = process.argv[3]
        const updateContent = process.argv[4] || '系统更新已完成，感谢您的耐心等待。'
        
        if (!noticeId) {
          console.error('请提供通知ID')
          process.exit(1)
        }
        
        const notice = await completeMaintenance(noticeId, updateContent)
        console.log(`维护已完成: ${notice.title}`)
        break
      }

      case 'list': {
        await listNotices()
        break
      }

      default: {
        console.log('用法:')
        console.log('  npm run maintenance create <标题> <内容> [时长(分钟)]')
        console.log('  npm run maintenance start <通知ID>')
        console.log('  npm run maintenance complete <通知ID> <更新内容>')
        console.log('  npm run maintenance list')
      }
    }
  } catch (error) {
    console.error('错误:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
#!/usr/bin/env tsx

import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

import { sendEmail, verifyEmailConnection } from '../src/lib/email-service'

async function main() {
  console.log('=== 邮件服务测试 ===\n')
  
  console.log('API Key配置:', process.env.RESEND_API_KEY ? '已配置' : '未配置')
  console.log('API Key长度:', process.env.RESEND_API_KEY?.length || 0)
  
  console.log('\n1. 发送测试邮件...')
  const result = await sendEmail(
    '1994169577@qq.com',
    '系统测试邮件 - Global Expo',
    '这是一封测试邮件，用于验证邮件发送功能是否正常工作。\n\n测试时间: ' + new Date().toLocaleString('zh-CN')
  )
  
  console.log(result.success ? '✅ 邮件发送成功' : '❌ 邮件发送失败')
  console.log('消息:', result.message)
  
  console.log('\n=== 测试完成 ===')
}

main()
/**
 * AI合规检查器
 * 
 * 验证AI的行为是否符合隐私保护和社区规则
 */

export interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    type: 'human' | 'ai'
  }
  channelType: 'public' | 'community' | 'private'
  metadata?: {
    isAI?: boolean
    aiModel?: string
    generatedAt?: Date
    privacyCompliant?: boolean
  }
  timestamp: Date
}

export interface ComplianceResult {
  compliant: boolean
  violations: string[]
  severity: 'none' | 'warning' | 'critical'
  recommendations: string[]
}

/**
 * 检查AI消息的合规性
 */
export function checkAICompliance(message: Message): ComplianceResult {
  const violations: string[] = []
  const recommendations: string[] = []
  
  // 只对AI消息进行检查
  if (message.sender.type !== 'ai') {
    return {
      compliant: true,
      violations: [],
      severity: 'none',
      recommendations: [],
    }
  }
  
  // ========== 检查1: AI是否标识了身份 ==========
  if (!message.metadata?.isAI) {
    violations.push('AI identity not disclosed in message metadata')
    recommendations.push('Set metadata.isAI = true for all AI-generated messages')
  }
  
  // 检查消息内容是否包含AI标识文本
  const hasIdentityMarker = /AI|人工智能|artificial intelligence/i.test(message.content)
  if (!hasIdentityMarker && !message.metadata?.isAI) {
    violations.push('Message content does not indicate AI authorship')
    recommendations.push('Include "AI Assistant" or similar marker in message content')
  }
  
  // ========== 检查2: AI是否尝试访问私人对话 ==========
  if (message.channelType === 'private') {
    violations.push('CRITICAL: AI attempting to access private chat - STRICTLY PROHIBITED')
    recommendations.push('AI must only participate in public and community channels')
    return {
      compliant: false,
      violations,
      severity: 'critical',
      recommendations,
    }
  }
  
  // ========== 检查3: 是否包含个人数据 ==========
  const personalDataPatterns = detectPersonalData(message.content)
  if (personalDataPatterns.length > 0) {
    violations.push(`Message contains personal data: ${personalDataPatterns.join(', ')}`)
    recommendations.push('Remove or anonymize personal data before sending')
  }
  
  // ========== 检查4: 隐私合规标记 ==========
  if (!message.metadata?.privacyCompliant) {
    violations.push('Privacy compliance flag not set')
    recommendations.push('Verify message complies with privacy policy before sending')
  }
  
  // ========== 确定严重程度 ==========
  let severity: 'none' | 'warning' | 'critical' = 'none'
  if (violations.some(v => v.includes('CRITICAL'))) {
    severity = 'critical'
  } else if (violations.length > 0) {
    severity = 'warning'
  }
  
  return {
    compliant: violations.length === 0,
    violations,
    severity,
    recommendations,
  }
}

/**
 * 检测文本中的个人数据模式
 */
function detectPersonalData(text: string): string[] {
  const patterns: Array<{ name: string; regex: RegExp }> = [
    { name: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ },
    { name: 'phone', regex: /\b(\+?86)?\s*1[3-9]\d{9}\b/ }, // 中国手机号
    { name: 'phone_international', regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/ },
    { name: 'id_card', regex: /\b\d{17}[\dXx]\b/ }, // 中国身份证
    { name: 'ip_address', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/ },
    { name: 'credit_card', regex: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/ },
  ]
  
  const detected: string[] = []
  
  patterns.forEach(({ name, regex }) => {
    if (regex.test(text)) {
      detected.push(name)
    }
  })
  
  return detected
}

/**
 * 脱敏处理文本中的个人数据
 */
export function anonymizePersonalData(text: string): string {
  // 邮箱脱敏
  text = text.replace(
    /\b([A-Za-z0-9._%+-]{1,3})[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g,
    '$1***@$2'
  )
  
  // 手机号脱敏
  text = text.replace(
    /\b(\+?86)?\s*(1[3-9])\d{3}(\d{4})\b/g,
    '$1$2****$3'
  )
  
  // IP地址脱敏
  text = text.replace(
    /\b(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}\b/g,
    '$1.$2.*.*'
  )
  
  return text
}

/**
 * 验证AI是否可以访问指定频道
 */
export function canAIAccessChannel(channelType: 'public' | 'community' | 'private'): {
  allowed: boolean
  reason: string
} {
  switch (channelType) {
    case 'public':
      return {
        allowed: true,
        reason: 'AI can access public channels',
      }
    case 'community':
      return {
        allowed: true,
        reason: 'AI can access community discussions with proper identification',
      }
    case 'private':
      return {
        allowed: false,
        reason: 'AI is strictly prohibited from accessing private conversations',
      }
    default:
      return {
        allowed: false,
        reason: 'Unknown channel type',
      }
  }
}

/**
 * 生成合规报告
 */
export function generateComplianceReport(
  checks: Array<{ name: string; result: ComplianceResult }>
): string {
  const lines: string[] = [
    '# AI Compliance Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `Total Checks: ${checks.length}`,
    `Passed: ${checks.filter(c => c.result.compliant).length}`,
    `Failed: ${checks.filter(c => !c.result.compliant).length}`,
    '',
  ]
  
  checks.forEach(({ name, result }) => {
    lines.push(`## ${name}`)
    lines.push('')
    lines.push(`Status: ${result.compliant ? '✅ PASS' : '❌ FAIL'}`)
    lines.push(`Severity: ${result.severity}`)
    
    if (result.violations.length > 0) {
      lines.push('')
      lines.push('Violations:')
      result.violations.forEach(v => lines.push(`- ${v}`))
    }
    
    if (result.recommendations.length > 0) {
      lines.push('')
      lines.push('Recommendations:')
      result.recommendations.forEach(r => lines.push(`- ${r}`))
    }
    
    lines.push('')
  })
  
  return lines.join('\n')
}

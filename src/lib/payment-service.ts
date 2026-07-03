import { prisma } from '@/lib/db'

export interface PaymentConfig {
  enabled: boolean
  feeRate: number
  minFee: number
  qrCodeWeChat: string
  qrCodeAlipay: string
  qrCodePaypal: string
  bankAccount: string
  bankName: string
  bankSwift: string
}

export interface ServiceFeeResult {
  baseAmount: number
  feeRate: number
  calculatedFee: number
  finalFee: number
  minFee: number
  currency: string
}

const DEFAULT_CONFIG: PaymentConfig = {
  enabled: true,
  feeRate: 0.0001,
  minFee: 0.01,
  qrCodeWeChat: '',
  qrCodeAlipay: '',
  qrCodePaypal: '',
  bankAccount: '',
  bankName: '',
  bankSwift: ''
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: 'payment_config' }
  })

  if (!setting) {
    await prisma.systemSetting.create({
      data: {
        key: 'payment_config',
        value: DEFAULT_CONFIG as any,
        description: '平台收款配置'
      }
    })
    return DEFAULT_CONFIG
  }

  return { ...DEFAULT_CONFIG, ...(setting.value as unknown as PaymentConfig) }
}

export async function updatePaymentConfig(config: Partial<PaymentConfig>): Promise<PaymentConfig> {
  const currentConfig = await getPaymentConfig()
  const updatedConfig = { ...currentConfig, ...config }

  await prisma.systemSetting.upsert({
    where: { key: 'payment_config' },
    update: { value: updatedConfig as any },
    create: {
      key: 'payment_config',
      value: updatedConfig as any,
      description: '平台收款配置'
    }
  })

  return updatedConfig
}

export function calculateServiceFee(amount: number, config?: PaymentConfig): ServiceFeeResult {
  const paymentConfig = config || DEFAULT_CONFIG
  
  const calculatedFee = amount * paymentConfig.feeRate
  const finalFee = Math.max(calculatedFee, paymentConfig.minFee)

  return {
    baseAmount: amount,
    feeRate: paymentConfig.feeRate,
    calculatedFee: parseFloat(calculatedFee.toFixed(4)),
    finalFee: parseFloat(finalFee.toFixed(2)),
    minFee: paymentConfig.minFee,
    currency: 'USD'
  }
}

export function formatFeeMessage(result: ServiceFeeResult): string {
  if (result.calculatedFee < result.minFee) {
    return `💰 服务费计算：\n\n货款金额：$${result.baseAmount.toFixed(2)}\n服务费比例：${(result.feeRate * 10000).toFixed(0)}‱\n计算服务费：$${result.calculatedFee.toFixed(4)}\n\n⚠️ 因服务费低于最低收费标准，按最低收费 $${result.minFee.toFixed(2)} 收取\n\n总计应付：$${result.finalFee.toFixed(2)}`
  }
  
  return `💰 服务费计算：\n\n货款金额：$${result.baseAmount.toFixed(2)}\n服务费比例：${(result.feeRate * 10000).toFixed(0)}‱\n服务费：$${result.finalFee.toFixed(4)}\n\n总计应付：$${result.finalFee.toFixed(4)}`
}

export interface PaymentMethod {
  id: string
  name: string
  icon: string
  qrCode?: string
  details?: string
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const config = await getPaymentConfig()
  const methods: PaymentMethod[] = []

  if (config.qrCodeWeChat) {
    methods.push({
      id: 'wechat',
      name: '微信支付',
      icon: '💳',
      qrCode: config.qrCodeWeChat
    })
  }

  if (config.qrCodeAlipay) {
    methods.push({
      id: 'alipay',
      name: '支付宝',
      icon: '🔷',
      qrCode: config.qrCodeAlipay
    })
  }

  if (config.qrCodePaypal) {
    methods.push({
      id: 'paypal',
      name: 'PayPal',
      icon: '🌐',
      qrCode: config.qrCodePaypal
    })
  }

  if (config.bankAccount) {
    methods.push({
      id: 'bank',
      name: '银行转账',
      icon: '🏦',
      details: `${config.bankName}\n账户：${config.bankAccount}\nSWIFT：${config.bankSwift || '-'}`
    })
  }

  return methods
}
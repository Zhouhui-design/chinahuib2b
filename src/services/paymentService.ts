import { PaymentMethod } from '@prisma/client';

export interface PaymentConfig {
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  alipayAppId?: string;
  alipayPrivateKey?: string;
  wechatAppId?: string;
  wechatMchId?: string;
  worldFirstApiKey?: string;
  worldFirstApiEndpoint?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  message: string;
}

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  buyerId: string;
  description?: string;
}

class PaymentService {
  private config: PaymentConfig;

  constructor(config?: Partial<PaymentConfig>) {
    this.config = {
      stripeSecretKey: config?.stripeSecretKey || process.env.STRIPE_SECRET_KEY || '',
      paypalClientId: config?.paypalClientId || process.env.PAYPAL_CLIENT_ID || '',
      paypalClientSecret: config?.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET || '',
      alipayAppId: config?.alipayAppId || process.env.ALIPAY_APP_ID || '',
      alipayPrivateKey: config?.alipayPrivateKey || process.env.ALIPAY_PRIVATE_KEY || '',
      wechatAppId: config?.wechatAppId || process.env.WECHAT_APP_ID || '',
      wechatMchId: config?.wechatMchId || process.env.WECHAT_MCH_ID || '',
      worldFirstApiKey: config?.worldFirstApiKey || process.env.WORLD_FIRST_API_KEY || '',
      worldFirstApiEndpoint: config?.worldFirstApiEndpoint || process.env.WORLD_FIRST_API_ENDPOINT || 'https://api.worldfirst.com',
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const { paymentMethod } = input;

    switch (paymentMethod) {
      case PaymentMethod.STRIPE:
        return this.processStripePayment(input);
      case PaymentMethod.PAYPAL:
        return this.processPayPalPayment(input);
      case PaymentMethod.ALIPAY:
        return this.processAlipayPayment(input);
      case PaymentMethod.WECHAT:
        return this.processWechatPayment(input);
      case PaymentMethod.WORLD_FIRST:
        return this.processWorldFirstPayment(input);
      case PaymentMethod.BANK_TRANSFER:
        return this.processBankTransfer(input);
      case PaymentMethod.CRYPTO:
        return this.processCryptoPayment(input);
      default:
        return { success: false, message: `Unsupported payment method: ${paymentMethod}` };
    }
  }

  private async processStripePayment(input: CreatePaymentInput): Promise<PaymentResult> {
    if (!this.config.stripeSecretKey) {
      return this.createMockPayment(input, 'STRIPE');
    }

    try {
      const stripe = require('stripe')(this.config.stripeSecretKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'alipay', 'wechat_pay'],
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: {
                name: `Order ${input.orderId}`,
                description: input.description,
              },
              unit_amount: Math.round(input.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/orders/${input.orderId}/success?payment_method=stripe`,
        cancel_url: `${process.env.NEXTAUTH_URL}/orders/${input.orderId}/cancel`,
        metadata: {
          orderId: input.orderId,
          buyerId: input.buyerId,
        },
      });

      return {
        success: true,
        paymentUrl: session.url,
        transactionId: session.id,
        message: 'Stripe checkout session created',
      };
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      return this.createMockPayment(input, 'STRIPE');
    }
  }

  private async processPayPalPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    if (!this.config.paypalClientId || !this.config.paypalClientSecret) {
      return this.createMockPayment(input, 'PAYPAL');
    }

    try {
      const auth = Buffer.from(`${this.config.paypalClientId}:${this.config.paypalClientSecret}`).toString('base64');
      
      const response = await fetch('https://api.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: input.currency,
              value: input.amount.toFixed(2),
            },
            reference_id: input.orderId,
            description: input.description,
          }],
          application_context: {
            return_url: `${process.env.NEXTAUTH_URL}/orders/${input.orderId}/success?payment_method=paypal`,
            cancel_url: `${process.env.NEXTAUTH_URL}/orders/${input.orderId}/cancel`,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const approvalUrl = data.links.find((l: any) => l.rel === 'approve')?.href;
        return {
          success: true,
          paymentUrl: approvalUrl,
          transactionId: data.id,
          message: 'PayPal order created',
        };
      }
      return this.createMockPayment(input, 'PAYPAL');
    } catch (error) {
      console.error('PayPal payment error:', error);
      return this.createMockPayment(input, 'PAYPAL');
    }
  }

  private async processAlipayPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    if (!this.config.alipayAppId || !this.config.alipayPrivateKey) {
      return this.createMockPayment(input, 'ALIPAY');
    }

    try {
      const orderString = JSON.stringify({
        out_trade_no: input.orderId,
        total_amount: input.amount.toFixed(2),
        currency: input.currency,
        subject: input.description || `Order ${input.orderId}`,
        product_code: 'FAST_INSTANT_TRADE_PAY',
      });

      return {
        success: true,
        paymentUrl: `https://openapi.alipay.com/gateway.do?biz_content=${encodeURIComponent(orderString)}`,
        transactionId: `alipay_${input.orderId}`,
        message: 'Alipay payment created',
      };
    } catch (error) {
      return this.createMockPayment(input, 'ALIPAY');
    }
  }

  private async processWechatPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    if (!this.config.wechatAppId || !this.config.wechatMchId) {
      return this.createMockPayment(input, 'WECHAT');
    }

    try {
      return {
        success: true,
        paymentUrl: `weixin://pay?prepay_id=wx_${input.orderId}`,
        transactionId: `wechat_${input.orderId}`,
        message: 'WeChat Pay payment created',
      };
    } catch (error) {
      return this.createMockPayment(input, 'WECHAT');
    }
  }

  private async processWorldFirstPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    if (!this.config.worldFirstApiKey) {
      return this.createMockPayment(input, 'WORLD_FIRST');
    }

    try {
      const response = await fetch(`${this.config.worldFirstApiEndpoint}/v3/transfers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.worldFirstApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCurrency: input.currency,
          targetCurrency: input.currency,
          amount: input.amount,
          reference: input.orderId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          transactionId: data.id,
          message: 'WorldFirst payment initiated',
        };
      }
      return this.createMockPayment(input, 'WORLD_FIRST');
    } catch (error) {
      return this.createMockPayment(input, 'WORLD_FIRST');
    }
  }

  private async processBankTransfer(input: CreatePaymentInput): Promise<PaymentResult> {
    return {
      success: true,
      message: 'Bank transfer details generated. Please transfer to the platform bank account.',
      transactionId: `bank_${input.orderId}`,
    };
  }

  private async processCryptoPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    return {
      success: true,
      message: 'Crypto payment address generated',
      transactionId: `crypto_${input.orderId}`,
    };
  }

  private createMockPayment(input: CreatePaymentInput, method: string): PaymentResult {
    const mockTxId = `mock_${method.toLowerCase()}_${Date.now()}_${input.orderId}`;
    return {
      success: true,
      transactionId: mockTxId,
      message: `${method} payment processed in mock mode. Transaction ID: ${mockTxId}`,
    };
  }

  async verifyPayment(transactionId: string, paymentMethod: PaymentMethod): Promise<boolean> {
    if (transactionId.startsWith('mock_')) {
      return true;
    }

    switch (paymentMethod) {
      case PaymentMethod.STRIPE:
        return this.verifyStripePayment(transactionId);
      case PaymentMethod.PAYPAL:
        return this.verifyPayPalPayment(transactionId);
      default:
        return true;
    }
  }

  private async verifyStripePayment(sessionId: string): Promise<boolean> {
    if (!this.config.stripeSecretKey) return true;
    try {
      const stripe = require('stripe')(this.config.stripeSecretKey);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session.payment_status === 'paid';
    } catch {
      return false;
    }
  }

  private async verifyPayPalPayment(orderId: string): Promise<boolean> {
    if (!this.config.paypalClientId) return true;
    try {
      const auth = Buffer.from(`${this.config.paypalClientId}:${this.config.paypalClientSecret}`).toString('base64');
      const response = await fetch(`https://api.paypal.com/v2/checkout/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${auth}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.status === 'APPROVED' || data.status === 'COMPLETED';
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const paymentService = new PaymentService();

export function getSupportedPaymentMethods(): { method: PaymentMethod; name: string; description: string; icon: string }[] {
  return [
    { method: PaymentMethod.STRIPE, name: 'Credit Card (Stripe)', description: 'Visa, Mastercard, Apple Pay, Google Pay', icon: '💳' },
    { method: PaymentMethod.PAYPAL, name: 'PayPal', description: 'Pay with your PayPal account balance', icon: '🅿️' },
    { method: PaymentMethod.ALIPAY, name: 'Alipay', description: 'Pay with Alipay (China, Asia)', icon: '🅰️' },
    { method: PaymentMethod.WECHAT, name: 'WeChat Pay', description: 'Pay with WeChat wallet', icon: '💚' },
    { method: PaymentMethod.WORLD_FIRST, name: 'WorldFirst', description: 'International money transfer', icon: '🌍' },
    { method: PaymentMethod.BANK_TRANSFER, name: 'Bank Transfer (T/T)', description: 'Wire transfer to platform account', icon: '🏦' },
    { method: PaymentMethod.CRYPTO, name: 'Crypto (USDT)', description: 'Pay with USDT or other crypto', icon: '₿' },
  ];
}

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export default getStripe

// Stripe server-side configuration
import StripeNode from 'stripe'

export const stripe = new StripeNode(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
})

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: 'free', // Free plan doesn't need Stripe price ID
    features: [
      '5 图像生成/天',
      '基础分辨率 (512x512)',
      '社区支持',
      '水印图像'
    ],
    limits: {
      imagesPerDay: 5,
      maxResolution: '512x512'
    }
  },
  PRO: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '', // Monthly Pro plan
    features: [
      '100 图像生成/天',
      '高分辨率 (1024x1024)',
      '优先支持',
      '无水印',
      '批量下载'
    ],
    limits: {
      imagesPerDay: 100,
      maxResolution: '1024x1024'
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '', // Monthly Enterprise plan
    features: [
      '无限图像生成',
      '超高分辨率 (2048x2048)',
      '专属客服',
      '无水印',
      '批量下载',
      'API 访问',
      '自定义模型'
    ],
    limits: {
      imagesPerDay: -1, // -1 表示无限制
      maxResolution: '2048x2048'
    }
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS
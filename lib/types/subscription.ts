export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'

export interface UserSubscription {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: SubscriptionStatus
  plan: SubscriptionPlan
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface PaymentHistory {
  id: string
  user_id: string
  stripe_payment_intent_id?: string
  amount: number
  currency: string
  status: string
  plan: SubscriptionPlan
  created_at: string
}

export interface UsageTracking {
  id: string
  user_id: string
  date: string
  images_generated: number
  created_at: string
  updated_at: string
}

export interface UserSubscriptionInfo {
  subscription_plan: string
  subscription_status: string
  current_period_end?: string
  images_used_today: number
  images_limit: number
}

export interface SubscriptionLimits {
  imagesPerDay: number
  maxResolution: string
}

export interface SubscriptionFeatures {
  name: string
  price: number
  priceId: string
  features: string[]
  limits: SubscriptionLimits
}
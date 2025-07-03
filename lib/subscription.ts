import { createClient } from '@/lib/supabase/server'
import { UserSubscriptionInfo, SubscriptionPlan } from '@/lib/types/subscription'

export async function getUserSubscription(userId: string): Promise<UserSubscriptionInfo | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.rpc('get_user_subscription', {
      user_uuid: userId
    })

    if (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Error in getUserSubscription:', error)
    return null
  }
}

export async function createOrUpdateSubscription(
  userId: string,
  subscriptionData: {
    stripe_customer_id?: string
    stripe_subscription_id?: string
    status: string
    plan: SubscriptionPlan
    current_period_start?: string
    current_period_end?: string
  }
) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        ...subscriptionData,
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error creating/updating subscription:', error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Error in createOrUpdateSubscription:', error)
    return null
  }
}

export async function incrementUserUsage(userId: string, increment: number = 1): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.rpc('increment_usage', {
      user_uuid: userId,
      increment_by: increment
    })

    if (error) {
      console.error('Error incrementing usage:', error)
      return false
    }

    return data === true
  } catch (error) {
    console.error('Error in incrementUserUsage:', error)
    return false
  }
}

export async function createPaymentRecord(
  userId: string,
  paymentData: {
    stripe_payment_intent_id?: string
    amount: number
    currency: string
    status: string
    plan: SubscriptionPlan
  }
) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('payment_history')
      .insert({
        user_id: userId,
        ...paymentData
      })
      .select()

    if (error) {
      console.error('Error creating payment record:', error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error('Error in createPaymentRecord:', error)
    return null
  }
}

export function canUserGenerate(subscriptionInfo: UserSubscriptionInfo): boolean {
  if (subscriptionInfo.subscription_status !== 'active') {
    return false
  }

  // 企业版无限制
  if (subscriptionInfo.images_limit === -1) {
    return true
  }

  // 检查是否超过限制
  return subscriptionInfo.images_used_today < subscriptionInfo.images_limit
}

export function getRemainingGenerations(subscriptionInfo: UserSubscriptionInfo): number {
  if (subscriptionInfo.images_limit === -1) {
    return -1 // 无限制
  }

  return Math.max(0, subscriptionInfo.images_limit - subscriptionInfo.images_used_today)
}
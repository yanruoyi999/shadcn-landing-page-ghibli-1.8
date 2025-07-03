"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserSubscriptionInfo } from '@/lib/types/subscription'
import { User } from '@supabase/supabase-js'

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscriptionInfo | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_subscription', {
        user_uuid: userId
      })

      if (error) {
        throw error
      }

      setSubscription(data?.[0] || null)
    } catch (err) {
      console.error('获取订阅信息失败:', err)
      setError(err instanceof Error ? err.message : '获取订阅信息失败')
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          throw error
        }

        setUser(user)
        
        if (user) {
          await fetchSubscription(user.id)
        }
      } catch (err) {
        console.error('获取用户信息失败:', err)
        setError(err instanceof Error ? err.message : '获取用户信息失败')
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // 监听认证状态变化
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await fetchSubscription(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSubscription(null)
        }
        setLoading(false)
      }
    )

    return () => {
      authSubscription?.unsubscribe()
    }
  }, [])

  const refreshSubscription = async () => {
    if (user) {
      setLoading(true)
      await fetchSubscription(user.id)
      setLoading(false)
    }
  }

  const isSubscribed = (plan: string) => {
    if (!subscription) return false
    return subscription.subscription_plan === plan.toLowerCase() && 
           subscription.subscription_status === 'active'
  }

  const canGenerate = () => {
    if (!subscription) return false
    
    if (subscription.subscription_status !== 'active') {
      return false
    }

    // 企业版无限制
    if (subscription.images_limit === -1) {
      return true
    }

    // 检查是否超过限制
    return subscription.images_used_today < subscription.images_limit
  }

  const getRemainingGenerations = () => {
    if (!subscription) return 0
    
    if (subscription.images_limit === -1) {
      return -1 // 无限制
    }

    return Math.max(0, subscription.images_limit - subscription.images_used_today)
  }

  return {
    subscription,
    user,
    loading,
    error,
    refreshSubscription,
    isSubscribed,
    canGenerate,
    getRemainingGenerations,
  }
}
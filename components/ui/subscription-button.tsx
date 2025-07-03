"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface SubscriptionButtonProps {
  priceId: string
  plan: string
  buttonText: string
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
  className?: string
  disabled?: boolean
}

export function SubscriptionButton({ 
  priceId, 
  plan, 
  buttonText, 
  variant = "default",
  className,
  disabled = false
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubscription = async () => {
    try {
      setLoading(true)

      // 检查用户是否已登录
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('请先登录后再订阅')
        router.push('/login')
        return
      }

      // 免费计划不需要支付
      if (plan.toLowerCase() === 'free') {
        toast.success('您已经在免费计划中了！')
        return
      }

      // 创建checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          plan: plan.toUpperCase(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '创建支付会话失败')
      }

      // 重定向到Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('未收到支付URL')
      }

    } catch (error) {
      console.error('订阅失败:', error)
      toast.error(error instanceof Error ? error.message : '订阅失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      size="lg"
      onClick={handleSubscription}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          处理中...
        </>
      ) : (
        buttonText
      )}
    </Button>
  )
}
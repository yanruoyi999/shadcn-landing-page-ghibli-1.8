"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import Link from 'next/link'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { subscription, refreshSubscription } = useSubscription()

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('缺少会话ID')
        setLoading(false)
        return
      }

      try {
        // 刷新订阅信息
        await refreshSubscription()
        setLoading(false)
      } catch (err) {
        console.error('验证支付会话失败:', err)
        setError('验证支付状态失败')
        setLoading(false)
      }
    }

    verifySession()
  }, [sessionId, refreshSubscription])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                正在验证您的支付状态...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">支付验证失败</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                返回
              </Button>
              <Button onClick={() => router.push('/pricing')} className="flex-1">
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950">
      <Card className="w-full max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
              支付成功！
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              欢迎加入 Ghibli AI {subscription?.subscription_plan?.toUpperCase()} 计划
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">您的订阅详情</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>计划:</span>
                <span className="font-medium capitalize">
                  {subscription?.subscription_plan || '加载中...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>状态:</span>
                <span className="font-medium text-green-600">
                  {subscription?.subscription_status === 'active' ? '已激活' : '处理中'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>每日图像生成限制:</span>
                <span className="font-medium">
                  {subscription?.images_limit === -1 ? '无限制' : subscription?.images_limit || '加载中...'}
                </span>
              </div>
              {subscription?.current_period_end && (
                <div className="flex justify-between">
                  <span>下次续费:</span>
                  <span className="font-medium">
                    {new Date(subscription.current_period_end).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">接下来做什么？</h3>
            <div className="grid gap-3">
              <Link href="/#ai-generator" className="block">
                <Button className="w-full justify-between group">
                  开始创作
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full justify-between group">
                  查看使用面板
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t text-center text-sm text-muted-foreground">
            <p>感谢您选择 Ghibli AI！</p>
            <p>如有问题，请联系我们的客服团队。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
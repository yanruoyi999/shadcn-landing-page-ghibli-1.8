"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Crown, 
  Building, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Settings, 
  TrendingUp,
  Image as ImageIcon,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'
import { toast } from 'sonner'
import Link from 'next/link'

export default function DashboardPage() {
  const { subscription, user, loading, refreshSubscription } = useSubscription()
  const [managingBilling, setManagingBilling] = useState(false)

  const handleManageBilling = async () => {
    try {
      setManagingBilling(true)
      
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '创建管理面板失败')
      }

      // 重定向到Stripe Customer Portal
      window.location.href = data.url

    } catch (error) {
      console.error('打开账单管理失败:', error)
      toast.error(error instanceof Error ? error.message : '打开账单管理失败')
    } finally {
      setManagingBilling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">加载订阅信息...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>需要登录</CardTitle>
            <CardDescription>
              请先登录查看您的订阅管理面板
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">登录</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlan = subscription?.subscription_plan || 'free'
  const planConfig = SUBSCRIPTION_PLANS[currentPlan.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS]
  const usagePercentage = subscription?.images_limit === -1 
    ? 0 
    : ((subscription?.images_used_today || 0) / (subscription?.images_limit || 1)) * 100

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'pro': return <Crown className="h-5 w-5" />
      case 'enterprise': return <Building className="h-5 w-5" />
      default: return <Sparkles className="h-5 w-5" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'pro': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto py-8 space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">订阅管理</h1>
            <p className="text-muted-foreground mt-1">
              管理您的 Ghibli AI 订阅和使用情况
            </p>
          </div>
          <Button 
            onClick={refreshSubscription}
            variant="outline"
            size="sm"
          >
            刷新数据
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 当前计划 */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPlanIcon(currentPlan)}
                  <CardTitle>当前计划</CardTitle>
                </div>
                <Badge className={getPlanColor(currentPlan)}>
                  {currentPlan.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">计划状态</p>
                  <p className="text-2xl font-bold">
                    {subscription?.subscription_status === 'active' ? '已激活' : '未激活'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">月费</p>
                  <p className="text-2xl font-bold">
                    ${planConfig?.price || 0}
                  </p>
                </div>
              </div>

              {subscription?.current_period_end && (
                <div>
                  <p className="text-sm font-medium mb-2">下次续费时间</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(subscription.current_period_end).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {currentPlan === 'free' ? (
                  <Link href="/pricing">
                    <Button className="flex-1">
                      升级计划
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={handleManageBilling}
                    disabled={managingBilling}
                    className="flex-1"
                  >
                    {managingBilling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        打开中...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        管理账单
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 使用量统计 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <CardTitle className="text-lg">今日使用量</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {subscription?.images_used_today || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  / {subscription?.images_limit === -1 ? '无限制' : subscription?.images_limit || 0}
                </div>
              </div>

              {subscription?.images_limit !== -1 && (
                <div className="space-y-2">
                  <Progress value={usagePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    剩余 {subscription?.images_limit ? 
                      Math.max(0, subscription.images_limit - (subscription.images_used_today || 0)) : 0} 次
                  </p>
                </div>
              )}

              <Link href="/#ai-generator">
                <Button variant="outline" className="w-full">
                  开始创作
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 计划功能对比 */}
        <Card>
          <CardHeader>
            <CardTitle>计划功能</CardTitle>
            <CardDescription>
              查看您当前计划包含的功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
                const isCurrentPlan = key.toLowerCase() === currentPlan.toLowerCase()
                
                return (
                  <div 
                    key={key} 
                    className={`p-4 rounded-lg border-2 ${
                      isCurrentPlan 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {isCurrentPlan && (
                        <Badge variant="default" className="text-xs">
                          当前
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {!isCurrentPlan && (
                      <Link href="/pricing" className="block mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          {key === 'FREE' ? '降级' : '升级'}到此计划
                        </Button>
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/#ai-generator">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col space-y-2">
                  <ImageIcon className="h-6 w-6" />
                  <span>生成图像</span>
                </Button>
              </Link>
              
              <Link href="/pricing">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>升级计划</span>
                </Button>
              </Link>
              
              {currentPlan !== 'free' && (
                <Button 
                  variant="outline" 
                  className="w-full h-auto p-4 flex flex-col space-y-2"
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                >
                  <Settings className="h-6 w-6" />
                  <span>账单设置</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
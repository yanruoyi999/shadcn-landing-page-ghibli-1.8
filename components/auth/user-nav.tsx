"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, LogOut, Loader2, Crown, Building, Sparkles, Settings, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { useSubscription } from '@/hooks/use-subscription'
import Link from 'next/link'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function UserNav() {
  const [isLoading, setIsLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const supabase = createClient()
  const { user, subscription, getRemainingGenerations } = useSubscription()

  useEffect(() => {
    // useSubscription hook 已经处理了用户状态管理
    setIsLoading(false)
  }, [user])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Signed out successfully')
        window.location.reload()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline">
        <a href="/login">Sign In</a>
      </Button>
    )
  }

  const getPlanIcon = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'pro': return <Crown className="h-3 w-3" />
      case 'enterprise': return <Building className="h-3 w-3" />
      default: return <Sparkles className="h-3 w-3" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'pro': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  const remainingGenerations = getRemainingGenerations()
  const planName = subscription?.subscription_plan || 'free'

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        className="relative h-8 w-8 rounded-full"
        onClick={() => setShowMenu(!showMenu)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
          <AvatarFallback>
            {user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>
      
      {showMenu && (
        <div className="absolute right-0 top-10 w-72 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50">
          {/* 用户信息 */}
          <div className="px-2 py-1.5 text-sm font-semibold">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>

          {/* 订阅状态 */}
          <div className="px-2 py-2">
            <div className="flex items-center justify-between mb-2">
              <Badge className={`${getPlanColor(planName)} flex items-center gap-1`}>
                {getPlanIcon(planName)}
                {planName.toUpperCase()}
              </Badge>
              {subscription?.subscription_status === 'active' && (
                <span className="text-xs text-green-600 dark:text-green-400">已激活</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              今日剩余: {remainingGenerations === -1 ? '无限制' : `${remainingGenerations} 次`}
            </div>
          </div>

          <div className="-mx-1 my-1 h-px bg-muted"></div>

          {/* 菜单项 */}
          <Link href="/dashboard" className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full">
            <Settings className="mr-2 h-4 w-4" />
            <span>订阅管理</span>
          </Link>

          {planName === 'free' && (
            <Link href="/pricing" className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-primary">
              <Crown className="mr-2 h-4 w-4" />
              <span>升级计划</span>
            </Link>
          )}

          <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full">
            <User className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </button>

          <div className="-mx-1 my-1 h-px bg-muted"></div>
          
          <button 
            onClick={handleSignOut}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </button>
        </div>
      )}
    </div>
  )
} 
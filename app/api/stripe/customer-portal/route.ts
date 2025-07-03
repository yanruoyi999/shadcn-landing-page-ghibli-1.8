import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // 获取当前用户
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    // 查找用户的Stripe客户ID
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: '未找到订阅信息' },
        { status: 404 }
      )
    }

    // 创建customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/dashboard`,
    })

    return NextResponse.json({ 
      url: session.url 
    })

  } catch (error) {
    console.error('创建customer portal失败:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `创建管理面板失败: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: '创建管理面板失败，请稍后重试' },
      { status: 500 }
    )
  }
}
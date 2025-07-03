import { NextRequest, NextResponse } from 'next/server'
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const { priceId, plan } = await request.json()

    // 验证输入
    if (!priceId || !plan) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证计划是否有效
    if (!SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json(
        { error: '无效的订阅计划' },
        { status: 400 }
      )
    }

    // 获取当前用户
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    // 检查用户是否已有订阅
    const existingSubscription = await getUserSubscription(user.id)
    
    // 如果用户已经是这个计划，返回错误
    if (existingSubscription && existingSubscription.subscription_plan === plan.toLowerCase()) {
      return NextResponse.json(
        { error: '您已经订阅了这个计划' },
        { status: 400 }
      )
    }

    // 创建或获取Stripe客户
    let customerId: string
    
    // 尝试根据用户邮箱查找现有客户
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
    } else {
      // 创建新客户
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id
        }
      })
      customerId = customer.id
    }

    // 创建checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
      metadata: {
        user_id: user.id,
        plan: plan.toLowerCase()
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: plan.toLowerCase()
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('创建checkout session失败:', error)
    
    // 处理特定的Stripe错误
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `支付处理失败: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: '支付处理失败，请稍后重试' },
      { status: 500 }
    )
  }
}
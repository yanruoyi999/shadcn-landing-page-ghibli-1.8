import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createOrUpdateSubscription, createPaymentRecord } from '@/lib/subscription'
import Stripe from 'stripe'

// 禁用body解析，因为我们需要原始body来验证webhook
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // 验证webhook签名
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook签名验证失败:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    // 处理不同类型的webhook事件
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`未处理的事件类型: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook处理失败:', error)
    return NextResponse.json(
      { error: 'Webhook处理失败' },
      { status: 500 }
    )
  }
}

// 处理checkout session完成
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const plan = session.metadata?.plan

  if (!userId || !plan) {
    console.error('Checkout session缺少必要的metadata')
    return
  }

  try {
    // 获取订阅信息
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    
    // 更新用户订阅状态
    await createOrUpdateSubscription(userId, {
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      status: subscription.status as any,
      plan: plan as any,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })

    console.log(`✅ 订阅创建成功 - 用户: ${userId}, 计划: ${plan}`)
  } catch (error) {
    console.error('处理checkout完成失败:', error)
  }
}

// 处理订阅创建
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  const plan = subscription.metadata?.plan

  if (!userId || !plan) {
    console.error('订阅缺少必要的metadata')
    return
  }

  try {
    await createOrUpdateSubscription(userId, {
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status: subscription.status as any,
      plan: plan as any,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })

    console.log(`✅ 订阅创建成功 - 用户: ${userId}, 计划: ${plan}`)
  } catch (error) {
    console.error('处理订阅创建失败:', error)
  }
}

// 处理订阅更新
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  const plan = subscription.metadata?.plan

  if (!userId) {
    console.error('订阅更新缺少用户ID')
    return
  }

  try {
    await createOrUpdateSubscription(userId, {
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status: subscription.status as any,
      plan: (plan || 'pro') as any, // 默认为pro计划
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })

    console.log(`✅ 订阅更新成功 - 用户: ${userId}, 状态: ${subscription.status}`)
  } catch (error) {
    console.error('处理订阅更新失败:', error)
  }
}

// 处理订阅删除/取消
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('订阅删除缺少用户ID')
    return
  }

  try {
    // 将用户降级为免费计划
    await createOrUpdateSubscription(userId, {
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: '',
      status: 'canceled',
      plan: 'free',
      current_period_start: undefined,
      current_period_end: undefined,
    })

    console.log(`✅ 订阅取消成功 - 用户: ${userId}`)
  } catch (error) {
    console.error('处理订阅取消失败:', error)
  }
}

// 处理付款成功
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  const userId = subscription.metadata?.user_id
  const plan = subscription.metadata?.plan

  if (!userId || !plan) {
    console.error('付款成功事件缺少必要信息')
    return
  }

  try {
    // 记录付款历史
    await createPaymentRecord(userId, {
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      plan: plan as any,
    })

    console.log(`✅ 付款记录成功 - 用户: ${userId}, 金额: ${invoice.amount_paid}`)
  } catch (error) {
    console.error('记录付款失败:', error)
  }
}

// 处理付款失败
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  const userId = subscription.metadata?.user_id
  const plan = subscription.metadata?.plan

  if (!userId || !plan) {
    console.error('付款失败事件缺少必要信息')
    return
  }

  try {
    // 记录付款失败
    await createPaymentRecord(userId, {
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      plan: plan as any,
    })

    // 可以在这里添加邮件通知等逻辑
    console.log(`❌ 付款失败 - 用户: ${userId}, 金额: ${invoice.amount_due}`)
  } catch (error) {
    console.error('记录付款失败:', error)
  }
}
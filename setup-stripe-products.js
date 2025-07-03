/**
 * Stripe产品和价格设置脚本
 * 
 * 使用方法：
 * 1. 确保已设置STRIPE_SECRET_KEY环境变量
 * 2. 运行: node setup-stripe-products.js
 * 
 * 这个脚本会：
 * - 创建Ghibli AI产品
 * - 创建Pro月度价格 ($19/月)
 * - 创建Enterprise月度价格 ($99/月)
 * - 输出价格ID，需要添加到环境变量中
 */

require('dotenv').config({ path: '.env.local' })
const Stripe = require('stripe')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
})

async function setupStripeProducts() {
  try {
    console.log('🚀 开始设置Stripe产品和价格...')

    // 创建产品
    const product = await stripe.products.create({
      name: 'Ghibli AI - 吉卜力风格AI图像生成',
      description: '使用AI生成吉卜力工作室风格的精美图像',
      images: [], // 可以添加产品图片URL
      metadata: {
        app: 'ghibli-ai',
        version: '1.8'
      }
    })

    console.log('✅ 产品创建成功:', product.id)

    // 创建Pro月度价格
    const proPriceMonthly = await stripe.prices.create({
      unit_amount: 1900, // $19.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      product: product.id,
      nickname: 'Pro Monthly',
      metadata: {
        plan: 'pro',
        billing_period: 'monthly'
      }
    })

    console.log('✅ Pro月度价格创建成功:', proPriceMonthly.id)

    // 创建Enterprise月度价格
    const enterprisePriceMonthly = await stripe.prices.create({
      unit_amount: 9900, // $99.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      product: product.id,
      nickname: 'Enterprise Monthly',
      metadata: {
        plan: 'enterprise',
        billing_period: 'monthly'
      }
    })

    console.log('✅ Enterprise月度价格创建成功:', enterprisePriceMonthly.id)

    // 输出结果
    console.log('\n🎉 所有产品和价格创建完成！')
    console.log('\n请将以下环境变量添加到你的 .env.local 文件中：')
    console.log('==========================================')
    console.log(`STRIPE_PRO_PRICE_ID=${proPriceMonthly.id}`)
    console.log(`STRIPE_ENTERPRISE_PRICE_ID=${enterprisePriceMonthly.id}`)
    console.log('==========================================')

    // 可选：创建年度价格（折扣）
    const createYearlyPrices = false
    if (createYearlyPrices) {
      const proPriceYearly = await stripe.prices.create({
        unit_amount: 19000, // $190.00 (10个月价格)
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        product: product.id,
        nickname: 'Pro Yearly (Save 17%)',
        metadata: {
          plan: 'pro',
          billing_period: 'yearly'
        }
      })

      const enterprisePriceYearly = await stripe.prices.create({
        unit_amount: 99000, // $990.00 (10个月价格)
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        product: product.id,
        nickname: 'Enterprise Yearly (Save 17%)',
        metadata: {
          plan: 'enterprise',
          billing_period: 'yearly'
        }
      })

      console.log('\n年度价格也已创建：')
      console.log(`STRIPE_PRO_YEARLY_PRICE_ID=${proPriceYearly.id}`)
      console.log(`STRIPE_ENTERPRISE_YEARLY_PRICE_ID=${enterprisePriceYearly.id}`)
    }

  } catch (error) {
    console.error('❌ 错误:', error.message)
    process.exit(1)
  }
}

// 运行设置
setupStripeProducts()
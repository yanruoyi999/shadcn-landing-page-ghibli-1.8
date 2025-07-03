import { type NextRequest } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from 'uuid'
import { generateImageSchema, RATE_LIMITS } from '@/lib/validation'
import { rateLimiter } from '@/lib/rate-limiter'
import { SafeApiError, createErrorResponse, getClientIP } from '@/lib/error-handler'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription, incrementUserUsage, canUserGenerate } from '@/lib/subscription'

// Ghibli style prompt template
const GHIBLI_STYLE = "Studio Ghibli anime style, soft watercolor background, warm and muted color palette, gentle thin outlines, peaceful atmosphere, hand-drawn aesthetic with a vintage paper texture."

async function uploadImageToR2(base64Data: string, imageType: 'uploaded' | 'generated' = 'uploaded'): Promise<string> {
  const requiredVars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL_BASE']
  const missing = requiredVars.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new SafeApiError(`Missing R2 configuration: ${missing.join(', ')}`, 500, 'MISSING_CONFIG')
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })

  try {
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Clean, 'base64')
    
    // Validate buffer size
    if (buffer.length > 30 * 1024 * 1024) {
      throw new SafeApiError('Image too large', 400, 'IMAGE_TOO_LARGE')
    }
    
    const fileExtension = base64Data.substring(base64Data.indexOf('/') + 1, base64Data.indexOf(';base64'))
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = now.toISOString().replace(/[:.]/g, '-').split('.')[0]
    const shortId = uuidv4().substring(0, 8)
    const fileName = `${dateStr}/${imageType}/${timeStr}-${shortId}.${fileExtension}`

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: `image/${fileExtension}`,
    })

    await s3.send(command)
    return `${process.env.R2_PUBLIC_URL_BASE}/${fileName}`
    
  } catch (error: any) {
    if (error instanceof SafeApiError) throw error
    throw new SafeApiError('Failed to upload image', 500, 'UPLOAD_FAILED')
  }
}

async function downloadAndStoreToR2(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new SafeApiError('Failed to download generated image', 500, 'DOWNLOAD_FAILED')
    }
    
    const imageBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const dataUrl = `data:${contentType};base64,${base64}`
    
    return await uploadImageToR2(dataUrl, 'generated')
  } catch (error: any) {
    console.error('Failed to store image to R2:', error)
    return imageUrl // Fallback to original URL
  }
}

const getSizeFromAspectRatio = (aspectRatio: string): string => {
  const sizeMap: Record<string, string> = {
    "1:1": "1024x1024",
    "3:4": "1024x1536", 
    "4:3": "1536x1024",
    "16:9": "1536x1024",
    "9:16": "1024x1536"
  }
  return sizeMap[aspectRatio] || "1024x1024"
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 验证用户认证
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new SafeApiError('用户未认证，请先登录', 401, 'UNAUTHENTICATED')
    }

    // 获取用户订阅信息
    const userSubscription = await getUserSubscription(user.id)
    
    if (!userSubscription) {
      throw new SafeApiError('无法获取用户订阅信息', 500, 'SUBSCRIPTION_ERROR')
    }

    // 检查用户是否可以生成图像（基于订阅限制）
    if (!canUserGenerate(userSubscription)) {
      const planName = userSubscription.subscription_plan.toUpperCase()
      const limit = userSubscription.images_limit === -1 ? '无限制' : userSubscription.images_limit
      
      throw new SafeApiError(
        `您今日的生成次数已用完。当前计划 (${planName}) 每日限制: ${limit}次。请升级您的订阅计划以获得更多生成次数。`, 
        429, 
        'SUBSCRIPTION_LIMIT_EXCEEDED'
      )
    }

    // Rate limiting (备用限制，防止滥用)
    const clientIP = getClientIP(request)
    const { maxRequests, windowMs } = RATE_LIMITS.GENERATE_IMAGE
    
    if (!rateLimiter.isAllowed(clientIP, maxRequests, windowMs)) {
      throw new SafeApiError('请求过于频繁，请稍后再试', 429, 'RATE_LIMITED')
    }

    // Validate request body
    const body = await request.json()
    const validatedData = generateImageSchema.parse(body)
    const { prompt, aspectRatio, quality, input_image } = validatedData

    let imageUrl: string | null = null

    if (input_image) {
      // Image-to-image generation using Replicate
      const replicateApiKey = process.env.REPLICATE_API_TOKEN
      if (!replicateApiKey) {
        throw new SafeApiError('Image generation service unavailable', 503, 'SERVICE_UNAVAILABLE')
      }

      const imageUrlForApi = await uploadImageToR2(input_image, 'uploaded')
      const userContent = prompt.trim() || "the subject in the image"
      const apiPrompt = `Redraw the entire image in the style of ${GHIBLI_STYLE}. Maintain the original subject, colors, and composition. User guidance: '${userContent}'.`

      const replicateResponse = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions", {
        method: 'POST',
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: {
            prompt: apiPrompt,
            input_image: imageUrlForApi,
            aspect_ratio: "match_input_image",
            output_format: "jpg",
            safety_tolerance: 2
          }
        })
      })

      if (!replicateResponse.ok) {
        const errorText = await replicateResponse.text()
        console.error('Replicate API error:', replicateResponse.status, errorText)
        throw new SafeApiError('Image generation failed', 500, 'GENERATION_FAILED')
      }

      const result = await replicateResponse.json()
      
      // Poll for result
      if (result.id && result.status) {
        if (result.status === "succeeded" && result.output) {
          imageUrl = result.output
        } else if (result.status === "processing" || result.status === "starting") {
          const pollUrl = `https://api.replicate.com/v1/predictions/${result.id}`
          const maxPolls = 30
          const pollInterval = 2000

          for (let i = 0; i < maxPolls; i++) {
            await new Promise(resolve => setTimeout(resolve, pollInterval))

            const pollResponse = await fetch(pollUrl, {
              headers: {
                'Authorization': `Token ${replicateApiKey}`,
                'Content-Type': 'application/json'
              }
            })

            if (pollResponse.ok) {
              const pollResult = await pollResponse.json()
              if (pollResult.status === "succeeded" && pollResult.output) {
                imageUrl = pollResult.output
                break
              } else if (pollResult.status === "failed") {
                throw new SafeApiError('Image generation failed', 500, 'GENERATION_FAILED')
              }
            }
          }

          if (!imageUrl) {
            throw new SafeApiError('Generation timeout. Please try again.', 408, 'GENERATION_TIMEOUT')
          }
        } else if (result.status === "failed") {
          throw new SafeApiError('Image generation failed', 500, 'GENERATION_FAILED')
        }
      }
    } else {
      // Text-to-image generation using Ismaque
      const ismaqueApiKey = process.env.ISMAQUE_API_KEY
      if (!ismaqueApiKey) {
        throw new SafeApiError('Text generation service unavailable', 503, 'SERVICE_UNAVAILABLE')
      }

      const apiPrompt = `${prompt.trim()}, ${GHIBLI_STYLE}`
      const negativePrompt = "multiple women, multiple men, multiple people, duplicated characters, twins, two people, three people, ugly, deformed, noisy, blurry, low-contrast, grainy"

      const ismaqueResponse = await fetch("https://ismaque.org/v1/images/generations", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ismaqueApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: apiPrompt,
          negative_prompt: negativePrompt,
          n: 1,
          model: "flux-kontext-pro",
          aspect_ratio: aspectRatio,
          webhook_url: `${request.nextUrl.origin}/api/webhook-callback`,
        })
      })

      if (!ismaqueResponse.ok) {
        const errorText = await ismaqueResponse.text()
        console.error('Ismaque API error:', ismaqueResponse.status, errorText)
        
        if (ismaqueResponse.status === 429) {
          throw new SafeApiError('Service busy. Please try again later.', 429, 'SERVICE_BUSY')
        } else if (ismaqueResponse.status === 401) {
          throw new SafeApiError('Service authentication failed', 503, 'SERVICE_AUTH_FAILED')  
        } else {
          throw new SafeApiError('Text generation failed', 500, 'GENERATION_FAILED')
        }
      }

      const result = await ismaqueResponse.json()
      
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        const imageData = result.data[0]
        if (imageData.url) {
          imageUrl = imageData.url
        } else if (imageData.b64_json) {
          imageUrl = `data:image/png;base64,${imageData.b64_json}`
        }
      }
    }

    if (!imageUrl) {
      throw new SafeApiError('Failed to generate image', 500, 'NO_IMAGE_GENERATED')
    }

    // Store to R2 and return success response
    const r2ImageUrl = await downloadAndStoreToR2(imageUrl)
    
    // 增加用户使用量计数
    try {
      await incrementUserUsage(user.id, 1)
    } catch (error) {
      console.error('Failed to increment user usage:', error)
      // 不阻止图像生成，只记录错误
    }
    
    const totalTime = Date.now() - startTime

    return Response.json({
      success: true,
      imageUrl: r2ImageUrl,
      message: "图像生成成功！",
      stats: {
        totalTime: `${totalTime}ms`,
        model: input_image ? "flux-kontext-pro (Replicate)" : "flux-kontext-pro (Ismaque)",
        aspectRatio: aspectRatio,
        promptLength: prompt.length,
        remainingGenerations: userSubscription.images_limit === -1 
          ? -1 
          : Math.max(0, userSubscription.images_limit - userSubscription.images_used_today - 1)
      }
    })

  } catch (error) {
    return createErrorResponse(error, 'Failed to generate image')
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60
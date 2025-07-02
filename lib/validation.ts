import { z } from 'zod'

// API请求验证模式
export const generateImageSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt cannot be empty')
    .max(500, 'Prompt must be less than 500 characters')
    .refine(
      (val) => !containsUnsafeContent(val),
      'Content contains inappropriate material'
    ),
  aspectRatio: z.enum(['1:1', '4:3', '3:4', '16:9', '9:16']).default('1:1'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  input_image: z.string().optional()
})

export const downloadImageSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  filename: z.string()
    .min(1, 'Filename cannot be empty')
    .max(100, 'Filename too long')
    .regex(/^[a-zA-Z0-9\-_.]+$/, 'Invalid filename format')
})

// 内容安全检查
function containsUnsafeContent(text: string): boolean {
  const unsafePatterns = [
    /\b(nude|naked|sex|porn|explicit)\b/i,
    /\b(violence|kill|murder|death)\b/i,
    /\b(hate|racist|discriminat)\b/i
  ]
  
  return unsafePatterns.some(pattern => pattern.test(text))
}

// 文件类型验证
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 30 * 1024 * 1024 // 30MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large (max 30MB)' }
  }
  
  return { valid: true }
}

// 速率限制配置
export const RATE_LIMITS = {
  GENERATE_IMAGE: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
  }
}
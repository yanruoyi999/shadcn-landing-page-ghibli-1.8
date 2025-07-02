import { NextRequest, NextResponse } from 'next/server'
import { downloadImageSchema } from '@/lib/validation'
import { createErrorResponse, SafeApiError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, filename } = downloadImageSchema.parse(body)
    
    // Validate URL domain for security
    const url = new URL(imageUrl)
    const allowedDomains = [
      process.env.R2_PUBLIC_URL_BASE?.replace(/^https?:\/\//, ''),
      'replicate.delivery',
      'ismaque.org'
    ].filter(Boolean)
    
    if (!allowedDomains.some(domain => url.hostname.includes(domain as string))) {
      throw new SafeApiError('Invalid image source', 400, 'INVALID_SOURCE')
    }

    // Fetch image with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Ghibli-AI-Generator/1.8.0'
        }
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new SafeApiError('Failed to fetch image', response.status, 'FETCH_FAILED')
      }

      const contentLength = response.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB limit
        throw new SafeApiError('Image too large to download', 413, 'IMAGE_TOO_LARGE')
      }

      const buffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'image/png'
      
      // Validate content type
      if (!contentType.startsWith('image/')) {
        throw new SafeApiError('Invalid file type', 400, 'INVALID_FILE_TYPE')
      }

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.byteLength.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      })

    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new SafeApiError('Download timeout', 408, 'DOWNLOAD_TIMEOUT')
      }
      throw fetchError
    }

  } catch (error) {
    return createErrorResponse(error, 'Failed to download image')
  }
}
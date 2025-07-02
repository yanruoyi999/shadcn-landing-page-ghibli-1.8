import { NextResponse } from 'next/server'

export interface ApiError {
  success: false
  error: string
  message: string
  code?: string
}

export class SafeApiError extends Error {
  public readonly statusCode: number
  public readonly code?: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    
    Object.setPrototypeOf(this, SafeApiError.prototype)
  }
}

export function createErrorResponse(
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred'
): NextResponse<ApiError> {
  console.error('API Error:', error)

  // Handle known safe errors
  if (error instanceof SafeApiError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: error.message,
      code: error.code
    }, { status: error.statusCode })
  }

  // Handle validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      message: 'Please check your input parameters'
    }, { status: 400 })
  }

  // Handle unknown errors - don't expose internal details
  return NextResponse.json({
    success: false,
    error: 'Internal server error',
    message: fallbackMessage
  }, { status: 500 })
}

export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}
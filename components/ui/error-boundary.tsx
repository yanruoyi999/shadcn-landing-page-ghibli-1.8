"use client"

import React from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-destructive">Something went wrong</CardTitle>
        <CardDescription>
          We encountered an unexpected error. Please try again or refresh the page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer font-medium">Error details</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words bg-muted p-2 rounded text-xs">
            {error.message}
          </pre>
        </details>
        <div className="flex gap-2">
          <Button onClick={resetErrorBoundary} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="flex-1"
          >
            Refresh page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

export function ErrorBoundary({ 
  children, 
  fallback: Fallback = ErrorFallback,
  onError 
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo)
        onError?.(error, errorInfo)
      }}
      onReset={() => {
        // Clear any error state if needed
        window.location.hash = ''
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
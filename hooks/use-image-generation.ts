"use client"

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  aspectRatio: string
  timestamp: number
  type: 'text-to-image' | 'image-to-image'
}

interface GenerationState {
  isGenerating: boolean
  progress: number
  status: string
  currentImage: GeneratedImage | null
  estimatedTime: number | null
}

export function useImageGeneration() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    status: '',
    currentImage: null,
    estimatedTime: null
  })

  const updateProgress = useCallback((progress: number, status: string, estimatedTime?: number) => {
    setState(prev => ({
      ...prev,
      progress,
      status,
      estimatedTime: estimatedTime ?? prev.estimatedTime
    }))
  }, [])

  const generateImage = useCallback(async (
    prompt: string,
    aspectRatio: string,
    referenceImage?: string
  ): Promise<GeneratedImage | null> => {
    if (!prompt.trim() && !referenceImage) {
      toast.error('Please enter a prompt or upload a reference image')
      return null
    }

    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      status: 'Preparing request...',
      estimatedTime: referenceImage ? 45000 : 30000 // Estimated time in ms
    }))

    const startTime = Date.now()

    try {
      const requestBody: any = {
        prompt: prompt.trim() || "a peaceful countryside scene with rolling hills and gentle breeze",
        aspectRatio,
        quality: "standard"
      }

      if (referenceImage) {
        requestBody.input_image = referenceImage
      }

      updateProgress(10, 'Sending request...')

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Generation failed')
      }

      updateProgress(25, 'Processing request...')

      const data = await response.json()

      if (data.success && data.imageUrl) {
        updateProgress(100, 'Generation completed!')
        
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: data.imageUrl,
          prompt: prompt || "Generated image",
          aspectRatio,
          timestamp: Date.now(),
          type: referenceImage ? 'image-to-image' : 'text-to-image',
        }

        setState(prev => ({
          ...prev,
          currentImage: newImage,
          progress: 100,
          status: 'Completed!'
        }))

        // Reset after delay
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isGenerating: false,
            progress: 0,
            status: '',
            estimatedTime: null
          }))
        }, 2000)

        return newImage
      } else {
        throw new Error(data.message || 'Failed to generate image')
      }

    } catch (error: any) {
      console.error('Generation error:', error)
      const errorMessage = error.message || 'Generation failed, please try again'
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 0,
        status: `Error: ${errorMessage}`,
        estimatedTime: null
      }))

      toast.error(errorMessage)
      
      // Clear error status after delay
      setTimeout(() => {
        setState(prev => ({ ...prev, status: '' }))
      }, 3000)

      return null
    }
  }, [updateProgress])

  const resetGeneration = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      status: '',
      currentImage: null,
      estimatedTime: null
    })
  }, [])

  return {
    ...state,
    generateImage,
    resetGeneration
  }
}
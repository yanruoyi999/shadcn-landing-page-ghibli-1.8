"use client"

import { useState, useEffect, useCallback } from 'react'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  aspectRatio: string
  timestamp: number
  type: 'text-to-image' | 'image-to-image'
}

const STORAGE_KEY = 'ghibli-ai-history'
const MAX_HISTORY_ITEMS = 50

export function useHistory() {
  const [history, setHistory] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY)
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        const validatedHistory = parsedHistory
          .filter((item: any) => item && typeof item.url === 'string' && item.url)
          .map((item: any): GeneratedImage => ({
            id: item.id || Date.now().toString(),
            url: item.url,
            prompt: item.prompt || '',
            aspectRatio: item.aspectRatio || '1:1',
            timestamp: item.timestamp || Date.now(),
            type: item.type || 'text-to-image'
          }))
          .slice(0, MAX_HISTORY_ITEMS)
        
        setHistory(validatedHistory)
      }
    } catch (error) {
      console.error('Error loading history:', error)
      localStorage.removeItem(STORAGE_KEY) // Clear corrupted data
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save history to localStorage
  useEffect(() => {
    if (!isLoading && history.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (error) {
        console.error('Error saving history:', error)
        // If storage is full, try to clear old items
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          const reducedHistory = history.slice(0, Math.floor(MAX_HISTORY_ITEMS / 2))
          setHistory(reducedHistory)
        }
      }
    }
  }, [history, isLoading])

  const addToHistory = useCallback((image: GeneratedImage) => {
    setHistory(prev => {
      // Remove any existing item with the same ID
      const filtered = prev.filter(item => item.id !== image.id)
      // Add new item at the beginning and limit total items
      return [image, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    })
  }, [])

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const getHistoryStats = useCallback(() => {
    const total = history.length
    const textToImage = history.filter(item => item.type === 'text-to-image').length
    const imageToImage = history.filter(item => item.type === 'image-to-image').length
    const today = new Date().toDateString()
    const todayCount = history.filter(item => 
      new Date(item.timestamp).toDateString() === today
    ).length

    return {
      total,
      textToImage,
      imageToImage,
      todayCount
    }
  }, [history])

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryStats
  }
}
"use client"

import React, { useState, useRef, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Upload, Download, Sparkles, ImageIcon, Wand2, Clock, X } from "lucide-react"
import { toast } from "sonner"
import { useImageGeneration } from "@/hooks/use-image-generation"
import { useHistory } from "@/hooks/use-history"
import { compressImage, validateImageFile, downloadImage } from "@/lib/image-utils"

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  aspectRatio: string
  timestamp: number
  type: 'text-to-image' | 'image-to-image'
}

const aspectRatios = [
  { value: "1:1", label: "1:1", icon: "⬜" },
  { value: "4:3", label: "4:3", icon: "▭" },
  { value: "3:4", label: "3:4", icon: "▯" },
  { value: "16:9", label: "16:9", icon: "▬" },
  { value: "9:16", label: "9:16", icon: "▮" },
]

const examplePrompts = [
  "A young girl in simple dress walking on a quiet path, soft spring breeze, warm afternoon light",
  "A small wooden house by the sea, gentle waves, seagulls in the distance, peaceful coastal scene",
  "A person sitting under a large tree reading a book, dappled sunlight through leaves, tranquil moment",
  "A traditional Japanese village street, old buildings, soft morning light, quiet everyday life",
  "A cozy indoor scene with warm lighting, simple furniture, plants by the window, homely atmosphere"
]

const AspectRatioSelector = memo(({ 
  aspectRatio, 
  onAspectRatioChange 
}: { 
  aspectRatio: string
  onAspectRatioChange: (ratio: string) => void 
}) => (
  <div className="grid grid-cols-5 gap-2">
    {aspectRatios.map((ratio) => (
      <button
        key={ratio.value}
        onClick={() => onAspectRatioChange(ratio.value)}
        className={`p-3 rounded-md border text-center transition-all ${
          aspectRatio === ratio.value
            ? "border-primary bg-primary/20 text-foreground"
            : "border-border bg-background text-muted-foreground hover:border-primary/50"
        }`}
      >
        <div className="text-2xl mb-1">{ratio.icon}</div>
        <div className="text-xs">{ratio.label}</div>
      </button>
    ))}
  </div>
))

const HistoryItem = memo(({ 
  image, 
  onImageClick, 
  onDownload,
  isDownloading 
}: { 
  image: GeneratedImage
  onImageClick: (image: GeneratedImage) => void
  onDownload: (image: GeneratedImage) => void
  isDownloading: boolean
}) => (
  <div 
    className="overflow-hidden cursor-pointer group relative bg-background border border-border rounded-md"
    onClick={() => onImageClick(image)}
  >
    <img 
      src={image.url} 
      alt={image.prompt} 
      className="aspect-square object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
    />
    
    <div className={`absolute inset-0 bg-black/70 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center ${
        isDownloading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
      {isDownloading ? (
        <p className="text-primary text-lg font-bold animate-bounce">✅ Saved!</p>
      ) : (
        <>
          <p className="text-white text-sm mb-4 line-clamp-4 font-sans px-2 py-1 text-center">
            {image.type === 'image-to-image' ? (
              <span className="font-bold text-primary-foreground">Transform your image to Ghibli style</span>
            ) : (
              <>
                <span className="font-bold text-primary-foreground">Try this Ghibli style:</span>
                <span className="block mt-1">{image.prompt}</span>
              </>
            )}
          </p>
          <Button
            size="sm"
            className="bg-primary/80 hover:bg-primary text-primary-foreground font-bold"
            onClick={(e) => {
              e.stopPropagation()
              onDownload(image)
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Save
          </Button>
        </>
      )}
    </div>
  </div>
))

export function AIGeneratorSection() {
  const [prompt, setPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { 
    isGenerating, 
    progress, 
    status, 
    currentImage, 
    estimatedTime,
    generateImage 
  } = useImageGeneration()
  
  const { history, addToHistory } = useHistory()

  // Auto-cycle through example prompts
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % examplePrompts.length)
    }, 4000) // Slower cycling for better UX
    return () => clearInterval(interval)
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    try {
      // Compress image before setting
      const compressedBase64 = await compressImage(file, 1024, 1024, 0.8)
      setReferenceImage(file)
      setPreviewUrl(compressedBase64)
    } catch (error) {
      toast.error('Failed to process image')
      console.error('Image processing error:', error)
    }
  }, [])

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e)
    setIsDragging(true)
  }, [handleDragEvents])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e)
    setIsDragging(false)
  }, [handleDragEvents])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e)
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const mockEvent = { 
        target: { files: [files[0]] } 
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileUpload(mockEvent)
    }
  }, [handleDragEvents, handleFileUpload])

  const removeReferenceImage = useCallback(() => {
    setReferenceImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [previewUrl])

  const handleGenerate = useCallback(async () => {
    const result = await generateImage(prompt, aspectRatio, previewUrl || undefined)
    if (result) {
      addToHistory(result)
    }
  }, [prompt, aspectRatio, previewUrl, generateImage, addToHistory])

  const handleDownloadCurrent = useCallback(async () => {
    if (!currentImage?.url) return
    
    try {
      await downloadImage(currentImage.url, `ghibli-ai-${currentImage.id}.png`)
      toast.success('Image downloaded successfully!')
    } catch (error) {
      toast.error('Download failed. Please try again.')
    }
  }, [currentImage])

  const handleDownloadHistory = useCallback(async (image: GeneratedImage) => {
    setDownloadingIds(prev => new Set(prev).add(image.id))
    
    try {
      await downloadImage(image.url, `ghibli-ai-${image.id}.png`)
      toast.success('Image downloaded successfully!')
      
      setTimeout(() => {
        setDownloadingIds(prev => {
          const next = new Set(prev)
          next.delete(image.id)
          return next
        })
      }, 2000)
    } catch (error) {
      toast.error('Download failed. Please try again.')
      setDownloadingIds(prev => {
        const next = new Set(prev)
        next.delete(image.id)
        return next
      })
    }
  }, [])

  const handleHistoryItemClick = useCallback((image: GeneratedImage) => {
    setPrompt(image.prompt)
    setAspectRatio(image.aspectRatio)
  }, [])

  const formatTimeRemaining = useCallback((ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return `~${seconds}s remaining`
  }, [])

  return (
    <ErrorBoundary>
      <section id="ai-generator" className="container py-24 sm:py-32">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-6 text-center">
          <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
            AI Generator
          </h2>
          
          <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
            Ghibli AI Image Generator
          </h2>
          
          <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
            Transform your ideas into Ghibli-style masterpieces with AI
          </h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-16">
          {/* Input Settings Card */}
          <Card className="h-full bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                Input Settings
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Upload an image or enter text to generate Ghibli style image
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reference Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Reference Image (Optional)
                </label>
                {previewUrl ? (
                  <div className="relative group">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full rounded-md object-contain max-h-60" 
                    />
                    <button
                      onClick={removeReferenceImage}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragEvents}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="text-foreground">
                      Drag and drop or <span className="text-primary underline">browse files</span>
                    </p>
                    <p className="text-muted-foreground text-xs mt-2">
                      JPG, PNG, GIF, WebP up to 30MB
                    </p>
                  </div>
                )}
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="sr-only" 
                />
              </div>

              {/* Prompt Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  maxLength={500}
                />
                <div className="text-right text-muted-foreground text-xs">{prompt?.length || 0}/500</div>
                
                {/* Example Prompts */}
                <div className="p-4 bg-muted/50 border border-border rounded-md">
                  <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="w-4 h-4 text-primary" />
                    <span className="text-foreground text-sm font-medium">Example Prompts</span>
                  </div>
                  <div 
                    className="cursor-pointer p-3 bg-background border border-border rounded-md hover:border-primary/50 transition-all duration-300"
                    onClick={() => setPrompt(examplePrompts[currentPromptIndex])}
                  >
                    <p className="text-foreground text-sm leading-relaxed">
                      {examplePrompts[currentPromptIndex]}
                    </p>
                    <p className="text-primary/70 text-xs mt-1">Click to use this prompt</p>
                  </div>
                </div>
              </div>

              {/* Aspect Ratio Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Aspect Ratio</label>
                <AspectRatioSelector 
                  aspectRatio={aspectRatio} 
                  onAspectRatioChange={setAspectRatio} 
                />
              </div>

              {/* Generate Button */}
              <div className="space-y-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                      <span>Generating... ({Math.round(progress)}%)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Image</span>
                    </div>
                  )}
                </Button>
                
                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{status}</span>
                      {estimatedTime && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeRemaining(estimatedTime - (progress / 100 * estimatedTime))}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="h-full bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                Output
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Display Area */}
              <div className="bg-muted/30 border border-border rounded-md flex flex-col items-center justify-center p-6 min-h-[400px]">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 border-4 border-t-transparent border-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-lg">Creating your Ghibli masterpiece...</p>
                    <p className="text-sm text-muted-foreground">{status}</p>
                  </div>
                ) : currentImage ? (
                  <img
                    src={currentImage.url}
                    alt={currentImage.prompt || 'Generated Ghibli style image'}
                    className="w-full h-auto object-contain rounded-md max-h-[400px]"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon size={64} className="mx-auto mb-4" />
                    <h3 className="text-xl font-medium">Generated image will appear here</h3>
                    <p className="text-base">Start creating your Ghibli masterpiece!</p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownloadCurrent}
                disabled={!currentImage}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Image
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        <div className="mt-16 space-y-8">
          <h2 className="text-3xl font-bold text-center">
            Generation History
          </h2>
          {history.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {history.map((image) => (
                <HistoryItem
                  key={image.id}
                  image={image}
                  onImageClick={handleHistoryItemClick}
                  onDownload={handleDownloadHistory}
                  isDownloading={downloadingIds.has(image.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <ImageIcon size={48} className="mx-auto mb-4" />
              <p className="text-lg">No generation history yet</p>
              <p className="text-sm">Start creating to see your artwork here</p>
            </div>
          )}
        </div>
      </section>
    </ErrorBoundary>
  )
}
"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, Sparkles, ImageIcon, Wand2 } from "lucide-react"
import { toast } from "sonner"

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  aspectRatio: string
  timestamp: number
  type: 'text-to-image' | 'image-to-image'
}

type DownloadStatus = {
  [key: string]: boolean;
};

export function AIGeneratorSection() {
  const [prompt, setPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState("")
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null)
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [history, setHistory] = useState<GeneratedImage[]>([])
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({});
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    try {
      const savedHistoryJson = localStorage.getItem("ghibli-ai-history");
      if (savedHistoryJson) {
        const parsedHistory = JSON.parse(savedHistoryJson);
        const validatedHistory = parsedHistory
          .filter((item: any) => item && typeof item.url === 'string' && item.url)
          .map((item: any): GeneratedImage => ({
            ...item,
            type: item.type || 'text-to-image' // 为旧数据提供默认值
          }))
          .slice(0, 20);
        setHistory(validatedHistory);
      }
    } catch (error) {
      console.error("读取历史记录时出错:", error);
    }
  }, [])

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("ghibli-ai-history", JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % examplePrompts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [examplePrompts.length])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setReferenceImage(file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const mockEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(mockEvent);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePromptClick = (selectedPrompt: string) => {
    setPrompt(selectedPrompt)
  }

  const generateImage = async () => {
    if (!(prompt || "").trim() && !referenceImage) {
      toast.error("Please enter a prompt or upload a reference image")
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setGenerationStatus("准备开始...")
    
    const finalPrompt = (prompt || "").trim() || "a peaceful countryside scene with rolling hills and gentle breeze";

    let currentProgress = 5
    setProgress(currentProgress)
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 85) {
          const increment = Math.random() * 10 + 5
          return Math.min(prev + increment, 85)
        }
        return prev
      })
    }, 500)

    try {
      const startTime = Date.now()
      
      const requestBody: any = {
        prompt: finalPrompt,
        aspectRatio,
        quality: "standard"
      }

      if (referenceImage) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = previewUrl!;
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.9);
        requestBody.input_image = base64Image;
      }

      setGenerationStatus("图片已发送，请求正在进行处理...")
      
      // 统一使用正式的生成API
      const apiUrl = `${window.location.origin}/api/generate`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      
      // 先获取响应文本，以便调试
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error("❌ API响应失败:", responseText);
        throw new Error(`HTTP错误! 状态: ${response.status} - ${responseText.substring(0, 100)}`);
      }

      // 尝试解析JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ JSON解析失败:", parseError);
        console.error("📄 完整响应内容:", responseText);
        throw new Error(`API返回格式错误: ${responseText.substring(0, 100)}...`);
      }

      if (data.success) {
        setGenerationStatus("生成成功！")
        setProgress(95)
        setTimeout(() => setProgress(100), 200)
        
        // 尝试两种可能的数据格式
        const imageUrl = data.imageUrl || data.data?.[0]?.url;
        
        if (imageUrl) {
          const newImage: GeneratedImage = {
            id: Date.now().toString(),
            url: imageUrl,
            prompt: finalPrompt || "Generated image",
            aspectRatio,
            timestamp: Date.now(),
            type: referenceImage ? 'image-to-image' : 'text-to-image',
          };
          
          setCurrentImage(newImage);
          setHistory((prevHistory) => {
            const newHistory = [newImage, ...prevHistory].slice(0, 20);
            return newHistory;
          });
        } else {
          console.error("❌ 生成的图片没有有效的 URL，完整响应:", data);
          throw new Error("生成的图片没有有效的URL");
        }

        setTimeout(() => setGenerationStatus("✅ 生成完成！"), 500)
      } else {
        const errorMsg = `生成失败: ${data.message || '未知错误'}`
        console.error("❌ API返回失败:", data);
        setGenerationStatus(errorMsg)
        throw new Error(data.error || data.details || "生成失败")
      }
    } catch (error) {
      console.error("💥 生成过程发生错误:", error);
      const errorMessage = error instanceof Error ? error.message : '生成失败，请稍后重试'
      setGenerationStatus(`生成失败: ${errorMessage}`)
      setProgress(0)
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
      setTimeout(() => {
        if (!isGenerating) {
            setProgress(0);
            setGenerationStatus("");
        }
      }, 3000)
    }
  }

  const downloadImage = async () => {
    if (!currentImage?.url) return

    try {
      // 通过本地API代理下载，避免CORS问题
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: currentImage.url,
          filename: `ghibli-ai-${currentImage.id}.png`
        })
      });

      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `ghibli-ai-${currentImage.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请稍后重试');
    }
  }

  const downloadHistoryImage = async (e: React.MouseEvent<HTMLButtonElement>, image: GeneratedImage) => {
    e.stopPropagation();
    
    if (!image.url) return;

    // 设置下载状态
    setDownloadStatus(prev => ({ ...prev, [image.id]: true }));

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: image.url,
          filename: `ghibli-ai-${image.id}.png`
        })
      });

      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `ghibli-ai-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // 2秒后重置下载状态
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [image.id]: false }));
      }, 2000);
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请稍后重试');
      setDownloadStatus(prev => ({ ...prev, [image.id]: false }));
    }
  }

  const handleHistoryItemClick = (image: GeneratedImage) => {
    setCurrentImage(image);
    setPrompt(image.prompt);
    setAspectRatio(image.aspectRatio);
  }

  return (
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
          <br />
          将您的想象转化为宫崎骏风格的艺术作品
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
              <br />
              上传图像或输入文本以生成 Ghibli 样式图像
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reference Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Reference Image (Optional)
                <br />
                <span className="text-muted-foreground">参考图片（可选）</span>
              </label>
              {previewUrl ? (
                <div className="relative group" data-upload-area>
                  <img src={previewUrl} alt="Preview" className="w-full rounded-md object-contain max-h-60" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeReferenceImage}
                    >
                      移除图片
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  data-upload-area
                  className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                  <p className="text-foreground">
                    Drag and drop or <span className="text-primary underline">browse files</span>
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">拖放或浏览文件</p>
                  <p className="text-muted-foreground text-xs mt-2">
                    Upload an image to transform into Ghibli style (JPG, PNG, GIF, WebP, up to 30MB)
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
              <label className="text-sm font-medium">Prompt 提示</label>
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
                  <span className="text-foreground text-sm font-medium">灵感提示词 / Example Prompts</span>
                </div>
                <div 
                  className="cursor-pointer p-3 bg-background border border-border rounded-md hover:border-primary/50 transition-all duration-300"
                  onClick={() => handlePromptClick(examplePrompts[currentPromptIndex])}
                >
                  <p className="text-foreground text-sm leading-relaxed">
                    {examplePrompts[currentPromptIndex]}
                  </p>
                  <p className="text-primary/70 text-xs mt-1">点击使用此提示词 / Click to use this prompt</p>
                </div>
              </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Aspect Ratio 纵横比</label>
              <div className="grid grid-cols-5 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
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
            </div>

            {/* Generate Button */}
            <div className="space-y-4">
              <Button
                onClick={generateImage}
                disabled={isGenerating}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                    <span>生成中... ({Math.round(progress)}%)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>生成图片</span>
                  </div>
                )}
              </Button>
              
              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  {generationStatus && (
                    <p className="text-center text-muted-foreground text-sm">
                      {generationStatus}
                    </p>
                  )}
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
              Output 输出
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Display Area */}
            <div className="bg-muted/30 border border-border rounded-md flex flex-col items-center justify-center p-6 min-h-[400px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 border-4 border-t-transparent border-primary rounded-full animate-spin mb-4"></div>
                  <p className="text-lg">正在为您生成艺术作品...</p>
                  <p className="text-sm text-muted-foreground">{generationStatus}</p>
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
                  <h3 className="text-xl font-medium">生成的图片将在这里显示</h3>
                  <p className="text-base">Generated image will appear here</p>
                </div>
              )}
            </div>

            {/* Download Button */}
            <Button
              onClick={downloadImage}
              disabled={!currentImage}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              下载图片
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* History Section */}
      <div className="mt-16 space-y-8">
        <h2 className="text-3xl font-bold text-center">
          生成历史 / History
        </h2>
        {history.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {history.map((image) => (
              <div 
                key={image.id} 
                className="overflow-hidden cursor-pointer group relative bg-background border border-border rounded-md"
                onClick={() => handleHistoryItemClick(image)}
              >
                {image.url ? (
                  <img src={image.url} alt={image.prompt} className="aspect-square object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="aspect-square w-full h-full bg-muted/50 flex items-center justify-center text-muted-foreground rounded-md">
                    <ImageIcon size={32} />
                    <span className="sr-only">No image available</span>
                  </div>
                )}
                
                <div className={`absolute inset-0 bg-black/70 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center ${
                    downloadStatus[image.id] ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                  {downloadStatus[image.id] ? (
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
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => downloadHistoryImage(e, image)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <ImageIcon size={48} className="mx-auto mb-4" />
            <p className="text-lg">还没有生成历史</p>
            <p className="text-sm">No generation history yet</p>
          </div>
        )}
      </div>
    </section>
  )
} 
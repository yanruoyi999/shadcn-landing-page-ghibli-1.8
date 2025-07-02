export const locales = ['en', 'zh'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

export const translations = {
  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      faq: 'FAQ',
      login: 'Login'
    },
    hero: {
      badge: 'Ghibli Art Generator!',
      title: 'Transform Your ideas into',
      titleHighlight: 'GhibliArt',
      titleEnd: 'Masterpieces',
      description: 'Create stunning Studio Ghibli-style artwork from text descriptions or transform your photos into magical scenes. Experience the wonder of AI-powered artistic creation.',
      startCreating: 'Start Creating',
      viewGallery: 'View Gallery'
    },
    generator: {
      title: 'Ghibli AI Image Generator',
      subtitle: 'Transform your ideas into Ghibli-style masterpieces with AI',
      inputSettings: 'Input Settings',
      inputDescription: 'Upload an image or enter text to generate Ghibli style image',
      referenceImage: 'Reference Image (Optional)',
      dragAndDrop: 'Drag and drop or browse files',
      dragText: 'Upload an image to transform into Ghibli style (JPG, PNG, GIF, WebP, up to 30MB)',
      removeImage: 'Remove Image',
      prompt: 'Prompt',
      promptPlaceholder: 'Describe the image you want to generate...',
      aspectRatio: 'Aspect Ratio',
      generateButton: 'Generate Image',
      generating: 'Generating',
      output: 'Output',
      downloadImage: 'Download Image',
      history: 'History',
      noHistory: 'No generation history yet',
      examplePrompts: 'Example Prompts',
      clickToUse: 'Click to use this prompt'
    },
    pricing: {
      title: 'Choose Your Plan',
      free: {
        title: 'Free',
        description: 'Perfect for trying out our Ghibli AI generator',
        features: [
          '5 generations per day',
          'Standard quality',
          'Basic support',
          'Watermarked images'
        ],
        button: 'Start Free'
      },
      pro: {
        title: 'Pro',
        description: 'Best for creators and artists who need more generations',
        features: [
          '100 generations per day',
          'HD quality',
          'Priority support',
          'No watermarks',
          'Commercial usage'
        ],
        button: 'Get Pro'
      },
      enterprise: {
        title: 'Enterprise',
        description: 'For teams and businesses with high-volume needs',
        features: [
          'Unlimited generations',
          'Ultra HD quality',
          'Dedicated support',
          'Custom integrations',
          'Team management'
        ],
        button: 'Contact Sales'
      }
    },
    errors: {
      generationFailed: 'Image generation failed. Please try again.',
      rateLimited: 'Too many requests. Please wait before trying again.',
      invalidInput: 'Please check your input and try again.',
      networkError: 'Network error. Please check your connection.'
    }
  },
  zh: {
    nav: {
      features: '功能特色',
      pricing: '价格方案',
      faq: '常见问题',
      login: '登录'
    },
    hero: {
      badge: '宫崎骏风格AI生成器！',
      title: '将您的想法转化为',
      titleHighlight: '宫崎骏风格',
      titleEnd: '艺术杰作',
      description: '通过文字描述创建令人惊叹的吉卜力工作室风格艺术作品，或将您的照片转换为魔法场景。体验AI驱动的艺术创作奇迹。',
      startCreating: '开始创作',
      viewGallery: '查看画廊'
    },
    generator: {
      title: '宫崎骏风格AI图像生成器',
      subtitle: '使用AI将您的想象转化为宫崎骏风格的艺术作品',
      inputSettings: '输入设置',
      inputDescription: '上传图像或输入文本以生成宫崎骏风格图像',
      referenceImage: '参考图片（可选）',
      dragAndDrop: '拖放或浏览文件',
      dragText: '上传图像以转换为宫崎骏风格（JPG、PNG、GIF、WebP，最大30MB）',
      removeImage: '移除图片',
      prompt: '提示词',
      promptPlaceholder: '描述您想要生成的图像...',
      aspectRatio: '纵横比',
      generateButton: '生成图片',
      generating: '生成中',
      output: '输出',
      downloadImage: '下载图片',
      history: '生成历史',
      noHistory: '还没有生成历史',
      examplePrompts: '灵感提示词',
      clickToUse: '点击使用此提示词'
    },
    pricing: {
      title: '选择您的方案',
      free: {
        title: '免费版',
        description: '非常适合试用我们的宫崎骏AI生成器',
        features: [
          '每日5次生成',
          '标准画质',
          '基础支持',
          '带水印图像'
        ],
        button: '免费开始'
      },
      pro: {
        title: '专业版',
        description: '最适合需要更多生成次数的创作者和艺术家',
        features: [
          '每日100次生成',
          '高清画质',
          '优先支持',
          '无水印',
          '商业使用'
        ],
        button: '获取专业版'
      },
      enterprise: {
        title: '企业版',
        description: '适合有大量需求的团队和企业',
        features: [
          '无限生成',
          '超高清画质',
          '专属支持',
          '定制集成',
          '团队管理'
        ],
        button: '联系销售'
      }
    },
    errors: {
      generationFailed: '图像生成失败，请重试。',
      rateLimited: '请求过于频繁，请稍后再试。',
      invalidInput: '请检查您的输入并重试。',
      networkError: '网络错误，请检查您的连接。'
    }
  }
} as const

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.')
  let value: any = translations[locale]
  
  for (const k of keys) {
    value = value?.[k]
    if (!value) break
  }
  
  return value || key
}
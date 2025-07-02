# Ghibli AI Image Generator v1.8

A modern, secure, and optimized AI-powered image generator that creates stunning Studio Ghibli-style artwork from text descriptions or transforms your photos into magical scenes.

![Ghibli AI Generator](./public/demo-img.jpg)

## ✨ Features

### 🎨 AI Image Generation
- **Text-to-Image**: Create Ghibli-style artwork from text descriptions
- **Image-to-Image**: Transform your photos into magical Ghibli scenes
- **Multiple Aspect Ratios**: Support for 1:1, 4:3, 3:4, 16:9, and 9:16 formats
- **High Quality Output**: Up to 2048x2048 resolution

### 🔒 Security & Performance
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Comprehensive security checks
- **Image Compression**: Automatic optimization for faster uploads
- **Error Boundaries**: Graceful error handling and recovery
- **Safe API Design**: No sensitive information exposure

### 🌍 User Experience
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching
- **Internationalization**: Support for English and Chinese
- **Real-time Progress**: Live generation progress with time estimates
- **History Management**: Smart local storage with automatic cleanup
- **Drag & Drop**: Intuitive file upload experience

### 🚀 Performance Optimizations
- **Code Splitting**: Dynamic imports for better loading times
- **Memo Optimization**: React.memo for expensive components
- **Custom Hooks**: Efficient state management
- **Lazy Loading**: Images load only when needed
- **Caching**: Smart caching strategies

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Custom hooks + Zustand
- **Authentication**: Supabase
- **Storage**: Cloudflare R2
- **AI APIs**: Replicate + Ismaque
- **Validation**: Zod
- **Error Handling**: React Error Boundary

## 📁 Project Structure

```
shadcn-landing-page-ghibli-1.8/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── generate/             # Image generation endpoint
│   │   └── download/             # Secure image download
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── layout/                   # Layout components
│   │   └── sections/             # Page sections
│   └── ui/                       # Reusable UI components
├── hooks/                        # Custom React hooks
│   ├── use-image-generation.ts   # Image generation logic
│   └── use-history.ts            # History management
├── lib/                          # Utility libraries
│   ├── validation.ts             # Input validation schemas
│   ├── error-handler.ts          # Error handling utilities
│   ├── rate-limiter.ts           # Rate limiting
│   ├── image-utils.ts            # Image processing utilities
│   └── i18n.ts                   # Internationalization
├── public/                       # Static assets
└── ...config files
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Required API keys (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shadcn-landing-page-ghibli-1.8
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys and configuration:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   
   # AI API Keys
   REPLICATE_API_TOKEN=your_replicate_token
   ISMAQUE_API_KEY=your_ismaque_key
   
   # Cloudflare R2 Configuration
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=your_bucket_name
   R2_PUBLIC_URL_BASE=your_public_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `REPLICATE_API_TOKEN` | Replicate API key for image-to-image | `r8_...` |
| `ISMAQUE_API_KEY` | Ismaque API key for text-to-image | `ism_...` |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | `abc123...` |
| `R2_ACCESS_KEY_ID` | R2 access key | `xyz789...` |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | `secret123...` |
| `R2_BUCKET_NAME` | R2 bucket name | `ghibli-images` |
| `R2_PUBLIC_URL_BASE` | R2 public URL base | `https://example.com` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `10` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `60000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | - |

## 🔧 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Key Components

- **AIGeneratorSection**: Main image generation interface
- **ErrorBoundary**: Handles runtime errors gracefully
- **LanguageSwitcher**: Internationalization support
- **PricingSection**: Updated with real pricing plans

### Custom Hooks

- **useImageGeneration**: Manages AI generation state and progress
- **useHistory**: Handles local storage and history management

## 🌟 What's New in v1.8

### Security Improvements
- ✅ Comprehensive input validation with Zod
- ✅ Rate limiting to prevent abuse
- ✅ Secure error handling (no sensitive data exposure)
- ✅ Domain whitelist for image downloads
- ✅ File size and type validation

### Performance Optimizations
- ✅ React.memo for expensive components
- ✅ Custom hooks for state management
- ✅ Image compression before upload
- ✅ Lazy loading for history images
- ✅ Error boundaries for graceful failures

### User Experience Enhancements
- ✅ Real-time progress with time estimates
- ✅ Improved drag & drop interface
- ✅ Better mobile responsiveness
- ✅ Internationalization (EN/ZH)
- ✅ Smart history management

### Code Quality
- ✅ TypeScript throughout
- ✅ Consistent error handling
- ✅ Modular architecture
- ✅ Comprehensive validation
- ✅ Performance monitoring ready

## 📊 API Reference

### POST /api/generate

Generate a new image using AI.

**Request Body:**
```json
{
  "prompt": "A peaceful village scene",
  "aspectRatio": "1:1",
  "quality": "standard",
  "input_image": "data:image/jpeg;base64,..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://...",
  "message": "Image generated successfully!",
  "stats": {
    "totalTime": "30000ms",
    "model": "flux-kontext-pro",
    "aspectRatio": "1:1",
    "promptLength": 25
  }
}
```

### POST /api/download

Securely download an image.

**Request Body:**
```json
{
  "imageUrl": "https://...",
  "filename": "ghibli-art.png"
}
```

## 🎨 Customization

### Styling
The project uses Tailwind CSS with shadcn/ui components. Customize the theme in:
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Global styles
- `components/ui/` - UI component customization

### Adding New Features
1. Create new components in `components/`
2. Add custom hooks in `hooks/` if needed
3. Update validation schemas in `lib/validation.ts`
4. Add new API routes in `app/api/`

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS Amplify

Make sure to set all environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@ghibli-ai-generator.com
- 💬 Discord: [Join our community](https://discord.gg/ghibli-ai)
- 📖 Documentation: [docs.ghibli-ai-generator.com](https://docs.ghibli-ai-generator.com)

## 🙏 Acknowledgments

- [Studio Ghibli](https://www.ghibli.jp/) for the inspiration
- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Replicate](https://replicate.com/) for AI model hosting
- [Ismaque](https://ismaque.org/) for text-to-image API
- [Cloudflare](https://cloudflare.com/) for R2 storage

---

**Built with ❤️ for the Studio Ghibli community**
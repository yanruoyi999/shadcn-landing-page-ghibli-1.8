"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-950">
      <Card className="w-full max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              支付已取消
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              您的支付过程已被取消，没有产生任何费用
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">为什么会取消支付？</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 您主动取消了支付过程</li>
              <li>• 支付信息验证失败</li>
              <li>• 网络连接问题</li>
              <li>• 浏览器会话超时</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">您可以选择：</h3>
            <div className="grid gap-3">
              <Link href="/pricing" className="block">
                <Button className="w-full justify-between group">
                  <RefreshCw className="h-4 w-4" />
                  重新尝试支付
                  <div></div>
                </Button>
              </Link>
              
              <Link href="/#ai-generator" className="block">
                <Button variant="outline" className="w-full justify-between group">
                  继续使用免费版
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="w-full"
              >
                返回首页
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">需要帮助？</h3>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                如果您在支付过程中遇到问题，我们随时为您提供帮助：
              </p>
              <div className="space-y-1 text-sm">
                <p>📧 邮箱: support@ghibli-ai.com</p>
                <p>💬 在线客服: 工作日 9:00-18:00</p>
                <p>📞 电话: 400-123-4567</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>您可以随时回来完成订阅，您的账户信息已保存。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
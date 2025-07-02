"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function UserNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Signed out successfully')
        window.location.reload()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button asChild size="sm" variant="outline">
        <a href="/login">Sign In</a>
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        className="relative h-8 w-8 rounded-full"
        onClick={() => setShowMenu(!showMenu)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
          <AvatarFallback>
            {user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>
      
      {showMenu && (
        <div className="absolute right-0 top-10 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50">
          <div className="px-2 py-1.5 text-sm font-semibold">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <div className="-mx-1 my-1 h-px bg-muted"></div>
          <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </button>
          <div className="-mx-1 my-1 h-px bg-muted"></div>
          <button 
            onClick={handleSignOut}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  )
} 
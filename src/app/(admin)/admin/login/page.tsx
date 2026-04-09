'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Pick up ?error=unauthorized from proxy redirect
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'unauthorized') {
      setError('Your account does not have admin privileges. Contact the administrator.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    // Verify user has admin role BEFORE attempting navigation
    const role = data.user?.user_metadata?.role
    if (role !== 'admin') {
      setError(
        'Login successful, but your account does not have admin privileges. ' +
        'Run the admin setup script or update your user metadata in Supabase to set role to "admin".'
      )
      await supabase.auth.signOut()
      setIsLoading(false)
      return
    }

    router.push('/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-rich-black -m-8 p-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Pixenox</h1>
          <p className="text-white/60">Sign in to the Admin Platform</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
             <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
             </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/80" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              className="admin-input" 
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/80" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="admin-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="admin-button mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-rich-black"><div className="text-white">Loading...</div></div>}>
      <LoginContent />
    </Suspense>
  )
}

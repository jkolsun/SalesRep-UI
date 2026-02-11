'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showClearRetry, setShowClearRetry] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  // Clear ALL browser storage including cookies and retry login
  const handleClearAndRetry = () => {
    if (typeof window !== 'undefined') {
      // Clear ALL localStorage
      localStorage.clear()
      // Clear ALL sessionStorage
      sessionStorage.clear()
      // Clear ALL cookies for this domain
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
    }
    setShowClearRetry(false)
    // Reload the page to get a fresh state
    window.location.reload()
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      setShowClearRetry(true)
      toast({
        title: 'Login Timeout',
        description: 'Login is taking too long. Click "Clear & Retry" below.',
        variant: 'destructive',
      })
    }, 10000) // 10 second timeout

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        clearTimeout(timeoutId)
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid email or password',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Get user role from profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
        }

        clearTimeout(timeoutId)
        toast({
          title: 'Welcome back!',
          description: 'Login successful',
          variant: 'success',
        })

        // Redirect based on role (default to rep if profile not found)
        const role = profile?.role || 'rep'
        const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/rep/dashboard'

        // Force redirect
        window.location.replace(redirectUrl)
        return
      } else {
        clearTimeout(timeoutId)
        setIsLoading(false)
      }
    } catch (error) {
      clearTimeout(timeoutId)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="https://www.brightautomations.org/images/Bright_AutoLOGO.png"
              alt="Bright Automations"
              width={180}
              height={45}
              className="h-10 w-auto mx-auto"
            />
          </Link>
        </div>

        <Card className="border-white/10 bg-brand-surface/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your sales dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({ ...errors, email: undefined })
                    }}
                    className={`pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors({ ...errors, password: undefined })
                    }}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-gray-400 cursor-pointer"
                >
                  Remember me for 30 days
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Clear & Retry Button - shows after timeout */}
              {showClearRetry && (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full h-11 mt-3"
                  onClick={handleClearAndRetry}
                >
                  Clear Cache & Retry
                </Button>
              )}
            </form>

            {/* Sign Up Link */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-brand-surface px-2 text-gray-500">
                  New to Bright Automations?
                </span>
              </div>
            </div>

            <Link href="/signup">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Create an Account
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to our{' '}
          <Link href="#" className="text-teal-400 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="text-teal-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

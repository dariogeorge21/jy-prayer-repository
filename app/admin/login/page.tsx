'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Verify admin status
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('is_active', true)
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        throw new Error('You do not have admin access')
      }

      // Update last login timestamp (in updated_at since last_login isn't in schema)
      await supabase
        .from('admin_users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', authData.user.id)

      // Redirect to dashboard
      router.push('/admin/dashboard')
      router.refresh()

    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gradient mb-2">
            Vitanova Admin
          </h1>
          <p className="text-gray-500">Prayer Repository Management</p>
        </div>

        {/* Login Form */}
        <div className="prayer-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                         text-gray-100 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         transition-all"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface-elevated border border-gray-700 rounded-md
                         text-gray-100 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Protected admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}

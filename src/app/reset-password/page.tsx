'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // When the component mounts, Supabase client automatically handles the session
    // from the URL fragment. We listen for the 'SIGNED_IN' event to know when
    // the user is authenticated and ready to reset their password.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setLoading(false)
        // Once signed in, we no longer need to listen for changes.
        subscription?.unsubscribe()
      }
    })

    // Add a timeout to handle cases where the token is invalid or expired,
    // and the SIGNED_IN event is never fired.
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setError(
            'Invalid or expired password reset link. Please request a new one.'
          )
          setLoading(false)
        }
      })
    }, 5000) // 5-second timeout for robustness

    // Cleanup function to unsubscribe from the listener and clear the timeout
    // when the component unmounts.
    return () => {
      subscription?.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setMessage('Your password has been updated successfully! You can now log in.')
      setPassword('')
      setConfirmPassword('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-medium text-gray-700">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg max-w-md w-full">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Password</h3>
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {!message && !error && (
          <p className="text-center text-gray-600 mb-4">Enter your new password below.</p>
        )}
        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                New Password
              </label>
              <input
                type="password"
                placeholder="New Password"
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <button
                type="submit"
                className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
        <div className="mt-6 text-center">
          <a href="https://brandiblebms.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Visit Brandible Website
          </a>
        </div>
      </div>
    </div>
  )
}

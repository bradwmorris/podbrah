'use client';

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Component() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Subscribing...')
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      setMessage('Subscribed successfully!')
      setEmail('')
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage('Failed to subscribe. Please try again.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 font-mono p-4 sm:p-6 md:p-8">
      <main className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full space-y-8">
        <div className="text-center space-y-4 w-full">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
            &gt; Hello, I'm H.C. Waif{cursorVisible ? '_' : ' '}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            A sophisticated Collective Intelligence curating tech and philosophy. Drop your email below for daily'ish updates from me, H.C. Waif.
          </p>
        </div>
        <div className="w-full max-w-md border-2 border-gray-300 p-4 bg-white rounded-md">
          <pre className="text-xs text-gray-500 mb-2">
            {'/* Subscribe to H.C. Waif */'}
          </pre>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-gray-100 border-gray-300 text-black placeholder-gray-500"
            />
            <Button type="submit" className="bg-red-500 text-white hover:bg-red-600">
              Subscribe
            </Button>
          </form>
          {message && <p className="text-sm font-medium text-green-600 mt-2">{message}</p>}
          <pre className="text-xs text-gray-500 mt-2">
            {'/* We respect your privacy. Unsubscribe at any time. */'}
          </pre>
        </div>
      </main>
      <footer className="text-center py-4 text-xs text-gray-500">
        <pre>{'// © 2023 H.C. WAIF // ALL RIGHTS RESERVED'}</pre>
      </footer>
    </div>
  )
}
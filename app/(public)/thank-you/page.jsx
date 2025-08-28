import React from 'react'
import { Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function page() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-white" />
        </div>
        
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Thank You!
        </h1>
        
        {/* Message */}
        <p className="text-primary text-lg mb-8 leading-relaxed">
          Your message has been sent successfully. We'll get back to you as soon as possible.
        </p>
        
        {/* Back Button */}
        <Button asChild>
        <Link 
          href="/"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        </Button>
      </div>
    </div>
  )
}
import React from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function PaymentSuccessPage({ cache }) {
  const { title } = cache
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="bg-muted p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground">
                Your <span className='font-bold'>{title} </span>has been added to your account
              </p>
            </div>
            
            {/* Next Steps */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                A confirmation email has been sent to your inbox
              </p>
              
              <div className="flex flex-col gap-2">
                <Button className="w-full" asChild>
                  <Link href="/home" className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Footer */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Calendar, Sparkles, Users, BarChart3, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthModal } from '@/components/auth/AuthModal'
import { EnvCheck } from '@/components/auth/EnvCheck'
import { useAuthStore } from '@/lib/store'

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered event creation with intelligent suggestions for names, descriptions, and timing.'
  },
  {
    icon: Users,
    title: 'Guest Management',
    description: 'Easy guest invitations with secure access links and RSVP tracking.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track event performance, guest engagement, and attendance metrics.'
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description: 'Get personalized suggestions for event content, reminders, and follow-up messages.'
  }
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const { user } = useAuthStore()

  const handleGetStarted = () => {
    setAuthMode('signup')
    setIsAuthModalOpen(true)
  }

  const handleSignIn = () => {
    setAuthMode('signin')
    setIsAuthModalOpen(true)
  }

  if (user) {
    // Redirect to dashboard if user is logged in
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MeetBase</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleSignIn}>Sign In</Button>
            <Button onClick={handleGetStarted}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI-Powered Event Planning
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, manage, and schedule events with intelligent AI assistance. 
            Get professional suggestions for event names, descriptions, and messaging.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <div className="flex-1 w-full">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleGetStarted}
              disabled={isLoading || !email}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Starting...' : 'Get Started'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need for event planning</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to make event management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of event organizers who trust MeetBase for their scheduling needs.
          </p>
          <Button size="lg" onClick={handleGetStarted}>
            Start Planning Events
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 MeetBase-AI event management. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />

      {/* Environment Check (Development Only) */}
      <EnvCheck />
    </div>
  )
}
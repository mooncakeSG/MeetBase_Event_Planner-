'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2,
  Lightbulb,
  Calendar,
  Users,
  Mail
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface BaseMindProps {
  className?: string
}

export function BaseMind({ className }: BaseMindProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m BaseMind, your MeetBase AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const quickActions = [
    {
      icon: Calendar,
      label: 'Create Event',
      action: 'How do I create a new event?'
    },
    {
      icon: Users,
      label: 'Invite Guests',
      action: 'How do I invite guests to an event?'
    },
    {
      icon: Mail,
      label: 'Send Emails',
      action: 'How do I send email invitations?'
    },
    {
      icon: Lightbulb,
      label: 'Get Tips',
      action: 'What are some tips for using MeetBase?'
    }
  ]

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          context: {
            currentPage: window.location.pathname,
            userAgent: navigator.userAgent
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I couldn\'t process your request. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('BaseMind chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please check your internet connection and try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickAction = (action: string) => {
    sendMessage(action)
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hi! I\'m BaseMind, your MeetBase AI assistant. How can I help you today?',
        timestamp: new Date()
      }
    ])
  }

  return (
    <>
      {/* Floating AI Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl transition-all duration-300 ${
          isOpen ? 'scale-90' : 'scale-100'
        } ${className}`}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-28 right-6 z-50 w-80 h-96 shadow-2xl border-0 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">BaseMind</CardTitle>
                <Badge variant="secondary" className="text-xs">AI Assistant</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="h-4 w-4 mt-0.5 shrink-0" />
                      )}
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        BaseMind is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="p-4 border-t">
                <div className="text-xs text-gray-500 mb-2">Quick Actions:</div>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.action)}
                      className="h-8 text-xs justify-start"
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t pb-6">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask BaseMind anything..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputValue.trim() || isLoading}
                  className="px-3 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}

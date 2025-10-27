'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AIHelperProps {
  prompt: string
  context?: string
  onSuggestion: (suggestion: string) => void
}

export function AIHelper({ prompt, context, onSuggestion }: AIHelperProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const getAISuggestions = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    console.log('Getting AI suggestions for:', { prompt, context })
    
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
        }),
      })

      console.log('AI API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('AI API Error:', errorText)
        throw new Error(`Failed to get AI suggestions: ${response.status}`)
      }

      const data = await response.json()
      
      // Parse the AI response to extract suggestions
      const suggestionText = data.suggestion || ''
      console.log('AI Response:', suggestionText) // Debug log
      
      // Better parsing for AI responses
      let suggestionList = []
      
      if (suggestionText.includes('1.') && suggestionText.includes('2.') && suggestionText.includes('3.')) {
        // Parse numbered list format
        suggestionList = suggestionText
          .split('\n')
          .map((line: string) => {
            // Remove numbering and formatting
            return line
              .replace(/^\d+\.\s*/, '')
              .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
              .replace(/^[-•]\s*/, '') // Remove bullet points
              .trim()
          })
          .filter((line: string) => line.length > 0 && !line.includes('Here are') && !line.includes('suggestions'))
          .slice(0, 3)
      } else {
        // Fallback: split by lines and clean up
        suggestionList = suggestionText
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0 && !line.includes('Here are') && !line.includes('suggestions'))
          .slice(0, 3)
      }

      // If we still don't have good suggestions, use the original text
      if (suggestionList.length === 0) {
        suggestionList = [suggestionText.substring(0, 100) + '...']
      }

      setSuggestions(suggestionList)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error getting AI suggestions:', error)
      // Fallback suggestions
      setSuggestions([
        'Professional networking event',
        'Team building workshop',
        'Business conference'
      ])
      setShowSuggestions(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestion(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={getAISuggestions}
        disabled={isLoading || !prompt.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Getting AI suggestions...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Get AI Suggestions
          </>
        )}
      </Button>

      {showSuggestions && suggestions.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                AI Suggestions:
              </p>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="text-sm">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

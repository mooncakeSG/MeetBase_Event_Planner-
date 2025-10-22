import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Call the FastAPI backend for real AI suggestions
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    try {
      const response = await fetch(`${backendUrl}/ai/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (backendError) {
      console.error('Backend AI call failed:', backendError)
      
      // Fallback to mock suggestions if backend is unavailable
      const mockSuggestions = [
        'Professional networking event',
        'Team building workshop', 
        'Business conference',
        'Product launch celebration',
        'Client appreciation dinner',
        'Industry summit',
        'Training session',
        'Board meeting',
        'Annual company retreat',
        'Customer feedback session'
      ]

      // Return 3 random suggestions as fallback
      const suggestions = mockSuggestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((suggestion, index) => `${index + 1}. ${suggestion}`)
        .join('\n')

      return NextResponse.json({
        suggestion: suggestions,
        model: 'fallback-mock-model'
      })
    }

  } catch (error) {
    console.error('AI suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI suggestions' },
      { status: 500 }
    )
  }
}

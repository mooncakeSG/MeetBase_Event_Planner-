'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  response?: any
  error?: string
}

export default function TestValidationPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [customTest, setCustomTest] = useState({
    to: 'test@example.com',
    subject: 'Custom Test Email',
    html: '<p>This is a custom test email</p>'
  })

  const validationTests = [
    {
      name: 'Valid Email Send',
      data: {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email</p>',
        text: 'This is a test email'
      },
      expectedStatus: 200
    },
    {
      name: 'Invalid Email Address',
      data: {
        to: 'invalid-email',
        subject: 'Test Email',
        html: '<p>This is a test email</p>'
      },
      expectedStatus: 400
    },
    {
      name: 'Missing Required Fields',
      data: {
        to: 'test@example.com'
        // Missing subject and html
      },
      expectedStatus: 400
    },
    {
      name: 'Subject Too Long',
      data: {
        to: 'test@example.com',
        subject: 'A'.repeat(250), // Exceeds 200 character limit
        html: '<p>This is a test email</p>'
      },
      expectedStatus: 400
    },
    {
      name: 'Empty HTML Content',
      data: {
        to: 'test@example.com',
        subject: 'Test Email',
        html: ''
      },
      expectedStatus: 400
    },
    {
      name: 'HTML with Script Tags (XSS Test)',
      data: {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p><script>alert("xss")</script><p>More content</p>'
      },
      expectedStatus: 200 // Should sanitize and send
    }
  ]

  const runValidationTests = async () => {
    setIsRunning(true)
    setTestResults([])

    for (const test of validationTests) {
      const testResult: TestResult = {
        name: test.name,
        status: 'running'
      }
      setTestResults(prev => [...prev, testResult])

      try {
        const response = await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(test.data)
        })

        const result = await response.json()

        const updatedResult: TestResult = {
          name: test.name,
          status: response.status === test.expectedStatus ? 'passed' : 'failed',
          response: {
            status: response.status,
            data: result
          }
        }

        setTestResults(prev => 
          prev.map(r => r.name === test.name ? updatedResult : r)
        )

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        const updatedResult: TestResult = {
          name: test.name,
          status: 'failed',
          error: (error as Error).message
        }

        setTestResults(prev => 
          prev.map(r => r.name === test.name ? updatedResult : r)
        )
      }
    }

    setIsRunning(false)
    toast.success('Validation tests completed!')
  }

  const runCustomTest = async () => {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customTest)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Custom test email sent successfully!')
      } else {
        toast.error(`Test failed: ${result.error}`)
      }

    } catch (error) {
      toast.error(`Test error: ${(error as Error).message}`)
    }
  }

  const runRateLimitTest = async () => {
    setIsRunning(true)
    toast.info('Running rate limit test (sending 12 emails quickly)...')

    const promises = []
    for (let i = 0; i < 12; i++) {
      promises.push(
        fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: 'ratelimit-test@example.com',
            subject: `Rate Limit Test ${i + 1}`,
            html: '<p>Testing rate limits</p>'
          })
        })
      )
    }

    try {
      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))

      let successCount = 0
      let rateLimitedCount = 0

      responses.forEach((response, index) => {
        if (response.status === 200) {
          successCount++
        } else if (response.status === 429) {
          rateLimitedCount++
        }
      })

      toast.success(`Rate limit test completed: ${successCount} successful, ${rateLimitedCount} rate limited`)
    } catch (error) {
      toast.error(`Rate limit test failed: ${(error as Error).message}`)
    }

    setIsRunning(false)
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'running':
        return <Badge variant="secondary">Running...</Badge>
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
    }
  }

  const passedTests = testResults.filter(r => r.status === 'passed').length
  const totalTests = testResults.length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validation & Logging Tests</h1>
        <p className="text-muted-foreground">
          Test the email validation, rate limiting, and logging functionality
        </p>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runValidationTests} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Running Tests...' : 'Run Validation Tests'}
            </Button>
            <Button 
              onClick={runRateLimitTest} 
              disabled={isRunning}
              variant="outline"
            >
              Test Rate Limiting
            </Button>
          </div>
          
          {totalTests > 0 && (
            <div className="text-sm text-muted-foreground">
              Progress: {passedTests}/{totalTests} tests passed
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Test */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Email Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="to">Recipient Email</Label>
              <Input
                id="to"
                value={customTest.to}
                onChange={(e) => setCustomTest(prev => ({ ...prev, to: e.target.value }))}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={customTest.subject}
                onChange={(e) => setCustomTest(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Test Email Subject"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="html">HTML Content</Label>
            <Textarea
              id="html"
              value={customTest.html}
              onChange={(e) => setCustomTest(prev => ({ ...prev, html: e.target.value }))}
              placeholder="<p>Your HTML content here</p>"
              rows={4}
            />
          </div>
          <Button onClick={runCustomTest} disabled={isRunning}>
            Send Custom Test Email
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  {result.response && (
                    <div className="text-sm text-muted-foreground">
                      Status: {result.response.status}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-sm text-red-600">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. <strong>Validation Tests:</strong> Tests input validation, email format checking, and XSS protection</p>
          <p>2. <strong>Rate Limiting Test:</strong> Sends 12 emails quickly to test rate limiting (limit is 10/minute)</p>
          <p>3. <strong>Custom Test:</strong> Send a custom email to test the full flow</p>
          <p>4. <strong>Check Console:</strong> Open browser dev tools to see structured logging output</p>
          <p>5. <strong>Check Server:</strong> Look at the terminal running the dev server for detailed logs</p>
        </CardContent>
      </Card>
    </div>
  )
}

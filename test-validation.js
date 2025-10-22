// Test script for validation and logging functionality
// Run this in the browser console or as a Node.js script

const API_BASE = 'http://localhost:3000/api'

// Test cases for validation
const testCases = [
  {
    name: 'Valid Email Send',
    endpoint: '/email/send',
    data: {
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email</p>',
      text: 'This is a test email',
      eventId: '123e4567-e89b-12d3-a456-426614174000'
    },
    expectedStatus: 200
  },
  {
    name: 'Invalid Email Address',
    endpoint: '/email/send',
    data: {
      to: 'invalid-email',
      subject: 'Test Email',
      html: '<p>This is a test email</p>'
    },
    expectedStatus: 400
  },
  {
    name: 'Missing Required Fields',
    endpoint: '/email/send',
    data: {
      to: 'test@example.com'
      // Missing subject and html
    },
    expectedStatus: 400
  },
  {
    name: 'Subject Too Long',
    endpoint: '/email/send',
    data: {
      to: 'test@example.com',
      subject: 'A'.repeat(250), // Exceeds 200 character limit
      html: '<p>This is a test email</p>'
    },
    expectedStatus: 400
  },
  {
    name: 'Empty HTML Content',
    endpoint: '/email/send',
    data: {
      to: 'test@example.com',
      subject: 'Test Email',
      html: ''
    },
    expectedStatus: 400
  },
  {
    name: 'Invalid Event ID Format',
    endpoint: '/email/send',
    data: {
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email</p>',
      eventId: 'invalid-uuid'
    },
    expectedStatus: 400
  },
  {
    name: 'HTML with Script Tags (XSS Test)',
    endpoint: '/email/send',
    data: {
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Test</p><script>alert("xss")</script><p>More content</p>'
    },
    expectedStatus: 200 // Should sanitize and send
  }
]

// Rate limiting test
const rateLimitTest = {
  name: 'Rate Limiting Test',
  endpoint: '/email/send',
  data: {
    to: 'test@example.com',
    subject: 'Rate Limit Test',
    html: '<p>Testing rate limits</p>'
  },
  iterations: 12, // Should trigger rate limit (limit is 10)
  expectedStatus: 429
}

async function testValidation() {
  console.log('🧪 Starting Validation Tests...\n')
  
  let passed = 0
  let failed = 0
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`)
      
      const response = await fetch(`${API_BASE}${testCase.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      })
      
      const result = await response.json()
      
      if (response.status === testCase.expectedStatus) {
        console.log(`✅ PASSED - Status: ${response.status}`)
        if (response.status >= 400) {
          console.log(`   Error details:`, result.error || result.details)
        }
        passed++
      } else {
        console.log(`❌ FAILED - Expected: ${testCase.expectedStatus}, Got: ${response.status}`)
        console.log(`   Response:`, result)
        failed++
      }
      
      // Check for rate limit headers
      if (response.headers.get('X-RateLimit-Limit')) {
        console.log(`   Rate limit headers:`, {
          limit: response.headers.get('X-RateLimit-Limit'),
          remaining: response.headers.get('X-RateLimit-Remaining'),
          reset: response.headers.get('X-RateLimit-Reset')
        })
      }
      
    } catch (error) {
      console.log(`❌ ERROR - ${testCase.name}:`, error.message)
      failed++
    }
    
    console.log('') // Empty line for readability
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`\n📊 Validation Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)
  
  return { passed, failed }
}

async function testRateLimiting() {
  console.log('\n🚦 Starting Rate Limiting Test...\n')
  
  const promises = []
  
  for (let i = 0; i < rateLimitTest.iterations; i++) {
    promises.push(
      fetch(`${API_BASE}${rateLimitTest.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...rateLimitTest.data,
          subject: `${rateLimitTest.data.subject} ${i + 1}`
        })
      })
    )
  }
  
  const responses = await Promise.all(promises)
  const results = await Promise.all(responses.map(r => r.json()))
  
  let successCount = 0
  let rateLimitedCount = 0
  
  responses.forEach((response, index) => {
    if (response.status === 200) {
      successCount++
    } else if (response.status === 429) {
      rateLimitedCount++
      console.log(`🚫 Request ${index + 1} rate limited`)
    } else {
      console.log(`⚠️  Request ${index + 1} failed with status: ${response.status}`)
    }
  })
  
  console.log(`\n📊 Rate Limiting Results:`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`🚫 Rate Limited: ${rateLimitedCount}`)
  console.log(`📈 Rate Limit Effectiveness: ${rateLimitedCount > 0 ? 'Working' : 'Not Working'}`)
  
  return { successCount, rateLimitedCount }
}

async function testLogging() {
  console.log('\n📝 Testing Logging Functionality...\n')
  
  // Send a valid email to test logging
  try {
    const response = await fetch(`${API_BASE}/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'logging-test@example.com',
        subject: 'Logging Test Email',
        html: '<p>This email is for testing logging functionality</p>',
        eventId: '123e4567-e89b-12d3-a456-426614174000'
      })
    })
    
    const result = await response.json()
    
    if (response.status === 200) {
      console.log('✅ Logging test email sent successfully')
      console.log(`   Message ID: ${result.messageId}`)
      console.log(`   Preview URL: ${result.previewUrl || 'N/A'}`)
    } else {
      console.log('❌ Logging test failed:', result)
    }
    
  } catch (error) {
    console.log('❌ Logging test error:', error.message)
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Validation Tests\n')
  console.log('=' * 50)
  
  try {
    // Test validation
    const validationResults = await testValidation()
    
    // Test rate limiting
    const rateLimitResults = await testRateLimiting()
    
    // Test logging
    await testLogging()
    
    console.log('\n' + '=' * 50)
    console.log('🎯 Final Test Summary:')
    console.log(`Validation Tests: ${validationResults.passed}/${validationResults.passed + validationResults.failed} passed`)
    console.log(`Rate Limiting: ${rateLimitResults.rateLimitedCount > 0 ? 'Working' : 'Not Working'}`)
    console.log('Logging: Check server console for structured logs')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testValidation = runAllTests
  console.log('🧪 Test functions loaded! Run testValidation() to start testing.')
} else {
  // Run tests if executed directly
  runAllTests()
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Mail, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Users,
  RefreshCw,
  Loader2,
  RotateCcw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface EmailRecord {
  id: string
  recipient: string
  subject: string
  status: 'sent' | 'failed'
  provider: string
  message_id?: string
  error?: string
  created_at: string
  event_id?: string
  event_name?: string
}

export function EmailHistory() {
  const [emails, setEmails] = useState<EmailRecord[]>([])
  const [filteredEmails, setFilteredEmails] = useState<EmailRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<{
    totalSent: number
    totalFailed: number
    deliveryRate: number
    gmailCount: number
    etherealCount: number
  }>({
    totalSent: 0,
    totalFailed: 0,
    deliveryRate: 0,
    gmailCount: 0,
    etherealCount: 0
  })

  // Fetch email history from Supabase
  const fetchEmailHistory = async () => {
    try {
      setRefreshing(true)
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('User not authenticated:', userError)
        return
      }

      // Fetch email messages with event details
      const { data: emailMessages, error } = await supabase
        .from('email_messages')
        .select(`
          id,
          recipient,
          subject,
          status,
          provider,
          message_id,
          error,
          created_at,
          event_id,
          events!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching email history:', error)
        toast.error('Failed to load email history', {
          description: error.message
        })
        return
      }

      // Transform the data to match our interface
      const transformedEmails: EmailRecord[] = (emailMessages || []).map(msg => ({
        id: msg.id,
        recipient: msg.recipient,
        subject: msg.subject,
        status: msg.status,
        provider: msg.provider,
        message_id: msg.message_id,
        error: msg.error,
        created_at: msg.created_at,
        event_id: msg.event_id,
        event_name: (msg.events as any)?.name || 'Unknown Event'
      }))

      setEmails(transformedEmails)
      setFilteredEmails(transformedEmails)

      // Calculate metrics
      const totalSent = transformedEmails.filter(e => e.status === 'sent').length
      const totalFailed = transformedEmails.filter(e => e.status === 'failed').length
      const total = transformedEmails.length
      const deliveryRate = total > 0 ? (totalSent / total) * 100 : 0
      const gmailCount = transformedEmails.filter(e => e.provider === 'gmail').length
      const etherealCount = transformedEmails.filter(e => e.provider === 'ethereal').length

      setMetrics({
        totalSent,
        totalFailed,
        deliveryRate,
        gmailCount,
        etherealCount
      })
    } catch (error) {
      console.error('Unexpected error fetching email history:', error)
      toast.error('Failed to load email history', {
        description: (error as Error).message
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchEmailHistory()
  }, [])

  // Filter emails based on search and filters
  useEffect(() => {
    let filtered = emails

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(email => 
        email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (email.event_name && email.event_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(email => email.status === statusFilter)
    }

    // Provider filter
    if (providerFilter !== 'all') {
      filtered = filtered.filter(email => email.provider === providerFilter)
    }

    setFilteredEmails(filtered)
  }, [emails, searchTerm, statusFilter, providerFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return <Mail className="h-4 w-4 text-blue-500" />
      case 'ethereal':
        return <Mail className="h-4 w-4 text-purple-500" />
      default:
        return <Mail className="h-4 w-4 text-gray-500" />
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Recipient', 'Subject', 'Status', 'Provider', 'Sent At', 'Event', 'Message ID', 'Error'],
      ...filteredEmails.map(email => [
        email.recipient,
        email.subject,
        email.status,
        email.provider,
        new Date(email.created_at).toLocaleString(),
        email.event_name || 'Unknown',
        email.message_id || '',
        email.error || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `email-history-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleResendEmail = async (email: EmailRecord) => {
    if (email.status !== 'failed') {
      toast.error('Can only resend failed emails')
      return
    }

    try {
      setResendingEmailId(email.id)

      // For resend, we need to reconstruct the email content
      // Since we don't store the original HTML, we'll create a simple resend notification
      const resendHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
            Email Resend - ${email.subject}
          </h2>
          <p style="color: #666; line-height: 1.6;">
            This is a resend of a previously failed email. The original email was sent on 
            ${new Date(email.created_at).toLocaleString()}.
          </p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #333;"><strong>Original Subject:</strong> ${email.subject}</p>
            <p style="margin: 5px 0 0 0; color: #666;"><strong>Event:</strong> ${email.event_name || 'Unknown Event'}</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, please contact the event organizer.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This email was automatically resent by MeetBase
          </p>
        </div>
      `

      const response = await fetch('/api/email/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId: email.id,
          recipient: email.recipient,
          subject: email.subject,
          html: resendHtml,
          text: `Email Resend - ${email.subject}\n\nThis is a resend of a previously failed email.`,
          eventId: email.event_id
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Email resent successfully!', {
          description: `Email sent to ${email.recipient}`
        })
        // Refresh the email history to show updated status
        await fetchEmailHistory()
      } else {
        toast.error('Failed to resend email', {
          description: data.error || 'Unknown error occurred'
        })
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Failed to resend email', {
        description: (error as Error).message
      })
    } finally {
      setResendingEmailId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Email History</h2>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email History</h2>
          <p className="text-muted-foreground">
            Track all sent emails and their delivery status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchEmailHistory} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Email Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSent}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.totalFailed}</div>
            <p className="text-xs text-muted-foreground">
              Delivery failures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.gmailCount + metrics.etherealCount}</div>
            <p className="text-xs text-muted-foreground">
              Gmail: {metrics.gmailCount}, Ethereal: {metrics.etherealCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Providers</option>
                <option value="gmail">Gmail</option>
                <option value="ethereal">Ethereal</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-muted-foreground">
                {filteredEmails.length} of {emails.length} emails
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      <div className="space-y-3">
        {filteredEmails.map(email => (
          <Card key={email.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(email.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{email.recipient}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{email.subject}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        {getProviderIcon(email.provider)}
                        <span className="text-xs text-muted-foreground capitalize">{email.provider}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(email.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{email.event_name}</span>
                      </div>
                    </div>
                    {email.error && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        <strong>Error:</strong> {email.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <Badge className={getStatusColor(email.status)}>
                      {email.status}
                    </Badge>
                    {email.message_id && (
                      <div className="text-xs text-muted-foreground mt-1">
                        ID: {email.message_id.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {email.status === 'failed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResendEmail(email)}
                        disabled={resendingEmailId === email.id}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        {resendingEmailId === email.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredEmails.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No emails found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


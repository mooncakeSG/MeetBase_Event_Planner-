// Structured logging service for observability
export interface LogContext {
  userId?: string
  eventId?: string
  emailId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  [key: string]: any
}

export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
  duration?: number
  metadata?: Record<string, any>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLogEntry(entry: LogEntry): string {
    const baseLog = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.error && { error: entry.error }),
      ...(entry.duration && { duration: entry.duration }),
      ...(entry.metadata && { metadata: entry.metadata })
    }

    return JSON.stringify(baseLog)
  }

  private log(level: LogEntry['level'], message: string, context?: LogContext, error?: Error, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      } : undefined,
      metadata
    }

    const formattedLog = this.formatLogEntry(entry)
    
    // Console output for development
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn : 
                           level === 'debug' ? console.debug : console.log
      consoleMethod(formattedLog)
    }

    // In production, you would send to external logging service
    // Example: sendToExternalLogger(formattedLog)
  }

  info(message: string, context?: LogContext, metadata?: Record<string, any>) {
    this.log('info', message, context, undefined, metadata)
  }

  warn(message: string, context?: LogContext, metadata?: Record<string, any>) {
    this.log('warn', message, context, undefined, metadata)
  }

  error(message: string, error?: Error, context?: LogContext, metadata?: Record<string, any>) {
    this.log('error', message, context, error, metadata)
  }

  debug(message: string, context?: LogContext, metadata?: Record<string, any>) {
    if (this.isDevelopment) {
      this.log('debug', message, context, undefined, metadata)
    }
  }

  // Email-specific logging methods
  emailSent(recipient: string, subject: string, eventId?: string, messageId?: string, context?: LogContext) {
    this.info('Email sent successfully', {
      ...context,
      emailId: messageId,
      eventId,
      recipient: this.sanitizeEmail(recipient)
    }, {
      subject: subject.substring(0, 100), // Truncate for privacy
      messageId
    })
  }

  emailFailed(recipient: string, subject: string, error: Error, eventId?: string, context?: LogContext) {
    this.error('Email sending failed', error, {
      ...context,
      eventId,
      recipient: this.sanitizeEmail(recipient)
    }, {
      subject: subject.substring(0, 100),
      errorType: error.name
    })
  }

  emailResent(originalEmailId: string, recipient: string, subject: string, eventId?: string, context?: LogContext) {
    this.info('Email resent successfully', {
      ...context,
      eventId,
      recipient: this.sanitizeEmail(recipient)
    }, {
      originalEmailId,
      subject: subject.substring(0, 100)
    })
  }

  apiRequest(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    this.info('API request completed', {
      ...context,
      method,
      path,
      statusCode
    }, {
      duration
    })
  }

  rateLimitExceeded(identifier: string, limit: number, context?: LogContext) {
    this.warn('Rate limit exceeded', {
      ...context,
      identifier: this.sanitizeIdentifier(identifier)
    }, {
      limit
    })
  }

  // Privacy helpers
  private sanitizeEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (!domain) return email
    return `${local.substring(0, 2)}***@${domain}`
  }

  private sanitizeIdentifier(identifier: string): string {
    // Sanitize IP addresses and other identifiers
    if (identifier.includes('.')) {
      return identifier.split('.').slice(0, 2).join('.') + '.***'
    }
    return identifier.substring(0, 8) + '***'
  }
}

// Export singleton instance
export const logger = new Logger()

// Performance monitoring helper
export class PerformanceMonitor {
  private startTime: number
  private context: LogContext

  constructor(context: LogContext) {
    this.startTime = Date.now()
    this.context = context
  }

  end(message: string, metadata?: Record<string, any>) {
    const duration = Date.now() - this.startTime
    logger.info(message, this.context, { ...metadata, duration })
    return duration
  }

  endWithError(message: string, error: Error, metadata?: Record<string, any>) {
    const duration = Date.now() - this.startTime
    logger.error(message, error, this.context, { ...metadata, duration })
    return duration
  }
}

// Request ID generator for tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

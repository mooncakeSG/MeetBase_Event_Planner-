// Backend API service for communicating with the FastAPI backend
import { config, getApiUrl } from './config'

export interface BackendResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface EventData {
  id?: string
  name: string
  description?: string
  date: string
  duration: number
  location?: string
  is_public: boolean
  max_attendees?: number
  event_password?: string
  user_id?: string
}

export interface GuestData {
  id?: string
  event_id: string
  name: string
  email: string
  role?: string
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
  notes?: string
  invite_link?: string
  invited_at?: string
  responded_at?: string | null
}

class BackendAPIService {
  private baseUrl: string

  constructor() {
    this.baseUrl = config.apiUrl
  }

  // Generic API call method
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BackendResponse<T>> {
    try {
      const url = getApiUrl(endpoint)
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data: data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Health check
  async healthCheck(): Promise<BackendResponse> {
    return this.apiCall('/health')
  }

  // Events API
  async getEvents(): Promise<BackendResponse<EventData[]>> {
    return this.apiCall('/events')
  }

  async getEvent(id: string): Promise<BackendResponse<EventData>> {
    return this.apiCall(`/events/${id}`)
  }

  async createEvent(event: Omit<EventData, 'id'>): Promise<BackendResponse<EventData>> {
    return this.apiCall('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    })
  }

  async updateEvent(id: string, event: Partial<EventData>): Promise<BackendResponse<EventData>> {
    return this.apiCall(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    })
  }

  async deleteEvent(id: string): Promise<BackendResponse> {
    return this.apiCall(`/events/${id}`, {
      method: 'DELETE',
    })
  }

  // Guests API
  async getGuests(eventId: string): Promise<BackendResponse<GuestData[]>> {
    return this.apiCall(`/events/${eventId}/guests`)
  }

  async createGuest(eventId: string, guest: Omit<GuestData, 'id' | 'event_id'>): Promise<BackendResponse<GuestData>> {
    return this.apiCall(`/events/${eventId}/guests`, {
      method: 'POST',
      body: JSON.stringify(guest),
    })
  }

  async updateGuest(eventId: string, guestId: string, guest: Partial<GuestData>): Promise<BackendResponse<GuestData>> {
    return this.apiCall(`/events/${eventId}/guests/${guestId}`, {
      method: 'PUT',
      body: JSON.stringify(guest),
    })
  }

  async deleteGuest(eventId: string, guestId: string): Promise<BackendResponse> {
    return this.apiCall(`/events/${eventId}/guests/${guestId}`, {
      method: 'DELETE',
    })
  }

  // AI API
  async getAISuggestions(prompt: string): Promise<BackendResponse<any>> {
    return this.apiCall('/ai/suggest', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })
  }

  async chatWithAI(message: string, context?: any): Promise<BackendResponse<any>> {
    return this.apiCall('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    })
  }

  // Email API
  async sendEmail(to: string, subject: string, html: string, text?: string, eventId?: string): Promise<BackendResponse> {
    return this.apiCall('/email/send', {
      method: 'POST',
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
        event_id: eventId,
      }),
    })
  }

  async getEmailHistory(eventId?: string): Promise<BackendResponse<any[]>> {
    const endpoint = eventId ? `/email/history?event_id=${eventId}` : '/email/history'
    return this.apiCall(endpoint)
  }
}

export const backendAPI = new BackendAPIService()

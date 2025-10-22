import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your environment variables.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          date: string
          duration: number
          location: string | null
          event_password: string | null
          is_public: boolean
          max_attendees: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          description?: string | null
          date: string
          duration: number
          location?: string | null
          event_password?: string | null
          is_public?: boolean
          max_attendees?: number | null
        }
        Update: {
          name?: string
          description?: string | null
          date?: string
          duration?: number
          location?: string | null
          event_password?: string | null
          is_public?: boolean
          max_attendees?: number | null
        }
      }
      guests: {
        Row: {
          id: string
          event_id: string
          name: string
          email: string
          status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
          invite_link: string | null
          invited_at: string
          responded_at: string | null
          notes: string | null
        }
        Insert: {
          event_id: string
          name: string
          email: string
          status?: 'pending' | 'confirmed' | 'declined' | 'cancelled'
          invite_link?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          email?: string
          status?: 'pending' | 'confirmed' | 'declined' | 'cancelled'
          notes?: string | null
          responded_at?: string | null
        }
      }
    }
  }
}

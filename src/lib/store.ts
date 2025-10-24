import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { backendAPI, EventData, GuestData } from './backend-api'

interface Event {
  id?: string
  user_id?: string
  name: string
  description?: string | null
  date: string
  duration: number
  location?: string | null
  event_password?: string | null
  is_public: boolean
  max_attendees?: number | null
  created_at?: string
  updated_at?: string
}

interface Guest {
  id?: string
  event_id: string
  name: string
  email: string
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled'
  invite_link?: string | null
  invited_at?: string
  responded_at?: string | null
  notes?: string | null
}

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

interface EventState {
  events: Event[]
  currentEvent: Event | null
  loading: boolean
  setEvents: (events: Event[]) => void
  addEvent: (event: Event) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  deleteEvent: (id: string) => void
  setCurrentEvent: (event: Event | null) => void
  setLoading: (loading: boolean) => void
}

interface GuestState {
  guests: Guest[]
  loading: boolean
  setGuests: (guests: Guest[]) => void
  addGuest: (guest: Guest) => void
  updateGuest: (id: string, guest: Partial<Guest>) => void
  deleteGuest: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}))

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  currentEvent: null,
  loading: false,
  setEvents: (events) => set({ events }),
  addEvent: async (event) => {
    set({ loading: true })
    try {
      const response = await backendAPI.createEvent(event)
      if (response.success && response.data) {
        const newEvent = {
          ...response.data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        set((state) => ({ events: [...state.events, newEvent] }))
      }
    } catch (error) {
      console.error('Failed to create event:', error)
    } finally {
      set({ loading: false })
    }
  },
  updateEvent: async (id, event) => {
    set({ loading: true })
    try {
      const response = await backendAPI.updateEvent(id, event)
      if (response.success && response.data) {
        const updatedEvent = {
          ...response.data,
          updated_at: new Date().toISOString()
        }
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updatedEvent } : e))
        }))
      }
    } catch (error) {
      console.error('Failed to update event:', error)
    } finally {
      set({ loading: false })
    }
  },
  deleteEvent: async (id) => {
    set({ loading: true })
    try {
      const response = await backendAPI.deleteEvent(id)
      if (response.success) {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id)
        }))
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
    } finally {
      set({ loading: false })
    }
  },
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setLoading: (loading) => set({ loading }),
}))

export const useGuestStore = create<GuestState>((set, get) => ({
  guests: [],
  loading: false,
  setGuests: (guests) => set({ guests }),
  addGuest: async (guest) => {
    set({ loading: true })
    try {
      const response = await backendAPI.createGuest(guest.event_id, guest)
      if (response.success && response.data) {
        set((state) => ({ guests: [...state.guests, response.data] }))
      }
    } catch (error) {
      console.error('Failed to create guest:', error)
    } finally {
      set({ loading: false })
    }
  },
  updateGuest: async (id, guest) => {
    set({ loading: true })
    try {
      const currentGuest = get().guests.find(g => g.id === id)
      if (currentGuest) {
        const response = await backendAPI.updateGuest(currentGuest.event_id, id, guest)
        if (response.success && response.data) {
          set((state) => ({
            guests: state.guests.map((g) => (g.id === id ? { ...g, ...response.data } : g))
          }))
        }
      }
    } catch (error) {
      console.error('Failed to update guest:', error)
    } finally {
      set({ loading: false })
    }
  },
  deleteGuest: async (id) => {
    set({ loading: true })
    try {
      const currentGuest = get().guests.find(g => g.id === id)
      if (currentGuest) {
        const response = await backendAPI.deleteGuest(currentGuest.event_id, id)
        if (response.success) {
          set((state) => ({
            guests: state.guests.filter((g) => g.id !== id)
          }))
        }
      }
    } catch (error) {
      console.error('Failed to delete guest:', error)
    } finally {
      set({ loading: false })
    }
  },
  setLoading: (loading) => set({ loading }),
}))

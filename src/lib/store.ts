import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

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
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, event) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...event } : e))
  })),
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id)
  })),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setLoading: (loading) => set({ loading }),
}))

export const useGuestStore = create<GuestState>((set) => ({
  guests: [],
  loading: false,
  setGuests: (guests) => set({ guests }),
  addGuest: (guest) => set((state) => ({ guests: [...state.guests, guest] })),
  updateGuest: (id, guest) => set((state) => ({
    guests: state.guests.map((g) => (g.id === id ? { ...g, ...guest } : g))
  })),
  deleteGuest: (id) => set((state) => ({
    guests: state.guests.filter((g) => g.id !== id)
  })),
  setLoading: (loading) => set({ loading }),
}))

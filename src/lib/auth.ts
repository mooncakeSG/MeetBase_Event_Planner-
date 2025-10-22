import { supabase } from './supabase'
import { useAuthStore } from './store'

export const authService = {
  async signUp(email: string, password: string, fullName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  async getCurrentUser() {
    try {
      // First try to get the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        return { user: null, error: sessionError }
      }
      
      if (session?.user) {
        return { user: session.user, error: null }
      }
      
      // If no session, try to get user directly
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        return { user: null, error }
      }
      
      return { user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  },

  async updateProfile(updates: { full_name?: string; avatar_url?: string }) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Initialize auth state
export const initializeAuth = async () => {
  const { setUser, setLoading } = useAuthStore.getState()
  
  try {
    setLoading(true)
    
    // Check if there's an existing session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('No existing session found')
      setUser(null)
    } else if (session?.user) {
      setUser(session.user)
    } else {
      setUser(null)
    }
  } catch (error) {
    console.log('Auth initialization - no session found:', error)
    setUser(null)
  } finally {
    setLoading(false)
  }
}

// Listen for auth changes
export const setupAuthListener = () => {
  const { setUser } = useAuthStore.getState()

  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session?.user?.email)
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      setUser(session?.user ?? null)
    } else if (event === 'SIGNED_OUT') {
      setUser(null)
    } else if (event === 'INITIAL_SESSION') {
      // Handle initial session
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
    }
  })
}

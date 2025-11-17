import { createClient } from './client'

// Create a new client instance for each request to avoid state issues
const getSupabaseClient = () => createClient()

export const signUp = async (email: string, password: string) => {
  const supabase = getSupabaseClient()
  return await supabase.auth.signUp({
    email,
    password,
  })
}

export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseClient()
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signOut = async () => {
  const supabase = getSupabaseClient()
  return await supabase.auth.signOut()
}

export const getSession = async () => {
  const supabase = getSupabaseClient()
  return await supabase.auth.getSession()
}

export const getUser = async () => {
  const supabase = getSupabaseClient()
  return await supabase.auth.getUser()
}
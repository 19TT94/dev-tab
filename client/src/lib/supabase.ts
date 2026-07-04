import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase credentials.',
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder',
)

export const businessInfo = {
  name: import.meta.env.VITE_BUSINESS_NAME ?? 'Your Business',
  email: import.meta.env.VITE_BUSINESS_EMAIL ?? '',
  phone: import.meta.env.VITE_BUSINESS_PHONE ?? '',
  website: import.meta.env.VITE_BUSINESS_WEBSITE ?? '',
  address: import.meta.env.VITE_BUSINESS_ADDRESS ?? '',
  logo: import.meta.env.VITE_BUSINESS_LOGO ?? '',
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase Config Check:')
console.log('URL:', supabaseUrl ? '✅' : '❌ FALTA')
console.log('Key:', supabaseAnonKey ? '✅' : '❌ FALTA')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // ✅ CAMBIAR A FALSE
    flowType: 'pkce'
  }
})

// ✅ Test de conexión
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Error conectando a Supabase:', error)
  } else {
    console.log('✅ Supabase conectado correctamente')
    console.log('Session:', data.session ? 'Activa' : 'No activa')
  }
})
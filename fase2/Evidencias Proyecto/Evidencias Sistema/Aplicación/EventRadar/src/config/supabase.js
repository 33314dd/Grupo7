import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config Check:');
console.log('URL:', supabaseUrl ? '✅' : '❌ FALTA VITE_SUPABASE_URL');
console.log('Key:', supabaseAnonKey ? '✅' : '❌ FALTA VITE_SUPABASE_ANON_KEY');

// Crear cliente Supabase o cliente dummy
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.error('Crea un archivo .env en la raíz del proyecto con:');
  console.error('VITE_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=tu-anon-key');
  
  // Crear un cliente dummy para evitar que la app crashee
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase no configurado' } }),
      signUp: () => Promise.resolve({ error: { message: 'Supabase no configurado' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: null }) }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null })
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Cambiar a false para evitar problemas
      flowType: 'pkce'
    }
  });

  // Test de conexión
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Error conectando a Supabase:', error);
    } else {
      console.log('✅ Supabase conectado correctamente');
      console.log('Session:', data.session ? 'Activa' : 'No activa');
    }
  });
}

export { supabase };
// Re-export the canonical supabase client from config to avoid duplication
import { supabase as _supabase } from '../config/supabase'

// Keep a stable export used across the codebase
export const supabase = _supabase

console.log('🧩 src/lib/supabase re-exported from src/config/supabase')
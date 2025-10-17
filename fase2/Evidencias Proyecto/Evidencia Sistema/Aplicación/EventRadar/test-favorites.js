// Test script para verificar la base de datos de favoritos
import { supabase } from './src/lib/supabase.js';

async function testFavorites() {
    console.log('🔍 Iniciando test de favoritos...');
    
    try {
        // 1. Verificar estructura de la tabla favorites
        console.log('\n📊 Verificando estructura de tabla favorites...');
        const { data: favoritesData, error: favoritesError } = await supabase
            .from('favorites')
            .select('*')
            .limit(5);
        
        console.log('Favorites data:', favoritesData);
        console.log('Favorites error:', favoritesError);

        // 2. Verificar usuario actual
        console.log('\n👤 Verificando usuario actual...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('User:', user?.id);
        console.log('User error:', userError);

        // 3. Verificar eventos
        console.log('\n🎯 Verificando eventos...');
        const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('id, title, created_at')
            .limit(3);
        
        console.log('Events data:', eventsData);
        console.log('Events error:', eventsError);

        // 4. Intentar insertar un favorito de prueba
        if (user && eventsData && eventsData.length > 0) {
            console.log('\n➕ Intentando insertar favorito de prueba...');
            const { data: insertData, error: insertError } = await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    event_id: eventsData[0].id
                })
                .select();
            
            console.log('Insert data:', insertData);
            console.log('Insert error:', insertError);
        }

    } catch (error) {
        console.error('❌ Error en test:', error);
    }
}

// Ejecutar test cuando se cargue el módulo
testFavorites();
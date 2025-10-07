import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; 

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables SUPABASE_URL o SUPABASE_SERVICE_KEY no encontradas.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// --- Datos a Insertar ---

const initialUsers = [
  { email: 'admin@rehab.cl', password: 'Password123', role: 'Administrador' },
  { email: 'profesional@rehab.cl', password: 'Password123', role: 'Profesional de la salud' },
  { email: 'paciente@rehab.cl', password: 'Password123', role: 'Paciente' },
];

// --- Lógica de la Ejecución ---

async function runSeed() {
  console.log('Iniciando script de Seed...');

  // 1. Cargar Usuarios (RF1 de prueba)
  for (const user of initialUsers) {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, 
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
            console.log(`Usuario existente: ${user.email}. Omitiendo.`);
            continue;
        }
        throw authError;
      }
      
      // 2. Insertar Perfil (Rol)
      const userId = authData.user.id;
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          role: user.role,
        });

      if (profileError) {
        throw new Error(`Fallo al insertar perfil ${user.email}: ${profileError.message}`);
      }

      console.log(`✅ Usuario y perfil creado: ${user.email} (${user.role})`);

    } catch (e) {
      console.error(e.message);
    }
  }
  
  
  console.log('\n--- Seed Finalizado ---');
}

runSeed();
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// --------------------------------------------------------------------------------
// 1. Configuración y Conexión
// --------------------------------------------------------------------------------

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; 

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables SUPABASE_URL o SUPABASE_SERVICE_KEY no encontradas.');
}

// Cliente con privilegios de Service Role (Admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// --------------------------------------------------------------------------------
// 2. Datos Iniciales
// --------------------------------------------------------------------------------

// Usuarios de prueba (RF1) - ¡Añadimos más profesionales!
const initialUsers = [
  { email: 'admin@rehab.cl', password: 'Password123', role: 'Administrador' },
  { email: 'profesional@rehab.cl', password: 'Password123', role: 'Profesional de la salud' },
  { email: 'pro2@rehab.cl', password: 'Password123', role: 'Profesional de la salud' }, // Nuevo profesional
  { email: 'pro3@rehab.cl', password: 'Password123', role: 'Profesional de la salud' }, // Nuevo profesional
  { email: 'paciente@rehab.cl', password: 'Password123', role: 'Paciente' },
];

// Almacenará el ID del primer profesional para la asignación de ejercicios
let primerProfesionalId: string | null = null; 


// Ejercicios iniciales (RF4: Biblioteca y RF5: Clasificación)
const initialExercises = [
  { 
    name: 'Elevación de Rodilla', 
    category: 'Movilidad', 
    body_part: 'Extremidades Inferiores',
    description: 'De pie, elevar una rodilla a la altura de la cadera, manteniendo el equilibrio. 10 repeticiones por pierna.',
  },
  { 
    name: 'Puente de Glúteo (Bridge)', 
    category: 'Fuerza', 
    body_part: 'Tronco y Piernas',
    description: 'Tumbado, levantar la cadera del suelo contrayendo los glúteos. 3 series de 12 repeticiones.',
  },
  { 
    name: 'Rotación Cervical Suave', 
    category: 'Movilidad', 
    body_part: 'Cuello y Hombros',
    description: 'Rotar suavemente la cabeza de lado a lado. 5 repeticiones lentas.',
  },
  { 
    name: 'Sentadilla en Silla', 
    category: 'Resistencia', 
    body_part: 'Extremidades Inferiores',
    description: 'Sentarse y levantarse de una silla sin usar las manos. 3 series de 10 repeticiones.',
  },
];


// --------------------------------------------------------------------------------
// 3. Lógica de la Ejecución (Modificada)
// --------------------------------------------------------------------------------

async function runSeed() {
  console.log('Iniciando script de Seed...');

  // 1. Cargar Usuarios y Perfiles (RF1 de prueba) y capturar IDs
  for (const user of initialUsers) {
    try {
      let userId: string;
      
      // 🚨 Buscar el perfil primero para obtener el ID si ya existe
      const { data: profileExists } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (profileExists) {
          userId = profileExists.id;
          console.log(`Usuario existente: ${user.email}. ID: ${userId}`);
      } else {
          // Si no existe el perfil, creamos el usuario en Auth
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: user.email,
              password: user.password,
              email_confirm: true, 
          });

          if (authError) throw authError;
          userId = authData.user!.id; // El ID del usuario recién creado

          // Insertar Perfil (Rol)
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
      }
      
      // 🚨 Capturar el ID del primer profesional encontrado/creado
      if (user.role === 'Profesional de la salud' && !primerProfesionalId) {
          primerProfesionalId = userId;
          console.log(`\n*** UUID PROFESIONAL PRINCIPAL: ${primerProfesionalId} ***`);
      }


    } catch (e: any) {
      console.error(`❌ Error en el Seed de Usuarios: ${e.message}`);
    }
  }

  if (!primerProfesionalId) {
    console.error('No se pudo obtener el ID de ningún profesional para asignar ejercicios.');
    return;
  }
  
  // 2. Cargar Ejercicios (RF4 y RF5)
  try {
    // Borrar ejercicios existentes para asegurar un seed limpio
    await supabase.from('exercises').delete().neq('id', 0); 
    
    // 🚨 PASO CLAVE: ASIGNAR EL ID DEL PROFESIONAL PRINCIPAL A CADA EJERCICIO
    const exercisesWithProfessional = initialExercises.map(exercise => ({
        ...exercise,
        professional_id: primerProfesionalId, // Asignar al primer profesional
    }));

    // Insertar la data inicial
    const { error } = await supabase
      .from('exercises') 
      .insert(exercisesWithProfessional);

    if (error) {
        throw error;
    }
    
    console.log(`✅ ${initialExercises.length} ejercicios cargados exitosamente (Asignados a ${primerProfesionalId}).`);
  } catch (e: any) {
    console.error(`❌ Error al cargar ejercicios: ${e.message}`);
  }
  
  console.log('\n--- Seed Finalizado ---');
}

runSeed();
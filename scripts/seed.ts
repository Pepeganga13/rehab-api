import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// --------------------------------------------------------------------------------
// 1. Configuración y Conexión (sin cambios)
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
// 2. Datos Iniciales y Almacenamiento de IDs
// --------------------------------------------------------------------------------

const initialUsers = [
  { email: 'admin@rehab.cl', password: 'Password123', role: 'Administrador' },
  { email: 'profesional@rehab.cl', password: 'Password123', role: 'Profesional de la salud' },
  { email: 'pro2@rehab.cl', password: 'Password123', role: 'Profesional de la salud' },
  { email: 'paciente@rehab.cl', password: 'Password123', role: 'Paciente' },
];

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

// Nuevas variables para almacenar IDs
let primerProfesionalId: string | null = null; 
let pacienteId: string | null = null; 
let insertedExercises: any[] = []; 

// Rutinas iniciales y sus ejercicios asociados (usando nombres para luego mapear IDs)
const initialRoutinesData = [
    {
        name: "Rutina de Fortalecimiento Básico",
        start_date: "2025-10-25",
        end_date: "2025-11-25",
        // Estructura de ejercicios anidada
        exercises: [
            {
                exerciseName: 'Puente de Glúteo (Bridge)', // ID 2 en tu ejemplo
                repetitions: 12,
                duration_seconds: 0,
                notes: "Hacer 3 series con 60 segundos de descanso entre ellas.",
            },
            {
                exerciseName: 'Sentadilla en Silla', // ID 4 en tu ejemplo
                repetitions: 10,
                duration_seconds: 0,
                notes: "Realizar de forma lenta. No usar apoyo de manos.",
            },
            {
                exerciseName: 'Rotación Cervical Suave', // ID 3 en tu ejemplo
                repetitions: 5,
                duration_seconds: 15,
                notes: "Realizar la rotación muy suavemente, solo hasta el punto de tensión.",
            },
        ]
    },
    {
        name: "Rutina de Movilidad para Cuello",
        start_date: "2025-11-01",
        end_date: "2025-12-01",
        exercises: [
            {
                exerciseName: 'Rotación Cervical Suave',
                repetitions: 10,
                duration_seconds: 10,
                notes: "Realizar 2 veces al día.",
            },
            {
                exerciseName: 'Elevación de Rodilla',
                repetitions: 5,
                duration_seconds: 0,
                notes: "Mantener 5 segundos arriba en cada repetición.",
            },
        ]
    }
];


// --------------------------------------------------------------------------------
// 3. Lógica de la Ejecución
// --------------------------------------------------------------------------------

async function runSeed() {
  console.log('Iniciando script de Seed...');

  // 1. Cargar Usuarios y Perfiles (RF1 de prueba) y capturar IDs
  for (const user of initialUsers) {
    try {
      let userId: string;
      
      const { data: profileExists } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (profileExists) {
          userId = profileExists.id;
          console.log(`Usuario existente: ${user.email}. ID: ${userId}`);
      } else {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: user.email,
              password: user.password,
              email_confirm: true, 
          });

          if (authError) throw authError;
          userId = authData.user!.id; 

          const { error: profileError } = await supabase
              .from('profiles')
              .insert({ id: userId, email: user.email, role: user.role });

          if (profileError) {
            throw new Error(`Fallo al insertar perfil ${user.email}: ${profileError.message}`);
          }
          console.log(`✅ Usuario y perfil creado: ${user.email} (${user.role})`);
      }
      
      // 🚨 Capturar IDs para la asignación
      if (user.role === 'Profesional de la salud' && !primerProfesionalId) {
          primerProfesionalId = userId;
          console.log(`\n*** UUID PROFESIONAL PRINCIPAL: ${primerProfesionalId} ***`);
      }
      if (user.role === 'Paciente' && !pacienteId) {
          pacienteId = userId;
          console.log(`*** UUID PACIENTE PRINCIPAL: ${pacienteId} ***`);
      }


    } catch (e: any) {
      console.error(`❌ Error en el Seed de Usuarios: ${e.message}`);
    }
  }

  if (!primerProfesionalId) {
    console.error('No se pudo obtener el ID de ningún profesional para asignar datos.');
    return;
  }
  if (!pacienteId) {
    console.error('No se pudo obtener el ID del paciente para asignar rutinas.');
    return;
  }
  
  // 2. Cargar Ejercicios (RF4 y RF5)
  try {
    await supabase.from('exercises').delete().neq('id', 0); 
    
    const exercisesWithProfessional = initialExercises.map(exercise => ({
        ...exercise,
        professional_id: primerProfesionalId, 
    }));

    const { error } = await supabase
      .from('exercises') 
      .insert(exercisesWithProfessional);

    if (error) throw error;
    
    // 🚨 Capturar los IDs reales de los ejercicios recién insertados
    const { data: exercisesData, error: fetchError } = await supabase
        .from('exercises')
        .select('*');
    
    if (fetchError) throw fetchError;
    if (exercisesData) insertedExercises = exercisesData;


    console.log(`✅ ${initialExercises.length} ejercicios cargados exitosamente.`);
  } catch (e: any) {
    console.error(`❌ Error al cargar ejercicios: ${e.message}`);
  }
  
  // 3. Cargar Rutinas (RF2: Asignación de Rutinas)
  try {
    console.log('\nCargando Rutinas y Ejercicios Asociados...');
    
    // Borrar datos para un seed limpio
    await supabase.from('routine_exercises').delete().neq('id', 0); 
    await supabase.from('routines').delete().neq('id', 0); 

    for (const routineData of initialRoutinesData) {
        
        // 3.1. Insertar la Rutina base
        const routineToInsert = {
            name: routineData.name,
            patient_id: pacienteId,
            professional_id: primerProfesionalId,
            start_date: routineData.start_date,
            end_date: routineData.end_date,
        };

        const { data: insertedRoutine, error: routineError } = await supabase
            .from('routines')
            .insert(routineToInsert)
            .select('id')
            .single();
        
        if (routineError) throw routineError;
        
        const routineId = insertedRoutine.id;

        // 3.2. Preparar los Ejercicios de la Rutina
        const routineExercisesToInsert = routineData.exercises.map(re => {
            // Mapear el nombre del ejercicio a su ID real
            const exercise = insertedExercises.find(e => e.name === re.exerciseName);

            if (!exercise) {
                // Esto no debería pasar si el paso 2 fue exitoso
                throw new Error(`Ejercicio no encontrado: ${re.exerciseName}. Revisar lista de ejercicios iniciales.`);
            }

            return {
                routine_id: routineId,
                exercise_id: exercise.id,
                repetitions: re.repetitions,
                duration_seconds: re.duration_seconds,
                notes: re.notes,
            };
        });
        
        // 3.3. Insertar los Ejercicios de la Rutina
        const { error: reError } = await supabase
            .from('routine_exercises')
            .insert(routineExercisesToInsert);

        if (reError) throw reError;
        
        console.log(`✅ Rutina "${routineData.name}" (ID: ${routineId}) asignada con ${routineData.exercises.length} ejercicios.`);
    }

  } catch (e: any) {
    console.error(`❌ Error al cargar Rutinas: ${e.message}`);
  }


  console.log('\n--- Seed Finalizado ---');
}

runSeed();
# 🧠 Sistema Web para Rehabilitación y Seguimiento Terapéutico en Casa — *Rehab-API*

<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<p align="center">
  <b>Backend desarrollado con NestJS</b> para gestionar la autenticación, los perfiles de usuario 
  (<i>Paciente, Profesional y Administrador</i>) y una biblioteca de ejercicios terapéuticos.
</p>

<p align="center">
  Utiliza <b>Supabase</b> como plataforma backend (PostgreSQL + Auth) para la administración de usuarios, roles y almacenamiento de datos.
</p>

---

## 🚀 Puesta en Marcha

Sigue los siguientes pasos para instalar, configurar y ejecutar la API localmente.

### 📋 1. Requisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Node.js** (v18 o superior)  
- **npm** o **yarn**  
- Un proyecto de **Supabase** configurado (con las tablas `profiles` y autenticación habilitada)

---

### ⚙️ 2. Instalación de Dependencias

Ejecuta los siguientes comandos en la raíz del proyecto:

```bash
# Instalar dependencias principales
npm install

# Instalar ts-node globalmente (para ejecutar el script de seed)
npm install -g ts-node
```

---

### 🔑 3. Configuración de Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto y agrega tus credenciales de Supabase:

```bash
# .env
SUPABASE_URL=**************
SUPABASE_ANON_KEY=**************
SUPABASE_SERVICE_KEY=**************   # Clave de administrador (Service Role Key)
```

> 💡 **Nota:** La `SUPABASE_SERVICE_KEY` se utiliza exclusivamente para ejecutar el script de *seed* (carga inicial de datos).  
> Asegúrate de mantenerla privada y **no** subirla a ningún repositorio público.

---

### 🌱 4. Ejecución del Seed (Datos Iniciales)

El script `scripts/seed.ts` se encarga de poblar la base de datos con datos de prueba, incluyendo tres usuarios con diferentes roles:

- **Administrador:** `admin@rehab.cl`  
- **Profesional:** `profesional@rehab.cl`  
- **Paciente:** `paciente@rehab.cl`  
- **Contraseña (para todos):** `Password123`

> ⚠️ Estos usuarios ya pueden existir en la base de datos. Se recomienda ejecutar este script en una base de datos **propia o de desarrollo**.

Ejecuta el siguiente comando:

```bash
ts-node scripts/seed.ts
```

---

### 🧩 5. Ejecución del Servidor

Una vez configurado todo, inicia la API en modo desarrollo:

```bash
npm run start:dev
```

La API estará disponible en:  
👉 **http://localhost:3000**

---

### 6. 🛡️ Sección Crucial: Pruebas de Seguridad (Requisito Principal)

Esta es la sección más importante que debes añadir para demostrar la funcionalidad de tus *Guards* y *Roles*.

Añade esto después de la sección "Endpoints Principales":

```markdown
---

## 🛡️ Paso a Paso: Pruebas de Seguridad (Ruta /exercises)

Para verificar la protección de rutas (`@UseGuards(UserRoleGuard)`), sigue estos pasos utilizando Postman o similar.

### A. 🔑 Obtener Tokens de Acceso

1.  **Obtener Token Profesional (Acceso Permitido):**
    * **Endpoint:** `POST /auth/signin`
    * **Body (JSON):** `{"email": "profesional@rehab.cl", "password": "Password123"}`
    * **Resultado:** Guardar el `access_token` de la respuesta.
2.  **Obtener Token Paciente (Acceso Restringido):**
    * **Endpoint:** `POST /auth/signin`
    * **Body (JSON):** `{"email": "paciente@rehab.cl", "password": "Password123"}`
    * **Resultado:** Guardar el `access_token` de la respuesta.

### B. ✅ Prueba de Éxito (Profesional)

* **Objetivo:** Crear un nuevo ejercicio.
* **Método:** `POST /exercises`
* **Headers:** `Authorization: Bearer [TOKEN_PROFESIONAL]`
* **Body (JSON):**
    ```json
    {
        "name": "Extension de Rodilla",
        "description": "Estiramiento isométrico de cuádriceps.",
        "category": "Fuerza",
        "body_part": "Pierna"
    }
    ```
* **Resultado Esperado:** **`201 Created`**

### C. ❌ Prueba de Fallo (Paciente)

* **Objetivo:** Intentar crear un ejercicio con un rol no autorizado.
* **Método:** `POST /exercises`
* **Headers:** `Authorization: Bearer [TOKEN_PACIENTE]`
* **Body (JSON):** (El mismo que en la prueba de éxito)
* **Resultado Esperado:** **`403 Forbidden`** (Acceso denegado por `UserRoleGuard`)

### D. 💡 Otras Pruebas de Roles

Las rutas `PATCH /exercises/:id` y `DELETE /exercises/:id` tienen la misma protección de rol, por lo que el Profesional obtendrá `200 OK` y el Paciente obtendrá `403 Forbidden`.

---

## 🔒 Roles y Permisos

El sistema utiliza tres roles definidos para gestionar el acceso a los recursos. Las pruebas de seguridad se basan en estas clasificaciones:

| Rol | Email de Prueba | Acceso a CREATE/UPDATE/DELETE |
| :--- | :--- | :--- |
| **Administrador** | `admin@rehab.cl` | Completo |
| **Profesional de la salud** | `profesional@rehab.cl` | Completo |
| **Paciente** | `paciente@rehab.cl` | Solo Lectura (`GET`) |

---
## 📡 Endpoints Principales
### 🔐 Autenticación

```bash
POST /auth/signin - Iniciar sesión

POST /auth/signup - Registrarse

POST /auth/signout - Cerrar sesión
```

### 💪 Ejercicios

```bash
GET /exercises - Obtener todos los ejercicios

POST /exercises - Crear ejercicio (Profesional)

GET /exercises/category/:category - Filtrar por categoría

PATCH /exercises/:id - Actualizar ejercicio

DELETE /exercises/:id - Eliminar ejercicio
```

### 📋 Rutinas

```bash
POST /routines - Crear rutina

GET /routines - Obtener rutinas

GET /routines/:id - Obtener rutina específica con ejercicios
```

### 🔗 Ejercicios de Rutina

```bash
POST /routine-exercises - Agregar ejercicio a rutina

POST /routine-exercises/routine/:id/batch - Agregar múltiples ejercicios

GET /routine-exercises/routine/:id - Obtener ejercicios de una rutina
```

### 📊 Progreso

```bash
POST /progress - Registrar progreso de ejercicio

GET /progress/patient/:patientId - Obtener progreso del paciente

GET /progress/report/:patientId - Generar reporte de progreso como pongo esto para que se vea bonito despues
```



## 🧱 Estructura del Proyecto

```bash
📦 Rehab-API
 ┣ 📂 src
 ┃ ┣ 📂 auth                 # Módulo de autenticación (JWT, roles)
 ┃ ┣ 📂 database             # Configuración de Supabase
 ┃ ┣ 📂 exercises            # Biblioteca de ejercicios terapéuticos
 ┃ ┣ 📂 routines             # Gestión de rutinas
 ┃ ┣ 📂 routine-exercises    # Relación rutina-ejercicios
 ┃ ┣ 📂 progress             # Seguimiento del paciente
 ┃ ┣ 📜 app.module.ts        # Configuración principal de NestJS
 ┃ ┗ 📜 main.ts              # Punto de entrada de la aplicación
 ┣ 📂 scripts
 ┃ ┗ 📜 seed.ts              # Script de carga inicial de datos
 ┣ 📜 docker-compose.yml
 ┣ 📜 Dockerfile
 ┣ 📜 .env.example           # Ejemplo de variables de entorno
 ┣ 📜 package.json
 ┗ 📜 README.md
 
```
---

## 🧠 Acerca del Proyecto

**Rehab-API** es el backend del sistema web “Rehabilitación y Seguimiento Terapéutico en Casa”.  
Permite a los pacientes realizar ejercicios terapéuticos guiados por profesionales, quienes pueden monitorear su progreso mediante la plataforma.

El proyecto fue desarrollado como parte del curso **“Taller de Desarrollo de Backend con NestJS”** de la **Universidad del Bío-Bío**.

---

## 👨‍💻 Equipo de Desarrollo

- **Sebastián Pedreros Mujica**  
- **Patricio Moncada Norambuena**  
- **Luciano Sandoval Jara**  
- **Bastián Rosales Campusano**

---

## 📚 Tecnologías Utilizadas

- [NestJS](https://nestjs.com/)  
- [Supabase](https://supabase.com/) (PostgreSQL + Auth)  
- [TypeScript](https://www.typescriptlang.org/)  
- [ts-node](https://typestrong.org/ts-node/)  

---

## 🧩 Licencia

Proyecto académico — Universidad del Bío-Bío.  

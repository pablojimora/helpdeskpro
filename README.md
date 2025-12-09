# HelpDeskPro - Sistema de Gestión de Tickets

Sistema completo de gestión de tickets de soporte técnico con roles de Agente y Cliente, desarrollado con Next.js 16, TypeScript, MongoDB y NextAuth.

---

##  Información del Desarrollador

- **Nombre:** [Pablo Jimenez Mora]
- **Clan:** [Gosling]
- **Correo:** [pablojimora@gmail.com]
- **Documento:** [1000549308]

---

## Características Principales

### Para Clientes:
- Crear tickets de soporte con título, descripción y prioridad
- Ver todos sus tickets creados
- Editar tickets mientras estén en estado "Abierto"
- Ver detalles completos de cada ticket
- Sistema de comentarios para comunicación con agentes
- Recibir notificaciones por email en eventos importantes

### Para Agentes:
- Ver todos los tickets del sistema
- Filtrar tickets por estado y prioridad
- Asignar agentes a tickets específicos
- Actualizar estado y prioridad de tickets
- Responder a clientes mediante comentarios
- Cerrar tickets resueltos

### Sistema de Notificaciones:
- Email automático cuando se crea un ticket
- Email al cliente cuando un agente responde
- Email al cliente cuando se cierra un ticket

---

## Tecnologías Utilizadas

- **Frontend:** Next.js 16.0.8, React, TypeScript
- **Estilos:** CSS Modules, Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de Datos:** MongoDB Atlas con Mongoose
- **Autenticación:** NextAuth.js con JWT
- **Notificaciones:** React-Toastify
- **Emails:** Nodemailer
- **HTTP Client:** Axios

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/pablojimora/helpdeskpro.git
cd helpdeskpro
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con:

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/Helpdeskpro

# NextAuth
NEXTAUTH_SECRET=tu_secret_key_aqui
NEXTAUTH_URL=http://localhost:3000

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tucorreo@gmail.com
EMAIL_PASSWORD=tu_app_password_de_16_caracteres
EMAIL_FROM=tucorreo@gmail.com
```

**Nota importante sobre Gmail:**
Para usar Gmail, necesitas una "Contraseña de Aplicación":
1. Ve a https://myaccount.google.com/security
2. Activa la verificación en 2 pasos
3. Busca "Contraseñas de aplicaciones"
4. Crea una nueva para "Correo"
5. Usa el código de 16 caracteres en `EMAIL_PASSWORD`

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

---

## Credenciales de Acceso

### Usuario Agente
- **Email:** `pablojimora@gmail.com`
- **Password:** `123456`
- **Rol:** Agente de soporte

### Usuario Cliente
- **Email:** `pablodev0295@gmail.com`
- **Password:** `123456`
- **Rol:** Cliente


---

## Guía de Uso

### Para Clientes

1. **Iniciar Sesión**
   - Accede a `/login` con tus credenciales de cliente
   - Serás redirigido automáticamente al Dashboard de Cliente

2. **Crear un Ticket**
   - Click en el botón "Crear Nuevo Ticket"
   - Completa el formulario:
     - Título (mínimo 3 caracteres)
     - Descripción (mínimo 10 caracteres)
     - Prioridad (Baja, Media, Alta, Urgente)
   - Click en "Crear Ticket"
   - Recibirás un email de confirmación

3. **Ver y Gestionar Tickets**
   - En el dashboard verás todos tus tickets con badges de estado y prioridad
   - Estados posibles: Abierto, En Progreso, Resuelto, Cerrado
   - Click en "Ver Detalle" para ver comentarios y agregar respuestas
   - Click en "Editar" para modificar título/descripción (solo si está Abierto)

4. **Sistema de Comentarios**
   - Dentro de un ticket, ve la conversación completa
   - Agrega comentarios para comunicarte con el agente
   - Los comentarios muestran quién los escribió y cuándo

### Para Agentes

1. **Iniciar Sesión**
   - Accede a `/login` con tus credenciales de agente
   - Serás redirigido al Dashboard de Agente

2. **Ver Todos los Tickets**
   - El dashboard muestra todos los tickets del sistema
   - Información visible: ID, Título, Cliente, Estado, Prioridad, Agente asignado, Fecha

3. **Filtrar Tickets**
   - Usa los filtros en la parte superior:
     - **Estado:** Todos, Abierto, En Progreso, Resuelto, Cerrado
     - **Prioridad:** Todas, Baja, Media, Alta, Urgente
   - Los filtros se aplican automáticamente al seleccionarlos

4. **Actualizar un Ticket**
   - Click en "Actualizar" en cualquier ticket
   - Puedes modificar:
     - Estado del ticket
     - Prioridad
     - Asignar/cambiar agente
   - Click en "Actualizar Ticket"
   - El cliente recibirá un email si se cierra el ticket

5. **Responder a Clientes**
   - Click en "Ver Detalle" para ver el ticket completo
   - Agrega comentarios para responder al cliente
   - El cliente recibirá un email cuando un agente comenta

---

## 📁 Estructura del Proyecto

```
helpdeskpro/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/               # Autenticación NextAuth
│   │   │   ├── tickets/            # CRUD de tickets
│   │   │   ├── comments/           # Sistema de comentarios
│   │   │   └── users/              # Gestión de usuarios
│   │   ├── components/             # Componentes reutilizables
│   │   │   ├── Badge.tsx           # Badges de estado/prioridad
│   │   │   ├── Button.tsx          # Botones estilizados
│   │   │   ├── Card.tsx            # Tarjetas
│   │   │   └── Navbar.tsx          # Barra de navegación
│   │   ├── dashAgent/              # Dashboard de agentes
│   │   ├── dashClient/             # Dashboard de clientes
│   │   ├── tickets/[id]/           # Vista detallada de ticket
│   │   ├── login/                  # Página de login
│   │   ├── models/                 # Modelos de MongoDB
│   │   │   ├── user.ts
│   │   │   ├── ticket.ts
│   │   │   └── comment.ts
│   │   ├── services/               # Servicios (Axios)
│   │   │   ├── ticketService.ts
│   │   │   ├── userService.ts
│   │   │   ├── commentService.ts
│   │   │   └── emailService.ts
│   │   └── lib/                    # Utilidades
│   │       ├── auth.ts             # Configuración NextAuth
│   │       └── dbconnection.ts     # Conexión MongoDB
│   └── helpers/
│       └── notificaciones.ts       # Helper de toasts
├── .env.local                      # Variables de entorno
├── package.json
└── README.md
```

---

## Seguridad

- Autenticación JWT con NextAuth.js
- Sesiones de 30 días de duración
- Rutas protegidas por rol (middleware)
- Validación de permisos en API Routes
- Los clientes solo pueden ver/editar sus propios tickets
- Variables de entorno para datos sensibles

---

## Solución de Problemas

### Error de conexión a MongoDB
- Verifica que la URL de conexión en `.env.local` sea correcta
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Verifica que el usuario/contraseña sean correctos

### Los emails no se envían
- Verifica que uses una Contraseña de Aplicación de Gmail (no tu contraseña normal)
- Confirma que la verificación en 2 pasos esté activada
- Revisa los logs en la consola para ver errores específicos

### Error de autenticación
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Asegúrate de que `NEXTAUTH_URL` coincida con tu URL actual
- Verifica que los usuarios existan en la base de datos

---

##  Scripts Disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Compilar para producción
npm run start        # Ejecutar versión de producción
npm run lint         # Ejecutar linter
```



## Contacto

- **GitHub:** [pablojimora](https://github.com/pablojimora)
- **Repositorio:** [helpdeskpro](https://github.com/pablojimora/helpdeskpro)

---

# Documentación de Capi

## 1. Descripción del proyecto y módulo

Capi es una aplicación web full-stack para gestionar horarios, usuarios y control de acceso por roles. Está construida con Next.js, PostgreSQL y Prisma.

El proyecto incluye dos módulos principales:

- Gestión de horarios (`schedules`): CRUD de horarios con reglas RBAC para empleados, managers y administradores.
- Gestión de roles y permisos (`roles` / `permissions`): CRUD de roles, CRUD de permisos y autorización dinámica basada en permisos asociados a roles.

## 2. Requisitos previos

Antes de ejecutar Capi necesitas:

- Node.js 20 o superior
- npm
- PostgreSQL 16 o superior
- Un editor de texto para configurar el archivo `.env`
- Opcional: Docker si quieres levantar PostgreSQL localmente con `docker-compose`

## 3. Instalación paso a paso

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd capi
```

2. Instala dependencias:

```bash
npm install
```

3. Crea `.env` en la raíz del proyecto (o copia `.env.example`).

4. Genera Prisma y aplica migraciones:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

> Si usas Docker, ejecuta `docker-compose up -d` antes de ejecutar las migraciones.

## 4. Configuración de variables de entorno

Crea un archivo `.env` con estas variables:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/capi?schema=public"
JWT_SECRET="tu_jwt_secret"
```

- `DATABASE_URL`: conexión PostgreSQL.
- `JWT_SECRET`: clave secreta para firmar JWT.

## 5. Comandos para ejecutar

Para iniciar en desarrollo:

```bash
npm run dev
```

Para compilar en producción:

```bash
npm run build
npm start
```

La app se sirve en `http://localhost:3000`.

## 6. Documentación de endpoints

### Autenticación

- `POST /api/auth/register`
  - Crea un usuario.
  - Body JSON:

```json
{
  "email": "usuario@example.com",
  "password": "Password123",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

- `POST /api/auth/login`
  - Login y genera cookies `access_token` y `refresh_token`.
  - Body JSON:

```json
{
  "email": "usuario@example.com",
  "password": "Password123"
}
```

- `POST /api/auth/logout`
  - Cierra sesión y elimina cookies.

- `POST /api/auth/refresh`
  - Renueva el token de acceso usando `refresh_token`.

- `GET /api/users/me`
  - Devuelve los datos del usuario actual autenticado.

### Usuarios

- `GET /api/users`
  - Lista usuarios.
  - Sólo `ADMIN` y `MANAGER` pueden acceder.

- `POST /api/users`
  - Crea un nuevo usuario con rol.
  - Sólo `ADMIN`.

- `PATCH /api/users/:id`
  - Actualiza un usuario.
  - Sólo `ADMIN`.

- `DELETE /api/users/:id`
  - Elimina lógicamente un usuario.
  - Sólo `ADMIN`.

### Horarios

- `GET /api/schedules`
  - Lista horarios accesibles según rol:
    - `EMPLOYEE` → sus horarios.
    - `MANAGER` → horarios de su equipo y propios.
    - `ADMIN` → todos.

- `POST /api/schedules`
  - Crea un horario.
  - Sólo `ADMIN` y `MANAGER`.

- `PATCH /api/schedules/:id`
  - Edita un horario.
  - Sólo `ADMIN` y `MANAGER`.

- `DELETE /api/schedules/:id`
  - Cancela un horario.
  - Sólo `ADMIN` y `MANAGER`.

### Auditoría

- `GET /api/audit-logs`
  - Lista logs de auditoría.
  - `ADMIN` ve todos; `MANAGER` ve logs de su equipo.

### Roles y permisos

- `GET /api/roles`
  - Lista roles registrados.
  - Sólo `ADMIN`.

- `POST /api/roles`
  - Crea un rol nuevo.
  - Sólo `ADMIN`.

- `PATCH /api/roles/:id`
  - Actualiza un rol.
  - Sólo `ADMIN`.

- `DELETE /api/roles/:id`
  - Elimina un rol.
  - Sólo `ADMIN`.

- `GET /api/permissions`
  - Lista permisos.
  - Sólo `ADMIN`.

- `POST /api/permissions`
  - Crea un permiso.
  - Sólo `ADMIN`.

- `PATCH /api/permissions/:id`
  - Actualiza un permiso.
  - Sólo `ADMIN`.

- `DELETE /api/permissions/:id`
  - Elimina un permiso.
  - Sólo `ADMIN`.

## 7. Ejemplos de requests con curl

### Registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin1234","firstName":"Admin","lastName":"Prueba"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin1234"}'
```

### Crear rol (ADMIN)

```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Content-Type: application/json" \
  -d '{"role":"MANAGER","name":"Manager","description":"Gestor de equipo","status":"ACTIVE"}'
```

### Crear permiso (ADMIN)

```bash
curl -X POST http://localhost:3000/api/permissions \
  -H "Content-Type: application/json" \
  -d '{"action":"CREATE_SCHEDULE","module":"schedules","role":"MANAGER"}'
```

## 8. Datos de prueba

### Usuario de prueba

- Email: `admin@example.com`
- Password: `Admin1234`

> Nota: la primera cuenta registrada se crea como `EMPLOYEE`. Para probar las rutas de administrador, debes asignar el rol `ADMIN` manualmente en la base de datos o crear un usuario con rol `ADMIN` desde una cuenta que ya tenga permisos administrativos.

### Ejemplo de request de creación de horario

```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{"ownerId":"<id_del_empleado>","title":"Reunión de equipo","description":"Seguimiento semanal","startTime":"2026-05-01T09:00:00.000Z","endTime":"2026-05-01T10:00:00.000Z"}'
```

## 9. Archivo de ejemplo `.env.example`

Incluye un archivo con valores de ejemplo para facilitar la configuración.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/capi?schema=public"
JWT_SECRET="mi_secreto_super_seguro"
```

## 10. Colección Postman / .env.example

Se proporciona `.env.example` como plantilla con valores de prueba. Puedes importar los ejemplos curl en Postman para crear tu colección de endpoints.

## 11. Diagrama de entidades (ER diagram)

```mermaid
erDiagram
    USER ||--o{ SCHEDULE : owns
    USER ||--o{ AUDIT_LOG : subject
    USER ||--o{ AUDIT_LOG : actor
    ROLE_METADATA ||--o{ PERMISSION : has
    USER {
        String id PK
        String email
        String passwordHash
        String firstName
        String lastName
        Role role
        AccountStatus status
        String managerId FK
        DateTime lastLogin
        DateTime createdAt
        DateTime updatedAt
    }
    SCHEDULE {
        String id PK
        String ownerId FK
        String createdById FK
        String title
        String description
        DateTime startTime
        DateTime endTime
        ScheduleStatus status
        DateTime createdAt
        DateTime updatedAt
    }
    AUDIT_LOG {
        String id PK
        String userId FK
        String actorId FK
        AuditAction action
        String tableName
        String recordId
        Json oldValues
        Json newValues
        String ipAddress
        DateTime createdAt
    }
    ROLE_METADATA {
        String id PK
        Role role
        String name
        String description
        AccountStatus status
        DateTime createdAt
        DateTime updatedAt
    }
    PERMISSION {
        String id PK
        String action
        String module
        Role role
        DateTime createdAt
        DateTime updatedAt
    }
```

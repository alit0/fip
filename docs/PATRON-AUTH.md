# Patrón de Autenticación y Autorización (FIP Festival)

Este documento describe el patrón de autenticación y autorización implementado para el festival.

## Arquitectura

El sistema utiliza una arquitectura de seguridad en dos capas:

1.  **Capa de Ruteo (Middleware)**: Un gate ligero en `src/middleware.ts` que verifica la presencia de la cookie de sesión de Payload (`payload-token`). Su función es puramente de UX: redirigir usuarios no autenticados fuera de las áreas protegidas (`/acceso/{area}/*`) hacia el login correspondiente, preservando el prefijo de idioma (`/es`, `/pt`).
2.  **Capa de Seguridad (Server-side)**: La función `requireRole()` en `src/lib/auth/requireRole.ts`. Este es el verdadero límite de seguridad. Se ejecuta en el servidor (Server Components / Actions) y verifica la validez de la sesión contra la base de datos y el rol del usuario.

## Componentes Clave

### 1. Middleware (`src/middleware.ts`)
Combina la lógica de internacionalización (`next-intl`) con el gate de auth.
- **Matcher**: Excluye assets estáticos, rutas de API y el admin de Payload.
- **Flujo**:
    - Detecta si el usuario intenta acceder a una ruta protegida.
    - Si no tiene cookie de sesión, redirige al login del área (`/acceso/agencias` o `/acceso/jurados`).
    - Si tiene cookie (o la ruta es pública), cede el control al middleware de i18n.

### 2. Auth Gate (`src/lib/auth/gate.ts`)
Lógica pura de decisión de ruteo.
- Soporta prefijos de idioma (`/pt`).
- Define áreas protegidas (`agencies`, `jurors`).

### 3. requireRole (`src/lib/auth/requireRole.ts`)
Función asíncrona para proteger páginas.
- **Fail-closed**: Si hay error de DB o sesión inválida, deniega el acceso.
- **Gating**: Verifica que el role del usuario coincida con el requerido.
- **Retorno**: Devuelve el objeto `AuthedUser` (id, email, role).

## Áreas Protegidas y Roles
Los roles están definidos en `src/lib/auth/roles.ts`:
- `admin`: Acceso total.
- `agency`: Acceso a dashboard de agencias y wizard de inscripción.
- `juror`: Acceso al sistema de votación de jurados.

## Flujo de Login y Recuperación (Frontend)

La autenticación desde el frontend se realiza delegando la gestión de la sesión a los endpoints REST nativos de Payload CMS (`/api/users/*`). El formulario cliente interactúa directamente con estos endpoints y verifica los roles en la respuesta.

### 1. Login
Se realiza un `POST` a `/api/users/login`. Si el login es exitoso, Payload establece la cookie de sesión (`payload-token`). El cliente verifica que el rol devuelto sea el correcto para el área (ej. `agency`) usando funciones utilitarias (ej. `isAgencyLoginResponse`) antes de redirigir al panel.

### 2. Recuperación de Contraseña
El flujo "Forgot Password" envía un `POST` a `/api/users/forgot-password` con el email del usuario. Si el usuario existe, Payload genera un token y envía un correo (requiere que el proveedor de email esté configurado en el backend).

### 3. Reseteo de Contraseña
El link enviado por correo dirige a la misma página de acceso, pero con un parámetro `?token=...`. El formulario detecta este token, entra en modo "reset" y envía la nueva contraseña junto con el token a `/api/users/reset-password`.

## Ejemplo de Uso (Página Privada Server-Side)

```typescript
import { requireRole } from '@/lib/auth';

export default async function AgencyDashboard() {
  const user = await requireRole('agency', '/acceso/agencias');
  // Si llegamos aquí, el usuario es una agencia válida.
  return <div>Hola {user.email}</div>;
}
```

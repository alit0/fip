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

## Ejemplo de Uso

```typescript
import { requireRole } from '@/lib/auth';

export default async function AgencyDashboard() {
  const user = await requireRole('agency', '/acceso/agencias');
  // Si llegamos aquí, el usuario es una agencia válida.
  return <div>Hola {user.email}</div>;
}
```

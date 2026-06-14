export function agencyPanelPath(pathname: string): string {
  return pathname.startsWith('/pt/') || pathname === '/pt'
    ? '/pt/acceso/agencias/panel'
    : '/acceso/agencias/panel'
}

export function validatePasswordReset(password: string, confirm: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (password !== confirm) return 'Las contraseñas no coinciden.'
  return null
}

export function isAgencyLoginResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const user = (value as { user?: { role?: unknown } }).user
  return user?.role === 'agency'
}

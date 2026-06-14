"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { agencyPanelPath, isAgencyLoginResponse, validatePasswordReset } from "@/lib/auth/agencyAccess";

const inputClass =
  "w-full rounded-lg border border-fip-white/15 bg-fip-white/5 px-4 py-3 text-fip-white placeholder:text-fip-white/40 focus:border-fip-gold focus:outline-none focus:ring-1 focus:ring-fip-gold";

type Mode = "login" | "forgot" | "reset";

async function postJSON(path: string, body: Record<string, unknown>) {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  return { res, data };
}

export default function AgencyAccessForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token") ?? "";
  const initialMode: Mode = resetToken ? "reset" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const panelPath = useMemo(() => agencyPanelPath(pathname), [pathname]);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { res, data } = await postJSON("/api/users/login", { email, password });
      if (!res.ok) {
        setError("Email o contraseña inválidos.");
        return;
      }
      if (!isAgencyLoginResponse(data)) {
        setError("Este usuario no tiene acceso al área de agencias.");
        return;
      }
      router.push(panelPath);
    } finally {
      setLoading(false);
    }
  }

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { res } = await postJSON("/api/users/forgot-password", { email });
      if (!res.ok) {
        setError("No pudimos enviar el email de recuperación.");
        return;
      }
      setMessage("Si el email existe, vas a recibir instrucciones para recuperar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const validation = validatePasswordReset(password, confirmPassword);
    if (validation) {
      setError(validation);
      return;
    }
    setLoading(true);
    try {
      const { res } = await postJSON("/api/users/reset-password", { token: resetToken, password });
      if (!res.ok) {
        setError("El enlace de recuperación no es válido o expiró.");
        return;
      }
      setMessage("Contraseña actualizada. Ya podés ingresar.");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-fip-white/10 bg-fip-white/5 p-5">
      {mode === "login" && (
        <form onSubmit={submitLogin} className="space-y-4">
          <div>
            <label htmlFor="agency-email" className="mb-1 block text-sm font-bold text-fip-white/90">Email</label>
            <input id="agency-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
          </div>
          <div>
            <label htmlFor="agency-password" className="mb-1 block text-sm font-bold text-fip-white/90">Contraseña</label>
            <input id="agency-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loading} className="rounded-full bg-fip-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-fip-purple-900 disabled:opacity-60">
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
          <button type="button" onClick={() => { setMode("forgot"); setError(null); setMessage(null); }} className="block text-sm text-fip-gold hover:underline">
            Recuperar contraseña
          </button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={submitForgot} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="mb-1 block text-sm font-bold text-fip-white/90">Email de la agencia</label>
            <input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
          </div>
          <button type="submit" disabled={loading} className="rounded-full bg-fip-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-fip-purple-900 disabled:opacity-60">
            {loading ? "Enviando…" : "Enviar recuperación"}
          </button>
          <button type="button" onClick={() => setMode("login")} className="block text-sm text-fip-gold hover:underline">Volver al login</button>
        </form>
      )}

      {mode === "reset" && (
        <form onSubmit={submitReset} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-bold text-fip-white/90">Nueva contraseña</label>
            <input id="new-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-bold text-fip-white/90">Confirmar contraseña</label>
            <input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={loading} className="rounded-full bg-fip-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-fip-purple-900 disabled:opacity-60">
            {loading ? "Actualizando…" : "Cambiar contraseña"}
          </button>
        </form>
      )}

      {error && <p role="alert" className="mt-4 text-sm font-bold text-red-300">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm font-bold text-fip-gold">{message}</p>}
    </div>
  );
}

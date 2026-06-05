"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-lg border border-fip-white/15 bg-fip-white/5 px-4 py-3 text-fip-white placeholder:text-fip-white/40 focus:border-fip-gold focus:outline-none focus:ring-1 focus:ring-fip-gold";

/**
 * Contact form. Phase 2 has NO backend, so submitting only runs front-end validation
 * and shows a simulated success state. Wiring the real send is a Phase 3 task.
 */
export default function ContactForm() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      setError("Por favor completá todos los campos.");
      return;
    }
    if (!EMAIL_RE.test(form.email)) {
      setError("Ingresá un email válido.");
      return;
    }

    // TODO: conectar a backend en Fase 3 — enviar { nombre, email, mensaje } a la API.
    // Por ahora no hay backend al cual mandar, así que simulamos el envío exitoso.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-fip-gold/40 bg-fip-gold/10 px-5 py-6 text-center">
        <p className="font-title text-lg font-bold text-fip-white">¡Gracias por tu mensaje!</p>
        <p className="mt-2 text-sm text-fip-white/80">
          Te responderemos a la brevedad. {/* Envío simulado: el backend se conecta en Fase 3. */}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-bold text-fip-white/90">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          value={form.nombre}
          onChange={update("nombre")}
          className={inputClass}
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-bold text-fip-white/90">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={update("email")}
          className={inputClass}
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="mensaje" className="mb-1 block text-sm font-bold text-fip-white/90">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          value={form.mensaje}
          onChange={update("mensaje")}
          className={`${inputClass} resize-y`}
          placeholder="Escribí tu consulta…"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-bold text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-fip-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-fip-purple-900 transition hover:brightness-110"
      >
        Enviar mensaje
      </button>
    </form>
  );
}

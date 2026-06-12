import type { Metadata } from "next";
import Section from "@/components/shared/Section";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Panel Agencias" };

export default async function AgenciaPanelPage() {
  const user = await requireRole("agency", "/acceso/agencias");

  return (
    <Section bg="base" id="agencias-panel">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-fip-gold">Área privada</p>
        <h1 className="mt-3 font-title text-4xl font-black leading-tight md:text-5xl">Panel de agencias</h1>
        <p className="mt-4 text-fip-white/75">Sesión iniciada como {user.email}.</p>
      </div>
    </Section>
  );
}

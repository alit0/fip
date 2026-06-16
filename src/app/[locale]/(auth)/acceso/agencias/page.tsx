import type { Metadata } from "next";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import AgencyAccessForm from "@/components/auth/AgencyAccessForm";

export const metadata: Metadata = { title: "Ingreso Agencias" };

export default function AccesoAgenciasPage() {
  return (
    <Section bg="base" id="agencias-login">
      <div className="mx-auto max-w-xl">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Ingreso Agencias" }]} />
        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-fip-gold">Área privada</p>
        <h1 className="mt-3 font-title text-4xl font-black leading-tight md:text-5xl">Ingreso Agencias</h1>
        <p className="mt-4 text-fip-white/75">Accedé al panel de agencias o recuperá tu contraseña.</p>
        <div className="mt-8">
          <AgencyAccessForm />
        </div>
      </div>
    </Section>
  );
}

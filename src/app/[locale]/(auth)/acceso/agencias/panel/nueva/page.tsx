import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/shared/Section";
import { requireRole } from "@/lib/auth";
import CampaignWizard from "@/components/agency/CampaignWizard";

export const metadata: Metadata = { title: "Nueva campaña — Panel Agencias" };

export default async function NuevaCampañaPage() {
  await requireRole("agency", "/acceso/agencias");

  return (
    <Section bg="base" id="nueva-campana">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-fip-gold">Área privada</p>
        <div className="mt-3 flex items-center gap-3">
          <Link
            href="../panel"
            className="text-sm text-fip-white/50 hover:text-fip-white/80"
          >
            Panel
          </Link>
          <span className="text-fip-white/30">/</span>
          <h1 className="font-title text-4xl font-black leading-tight md:text-5xl">
            Nueva campaña
          </h1>
        </div>
        <p className="mt-4 text-fip-white/75">
          Completá los pasos para inscribir tu campaña en el festival.
        </p>
        <div className="mt-8">
          <CampaignWizard />
        </div>
      </div>
    </Section>
  );
}

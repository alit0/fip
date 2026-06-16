import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/shared/Section";
import { requireRole } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";

export const metadata: Metadata = { title: "Panel Agencias" };

type CampaignStatus = "draft" | "submitted" | "under_review" | "accepted" | "rejected";

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Borrador",
  submitted: "Enviada",
  under_review: "En revisión",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

const STATUS_BADGE: Record<CampaignStatus, string> = {
  draft: "bg-fip-white/10 text-fip-white/60",
  submitted: "bg-fip-gold/20 text-fip-gold",
  under_review: "bg-blue-500/20 text-blue-300",
  accepted: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
};

interface Campaign {
  id: string | number;
  campaignName?: string | null;
  company?: string | null;
  status?: string | null;
}

export default async function AgenciaPanelPage() {
  const user = await requireRole("agency", "/acceso/agencias");

  let campaigns: Campaign[] = [];

  const payload = await getPayloadClient();
  if (payload) {
    const result = await payload.find({
      collection: "agency-campaigns",
      where: { submittedBy: { equals: user.id } },
      sort: "-createdAt",
      limit: 100,
    });
    campaigns = result.docs as Campaign[];
  }

  return (
    <Section bg="base" id="agencias-panel">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-fip-gold">Área privada</p>
        <h1 className="mt-3 font-title text-4xl font-black leading-tight md:text-5xl">
          Panel de agencias
        </h1>
        <p className="mt-4 text-fip-white/75">Sesión iniciada como {user.email}.</p>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-fip-white">Mis campañas</h2>
          <Link
            href="./panel/nueva"
            className="rounded-full bg-fip-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-fip-purple-900"
          >
            Nueva campaña
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="mt-6 rounded-xl border border-fip-white/10 bg-fip-white/5 p-8 text-center">
            <p className="text-fip-white/60">Todavía no inscribiste ninguna campaña.</p>
            <Link
              href="./panel/nueva"
              className="mt-4 inline-block rounded-full bg-fip-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-fip-purple-900"
            >
              Inscribir primera campaña
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {campaigns.map((campaign) => {
              const status = (campaign.status ?? "draft") as CampaignStatus;
              return (
                <li
                  key={campaign.id}
                  className="flex items-center justify-between rounded-xl border border-fip-white/10 bg-fip-white/5 px-6 py-4"
                >
                  <div>
                    <p className="font-bold text-fip-white">
                      {campaign.campaignName ?? "Sin nombre"}
                    </p>
                    <p className="mt-1 text-sm text-fip-white/60">{campaign.company}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${STATUS_BADGE[status]}`}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Section>
  );
}

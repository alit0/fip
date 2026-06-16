"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border border-fip-white/15 bg-fip-white/5 px-4 py-3 text-fip-white placeholder:text-fip-white/40 focus:border-fip-gold focus:outline-none focus:ring-1 focus:ring-fip-gold";

const primaryBtn =
  "rounded-full bg-fip-gold px-6 py-3 text-sm font-bold uppercase tracking-widest text-fip-purple-900 disabled:opacity-60";

const secondaryBtn =
  "rounded-full border border-fip-white/20 px-6 py-3 text-sm font-bold uppercase tracking-widest text-fip-white/70 hover:border-fip-white/40 disabled:opacity-60";

interface Category {
  id: string | number;
  title: string;
  code?: string;
  rubro?: { id: string | number; title?: string } | string | number | null;
}

interface FormData {
  campaignName: string;
  company: string;
  description: string;
  categories: (string | number)[];
  videoUrl: string;
  laminaUrl: string;
}

const TOTAL_STEPS = 4;

export default function CampaignWizard() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    campaignName: "",
    company: "",
    description: "",
    categories: [],
    videoUrl: "",
    laminaUrl: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories when entering step 2
  useEffect(() => {
    if (step !== 2 || categories.length > 0) return;
    setLoadingCategories(true);
    fetch("/api/categories?limit=100")
      .then((r) => r.json())
      .then((data: unknown) => {
        const d = data as { docs?: Category[] };
        setCategories(d.docs ?? []);
      })
      .catch(() => {
        /* non-fatal: categories list stays empty */
      })
      .finally(() => setLoadingCategories(false));
  }, [step, categories.length]);

  function update(field: keyof FormData, value: FormData[keyof FormData]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleCategory(id: string | number) {
    setFormData((prev) => {
      const already = prev.categories.includes(id);
      if (already) {
        return { ...prev, categories: prev.categories.filter((c) => c !== id) };
      }
      if (prev.categories.length >= 7) return prev; // max 7
      return { ...prev, categories: [...prev.categories, id] };
    });
  }

  function canAdvance(): boolean {
    if (step === 1) {
      return (
        formData.campaignName.trim().length > 0 &&
        formData.company.trim().length > 0 &&
        formData.description.trim().length > 0
      );
    }
    return true;
  }

  async function submitCampaign(submitStatus: "draft" | "submitted") {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/agency-campaigns", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: formData.campaignName,
          company: formData.company,
          description: formData.description,
          categories: formData.categories,
          videoUrl: formData.videoUrl || undefined,
          laminaUrl: formData.laminaUrl || undefined,
          status: submitStatus,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setError(body.message ?? "Ocurrió un error. Intentá de nuevo.");
        return;
      }

      router.push("/acceso/agencias/panel");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-fip-white/10 bg-fip-white/5 p-6 md:p-8">
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  active
                    ? "bg-fip-gold text-fip-purple-900"
                    : done
                      ? "bg-fip-gold/40 text-fip-purple-900"
                      : "bg-fip-white/10 text-fip-white/50"
                }`}
              >
                {n}
              </div>
              {n < TOTAL_STEPS && (
                <div className={`h-px w-8 ${done ? "bg-fip-gold/40" : "bg-fip-white/10"}`} />
              )}
            </div>
          );
        })}
        <p className="ml-2 text-sm text-fip-white/50">
          Paso {step} de {TOTAL_STEPS}
        </p>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-fip-white">Información básica</h2>
          <div>
            <label htmlFor="campaignName" className="mb-1 block text-sm font-bold text-fip-white/90">
              Nombre de la campaña <span className="text-fip-gold">*</span>
            </label>
            <input
              id="campaignName"
              type="text"
              required
              value={formData.campaignName}
              onChange={(e) => update("campaignName", e.target.value)}
              className={inputClass}
              placeholder="Ej: La campaña más linda del año"
            />
          </div>
          <div>
            <label htmlFor="company" className="mb-1 block text-sm font-bold text-fip-white/90">
              Marca / Empresa <span className="text-fip-gold">*</span>
            </label>
            <input
              id="company"
              type="text"
              required
              value={formData.company}
              onChange={(e) => update("company", e.target.value)}
              className={inputClass}
              placeholder="Ej: Coca-Cola Argentina"
            />
          </div>
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-bold text-fip-white/90">
              Descripción <span className="text-fip-gold">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={5}
              value={formData.description}
              onChange={(e) => update("description", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Describí brevemente la campaña, su objetivo y resultados."
            />
          </div>
        </div>
      )}

      {/* Step 2: Categories */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-fip-white">Categorías</h2>
            <p className="mt-1 text-sm text-fip-white/60">
              Seleccioná hasta 7 categorías para tu campaña.{" "}
              <span className="text-fip-gold">{formData.categories.length}/7 seleccionadas</span>
            </p>
          </div>

          {loadingCategories ? (
            <p className="text-sm text-fip-white/50">Cargando categorías…</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-fip-white/50">
              No hay categorías disponibles en este momento.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {categories.map((cat) => {
                const selected = formData.categories.includes(cat.id);
                const maxReached = formData.categories.length >= 7 && !selected;
                return (
                  <li key={cat.id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selected
                          ? "border-fip-gold bg-fip-gold/10"
                          : maxReached
                            ? "cursor-not-allowed border-fip-white/10 bg-fip-white/5 opacity-50"
                            : "border-fip-white/10 bg-fip-white/5 hover:border-fip-white/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 shrink-0 accent-fip-gold"
                        checked={selected}
                        disabled={maxReached}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      <span className="text-sm text-fip-white">
                        {cat.code ? (
                          <span className="mr-1 text-fip-white/50">{cat.code}</span>
                        ) : null}
                        {typeof cat.title === "string" ? cat.title : String(cat.title)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Step 3: Files & Links */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-fip-white">Archivos y enlaces</h2>
          <div>
            <label htmlFor="videoUrl" className="mb-1 block text-sm font-bold text-fip-white/90">
              URL del video (opcional)
            </label>
            <input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => update("videoUrl", e.target.value)}
              className={inputClass}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label htmlFor="laminaUrl" className="mb-1 block text-sm font-bold text-fip-white/90">
              URL de lámina / brief (opcional)
            </label>
            <input
              id="laminaUrl"
              type="url"
              value={formData.laminaUrl}
              onChange={(e) => update("laminaUrl", e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div className="rounded-lg border border-fip-white/10 bg-fip-white/5 px-4 py-3">
            <p className="text-sm text-fip-white/60">
              <span className="font-bold text-fip-white/80">Archivo de presentación</span>{" "}
              — El archivo PDF o PPTX se puede adjuntar desde el panel luego de inscribir la campaña.
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-fip-white">Revisar y enviar</h2>
          <div className="space-y-4 rounded-lg border border-fip-white/10 bg-fip-white/5 p-5">
            <Row label="Campaña" value={formData.campaignName} />
            <Row label="Marca / Empresa" value={formData.company} />
            <Row label="Descripción" value={formData.description} />
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-fip-white/50">
                Categorías
              </dt>
              <dd className="mt-1 text-sm text-fip-white">
                {formData.categories.length === 0
                  ? "Ninguna seleccionada"
                  : `${formData.categories.length} categoría(s) seleccionada(s)`}
              </dd>
            </div>
            {formData.videoUrl && <Row label="Video" value={formData.videoUrl} />}
            {formData.laminaUrl && <Row label="Lámina" value={formData.laminaUrl} />}
          </div>

          {error && (
            <p role="alert" className="text-sm font-bold text-red-300">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitCampaign("draft")}
              className={secondaryBtn}
            >
              {submitting ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitCampaign("submitted")}
              className={primaryBtn}
            >
              {submitting ? "Enviando…" : "Enviar inscripción"}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {step < 4 && (
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className={secondaryBtn}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className={primaryBtn}
          >
            Siguiente
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={submitting}
            className={secondaryBtn}
          >
            Anterior
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-widest text-fip-white/50">{label}</dt>
      <dd className="mt-1 text-sm text-fip-white">{value}</dd>
    </div>
  );
}

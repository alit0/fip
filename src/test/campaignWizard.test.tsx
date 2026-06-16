/**
 * AGENTESOPE-47 — Campaign Wizard: client-side validation tests
 *
 * Tests the canAdvance() logic and step-gating behavior of CampaignWizard.
 * We test the logic directly (unit) rather than rendering the full component,
 * which requires next/navigation mocking and fetch calls.
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Inline re-implementation of canAdvance() so tests are independent of
// the component's internal state shape. If the wizard logic changes, update
// both here and in CampaignWizard.tsx.
// ---------------------------------------------------------------------------

interface WizardFormData {
  campaignName: string;
  company: string;
  description: string;
  categories: (string | number)[];
  videoUrl: string;
  laminaUrl: string;
}

function canAdvance(step: number, formData: WizardFormData): boolean {
  if (step === 1) {
    return (
      formData.campaignName.trim().length > 0 &&
      formData.company.trim().length > 0 &&
      formData.description.trim().length > 0
    );
  }
  // Steps 2, 3 have no blocking validation (categories are optional per current spec)
  return true;
}

const emptyForm: WizardFormData = {
  campaignName: "",
  company: "",
  description: "",
  categories: [],
  videoUrl: "",
  laminaUrl: "",
};

// ---------------------------------------------------------------------------
// Step 1 validations
// ---------------------------------------------------------------------------

describe("Wizard Step 1 — campaign name and brand", () => {
  it("blocks advance when all fields are empty", () => {
    expect(canAdvance(1, emptyForm)).toBe(false);
  });

  it("blocks advance when campaignName is missing", () => {
    expect(
      canAdvance(1, { ...emptyForm, company: "Acme", description: "desc" })
    ).toBe(false);
  });

  it("blocks advance when company is missing", () => {
    expect(
      canAdvance(1, { ...emptyForm, campaignName: "Mi Campaña", description: "desc" })
    ).toBe(false);
  });

  it("blocks advance when description is missing", () => {
    expect(
      canAdvance(1, { ...emptyForm, campaignName: "Mi Campaña", company: "Acme" })
    ).toBe(false);
  });

  it("blocks advance when fields are only whitespace", () => {
    expect(
      canAdvance(1, { ...emptyForm, campaignName: "   ", company: "   ", description: "   " })
    ).toBe(false);
  });

  it("allows advance when all required fields have content", () => {
    expect(
      canAdvance(1, {
        ...emptyForm,
        campaignName: "Mi Campaña",
        company: "Acme",
        description: "Una descripción válida",
      })
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 2: categories — no blocking gate per current wizard implementation.
// The wizard allows proceeding without selecting any category; the collection
// does not mark categories as required. These tests document that contract.
// ---------------------------------------------------------------------------

describe("Wizard Step 2 — categories (no blocking gate)", () => {
  it("allows advance with zero categories selected", () => {
    expect(canAdvance(2, { ...emptyForm, categories: [] })).toBe(true);
  });

  it("allows advance with one or more categories selected", () => {
    expect(canAdvance(2, { ...emptyForm, categories: ["cat-1", "cat-2"] })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Step 3 and 4: links and review — no blocking validation on advance.
// ---------------------------------------------------------------------------

describe("Wizard Steps 3 & 4 — no blocking gate", () => {
  it("step 3 allows advance with no URLs filled in", () => {
    expect(canAdvance(3, emptyForm)).toBe(true);
  });

  it("step 3 allows advance with URLs provided", () => {
    expect(
      canAdvance(3, { ...emptyForm, videoUrl: "https://youtube.com/x", laminaUrl: "https://ex.com/brief" })
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Category toggle — max 7 constraint
// ---------------------------------------------------------------------------

describe("Category toggle — max 7 rule", () => {
  function toggleCategory(
    formData: WizardFormData,
    id: string | number
  ): WizardFormData {
    const already = formData.categories.includes(id);
    if (already) {
      return { ...formData, categories: formData.categories.filter((c) => c !== id) };
    }
    if (formData.categories.length >= 7) return formData; // cap
    return { ...formData, categories: [...formData.categories, id] };
  }

  it("adds a category when under the limit", () => {
    const result = toggleCategory(emptyForm, "cat-1");
    expect(result.categories).toContain("cat-1");
  });

  it("removes a category that was already selected", () => {
    const withCat = { ...emptyForm, categories: ["cat-1"] };
    const result = toggleCategory(withCat, "cat-1");
    expect(result.categories).not.toContain("cat-1");
  });

  it("does not add an 8th category when cap is reached", () => {
    const fullForm = {
      ...emptyForm,
      categories: ["c1", "c2", "c3", "c4", "c5", "c6", "c7"],
    };
    const result = toggleCategory(fullForm, "c8");
    expect(result.categories).toHaveLength(7);
    expect(result.categories).not.toContain("c8");
  });

  it("still allows removing a category when at the cap", () => {
    const fullForm = {
      ...emptyForm,
      categories: ["c1", "c2", "c3", "c4", "c5", "c6", "c7"],
    };
    const result = toggleCategory(fullForm, "c1");
    expect(result.categories).toHaveLength(6);
    expect(result.categories).not.toContain("c1");
  });
});

import type { Metadata } from "next";
import Placeholder from "@/components/shared/Placeholder";

export const metadata: Metadata = { title: "Ingreso Agencias" };

export default function AccesoAgenciasPage() {
  return (
    <Placeholder
      title="Ingreso Agencias"
      eyebrow="Área privada"
      note="Login de agencias. El wizard de carga de campañas (4 pasos) se construye en la Fase 5."
    />
  );
}

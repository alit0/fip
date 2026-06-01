import type { Metadata } from "next";
import Placeholder from "@/components/shared/Placeholder";

export const metadata: Metadata = { title: "Ingreso Jurados" };

export default function AccesoJuradosPage() {
  return (
    <Placeholder
      title="Ingreso Jurados"
      eyebrow="Área privada"
      note="Login de jurados. El sistema de scoring (4 criterios) se construye en la Fase 6."
    />
  );
}

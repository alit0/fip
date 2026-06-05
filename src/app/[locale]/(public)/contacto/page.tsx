import type { Metadata } from "next";
import { Mail, MessageCircle, MapPin, Phone } from "lucide-react";
import Section from "@/components/shared/Section";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BackToTop from "@/components/shared/BackToTop";
import ContactForm from "@/components/contacto/ContactForm";
import { getContacto } from "@/lib/content";

const description =
  "Contacto del FIP Festival: autoridades, prensa, información general, WhatsApp, dirección y formulario de consultas.";

export const metadata: Metadata = {
  title: "Contacto",
  description,
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto · FIP Festival",
    description,
    url: "/contacto",
    type: "website",
  },
};

/** Strip everything but digits, for tel:/wa.me hrefs. */
const digits = (s: string) => s.replace(/\D/g, "");

export default async function ContactoPage() {
  const { title, intro, people, emails, whatsapps, address, office } = await getContacto();

  return (
    <>
      <Section bg="base" id="contacto-top" className="!pb-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contacto" }]} />
        <h1 className="mt-6 text-center font-title text-4xl font-black md:text-5xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-fip-white/85">{intro}</p>
      </Section>

      <Section bg="base" className="!pt-0">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          {/* Datos de contacto */}
          <div className="space-y-8">
            <div>
              <h2 className="font-title text-xl font-black uppercase tracking-wide text-fip-gold">
                Autoridades
              </h2>
              <ul className="mt-4 space-y-4">
                {people.map((person) => (
                  <li key={person.email}>
                    <p className="text-sm text-fip-white/60">{person.role}</p>
                    <p className="font-title font-bold text-fip-white">{person.name}</p>
                    <a
                      href={`mailto:${person.email}`}
                      className="inline-flex items-center gap-2 text-sm text-fip-gold hover:underline"
                    >
                      <Mail size={14} strokeWidth={2} />
                      {person.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-title text-xl font-black uppercase tracking-wide text-fip-gold">
                Escribinos
              </h2>
              <ul className="mt-4 space-y-2">
                {emails.map((item) => (
                  <li key={item.email} className="text-sm text-fip-white/85">
                    <span className="text-fip-white/60">{item.label}: </span>
                    <a href={`mailto:${item.email}`} className="text-fip-gold hover:underline">
                      {item.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-title text-xl font-black uppercase tracking-wide text-fip-gold">
                WhatsApp
              </h2>
              <ul className="mt-4 space-y-2">
                {whatsapps.map((number) => (
                  <li key={number}>
                    <a
                      href={`https://wa.me/${digits(number)}`}
                      className="inline-flex items-center gap-2 text-sm text-fip-white/85 hover:text-fip-gold"
                    >
                      <MessageCircle size={14} strokeWidth={2} />
                      {number}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 text-sm text-fip-white/85">
              <p className="flex items-center gap-2">
                <MapPin size={14} strokeWidth={2} className="text-fip-gold" />
                {address}
              </p>
              <a
                href={`tel:${digits(office)}`}
                className="flex items-center gap-2 hover:text-fip-gold"
              >
                <Phone size={14} strokeWidth={2} className="text-fip-gold" />
                Oficina: {office}
              </a>
            </div>
          </div>

          {/* Formulario (client component) */}
          <div>
            <h2 className="font-title text-xl font-black uppercase tracking-wide text-fip-gold">
              Dejanos tu mensaje
            </h2>
            <div className="mt-4">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>

      <BackToTop />
    </>
  );
}

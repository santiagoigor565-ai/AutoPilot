import Link from "next/link";
import { ArrowUpRight, Mail, MessageSquareText } from "lucide-react";
import { buildWhatsappHref, contact } from "@/lib/contact";

const footerLinks = [
  { label: "Planos", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Entrar", href: "/login" },
  { label: "Criar conta", href: "/signup" },
];

const segments = ["Advocacia", "Engenharia", "Saúde", "Educação", "Comércio", "Serviços B2B"];

const whatsappHref = buildWhatsappHref("Olá! Quero conversar sobre os planos da AutoPilot.com.");

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#bdd2ee] bg-[#091b31] text-[#ddecff]">
      <div className="mx-auto grid w-full max-w-[1520px] gap-8 px-2 py-12 md:grid-cols-[1fr_auto] md:px-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#84d6ff]">AutoPilot.com</p>
          <h2 className="mt-3 max-w-xl text-2xl font-semibold text-[#eef5ff]">Sistema completo para presença digital com foco em conversão.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b5cef0]">
            Criação, manutenção e evolução contínua da sua operação online com suporte humano e tecnologia própria.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {segments.map((segment) => (
              <span key={segment} className="rounded-full border border-[#76b7ff]/35 bg-[#112f54] px-3 py-1 text-xs text-[#d3e7ff]">
                {segment}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#cadaf1]">
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-[#7be8ff]">
              <MessageSquareText className="h-4 w-4" />
              WhatsApp {contact.phoneDisplay}
            </a>
            <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-[#7be8ff]">
              <Mail className="h-4 w-4" />
              {contact.email}
            </a>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-[#cadaf1]">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 transition-colors hover:text-[#7be8ff]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-[#163760]">
        <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between gap-3 px-2 py-4 text-xs text-[#95b4d9] md:px-3">
          <p>© {year} AutoPilot.com. Todos os direitos reservados.</p>
          <p>Desenvolvido para acelerar aquisição digital com previsibilidade.</p>
        </div>
      </div>
    </footer>
  );
}

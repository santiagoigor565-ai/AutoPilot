import { MessageSquareText } from "lucide-react";
import { buildWhatsappHref } from "@/lib/contact";

type FloatingWhatsappButtonProps = {
  message?: string;
};

const defaultMessage = "Oi! Quero falar com a AutoPilot sobre meu projeto.";

export function FloatingWhatsappButton({ message = defaultMessage }: FloatingWhatsappButtonProps) {
  const whatsappHref = buildWhatsappHref(message);

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir conversa no WhatsApp"
      className="floating-cta fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#19A85E] px-4 py-3 text-sm font-semibold text-[#f4fff8] shadow-[0_14px_28px_rgb(25_168_94_/_36%)] transition hover:bg-[#14884b]"
    >
      <MessageSquareText className="h-4 w-4" />
      WhatsApp
    </a>
  );
}

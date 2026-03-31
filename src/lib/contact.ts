import { env } from "@/lib/env";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export const contact = {
  whatsappNumber: normalizePhone(env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  phoneDisplay: env.NEXT_PUBLIC_CONTACT_PHONE,
  email: env.NEXT_PUBLIC_CONTACT_EMAIL,
};

export function buildWhatsappHref(message: string) {
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

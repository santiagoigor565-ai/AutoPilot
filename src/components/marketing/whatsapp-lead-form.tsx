"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type WhatsappLeadFormProps = {
  whatsappNumber: string;
  defaultMessage: string;
  className?: string;
};

type FormState = {
  name: string;
  phone: string;
  business: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  phone: "",
  business: "",
  message: "",
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function WhatsappLeadForm({ whatsappNumber, defaultMessage, className }: WhatsappLeadFormProps) {
  const [form, setForm] = useState<FormState>(initialState);

  const whatsappLink = useMemo(() => {
    const lines = [
      defaultMessage,
      `Nome: ${form.name.trim() || "-"}`,
      `WhatsApp: ${form.phone.trim() || "-"}`,
      form.business.trim() ? `Empresa: ${form.business.trim()}` : "",
      form.message.trim() ? `Objetivo: ${form.message.trim()}` : "",
    ].filter(Boolean);

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [defaultMessage, form, whatsappNumber]);

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !onlyDigits(form.phone)) {
      toast.error("Preencha nome e WhatsApp para continuar.");
      return;
    }

    window.open(whatsappLink, "_blank", "noopener,noreferrer");
    toast.success("Conversa aberta no WhatsApp.");
    setForm(initialState);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("surface-card space-y-4 p-6", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="lead-name" className="text-sm font-semibold text-[#1e3a41]">
            Nome
          </label>
          <Input
            id="lead-name"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
            className="h-11 border-[#cbbda5] bg-[#fffaf0]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lead-phone" className="text-sm font-semibold text-[#1e3a41]">
            WhatsApp
          </label>
          <Input
            id="lead-phone"
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="(00) 00000-0000"
            autoComplete="tel"
            className="h-11 border-[#cbbda5] bg-[#fffaf0]"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="lead-business" className="text-sm font-semibold text-[#1e3a41]">
          Empresa
        </label>
        <Input
          id="lead-business"
          value={form.business}
          onChange={(event) => handleChange("business", event.target.value)}
          placeholder="Nome da empresa"
          autoComplete="organization"
          className="h-11 border-[#cbbda5] bg-[#fffaf0]"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="lead-message" className="text-sm font-semibold text-[#1e3a41]">
          O que você precisa?
        </label>
        <Textarea
          id="lead-message"
          value={form.message}
          onChange={(event) => handleChange("message", event.target.value)}
          placeholder="Fale sobre seu segmento, urgência e expectativas."
          className="min-h-28 border-[#cbbda5] bg-[#fffaf0]"
        />
      </div>
      <Button type="submit" className="primary-glow h-11 w-full rounded-full bg-[#0f826f] text-[#f4fffd] hover:bg-[#0c6d5d]">
        Enviar para WhatsApp
        <Send className="h-4 w-4" />
      </Button>
      <p className="text-xs leading-relaxed text-[#4c5f66]">
        Ao enviar, abrimos uma conversa no WhatsApp com seus dados já preenchidos para agilizar seu atendimento.
      </p>
    </form>
  );
}


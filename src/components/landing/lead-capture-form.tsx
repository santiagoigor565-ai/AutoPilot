"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LeadCaptureFormProps = {
  pageId: string;
  ctaLabel: string;
  successMessage: string;
  className?: string;
  mode?: "published" | "preview";
};

export function LeadCaptureForm({ pageId, ctaLabel, successMessage, className, mode = "published" }: LeadCaptureFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isPreview = mode === "preview";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPreview) {
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(`/api/pages/${pageId}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Nao foi possivel enviar." }));
      setStatus("error");
      setErrorMessage(data.error ?? "Nao foi possivel enviar.");
      return;
    }

    setStatus("success");
    (event.currentTarget as HTMLFormElement).reset();
  }

  return (
    <form className={className} onSubmit={onSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="name" required placeholder="Nome completo" disabled={isPreview} />
        <Input name="email" type="email" required placeholder="Email profissional" disabled={isPreview} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Input name="company" placeholder="Empresa (opcional)" disabled={isPreview} />
        <Input name="phone" placeholder="Telefone (opcional)" disabled={isPreview} />
      </div>
      <Textarea className="mt-3" name="message" placeholder="Contexto da sua campanha (opcional)" disabled={isPreview} />
      <Button className="mt-3 w-full md:w-auto" type="submit" disabled={status === "loading" || isPreview}>
        {isPreview ? "Preview sem envio" : status === "loading" ? "Enviando..." : ctaLabel}
      </Button>
      {isPreview ? <p className="mt-2 text-sm text-amber-700">Preview ativo. Submissoes ficam bloqueadas ate a publicacao.</p> : null}
      {status === "success" ? <p className="mt-2 text-sm text-emerald-700">{successMessage}</p> : null}
      {status === "error" ? <p className="mt-2 text-sm text-rose-600">{errorMessage}</p> : null}
    </form>
  );
}

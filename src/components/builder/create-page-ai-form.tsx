"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image as ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_ATTACHMENTS = 20;
const MAX_FILE_BYTES = 25_000_000;

type CreatePageAiFormProps = {
  workspaceId: string;
};

type PendingAttachment = {
  id: string;
  file: File;
};

type UploadedAttachment = {
  assetId: string;
  filename: string;
  mimeType: string;
  size: number;
};

type UploadUrlResponse = {
  uploadUrl: string;
  asset: {
    id: string;
    mimeType: string;
    size: number;
  };
};

function formatSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeMimeType(file: File) {
  return file.type && file.type.length > 0 ? file.type : "application/octet-stream";
}

export function CreatePageAiForm({ workspaceId }: CreatePageAiFormProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Pronto para gerar.");

  const canSubmit = useMemo(() => {
    return prompt.trim().length >= 20 && !isSubmitting;
  }, [isSubmitting, prompt]);

  function onPickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) {
      return;
    }

    const availableSlots = Math.max(MAX_ATTACHMENTS - attachments.length, 0);
    if (availableSlots === 0) {
      toast.error(`Limite de ${MAX_ATTACHMENTS} anexos por landing.`);
      return;
    }

    const nextBatch = files.slice(0, availableSlots);
    const rejected = nextBatch.filter((item) => item.size > MAX_FILE_BYTES);
    if (rejected.length) {
      toast.error(`Alguns arquivos foram ignorados por exceder ${formatSize(MAX_FILE_BYTES)}.`);
    }

    const accepted = nextBatch
      .filter((item) => item.size <= MAX_FILE_BYTES)
      .map((item) => ({
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        file: item,
      }));

    if (accepted.length) {
      setAttachments((current) => [...current, ...accepted]);
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }

  async function uploadAttachment(attachment: PendingAttachment): Promise<UploadedAttachment> {
    const mimeType = normalizeMimeType(attachment.file);

    const createUploadResponse = await fetch("/api/assets/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceId,
        filename: attachment.file.name,
        mimeType,
        size: attachment.file.size,
      }),
    });

    if (!createUploadResponse.ok) {
      const payload = await createUploadResponse.json().catch(() => ({ error: "Falha ao preparar upload." }));
      throw new Error(payload.error ?? "Falha ao preparar upload.");
    }

    const payload = (await createUploadResponse.json()) as UploadUrlResponse;
    const uploadResponse = await fetch(payload.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
      body: attachment.file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Nao foi possivel enviar o arquivo ${attachment.file.name}.`);
    }

    return {
      assetId: payload.asset.id,
      filename: attachment.file.name,
      mimeType: payload.asset.mimeType,
      size: payload.asset.size,
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Preparando anexos...");

    try {
      const uploadedAttachments: UploadedAttachment[] = [];
      for (let index = 0; index < attachments.length; index += 1) {
        setStatusMessage(`Enviando anexo ${index + 1}/${attachments.length}...`);
        const uploaded = await uploadAttachment(attachments[index]);
        uploadedAttachments.push(uploaded);
      }

      setStatusMessage("Gerando a landing com IA...");
      const response = await fetch("/api/pages/ai-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          prompt: prompt.trim(),
          attachments: uploadedAttachments,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Falha ao gerar landing." }));
        throw new Error(payload.error ?? "Falha ao gerar landing.");
      }

      const payload = (await response.json()) as { page: { id: string } };
      toast.success("Landing criada via IA.");
      router.push(`/app/pages/${payload.page.id}/preview`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar landing via IA.");
      setStatusMessage("Falha na geracao. Revise o prompt e tente novamente.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Criar landing com IA</CardTitle>
        <CardDescription>
          Envie um prompt com direcao visual, estrutura do negocio e objetivo da pagina. Voce pode anexar imagens e arquivos para a IA usar como contexto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={(event) => void onSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt do cliente</Label>
            <Textarea
              id="prompt"
              required
              minLength={20}
              placeholder="Ex.: Somos uma clinica de harmonizacao facial premium em Sao Paulo. Queremos uma landing com foco em agendamento via WhatsApp, linguagem elegante, paleta neutra e prova social forte..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">{prompt.trim().length} caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Imagens e arquivos de referencia</Label>
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={onPickFiles}
              disabled={isSubmitting || attachments.length >= MAX_ATTACHMENTS}
            />
            <p className="text-xs text-muted-foreground">
              Suporta imagens e documentos de apoio (texto, PDF, planilhas e semelhantes). Maximo de {MAX_ATTACHMENTS} anexos, ate {formatSize(MAX_FILE_BYTES)} por arquivo.
            </p>
          </div>

          {attachments.length ? (
            <div className="space-y-2 rounded-lg border border-border bg-card/50 p-3">
              <p className="text-sm font-medium">Anexos selecionados ({attachments.length})</p>
              <ul className="space-y-2">
                {attachments.map((attachment) => {
                  const isImage = normalizeMimeType(attachment.file).startsWith("image/");
                  return (
                    <li key={attachment.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        {isImage ? <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" /> : <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{attachment.file.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {normalizeMimeType(attachment.file)} - {formatSize(attachment.file.size)}
                          </p>
                        </div>
                      </div>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeAttachment(attachment.id)} disabled={isSubmitting}>
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Editor manual preservado no projeto, mas oculto nesta etapa de criacao.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!canSubmit}>
              <Upload className="h-4 w-4" />
              {isSubmitting ? "Gerando..." : "Gerar landing com IA"}
            </Button>
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

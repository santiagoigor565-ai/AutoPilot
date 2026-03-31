"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Eye, Laptop, MonitorSmartphone, PencilLine, Plus, Save, Trash2, Upload } from "lucide-react";
import type { LandingContent, LandingBlock, BlockType } from "@/types/builder";
import { blockTypeValues, createDefaultBlock, landingBlockSchema, parseLandingContent } from "@/types/builder";
import { LandingRenderer } from "@/components/landing/landing-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type EditablePage = {
  id: string;
  name: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string | null;
  faviconUrl: string | null;
  status: "draft" | "published" | "suspended";
  draftContent: unknown;
  publicHost?: string | null;
};

type LandingPageEditorProps = {
  page: EditablePage;
};

type EditorSettings = {
  name: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  faviconUrl: string;
};

type PreviewMode = "desktop" | "mobile";

const labels: Record<BlockType, string> = {
  hero: "Hero",
  logos: "Logos / Prova social",
  benefits: "Beneficios",
  features: "Features",
  howItWorks: "Como funciona",
  testimonials: "Depoimentos",
  cta: "CTA",
  faq: "FAQ",
  leadForm: "Formulario de captura",
  footer: "Footer",
};

const themeFields: Array<keyof LandingContent["theme"]> = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "backgroundColor",
  "foregroundColor",
];

const PREVIEW_VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

function buildDraftPayload(content: LandingContent, settings: EditorSettings) {
  return JSON.stringify({
    draftContent: content,
    settings,
  });
}

function mergeSettings(base: EditorSettings, partial?: Partial<EditorSettings>) {
  if (!partial || typeof partial !== "object") {
    return base;
  }

  return {
    name: typeof partial.name === "string" ? partial.name : base.name,
    slug: typeof partial.slug === "string" ? partial.slug : base.slug,
    seoTitle: typeof partial.seoTitle === "string" ? partial.seoTitle : base.seoTitle,
    seoDescription: typeof partial.seoDescription === "string" ? partial.seoDescription : base.seoDescription,
    ogImageUrl: typeof partial.ogImageUrl === "string" ? partial.ogImageUrl : base.ogImageUrl,
    faviconUrl: typeof partial.faviconUrl === "string" ? partial.faviconUrl : base.faviconUrl,
  };
}

export function LandingPageEditor({ page }: LandingPageEditorProps) {
  const initialContent = useMemo(() => parseLandingContent(page.draftContent), [page.draftContent]);
  const initialSettings = useMemo<EditorSettings>(
    () => ({
      name: page.name,
      slug: page.slug,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      ogImageUrl: page.ogImageUrl ?? "",
      faviconUrl: page.faviconUrl ?? "",
    }),
    [page.faviconUrl, page.name, page.ogImageUrl, page.seoDescription, page.seoTitle, page.slug],
  );

  const [content, setContent] = useState<LandingContent>(initialContent);
  const [pageStatus, setPageStatus] = useState(page.status);
  const [settings, setSettings] = useState<EditorSettings>(initialSettings);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(content.sections[0]?.id ?? null);
  const [sectionToolsId, setSectionToolsId] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [previewScale, setPreviewScale] = useState(1);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [jsonDraft, setJsonDraft] = useState("");
  const draftBackupKey = useMemo(() => `lf_editor_backup_${page.id}`, [page.id]);
  const previewCanvasRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);
  const saveAbortRef = useRef<AbortController | null>(null);
  const lastSavedPayloadRef = useRef<string>(buildDraftPayload(initialContent, initialSettings));

  const selectedBlock = useMemo(() => content.sections.find((section) => section.id === selectedBlockId) ?? null, [content.sections, selectedBlockId]);
  const publicSlugUrl = page.publicHost ? `https://${page.publicHost}/${settings.slug}` : null;
  const isMockPage = page.id === "mock";
  const previewViewport = previewMode === "mobile" ? PREVIEW_VIEWPORTS.mobile : PREVIEW_VIEWPORTS.desktop;
  const currentPayload = useMemo(() => buildDraftPayload(content, settings), [content, settings]);
  const hasUnsavedChanges = currentPayload !== lastSavedPayloadRef.current;
  const saveStatusMessage = useMemo(() => {
    if (savingState === "saving") {
      return "Salvando alteracoes...";
    }

    if (savingState === "error") {
      return "Falha ao salvar. Tente novamente.";
    }

    if (hasUnsavedChanges) {
      return "Alteracoes pendentes. Clique em Salvar.";
    }

    if (lastSavedAt) {
      const hour = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(lastSavedAt);
      return `Ultimo salvamento: ${hour}`;
    }

    return "Sem alteracoes pendentes.";
  }, [hasUnsavedChanges, lastSavedAt, savingState]);

  useEffect(() => {
    if (!selectedBlock && content.sections[0]) {
      setSelectedBlockId(content.sections[0].id);
    }
  }, [content.sections, selectedBlock]);

  useEffect(() => {
    setJsonDraft(selectedBlock ? JSON.stringify(selectedBlock, null, 2) : "");
  }, [selectedBlock]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawBackup = window.localStorage.getItem(draftBackupKey);
    if (!rawBackup) {
      return;
    }

    try {
      const parsed = JSON.parse(rawBackup) as {
        draftContent?: unknown;
        settings?: Partial<EditorSettings>;
      };

      if (parsed.draftContent) {
        const restoredContent = parseLandingContent(parsed.draftContent);
        setContent(restoredContent);
        setSelectedBlockId(restoredContent.sections[0]?.id ?? null);
      }

      if (parsed.settings) {
        setSettings((prev) => mergeSettings(prev, parsed.settings));
      }
    } catch {
      window.localStorage.removeItem(draftBackupKey);
    }
  }, [draftBackupKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const backupPayload = JSON.stringify({
      draftContent: content,
      settings,
      updatedAt: Date.now(),
    });

    const browserWindow = window as Window & typeof globalThis & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let idleHandle: number | null = null;
    const timeoutHandle = window.setTimeout(() => {
      if (typeof browserWindow.requestIdleCallback === "function") {
        idleHandle = browserWindow.requestIdleCallback(() => {
          window.localStorage.setItem(draftBackupKey, backupPayload);
        }, { timeout: 500 });
        return;
      }

      window.localStorage.setItem(draftBackupKey, backupPayload);
    }, 250);

    return () => {
      window.clearTimeout(timeoutHandle);
      if (idleHandle !== null && typeof browserWindow.cancelIdleCallback === "function") {
        browserWindow.cancelIdleCallback(idleHandle);
      }
    };
  }, [content, settings, draftBackupKey]);

  useEffect(() => {
    if ((savingState === "saved" || savingState === "error") && hasUnsavedChanges) {
      setSavingState("idle");
    }
  }, [hasUnsavedChanges, savingState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const container = previewCanvasRef.current;
    if (!container) {
      return;
    }
    const host = container;

    let animationFrame = 0;
    function updateScale() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const availableWidth = Math.max(host.clientWidth - 24, 1);
        const availableHeight = Math.max(host.clientHeight - 24, 1);
        const nextScale = Math.min(
          availableWidth / previewViewport.width,
          availableHeight / previewViewport.height,
          1,
        );
        setPreviewScale((current) => (Math.abs(current - nextScale) < 0.005 ? current : nextScale));
      });
    }

    updateScale();
    const resizeObserver = new ResizeObserver(() => updateScale());
    resizeObserver.observe(host);
    window.addEventListener("resize", updateScale);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [previewViewport.height, previewViewport.width]);

  const saveDraft = useCallback(async () => {
    if (currentPayload === lastSavedPayloadRef.current) {
      return true;
    }

    if (saveAbortRef.current) {
      saveAbortRef.current.abort();
    }

    const controller = new AbortController();
    saveAbortRef.current = controller;
    if (isMountedRef.current) {
      setSavingState("saving");
    }

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: currentPayload,
        signal: controller.signal,
      });

      if (!response.ok) {
        const responsePayload = await response.json().catch(() => ({ error: "Falha ao salvar." }));
        throw new Error(responsePayload.error ?? "Falha ao salvar.");
      }

      lastSavedPayloadRef.current = currentPayload;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(draftBackupKey);
      }

      if (isMountedRef.current) {
        setLastSavedAt(new Date());
        setSavingState("saved");
      }
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return false;
      }

      if (isMountedRef.current) {
        setSavingState("error");
        toast.error(error instanceof Error ? error.message : "Falha ao salvar.");
      }
      return false;
    }
  }, [currentPayload, draftBackupKey, page.id]);

  useEffect(() => {
    function onSaveShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveDraft();
      }
    }

    window.addEventListener("keydown", onSaveShortcut);
    return () => window.removeEventListener("keydown", onSaveShortcut);
  }, [saveDraft]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  function updateSelectedBlock(updater: (block: LandingBlock) => LandingBlock) {
    if (!selectedBlockId) {
      return;
    }

    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === selectedBlockId ? updater(section) : section)),
    }));
  }

  function updateTheme(field: keyof LandingContent["theme"], value: string) {
    setContent((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value,
      },
    }));
  }

  function addBlock(type: BlockType) {
    const newBlock = createDefaultBlock(type);
    setContent((prev) => ({ ...prev, sections: [...prev.sections, newBlock] }));
    setSelectedBlockId(newBlock.id);
  }

  function removeBlock(blockId: string) {
    setContent((prev) => {
      const remaining = prev.sections.filter((section) => section.id !== blockId);
      const nextSections = remaining.length > 0 ? remaining : [createDefaultBlock("hero")];
      setSelectedBlockId(nextSections[0]?.id ?? null);
      return { ...prev, sections: nextSections };
    });
  }

  function duplicateBlock(block: LandingBlock) {
    const clone = {
      ...block,
      id: `${block.type}-${Date.now()}`,
    } as LandingBlock;

    setContent((prev) => ({ ...prev, sections: [...prev.sections, clone] }));
    setSelectedBlockId(clone.id);
  }

  function moveBlock(blockId: string, direction: "up" | "down") {
    setContent((prev) => {
      const index = prev.sections.findIndex((section) => section.id === blockId);
      if (index === -1) return prev;

      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.sections.length) return prev;

      const cloned = [...prev.sections];
      [cloned[index], cloned[target]] = [cloned[target], cloned[index]];
      return { ...prev, sections: cloned };
    });
  }

  function applyBlockJson() {
    if (!selectedBlock) return;

    try {
      const parsedJson = JSON.parse(jsonDraft);
      const validated = landingBlockSchema.safeParse(parsedJson);
      if (!validated.success) {
        throw new Error("JSON invalido para este bloco.");
      }
      if (validated.data.type !== selectedBlock.type) {
        throw new Error("O tipo do bloco nao pode ser alterado.");
      }

      setContent((prev) => ({
        ...prev,
        sections: prev.sections.map((section) => (section.id === selectedBlock.id ? validated.data : section)),
      }));
      toast.success("Bloco atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel atualizar o bloco.");
    }
  }

  async function publishPage() {
    if (hasUnsavedChanges) {
      const saved = await saveDraft();
      if (!saved) {
        toast.error("Nao foi possivel salvar antes de publicar.");
        return;
      }
    }

    const response = await fetch(`/api/pages/${page.id}/publish`, {
      method: "POST",
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Falha ao publicar." }));
      toast.error(payload.error ?? "Falha ao publicar.");
      return;
    }

    setPageStatus("published");
    toast.success("Pagina publicada com sucesso.");
  }

  function renderThemeEditor() {
    return (
      <div className="grid gap-3">
        {themeFields.map((field) => (
          <GradientColorField
            key={field}
            id={`theme-${field}`}
            label={field}
            value={content.theme[field]}
            onChange={(nextValue) => updateTheme(field, nextValue)}
          />
        ))}
      </div>
    );
  }

  function renderSelectedBlockEditor() {
    if (!selectedBlock) {
      return (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Selecione um bloco para editar suas propriedades.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-3 border-b border-border pb-4">
          <div>
            <p className="text-sm font-semibold">{labels[selectedBlock.type]}</p>
            <p className="text-xs text-muted-foreground">Edicao tipada do bloco selecionado.</p>
          </div>

          {selectedBlock.type === "hero" ? (
            <div className="space-y-3">
              <Field label="Eyebrow">
                <Input value={selectedBlock.eyebrow ?? ""} onChange={(event) => updateSelectedBlock((block) => block.type === "hero" ? { ...block, eyebrow: event.target.value } : block)} />
              </Field>
              <Field label="Titulo">
                <Textarea value={selectedBlock.title} onChange={(event) => updateSelectedBlock((block) => block.type === "hero" ? { ...block, title: event.target.value } : block)} />
              </Field>
              <Field label="Subtitulo">
                <Textarea value={selectedBlock.subtitle} onChange={(event) => updateSelectedBlock((block) => block.type === "hero" ? { ...block, subtitle: event.target.value } : block)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="CTA principal">
                  <Input value={selectedBlock.ctaLabel} onChange={(event) => updateSelectedBlock((block) => block.type === "hero" ? { ...block, ctaLabel: event.target.value } : block)} />
                </Field>
                <Field label="Link principal">
                  <Input value={selectedBlock.ctaHref} onChange={(event) => updateSelectedBlock((block) => block.type === "hero" ? { ...block, ctaHref: event.target.value } : block)} />
                </Field>
                <Field label="CTA secundaria">
                  <Input value={selectedBlock.secondaryLabel ?? ""} onChange={(event) => updateSelectedBlock((block) => block.type === "hero" ? { ...block, secondaryLabel: event.target.value } : block)} />
                </Field>
                <Field label="Link secundario">
                  <Input value={selectedBlock.secondaryHref ?? ""} onChange={(event) => updateSelectedBlock((block) => block.type === "hero" ? { ...block, secondaryHref: event.target.value } : block)} />
                </Field>
                <Field label="Imagem do hero">
                  <Input value={selectedBlock.imageUrl ?? ""} onChange={(event) => updateSelectedBlock((block) => block.type === "hero" ? { ...block, imageUrl: event.target.value } : block)} />
                </Field>
                <Field label="Alt da imagem">
                  <Input value={selectedBlock.imageAlt ?? ""} onChange={(event) => updateSelectedBlock((block) => block.type === "hero" ? { ...block, imageAlt: event.target.value } : block)} />
                </Field>
              </div>
            </div>
          ) : null}

          {selectedBlock.type === "logos" ? (
            <div className="space-y-3">
              <Field label="Titulo da secao">
                <Input value={selectedBlock.title} onChange={(event) => updateSelectedBlock((block) => block.type === "logos" ? { ...block, title: event.target.value } : block)} />
              </Field>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Marcas</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => updateSelectedBlock((block) => block.type === "logos" ? { ...block, logos: [...block.logos, "Nova marca"] } : block)}>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
                {selectedBlock.logos.map((logo, index) => (
                  <ArrayCard
                    key={`${selectedBlock.id}-logo-${index}`}
                    title={`Logo ${index + 1}`}
                    onRemove={() =>
                      updateSelectedBlock((block) =>
                        block.type === "logos" && block.logos.length > 1 ? { ...block, logos: block.logos.filter((_, itemIndex) => itemIndex !== index) } : block,
                      )
                    }
                  >
                    <Input
                      value={logo}
                      onChange={(event) =>
                        updateSelectedBlock((block) =>
                          block.type === "logos"
                            ? { ...block, logos: block.logos.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) }
                            : block,
                        )
                      }
                    />
                  </ArrayCard>
                ))}
              </div>
            </div>
          ) : null}

          {selectedBlock.type === "benefits" || selectedBlock.type === "features" ? (
            <div className="space-y-3">
              <Field label="Titulo da secao">
                <Input value={selectedBlock.title} onChange={(event) => updateSelectedBlock((block) => block.type === selectedBlock.type ? { ...block, title: event.target.value } : block)} />
              </Field>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{selectedBlock.type === "benefits" ? "Beneficios" : "Features"}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateSelectedBlock((block) =>
                        block.type === selectedBlock.type ? { ...block, items: [...block.items, { title: "Novo item", description: "Descreva o valor entregue." }] } : block,
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
                {selectedBlock.items.map((item, index) => (
                  <ArrayCard
                    key={`${selectedBlock.id}-item-${index}`}
                    title={`Item ${index + 1}`}
                    onRemove={() =>
                      updateSelectedBlock((block) =>
                        block.type === selectedBlock.type && block.items.length > 1 ? { ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) } : block,
                      )
                    }
                  >
                    <div className="space-y-2">
                      <Input
                        value={item.title}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === selectedBlock.type
                              ? { ...block, items: block.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                      <Textarea
                        value={item.description}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === selectedBlock.type
                              ? { ...block, items: block.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                    </div>
                  </ArrayCard>
                ))}
              </div>
            </div>
          ) : null}

          {selectedBlock.type === "howItWorks" ? (
            <div className="space-y-3">
              <Field label="Titulo da secao">
                <Input value={selectedBlock.title} onChange={(event) => updateSelectedBlock((block) => block.type === "howItWorks" ? { ...block, title: event.target.value } : block)} />
              </Field>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Passos</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => updateSelectedBlock((block) => block.type === "howItWorks" ? { ...block, steps: [...block.steps, { title: "Novo passo", description: "Explique a etapa." }] } : block)}>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
                {selectedBlock.steps.map((step, index) => (
                  <ArrayCard
                    key={`${selectedBlock.id}-step-${index}`}
                    title={`Passo ${index + 1}`}
                    onRemove={() =>
                      updateSelectedBlock((block) =>
                        block.type === "howItWorks" && block.steps.length > 1 ? { ...block, steps: block.steps.filter((_, itemIndex) => itemIndex !== index) } : block,
                      )
                    }
                  >
                    <div className="space-y-2">
                      <Input
                        value={step.title}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === "howItWorks"
                              ? { ...block, steps: block.steps.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                      <Textarea
                        value={step.description}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === "howItWorks"
                              ? { ...block, steps: block.steps.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                    </div>
                  </ArrayCard>
                ))}
              </div>
            </div>
          ) : null}

          {selectedBlock.type === "testimonials" ? (
            <div className="space-y-3">
              <Field label="Titulo da secao">
                <Input value={selectedBlock.title} onChange={(event) => updateSelectedBlock((block) => block.type === "testimonials" ? { ...block, title: event.target.value } : block)} />
              </Field>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Depoimentos</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => updateSelectedBlock((block) => block.type === "testimonials" ? { ...block, items: [...block.items, { quote: "Novo depoimento", author: "Nome", role: "Cargo" }] } : block)}>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
                {selectedBlock.items.map((item, index) => (
                  <ArrayCard
                    key={`${selectedBlock.id}-testimonial-${index}`}
                    title={`Depoimento ${index + 1}`}
                    onRemove={() =>
                      updateSelectedBlock((block) =>
                        block.type === "testimonials" && block.items.length > 1 ? { ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) } : block,
                      )
                    }
                  >
                    <div className="space-y-2">
                      <Textarea
                        value={item.quote}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === "testimonials"
                              ? { ...block, items: block.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, quote: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                      <Input
                        value={item.author}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === "testimonials"
                              ? { ...block, items: block.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, author: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                      <Input
                        value={item.role}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === "testimonials"
                              ? { ...block, items: block.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, role: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                    </div>
                  </ArrayCard>
                ))}
              </div>
            </div>
          ) : null}

          {selectedBlock.type === "cta" ? (
            <div className="space-y-3">
              <Field label="Titulo">
                <Textarea value={selectedBlock.title} onChange={(event) => updateSelectedBlock((block) => block.type === "cta" ? { ...block, title: event.target.value } : block)} />
              </Field>
              <Field label="Descricao">
                <Textarea value={selectedBlock.description} onChange={(event) => updateSelectedBlock((block) => block.type === "cta" ? { ...block, description: event.target.value } : block)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Texto do CTA">
                  <Input value={selectedBlock.ctaLabel} onChange={(event) => updateSelectedBlock((block) => block.type === "cta" ? { ...block, ctaLabel: event.target.value } : block)} />
                </Field>
                <Field label="Link do CTA">
                  <Input value={selectedBlock.ctaHref} onChange={(event) => updateSelectedBlock((block) => block.type === "cta" ? { ...block, ctaHref: event.target.value } : block)} />
                </Field>
              </div>
            </div>
          ) : null}

          {selectedBlock.type === "faq" ? (
            <div className="space-y-3">
              <Field label="Titulo da secao">
                <Input value={selectedBlock.title} onChange={(event) => updateSelectedBlock((block) => block.type === "faq" ? { ...block, title: event.target.value } : block)} />
              </Field>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Perguntas</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => updateSelectedBlock((block) => block.type === "faq" ? { ...block, items: [...block.items, { question: "Nova pergunta", answer: "Nova resposta" }] } : block)}>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
                {selectedBlock.items.map((item, index) => (
                  <ArrayCard
                    key={`${selectedBlock.id}-faq-${index}`}
                    title={`Pergunta ${index + 1}`}
                    onRemove={() =>
                      updateSelectedBlock((block) =>
                        block.type === "faq" && block.items.length > 1 ? { ...block, items: block.items.filter((_, itemIndex) => itemIndex !== index) } : block,
                      )
                    }
                  >
                    <div className="space-y-2">
                      <Input
                        value={item.question}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === "faq"
                              ? { ...block, items: block.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, question: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                      <Textarea
                        value={item.answer}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === "faq"
                              ? { ...block, items: block.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, answer: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                    </div>
                  </ArrayCard>
                ))}
              </div>
            </div>
          ) : null}

          {selectedBlock.type === "leadForm" ? (
            <div className="space-y-3">
              <Field label="Titulo">
                <Input value={selectedBlock.title} onChange={(event) => updateSelectedBlock((block) => block.type === "leadForm" ? { ...block, title: event.target.value } : block)} />
              </Field>
              <Field label="Descricao">
                <Textarea value={selectedBlock.description} onChange={(event) => updateSelectedBlock((block) => block.type === "leadForm" ? { ...block, description: event.target.value } : block)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Texto do botao">
                  <Input value={selectedBlock.ctaLabel} onChange={(event) => updateSelectedBlock((block) => block.type === "leadForm" ? { ...block, ctaLabel: event.target.value } : block)} />
                </Field>
                <Field label="Mensagem de sucesso">
                  <Input value={selectedBlock.successMessage} onChange={(event) => updateSelectedBlock((block) => block.type === "leadForm" ? { ...block, successMessage: event.target.value } : block)} />
                </Field>
              </div>
            </div>
          ) : null}

          {selectedBlock.type === "footer" ? (
            <div className="space-y-3">
              <Field label="Nome da empresa">
                <Input value={selectedBlock.companyName} onChange={(event) => updateSelectedBlock((block) => block.type === "footer" ? { ...block, companyName: event.target.value } : block)} />
              </Field>
              <Field label="Copyright">
                <Input value={selectedBlock.copyrightText} onChange={(event) => updateSelectedBlock((block) => block.type === "footer" ? { ...block, copyrightText: event.target.value } : block)} />
              </Field>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Links</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => updateSelectedBlock((block) => block.type === "footer" ? { ...block, links: [...block.links, { label: "Novo link", href: "/" }] } : block)}>
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
                {selectedBlock.links.map((link, index) => (
                  <ArrayCard
                    key={`${selectedBlock.id}-link-${index}`}
                    title={`Link ${index + 1}`}
                    onRemove={() =>
                      updateSelectedBlock((block) =>
                        block.type === "footer" ? { ...block, links: block.links.filter((_, itemIndex) => itemIndex !== index) } : block,
                      )
                    }
                  >
                    <div className="space-y-2">
                      <Input
                        value={link.label}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === "footer"
                              ? { ...block, links: block.links.map((entry, itemIndex) => itemIndex === index ? { ...entry, label: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                      <Input
                        value={link.href}
                        onChange={(event) =>
                          updateSelectedBlock((block) =>
                            block.type === "footer"
                              ? { ...block, links: block.links.map((entry, itemIndex) => itemIndex === index ? { ...entry, href: event.target.value } : entry) }
                              : block,
                          )
                        }
                      />
                    </div>
                  </ArrayCard>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <details className="rounded-lg border border-border p-3">
          <summary className="cursor-pointer text-sm font-medium">Modo avancado do bloco</summary>
          <div className="mt-3 space-y-2">
            <Textarea className="min-h-[240px] font-mono text-xs" value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} />
            <Button variant="outline" className="w-full" onClick={applyBlockJson}>
              Aplicar alteracoes no bloco
            </Button>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Editor por blocos</p>
            <h2 className="text-lg font-semibold">{settings.name}</h2>
            {publicSlugUrl ? <p className="text-xs text-muted-foreground">{publicSlugUrl}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={pageStatus === "published" ? "success" : pageStatus === "suspended" ? "danger" : "secondary"}>{pageStatus}</Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/app/pages/${page.id}/preview`} target="_blank">
                <Eye className="h-4 w-4" />
                Preview
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void saveDraft()} disabled={!hasUnsavedChanges || savingState === "saving"}>
              <Save className="h-4 w-4" />
              {savingState === "saving" ? "Salvando..." : "Salvar"}
            </Button>
            <Button size="sm" onClick={() => void publishPage()} disabled={savingState === "saving"}>
              <Upload className="h-4 w-4" />
              Publicar
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/pages">Voltar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isMockPage ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-3 text-sm text-amber-900">
            Este editor esta em modo local de teste. Mesmo clicando em salvar, as alteracoes nao sao persistidas no banco.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)]">
          <Card className="flex h-full flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Propriedades</CardTitle>
              <CardDescription>SEO, tema e secoes da landing no painel fixo.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
              <details open className="rounded-lg border border-border bg-card">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold">Pagina e SEO</summary>
                <div className="space-y-3 border-t border-border p-3">
                  <Field label="Nome">
                    <Input id="page-name" value={settings.name} onChange={(event) => setSettings((prev) => ({ ...prev, name: event.target.value }))} />
                  </Field>
                  <Field label="Slug">
                    <Input id="page-slug" value={settings.slug} onChange={(event) => setSettings((prev) => ({ ...prev, slug: event.target.value }))} />
                  </Field>
                  <Field label="SEO title">
                    <Input id="seo-title" value={settings.seoTitle} onChange={(event) => setSettings((prev) => ({ ...prev, seoTitle: event.target.value }))} />
                  </Field>
                  <Field label="Meta description">
                    <Textarea id="seo-description" value={settings.seoDescription} onChange={(event) => setSettings((prev) => ({ ...prev, seoDescription: event.target.value }))} />
                  </Field>
                  <Field label="OG image URL">
                    <Input id="og-image" value={settings.ogImageUrl} onChange={(event) => setSettings((prev) => ({ ...prev, ogImageUrl: event.target.value }))} />
                  </Field>
                  <Field label="Favicon URL">
                    <Input id="favicon" value={settings.faviconUrl} onChange={(event) => setSettings((prev) => ({ ...prev, faviconUrl: event.target.value }))} />
                  </Field>
                </div>
              </details>

              <details open className="rounded-lg border border-border bg-card">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold">Cores</summary>
                <div className="border-t border-border p-3">{renderThemeEditor()}</div>
              </details>

              <details open className="rounded-lg border border-border bg-card">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold">Secoes</summary>
                <div className="space-y-3 border-t border-border p-3">
                  <div className="grid gap-2">
                    {blockTypeValues.map((type) => (
                      <Button key={type} variant="outline" size="sm" className="justify-start" onClick={() => addBlock(type)}>
                        <Plus className="h-4 w-4" />
                        {labels[type]}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {content.sections.map((section) => {
                      const isSelected = selectedBlockId === section.id;
                      const showTools = sectionToolsId === section.id;
                      return (
                        <div
                          key={section.id}
                          className={`rounded-lg border p-2 ${isSelected ? "border-primary bg-[#324e4b] text-white" : "border-border bg-card"}`}
                        >
                          <div className="flex items-center gap-2">
                            <button type="button" className="flex-1 text-left text-sm font-medium" onClick={() => setSelectedBlockId(section.id)}>
                              {labels[section.type]}
                            </button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-7 w-7 ${isSelected ? "text-white hover:bg-white/15 hover:text-white" : ""}`}
                              onClick={() => {
                                setSelectedBlockId(section.id);
                                setSectionToolsId((current) => (current === section.id ? null : section.id));
                              }}
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                          </div>
                          {showTools ? (
                            <div className="mt-2 flex gap-1">
                              <Button size="icon" variant="ghost" className={isSelected ? "text-white hover:bg-white/15 hover:text-white" : ""} onClick={() => moveBlock(section.id, "up")}>
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className={isSelected ? "text-white hover:bg-white/15 hover:text-white" : ""} onClick={() => moveBlock(section.id, "down")}>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className={isSelected ? "text-white hover:bg-white/15 hover:text-white" : ""} onClick={() => duplicateBlock(section)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className={isSelected ? "text-white hover:bg-white/15 hover:text-white" : ""} onClick={() => removeBlock(section.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>

              <details open className="rounded-lg border border-border bg-card">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold">Edicao do bloco selecionado</summary>
                <div className="border-t border-border p-3">{renderSelectedBlockEditor()}</div>
              </details>
            </CardContent>
          </Card>
        </aside>

        <Card className="flex min-h-[72vh] flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Preview em tempo real</CardTitle>
              <CardDescription>{saveStatusMessage}</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button variant={previewMode === "desktop" ? "default" : "outline"} size="icon" onClick={() => setPreviewMode("desktop")}>
                <Laptop className="h-4 w-4" />
              </Button>
              <Button variant={previewMode === "mobile" ? "default" : "outline"} size="icon" onClick={() => setPreviewMode("mobile")}>
                <MonitorSmartphone className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="min-h-[66vh] rounded-xl border border-border bg-[#f4f8f7] p-4">
              <div
                ref={previewCanvasRef}
                className="relative h-full min-h-[62vh] w-full overflow-hidden rounded-lg border border-border/70 bg-[#ebf2f1]"
              >
                <div
                  className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl border border-border bg-white shadow-sm"
                  style={{
                    width: previewViewport.width,
                    height: previewViewport.height,
                    transform: `translate(-50%, -50%) scale(${previewScale})`,
                    transformOrigin: "center center",
                  }}
                >
                  <LandingRenderer content={content} pageId={page.id} mode="preview" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type HsvColor = {
  h: number;
  s: number;
  v: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(value: string) {
  const cleaned = value.trim().replace("#", "").toUpperCase();
  if (!/^[0-9A-F]{3}([0-9A-F]{3})?$/.test(cleaned)) {
    return null;
  }

  if (cleaned.length === 3) {
    return `#${cleaned.split("").map((char) => `${char}${char}`).join("")}`;
  }

  return `#${cleaned}`;
}

function hexToRgb(value: string) {
  const normalized = normalizeHex(value);
  if (!normalized) {
    return null;
  }

  const raw = normalized.slice(1);
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === rn) {
      hue = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      hue = (bn - rn) / delta + 2;
    } else {
      hue = (rn - gn) / delta + 4;
    }
  }

  hue = Math.round(hue * 60);
  if (hue < 0) {
    hue += 360;
  }

  const saturation = max === 0 ? 0 : (delta / max) * 100;
  const value = max * 100;

  return {
    h: clamp(hue, 0, 360),
    s: clamp(saturation, 0, 100),
    v: clamp(value, 0, 100),
  };
}

function hsvToRgb(h: number, s: number, v: number) {
  const saturation = clamp(s, 0, 100) / 100;
  const value = clamp(v, 0, 100) / 100;
  const chroma = value * saturation;
  const hue = ((h % 360) + 360) % 360;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = value - chroma;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    r = chroma;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = chroma;
  } else if (hue < 180) {
    g = chroma;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = chroma;
  } else if (hue < 300) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  };
}

function hexToHsv(value: string) {
  const rgb = hexToRgb(value);
  if (!rgb) {
    return null;
  }

  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

function hsvToHex(color: HsvColor) {
  const rgb = hsvToRgb(color.h, color.s, color.v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function GradientColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value.toUpperCase());
  const [hsv, setHsv] = useState<HsvColor>(() => hexToHsv(value) ?? { h: 35, s: 100, v: 100 });

  useEffect(() => {
    const parsed = hexToHsv(value);
    if (parsed) {
      setHsv(parsed);
    }
    setHexInput(value.toUpperCase());
  }, [value]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleOutsideClick);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function commitColor(nextColor: HsvColor) {
    const normalizedColor = {
      h: clamp(nextColor.h, 0, 360),
      s: clamp(nextColor.s, 0, 100),
      v: clamp(nextColor.v, 0, 100),
    };
    const nextHex = hsvToHex(normalizedColor);
    setHsv(normalizedColor);
    setHexInput(nextHex);
    onChange(nextHex);
  }

  function startPaletteDrag(event: React.MouseEvent<HTMLDivElement>) {
    const palette = event.currentTarget;
    const bounds = palette.getBoundingClientRect();

    const updateFromClientPoint = (clientX: number, clientY: number) => {
      const x = clamp(clientX - bounds.left, 0, bounds.width);
      const y = clamp(clientY - bounds.top, 0, bounds.height);
      const saturation = (x / bounds.width) * 100;
      const brightness = 100 - (y / bounds.height) * 100;
      commitColor({ ...hsv, s: saturation, v: brightness });
    };

    updateFromClientPoint(event.clientX, event.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateFromClientPoint(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  return (
    <div className="relative space-y-2" ref={pickerRef}>
      <Label htmlFor={id} className="capitalize">
        {label}
      </Label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="h-10 w-10 rounded-md border border-border shadow-sm"
          style={{ backgroundColor: value }}
          onClick={() => setOpen((current) => !current)}
          aria-label={`Selecionar cor para ${label}`}
        />
        <Input
          id={id}
          value={hexInput}
          onChange={(event) => setHexInput(event.target.value.toUpperCase())}
          onBlur={() => {
            const normalized = normalizeHex(hexInput);
            if (!normalized) {
              setHexInput(value.toUpperCase());
              return;
            }

            onChange(normalized);
          }}
        />
      </div>

      {open ? (
        <div className="absolute left-0 top-[4.6rem] z-30 w-[290px] rounded-xl border border-border bg-card p-3 shadow-lg">
          <div
            className="relative h-36 cursor-crosshair rounded-md border border-border"
            style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
            onMouseDown={startPaletteDrag}
          >
            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 rounded-md bg-gradient-to-t from-black to-transparent" />
            <span
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-transparent shadow"
              style={{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
              }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={360}
            value={hsv.h}
            onChange={(event) => commitColor({ ...hsv, h: Number(event.target.value) })}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full"
            style={{
              background:
                "linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ArrayCard({
  title,
  children,
  onRemove,
}: {
  title: string;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </div>
  );
}

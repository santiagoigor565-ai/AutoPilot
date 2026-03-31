"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_UPLOAD_BYTES = 5_000_000;
const CROP_VIEW_SIZE = 320;
const CROP_OUTPUT_SIZE = 512;
const PROFILE_AUTH_ONLY_STORAGE_KEY = "lf_profile_auth_only";

type ProfileSettingsProps = {
  name: string | null;
  email: string;
  firebaseUid: string;
  initialAvatarUrl: string | null;
  isAuthOnlyMode: boolean;
};

type CropDraft = {
  src: string;
  width: number;
  height: number;
  baseScale: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toInitials(name: string | null, email: string) {
  if (!name?.trim()) {
    return email.slice(0, 2).toUpperCase();
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase();
}

function makeSnapshot(name: string, avatarUrl: string | null) {
  return JSON.stringify({ name, avatarUrl });
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Nao foi possivel carregar a imagem."));
    reader.readAsDataURL(file);
  });
}

async function loadImageSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Nao foi possivel ler as dimensoes da imagem."));
    image.src = src;
  });
}

function getCropLimits(draft: CropDraft) {
  const scale = draft.baseScale * draft.zoom;
  const scaledWidth = draft.width * scale;
  const scaledHeight = draft.height * scale;

  return {
    x: Math.max(0, (scaledWidth - CROP_VIEW_SIZE) / 2),
    y: Math.max(0, (scaledHeight - CROP_VIEW_SIZE) / 2),
  };
}

async function renderCroppedAvatar(draft: CropDraft) {
  const image = new Image();

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Nao foi possivel recortar a imagem."));
    image.src = draft.src;
  });

  const scale = draft.baseScale * draft.zoom;
  const sourceWidth = CROP_VIEW_SIZE / scale;
  const sourceHeight = CROP_VIEW_SIZE / scale;

  let sourceX = image.naturalWidth / 2 - (CROP_VIEW_SIZE / 2 + draft.offsetX) / scale;
  let sourceY = image.naturalHeight / 2 - (CROP_VIEW_SIZE / 2 + draft.offsetY) / scale;

  sourceX = clamp(sourceX, 0, Math.max(0, image.naturalWidth - sourceWidth));
  sourceY = clamp(sourceY, 0, Math.max(0, image.naturalHeight - sourceHeight));

  const canvas = document.createElement("canvas");
  canvas.width = CROP_OUTPUT_SIZE;
  canvas.height = CROP_OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Nao foi possivel preparar o recorte.");
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    CROP_OUTPUT_SIZE,
    CROP_OUTPUT_SIZE,
  );

  return canvas.toDataURL("image/jpeg", 0.9);
}

export function ProfileSettings({ name, email, firebaseUid, initialAvatarUrl, isAuthOnlyMode }: ProfileSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [displayName, setDisplayName] = useState(name ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);
  const [cropDraft, setCropDraft] = useState<CropDraft | null>(null);
  const snapshotRef = useRef(makeSnapshot(name ?? "", initialAvatarUrl));
  const dragStateRef = useRef<{ pointerId: number | null; x: number; y: number; active: boolean }>({
    pointerId: null,
    x: 0,
    y: 0,
    active: false,
  });

  const initials = useMemo(() => toInitials(displayName || name, email), [displayName, email, name]);
  const hasChanges = makeSnapshot(displayName, avatarUrl) !== snapshotRef.current;

  useEffect(() => {
    if (!isAuthOnlyMode || typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(PROFILE_AUTH_ONLY_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { name?: string; avatarUrl?: string | null };
      const nextName = typeof parsed.name === "string" ? parsed.name : "";
      const nextAvatar = typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : null;

      setDisplayName(nextName);
      setAvatarUrl(nextAvatar);
      snapshotRef.current = makeSnapshot(nextName, nextAvatar);
    } catch {
      window.localStorage.removeItem(PROFILE_AUTH_ONLY_STORAGE_KEY);
    }
  }, [isAuthOnlyMode]);

  async function onPickAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Use uma imagem de ate 5MB.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const dimensions = await loadImageSize(dataUrl);
      const baseScale = Math.max(CROP_VIEW_SIZE / dimensions.width, CROP_VIEW_SIZE / dimensions.height);

      setCropDraft({
        src: dataUrl,
        width: dimensions.width,
        height: dimensions.height,
        baseScale,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel carregar a imagem.");
    } finally {
      event.target.value = "";
    }
  }

  function removeAvatar() {
    setAvatarUrl(null);
  }

  function updateZoom(nextZoom: number) {
    setCropDraft((current) => {
      if (!current) {
        return current;
      }

      const zoom = clamp(nextZoom, 1, 3);
      const nextDraft = { ...current, zoom };
      const limits = getCropLimits(nextDraft);

      return {
        ...nextDraft,
        offsetX: clamp(nextDraft.offsetX, -limits.x, limits.x),
        offsetY: clamp(nextDraft.offsetY, -limits.y, limits.y),
      };
    });
  }

  function dragImageBy(deltaX: number, deltaY: number) {
    setCropDraft((current) => {
      if (!current) {
        return current;
      }

      const limits = getCropLimits(current);
      return {
        ...current,
        offsetX: clamp(current.offsetX + deltaX, -limits.x, limits.x),
        offsetY: clamp(current.offsetY + deltaY, -limits.y, limits.y),
      };
    });
  }

  function onCropPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    dragStateRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      active: true,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onCropPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;

    dragImageBy(deltaX, deltaY);
  }

  function onCropPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current;
    if (drag.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = {
      pointerId: null,
      x: 0,
      y: 0,
      active: false,
    };

    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onCropWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    updateZoom((cropDraft?.zoom ?? 1) + delta);
  }

  async function applyCrop() {
    if (!cropDraft) {
      return;
    }

    setIsApplyingCrop(true);
    try {
      const croppedAvatar = await renderCroppedAvatar(cropDraft);
      setAvatarUrl(croppedAvatar);
      setCropDraft(null);
      toast.success("Recorte pronto. Clique em salvar perfil para persistir.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel aplicar o recorte.");
    } finally {
      setIsApplyingCrop(false);
    }
  }

  async function saveProfile() {
    const normalizedName = displayName.trim();
    if (normalizedName.length < 2) {
      toast.error("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          avatarUrl,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Falha ao salvar perfil." }));
        throw new Error(payload.error ?? "Falha ao salvar perfil.");
      }

      const payload = (await response.json()) as {
        user: {
          name: string | null;
          avatarUrl: string | null;
        };
      };

      const nextName = payload.user.name ?? "";
      const nextAvatar = payload.user.avatarUrl ?? null;

      setDisplayName(nextName);
      setAvatarUrl(nextAvatar);
      snapshotRef.current = makeSnapshot(nextName, nextAvatar);
      if (isAuthOnlyMode && typeof window !== "undefined") {
        window.localStorage.setItem(
          PROFILE_AUTH_ONLY_STORAGE_KEY,
          JSON.stringify({
            name: nextName,
            avatarUrl: nextAvatar,
          }),
        );
      }

      toast.success(isAuthOnlyMode ? "Perfil salvo em modo local." : "Perfil atualizado com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr] xl:gap-0">
        <Card className="xl:rounded-r-none xl:border-r-0">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>
              Dados da conta e configuracoes do usuario.
              {isAuthOnlyMode ? " (Modo local sem persistencia em banco)." : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="text-muted-foreground">Nome</p>
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Seu nome" />
            </div>

            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{email}</p>
            </div>

            <div>
              <p className="text-muted-foreground">UID Firebase</p>
              <p className="font-mono text-xs">{firebaseUid}</p>
            </div>

            <div className="pt-2">
              <Button type="button" onClick={() => void saveProfile()} disabled={!hasChanges || isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? "Salvando..." : "Salvar perfil"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:-ml-px xl:min-w-[340px] xl:rounded-l-none">
          <CardHeader>
            <CardTitle>Foto do usuario</CardTitle>
            <CardDescription>Passe o mouse sobre a imagem para trocar e depois ajuste o recorte.</CardDescription>
          </CardHeader>
          <CardContent className="flex h-[340px] flex-col items-center justify-center gap-4">
            <div className="group relative flex h-[250px] w-[250px] items-center justify-center overflow-hidden rounded-full border-4 border-card bg-muted shadow-inner">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03] group-hover:blur-[1.5px] group-hover:brightness-75"
                />
              ) : (
                <span className="text-5xl font-semibold text-muted-foreground transition group-hover:opacity-35">{initials}</span>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center gap-2 bg-black/35 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100"
              >
                <Camera className="h-4 w-4" />
                Trocar imagem
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void onPickAvatar(event)}
            />

            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4" />
                Escolher foto
              </Button>
              <Button type="button" variant="outline" onClick={removeAvatar} disabled={!avatarUrl || isSaving}>
                <Trash2 className="h-4 w-4" />
                Remover
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {cropDraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ajustar foto de perfil</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setCropDraft(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">Ajuste o enquadramento arrastando a imagem dentro da grade.</p>
            <p className="mt-1 text-xs text-muted-foreground">Arraste a imagem direto na grade e use o scroll do mouse para zoom.</p>

            <div className="mt-4">
              <div
                className="relative mx-auto h-[320px] w-[320px] cursor-grab overflow-hidden rounded-2xl border border-border bg-[#101919] active:cursor-grabbing"
                style={{ touchAction: "none" }}
                onPointerDown={onCropPointerDown}
                onPointerMove={onCropPointerMove}
                onPointerUp={onCropPointerUp}
                onPointerCancel={onCropPointerUp}
                onWheel={onCropWheel}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cropDraft.src}
                  alt="Recorte de perfil"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: cropDraft.width,
                    height: cropDraft.height,
                    maxWidth: "none",
                    transform: `translate(calc(-50% + ${cropDraft.offsetX}px), calc(-50% + ${cropDraft.offsetY}px)) scale(${cropDraft.baseScale * cropDraft.zoom})`,
                    transformOrigin: "center",
                  }}
                />

                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/3 top-0 h-full w-px bg-white/25" />
                  <div className="absolute left-2/3 top-0 h-full w-px bg-white/25" />
                  <div className="absolute left-0 top-1/3 h-px w-full bg-white/25" />
                  <div className="absolute left-0 top-2/3 h-px w-full bg-white/25" />
                  <div className="absolute inset-0 rounded-full border-2 border-white/85 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                </div>
              </div>

              <div className="mx-auto mt-4 flex w-full max-w-[320px] gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setCropDraft(null)}>
                  Cancelar
                </Button>
                <Button type="button" className="flex-1" onClick={() => void applyCrop()} disabled={isApplyingCrop}>
                  {isApplyingCrop ? "Aplicando..." : "Aplicar recorte"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

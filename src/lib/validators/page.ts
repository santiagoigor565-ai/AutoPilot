import { z } from "zod";
import { landingContentSchema } from "@/types/builder";

export const pageSettingsSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen."),
  seoTitle: z.string().min(2).max(70),
  seoDescription: z.string().min(10).max(160),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
});

export const draftUpdateSchema = z.object({
  draftContent: landingContentSchema,
  settings: pageSettingsSchema.partial(),
});

export const createPageSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen."),
  workspaceId: z.string().min(1),
});

export const createPageWithAiSchema = z.object({
  workspaceId: z.string().min(1),
  prompt: z.string().min(20).max(20_000),
  attachments: z
    .array(
      z.object({
        assetId: z.string().min(1),
        filename: z.string().min(1).max(240),
        mimeType: z.string().min(1).max(180),
        size: z.number().int().nonnegative(),
      }),
    )
    .max(20)
    .default([]),
});

export const aiGeneratedLandingSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(120),
  seoTitle: z.string().min(2).max(70),
  seoDescription: z.string().min(10).max(160),
  ogImageUrl: z.string().url().or(z.literal("")).default(""),
  faviconUrl: z.string().url().or(z.literal("")).default(""),
  content: landingContentSchema,
});


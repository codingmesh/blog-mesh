import { z } from 'astro/zod';

/**
 * Frontmatter schemas shared by the content collections, Keystatic, and tests.
 * Kept free of `astro:content` imports so they can be exercised under node:test.
 */
export const formats = ['essay', 'reading'] as const;

const base = {
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  sample: z.boolean().default(false),
};

export const noteSchema = z.object(base);

/** Keystatic always writes the object; an empty `url` means "no source". */
const source = z
  .object({ title: z.string().default(''), url: z.string().default(''), author: z.string().default('') })
  .optional()
  .transform((value) => (value && value.url ? value : undefined))
  .pipe(z.object({ title: z.string().min(1), url: z.url(), author: z.string().min(1) }).optional());

type ImageHelper = () => z.ZodType;

export const articleSchema = (image?: ImageHelper) =>
  z.object({
    ...base,
    format: z.enum(formats).default('essay'),
    featured: z.boolean().default(false),
    source,
    ...(image ? { image: image().optional() } : {}),
  });

export type NoteData = z.infer<typeof noteSchema>;
export type ArticleData = z.infer<ReturnType<typeof articleSchema>>;

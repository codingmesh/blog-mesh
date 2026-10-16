import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, noteSchema } from './lib/schema';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) => articleSchema(image),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: noteSchema,
});

export const collections = { articles, notes };

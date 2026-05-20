import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts live at ../content/blog/ so the markdown stays the source of truth
// for both repo readers and the rendered site. status: 'draft' posts are
// filtered out at render time, not at load time.
const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: '../content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    slug: z.string().optional(),
    tags: z.array(z.string()).default([]),
    status: z.enum(['draft', 'published']).default('draft'),
    note: z.string().optional(),
    references: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };

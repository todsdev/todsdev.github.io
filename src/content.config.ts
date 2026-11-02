import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** Translatable text: only `en` is required; missing locales fall back to English. */
export const localized = <T extends z.ZodType>(schema: T) =>
  z.strictObject({
    en: schema,
    "pt-br": schema.optional(),
    es: schema.optional(),
  });

const text = z.string().min(1);
const localizedText = localized(text);

/** Optional fields shared by every collection entry. */
const common = z.object({
  order: z.number().int().optional(),
  featured: z.boolean().optional(),
  hidden: z.boolean().optional(),
});

const yamlIn = (name: string) =>
  glob({ pattern: "**/*.yaml", base: `./src/content/${name}` });

const profile = defineCollection({
  loader: yamlIn("profile"),
  schema: ({ image }) =>
    common.extend({
      name: text,
      role: localizedText,
      location: text,
      summary: localizedText,
      /** Path relative to profile.yaml; optimized at build time. */
      photo: image(),
      /** "Open to work" style badge in the hero; editable without code changes. */
      availability: z.object({
        enabled: z.boolean(),
        label: localizedText,
      }),
    }),
});

const contacts = defineCollection({
  loader: yamlIn("contacts"),
  schema: common.extend({
    kind: z.enum(["email", "github", "linkedin", "other"]),
    label: localizedText,
    url: z.url(),
  }),
});

const experience = defineCollection({
  loader: yamlIn("experience"),
  schema: common.extend({
    company: text,
    role: localizedText,
    location: text,
    start: z.coerce.date(),
    /** Omitted while the position is current. */
    end: z.coerce.date().optional(),
    description: localizedText,
    tech: z.array(text).default([]),
  }),
});

const projects = defineCollection({
  loader: yamlIn("projects"),
  schema: common.extend({
    title: text,
    description: localizedText,
    status: z.enum(["live", "building"]),
    url: z.url().optional(),
    repoUrl: z.url().optional(),
    tech: z.array(text).default([]),
  }),
});

/** One entry per category; `items` are the skills in that category. */
const skills = defineCollection({
  loader: yamlIn("skills"),
  schema: common.extend({
    category: localizedText,
    items: z.array(text).min(1),
  }),
});

const courses = defineCollection({
  loader: yamlIn("courses"),
  schema: common.extend({
    title: text,
    issuer: text,
    date: z.coerce.date(),
    certificateUrl: z.url(),
    featured: z.boolean(),
  }),
});

const education = defineCollection({
  loader: yamlIn("education"),
  schema: common.extend({
    institution: text,
    degree: localizedText,
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
  }),
});

const languages = defineCollection({
  loader: yamlIn("languages"),
  schema: common.extend({
    name: localizedText,
    proficiency: localizedText,
  }),
});

export const collections = {
  profile,
  contacts,
  experience,
  projects,
  skills,
  courses,
  education,
  languages,
};

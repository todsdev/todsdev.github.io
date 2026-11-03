import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { SENTENCE_CASE_MESSAGE, startsWithCapital } from "./lib/sentence-case";

/** Translatable text: only `en` is required; missing locales fall back to English. */
export const localized = <T extends z.ZodType>(schema: T) =>
  z.strictObject({
    en: schema,
    "pt-br": schema.optional(),
    es: schema.optional(),
  });

const text = z.string().min(1);
const localizedText = localized(text);

/** Prose (summaries, descriptions, journey steps): must be in sentence case. */
const sentence = text.refine(startsWithCapital, {
  message: SENTENCE_CASE_MESSAGE,
});
const localizedSentence = localized(sentence);

/** Optional fields shared by every collection entry. */
const common = z.object({
  order: z.number().int().optional(),
  featured: z.boolean().optional(),
  hidden: z.boolean().optional(),
});

const yamlIn = (name: string) =>
  glob({ pattern: "**/*.yaml", base: `./src/content/${name}` });

/** Image files next to profile.yaml, keyed like `./content/profile/photo.jpg`. */
const profileImages = new Set(
  Object.keys(
    import.meta.glob("./content/profile/**/*.{png,jpg,jpeg,webp,avif,gif}"),
  ),
);

const profile = defineCollection({
  loader: yamlIn("profile"),
  schema: ({ image }) =>
    common.extend({
      name: text,
      role: localizedText,
      location: localizedText,
      summary: localizedSentence,
      /** How the owner got here; `years` ending with a dash (e.g. "2016–") is ongoing. */
      journey: z
        .array(z.object({ years: text, text: localizedSentence }))
        .min(1),
      /** Technical focus shown in the about facts, e.g. "Android · Kotlin · Jetpack Compose". */
      focus: localizedText,
      /**
       * Path relative to profile.yaml; optimized at build time. Checked first so a
       * missing file is reported against the profile entry and the `photo` field.
       */
      photo: z
        .string()
        .refine(
          (path) =>
            profileImages.has(`./content/profile/${path.replace(/^\.\//, "")}`),
          {
            message: "image file not found (path is relative to profile.yaml)",
          },
        )
        // image() parses the path string at runtime; its static type only models the output.
        .pipe(
          image() as unknown as z.ZodType<
            z.output<ReturnType<typeof image>>,
            string
          >,
        ),
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
    description: localizedSentence,
    tech: z.array(text).default([]),
    /** Optional sub-events (e.g. each Olympic Games); `role` is a job title, kept as written. */
    events: z
      .array(
        z.object({
          year: z.number().int(),
          name: localizedText,
          role: text,
        }),
      )
      .optional(),
  }),
});

const projects = defineCollection({
  loader: yamlIn("projects"),
  schema: common.extend({
    title: text,
    description: localizedSentence,
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

/** One-page sections, in render order. Ids are locale-independent so hashes survive language switches. */
export const sectionIds = [
  "hero",
  "about",
  "experience",
  "projects",
  "skills",
  "courses",
  "contact",
] as const;

export type SectionId = (typeof sectionIds)[number];

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

/** The sections the page renders: every id, without "courses" while the profile flag is off. */
export function renderedSections(courses: boolean): readonly SectionId[] {
  return courses ? sectionIds : sectionIds.filter((id) => id !== "courses");
}

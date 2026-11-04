/**
 * Courses list logic: order and the terminal command. Pure and runtime-import-free so it
 * runs under `node --test` (courses.test.ts).
 */

/** Terminal command shown after "$ ". Commands stay in English in every locale. */
export const OPEN_CERT = "open cert";

/**
 * Featured courses first, then the rest; within each group newest first. The sort is
 * stable, so courses with the same date keep the incoming (`order`) order.
 */
export function sortCourses<T extends { featured: boolean; date: Date }>(
  courses: readonly T[],
): T[] {
  return [...courses].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      b.date.getTime() - a.date.getTime(),
  );
}

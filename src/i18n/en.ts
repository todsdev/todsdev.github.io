/**
 * English UI dictionary — the source of truth for every UI string key.
 * Other locales must provide exactly the same keys (enforced by `Dictionary`).
 */
export const en = {
  meta: {
    title: "Thiago Rodrigues — Android Developer",
    description:
      "Portfolio of Thiago Rodrigues, Android Developer: experience, projects, skills and courses.",
  },
  skipLink: "Skip to content",
  nav: {
    label: "Sections",
    hero: "Home",
    about: "About",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    courses: "Courses",
    contact: "Contact",
  },
  prompt: {
    about: "cd ~/about",
    experience: "ls ./experience",
    projects: "ls ./projects",
    skills: "cat skills.txt",
    courses: "ls ./courses",
    contact: "./contact.sh",
  },
  hero: {
    prompt: "~/portfolio $ ./hello",
    /** `{name}` is replaced with the profile name. */
    photoAlt: "Portrait of {name}",
  },
  about: {
    journeyCommand: "cat journey.log",
    factsCommand: "neofetch",
    facts: {
      location: "location",
      languages: "languages",
      education: "education",
      focus: "focus",
    },
  },
  time: {
    /** Ongoing ranges: "2023–present", "Aug 2016 – present". */
    present: "present",
    /** Month abbreviations, January first (periods in the experience timeline). */
    months: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  switcher: {
    label: "Language",
  },
  language: {
    en: "English",
    "pt-br": "Português (Brasil)",
    es: "Español",
  },
  notFound: {
    title: "Page not found",
    heading: "404 — page not found",
    message: "The page you are looking for does not exist or was moved.",
    backHome: "Back to home",
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/** Shape every locale dictionary must satisfy: same keys as `en`, string values. */
export type Dictionary = Widen<typeof en>;

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
  projects: {
    /** Ownership badge word; the `via` company is appended after " · ". */
    ownership: {
      contributor: "contributor",
      owner: "owner",
    },
    /** Badge connector; `{name}` is the project's `via` company. */
    via: "via {name}",
    /** Status line label; rendered as "[building... ▓▓▓░░░]" with the blocks hidden from screen readers. */
    building: "building...",
    /** Accessible destinations for the "$ open …" actions; `{title}` is the project title. */
    destination: {
      playStore: "{title} on Google Play",
      appStore: "{title} on the App Store",
      site: "{title} website",
      repo: "{title} source code",
    },
    /**
     * Ownership note, one per owner/via group of contributor projects. `{app}`/`{apps}` are
     * the titles joined with the locale's list format, `{through}` is `note.through` or empty.
     */
    note: {
      one: "{app} is owned by {owner}. I contributed to it as an Android developer{through}.",
      other:
        "{apps} are owned by {owner}. I contributed to them as an Android developer{through}.",
      through: " through {via}",
    },
  },
  courses: {
    /** Accessible destination for "$ open cert"; `{title}` is the course title. */
    destination: "{title} certificate",
  },
  links: {
    /** Appended to the accessible name of links that open in a new tab. */
    newTab: "opens in a new tab",
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

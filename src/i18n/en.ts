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
  contact: {
    /** Shown on the phone and WhatsApp lines when JavaScript is off (the number is never in the HTML). */
    noJs: "enable JavaScript to see the number",
    /** Replaces "$ copy" for about 2s after copying, and is announced via aria-live. */
    copied: "> copied to clipboard",
    /** Prefilled WhatsApp message (URL-encoded into ?text=). */
    whatsappText: "Hi Thiago! I saw your portfolio and would like to talk.",
    /** Accessible destinations for the actions: {value} is the contact value, {name} the profile name, {language} the résumé language. */
    destination: {
      mail: "write to {value}",
      call: "call {value}",
      copy: "copy {value} to the clipboard",
      chat: "chat with {name} on WhatsApp",
      linkedin: "LinkedIn profile of {name}",
      github: "GitHub profile of {name}",
      instagram: "Instagram profile of {name}",
      vcard: "contact card of {name} (vCard)",
      resume: "résumé of {name} ({language}, PDF)",
    },
  },
  footer: {
    builtWith: "built with Astro + OpenSpec",
    /** Accessible destination of the built-with link. */
    repo: "source code of this site",
    /** {year} is the build year, {name} the profile name. */
    copyright: "© {year} {name}",
    lastBuild: "last build",
    analytics: "cookieless stats by Umami",
    /** Accessible destination of the analytics link. */
    analyticsPolicy: "Umami privacy policy",
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

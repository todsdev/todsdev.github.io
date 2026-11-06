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
  terminal: {
    /** Accessible name of the terminal dialog. */
    name: "terminal",
    inputLabel: "command",
    passwordLabel: "sudo password",
    close: "close terminal",
    /** Accessible name of the footer's ">_" button (touch devices). */
    open: "open terminal",
    /** Footer hint; `{key}` is the "/" key, rendered as <kbd>. */
    hint: "press {key} to open the terminal",
    welcome: "type help to see the commands",
    unavailable: "terminal unavailable. Reload the page to try again.",
    /** One-line descriptions shown by `help`, keyed by command. */
    help: {
      help: "list the commands",
      whoami: "who I am",
      about: "short profile summary",
      experience: "work experience",
      projects: "projects",
      skills: "skills",
      certs: "courses and certificates",
      contact: "contact details",
      ls: "list the sections",
      cd: "go to a section, e.g. cd projects",
      cat: "print a file: cat skills.txt",
      resume: "download my résumé (PDF)",
      open: "open github, linkedin, instagram or repo",
      lang: "switch language: lang en|pt|es",
      theme: "color theme: theme green|amber|gray",
      clear: "clear the screen",
      history: "list the commands you ran",
      exit: "close the terminal",
    },
    notFound: "command not found: {name}",
    helpHint: "type help to see the commands",
    didYouMean: "did you mean {command}?",
    /** `{usage}` is the command syntax, e.g. "lang en|pt|es". */
    usage: "usage: {usage}",
    cdError: "cd: no such file or directory: {name}",
    catError: "cat: {name}: no such file or directory",
    langCurrent: "already in {language}",
    langSwitch: "switching to {language}...",
    resume: "downloading {file}...",
    opened: "opening {url}...",
    themeSet: "theme set to {theme}",
    themeCurrent: "current theme: {theme}",
    accessGranted: "Access granted.",
    sudoDenied:
      "visitor is not in the sudoers file. This incident will be reported.",
    /** Subject of the email `sudo hire-me` opens. */
    mailSubject: "Job opportunity (via the portfolio terminal)",
    rm: "nice try.",
    matrixNote: "matrix skipped: reduced motion is on",
    /** Project status words in `projects`. */
    live: "live",
    neofetch: {
      os: "OS",
      kernel: "Kernel",
      uptime: "Uptime",
      location: "Location",
      /** `{n}` is the number of years. */
      years: "{n} years",
    },
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

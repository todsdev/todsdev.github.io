import type { Dictionary } from "./en";

export const es = {
  meta: {
    title: "Thiago Rodrigues — Desarrollador Android",
    description:
      "Portafolio de Thiago Rodrigues, Desarrollador Android: experiencia, proyectos, habilidades y cursos.",
  },
  skipLink: "Saltar al contenido",
  nav: {
    label: "Secciones",
    hero: "Inicio",
    about: "Sobre mí",
    experience: "Experiencia",
    projects: "Proyectos",
    skills: "Habilidades",
    courses: "Cursos",
    contact: "Contacto",
  },
  prompt: {
    about: "cd ~/sobre-mi",
    experience: "ls ./experiencia",
    projects: "ls ./proyectos",
    skills: "cat habilidades.txt",
    courses: "ls ./cursos",
    contact: "./contacto.sh",
  },
  hero: {
    prompt: "~/portfolio $ ./hola",
    /** `{name}` is replaced with the profile name. */
    photoAlt: "Retrato de {name}",
  },
  about: {
    journeyCommand: "cat trayectoria.log",
    factsCommand: "neofetch",
    facts: {
      location: "ubicación",
      languages: "idiomas",
      education: "formación",
      focus: "enfoque",
    },
  },
  time: {
    /** Ongoing ranges: "2023–present", "Aug 2016 – present". */
    present: "actualidad",
    /** Month abbreviations, January first (periods in the experience timeline). */
    months: [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ],
  },
  projects: {
    ownership: {
      contributor: "colaborador",
      owner: "propietario",
    },
    via: "vía {name}",
    building: "construyendo...",
    destination: {
      playStore: "{title} en Google Play",
      appStore: "{title} en la App Store",
      site: "sitio web de {title}",
      repo: "código fuente de {title}",
    },
    note: {
      one: "{app} es propiedad de {owner}. Colaboré en ella como desarrollador Android{through}.",
      other:
        "{apps} son propiedad de {owner}. Colaboré en ellas como desarrollador Android{through}.",
      through: " a través de {via}",
    },
  },
  courses: {
    destination: "certificado de {title}",
  },
  links: {
    newTab: "se abre en una pestaña nueva",
  },
  contact: {
    noJs: "activa JavaScript para ver el número",
    copied: "> copiado al portapapeles",
    whatsappText: "¡Hola, Thiago! Vi tu portafolio y me gustaría conversar.",
    destination: {
      mail: "escribir a {value}",
      call: "llamar al {value}",
      copy: "copiar {value} al portapapeles",
      chat: "chatear con {name} por WhatsApp",
      linkedin: "perfil de {name} en LinkedIn",
      github: "perfil de {name} en GitHub",
      instagram: "perfil de {name} en Instagram",
      vcard: "tarjeta de contacto de {name} (vCard)",
      resume: "currículum de {name} ({language}, PDF)",
    },
  },
  footer: {
    builtWith: "hecho con Astro + OpenSpec",
    repo: "código fuente de este sitio",
    copyright: "© {year} {name}",
    lastBuild: "última compilación",
  },
  switcher: {
    label: "Idioma",
  },
  language: {
    en: "English",
    "pt-br": "Português (Brasil)",
    es: "Español",
  },
  notFound: {
    title: "Página no encontrada",
    heading: "404 — página no encontrada",
    message: "La página que buscas no existe o fue movida.",
    backHome: "Volver al inicio",
  },
} satisfies Dictionary;

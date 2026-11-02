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

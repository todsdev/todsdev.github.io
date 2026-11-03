import type { Dictionary } from "./en";

export const ptBr = {
  meta: {
    title: "Thiago Rodrigues — Desenvolvedor Android",
    description:
      "Portfólio de Thiago Rodrigues, Desenvolvedor Android: experiência, projetos, habilidades e cursos.",
  },
  skipLink: "Pular para o conteúdo",
  nav: {
    label: "Seções",
    hero: "Início",
    about: "Sobre",
    experience: "Experiência",
    projects: "Projetos",
    skills: "Habilidades",
    courses: "Cursos",
    contact: "Contato",
  },
  prompt: {
    about: "cd ~/sobre",
    experience: "ls ./experiencia",
    projects: "ls ./projetos",
    skills: "cat habilidades.txt",
    courses: "ls ./cursos",
    contact: "./contato.sh",
  },
  hero: {
    prompt: "~/portfolio $ ./ola",
    /** `{name}` is replaced with the profile name. */
    photoAlt: "Retrato de {name}",
  },
  about: {
    journeyCommand: "cat jornada.log",
    factsCommand: "neofetch",
    facts: {
      location: "localização",
      languages: "idiomas",
      education: "formação",
      focus: "foco",
    },
  },
  time: {
    /** Ongoing ranges: "2023–present", "Aug 2016 – present". */
    present: "atual",
    /** Month abbreviations, January first (periods in the experience timeline). */
    months: [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ],
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
    title: "Página não encontrada",
    heading: "404 — página não encontrada",
    message: "A página que você procura não existe ou foi movida.",
    backHome: "Voltar ao início",
  },
} satisfies Dictionary;

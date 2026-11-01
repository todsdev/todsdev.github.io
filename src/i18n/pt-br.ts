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
    hero: "whoami",
    about: "cd ~/sobre",
    experience: "ls ./experiencia",
    projects: "ls ./projetos",
    skills: "cat habilidades.txt",
    courses: "ls ./cursos",
    contact: "./contato.sh",
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

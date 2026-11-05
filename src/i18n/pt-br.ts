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
  projects: {
    ownership: {
      contributor: "colaborador",
      owner: "proprietário",
    },
    via: "via {name}",
    building: "construindo...",
    destination: {
      playStore: "{title} no Google Play",
      appStore: "{title} na App Store",
      site: "site de {title}",
      repo: "código-fonte de {title}",
    },
    note: {
      one: "{app} pertence à empresa {owner}. Contribuí com ele como desenvolvedor Android{through}.",
      other:
        "{apps} pertencem à empresa {owner}. Contribuí com eles como desenvolvedor Android{through}.",
      through: " por meio da empresa {via}",
    },
  },
  courses: {
    destination: "certificado de {title}",
  },
  links: {
    newTab: "abre em nova aba",
  },
  contact: {
    noJs: "ative o JavaScript para ver o número",
    copied: "> copiado para a área de transferência",
    whatsappText: "Olá, Thiago! Vi o seu portfólio e gostaria de conversar.",
    destination: {
      mail: "escrever para {value}",
      call: "ligar para {value}",
      copy: "copiar {value} para a área de transferência",
      chat: "conversar com {name} no WhatsApp",
      linkedin: "perfil de {name} no LinkedIn",
      github: "perfil de {name} no GitHub",
      instagram: "perfil de {name} no Instagram",
      vcard: "cartão de contato de {name} (vCard)",
      resume: "currículo de {name} ({language}, PDF)",
    },
  },
  footer: {
    builtWith: "feito com Astro + OpenSpec",
    repo: "código-fonte deste site",
    copyright: "© {year} {name}",
    lastBuild: "última build",
    analytics: "estatísticas sem cookies pelo Umami",
    analyticsPolicy: "política de privacidade do Umami",
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

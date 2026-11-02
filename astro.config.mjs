// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://todsdev.github.io",
  output: "static",
  i18n: {
    defaultLocale: "en",
    locales: ["en", { path: "pt-br", codes: ["pt-BR"] }, "es"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});

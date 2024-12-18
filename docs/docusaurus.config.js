// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
import Dotenv from "dotenv";
Dotenv.config({ path: ".env" });

const GITHUB_URL =
  process.env.GITHUB_URL || "https://github.com/nlp-tlp/lexiclean";
const WEBSITE_URL = process.env.WEBSITE_URL || "https://lexiclean.nlp-tlp.org";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "LexiClean - Documentation",
  tagline: "Multi-task Lexical Normalisation",
  url: WEBSITE_URL,
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
        title: "LexiClean Documentation",
        logo: {
          alt: "LexiClean Logo",
          src: "img/android-chrome-512x512.png",
        },
        items: [
          {
            href: GITHUB_URL,
            label: "GitHub",
            position: "right",
          },
          {
            href: WEBSITE_URL,
            label: "LexiClean",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        copyright: `Launched into the digital cosmos by 🚀 Tyler Bikaun (4theKnowledge)`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      docs: {
        sidebar: { hideable: true, autoCollapseCategories: true },
      },
    }),
};

export default config;

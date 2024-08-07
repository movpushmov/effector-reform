import { defineConfig } from 'vitepress'

const version = '0.10.2'

export default defineConfig({
  title: "effector reform",
  description: "effector reform documentation",
  base: '/effector-reform',
  themeConfig: {
    logo: './logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Introduction', link: '/introduction/getting-started' },
      { text: 'API', link: '/api/index' },
      {
        text: `v${version}`,
        items: [
          {
            items: [
              {
                text: `v${version}`,
                link: `https://github.com/movpushmov/effector-reform/releases/tag/v${version}`,
              },
              {
                text: 'Releases Notes',
                link: 'https://github.com/movpushmov/effector-reform/blob/main/CHANGELOG.md',
              },
            ],
          },
          {
            items: [
              {
                text: 'v0.x',
                link: 'https://movpushmov.github.io/effector-reform/',
              },
            ],
          },
        ]
      }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting started', link: '/introduction/getting-started' },
          { text: 'Understanding concept', link: '/introduction/understanding-concept' },
        ]
      },
      {
        text: 'Core',
        items: [
          { text: 'createField', link: '/core/create-field' },
          { text: 'createArrayField', link: '/core/create-array-field' },
          { text: 'createForm', link: '/core/create-form' },
        ]
      },
      {
        text: 'React',
        items: [
          { text: 'useForm', link: '/react/use-form' },
          { text: 'useField', link: '/react/use-field' },
          { text: 'useArrayField', link: '/react/use-array-field' },
        ]
      },
      {
        text: 'Validation',
        items: [
          { text: 'Contracts', link: '/validation/contracts' },
          { text: 'Yup', link: '/validation/yup' },
          { text: 'Zod', link: '/validation/zod' },
        ]
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2021-PRESENT movpushmov',
    },

    socialLinks: [
      { icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><defs><linearGradient id="logosTelegram0" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stop-color="#2aabee"/><stop offset="100%" stop-color="#229ed9"/></linearGradient></defs><path fill="url(#logosTelegram0)" d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.04 128.04 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51s-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0"/><path fill="#fff" d="M57.94 126.648q55.98-24.384 74.64-32.152c35.56-14.786 42.94-17.354 47.76-17.441c1.06-.017 3.42.245 4.96 1.49c1.28 1.05 1.64 2.47 1.82 3.467c.16.996.38 3.266.2 5.038c-1.92 20.24-10.26 69.356-14.5 92.026c-1.78 9.592-5.32 12.808-8.74 13.122c-7.44.684-13.08-4.912-20.28-9.63c-11.26-7.386-17.62-11.982-28.56-19.188c-12.64-8.328-4.44-12.906 2.76-20.386c1.88-1.958 34.64-31.748 35.26-34.45c.08-.338.16-1.598-.6-2.262c-.74-.666-1.84-.438-2.64-.258c-1.14.256-19.12 12.152-54 35.686c-5.1 3.508-9.72 5.218-13.88 5.128c-4.56-.098-13.36-2.584-19.9-4.708c-8-2.606-14.38-3.984-13.82-8.41c.28-2.304 3.46-4.662 9.52-7.072"/></svg>' }, link: 'https://t.me/effector_ru' },
      { icon: 'github', link: 'https://github.com/movpushmov/effector-reform' }
    ]
  }
})

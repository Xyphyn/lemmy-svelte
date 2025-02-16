import i18n, { type Config } from 'sveltekit-i18n'

const config: Config = {
  loaders: [
    {
      locale: 'en',
      key: '',
      loader: async () => (await import('./i18n/en.json')).default,
    },
    {
      locale: 'he',
      key: '',
      loader: async () => (await import('./i18n/he.json')).default,
    },
    {
      locale: 'ar',
      key: '',
      loader: async () => (await import('./i18n/ar.json')).default,
    },
    {
      locale: 'bg',
      key: '',
      loader: async () => (await import('./i18n/bg.json')).default,
    },
    {
      locale: 'de',
      key: '',
      loader: async () => (await import('./i18n/de.json')).default,
    },
    {
      locale: 'es',
      key: '',
      loader: async () => (await import('./i18n/es.json')).default,
    },
    {
      locale: 'et',
      key: '',
      loader: async () => (await import('./i18n/et.json')).default,
    },
    {
      locale: 'fi',
      key: '',
      loader: async () => (await import('./i18n/fi.json')).default,
    },
    {
      locale: 'fr',
      key: '',
      loader: async () => (await import('./i18n/fr.json')).default,
    },
    {
      locale: 'hu',
      key: '',
      loader: async () => (await import('./i18n/hu.json')).default,
    },
    {
      locale: 'ja',
      key: '',
      loader: async () => (await import('./i18n/ja.json')).default,
    },
    {
      locale: 'nl',
      key: '',
      loader: async () => (await import('./i18n/nl.json')).default,
    },
    {
      locale: 'pl',
      key: '',
      loader: async () => (await import('./i18n/pl.json')).default,
    },
    {
      locale: 'pt',
      key: '',
      loader: async () => (await import('./i18n/pt.json')).default,
    },
    {
      locale: 'ru',
      key: '',
      loader: async () => (await import('./i18n/ru.json')).default,
    },
    {
      locale: 'tr',
      key: '',
      loader: async () => (await import('./i18n/tr.json')).default,
    },
    {
      locale: 'zh-Hans',
      key: '',
      loader: async () => (await import('./i18n/zh-Hans.json')).default,
    },
    {
      locale: 'zh-Hant',
      key: '',
      loader: async () => (await import('./i18n/zh-Hant.json')).default,
    },
  ],
  fallbackLocale: 'en',
}

export const aliases = new Map([
  ['zh-CN', 'zh-Hans'],
  ['zh-TW', 'zh-Hant'],
  ['en-US', 'en'],
  ['en-GB', 'en'],
  ['en-AU', 'en'],
  ['en-CA', 'en'],
  ['fr-FR', 'fr'],
  ['fr-CA', 'fr'],
  ['fr-BE', 'fr'],
  ['de-DE', 'de'],
  ['de-AT', 'de'],
  ['de-CH', 'de'],
  ['pt-BR', 'pt'],
  ['pt-PT', 'pt'],
  ['fi-FI', 'fi'],
  ['et-EE', 'et'],
  ['he-IL', 'he'],
])

export let { t, locale, locales, loading, loadTranslations } = new i18n(config)

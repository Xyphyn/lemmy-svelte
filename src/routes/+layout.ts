import { browser } from '$app/environment'
import { env } from '$env/dynamic/public'
import { settings } from '$lib/settings.svelte'
import { aliases, loadTranslations } from '$lib/translations.js'
import { get } from 'svelte/store'

export let ssr = (env.PUBLIC_SSR_ENABLED?.toLowerCase() ?? 'false') == 'true'

export const load = async ({}) => {
  if (browser) {
    const initLocale =
      settings.language ?? navigator?.language ?? 'en'

    console.log(`Loading locale ${aliases.get(initLocale) ?? initLocale}`)

    await loadTranslations(aliases.get(initLocale) ?? initLocale)
  }

  return
}

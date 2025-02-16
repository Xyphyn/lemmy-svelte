import { getClient } from '$lib/lemmy.svelte.js'
import { site as siteStore } from '$lib/lemmy.svelte.js'

export async function load({ fetch }) {
  let site = siteStore

  if (!site.data) {
    const res = await getClient(undefined, fetch).getSite()

    site.data = res
  }

  return {
    site: site.data,
  }
}

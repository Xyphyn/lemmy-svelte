import { profile } from '$lib/auth.svelte'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { site as siteStore } from '$lib/lemmy'

export async function load({ fetch }) {
  if (!profile) return
  let { jwt } = profile!
  let site = get(siteStore)

  if (!site) {
    const res = await getClient(undefined, fetch).getSite()

    site = res
  }

  return {
    site: site,
  }
}

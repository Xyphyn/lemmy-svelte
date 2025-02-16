import { getClient } from '$lib/lemmy.svelte.js'

export const load = ({ url }) => {
  return { crosspost: Boolean(url.searchParams.get('crosspost')) ?? false }
}

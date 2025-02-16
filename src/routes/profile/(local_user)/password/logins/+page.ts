import { client } from '$lib/lemmy.svelte.js'

export async function load({ fetch, parent }) {
  const user = await parent()

  const response = await client({ func: fetch }).listLogins()

  return {
    tokens: response,
  }
}

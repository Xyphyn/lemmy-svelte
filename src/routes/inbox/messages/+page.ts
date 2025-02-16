import { client } from '$lib/lemmy.svelte.js'
import { awaitIfServer } from '$lib/promise.js'

export async function load({ fetch, url }) {
  const page = Number(url.searchParams.get('page')) || 1

  const messagePromise = client({ func: fetch }).getPrivateMessages({
    limit: 50,
  })

  return {
    messages: (await awaitIfServer(messagePromise)).data,
  }
}

import { client } from '$lib/lemmy.svelte.js'
import { postFeed } from '$lib/lemmy/postfeed.js'
import { error } from '@sveltejs/kit'

export async function load({ url, params, fetch }) {
  if (params.type.toLowerCase() != 'up' && params.type.toLowerCase() != 'down')
    error(404)

  const upvoted = params.type.toLowerCase() == 'up'

  return {
    feed: await postFeed({
      id: 'votes',
      request: {
        sort: 'New',
        liked_only: upvoted || undefined,
        disliked_only: !upvoted || undefined,
      },
      url: url,
      fetch: fetch,
    }),
    upvoted: upvoted,
  }
}

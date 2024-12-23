import { postFeed } from '$lib/lemmy/postfeed.js'
import { settings } from '$lib/settings.svelte'
import type { SortType } from 'lemmy-js-client'
import { get } from 'svelte/store'

export async function load({ params, fetch, url }) {
  const cursor: string | undefined = url.searchParams.get('cursor') as
    | string
    | undefined
  const page = Number(url.searchParams.get('page')) || undefined

  const sort: SortType =
    (url.searchParams.get('sort') as SortType) ||
    settings.defaultSort.sort

  return await postFeed({
    id: 'community',
    url: url,
    request: {
      page: page,
      page_cursor: cursor,
      sort: sort,
      limit: 20,
      community_name: params.name,
    },
    fetch: fetch,
  })
}

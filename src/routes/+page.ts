import { getClient } from '$lib/lemmy.js'
import { userSettings } from '$lib/settings.js'
import type { GetPostsResponse, ListingType, SortType } from 'lemmy-js-client'
import { get, writable } from 'svelte/store'
import { error } from '@sveltejs/kit'
import { browser } from '$app/environment'
import { instance } from '$lib/instance'
import { postFeed, postFeeds, shouldReload } from '$lib/lemmy/postfeed.js'
import { FeedLayer } from '$lib/components/ui/navbar/layers/index.js'

export async function load({ url, fetch }) {
  const cursor = url.searchParams.get('cursor') as string | undefined
  const prevCursor = url.searchParams.get('prevCursor') as string | undefined

  const settings = get(userSettings)

  const sort: SortType =
    (url.searchParams.get('sort') as SortType) || settings.defaultSort.sort
  const listingType: ListingType =
    (url.searchParams.get('type') as ListingType) || settings.defaultSort.feed

  return {
    ...(await postFeed({
      id: 'main',
      request: {
        page_cursor: cursor,
        sort: sort,
        type_: listingType,
        limit: 20,
        show_hidden: settings.posts.showHidden,
      },
      url: url,
      fetch: fetch,
    })),
    slots: {
      nav: {
        component: FeedLayer,
      },
    },
  }
}

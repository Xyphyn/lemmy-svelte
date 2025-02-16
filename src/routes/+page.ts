import { settings } from '$lib/settings.svelte'
import type { GetPostsResponse, ListingType, SortType } from 'lemmy-js-client'
import { postFeed, postFeeds, shouldReload } from '$lib/lemmy/postfeed.js'
import { t } from '$lib/translations.js'
import { ChevronDoubleUp } from 'svelte-hero-icons'

export async function load({ url, fetch }) {
  const cursor = url.searchParams.get('cursor') as string | undefined
  const prevCursor = url.searchParams.get('prevCursor') as string | undefined

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
    contextual: {
      actions: [
        {
          name: t.get('routes.post.scrollToTop'),
          handle: () => window?.scrollTo({ top: 0, behavior: 'instant' }),
          icon: ChevronDoubleUp,
        },
      ],
    },
  }
}

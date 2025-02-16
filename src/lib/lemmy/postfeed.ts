import { browser } from '$app/environment'
import { instance } from '$lib/instance.svelte'
import { client } from '$lib/lemmy.svelte'
import type {
  GetPosts,
  GetPostsResponse,
  ListingType,
  SortType,
} from 'lemmy-js-client'
import { get, writable } from 'svelte/store'

export const shouldReload = (
  cache: PostFeed | undefined,
  url: URL,
  instance: string,
): boolean =>
  cache?.instance != instance || cache?.url.toString() != url.toString()

interface FetchPostFeed extends GetPosts {
  sort: SortType
  type_?: ListingType
}

export async function postFeed(args: {
  id: PostFeedID
  request: FetchPostFeed
  url: URL
  fetch?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>
}) {
  const feed = get(postFeeds)[args.id]

  const posts = shouldReload(feed, args.url, instance.data)
    ? await client({ func: args.fetch }).getPosts(args.request)
    : feed.data.posts

  if (shouldReload(feed, args.url, instance.data) && browser)
    postFeeds.updateFeed(args.id, {
      data: {
        ...args.request,
        posts: posts,
        cursor: {
          next: posts.next_page,
        },
        type_: args.request.type_,
      },
      url: args.url,
      lastSeen: 0,
      instance: instance.data,
    })

  return (
    get(postFeeds)[args.id]?.data ?? {
      ...args.request,
      posts: posts,
      cursor: {
        next: posts.next_page,
      },
      type_: args.request.type_,
    }
  )
}

export function getPostFeed(feeds: Map<PostFeedID, PostFeed>, id: PostFeedID) {
  return feeds.get(id)
}

function createPostFeedsStore() {
  // @ts-ignore
  const { subscribe, update, set } = writable<Record<PostFeedID, PostFeed>>({})

  return {
    subscribe,
    addFeed: (id: PostFeedID, feed: PostFeed) =>
      update((feeds) => ({ ...feeds, [id]: feed })),
    updateFeed: (id: PostFeedID, feed: Partial<PostFeed>) =>
      update((feeds) => {
        return {
          ...feeds,
          [id]: { ...feeds[id], ...feed } as PostFeed,
        }
      }),
    removeFeed: (id: PostFeedID) =>
      update((feeds) => {
        const { [id]: _, ...rest } = feeds
        return rest as Record<PostFeedID, PostFeed>
      }),
    clearAll: () => set({} as Record<PostFeedID, PostFeed>),
    set,
  }
}

export type PostFeedID = 'main' | 'community' | 'profile' | 'votes'

export interface PostFeed {
  data: GetPosts & {
    posts: GetPostsResponse
    cursor: {
      next?: string
    }
    sort: SortType
  }
  url: URL
  lastSeen: number
  instance: string
  id: PostFeedID
}

export let postFeeds = createPostFeedsStore()

import { profile } from '$lib/auth.svelte'
import { getClient } from '$lib/lemmy.svelte.js'
import type { CommentView, ListingType, PostView } from 'lemmy-js-client'

function getSavedItemPublished(item: PostView | CommentView) {
  if ('comment' in item) {
    return item.comment.published
  } else {
    return item.post.published
  }
}

export async function load({ url, fetch }) {
  if (!profile) return { posts: [], page: 0 }
  const page = Number(url.searchParams.get('page')) || 1
  const type: 'comments' | 'posts' | 'all' =
    (url.searchParams.get('type') as 'comments' | 'posts' | 'all') || 'all'

  const client = getClient(undefined, fetch)

  const params = {
    saved_only: true,
    limit: 20,
    page: page,
    // sort: 'New' as SortType & CommentSortType,
    type_: 'All' as ListingType,
  }

  const [posts, comments] = await Promise.all([
    type == 'posts' || type == 'all' ? client.getPosts(params) : { posts: [] },

    type == 'comments' || type == 'all'
      ? client.getComments(params)
      : { comments: [] },
  ])

  const everything = [...posts.posts, ...comments.comments].sort(
    (a, b) =>
      Date.parse(getSavedItemPublished(b)) -
      Date.parse(getSavedItemPublished(a)),
  )

  return { page: page, data: everything, type: type }
}

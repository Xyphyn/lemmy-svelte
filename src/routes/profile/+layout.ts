import { profile } from '$lib/auth.js'
import { getClient } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'
import type { SortType } from 'lemmy-js-client'
import { get } from 'svelte/store'

export async function load({ params, url, fetch }) {
  const page = Number(url.searchParams.get('page')) || 1
  const type: 'comments' | 'posts' | 'all' =
    (url.searchParams.get('type') as 'comments' | 'posts' | 'all') || 'all'
  const sort: SortType = (url.searchParams.get('sort') as SortType) || 'New'

  const user = await getClient(undefined, fetch).getPersonDetails({
    limit: 20,
    page: page,
    username: get(profile)!.user?.local_user_view.person.name,
    sort: sort,
    auth: get(profile)?.jwt,
  })

  const items = [...user.posts, ...user.comments]

  if (sort == 'TopAll') {
    items.sort(
      (a, b) =>
        b.counts.upvotes -
        b.counts.downvotes -
        (a.counts.upvotes - a.counts.downvotes),
    )
  } else if (sort == 'New') {
    items.sort(
      (a, b) =>
        Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)),
    )
  }

  return {
    type: type,
    page: page,
    sort: sort,
    user: {
      person_view: user.person_view,
      submissions: items,
    },
  }
}

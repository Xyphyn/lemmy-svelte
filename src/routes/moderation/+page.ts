import { profile } from '$lib/auth.svelte'
import { isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
import { getClient } from '$lib/lemmy.svelte.js'
import {
  generalizeCommentReport,
  generalizePostReport,
  generalizePrivateMessageReport,
} from '$lib/lemmy/report.js'
import { get } from 'svelte/store'

type ReportListType = 'unread' | 'all'
type ReportFilter = 'all' | 'posts' | 'comments' | 'messages'

export async function load({ url, fetch }) {
  const page = Number(url.searchParams.get('page')) || 1
  const type: ReportListType =
    (url.searchParams.get('type') as ReportListType) || 'unread'
  const filter: ReportFilter =
    (url.searchParams.get('filter') as ReportFilter) || 'all'

  const jwt = profile.data?.jwt

  if (!jwt) return { type: type, page: page }

  // can they please
  // make a sane, consistent, and simple API for once
  // 3 separate requests? really?
  // and this time instead of get() it's list(). Why?!
  // the interfaces don't even extend each other
  // meaning I have to make a separate function to get dates
  // for EACH FREAKING ITEM KAJSHDAWLD auwdi awiody
  const client = getClient(undefined, fetch)

  const params = {
    limit: 20,
    page: page,
    unresolved_only: type == 'unread',
  }

  const admin = profile.data?.user ? isAdmin(profile!.data.user!) : false

  const [posts, comments, messages] = await Promise.all([
    client.listPostReports({
      ...params,
    }),
    client.listCommentReports({
      ...params,
    }),
    admin ? client.listPrivateMessageReports({ ...params }) : undefined,
  ])

  const everything = [
    ...posts.post_reports.map(generalizePostReport),
    ...comments.comment_reports.map(generalizeCommentReport),
    ...(messages?.private_message_reports ?? []).map(
      generalizePrivateMessageReport,
    ),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return {
    type: type,
    page: page,
    items: everything,
  }
}

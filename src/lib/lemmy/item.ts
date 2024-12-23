import { profile, profileData } from '$lib/auth.svelte'
import type {
  CommentReportView,
  CommentView,
  CommunityView,
  Comment,
  PersonView,
  PostReportView,
  PostView,
  Post,
  PrivateMessageReportView,
  PrivateMessageView,
  Community,
} from 'lemmy-js-client'
import { get, writable } from 'svelte/store'

export type Result =
  | PostView
  | Post
  | CommentView
  | Comment
  | PersonView
  | CommunityView
  | PrivateMessageView
  | PostReportView
  | CommentReportView
  | PrivateMessageReportView

export function getItemPublished(item: Result) {
  // reports... why
  if ('post_report' in item) return item.post_report.published
  if ('comment_report' in item) return item.comment_report.published
  if ('private_message_report' in item)
    return item.private_message_report.published

  // others
  if ('private_message' in item) return item.private_message.published
  if ('comment' in item) return item.comment.published
  else if ('post' in item) return item.post.published

  if ('person' in item) return item.person.published
  if ('community' in item) return item.community.published

  return ''
}

export const isPostView = (item: Result): item is PostView =>
  'post' in item && !('comment' in item)

export const isPost = (item: Result): item is Post =>
  'name' in item && !('content' in item)

export const isCommentView = (item: Result): item is CommentView =>
  'comment' in item

export const isComment = (item: Result): item is Comment => 'content' in item

export const isCommunityView = (item: Result): item is CommunityView =>
  'community' in item

export const isUser = (item: Result): item is PersonView => 'person' in item

export const isPostReport = (item: Result): item is PostReportView =>
  'post_report' in item

export const isCommentReport = (item: Result): item is CommentReportView =>
  'comment_report' in item

export const isPrivateMessageReport = (
  item: Result
): item is PrivateMessageReportView => 'private_message_report' in item

export interface ResumableItem {
  url: string
  id?: number
  name: string
  avatar?: string
  type: 'community' | 'post'
  subdivision?: {
    avatar?: string
    name: string
  }
}

function resumableStore(limit: number = 10) {
  const { subscribe, set, update } = writable<ResumableItem[]>([])

  return {
    subscribe, set, update,
    add: (item: ResumableItem) => {
      update(resumables => {
        if (resumables.find(i => JSON.stringify(i) == JSON.stringify(item))) return resumables
        resumables.unshift(item)
        if (resumables.length > limit) resumables.pop()
        return resumables
      })
    }
  }
}

export let resumables = resumableStore()

export function addFavorite(item: Community, add: boolean = true) {
  const pd = get(profileData)
  const p = pd.profiles.find((p) => p.id == get(profile)?.id)
  if (!p) return

  let favs = p.favorites ?? []
  if (favs.map((fav) => fav.id).includes(item.id)) if (add) return
  if (!add) {
    favs.splice(favs.map((c) => c.id).indexOf(item.id), 1)
  } else {
    favs.unshift(item)
  }
  p.favorites = favs
  profileData.update(() => pd)
}

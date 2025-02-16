import type {
  Comment,
  CommentReplyView,
  CommentView,
  Person,
  PersonMentionView,
  PrivateMessageView,
} from 'lemmy-js-client'

export type InboxItemView =
  | PersonMentionView
  | CommentReplyView
  | PrivateMessageView

export const generalizeCommentReply = (item: CommentReplyView): InboxItem => ({
  type: 'comment_reply',
  id: item.comment_reply.id,
  published: item.comment_reply.published,
  item: { ...item },
  creator: item.creator,
  read: item.comment_reply.read,
})

export const generalizePersonMention = (
  item: PersonMentionView,
): InboxItem => ({
  type: 'person_mention',
  id: item.person_mention.id,
  published: item.person_mention.published,
  item: {
    ...item,
  },
  creator: item.creator,
  read: item.person_mention.read,
})

export const generalizePrivateMessage = (
  item: PrivateMessageView,
): InboxItem => ({
  type: 'private_message',
  id: item.private_message.id,
  published: item.private_message.published,
  item: item,
  creator: item.creator,
  read: item.private_message.read,
})

interface PrivateMessage {
  type: 'private_message'
  item: PrivateMessageView
}
interface CommentReply {
  type: 'comment_reply'
  item: CommentView
}
interface PersonMention {
  type: 'person_mention'
  item: CommentView
}

interface BaseInboxItem {
  creator: Person
  published: string
  read: boolean
  id: number
}

export type InboxItem = BaseInboxItem &
  (PrivateMessage | CommentReply | PersonMention)

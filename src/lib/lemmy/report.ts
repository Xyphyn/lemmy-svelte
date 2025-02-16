import { publishedToDate } from '$lib/components/util/date.js'
import type {
  CommentReportView,
  CommentView,
  Person,
  PostReportView,
  PostView,
  PrivateMessage,
  PrivateMessageReportView,
  PrivateMessageView,
} from 'lemmy-js-client'

interface CommentReport {
  type: 'comment'
  item: CommentView
}

interface PostReport {
  type: 'post'
  item: PostView
}

interface PrivateMessageReport {
  type: 'message'
  item: PrivateMessage
  reportee: Person
}

interface BaseReport {
  creator: Person
  reason: string
  reportee?: Person
  timestamp: Date
  resolved: boolean
  id: number
  resolver?: Person
}

export const generalizeCommentReport = (
  report: CommentReportView,
): ReportView => ({
  creator: report.creator,
  item: {
    ...report,
    subscribed: 'NotSubscribed',
    saved: false,
    creator_blocked: false,
    creator: report.comment_creator,
    banned_from_community: false,
  },
  reason: report.comment_report.reason,
  type: 'comment',
  timestamp: publishedToDate(report.comment_report.published),
  resolved: report.comment_report.resolved,
  id: report.comment_report.id,
  resolver: report.resolver,
})

export const generalizePostReport = (report: PostReportView): ReportView => ({
  creator: report.creator,
  item: {
    ...report,
    unread_comments: 0,
    saved: false,
    creator_blocked: false,
    read: false,
    subscribed: 'NotSubscribed',
    creator: report.post_creator,
    banned_from_community: false,
  },
  reason: report.post_report.reason,
  type: 'post',
  timestamp: publishedToDate(report.post_report.published),
  resolved: report.post_report.resolved,
  id: report.post_report.id,
  resolver: report.resolver,
})

export const generalizePrivateMessageReport = (
  report: PrivateMessageReportView,
): ReportView => ({
  creator: report.creator,
  item: report.private_message,
  reason: report.private_message_report.reason,
  type: 'message',
  reportee: report.private_message_creator,
  timestamp: publishedToDate(report.private_message_report.published),
  resolved: report.private_message_report.resolved,
  id: report.private_message_report.id,
  resolver: report.resolver,
})

export type Report =
  | CommentReportView
  | PostReportView
  | PrivateMessageReportView

export type ReportView = BaseReport &
  (CommentReport | PostReport | PrivateMessageReport)

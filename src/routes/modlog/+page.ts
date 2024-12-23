import { profile } from '$lib/auth.svelte'
import { publishedToDate } from '$lib/components/util/date.js'
import { getClient } from '$lib/lemmy.js'
import type {
  AdminPurgeCommentView,
  AdminPurgeCommunityView,
  AdminPurgePersonView,
  AdminPurgePostView,
  Community,
  ModAddCommunityView,
  ModAddView,
  ModBanFromCommunityView,
  ModBanView,
  ModFeaturePostView,
  ModHideCommunityView,
  ModLockPostView,
  ModRemoveCommentView,
  ModRemovePostView,
  ModTransferCommunityView,
  ModlogActionType,
  ModlogListParams,
  Person,
} from 'lemmy-js-client'
import { get } from 'svelte/store'

export type ActionName =
  | 'ban'
  | 'banCommunity'
  | 'unban'
  | 'unbanCommunity'
  | 'postRemoval'
  | 'postRestore'
  | 'commentRemoval'
  | 'commentRestore'
  | 'postLock'
  | 'postUnlock'
  | 'postUnfeature'
  | 'postFeature'
  | 'modAdd'
  | 'modRemove'
  | 'adminAdd'
  | 'adminRemove'
  | 'purge'
  | 'Unknown'

type ModAction =
  | ModBanFromCommunityView
  | ModRemoveCommentView
  | ModRemovePostView
  | ModAddCommunityView
  | ModLockPostView
  | ModFeaturePostView
  | ModTransferCommunityView
  | AdminPurgeCommentView
  | AdminPurgeCommunityView
  | AdminPurgePostView
  | AdminPurgePersonView
  | ModHideCommunityView
  | ModBanView
  | ModAddView

export interface ModLog {
  reason?: string
  moderatee?: Person
  content?: string
  moderator?: Person
  community?: Community
  actionName: ActionName
  timestamp: number
  link?: string
}

const fullUserName = (user: Person) =>
  `${user.name}@${new URL(user.actor_id).hostname}`
const timestamp = (when: string) => publishedToDate(when).getTime()

export const _toModLog = (item: ModAction): ModLog => {
  if ('mod_ban_from_community' in item) {
    return {
      moderator: item.moderator,
      moderatee: item.banned_person,
      community: item.community,
      actionName: item.mod_ban_from_community.banned
        ? 'banCommunity'
        : 'unbanCommunity',
      reason: item.mod_ban_from_community.reason,
      timestamp: timestamp(item.mod_ban_from_community.when_),
    }
  } else if ('mod_remove_comment' in item) {
    return {
      actionName: item.mod_remove_comment.removed
        ? 'commentRemoval'
        : 'commentRestore',
      community: item.community,
      content: item.comment.content,
      timestamp: timestamp(item.mod_remove_comment.when_),
      moderatee: item.commenter,
      moderator: item.moderator,
      reason: item.mod_remove_comment.reason,
      link: `/comment/${item.comment.id}`,
    }
  } else if ('mod_remove_post' in item) {
    return {
      actionName: item.mod_remove_post.removed ? 'postRemoval' : 'postRestore',
      community: item.community,
      content: item.post.name,
      timestamp: timestamp(item.mod_remove_post.when_),
      moderator: item.moderator,
      reason: item.mod_remove_post.reason,
      link: `/post/${item.post.id}`,
    }
  } else if ('mod_add_community' in item) {
    return {
      actionName: item.mod_add_community.removed ? 'modRemove' : 'modAdd',
      community: item.community,
      timestamp: timestamp(item.mod_add_community.when_),
      moderator: item.moderator,
      moderatee: item.modded_person,
    }
  } else if ('mod_feature_post' in item) {
    return {
      actionName: item.mod_feature_post.featured
        ? 'postFeature'
        : 'postUnfeature',
      timestamp: timestamp(item.mod_feature_post.when_),
      community: item.community,
      link: `/post/${item.post.id}`,
      moderator: item.moderator,
      content: item.post.name,
    }
  } else if ('mod_lock_post' in item) {
    return {
      actionName: item.mod_lock_post.locked ? 'postLock' : 'postUnlock',
      timestamp: timestamp(item.mod_lock_post.when_),
      community: item.community,
      link: `/post/${item.post.id}`,
      moderator: item.moderator,
      content: item.post.name,
    }
  } else if ('mod_transfer_community' in item) {
    return {
      actionName: 'Unknown',
      timestamp: timestamp(item.mod_transfer_community.when_),
      moderator: item.moderator,
      moderatee: item.modded_person,
      community: item.community,
    }
  } else if ('admin_purge_post' in item) {
    return {
      actionName: 'purge',
      timestamp: timestamp(item.admin_purge_post.when_),
      moderator: item.admin,
      community: item.community,
      content: 'Purged a post',
      reason: item.admin_purge_post.reason,
    }
  } else if ('admin_purge_comment' in item) {
    return {
      actionName: 'purge',
      timestamp: timestamp(item.admin_purge_comment.when_),
      moderator: item.admin,
      content: 'Purged a comment',
      reason: item.admin_purge_comment.reason,
    }
  } else if ('admin_purge_community' in item) {
    return {
      actionName: 'purge',
      timestamp: timestamp(item.admin_purge_community.when_),
      moderator: item.admin,
      content: 'Purged a community',
      reason: item.admin_purge_community.reason,
    }
  } else if ('admin_purge_person' in item) {
    return {
      actionName: 'purge',
      timestamp: timestamp(item.admin_purge_person.when_),
      moderator: item.admin,
      content: 'Purged a user',
      reason: item.admin_purge_person.reason,
    }
  } else if ('mod_ban' in item) {
    return {
      actionName: item.mod_ban.banned ? 'ban' : 'unban',
      timestamp: timestamp(item.mod_ban.when_),
      moderator: item.moderator,
      moderatee: item.banned_person,
      reason: item.mod_ban.reason,
      link: `/u/${fullUserName(item.banned_person)}`,
    }
  } else if ('mod_add' in item) {
    return {
      actionName: item.mod_add.removed ? 'adminRemove' : 'adminAdd',
      timestamp: timestamp(item.mod_add.when_),
      moderator: item.moderator,
      moderatee: item.modded_person,
    }
  }

  return {
    actionName: 'Unknown',
    timestamp: 0,
  }
}

export async function load({ url }) {
  let instance = url.searchParams.get('instance') || undefined
  let community = Number(url.searchParams.get('community')) || undefined
  let user = Number(url.searchParams.get('user')) || undefined
  let modId = Number(url.searchParams.get('mod_id')) || undefined
  const page = Number(url.searchParams.get('page')) || 1
  let type: ModlogActionType =
    (url.searchParams.get('type') as ModlogActionType) || 'All'

  const results = await getClient(instance).getModlog({
    community_id: community,
    limit: 40,
    type_: type,
    page: page,
    mod_person_id: modId,
    other_person_id: user,
  })

  const moderation = [
    ...results.banned_from_community,
    ...results.removed_comments,
    ...results.removed_posts,

    ...results.added_to_community,
    ...results.transferred_to_community,

    ...results.featured_posts,
    ...results.locked_posts,

    ...results.admin_purged_comments,
    ...results.admin_purged_communities,
    ...results.admin_purged_posts,
    ...results.admin_purged_persons,

    ...results.hidden_communities,
    ...results.banned,
    ...results.added,
  ]

  const moderationActions = moderation
    .map(_toModLog)
    .sort((a, b) => b.timestamp - a.timestamp)

  return {
    page: page,
    type: type,
    modlog: moderationActions,
    filters: {
      user: user ? moderationActions[0]?.moderatee?.name : undefined,
      community: community ? moderationActions[0]?.community?.title : undefined,
      moderator: modId ? moderationActions[0]?.moderator?.name : undefined
    }
  }
}

<script lang="ts">
  import Comment from '$lib/components/lemmy/comment/Comment.svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import { getClient } from '$lib/lemmy.js'
  import { notifications, profile } from '$lib/auth.svelte.js'
  import {
    ArrowUturnLeft,
    ArrowUturnUp,
    AtSymbol,
    ChatBubbleOvalLeft,
    Check,
    Envelope,
    Icon,
    Eye,
    EyeSlash,
  } from 'svelte-hero-icons'
  import { Material } from 'mono-svelte'
  import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
  import { Button } from 'mono-svelte'
  import RelativeDate from '$lib/components/util/RelativeDate.svelte'
  import { publishedToDate } from '$lib/components/util/date.js'
  import type { InboxItem } from '$lib/lemmy/inbox.js'
  import PrivateMessage from '$lib/components/lemmy/inbox/PrivateMessage.svelte'
  import PrivateMessageModal from '$lib/components/lemmy/modal/PrivateMessageModal.svelte'
  import { t } from '$lib/translations'
  import Expandable from '$lib/components/ui/Expandable.svelte'
  import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'

  interface Props {
    item: InboxItem
  }

  let { item = $bindable() }: Props = $props()

  let replying = $state(false)
  let reply = ''
  let loading = $state(false)

  async function markAsRead(isRead: boolean) {
    if (!$profile?.jwt) return

    loading = true

    switch (item.type) {
      case 'person_mention': {
        await getClient().markPersonMentionAsRead({
          person_mention_id: item.id,
          read: isRead,
        })
        break
      }
      case 'comment_reply': {
        await getClient().markCommentReplyAsRead({
          comment_reply_id: item.id,
          read: isRead,
        })
        break
      }
      case 'private_message': {
        await getClient().markPrivateMessageAsRead({
          private_message_id: item.id,
          read: isRead,
        })
      }
    }

    item.read = isRead
    if ($profile.user) $notifications.inbox += isRead ? -1 : 1

    loading = false
  }
</script>

{#if replying && item.type == 'private_message'}
  <PrivateMessageModal bind:open={replying} user={item.item.creator} />
{/if}

<Expandable open icon={false}>
  {#snippet title()}
    <div class="flex flex-row gap-2 items-center w-full">
      <Avatar
        url={item.creator.avatar}
        circle={false}
        width={28}
        alt={item.creator.name}
      />
      <!-- <div class="rounded-full p-1 border border-slate-200 dark:border-zinc-800">
        <Icon
          src={item.type == 'comment_reply'
            ? ChatBubbleOvalLeft
            : item.type == 'private_message'
              ? Envelope
              : item.type == 'person_mention'
                ? AtSymbol
                : AtSymbol}
          size="20"
          mini
          class="text-slate-600 dark:text-zinc-400"
        />
      </div> -->
      <div class="flex flex-col">
        <div class="text-sm font-normal">
          {#if item.type == 'comment_reply'}
            {@html $t('routes.inbox.item.reply', {
              // @ts-ignore
              user: `<span class="font-medium">${item.creator.name}</span>`,
              post: `<span class="font-medium">${item.item.post.name}</span>`,
            })}
          {:else if item.type == 'person_mention'}
            {@html $t('routes.inbox.item.mention', {
              // @ts-ignore
              user: `<span class="font-medium">${item.creator.name}</span>`,
              post: `<span class="font-medium">${item.item.post.name}</span>`,
            })}
          {:else if item.type == 'private_message'}
            {@html $t('routes.inbox.item.message', {
              // @ts-ignore
              user: `<span class="font-medium">${item.item.creator.name}</span>`,
              recipient: `<span class="font-medium">${item.item.recipient.name}</span>`,
            })}
          {/if}
        </div>
        <div class="text-xs text-slate-600 dark:text-zinc-400">
          <RelativeDate date={publishedToDate(item.published)} />
        </div>
      </div>
      <div class="flex-1"></div>
      <div class="flex gap-2 max-md:hidden flex-shrink-0">
        <Button
          color={item.read ? 'secondary' : 'primary'}
          {loading}
          disabled={loading}
          onclick={(e) => {
            e.stopPropagation()
            markAsRead(!item.read)
          }}
          size="sm"
          rounding="pill"
          class="flex-shrink-0"
        >
          {#snippet prefix()}
            <Icon src={item.read ? EyeSlash : Eye} size="16" micro />
          {/snippet}
          {item.read
            ? $t('post.actions.more.markUnread')
            : $t('post.actions.more.markRead')}
        </Button>
        {#if item.type == 'comment_reply' || item.type == 'person_mention'}
          <Button
            href="/comment/{item.item.comment.id}"
            size="sm"
            rounding="pill"
            class="flex-shrink-0"
          >
            {$t('common.jump')}
          </Button>
        {/if}
      </div>
    </div>
  {/snippet}
  {#snippet extended()}
    <div class="flex gap-2 w-full md:hidden mt-1">
      <Button
        color={item.read ? 'secondary' : 'primary'}
        {loading}
        disabled={loading}
        onclick={(e) => {
          e.stopPropagation()
          markAsRead(!item.read)
        }}
        size="sm"
        rounding="pill"
      >
        {#snippet prefix()}
          <Icon src={item.read ? EyeSlash : Eye} size="16" micro />
        {/snippet}
        {item.read
          ? $t('post.actions.more.markUnread')
          : $t('post.actions.more.markRead')}
      </Button>
      {#if item.type == 'comment_reply' || item.type == 'person_mention'}
        <Button
          href="/comment/{item.item.comment.id}"
          size="sm"
          rounding="pill"
        >
          {$t('common.jump')}
        </Button>
      {/if}
    </div>
  {/snippet}
  {#snippet content()}
    {#if item.type == 'comment_reply' || item.type == 'person_mention'}
      <CommentItem
        comment={item.item}
        community={false}
        view="cozy"
        meta={false}
        class="pt-0 pb-0"
      />
    {:else}
      <PrivateMessage message={item.item} meta={false} />
    {/if}
  {/snippet}
</Expandable>

<style>
  .meta {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr;
    column-gap: 0.5rem;
    grid-template-areas:
      'a b     actions'
      'a title actions';
  }
</style>

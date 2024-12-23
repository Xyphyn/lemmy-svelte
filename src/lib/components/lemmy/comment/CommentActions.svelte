<script lang="ts">
  import type { CommentView } from 'lemmy-js-client'
  import CommentVote from '$lib/components/lemmy/comment/CommentVote.svelte'
  import {
    ArrowUturnLeft,
    Bookmark,
    BookmarkSlash,
    ChatBubbleOvalLeft,
    EllipsisHorizontal,
    Flag,
    Icon,
    Language,
    PencilSquare,
    Square2Stack,
    Trash,
  } from 'svelte-hero-icons'
  import { createEventDispatcher } from 'svelte'
  import { isCommentMutable } from '$lib/components/lemmy/post/helpers.js'
  import {
    amMod,
    isAdmin,
    report,
  } from '$lib/components/lemmy/moderation/moderation.js'
  import CommentModerationMenu from '$lib/components/lemmy/moderation/CommentModerationMenu.svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { deleteItem, save } from '$lib/lemmy/contentview.js'
  import { Button, Menu, MenuButton, MenuDivider } from 'mono-svelte'
  import { t } from '$lib/translations'
  import Translation from '$lib/components/translate/Translation.svelte'
  import { text } from '$lib/components/translate/translation'
  import { settings } from '$lib/settings.svelte'

  interface Props {
    comment: CommentView
    replying?: boolean
    disabled?: boolean
  }

  let {
    comment = $bindable(),
    replying = $bindable(false),
    disabled = false,
  }: Props = $props()

  const dispatcher = createEventDispatcher<{ edit: CommentView }>()

  let reply = ''
  let translating = $state(false)
</script>

{#if translating}
  <Translation bind:open={translating} />
{/if}

<div
  class="flex flex-row items-center gap-0.5 h-7 w-full"
  class:flex-row-reverse={settings.posts.reverseActions}
>
  <CommentVote
    upvotes={comment.counts.upvotes}
    downvotes={comment.counts.downvotes}
    vote={comment.my_vote}
    commentId={comment.comment.id}
  />
  <Button
    size="sm"
    color="tertiary"
    rounding="pill"
    class="text-slate-700 dark:text-zinc-300"
    onclick={() => (replying = !replying)}
    disabled={comment.post.locked || disabled}
  >
    <Icon src={ChatBubbleOvalLeft} size="14" micro />
    <span class="text-xs">{$t('comment.reply')}</span>
  </Button>
  {#if $profile?.user && (amMod($profile?.user, comment.community) || isAdmin($profile.user))}
    <CommentModerationMenu bind:item={comment} />
  {/if}
  <Menu placement="bottom">
    {#snippet target()}
      <Button
        title={$t('comment.actions.label')}
        color="tertiary"
        rounding="pill"
        size="square-sm"
        class="text-slate-700 dark:text-zinc-300"
      >
        {#snippet prefix()}
          <Icon src={EllipsisHorizontal} width={16} height={16} mini />
        {/snippet}
      </Button>
    {/snippet}
    <MenuDivider>{$t('comment.actions.label')}</MenuDivider>
    <MenuButton
      onclick={() => {
        navigator.share?.({
          url: comment.comment.ap_id,
        }) ?? navigator.clipboard.writeText(comment.comment.ap_id)
      }}
    >
      <Icon src={Square2Stack} mini size="16" />
      <div>{$t('comment.actions.link')}</div>
    </MenuButton>
    {#if settings.translator}
      <MenuButton
        onclick={() => {
          // @ts-ignore
          text.set(comment.comment.content)
          translating = !translating
        }}
      >
        {#snippet prefix()}
          <Icon src={Language} size="16" mini />
        {/snippet}
        {$t('post.actions.more.translate')}
      </MenuButton>
    {/if}
    {#if $profile?.jwt}
      {#if comment.creator.id == $profile.user?.local_user_view.person.id}
        <MenuButton onclick={() => dispatcher('edit', comment)}>
          <Icon src={PencilSquare} mini size="16" />
          <span>{$t('post.actions.more.edit')}</span>
        </MenuButton>
      {/if}
      <MenuButton
        onclick={async () => {
          if ($profile?.jwt)
            comment.saved = await save(comment, !comment.saved, $profile.jwt)
        }}
      >
        <Icon src={comment.saved ? BookmarkSlash : Bookmark} mini size="16" />
        <span>
          {comment.saved ? $t('post.actions.unsave') : $t('post.actions.save')}
        </span>
      </MenuButton>
      {#if $profile?.user && $profile.jwt && $profile.user.local_user_view.person.id == comment.creator.id}
        <MenuButton
          color="danger-subtle"
          onclick={async () => {
            if ($profile?.jwt)
              comment.comment.deleted = await deleteItem(
                comment,
                !comment.comment.deleted,
                $profile.jwt,
              )
          }}
        >
          <Icon src={Trash} mini size="16" />
          <span>
            {comment.comment.deleted
              ? $t('post.actions.more.restore')
              : $t('post.actions.more.delete')}
          </span>
        </MenuButton>
      {/if}
      {#if $profile.jwt && $profile.user?.local_user_view.person.id != comment.creator.id}
        <MenuButton onclick={() => report(comment)} color="danger-subtle">
          <Icon src={Flag} mini size="16" />
          <span>{$t('moderation.report')}</span>
        </MenuButton>
      {/if}
    {/if}
  </Menu>
  <div class="flex-1 w-full"></div>
</div>

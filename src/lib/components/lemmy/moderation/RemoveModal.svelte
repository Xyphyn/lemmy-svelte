<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import Comment from '$lib/components/lemmy/comment/Comment.svelte'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import { Select, Switch, toast } from 'mono-svelte'
  import { getClient } from '$lib/lemmy.svelte.js'
  import { isCommentView, isPostView } from '$lib/lemmy/item.js'
  import type { CommentView, PostView } from 'lemmy-js-client'
  import { profile } from '$lib/auth.svelte.js'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { Fire, Icon, Trash } from 'svelte-hero-icons'
  import MultiSelect from '$lib/components/input/Switch.svelte'
  import { removalTemplate } from '$lib/components/lemmy/moderation/moderation.js'
  import { settings } from '$lib/settings.svelte.js'
  import { fullCommunityName } from '$lib/util.svelte.js'
  import { amMod, isAdmin } from './moderation'
  import { Button, Checkbox, Modal } from 'mono-svelte'
  import { t } from '$lib/translations'
  import Option from 'mono-svelte/forms/select/Option.svelte'

  interface Props {
    open: boolean
    item?: PostView | CommentView | undefined
    purge?: boolean
  }

  let {
    open = $bindable(),
    item = $bindable(undefined),
    purge = false,
  }: Props = $props()

  let reason = $state('')
  let commentReason: boolean = $state(false)
  let privateMessage: boolean = $state(false)
  let loading = $state(false)
  let preset = $state(settings.moderation.presets[0]?.content ?? '')

  let removed = $derived(
    item
      ? isCommentView(item)
        ? item.comment.removed
        : item.post.removed
      : false,
  )

  const getReplyReason = (reason: string, preset: string) => {
    if (!item) return `no template`

    return removalTemplate(preset, {
      communityLink: `!${fullCommunityName(
        item!.community.name,
        item!.community.actor_id,
      )}`,
      postTitle: item.post.name,
      reason: reason,
      username: item.creator.name,
    })
  }

  let replyReason = $state('')
  $effect(() => {
    replyReason = commentReason ? getReplyReason(reason, preset) : ''
  })

  async function remove() {
    if (!item) return
    if (!profile.data?.jwt) throw new Error('Unauthenticated')

    loading = true

    try {
      if (purge) {
        if (isCommentView(item)) {
          await getClient(undefined, fetch).purgeComment({
            comment_id: item.comment.id,
            reason: reason,
          })
        } else {
          await getClient(undefined, fetch).purgePost({
            post_id: item.post.id,
            reason: reason,
          })
        }

        toast({
          content: $t('moderation.removeSubmission.successPurge'),
          type: 'success',
        })

        loading = false
        open = false

        return
      }

      if (commentReason) {
        if (replyReason == '') {
          toast({
            content: $t('moderation.removeSubmission.failEmptyReply'),
          })
          return
        }

        if (privateMessage) {
          await getClient()
            .createPrivateMessage({
              content: replyReason,
              recipient_id: isCommentView(item)
                ? item.comment.creator_id
                : item.post.creator_id,
            })
            .catch(() => {
              toast({
                content: $t('moderation.removeSubmission.failMessage'),
                type: 'warning',
              })
            })
        } else {
          await getClient()
            .createComment({
              content: replyReason,
              post_id: item.post.id,
              parent_id: isCommentView(item) ? item.comment.id : undefined,
            })
            .catch(() => {
              toast({
                content: $t('moderation.removeSubmission.failReply'),
                type: 'warning',
              })
            })
        }
      }

      if (isCommentView(item)) {
        await getClient().removeComment({
          comment_id: item.comment.id,
          removed: !removed,
          reason: reason || undefined,
        })
        item.comment.removed = !removed
      } else if (isPostView(item)) {
        await getClient().removePost({
          post_id: item.post.id,
          removed: !removed,
          reason: reason || undefined,
        })

        item.post.removed = !removed
      }

      open = false
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    loading = false
  }

  const resetText = () => {
    reason = ''
    commentReason = false
  }

  run(() => {
    if (item) {
      resetText()
    }
  })
</script>

<Modal
  bind:open
  title={purge
    ? $t('moderation.removeSubmission.titlePurge')
    : removed
      ? $t('moderation.removeSubmission.titleRestore')
      : $t('moderation.removeSubmission.title')}
>
  {#if item}
    <form
      onsubmit={preventDefault(remove)}
      class="flex flex-col gap-4 list-none"
    >
      {#if isCommentView(item)}
        <Comment
          node={{
            children: [],
            comment_view: item,
            depth: 1,
          }}
          postId={item.post.id}
          actions={false}
        />
      {:else if isPostView(item)}
        <Post actions={false} post={item} />
      {/if}

      <MarkdownEditor
        rows={3}
        label="Reason"
        placeholder="Optional"
        bind:value={reason}
      />

      {#if !removed && profile.data?.user && (amMod(profile.data.user, item.community) || (isAdmin(profile.data.user) && item.community.local))}
        <Switch bind:checked={commentReason}>
          {$t('moderation.removeSubmission.withReason')}
        </Switch>

        {#if commentReason}
          <MultiSelect
            options={[false, true]}
            optionNames={[
              $t('moderation.removeSubmission.comment'),
              $t('moderation.removeSubmission.message'),
            ]}
            bind:selected={privateMessage}
          />
          <MarkdownEditor
            bind:value={replyReason}
            placeholder={replyReason}
            rows={3}
          >
            {#snippet customLabel()}
              <div class="flex justify-between items-end mb-1">
                {$t('comment.reply')}
                <Select bind:value={preset} placeholder="No preset">
                  {#each settings.moderation.presets as preset}
                    <Option value={preset.content}>
                      {preset.title}
                    </Option>
                  {/each}
                </Select>
              </div>
            {/snippet}
          </MarkdownEditor>
        {/if}
      {/if}

      <Button
        color={purge ? 'danger' : 'primary'}
        size="lg"
        {loading}
        disabled={loading}
        submit
      >
        {#snippet prefix()}
          <Icon src={purge ? Fire : Trash} mini size="16" />
        {/snippet}
        {#if purge}
          {$t('admin.purge')}
        {:else}
          {removed ? $t('moderation.restore') : $t('moderation.remove')}
        {/if}
      </Button>
    </form>
  {/if}
</Modal>

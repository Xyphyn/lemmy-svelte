<script lang="ts">
  import Comment from '$lib/components/lemmy/comment/Comment.svelte'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import { Select, Switch, toast } from 'mono-svelte'
  import { getClient } from '$lib/lemmy.js'
  import { isCommentView, isPostView } from '$lib/lemmy/item.js'
  import type { CommentView, PostView } from 'lemmy-js-client'
  import { profile } from '$lib/auth.js'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { Fire, Icon, Trash } from 'svelte-hero-icons'
  import MultiSelect from '$lib/components/input/Switch.svelte'
  import { removalTemplate } from '$lib/components/lemmy/moderation/moderation.js'
  import { userSettings } from '$lib/settings.js'
  import { fullCommunityName } from '$lib/util.js'
  import { amMod, isAdmin } from './moderation'
  import { Button, Checkbox, Modal } from 'mono-svelte'
  import { t } from '$lib/translations'
  import { parseListBlock } from '$lib/prism'

  export let open: boolean
  export let item: PostView | CommentView | undefined = undefined
  export let purge: boolean = false

  let reason = ''
  let commentReason: boolean = false
  let privateMessage: boolean = false
  let loading = false
  let preset = $userSettings.moderation.presets[0]?.content ?? ''

  $: rules = getRules(item?.community.description ?? '')

  $: removed = item
    ? isCommentView(item)
      ? item.comment.removed
      : item.post.removed
    : false

  const getRules = (sidebar: string) => {
    const parsed = parseListBlock(sidebar)

    if (parsed?.name.toLowerCase().trim() == 'rules') {
      return parsed.items
    } else {
      return null
    }
  }

  const getReplyReason = (reason: string, preset: string) => {
    if (!item) return `no template`

    return removalTemplate(preset, {
      communityLink: `!${fullCommunityName(
        item!.community.name,
        item!.community.actor_id
      )}`,
      postTitle: item.post.name,
      reason: reason,
      username: item.creator.name,
    })
  }

  $: replyReason = commentReason ? getReplyReason(reason, preset) : ''

  async function remove() {
    if (!item) return
    if (!$profile?.jwt) throw new Error('Unauthenticated')

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
    replyReason = ''
    commentReason = false
  }

  $: {
    if (item) {
      resetText()
    }
  }
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
      on:submit|preventDefault={remove}
      class="flex flex-col gap-4 list-none"
    >
      {#if isCommentView(item)}
        <Comment
          node={{
            children: [],
            comment_view: item,
            depth: 1,
            ui: {},
          }}
          postId={item.post.id}
          actions={false}
        />
      {:else if isPostView(item)}
        <Post actions={false} post={item} />
      {/if}

      <MarkdownEditor rows={3} bind:value={reason}>
        <div slot="label" class="flex flex-row justify-between pb-1 items-end">
          {$t('moderation.reason')}
          {#if rules}
            <Select
              placeholder={$t('moderation.rulePreset')}
              bind:value={reason}
            >
              {#each rules as rule}
                <option value={rule.value}>
                  {$t('moderation.ruleNumber', {
                    // @ts-ignore
                    ruleNumber: rule.key,
                  })}
                </option>
              {/each}
            </Select>
          {/if}
        </div>
      </MarkdownEditor>

      {#if !removed && $profile?.user && (amMod($profile.user, item.community) || (isAdmin($profile.user) && item.community.local))}
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
            <div class="flex justify-between items-end mb-1" slot="label">
              {$t('comment.reply')}
              <Select bind:value={preset} placeholder="No preset">
                {#each $userSettings.moderation.presets as preset}
                  <option value={preset.content}>
                    {preset.title}
                  </option>
                {/each}
              </Select>
            </div>
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
        <Icon src={purge ? Fire : Trash} mini size="16" slot="prefix" />
        {#if purge}
          {$t('admin.purge')}
        {:else}
          {removed ? $t('moderation.restore') : $t('moderation.remove')}
        {/if}
      </Button>
    </form>
  {/if}
</Modal>

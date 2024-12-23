<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import Comment from '$lib/components/lemmy/comment/Comment.svelte'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import { toast } from 'mono-svelte'
  import { getClient } from '$lib/lemmy.js'
  import type {
    CommentView,
    PostView,
    PrivateMessageView,
  } from 'lemmy-js-client'
  import { profile } from '$lib/auth.svelte.js'
  import { Button, Modal } from 'mono-svelte'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { onMount } from 'svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { t } from '$lib/translations'
  import PrivateMessage from '../inbox/PrivateMessage.svelte'

  interface Props {
    open: boolean
    item?: PostView | CommentView | PrivateMessageView | undefined
  }

  let { open = $bindable(), item = $bindable() }: Props = $props()

  const isComment = (
    item: PostView | CommentView | PrivateMessageView,
  ): item is CommentView => 'comment' in item

  const isPost = (
    item: PostView | CommentView | PrivateMessageView,
  ): item is PostView => !isComment(item) && 'post' in item

  const isPrivateMessage = (
    item: PostView | CommentView | PrivateMessageView,
  ): item is PrivateMessageView => !isComment(item) && 'private_message' in item

  let loading = $state(false)
  let reason = $state('')

  async function report() {
    if (!item || !$profile?.jwt || reason == '') return
    loading = true

    try {
      if (isComment(item)) {
        await getClient().createCommentReport({
          comment_id: item.comment.id,
          reason: reason,
        })
      } else if (isPost(item)) {
        await getClient().createPostReport({
          post_id: item.post.id,
          reason: reason,
        })
      } else if (isPrivateMessage(item)) {
        await getClient().createPrivateMessageReport({
          private_message_id: item.private_message.id,
          reason: reason,
        })
      }
      open = false
      toast({
        content: $t('moderation.reportModal.success'),
        type: 'success',
      })
    } catch (err) {
      toast({ content: err as any, type: 'error' })
    }

    loading = false
  }

  const resetText = () => (reason = '')

  run(() => {
    if (item) {
      resetText()
    }
  })
</script>

<Modal bind:open title={$t('moderation.reportModal.title')}>
  <form class="flex flex-col gap-4" onsubmit={preventDefault(report)}>
    {#if item}
      <div class="pointer-events-none list-none">
        {#if isComment(item)}
          <Comment
            actions={false}
            node={{
              children: [],
              comment_view: item,
              depth: 1,
              loading: false,
            }}
            postId={item.post.id}
          />
        {:else if isPost(item)}
          <Post actions={false} post={item} />
        {:else}
          <PrivateMessage message={item} />
        {/if}
      </div>
    {/if}
    <MarkdownEditor
      required
      rows={4}
      label={$t('moderation.reason')}
      bind:value={reason}
    />
    <Button submit {loading} disabled={loading} color="primary" size="lg">
      {$t('form.submit')}
    </Button>
  </form>
</Modal>

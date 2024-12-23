<script lang="ts">
  import type { CommentResponse } from 'lemmy-js-client'
  import { getClient } from '$lib/lemmy.js'
  import { createEventDispatcher } from 'svelte'
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { toast } from 'mono-svelte'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { placeholders } from '$lib/util.svelte.js'
  import { Button } from 'mono-svelte'
  import { t } from '$lib/translations'
  import { errorMessage } from '$lib/lemmy/error'
  import { Icon, XMark } from 'svelte-hero-icons'

  const dispatch = createEventDispatcher<{
    comment: CommentResponse
    confirm: string
    cancel: boolean
  }>()

  interface Props {
    postId: number
    parentId?: number | undefined
    locked?: boolean
    banned?: boolean
    rows?: number
    placeholder?: string | undefined
    value?: string
    actions?: boolean
    preview?: boolean
    [key: string]: any
  }

  let {
    postId,
    parentId = undefined,
    locked = false,
    banned = false,
    rows = 7,
    placeholder = undefined,
    value = $bindable(''),
    actions = true,
    preview: previewAction = true,
    ...rest
  }: Props = $props()

  let loading = $state(false)
  let preview = false

  async function submit() {
    if (!$profile?.user || !$profile?.jwt || value == '') return

    loading = true

    try {
      const response = await getClient().createComment({
        content: value,
        post_id: postId,
        parent_id: parentId,
      })
      dispatch('comment', response)

      value = ''
    } catch (err) {
      console.error(err)
      toast({
        content: errorMessage(err as any),
        type: 'error',
      })
    }

    loading = false
  }
</script>

<div class="flex flex-col gap-2 relative">
  {#if preview}
    <div
      class="bg-slate-100 dark:bg-zinc-900 px-3 py-2.5 h-64 border
      border-slate-300 dark:border-zinc-700 rounded-md overflow-auto text-sm resize-y"
    >
      <Markdown source={value} />
    </div>
  {:else}
    <MarkdownEditor
      {...rest}
      {rows}
      placeholder={locked
        ? $t('comment.locked')
        : banned
          ? $t('comment.banned')
          : (placeholder ?? placeholders.get('comment'))}
      bind:value
      disabled={locked || loading || banned}
      on:confirm={() => {
        if (actions) {
          submit()
          dispatch('confirm', value)
        }
      }}
      on:focus
      previewButton={previewAction}
    >
      <div class="flex-1"></div>
      {#if actions}
        <Button
          size="custom"
          title={$t('common.cancel')}
          onclick={() => dispatch('cancel', true)}
          color="tertiary"
          class="w-8 h-8"
          rounding="xl"
        >
          <Icon src={XMark} size="16" micro />
        </Button>
        <Button
          onclick={submit}
          color="primary"
          {loading}
          disabled={locked || loading || banned}
          size="lg"
        >
          {$t('form.submit')}
        </Button>
      {/if}
    </MarkdownEditor>
  {/if}
</div>

<script lang="ts">
  import type { CommentResponse } from 'lemmy-js-client'
  import { getClient, site } from '$lib/lemmy.svelte.js'
  import { createEventDispatcher } from 'svelte'
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { Menu, Select, Spinner, toast, Option, MenuButton } from 'mono-svelte'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { placeholders } from '$lib/util.svelte.js'
  import { Button } from 'mono-svelte'
  import { t } from '$lib/translations'
  import { errorMessage } from '$lib/lemmy/error'
  import { ArrowUp, Icon, Language, XMark } from 'svelte-hero-icons'

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
    oncomment?: (comment: CommentResponse) => void
    onconfirm?: (value: string) => void
    oncancel?: (cancel: boolean) => void
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
    oncancel,
    oncomment,
    onconfirm,
    ...rest
  }: Props = $props()

  let loading = $state(false)
  let preview = false
  let language: number | undefined = $state()

  async function submit() {
    if (!profile.data?.user || !profile.data?.jwt || value == '') return

    loading = true

    try {
      const response = await getClient().createComment({
        content: value,
        post_id: postId,
        parent_id: parentId,
      })
      oncomment?.(response)

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
      onconfirm={() => {
        if (actions) {
          submit()
          onconfirm?.(value)
        }
      }}
      previewButton={previewAction}
    >
      <Menu>
        {#snippet target()}
          <Button
            size="custom"
            class="w-9 h-9"
            rounding="pill"
            color={language != undefined ? 'primary' : 'ghost'}
            title={$t('form.profile.languages.title')}
          >
            <Icon src={Language} size="16" micro />
          </Button>
        {/snippet}

        {#if site.data}
          <MenuButton
            class="min-h-[16px] py-0"
            onclick={() => (language = undefined)}
          >
            <Icon src={XMark} size="16" micro />
            {$t('form.post.unset')}
          </MenuButton>
          {#each site.data?.all_languages as languageOption}
            <MenuButton
              class="min-h-[16px] py-0"
              onclick={() => {
                language = languageOption.id
              }}
            >
              {languageOption.name}
            </MenuButton>
          {/each}
        {/if}
      </Menu>
      <div class="flex-1"></div>
      {#if actions}
        <Button
          size="custom"
          title={$t('common.cancel')}
          onclick={() => oncancel?.(true)}
          color="tertiary"
          class="w-8 h-8"
          rounding="pill"
        >
          <Icon
            src={XMark}
            size="20"
            micro
            class="text-slate-600 dark:text-zinc-400"
          />
        </Button>
        <Button
          onclick={submit}
          color="primary"
          rounding="pill"
          size="custom"
          class="w-9 h-9"
          title={$t('form.submit')}
          {loading}
          disabled={locked || loading || banned}
        >
          {#snippet prefix()}
            <Icon src={ArrowUp} size="18" micro />
          {/snippet}
        </Button>
      {/if}
    </MarkdownEditor>
  {/if}
</div>

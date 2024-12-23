<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { client, site } from '$lib/lemmy.js'
  import type { Community, Post, PostView } from 'lemmy-js-client'
  import { Select, Spinner, Switch, toast } from 'mono-svelte'
  import {
    Icon,
    Photo,
    ArrowPath,
    Sparkles,
    ChatBubbleBottomCenterText,
    Plus,
    Language,
    Link,
    XMark,
  } from 'svelte-hero-icons'
  import { profile } from '$lib/auth.svelte.js'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { placeholders, uploadImage } from '$lib/util.svelte.js'
  import { Checkbox, TextInput } from 'mono-svelte'
  import { getSessionStorage, setSessionStorage } from '$lib/session.js'
  import ObjectAutocomplete from '$lib/components/lemmy/ObjectAutocomplete.svelte'
  import { Button } from 'mono-svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { t } from '$lib/translations'
  import { slide } from 'svelte/transition'
  import { feature } from '$lib/version'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import ErrorContainer, {
    clearErrorScope,
    pushError,
  } from '$lib/components/error/ErrorContainer.svelte'
  import { errorMessage } from '$lib/lemmy/error'
  import FreeTextInput from '$lib/components/input/FreeTextInput.svelte'

  interface Props {
    edit?: boolean
    /**
     * The post to edit
     */
    editingPost?: Post | undefined
    passedCommunity?: Community | undefined
    data?: {
      community: Community | null
      title: string
      body: string
      image: FileList | null
      thumbnail?: string
      url?: string
      nsfw: boolean
      loading: boolean
      alt_text?: string
      language_id?: number | string
    }
    formtitle?: import('svelte').Snippet
  }

  let {
    edit = false,
    editingPost = undefined,
    passedCommunity = undefined,
    data = $bindable({
      community: null,
      title: '',
      body: '',
      image: null,
      thumbnail: undefined,
      url: undefined,
      nsfw: false,
      loading: false,
      alt_text: undefined,
      language_id: undefined,
    }),
    formtitle,
  }: Props = $props()
  // weird select menu language handling
  // @ts-ignore
  run(() => {
    if (data.language_id === '') data.language_id = undefined
  })

  let saveDraft = edit ? false : true
  let communitySearch = $state(passedCommunity?.name ?? '')

  let communities: Community[] = $state([])

  const dispatcher = createEventDispatcher<{ submit: PostView }>()

  onMount(async () => {
    if (editingPost) {
      data.url = editingPost.url ?? ''
      data.body = editingPost.body ?? ''
      data.title = editingPost.name
      data.nsfw = editingPost.nsfw
      data.alt_text = editingPost.alt_text
      data.thumbnail = editingPost.thumbnail_url
      // @ts-ignore
      data.language_id = editingPost.language_id.toString()
    }

    if (passedCommunity) {
      data.community = passedCommunity
      communitySearch = passedCommunity.name
      console.log(communitySearch)
    } else {
      const list = await client().listCommunities({
        type_: 'All',
        sort: 'Active',
        limit: 40,
      })

      communities = list.communities.map((c) => c.community)
    }
  })

  onDestroy(() => {
    // @ts-ignore
    if (saveDraft) setSessionStorage('postDraft', data)
  })

  async function submit() {
    clearErrorScope('post-form')
    if (!data.community && !edit) {
      pushError({
        message: $t('toast.needCommunity'),
        scope: 'post-form',
      })
      return
    }
    if (!data.title || !$profile?.jwt) return
    if (data.url && data.url != '') {
      try {
        new URL(data.url)
      } catch (err) {
        pushError({
          message: $t('toast.invalidURL'),
          scope: 'post-form',
        })
        return
      }
    }

    data.loading = true

    try {
      if (edit) {
        if (!editingPost) {
          throw new Error('Post is being edited but editingPost is null')
        }

        const post = await client().editPost({
          name: data.title,
          body: data.body,
          url: data.url || undefined,
          post_id: editingPost.id,
          nsfw: data.nsfw,
          alt_text: data.alt_text,
          custom_thumbnail: data.thumbnail,
          language_id: data.language_id ? Number(data.language_id) : undefined,
        })

        if (!post) throw new Error('Failed to edit post')

        console.log(`Edited post ${post?.post_view.post.id}`)

        dispatcher('submit', post.post_view)
      } else {
        const post = await client().createPost({
          community_id: data.community!.id,
          name: data.title,
          body: data.body,
          url: data.url || undefined,
          nsfw: data.nsfw,
          custom_thumbnail: data.thumbnail,
          alt_text: data.alt_text,
          language_id: data.language_id ? Number(data.language_id) : undefined,
        })

        if (!post) throw new Error('Failed to upload post')

        console.log(`Uploaded post ${post?.post_view.post.id}`)

        saveDraft = false
        dispatcher('submit', post.post_view)
      }
    } catch (err) {
      pushError({ message: errorMessage(err as any), scope: 'post-form' })
      data.loading = false
    }
  }

  let uploadingImage = $state(false)

  const generateTitle = async (url: string | undefined) => {
    if (!url) return
    generation.loading = true
    try {
      const res = await client().getSiteMetadata({
        url: url,
      })

      // for backup
      const oldData = { ...data }

      if (res.metadata.title) data.title = res.metadata.title
      if (res.metadata.description)
        data.body = res.metadata.description
          .split('\n')
          .map((l) => `> ${l}`)
          .join('\n')

      toast({
        content: $t('toast.generatedTitle'),
        type: 'info',
        action: () => (data = oldData),
        duration: 15 * 1000,
      })
    } catch (e) {
      pushError({
        message: $t('toast.failGenerateTitle'),
        scope: 'post-form',
      })
    }
    generation.loading = false
  }

  const canGenerateTitle = (url: string | undefined) => {
    if (!url) return false
    try {
      new URL(url)
    } catch (e) {
      return false
    }
    return true
  }

  let generation = $state({
    loading: false,
    generatable: false,
    title: '',
  })

  let addAltText = $state(false)

  run(() => {
    generation.generatable = canGenerateTitle(data.url)
  })
</script>

{#if uploadingImage}
  {#await import('$lib/components/lemmy/modal/ImageUploadModal.svelte') then { default: UploadModal }}
    <UploadModal
      bind:open={uploadingImage}
      multiple={false}
      on:upload={(e) => {
        if (e.detail) data.url = e.detail[0]
        uploadingImage = false
      }}
    />
  {/await}
{/if}

<form onsubmit={preventDefault(submit)} class="flex flex-col gap-4 h-full">
  {#if formtitle}{@render formtitle()}{:else}
    <Header class="font-bold text-xl">
      {edit ? $t('form.post.edit') : $t('form.post.create')}
    </Header>
  {/if}
  <ErrorContainer scope="post-form" />
  {#if !edit && data}
    {#if !data.community}
      <ObjectAutocomplete
        bind:q={communitySearch}
        items={communities}
        jwt={$profile?.jwt}
        listing_type="All"
        label={$t('form.post.community')}
        required
        on:select={(e) => {
          const c = e.detail
          if (!c) {
            data.community = null
            return
          }

          communitySearch = ''

          data.community = c
        }}
      />
    {:else}
      <div class="flex flex-col gap-1">
        <span class="font-medium text-sm">{$t('form.post.community')}</span>
        <Button
          class="w-full !bg-white dark:!bg-black h-[38px]"
          onclick={() => (data.community = null)}
          alignment="left"
          size="sm"
        >
          {#snippet prefix()}
            <Avatar
              url={data?.community?.icon}
              alt={data.community?.name}
              width={24}
            />
          {/snippet}
          <div class="flex flex-col gap-0">
            <span class="text-xs">{data.community.name}</span>
            <span class="text-[10px] leading-3">
              {new URL(data.community.actor_id).hostname}
            </span>
          </div>
        </Button>
      </div>
    {/if}
  {/if}
  <FreeTextInput
    type="text"
    required
    bind:value={data.title}
    placeholder={placeholders.get('post')}
    label={$t('form.post.title')}
  />
  <MarkdownEditor
    label={$t('form.post.body')}
    bind:value={data.body}
    placeholder={placeholders.get('post')}
    previewButton
  />
  {#if data.url !== undefined}
    <div class="flex flex-col gap-2">
      <TextInput
        label={$t('form.post.url')}
        bind:value={data.url}
        placeholder={placeholders.get('url')}
        class="w-full"
      />
      <div class="flex items-center gap-2 actions">
        <div
          class="border border-slate-100 rounded-xl h-6 w-6 grid place-items-center"
        >
          {#snippet prefix()}
            <Icon src={Plus} size="16" micro />
          {/snippet}
        </div>
        {#if data.url}
          <Button
            onclick={() => (addAltText = !addAltText)}
            rounding="pill"
            size="sm"
            color="ghost"
            class="text-xs"
          >
            {#snippet prefix()}
              <Icon src={ChatBubbleBottomCenterText} size="15" micro />
            {/snippet}{$t('form.post.altText')}
          </Button>
        {/if}
        <Button
          onclick={() => (uploadingImage = !uploadingImage)}
          rounding="pill"
          size="sm"
          color="ghost"
          class="text-xs"
        >
          {#snippet prefix()}
            <Icon src={Photo} size="15" micro />
          {/snippet}
          {$t('form.post.uploadImage')}
        </Button>
        {#if generation.generatable}
          <Button
            onclick={() => generateTitle(data.url)}
            loading={generation.loading}
            rounding="pill"
            size="sm"
            color="ghost"
            class="text-xs"
          >
            {#snippet prefix()}
              <Icon src={Sparkles} size="15" micro />
            {/snippet}
            {$t('form.post.generateTitle')}
          </Button>
        {/if}
      </div>
    </div>
  {/if}
  <div class="flex flex-row gap-2 flex-wrap">
    {#if data.url === undefined}
      <Button
        onclick={async () => {
          data.url = ''
          try {
            const url = new URL(await navigator.clipboard.readText())

            data.url = url.toString()
          } catch (e) {}
        }}
        size="sm"
        rounding="pill"
      >
        <Icon src={Link} size="16" micro />
        {$t('form.post.addUrl')}
      </Button>
      <Button
        onclick={() => {
          data.url = ''
          uploadingImage = true
        }}
        size="sm"
        rounding="pill"
      >
        <Icon src={Photo} size="16" micro />
        {$t('form.post.uploadImage')}
      </Button>
    {/if}
    {#if data.language_id === undefined}
      <Button size="sm" rounding="pill" onclick={() => (data.language_id = 0)}>
        <Icon src={Language} size="16" micro />
        {$t('form.post.setLanguage')}
      </Button>
    {/if}
  </div>
  {#if addAltText}
    <div transition:slide={{ axis: 'y', duration: 150 }} class="w-full">
      <TextInput label={$t('form.post.altText')} bind:value={data.alt_text} />
    </div>
  {/if}
  <Switch bind:checked={data.nsfw}>{$t('form.post.nsfw')}</Switch>
  {#if data.language_id !== undefined}
    {#if $site}
      <Select
        class="w-max"
        label={$t('settings.app.lang.title')}
        bind:value={data.language_id}
      >
        <option value={undefined}>
          <Icon src={XMark} size="16" micro />
          {$t('form.post.unset')}
        </option>
        {#each $site?.all_languages as language}
          <option value={language.id.toString()}>{language.name}</option>
        {/each}
      </Select>
    {:else}
      <div style="height: 58px;">
        <Spinner width={24} />
      </div>
    {/if}
  {/if}
  <div class="mt-auto"></div>
  <div class="flex flex-row items-center gap-2 w-full">
    <Button
      submit
      color="primary"
      loading={data.loading}
      size="lg"
      disabled={data.loading}
      class="flex-1"
    >
      {$t('form.submit')}
    </Button>

    {#if !edit}
      <Button
        onclick={() => {
          toast({ content: $t('toast.restoredFromDraft') })
          const draft = getSessionStorage('postDraft')
          if (draft && !edit) {
            // @ts-ignore
            draft.loading = false
            // @ts-ignore
            data = draft
          }
        }}
        rounding="xl"
        size="custom"
        disabled={!getSessionStorage('postDraft')}
        title="Restore From Draft"
        class=" aspect-square h-full"
      >
        <Icon src={ArrowPath} size="16" mini />
      </Button>
    {/if}
  </div>
</form>

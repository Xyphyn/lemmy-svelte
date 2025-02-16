<script lang="ts">
  import { goto } from '$app/navigation'
  import PostForm from '$lib/components/lemmy/post/form/PostForm.svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { onDestroy, onMount } from 'svelte'
  import { getSessionStorage, setSessionStorage } from '$lib/session.js'
  import { t } from '$lib/translations.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'

  let { data } = $props()

  onMount(() => {
    if (!profile.data?.jwt) {
      goto('/login')
    }
  })

  let community = getSessionStorage('lastSeenCommunity') as
    | { id: number; name: string }
    | undefined

  onDestroy(() => {
    setSessionStorage('lastSeenCommunity', undefined)
  })

  let post = getSessionStorage('postDraft') as any
</script>

<svelte:head>
  <title>{$t('form.post.create')}</title>
</svelte:head>

<div class="w-full max-w-5xl mx-auto h-full">
  <PostForm
    passedData={data.crosspost == true
      ? post
      : {
          body: '',
          community: null,
          image: null,
          loading: false,
          nsfw: false,
          title: '',
          url: undefined,
        }}
    passedCommunity={community}
    onsubmit={(e) => goto(`/post/${e.post.id}`)}
  >
    {#snippet formtitle()}
      <Header class="text-3xl font-bold" pageHeader>
        {$t('routes.createPost')}
      </Header>
    {/snippet}
  </PostForm>
</div>

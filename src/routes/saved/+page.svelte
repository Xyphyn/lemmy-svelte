<script lang="ts">
  import { run } from 'svelte/legacy'

  import type { CommentView, PostView } from 'lemmy-js-client'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import { fly } from 'svelte/transition'
  import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
  import { settings } from '$lib/settings.svelte.js'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import { searchParam } from '$lib/util.svelte.js'
  import { page } from '$app/stores'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { Bookmark } from 'svelte-hero-icons'
  import { t } from '$lib/translations.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import Tabs from '$lib/components/ui/layout/pages/Tabs.svelte'
  import { contentPadding } from '$lib/components/ui/layout/Shell.svelte'
  import { Select } from 'mono-svelte'
  import {
    Icon,
    Bars3,
    PencilSquare,
    ChatBubbleOvalLeft,
    AdjustmentsHorizontal,
  } from 'svelte-hero-icons'

  let { data } = $props()

  let type = $state(data.type)!

  const isComment = (item: CommentView | PostView): item is CommentView =>
    'comment' in item
</script>

<svelte:head>
  <title>{$t('routes.saved')}</title>
</svelte:head>

<Header pageHeader>
  {$t('routes.saved')}

  {#snippet extended()}
    <div class="flex items-center">
      <Select
        bind:value={type}
        on:change={() => searchParam($page.url, 'type', type, 'page')}
      >
        {#snippet customLabel()}
          <div class="flex items-center gap-0.5">
            <Icon src={AdjustmentsHorizontal} size="15" mini />
            {$t('filter.filter')}
          </div>
        {/snippet}
        <option value="all">
          <Icon src={Bars3} micro size="15" />
          {$t('content.all')}
        </option>
        <option value="posts">
          <Icon src={PencilSquare} micro size="15" />
          {$t('content.posts')}
        </option>
        <option value="comments">
          <Icon src={ChatBubbleOvalLeft} micro size="15" />
          {$t('content.comments')}
        </option>
      </Select>
    </div>
  {/snippet}
</Header>
<div
  class="flex flex-col list-none my-4 divide-slate-200 dark:divide-zinc-800"
  class:gap-4={settings.view == 'card'}
  class:!divide-y={settings.view != 'card'}
>
  {#if !data.data || (data.data?.length ?? 0) == 0}
    <Placeholder
      icon={Bookmark}
      title="No saved items"
      description="Save posts or comments, and they'll be here to refer to them later."
    />
  {:else}
    {#each data.data as item, index}
      <div in:fly={{ opacity: 0, y: -4, delay: index * 50 }}>
        {#if isComment(item)}
          <CommentItem comment={item} />
        {:else}
          <Post post={item} />
        {/if}
      </div>
    {/each}
  {/if}
</div>
<div
  class="sticky z-30 mx-auto max-w-full"
  style="bottom: max(1.5rem, {$contentPadding.bottom}px);"
>
  <Tabs routes={[]} class="mx-auto">
    <Pageination
      on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
      page={data.page}
    />
  </Tabs>
</div>

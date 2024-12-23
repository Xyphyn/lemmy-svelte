<script lang="ts">
  import { page } from '$app/stores'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import Sort from '$lib/components/lemmy/dropdowns/Sort.svelte'
  import ViewSelect from '$lib/components/lemmy/dropdowns/ViewSelect.svelte'
  import { searchParam } from '$lib/util.svelte.js'
  import { ChartBar, Icon } from 'svelte-hero-icons'
  import { site } from '$lib/lemmy.js'
  import Location from '$lib/components/lemmy/dropdowns/Location.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { t } from '$lib/translations.js'
  import { settings } from '$lib/settings.svelte.js'
  import { browser } from '$app/environment'
  import VirtualFeed from '$lib/components/lemmy/post/feed/VirtualFeed.svelte'
  import PostFeed from '$lib/components/lemmy/post/feed/PostFeed.svelte'
  import type { ListingType } from 'lemmy-js-client'
  import { get } from 'svelte/store'

  let { data = $bindable() } = $props()

  let type = $state(data.type_)
  let sort = $state(data.sort)

  $effect(() => {
    if (type) settings.defaultSort.feed = type
    if (sort) settings.defaultSort.sort = sort
  })

  const FeedComponent = $derived(
    settings.infiniteScroll && browser && !settings.posts.noVirtualize
      ? VirtualFeed
      : PostFeed,
  )
</script>

<div class="flex flex-col gap-2 max-w-full w-full min-w-0">
  <header class="flex flex-col gap-4 relative">
    <Header pageHeader>
      {$t('routes.frontpage.title')}

      {#snippet extended()}
        <div class="flex items-center gap-2">
          {#if type}
            <Location navigate bind:selected={type} />
          {/if}
          <Sort navigate bind:selected={sort} />
          <ViewSelect />
        </div>
      {/snippet}
    </Header>
  </header>

  <FeedComponent posts={data.posts.posts} feedData={data} feedId="main" />
  <svelte:element
    this={settings.infiniteScroll && !settings.posts.noVirtualize
      ? 'noscript'
      : 'div'}
    class="mt-auto"
  >
    <Pageination
      cursor={{ next: data.cursor.next }}
      on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
      on:cursor={(c) => {
        searchParam($page.url, 'cursor', c.detail)
      }}
    >
      <span class="flex flex-row items-center gap-1">
        <Icon src={ChartBar} size="16" mini />
        {$t('routes.frontpage.footer', {
          // @ts-ignore
          users: $site?.site_view?.counts?.users_active_day ?? '??',
        })}
      </span>
    </Pageination>
  </svelte:element>
</div>

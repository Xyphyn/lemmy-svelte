<script lang="ts">
  import { page } from '$app/state'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import Sort from '$lib/components/lemmy/dropdowns/Sort.svelte'
  import ViewSelect from '$lib/components/lemmy/dropdowns/ViewSelect.svelte'
  import { searchParam } from '$lib/util.svelte.js'
  import { ArrowRight, ChartBar, Icon } from 'svelte-hero-icons'
  import { site } from '$lib/lemmy.svelte.js'
  import Location from '$lib/components/lemmy/dropdowns/Location.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { t } from '$lib/translations.js'
  import { settings } from '$lib/settings.svelte.js'
  import { browser } from '$app/environment'
  import VirtualFeed from '$lib/components/lemmy/post/feed/VirtualFeed.svelte'
  import PostFeed from '$lib/components/lemmy/post/feed/PostFeed.svelte'
  import type { ListingType } from 'lemmy-js-client'
  import { get } from 'svelte/store'
  import Button from 'mono-svelte/button/Button.svelte'

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
        <form class="flex items-center gap-2" method="get" action="/">
          {#if type}
            <Location name="type" navigate bind:selected={type} />
          {/if}
          <Sort name="sort" navigate bind:selected={sort} />
          <ViewSelect />

          <noscript>
            <Button
              class="self-end h-[34px] aspect-square"
              size="custom"
              submit
            >
              <Icon src={ArrowRight} size="16" micro />
            </Button>
          </noscript>
        </form>
      {/snippet}
    </Header>
  </header>

  <FeedComponent bind:posts={data.posts.posts} feedData={data} feedId="main" />
  <svelte:element
    this={settings.infiniteScroll && !settings.posts.noVirtualize
      ? 'noscript'
      : 'div'}
    class="mt-auto"
  >
    <Pageination
      cursor={{ next: data.cursor.next }}
      href={(page) =>
        typeof page == 'number' ? `?page=${page}` : `?cursor=${page}`}
    >
      <span class="flex flex-row items-center gap-1">
        <Icon src={ChartBar} size="16" mini />
        {$t('routes.frontpage.footer', {
          // @ts-ignore
          users: site.data?.site_view?.counts?.users_active_day ?? '??',
        })}
      </span>
    </Pageination>
  </svelte:element>
</div>

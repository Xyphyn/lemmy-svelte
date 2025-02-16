<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { navigating, page } from '$app/state'
  import {
    GlobeAmericas,
    Icon,
    InformationCircle,
    MagnifyingGlass,
    QuestionMarkCircle,
  } from 'svelte-hero-icons'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import { searchParam } from '$lib/util.svelte.js'
  import {
    Button,
    Material,
    Popover,
    Select,
    Spinner,
    TextInput,
  } from 'mono-svelte'
  import Sort from '$lib/components/lemmy/dropdowns/Sort.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import CommunityItem from '$lib/components/lemmy/community/CommunityItem.svelte'
  import Location from '$lib/components/lemmy/dropdowns/Location.svelte'
  import { t } from '$lib/translations.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import Tabs from '$lib/components/ui/layout/pages/Tabs.svelte'
  import { contentPadding } from '$lib/components/ui/layout/Shell.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
  import { fly } from 'svelte/transition'
  import { backOut, expoOut } from 'svelte/easing'
  import { goto } from '$app/navigation'
  import Skeleton from '$lib/components/ui/generic/Skeleton.svelte'

  let { data } = $props()

  let communities = $state(data.communities)
  $effect(() => {
    communities = data.communities
  })

  let search = $state(data.query || '')
  let searchElement = $state<HTMLInputElement>()
  let form = $state<HTMLFormElement>()

  let showTop = $derived(
    (data.query ?? '' != '') && data.communities.length > 0 && data.page == 1,
  )
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.target == document.body) searchElement?.focus()
  }}
/>

<svelte:head>
  <title>{$t('routes.communities.title')}</title>
</svelte:head>

<Header pageHeader class="justify-between">
  <span>{$t('routes.communities.title')}</span>
</Header>

<form method="get" action="/communities" class="contents" bind:this={form}>
  <div
    class="mt-4 mb-0 sticky z-30"
    style="top: max(1.5rem, {$contentPadding.top}px);"
  >
    <Tabs routes={[]} class="p-2 dark:bg-zinc-925/70 shadow-md shadow-black/5">
      <div class="flex gap-2 flex-row items-center w-full text-base h-10">
        <TextInput
          bind:value={search}
          bind:element={searchElement}
          name="q"
          aria-label={$t('routes.search.query')}
          size="lg"
          class="flex-1 !rounded-full h-full"
          placeholder={$t('routes.communities.search.placeholder')}
        />
        <Button
          submit
          color="primary"
          size="custom"
          class="flex-shrink-0 h-full aspect-square"
          title="Search"
          rounding="pill"
          loading={navigating.to != null}
        >
          {#snippet prefix()}
            <Icon src={MagnifyingGlass} size="16" micro />
          {/snippet}
        </Button>
      </div>
    </Tabs>
  </div>
  <div class="flex flex-row flex-wrap gap-4 mt-4 items-center">
    <Location
      name="type"
      selected={data.type}
      onchange={() => form?.requestSubmit()}
    />
    <Sort
      name="sort"
      selected={data.sort}
      onchange={() => form?.requestSubmit()}
    />
  </div>
</form>
{#if navigating.to?.route.id == '/communities'}
  <div class="flex flex-col gap-3 mt-6">
    {#each new Array(5) as _, index}
      <div
        in:fly|global={{
          duration: 800,
          easing: expoOut,
          y: 12,
          delay: index * 100,
        }}
        style="width: {(1 / ((index + 1) % 3)) * 100}%"
      >
        <Skeleton />
      </div>
    {/each}
  </div>
{:else}
  <ul
    class="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800 my-6 h-full"
  >
    {#if communities.length == 0}
      <Placeholder
        icon={QuestionMarkCircle}
        title={$t('routes.search.noResults.title')}
        description={$t('routes.search.noResults.description')}
      />
    {/if}

    {#if showTop}
      <SectionTitle class="!border-0 pb-2">
        {$t('routes.search.top')}
      </SectionTitle>
      <div
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-center mb-6 !border-0"
      >
        {#each communities.slice(0, 3) as community, index (community.community.id)}
          <div
            class="h-full"
            in:fly|global={{
              duration: 1000,
              easing: expoOut,
              delay: index < 20 ? index * 100 : 0,
              y: 16,
            }}
          >
            <Material
              color="distinct"
              padding="none"
              rounding="xl"
              class="dark:border-t-zinc-800 h-full"
            >
              <CommunityItem
                {community}
                showCounts={false}
                class="w-full p-4 text-center"
                view="cozy"
              />
            </Material>
          </div>
        {/each}
      </div>
    {/if}

    {#if communities.slice(showTop ? 3 : 0).length > 0}
      <SectionTitle class="!border-0 pb-2">
        {$t('routes.search.other')}
      </SectionTitle>
    {/if}
    {#if communities}
      {@const sliced = communities.slice(showTop ? 3 : 0)}
      <div class="-mx-4 sm:-mx-6 h-full">
        {#each sliced as community, index (community.community.id)}
          <div
            class="px-6 hover:bg-slate-50 hover:dark:bg-zinc-900 transition-colors @container
        border-b border-slate-100 dark:border-zinc-900"
            in:fly|global={{
              duration: 1000,
              easing: expoOut,
              delay: index < 20 ? index * 35 : 0,
              y: 16,
            }}
          >
            <CommunityItem {community} showCounts={false} class="py-3" />
          </div>
        {/each}
      </div>
    {/if}
  </ul>
{/if}
{#if communities.length > 0}
  <div
    class="sticky z-30 mx-auto max-w-full"
    style="bottom: max(1.5rem, {$contentPadding.bottom}px);"
  >
    <Tabs routes={[]} class="mx-auto">
      <Pageination
        page={Number(page.url.searchParams.get('page')) || 1}
        href={(c) => `?page=${c}`}
      />
    </Tabs>
  </div>
{/if}

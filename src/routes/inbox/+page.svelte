<script lang="ts">
  import InboxItem from './InboxItem.svelte'
  import {
    AdjustmentsHorizontal,
    ArrowPath,
    Bars3BottomRight,
    Check,
    Funnel,
    Icon,
    Inbox,
  } from 'svelte-hero-icons'
  import { getClient } from '$lib/lemmy.js'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import { notifications, profile } from '$lib/auth.svelte.js'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { fly } from 'svelte/transition'
  import { searchParam } from '$lib/util.svelte.js'
  import { Button, Select } from 'mono-svelte'
  import EndPlaceholder from '$lib/components/ui/EndPlaceholder.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { t } from '$lib/translations'
  import Tabs from '$lib/components/ui/layout/pages/Tabs.svelte'
  import { contentPadding } from '$lib/components/ui/layout/Shell.svelte'
  import { expoOut } from 'svelte/easing'

  let { data } = $props()

  let markingAsRead = $state(false)

  async function markAllAsRead() {
    if (!$profile?.user) {
      goto('/login')
      return
    }

    markingAsRead = true

    const response = await getClient().markAllAsRead()

    $notifications.inbox = 0

    goto($page.url, {
      invalidateAll: true,
    }).then(() => {
      markingAsRead = false
    })

    return response.replies
  }

  function addSearchParam(
    currentSearchParams: URLSearchParams,
    newParamString: string,
  ) {
    // Create a new URLSearchParams object from the current search params
    const updatedParams = new URLSearchParams(currentSearchParams)

    // Parse the new parameter string
    const newParam = new URLSearchParams(newParamString)

    // Get the key and value of the new parameter
    const [key, value]: [string, string] = newParam.entries().next().value!

    // Add the new parameter to the updated params
    updatedParams.set(key, value)

    return updatedParams
  }
</script>

<svelte:head>
  <title>{$t('routes.inbox.title')}</title>
</svelte:head>

<div class=" gap-2">
  <div
    class="mt-4 mb-0 sticky z-30 mx-auto max-w-full flex gap-2 md:flex-row flex-col
items-center px-2 w-max"
    style="top: max(1.5rem, {$contentPadding.top}px);"
  >
    <Tabs
      routes={[
        {
          href: '?type=all',
          name: $t('filter.location.all'),
        },
        {
          href: '?type=replies',
          name: $t('filter.inbox.replies'),
        },
        {
          href: '?type=mentions',
          name: $t('filter.inbox.mentions'),
        },
        {
          href: '/inbox/messages',
          name: $t('filter.inbox.messages'),
        },
      ]}
      currentRoute={$page.url.search}
      isSelected={(url, current, route, def) =>
        $page.url.search == route ||
        ($page.url.pathname == route && $page.url.search == '') ||
        $page.url.searchParams.toString().includes(route.slice(1)) ||
        ($page.url.search == '' && route == def)}
      class="overflow-auto w-full"
      buildUrl={(route, href) =>
        href.includes('?')
          ? '?' + addSearchParam($page.url.searchParams, href).toString()
          : `${href}${$page.url.search}`}
      defaultRoute="?type=All"
    />
    <Tabs
      routes={[
        {
          href: '?unreadOnly=false',
          name: $t('filter.location.all'),
        },
        {
          href: '?unreadOnly=true',
          name: $t('filter.unread'),
        },
      ]}
      isSelected={(url, current, route, def) =>
        $page.url.searchParams.toString().includes(route.slice(1)) ||
        ($page.url.search == '' && route == def)}
      buildUrl={(route, href) =>
        '?' + addSearchParam($page.url.searchParams, href).toString()}
      defaultRoute="?unreadOnly=true"
    />
  </div>
  <Header pageHeader class="sm:flex-row justify-between flex-col">
    {$t('routes.inbox.title')}

    <div class="flex items-center gap-2">
      <Button
        onclick={() => goto($page.url, { invalidateAll: true })}
        size="square-lg"
        rounding="xl"
        title={$t('common.refresh')}
      >
        {#snippet prefix()}
          <Icon src={ArrowPath} size="16" mini />
        {/snippet}
      </Button>
      <Button
        onclick={markAllAsRead}
        loading={markingAsRead}
        disabled={markingAsRead}
        size="lg"
        class="h-10"
      >
        {#snippet prefix()}
          <Icon src={Check} width={16} mini />
        {/snippet}
        {$t('routes.inbox.markAsRead')}
      </Button>
    </div>
  </Header>
</div>

<div
  class="flex flex-col list-none flex-1 h-full divide-y divide-slate-200 dark:divide-zinc-900 *:py-4"
>
  {#if !data.data || (data.data?.length ?? 0) == 0}
    <Placeholder
      icon={Inbox}
      title={$t('routes.inbox.empty.title')}
      description={$t('routes.inbox.empty.description')}
    />
  {:else}
    {#each data.data as item, index (item.id)}
      <div
        class="-mx-4 sm:-mx-6 px-4 sm:px-6
        {item.read ? '' : 'bg-yellow-50/50 dark:bg-blue-500/5'}"
        in:fly|global={{
          duration: 1000,
          y: 16,
          opacity: 0,
          easing: expoOut,
          delay: index * 50,
        }}
      >
        <InboxItem bind:item={data.data[index]} />
      </div>
    {/each}
  {/if}
  {#if !(data.page == 1 && (data?.data?.length ?? 0) == 0)}
    <div
      class="sticky z-30 mx-auto max-w-full self-end mt-auto"
      style="bottom: max(1.5rem, {$contentPadding.bottom}px);"
    >
      <Tabs routes={[]} class="mx-auto">
        <Pageination
          hasMore={!(!data.data || (data.data?.length ?? 0) < data.limit)}
          page={data.page}
          on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
        />
      </Tabs>
    </div>
  {/if}
</div>

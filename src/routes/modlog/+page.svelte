<script lang="ts">
  import { run } from 'svelte/legacy'

  import Pageination from '$lib/components/ui/Pageination.svelte'
  import { searchParam } from '$lib/util.svelte.js'
  import { page } from '$app/stores'
  import ObjectAutocomplete from '$lib/components/lemmy/ObjectAutocomplete.svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { settings } from '$lib/settings.svelte.js'
  import ModlogItemCard from './item/ModlogItemCard.svelte'
  import ModlogItemTable from './item/ModlogItemTable.svelte'
  import { Button, Select } from 'mono-svelte'
  import {
    Bars3BottomRight,
    Icon,
    MagnifyingGlass,
    ViewColumns,
    XMark,
  } from 'svelte-hero-icons'
  import UserAutocomplete from '$lib/components/lemmy/user/UserAutocomplete.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
  import { browser } from '$app/environment'

  let { data = $bindable() } = $props()

  let view = $state(
    `${
      (settings.modlogCardView ?? browser)
        ? !window.matchMedia('(min-width: 1600px)').matches
        : false
    }`,
  )

  run(() => {
    settings.modlogCardView =
      view == 'true' ? true : view == 'false' ? false : undefined
  })
</script>

<svelte:head>
  <title>Modlog</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <h1 class="font-bold text-2xl">Modlog</h1>
  <div class="flex flex-row flex-wrap gap-2">
    <Select
      bind:value={data.type}
      on:change={(e) => searchParam($page.url, 'type', data.type, 'page')}
      class="w-48"
    >
      {#snippet label()}
        <span class="flex gap-1 items-center">
          <Icon src={Bars3BottomRight} size="15" mini />
          Type
        </span>
      {/snippet}
      <option value="All">All</option>
      <option value="ModRemovePost">Remove Post</option>
      <option value="ModLockPost">Lock Post</option>
      <option value="ModFeaturePost">Feature Post</option>
      <option value="ModRemoveComment">Remove Comment</option>
      <option value="ModRemoveCommunity">Remove Community</option>
      <option value="ModBanFromCommunity">Ban From Community</option>
      <option value="ModAddCommunity">Add Moderator</option>
      <option value="ModTransferCommunity">Transfer Community</option>
      <option value="ModAdd">Add Admin</option>
      <option value="ModBan">Ban Admin</option>
      <option value="ModHideCommunity">Hide Community</option>
      <option value="AdminPurgePerson">Purge User</option>
      <option value="AdminPurgeCommunity">Purge Community</option>
      <option value="AdminPurgePost">Purge Post</option>
      <option value="AdminPurgeComment">Purge Comment</option>
    </Select>

    <Select bind:value={view} class="w-36">
      {#snippet label()}
        <span class="flex gap-1 items-center">
          <Icon src={ViewColumns} size="15" mini />
          View
        </span>
      {/snippet}
      <option value="false">Table</option>
      <option value="true">Cards</option>
      <option value="undefined">Default</option>
    </Select>
  </div>
  <div class="flex flex-col md:flex-row md:items-center gap-2 w-full">
    <ObjectAutocomplete
      type="instance"
      placeholder="Filter by instance"
      jwt={$profile?.jwt}
      showWhenEmpty={true}
      label="Instance"
      class="flex-1"
      q={$page.url.searchParams.get('instance') || ''}
      on:select={(e) =>
        searchParam(
          $page.url,
          'instance',
          e.detail?.domain.toString() ?? '',
          'page',
          'community',
          'user',
          'mod_id',
        )}
    />
    <ObjectAutocomplete
      placeholder="Filter by community"
      jwt={$profile?.jwt}
      listing_type="All"
      showWhenEmpty={true}
      label="Community"
      class="flex-1"
      q={$page.url.searchParams.get('community') ? 'Selected' : ''}
      on:select={(e) =>
        searchParam(
          $page.url,
          'community',
          e.detail?.id.toString() ?? '',
          'page',
        )}
    />
    <UserAutocomplete
      instance={$page.url.searchParams.get('instance') || undefined}
      placeholder="Filter by user"
      jwt={$profile?.jwt}
      listing_type="All"
      showWhenEmpty={true}
      class="flex-1"
      label="User"
      q={$page.url.searchParams.get('user')
        ? (data.filters.user ?? 'Selected')
        : ''}
      on:select={(e) =>
        searchParam($page.url, 'user', e.detail?.id.toString() ?? '', 'page')}
    />
    {#if $profile?.user && isAdmin($profile?.user)}
      <UserAutocomplete
        placeholder="Filter by moderator"
        jwt={$profile?.jwt}
        listing_type="All"
        showWhenEmpty={true}
        class="flex-1"
        label="Moderator"
        q={$page.url.searchParams.get('mod_id')
          ? (data.filters.moderator ?? 'Selected')
          : ''}
        on:select={(e) =>
          searchParam(
            $page.url,
            'mod_id',
            e.detail?.id.toString() ?? '',
            'page',
          )}
      />
    {/if}
    <Button
      onclick={() => {
        searchParam(
          $page.url,
          '',
          '',
          'user',
          'moderator',
          'community',
          'instance',
        )
      }}
      size="square-lg"
      class="self-end flex-shrink-0"
      title="Clear filters"
    >
      <Icon src={XMark} size="16" mini />
    </Button>
  </div>
  {#if data.modlog && data.modlog.length > 0}
    {#if settings.modlogCardView ?? !window.matchMedia('(min-width: 1600px)').matches}
      <div class="flex flex-col gap-4">
        {#each data.modlog as modlog}
          <ModlogItemCard item={modlog} />
        {/each}
      </div>
    {:else}
      <div style="width:100%; overflow-x: auto;">
        <table
          class="table overflow-x-auto table-fixed relative"
          style="min-width: 800px;"
        >
          <colgroup class="table-fixed">
            <col width="8%" />
            <col width="18%" />
            <col width="12%" class="overflow-x-auto" />
            <col width="8%" />
            <col width="10%" />
            <col width="18%" />
            <col width="20%" />
            <col width="20%" />
          </colgroup>
          <thead class="text-left sticky top-0">
            <tr class="rounded-t-lg overflow-hidden">
              <th>Time</th>
              <th>Moderator</th>
              <th>Action</th>
              <th>User</th>
              <th>Community</th>
              <th>Content</th>
              <th>Reason</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            {#each data.modlog as modlog}
              <ModlogItemTable item={modlog} />
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
    <Pageination
      page={data.page}
      on:change={(e) => searchParam($page.url, 'page', e.detail.toString())}
    />
  {:else}
    <Placeholder
      title="No results"
      description="There are no mod logs with that filter. Try refining your search."
      icon={MagnifyingGlass}
    />
  {/if}
</div>

<style lang="postcss">
  :global(.table thead tr th) {
    @apply border border-slate-200 dark:border-zinc-800 px-4 py-2 bg-slate-100;
  }

  :global(.table tr td) {
    @apply border border-slate-200 px-4 py-2 overflow-auto;
  }

  :global(.dark .table tr td) {
    @apply border-zinc-800;
  }

  :global(.dark thead tr th) {
    @apply border-zinc-800 bg-zinc-900;
  }
</style>

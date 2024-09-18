<script lang="ts">
  import { page } from '$app/stores'
  import { profile } from '$lib/auth'
  import { userSettings } from '$lib/settings'
  import { searchParam } from '$lib/util'
  import { Select } from 'mono-svelte'
  import {
    GlobeAmericas,
    Icon,
    MapPin,
    Newspaper,
    ShieldCheck,
  } from 'svelte-hero-icons'
  import { amModOfAny } from '../moderation/moderation'
  import { t } from '$lib/translations'

  export let selected: string
  export let navigate: boolean = true
  export let changeDefault: boolean = false
  export let showLabel: boolean = true

  let feed: string = selected
  $: feed = selected
  $: changeDefault
    ? ($userSettings.defaultSort.feed = selected as
        | 'All'
        | 'Subscribed'
        | 'Local')
    : undefined
</script>

<Select
  {...$$restProps}
  bind:value={feed}
  on:change={() => {
    if (navigate) searchParam($page.url, 'type', feed, 'page', 'cursor')
  }}
  aria-label={$t('filter.location.label')}
>
  <svelte:fragment slot="label">
    {#if showLabel}
      <span class="flex items-center gap-1">
        <Icon src={GlobeAmericas} size="16" micro />
        {$t('filter.location.label')}
      </span>
    {/if}
  </svelte:fragment>
  <option value="All">
    <Icon
      src={GlobeAmericas}
      size="16"
      micro
      class="text-slate-600 dark:text-zinc-400"
    />
    {$t('filter.location.all')}
  </option>
  <option value="Local">
    <Icon
      src={MapPin}
      size="16"
      micro
      class="text-slate-600 dark:text-zinc-400"
    />{$t('filter.location.local')}
  </option>
  <option value="Subscribed" disabled={$profile?.jwt == undefined}>
    <Icon
      src={Newspaper}
      size="16"
      micro
      class="text-slate-600 dark:text-zinc-400"
    />
    {$t('filter.location.subscribed')}
  </option>
  <option
    value="ModeratorView"
    disabled={!$profile?.jwt || !amModOfAny($profile?.user)}
  >
    <Icon
      src={ShieldCheck}
      size="16"
      micro
      class="text-slate-600 dark:text-zinc-400"
    />
    {$t('filter.location.moderator')}
  </option>
</Select>

<script lang="ts">
  import { page } from '$app/stores'
  import { profile } from '$lib/auth.svelte'
  import { searchParam } from '$lib/util.svelte'
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

  interface Props {
    selected: string
    navigate?: boolean
    changeDefault?: boolean
    showLabel?: boolean
    [key: string]: any
  }

  let {
    selected = $bindable(),
    navigate = true,
    changeDefault = false,
    showLabel = true,
    ...rest
  }: Props = $props()
</script>

<Select
  {...rest}
  bind:value={selected}
  on:change={() => {
    if (navigate) searchParam($page.url, 'type', selected, 'page', 'cursor')
  }}
>
  {#snippet customLabel()}
    {#if showLabel}
      <span class="flex items-center gap-1">
        <Icon src={GlobeAmericas} size="16" micro />
        {$t('filter.location.label')}
      </span>
    {/if}
  {/snippet}
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

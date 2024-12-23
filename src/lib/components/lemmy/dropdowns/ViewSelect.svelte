<script lang="ts">
  import { settings } from '$lib/settings.svelte.js'
  import { t } from '$lib/translations'
  import { Select } from 'mono-svelte'
  import {
    Bars3,
    Clock,
    Icon,
    ListBullet,
    QueueList,
    RectangleGroup,
    Square2Stack,
    ViewColumns,
  } from 'svelte-hero-icons'

  interface Props {
    showLabel?: boolean
    [key: string]: any
  }

  let { showLabel = true, ...rest }: Props = $props()
</script>

<Select {...rest} bind:value={settings.view}>
  {#snippet customLabel()}
    {#if showLabel}
      <span class="flex items-center gap-1">
        <Icon src={ViewColumns} size="14" micro />
        {$t('filter.view.label')}
      </span>
    {/if}
  {/snippet}
  <option value="cozy">
    <Icon
      src={RectangleGroup}
      size="16"
      micro
      class="text-slate-600 dark:text-zinc-400"
    />
    {$t('filter.view.cozy')}
  </option>
  <option value="list">
    <Icon
      src={QueueList}
      size="16"
      micro
      class="text-slate-600 dark:text-zinc-400"
    />
    {$t('filter.view.list')}
  </option>
  <option value="compact">
    <Icon
      src={Bars3}
      size="16"
      micro
      class="text-slate-600 dark:text-zinc-400"
    />
    {$t('filter.view.compact')}
  </option>
</Select>

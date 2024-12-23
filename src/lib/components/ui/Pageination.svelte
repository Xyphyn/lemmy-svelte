<script lang="ts">
  import { t } from '$lib/translations'
  import { Button } from 'mono-svelte'
  import { createEventDispatcher } from 'svelte'
  import {
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Icon,
  } from 'svelte-hero-icons'
  import { backOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'

  interface Props {
    page?: number
    cursor?: { next?: string; back?: string } | undefined
    hasMore?: boolean
    children?: import('svelte').Snippet
  }

  let {
    page = $bindable(0),
    cursor = undefined,
    hasMore = true,
    children,
  }: Props = $props()

  const dispatcher = createEventDispatcher<{ change: number; cursor: string }>()
</script>

<nav
  aria-label={$t('aria.pagination.nav')}
  class="flex flex-row w-full gap-4 items-center justify-center"
>
  {#if children}
    <span class="text-sm text-slate-600 dark:text-zinc-400 font-medium">
      {@render children?.()}
    </span>
    <hr class="border-slate-200 dark:border-zinc-800 flex-1" />
  {/if}
  <Button
    color="ghost"
    onclick={() => {
      if (cursor?.back) dispatcher('cursor', cursor?.back)
      else dispatcher('change', --page)
    }}
    title={$t('common.back')}
    size="square-md"
    rounding="pill"
    class="text-inherit dark:text-inherit disabled:!opacity-20 disabled:!bg-transparent"
    disabled={(!cursor?.back && cursor?.next) || page <= 1}
  >
    {#snippet suffix()}
      <Icon src={ChevronLeft} size="24" mini />
    {/snippet}
  </Button>

  {#if page}
    <div style="display: grid;">
      {#key page}
        <div
          in:fly={{ y: 8, easing: backOut, duration: 400, delay: 100 }}
          out:fly={{ y: 8, easing: backOut, duration: 400 }}
          class="text-md font-medium"
          style="grid-column: 1; grid-row: 1;"
        >
          {page}
        </div>
      {/key}
    </div>
  {/if}

  <Button
    color="ghost"
    onclick={() => {
      if (cursor?.next) dispatcher('cursor', cursor?.next)
      else dispatcher('change', ++page)
    }}
    title={$t('common.next')}
    size="square-md"
    rounding="pill"
    class="text-inherit dark:text-inherit"
    disabled={!hasMore}
  >
    {#snippet suffix()}
      <Icon src={ChevronRight} size="24" mini />
    {/snippet}
  </Button>
</nav>

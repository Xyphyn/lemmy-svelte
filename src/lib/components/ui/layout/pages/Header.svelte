<script lang="ts">
  import { settings } from '$lib/settings.svelte'
  import { contentPadding } from '../Shell.svelte'

  interface Props {
    pageHeader?: boolean
    style?: string
    class?: string
    children?: import('svelte').Snippet
    extended?: import('svelte').Snippet
  }

  let {
    pageHeader = false,
    style = '',
    class: clazz = '',
    children,
    extended,
  }: Props = $props()
</script>

<div
  class="
  {pageHeader
    ? `w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]
  bg-slate-50 dark:bg-zinc-950 -m-4 sm:-m-6 mb-0 sm:mb-0 sm:p-6 p-4
   border-b border-slate-200 dark:border-zinc-800`
    : ''}
  
  "
  style="{pageHeader
    ? `margin-top: min(-6rem, calc(-1 * calc(${$contentPadding.top}px))); padding-top: max(6rem, calc(${$contentPadding.top}px));`
    : ''} {style};
"
>
  <h1
    class="text-3xl font-medium flex gap-2 w-full
  {settings.font == 'satoshi/nunito' ? 'font-display' : ''} {clazz ?? ''}"
  >
    {@render children?.()}
  </h1>
  {#if extended}
    <div class="mt-4">
      {@render extended?.()}
    </div>
  {/if}
</div>

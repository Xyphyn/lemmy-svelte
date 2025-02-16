<script lang="ts">
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import type { View } from '$lib/settings.svelte'
  import { Button } from 'mono-svelte'
  import { ChevronDown, Icon } from 'svelte-hero-icons'

  const MAX_HEIGHT = 192

  let element = $state<Element>()

  function isOverflown(element: Element) {
    if (!element) return false

    return element.scrollHeight > MAX_HEIGHT
  }

  interface Props {
    body: string
    view?: View
    clickThrough?: boolean
    element?: string
    style?: string
    class?: string
  }

  let {
    body,
    view = 'cozy',
    clickThrough = false,
    element: htmlElement = 'div',
    style = '',
    class: clazz = '',
  }: Props = $props()

  let overflows = $derived(element ? isOverflown(element) : false)

  let expanded = $state(false)
  $effect(() => {
    expanded = !overflows
  })
</script>

<svelte:element
  this={htmlElement}
  {style}
  class="{!expanded
    ? ` overflow-hidden
bg-gradient-to-b text-transparent from-slate-600 via-slate-600
dark:from-zinc-400 dark:via-zinc-400 bg-clip-text z-0 max-h-48`
    : 'text-slate-600 dark:text-zinc-400 max-h-full'} text-base {clazz}"
  class:pointer-events-none={!clickThrough}
  bind:this={element}
>
  <Markdown inline={!expanded} source={expanded ? body : body.slice(0, 1000)} />
  {#if overflows}
    <Button
      onclick={() => (expanded = !expanded)}
      size="square-sm"
      color="tertiary"
      class="text-black dark:text-white absolute z-10 isolate pointer-events-auto bottom-0 {expanded
        ? 'bg-slate-200/50 dark:bg-zinc-900 border shadow-md'
        : ''} left-1/2 -translate-x-1/2 mb-4"
      title="Expand"
    >
      <Icon
        src={ChevronDown}
        size="20"
        mini
        class="{expanded ? 'rotate-180' : ''} transition-transform"
      />
    </Button>
  {/if}
</svelte:element>

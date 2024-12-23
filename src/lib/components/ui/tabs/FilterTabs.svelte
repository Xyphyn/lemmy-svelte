<script lang="ts">
  import { Button } from 'mono-svelte'
  import { Icon, XMark } from 'svelte-hero-icons'
  import { expoOut } from 'svelte/easing'
  import { fly, slide } from 'svelte/transition'
  import TextProps from '../text/TextProps.svelte'

  type T = $$Generic

  interface Props {
    items: T[]
    id: (item: T) => string | number | symbol
    identifier?: import('svelte').Snippet<[any]>
    children?: import('svelte').Snippet<[any]>
  }

  let { items, id, identifier, children }: Props = $props()

  let filters: Set<string | number | symbol> = $state(new Set())

  let filteredItems = $derived(
    filters.size > 0 ? items.filter((i) => filters.has(id(i))) : items,
  )
  let uniqueIds = $derived(new Set(items.map(id)))
</script>

<div class="flex flex-row overflow-auto space-x-2">
  {#if filters.size > 0}
    <div
      in:slide={{ duration: 300, easing: expoOut, axis: 'x' }}
      out:slide={{ duration: 300, easing: expoOut, axis: 'x', delay: 100 }}
    >
      <div
        out:fly={{ duration: 300, easing: expoOut, y: 6 }}
        in:fly={{ duration: 300, easing: expoOut, y: 6, delay: 100 }}
      >
        <Button
          onclick={() => {
            filters.clear()
            filters = filters
          }}
          color="ghost"
          class="text-inherit dark:text-inherit text-xs aspect-square h-full"
          rounding="pill"
          size="square-sm"
        >
          <Icon src={XMark} size="14" micro />
        </Button>
      </div>
    </div>
  {/if}
  {#each uniqueIds as id}
    <Button
      onclick={() => {
        if (filters.has(id)) filters.delete(id)
        else filters.add(id)
        filters = filters
      }}
      color={filters.has(id) ? 'primary' : 'ghost'}
      class="text-xs px-2.5"
      rounding="pill"
      size="sm"
    >
      {#if identifier}{@render identifier({ string: id })}{:else}
        <TextProps wrap="no-wrap">
          {id}
        </TextProps>
      {/if}
    </Button>
  {/each}
</div>

{@render children?.({ items: filteredItems })}

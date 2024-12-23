<script lang="ts">
  import { Menu, TextInput, Spinner, MenuButton } from '../index.js'
  import { debounce } from '../util/time.js'
  import { createEventDispatcher } from 'svelte'
  import { Icon, MagnifyingGlass } from 'svelte-hero-icons'

  type T = $$Generic
  let items: T[] = $state([])

  /**
   * This is here so that the menu doesn't open as soon as it's mounted.
   */
  let openMenu = $state(false)
  let searching = $state(false)

  const dispatcher = createEventDispatcher<{
    input: Event
    select: T | undefined
  }>()

  interface Props {
    query?: string
    selected?: T | undefined
    search: (query: string) => Promise<T[]>
    extractName: (item: T) => string
    select?: any
    input?: import('svelte').Snippet
    noresults?: import('svelte').Snippet
    children?: import('svelte').Snippet<[any]>
    [key: string]: any
  }

  let {
    query = $bindable(''),
    selected = $bindable(undefined),
    search,
    extractName,
    select = (item: T) => {
      selected = item
      query = extractName(item)
      dispatcher('select', item)
    },
    input,
    noresults,
    children,
    ...rest
  }: Props = $props()

  const debounceFunc = debounce(async () => {
    searching = true
    openMenu = true
    items = await search(query)
    searching = false
  })
</script>

<div class="relative">
  <Menu bind:open={openMenu}>
    {#snippet target()}
      {#if input}{@render input()}{:else}
        <TextInput
          bind:value={query}
          on:input={(e) => {
            searching = true
            openMenu = true
            dispatcher('input', e)
            debounceFunc()
          }}
          on:focus={(e) => {
            searching = true
            openMenu = true
            dispatcher('input', e)
            debounceFunc()
          }}
          {...rest}
          inlineAffixes
        >
          {#snippet prefix()}
            <div class="h-5 flex items-center">
              <Icon src={MagnifyingGlass} mini size="16" />
            </div>
          {/snippet}
        </TextInput>
      {/if}
    {/snippet}
    {#if searching}
      <div class="w-full h-24 grid place-items-center">
        <Spinner width={24} />
      </div>
    {:else if items.length == 0}
      <div class="text-center h-24 grid place-items-center">
        {#if noresults}{@render noresults()}{:else}No results found.{/if}
      </div>
    {:else}
      {#each items as item}
        {#if children}{@render children({
            extractName,
            item,
            dispatcher,
            select,
          })}{:else}
          <MenuButton onclick={() => select(item)}>
            {extractName(item)}
          </MenuButton>
        {/if}
      {/each}
    {/if}
  </Menu>
</div>

<script lang="ts" module>
  interface Props<T> extends Omit<TextInputProps, 'onselect' | 'children'> {
    query?: string
    selected?: T | undefined
    search: (query: string) => Promise<T[]>
    extractName: (item: T) => string
    select?: any
    input?: import('svelte').Snippet
    noresults?: import('svelte').Snippet
    children?: import('svelte').Snippet<[any]>
    onselect?: (value: T | undefined) => void
    oninput?: TextInputProps['oninput']
  }

  export type { Props as SearchProps }
</script>

<script lang="ts" generics="T">
  import type { TextInputProps } from 'mono-svelte/forms/TextInput.svelte'
  import { Menu, TextInput, Spinner, MenuButton } from '../index.js'
  import { debounce } from '../util/time.js'
  import { createEventDispatcher } from 'svelte'
  import { Icon, MagnifyingGlass } from 'svelte-hero-icons'

  let items: T[] = $state([])

  /**
   * This is here so that the menu doesn't open as soon as it's mounted.
   */
  let openMenu = $state(false)
  let searching = $state(false)

  let {
    query = $bindable(''),
    selected = $bindable(undefined),
    search,
    extractName,
    select = (item: T) => {
      selected = item
      query = extractName(item)
      onselect?.(item)
    },
    input,
    noresults,
    children,
    onselect,
    oninput,
    ...rest
  }: Props<T> = $props()

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
          oninput={(e) => {
            searching = true
            openMenu = true
            oninput?.(e)
            debounceFunc()
          }}
          onfocus={(e) => {
            searching = true
            openMenu = true
            oninput?.(e)
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

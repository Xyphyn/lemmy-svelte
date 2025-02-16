<script lang="ts">
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { getClient } from '$lib/lemmy.svelte.js'
  import type { Community, ListingType, Person } from 'lemmy-js-client'
  import { MenuButton, Search } from 'mono-svelte'
  import { createEventDispatcher } from 'svelte'
  import { Icon, XCircle } from 'svelte-hero-icons'
  import { fly } from 'svelte/transition'

  interface Props {
    q?: string
    instance?: string | undefined
    listing_type?: ListingType
    showWhenEmpty?: boolean
    onselect?: (e: any) => void
    [key: string]: any
  }

  let {
    q = $bindable(''),
    instance = undefined,
    listing_type = 'Subscribed',
    showWhenEmpty = false,
    ...rest
  }: Props = $props()

  const dispatcher = createEventDispatcher<{ select: Person | undefined }>()
</script>

<Search
  search={async (q) => {
    const results = await getClient(instance).search({
      q: q || ' ',
      type_: 'Users',
      limit: 20,
      listing_type: listing_type,
      sort: 'TopAll',
    })

    return results.users.map((c) => c.person)
  }}
  extractName={(c) => `${c.name}@${new URL(c.actor_id).hostname}`}
  bind:query={q}
  {...rest}
>
  {#snippet noresults()}
    <div class="w-full h-full">
      {#if showWhenEmpty}
        <MenuButton onclick={() => dispatcher('select', undefined)}>
          <Icon src={XCircle} size="16" mini />
          <div class="flex flex-col text-left">
            <span>None</span>
          </div>
        </MenuButton>
      {:else}
        <span class="mx-auto my-auto">No results.</span>
      {/if}
    </div>
  {/snippet}
  {#snippet children({ item, select })}
    <div in:fly|global={{ y: -4, opacity: 0 }}>
      <MenuButton onclick={() => select(item)}>
        <Avatar url={item.avatar} alt={item.name} width={24} />
        <div class="flex flex-col text-left">
          <span>{item.name}</span>
          <span class="text-xs opacity-80">
            {new URL(item.actor_id).hostname}
          </span>
        </div>
      </MenuButton>
    </div>
  {/snippet}
</Search>

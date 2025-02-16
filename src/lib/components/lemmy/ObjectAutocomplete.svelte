<script lang="ts">
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { getClient } from '$lib/lemmy.svelte.js'
  import type { Community, CommunityView, ListingType } from 'lemmy-js-client'
  import { MenuButton, Search } from 'mono-svelte'
  import type { SearchProps } from 'mono-svelte/search/Search.svelte'
  import { createEventDispatcher } from 'svelte'
  import { Icon, XCircle, ServerStack } from 'svelte-hero-icons'
  import { fly } from 'svelte/transition'

  interface Props {
    type?: 'community' | 'instance'
    q?: string
    instance?: string | undefined
    listing_type?: ListingType
    showWhenEmpty?: boolean
    onselect?: (item: any) => void
    [key: string]: any
  }

  let {
    type = 'community',
    q = $bindable(''),
    instance = undefined,
    listing_type = 'Subscribed',
    showWhenEmpty = false,
    ...rest
  }: Props = $props()

  const dispatcher = createEventDispatcher<{ select: Community | undefined }>()
  let instances = $derived(
    type == 'instance' && getClient().getFederatedInstances(),
  )
</script>

{#if type == 'community'}
  <Search
    search={async (q) => {
      const results = await getClient(instance).search({
        q: q || ' ',
        type_: 'Communities',
        limit: 20,
        listing_type: listing_type,
        sort: 'TopAll',
      })

      return results.communities.map((c) => c.community)
    }}
    extractName={(c) => `${c.title}@${new URL(c.actor_id).hostname}`}
    bind:query={q}
    {...rest}
  >
    {#snippet noresults()}
      <div class="w-full h-full">
        {#if q == '' && showWhenEmpty}
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
          <Avatar url={item.icon} alt={item.title} width={24} />
          <div class="flex flex-col text-left">
            <span>{item.title}</span>
            <span class="text-xs opacity-80">
              {new URL(item.actor_id).hostname}
            </span>
          </div>
        </MenuButton>
      </div>
    {/snippet}
  </Search>
{:else if type == 'instance'}
  <Search
    search={async (q) => {
      const results = (await instances) || {}

      return q
        ? (results.federated_instances?.linked || []).filter(
            (i) => i.software === 'lemmy' && i.domain.includes(q),
          )
        : []
    }}
    extractName={(i) => `${i.domain}`}
    bind:query={q}
    {...rest}
  >
    {#snippet noresults()}
      <div class="w-full h-full">
        {#if q == '' && showWhenEmpty}
          <MenuButton onclick={() => dispatcher('select', undefined)}>
            <div class="flex flex-col text-left">
              <span>None (Start typing to search)</span>
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
          <Icon src={ServerStack} size="16" mini />
          <div class="flex flex-col text-left">
            <span>{item.domain}</span>
          </div>
        </MenuButton>
      </div>
    {/snippet}
  </Search>
{/if}

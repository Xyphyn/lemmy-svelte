<script lang="ts">
  import { profile } from '$lib/auth.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
  import { addFavorite } from '$lib/lemmy/item'
  import { hasFavorite } from '$lib/lemmy/user'
  import type { Community } from 'lemmy-js-client'
  import { Button } from 'mono-svelte'
  import { Icon, Star, Trash } from 'svelte-hero-icons'
  import { flip } from 'svelte/animate'
  import { expoOut } from 'svelte/easing'

  interface Props {
    items: Community[]
    isFavorites?: boolean
  }

  let { items, isFavorites = false }: Props = $props()
</script>

{#each items.sort( (a, b) => a.title.localeCompare(b.title), ) as follow (follow.id)}
  <div
    class="inline-flex w-full items-center pl-3 hover:bg-slate-100 hover:dark:bg-zinc-800
    transition-colors rounded-lg"
    animate:flip={{ duration: 500, easing: expoOut }}
  >
    <div class="flex-none grid group">
      {#if profile && !hasFavorite(profile.data, follow.id)}
        <Button
          rounding="pill"
          size="custom"
          class="hidden group-hover:inline-flex opacity-0 group-hover:opacity-100 transition-all z-20
      items-center justify-center box-border w-7 h-7"
          style="grid-column: 1; grid-row: 1;"
          onclick={() => addFavorite(follow)}
        >
          <Icon src={Star} size="16" mini />
        </Button>
      {:else if isFavorites && profile && hasFavorite(profile.data, follow.id)}
        <Button
          rounding="pill"
          size="custom"
          class="hidden group-hover:inline-flex opacity-0 group-hover:opacity-100 transition-all z-20
    items-center justify-center box-border w-7 h-7"
          style="grid-column: 1; grid-row: 1;"
          onclick={() => addFavorite(follow, false)}
        >
          <Icon src={Trash} size="16" mini />
        </Button>
      {/if}
      <Avatar
        url={follow.icon}
        alt={follow.name}
        title={follow.title}
        width={28}
        class={!isFavorites && profile && hasFavorite(profile.data, follow.id)
          ? ''
          : 'group-hover:hidden'}
      />
    </div>
    <SidebarButton
      class="font-normal w-full h-max"
      color="none"
      alignment="left"
      href="/c/{follow.name}@{new URL(follow.actor_id).hostname}"
    >
      {#snippet label()}
        <div class="flex flex-col max-w-full break-words">
          <span>{follow.title}</span>
          <span class="text-xs text-slate-600 dark:text-zinc-400">
            {new URL(follow.actor_id).hostname}
          </span>
        </div>
      {/snippet}
    </SidebarButton>
  </div>
{/each}

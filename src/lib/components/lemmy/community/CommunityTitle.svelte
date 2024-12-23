<script lang="ts">
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import type { Community } from 'lemmy-js-client'

  interface Props {
    community: Community
  }

  let { community }: Props = $props()
</script>

<div class="flex flex-row gap-3 items-center">
  <Avatar width={48} url={community.icon} alt={community.name} />
  <div class="flex flex-col gap-0">
    <h1 class="font-bold text-xl">{community.title}</h1>
    <span class="dark:text-zinc-400 text-slate-600 text-sm">
      !{community.name}@{new URL(community.actor_id).hostname}
    </span>
  </div>
</div>

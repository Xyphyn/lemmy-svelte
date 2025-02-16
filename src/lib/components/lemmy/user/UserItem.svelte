<script lang="ts">
  import type { PersonView } from 'lemmy-js-client'
  import {
    ChatBubbleOvalLeftEllipsis,
    Icon,
    PencilSquare,
  } from 'svelte-hero-icons'
  import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import LabelStat from '$lib/components/ui/LabelStat.svelte'
  import { userLink } from '$lib/lemmy/generic'
  import Avatar from '$lib/components/ui/Avatar.svelte'

  interface Props {
    user: PersonView
    view?: 'cozy' | 'compact'
    showCounts?: boolean
    class?: string
    icon?: import('svelte').Snippet
  }

  let {
    user,
    view = 'compact',
    showCounts = true,
    class: clazz = 'py-4 flex flex-col gap-4 text-sm max-w-full relative',
    icon,
  }: Props = $props()
</script>

<div class={clazz}>
  <div
    class="flex
     {view == 'cozy'
      ? 'flex-col gap-2'
      : 'flex-row'} items-center max-w-full w-full"
  >
    <a href={userLink(user.person)} class="flex-1">
      <div
        class="flex {view == 'cozy'
          ? 'flex-col gap-2'
          : 'flex-row'} gap-2 items-center"
      >
        {#if icon}{@render icon()}{:else}
          <Avatar url={user.person.avatar} width={32} alt={user.person.name} />
        {/if}
        <div class="flex flex-col">
          <div class="font-medium text-base">
            {user.person.display_name ?? user.person.name}
          </div>
          <div class="text-sm text-slate-600 dark:text-zinc-400">
            {new URL(user.person.actor_id).hostname}
          </div>
        </div>
      </div>
    </a>
  </div>
  {#if showCounts}
    <div class="flex flex-row gap-3 items-center justify-center">
      {#if user.counts.post_count}
        <LabelStat
          content={user.counts.post_count.toString()}
          formatted
          label="Posts"
        />
      {/if}
      {#if user.counts.comment_count}
        <LabelStat
          content={user.counts.comment_count.toString()}
          formatted
          label="Comments"
        />
      {/if}
    </div>
  {/if}
</div>

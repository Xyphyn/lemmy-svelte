<script lang="ts">
  import Link from '$lib/components/input/Link.svelte'
  import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
  import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
  import RelativeDate from '$lib/components/util/RelativeDate.svelte'
  import { Material } from 'mono-svelte'
  import type { ModLog } from '../+page.js'
  import ModlogAction from '../ModlogAction.svelte'

  interface Props {
    item: ModLog
  }

  let { item }: Props = $props()
</script>

<Material padding="lg" class="flex flex-col gap-2">
  <div class="flex flex-row justify-between flex-wrap gap-2">
    {#if item.community}
      <CommunityLink community={item.community} avatar showInstance />
    {/if}
    <SectionTitle class="font-normal">
      <RelativeDate date={new Date(item.timestamp)} />
    </SectionTitle>
  </div>
  {#if item.actionName}
    <SectionTitle class="mt-2">Action</SectionTitle>
    <span class="text-base">
      <ModlogAction action={item.actionName} />
    </span>
  {/if}
  {#if item.moderator}
    <SectionTitle class="mt-2">Moderator</SectionTitle>
    <span
      class="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium"
    >
      <UserLink showInstance={true} avatar user={item.moderator} />
    </span>
  {/if}
  {#if item.moderatee}
    <SectionTitle class="mt-2">User</SectionTitle>
    <UserLink showInstance={true} avatar user={item.moderatee} />
  {/if}
  {#if item.link || item.content}
    <SectionTitle class="mt-2">Item</SectionTitle>
    {#if item.link && item.content}
      <Link href={item.link} highlight>
        {item.content}
      </Link>
    {:else if item.content}
      <p>{item.content}</p>
    {:else if item.link}
      <Link href={item.link} highlight />
    {/if}
  {/if}
  {#if item.reason}
    <SectionTitle class="mt-2">Reason</SectionTitle>
    <p>{item.reason}</p>
  {/if}
</Material>

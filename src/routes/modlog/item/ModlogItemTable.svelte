<script lang="ts">
  import Link from '$lib/components/input/Link.svelte'
  import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import RelativeDate from '$lib/components/util/RelativeDate.svelte'
  import type { ModLog } from '../+page.js'
  import ModlogAction from '../ModlogAction.svelte'

  interface Props {
    item: ModLog
  }

  let { item }: Props = $props()
</script>

<tr class="">
  <td>
    <span>
      <RelativeDate date={new Date(item.timestamp)} />
    </span>
  </td>
  <td>
    {#if item.moderator}
      <UserLink
        showInstance={false}
        avatar
        avatarSize={20}
        user={item.moderator}
      />
    {:else}
      <p class="text-slate-500 dark:text-zinc-500">Hidden</p>
      <p></p>
    {/if}
  </td>
  <td>
    <ModlogAction action={item.actionName} />
  </td>
  <td>
    {#if item.moderatee}
      <UserLink showInstance={false} user={item.moderatee} />
    {/if}
  </td>
  <td>
    {#if item.community}
      <CommunityLink
        showInstance={false}
        avatar
        avatarSize={20}
        community={item.community}
      />
    {/if}
  </td>
  <td>
    {#if item.content}
      <p>{item.content}</p>
    {/if}
  </td>
  <td>
    {#if item.reason}
      <p>{item.reason}</p>
    {/if}
  </td>
  <td>
    {#if item.link}
      <Link highlight href={item.link} />
    {/if}
  </td>
</tr>

<script lang="ts">
  import ItemList from '$lib/components/lemmy/generic/ItemList.svelte'
  import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import EntityHeader from '$lib/components/ui/EntityHeader.svelte'
  import Expandable from '$lib/components/ui/Expandable.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { publishedToDate } from '$lib/components/util/date.js'
  import { formatRelativeDate } from '$lib/components/util/RelativeDate.svelte'
  import { communityLink } from '$lib/lemmy/generic.js'
  import { settings } from '$lib/settings.svelte.js'
  import { t } from '$lib/translations'
  let { data } = $props()

  let my_user = $derived(data.my_user!.local_user_view)
</script>

<Header pageHeader>
  {$t('routes.profile.overview')}
</Header>

<EntityHeader
  avatar={my_user.person.avatar}
  name={my_user.person.display_name || my_user.person.name}
  banner={my_user.person.banner}
  bio={my_user.person.bio}
  stats={[
    {
      name: $t('content.posts'),
      value: my_user.counts.post_count.toString(),
    },
    {
      name: $t('content.comments'),
      value: my_user.counts.comment_count.toString(),
    },
    {
      name: $t('stats.joined'),
      value: formatRelativeDate(publishedToDate(my_user.person.published), {
        style: 'short',
      }).toString(),
      format: false,
    },
  ]}
>
  {#snippet nameDetail()}
    <span class="text-sm flex gap-0 items-center w-max">
      @
      <UserLink
        showInstance
        user={my_user.person}
        displayName={false}
        class="font-normal"
      />
    </span>
  {/snippet}
  {#if data.moderates && data.moderates.length > 0}
    <Expandable class="">
      {#snippet title()}
        {$t('routes.profile.moderates')}
        <hr class="flex-1 w-full border-slate-200 dark:border-zinc-800 mx-3" />
      {/snippet}
      <ItemList
        items={data.moderates.map((m) => ({
          id: m.community.id,
          name: m.community.title,
          url: communityLink(m.community),
          avatar: m.community.icon,
          instance: new URL(m.community.actor_id).hostname,
        }))}
      />
    </Expandable>
  {/if}
</EntityHeader>

{#if settings.debugInfo}
  <pre>
  {JSON.stringify(my_user, undefined, 4)}
</pre>
{/if}

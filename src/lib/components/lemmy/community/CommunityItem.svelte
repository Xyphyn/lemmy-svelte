<script lang="ts">
  import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
  import type { CommunityView } from 'lemmy-js-client'
  import Subscribe from '../../../../routes/communities/Subscribe.svelte'
  import {
    ChatBubbleOvalLeftEllipsis,
    Check,
    ExclamationTriangle,
    Icon,
    InformationCircle,
    MapPin,
    NoSymbol,
    PencilSquare,
    Plus,
    Trash,
    UserGroup,
  } from 'svelte-hero-icons'
  import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
  import { Button, Modal } from 'mono-svelte'
  import { fullCommunityName, isSubscribed } from '$lib/util.svelte.js'
  import { profile } from '$lib/auth.svelte.js'
  import { addSubscription } from '$lib/lemmy/user.js'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
  import LabelStat from '$lib/components/ui/LabelStat.svelte'
  import PostBody from '../post/PostBody.svelte'
  import { t } from '$lib/translations'
  import Entity from '$lib/components/ui/Entity.svelte'

  let showInfo = $state(false)
  interface Props {
    community: CommunityView
    view?: 'cozy' | 'compact'
    showCounts?: boolean
    class?: string
    icon?: import('svelte').Snippet
  }

  let {
    community = $bindable(),
    view = 'compact',
    showCounts = true,
    class: clazz = 'py-4 flex flex-col gap-4 text-sm max-w-full relative',
    icon,
  }: Props = $props()
</script>

{#if showInfo}
  <Modal title={$t('form.post.community')} bind:open={showInfo}>
    <CommunityCard community_view={community} />
  </Modal>
{/if}

<div class={clazz}>
  <div
    class="flex
     {view == 'cozy'
      ? 'flex-col gap-2 items-center'
      : 'flex-row'} max-w-full w-full"
  >
    <a
      href="/c/{fullCommunityName(
        community.community.name,
        community.community.actor_id,
      )}"
      class="flex-1 w-full overflow-hidden"
      data-sveltekit-preload-data="tap"
    >
      <div
        class="flex {view == 'cozy'
          ? 'flex-col gap-2'
          : 'flex-row'} gap-2 items-center"
      >
        {#if icon}{@render icon()}{:else}
          <Avatar
            url={community.community.icon}
            width={32}
            alt={community.community.name}
          />
        {/if}
        <div
          class="flex flex-col overflow-hidden whitespace-nowrap flex-1 min-w-0 flex-shrink"
        >
          <div class="font-medium text-base overflow-hidden overflow-ellipsis">
            <span>{community.community.title}</span>
            {#if community.community.deleted}
              <Icon
                src={Trash}
                class="text-red-500"
                micro
                size="14"
                title={$t('post.badges.deleted')}
              />
            {/if}
            {#if community.community.nsfw}
              <Icon
                src={ExclamationTriangle}
                class="text-red-500"
                micro
                size="14"
                title={$t('post.badges.nsfw')}
              />
            {/if}
            {#if community.banned_from_community}
              <Icon
                src={NoSymbol}
                class="text-red-500"
                micro
                size="14"
                title={$t('comment.banned')}
              />
            {/if}
            {#if community.community.visibility == 'LocalOnly'}
              <Icon
                src={MapPin}
                class="text-green-500"
                micro
                size="14"
                title={$t('routes.admin.config.listingType.local')}
              />
            {/if}
          </div>
          <div
            class="text-sm text-slate-600 dark:text-zinc-400 flex gap-0.5"
            class:justify-center={view == 'cozy'}
          >
            <span class="overflow-hidden overflow-ellipsis">
              {new URL(community.community.actor_id).hostname}
            </span>
            <span class="overflow-hidden overflow-ellipsis">
              {#if !showCounts}
                •
                <FormattedNumber number={community.counts.subscribers} />
              {/if}
            </span>
          </div>
        </div>
      </div>
    </a>
    <div class="flex flex-row items-center gap-2">
      <Button size="square-md" onclick={() => (showInfo = !showInfo)}>
        <Icon src={InformationCircle} size="16" mini />
      </Button>
      <Subscribe {community}>
        {#snippet children({ subscribe, subscribing })}
          <Button
            disabled={subscribing || !profile.data?.jwt}
            loading={subscribing}
            onclick={async () => {
              const res = await subscribe()

              if (res) {
                const newSubscribed =
                  res.community_view.subscribed != 'NotSubscribed'
                    ? 'Subscribed'
                    : 'NotSubscribed'

                community.subscribed = newSubscribed
                addSubscription(
                  community.community,
                  newSubscribed == 'Subscribed',
                )
              }
            }}
            size="custom"
            title={isSubscribed(community.subscribed)
              ? $t('cards.community.subscribed')
              : $t('cards.community.subscribe')}
            color={isSubscribed(community.subscribed)
              ? 'elevatedLow'
              : 'primary'}
            class="{isSubscribed(community.subscribed)
              ? 'text-slate-600 dark:text-zinc-400'
              : ''}
              aspect-square h-8 @md:px-2 @md:min-w-32 @md:aspect-auto"
          >
            {#snippet prefix()}
              <Icon
                src={isSubscribed(community.subscribed) ? Check : Plus}
                size="16"
                micro
              />
            {/snippet}
            <span class="hidden @md:block">
              {#if isSubscribed(community.subscribed)}
                {$t('cards.community.subscribed')}
              {:else}
                {$t('cards.community.subscribe')}
              {/if}
            </span>
          </Button>
        {/snippet}
      </Subscribe>
    </div>
  </div>
  {#if showCounts}
    <div class="flex flex-row gap-3 items-center justify-center">
      {#if community.counts.posts}
        <LabelStat
          content={community.counts.posts.toString()}
          formatted
          label="Posts"
        />
      {/if}
      {#if community.counts.subscribers}
        <LabelStat
          content={community.counts.subscribers.toString()}
          formatted
          label="Members"
        />
      {/if}
      {#if community.counts.comments}
        <LabelStat
          content={community.counts.comments.toString()}
          formatted
          label="Comments"
        />
      {/if}
    </div>
  {/if}
</div>

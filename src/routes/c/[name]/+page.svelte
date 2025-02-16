<script lang="ts">
  import { run } from 'svelte/legacy'

  import { navigating, page } from '$app/state'
  import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import Sort from '$lib/components/lemmy/dropdowns/Sort.svelte'
  import { onDestroy, onMount } from 'svelte'
  import { setSessionStorage } from '$lib/session.js'
  import PostFeed from '$lib/components/lemmy/post/feed/PostFeed.svelte'
  import VirtualFeed from '$lib/components/lemmy/post/feed/VirtualFeed.svelte'
  import { Button, Modal, Note, toast } from 'mono-svelte'
  import { browser } from '$app/environment'
  import { ArrowRight, ChartBar, Icon, XMark } from 'svelte-hero-icons'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { t } from '$lib/translations.js'
  import { settings } from '$lib/settings.svelte.js'
  import { site } from '$lib/lemmy.svelte.js'
  import { resumables } from '$lib/lemmy/item'
  import CommunityHeader from '$lib/components/lemmy/community/CommunityHeader.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { profile } from '$lib/auth.svelte.js'

  let { data: pageData } = $props()
  let data = $state(pageData)
  $effect(() => {
    data = pageData
  })

  let sidebar: boolean = $state(false)

  onMount(() => {
    if (browser)
      setSessionStorage(
        'lastSeenCommunity',
        data.community.community_view.community,
      )

    resumables.add({
      name: data.community.community_view.community.title,
      type: 'community',
      url: page.url.toString(),
      avatar: data.community.community_view.community.icon,
    })
  })

  onDestroy(() => {
    if (browser) {
      if (navigating?.to?.route?.id == '/create/post') return

      setSessionStorage('lastSeenCommunity', undefined)
    }
  })
</script>

{#if sidebar}
  <Modal bind:open={sidebar}>
    {#snippet customTitle()}
      <span>About</span>
    {/snippet}
    <div>
      <CommunityCard
        bind:community_view={data.community.community_view}
        moderators={data.community.moderators}
      />
    </div>
  </Modal>
{/if}

<div class="flex flex-col gap-4 max-w-full w-full min-w-0">
  <Header pageHeader>
    <div class="flex flex-col w-full">
      <CommunityHeader
        bind:community={data.community.community_view.community}
        bind:subscribed={data.community.community_view.subscribed}
        blocked={data.community.community_view.blocked}
        moderators={data.community.moderators}
        counts={data.community.community_view.counts}
        class="w-full relative"
      />
    </div>
    {#snippet extended()}
      <Sort selected={data.sort} />
    {/snippet}
  </Header>

  {#if profile.data.user}
    {#if !data.community.discussion_languages.every( (l) => profile.data.user?.discussion_languages.includes(l), ) && profile.data.user.discussion_languages.length > 0}
      <Note class="!p-1 !pl-3 flex-col md:flex-row">
        {$t('routes.community.languageWarning')}
        <Button
          class="inline-block md:ml-auto"
          href="/profile/settings"
          color="tertiary"
          rounding="pill"
          size="md"
        >
          {$t('profile.profile')}
          {#snippet suffix()}
            <Icon src={ArrowRight} size="16" micro />
          {/snippet}
        </Button>
      </Note>
    {/if}
  {/if}

  {#if data.community.community_view.blocked}
    <Placeholder
      icon={XMark}
      title="Blocked"
      description="You've blocked this community."
    >
      <Button href="/profile/blocks">
        {#snippet suffix()}
          <Icon src={ArrowRight} size="16" mini />
        {/snippet}
        Blocked Communities
      </Button>
    </Placeholder>
  {:else}
    {@const SvelteComponent = browser ? VirtualFeed : PostFeed}
    <SvelteComponent
      posts={data.posts.posts}
      bind:feedData={data}
      feedId="community"
      community
    />
  {/if}

  <svelte:element
    this={settings.infiniteScroll ? 'noscript' : 'div'}
    class="mt-auto"
  >
    <Pageination
      page={data.page}
      cursor={{ next: data.cursor.next }}
      href={(page) =>
        typeof page == 'number' ? `?page=${page}` : `?cursor=${page}`}
    >
      <span class="flex flex-row items-center gap-1">
        <Icon src={ChartBar} size="16" mini />
        {$t('routes.frontpage.footer', {
          // @ts-ignore
          users: site.data?.site_view.counts.users_active_day ?? '??',
        })}
      </span>
    </Pageination>
  </svelte:element>
</div>

<style>
</style>

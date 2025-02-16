<script lang="ts">
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import {
    AdjustmentsHorizontal,
    AtSymbol,
    ChartBar,
    EllipsisHorizontal,
    Envelope,
    Fire,
    Icon,
    NoSymbol,
    PencilSquare,
    ShieldCheck,
    ShieldExclamation,
  } from 'svelte-hero-icons'
  import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { isCommentView } from '$lib/lemmy/item.js'
  import { client, getClient } from '$lib/lemmy.svelte.js'
  import { isBlocked } from '$lib/lemmy/user.js'
  import { Menu, MenuButton, removeToast, toast } from 'mono-svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { ban, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
  import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
  import { searchParam } from '$lib/util.svelte.js'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { Button, Modal, Select } from 'mono-svelte'
  import Expandable from '$lib/components/ui/Expandable.svelte'
  import { communityLink } from '$lib/lemmy/generic.js'
  import ItemList from '$lib/components/lemmy/generic/ItemList.svelte'
  import { t } from '$lib/translations.js'
  import EntityHeader from '$lib/components/ui/EntityHeader.svelte'
  import { publishedToDate } from '$lib/components/util/date.js'
  import { formatRelativeDate } from '$lib/components/util/RelativeDate.svelte'
  import Option from 'mono-svelte/forms/select/Option.svelte'
  import type { PageData } from './$types'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'

  interface Props {
    data: PageData
    inline?: boolean
  }

  let { data: pageData, inline = false }: Props = $props()

  let data = $state(pageData)

  let blocking = false
  let sortForm = $state<HTMLFormElement>()

  async function blockUser(block: number) {
    if (!profile.data?.user || !profile.data?.jwt)
      throw new Error('Unauthenticated')

    blocking = true
    try {
      const blocked = isBlocked(profile.data.user, block)

      await getClient().blockPerson({
        block: !blocked,
        person_id: block,
      })

      if (blocked) {
        const index = profile.data.user.person_blocks
          .map((p) => p.target.id)
          .indexOf(block)
        profile.data.user.person_blocks.splice(index, 1)
      }

      toast({
        content: blocked ? $t('toast.unblockUser') : $t('toast.blockUser'),
        type: 'success',
      })

      goto(page.url, {
        invalidateAll: true,
      })
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }
    blocking = false
  }

  let messaging = $state(false)

  let purgingUser = $state(false)
  let purgeEnabled = $state(false)
  $effect(() => {
    if (purgingUser) {
      purgeEnabled = false
      setTimeout(() => {
        purgeEnabled = true
      }, 3000)
    }
  })

  async function purgeUser() {
    purgingUser = false
    const purgeToast = toast({ content: '', loading: true })

    try {
      await client().purgePerson({
        person_id: data.person_view.person.id,
      })
      removeToast(purgeToast)
      toast({ content: $t('toast.purgeUser'), type: 'success' })
    } catch (e) {
      toast({ content: e as any, type: 'error' })
    }
  }
</script>

<svelte:head>
  <title>{data.person_view.person.name}</title>
</svelte:head>

{#if purgingUser}
  <Modal bind:open={purgingUser}>
    {#snippet customTitle()}
      Purging User
    {/snippet}
    <p>
      Purging user <span class="font-bold">
        {data.person_view.person.name}
      </span>
    </p>
    <p>
      Are you sure you want to do this? (The button will enable in 3 seconds.)
    </p>
    <div class="flex flex-row gap-2">
      <Button size="lg" onclick={() => (purgingUser = false)} class="flex-1">
        Cancel
      </Button>
      <Button
        size="lg"
        color="danger"
        onclick={purgeUser}
        disabled={!purgeEnabled}
        class="flex-1"
      >
        Purge
      </Button>
    </div>
  </Modal>
{/if}

<div class="flex flex-col gap-4 max-w-full w-full">
  {#if !inline}
    <Header pageHeader>
      <div class="w-full">
        <EntityHeader
          avatar={data.person_view.person.avatar}
          name={data.person_view.person.display_name ||
            data.person_view.person.name}
          banner={data.person_view.person.banner}
          bio={data.person_view.person.bio}
          stats={[
            {
              name: $t('content.posts'),
              value: data.person_view.counts.post_count.toString(),
            },
            {
              name: $t('content.comments'),
              value: data.person_view.counts.comment_count.toString(),
            },
            {
              name: $t('stats.joined'),
              value: formatRelativeDate(
                publishedToDate(data.person_view.person.published),
                { style: 'short' },
              ).toString(),
              format: false,
            },
          ]}
        >
          {#snippet nameDetail()}
            <span class="text-sm flex gap-0 items-center w-max">
              @
              <UserLink
                showInstance
                user={data.person_view.person}
                displayName={false}
                class="font-normal"
              />
            </span>
          {/snippet}
          {#if (data.moderates ?? []).length > 0}
            <Expandable class="">
              {#snippet title()}
                {$t('routes.profile.moderates')}
                <hr
                  class="flex-1 w-full border-slate-200 dark:border-zinc-800 mx-3"
                />
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
          {#snippet actions()}
            {#if profile.data?.user && profile.data.jwt && data.person_view.person.id != profile.data.user.local_user_view.person.id}
              <div class="flex items-center gap-2 w-full">
                <Button
                  size="square-md"
                  color="secondary"
                  href="/inbox/messages/{data.person_view.person.id}"
                  title="Message"
                >
                  {#snippet prefix()}
                    <Icon solid size="16" src={Envelope} />
                  {/snippet}
                </Button>
                {#if data.person_view.person.matrix_user_id}
                  <Button
                    size="square-md"
                    color="secondary"
                    href="https://matrix.to/#/{data.person_view.person
                      .matrix_user_id}"
                    title="Matrix User"
                  >
                    {#snippet prefix()}
                      <Icon solid size="16" src={AtSymbol} />
                    {/snippet}
                  </Button>
                {/if}
                {#if isAdmin(profile.data?.user)}
                  <Menu class="ml-auto" placement="bottom-end">
                    {#snippet target()}
                      <Button size="square-md">
                        <ShieldIcon width={16} filled />
                      </Button>
                    {/snippet}
                    <MenuButton
                      color="danger-subtle"
                      onclick={() =>
                        ban(
                          data.person_view.person.banned,
                          data.person_view.person,
                        )}
                    >
                      {#snippet prefix()}
                        <Icon mini size="16" src={ShieldExclamation} />
                      {/snippet}
                      {data.person_view.person.banned ? 'Unban' : 'Ban'}
                    </MenuButton>
                    <MenuButton
                      color="danger-subtle"
                      onclick={() => (purgingUser = !purgingUser)}
                    >
                      {#snippet prefix()}
                        <Icon mini size="16" src={Fire} />
                      {/snippet}
                      Purge
                    </MenuButton>
                  </Menu>
                {/if}
                <Menu placement="bottom-end">
                  {#snippet target()}
                    <Button size="square-md">
                      {#snippet prefix()}
                        <Icon src={EllipsisHorizontal} size="16" mini />
                      {/snippet}
                    </Button>
                  {/snippet}
                  <MenuButton
                    color="danger-subtle"
                    onclick={() => blockUser(data.person_view.person.id)}
                  >
                    {#snippet prefix()}
                      <Icon mini size="16" src={NoSymbol} />
                    {/snippet}
                    {isBlocked(profile.data.user, data.person_view.person.id)
                      ? 'Unblock'
                      : 'Block'}
                  </MenuButton>
                </Menu>
              </div>
            {/if}
          {/snippet}
        </EntityHeader>
      </div>
    </Header>
  {/if}

  <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
    <form
      action={page.url.origin + page.url.pathname}
      method="GET"
      class="flex flex-row gap-4 flex-wrap"
      bind:this={sortForm}
    >
      <Select
        bind:value={data.type}
        name="type"
        onchange={() => sortForm?.requestSubmit()}
      >
        {#snippet customLabel()}
          <span class="flex items-center gap-1">
            <Icon src={AdjustmentsHorizontal} size="15" mini />
            {$t('filter.type')}
          </span>
        {/snippet}
        <Option value="all">{$t('content.all')}</Option>
        <Option value="posts">{$t('content.posts')}</Option>
        <Option value="comments">{$t('content.comments')}</Option>
      </Select>
      <Select
        bind:value={data.sort}
        name="sort"
        onchange={() => sortForm?.requestSubmit()}
      >
        {#snippet customLabel()}
          <span class="flex items-center gap-1">
            <Icon src={ChartBar} size="14" mini />
            {$t('filter.sort.label')}
          </span>
        {/snippet}
        <Option value="New">{$t('filter.sort.new')}</Option>
        <Option value="TopAll">{$t('filter.sort.top.label')}</Option>
        <Option value="Old">{$t('filter.sort.old')}</Option>
      </Select>
    </form>
    {#if data.items.length == 0}
      <Placeholder
        icon={PencilSquare}
        title="No submissions"
        description="This user has no submissions that match this filter."
      />
    {:else}
      <div
        class="!divide-y divide-slate-200 dark:divide-zinc-800 flex flex-col"
      >
        {#each data.items as item}
          {#if isCommentView(item) && (data.type == 'all' || data.type == 'comments')}
            <CommentItem comment={item} />
          {:else if !isCommentView(item) && (data.type == 'all' || data.type == 'posts')}
            <Post post={item} />
          {/if}
        {/each}
      </div>
    {/if}
    <Pageination page={data.page} href={(page) => `?page=${page}`} />
  </div>
</div>

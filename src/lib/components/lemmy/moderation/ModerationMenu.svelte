<script lang="ts">
  import { getClient } from '$lib/lemmy.svelte'
  import type { CommentView, PostView } from 'lemmy-js-client'
  import { amMod, ban, isAdmin, remove } from './moderation'
  import {
    Fire,
    Icon,
    LockClosed,
    LockOpen,
    Megaphone,
    ShieldExclamation,
    Trash,
  } from 'svelte-hero-icons'
  import { isCommentView, isPostView } from '$lib/lemmy/item.js'
  import { Menu, MenuButton, MenuDivider, toast } from 'mono-svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { Button } from 'mono-svelte'
  import { t } from '$lib/translations'
  import ShieldIcon from './ShieldIcon.svelte'

  interface Props {
    item: PostView | CommentView
    [key: string]: any
  }

  let { item = $bindable(), ...rest }: Props = $props()

  let locking = $state(false)
  let pinning = $state(false)

  let acting = $derived(locking || pinning)

  async function lock(lock: boolean) {
    if (!profile.data?.jwt || !isPostView(item)) return
    locking = true

    try {
      await getClient().lockPost({
        locked: lock,
        post_id: item.post.id,
      })

      item.post.locked = lock
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    locking = false
  }

  async function pin(pinned: boolean, toInstance: boolean = false) {
    if (!profile.data?.jwt || !isPostView(item)) return

    pinning = true

    try {
      await getClient().featurePost({
        feature_type: toInstance ? 'Local' : 'Community',
        featured: pinned,
        post_id: item.post.id,
      })

      item.post.featured_community = pinned
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    pinning = false
  }
</script>

<Menu placement="bottom-end">
  {#snippet target()}
    <Button
      class="hover:!text-green-500"
      size="square-md"
      color="ghost"
      loading={acting}
      {...rest}
    >
      <ShieldIcon filled width={16} />
    </Button>
  {/snippet}
  {#if (profile.data?.user && amMod(profile.data.user, item.community)) || (profile.data?.user && isAdmin(profile.data.user))}
    <MenuDivider>
      {#if !item.community.local && !amMod(profile.data.user, item.community)}
        {$t('moderation.labelInstanceOnly')}
      {:else}
        {$t('moderation.label')}
      {/if}
    </MenuDivider>
    <MenuButton
      color="warning-subtle"
      onclick={() => lock(!item.post.locked)}
      loading={locking}
      disabled={locking}
    >
      {#snippet prefix()}
        <Icon src={item.post.locked ? LockOpen : LockClosed} size="16" mini />
      {/snippet}
      {item.post.locked ? $t('moderation.unlock') : $t('moderation.lock')}
    </MenuButton>

    <MenuButton
      color="success-subtle"
      onclick={() =>
        pin(isPostView(item) ? !item.post.featured_community : false)}
      loading={pinning}
      disabled={pinning}
    >
      <Icon src={Megaphone} size="16" mini />
      <div
        class="flex flex-row gap-2 text-left items-center justify-between w-full"
      >
        <span>
          {item.post.featured_community
            ? $t('moderation.unfeature')
            : $t('moderation.feature')}
        </span>
        {#if isAdmin(profile.data.user)}
          <span class="text-xs opacity-80">{$t('form.post.community')}</span>
        {/if}
      </div>
    </MenuButton>
    <MenuButton color="danger-subtle" onclick={() => remove(item)}>
      <Icon src={Trash} size="16" mini />
      {#if isCommentView(item)}
        {item.comment.removed
          ? $t('moderation.restore')
          : $t('moderation.remove')}
      {:else}
        {item.post.removed ? $t('moderation.restore') : $t('moderation.remove')}
      {/if}
    </MenuButton>
    {#if profile.data?.user && profile.data.user.local_user_view.person.id != item.creator.id}
      <MenuButton
        color="danger-subtle"
        onclick={() =>
          ban(item.creator_banned_from_community, item.creator, item.community)}
      >
        <Icon src={ShieldExclamation} size="16" mini />
        {item.creator_banned_from_community
          ? $t('moderation.ban.unbanFromCommunity')
          : $t('moderation.ban.banFromCommunity')}
      </MenuButton>
    {/if}
  {/if}
  {#if profile.data?.user && isAdmin(profile.data.user)}
    <MenuDivider>{$t('admin.label')}</MenuDivider>
    <MenuButton
      color="success-subtle"
      onclick={() =>
        pin(isPostView(item) ? !item.post.featured_local : false, true)}
    >
      <Icon src={Megaphone} size="16" mini />
      <div
        class="flex flex-row gap-2 text-left items-center justify-between w-full"
      >
        <span>
          {item.post.featured_local
            ? $t('moderation.unfeature')
            : $t('moderation.feature')}
        </span>
        <span class="text-xs opacity-80">{$t('admin.instance')}</span>
      </div>
    </MenuButton>
    <MenuButton color="danger-subtle" onclick={() => remove(item, true)}>
      <Icon src={Fire} size="16" mini />
      {$t('admin.purge')}
    </MenuButton>
  {/if}
</Menu>

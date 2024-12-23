<script lang="ts">
  import type { CommentView, PostView } from 'lemmy-js-client'
  import { amMod, ban, feature, isAdmin, remove } from './moderation'
  import {
    Fire,
    Icon,
    Megaphone,
    ShieldExclamation,
    Trash,
  } from 'svelte-hero-icons'
  import { isCommentView } from '$lib/lemmy/item.js'
  import { profile } from '$lib/auth.svelte.js'
  import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
  import { Button, Menu, MenuButton, MenuDivider } from 'mono-svelte'
  import { t } from '$lib/translations'

  interface Props {
    item: PostView | CommentView
    [key: string]: any
  }

  let { item = $bindable(), ...rest }: Props = $props()
</script>

<Menu placement="bottom" class="top-0 h-[26px] w-[26px] ">
  {#snippet target()}
    <Button
      class="w-[26px] h-[26px] hover:!text-green-500 dark:text-zinc-400 text-slate-600"
      size="square-md"
      color="tertiary"
      {...rest}
    >
      <ShieldIcon filled width={14} />
    </Button>
  {/snippet}
  {#if ($profile?.user && amMod($profile.user, item.community)) || ($profile?.user && isAdmin($profile.user))}
    <MenuDivider>
      {#if !item.community.local && !amMod($profile.user, item.community)}
        {$t('moderation.labelInstanceOnly')}
      {:else}
        {$t('moderation.label')}
      {/if}
    </MenuDivider>
    <MenuButton color="danger-subtle" onclick={() => remove(item)}>
      {#snippet prefix()}
        <Icon src={Trash} size="16" mini />
      {/snippet}
      {#if isCommentView(item)}
        {item.comment.removed
          ? $t('moderation.restore')
          : $t('moderation.remove')}
      {:else}
        {item.post.removed ? $t('moderation.restore') : $t('moderation.remove')}
      {/if}
    </MenuButton>
    {#if $profile?.user && $profile.user?.local_user_view.person.id != item.creator.id}
      <!--Comment made by someone else-->
      <MenuButton
        color="danger-subtle"
        onclick={() =>
          ban(item.creator_banned_from_community, item.creator, item.community)}
      >
        {#snippet prefix()}
          <Icon src={ShieldExclamation} size="16" mini />
        {/snippet}
        {item.creator_banned_from_community
          ? $t('moderation.ban.unbanFromCommunity')
          : $t('moderation.ban.banFromCommunity')}
      </MenuButton>
    {:else if isCommentView(item)}
      <!--Comment made by self-->
      <MenuButton
        color="success-subtle"
        onclick={async () => {
          if (!$profile.jwt) return
          item.comment = (
            await feature(
              !item.comment.distinguished,
              item.comment,
              $profile.jwt,
            )
          ).comment_view.comment
        }}
      >
        {#snippet prefix()}
          <Icon src={Megaphone} size="16" micro />
        {/snippet}
        {item.comment.distinguished
          ? $t('moderation.unfeature')
          : $t('moderation.feature')}
      </MenuButton>
    {/if}
  {/if}

  {#if $profile?.user && isAdmin($profile.user)}
    <MenuDivider>{$t('admin.label')}</MenuDivider>
    <MenuButton color="danger-subtle" onclick={() => remove(item, true)}>
      {#snippet prefix()}
        <Icon src={Fire} size="16" mini />
      {/snippet}
      {$t('admin.purge')}
    </MenuButton>
  {/if}
</Menu>

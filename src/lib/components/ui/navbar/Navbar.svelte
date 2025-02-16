<script lang="ts">
  import { notifications, profile } from '$lib/auth.svelte.js'
  import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
  import {
    amModOfAny,
    isAdmin,
  } from '$lib/components/lemmy/moderation/moderation.js'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { site } from '$lib/lemmy.svelte.js'
  import { Button, Menu, MenuButton, MenuDivider, Spinner } from 'mono-svelte'
  import {
    GlobeAlt,
    Icon,
    MagnifyingGlass,
    Newspaper,
    PencilSquare,
    Plus,
    ServerStack,
  } from 'svelte-hero-icons'
  import Profile from './Profile.svelte'
  import NavButton from './NavButton.svelte'
  import Logo from '../Logo.svelte'
  import { LINKED_INSTANCE_URL } from '$lib/instance.svelte'
  import { t } from '$lib/translations'
  import CommandsWrapper from './commands/CommandsWrapper.svelte'
  import type { ClassValue } from 'svelte/elements'

  let promptOpen: boolean = $state(false)
  interface Props {
    style?: string
    class?: ClassValue
  }

  let { style = '', class: clazz = '' }: Props = $props()
</script>

<CommandsWrapper bind:open={promptOpen} />
<nav
  class="flex flex-row gap-2 items-center w-full mx-auto z-50 box-border p-0.5
  duration-150 @container
  {clazz}
  "
  {style}
>
  <NavButton
    oncontextmenu={(e) => {
      e.preventDefault()
      promptOpen = true
      return true
    }}
    href="/"
    label={$t('nav.home')}
    class="ml-2 logo"
    adaptive={false}
  >
    {#snippet customIcon()}
      {#if LINKED_INSTANCE_URL}
        {#if site.data}
          <Avatar
            alt={site.data.site_view.site.name}
            url={site.data.site_view.site.icon}
            width={32}
            circle={false}
          />
        {:else}
          <Spinner width={32} />
        {/if}
      {:else}
        <Logo width={32} />
      {/if}
    {/snippet}
  </NavButton>
  <div
    class="flex flex-row gap-2 py-2 px-2 items-center w-full overflow-auto"
    style="border-radius: inherit;"
  >
    <div class="ml-auto"></div>
    {#if profile.data?.user && isAdmin(profile.data.user)}
      <NavButton
        href="/admin"
        label={$t('nav.admin')}
        icon={ServerStack}
        class="relative"
        isSelectedFilter={(path) => path.startsWith('/admin')}
      >
        {#if ($notifications.applications ?? 0) > 0}
          <div
            class="rounded-full w-2 h-2 bg-red-500 absolute -top-1 -left-1"
          ></div>
        {/if}
      </NavButton>
    {/if}
    {#if amModOfAny(profile.data?.user)}
      <NavButton
        href="/moderation"
        label={$t('nav.moderation')}
        class="relative"
      >
        {#if ($notifications.reports ?? 0) > 0}
          <div
            class="rounded-full w-2 h-2 bg-red-500 absolute -top-1 -left-1"
          ></div>
        {/if}
        {#snippet customIcon({ size, isSelected })}
          <ShieldIcon filled={isSelected} width={size} />
        {/snippet}
      </NavButton>
    {/if}
    <NavButton
      href="/communities"
      label={$t('nav.communities')}
      icon={GlobeAlt}
    />
    <NavButton href="/search" label={$t('nav.search')} icon={MagnifyingGlass} />
    <Menu placement="top">
      {#snippet target()}
        <NavButton
          class="relative"
          color="primary"
          label={$t('nav.create.label')}
          icon={Plus}
        />
      {/snippet}
      <MenuDivider>{$t('nav.create.label')}</MenuDivider>
      <MenuButton link href="/create/post" disabled={!profile.data?.jwt}>
        {#snippet prefix()}
          <Icon src={PencilSquare} size="16" micro />
        {/snippet}
        {$t('nav.create.post')}
      </MenuButton>
      <MenuButton
        link
        href="/create/community"
        disabled={!profile.data?.jwt ||
          !profile.data?.user ||
          (site.data?.site_view.local_site.community_creation_admin_only &&
            !isAdmin(profile.data.user))}
      >
        {#snippet prefix()}
          <Icon src={Newspaper} size="16" micro />
        {/snippet}
        {$t('nav.create.community')}
      </MenuButton>
      {#if !profile.data?.jwt}
        <span class="text-sm mx-4 my-1 py-1">
          {$t('nav.create.logingate')}
        </span>
      {/if}
    </Menu>
    <Profile placement="top" />
  </div>
</nav>

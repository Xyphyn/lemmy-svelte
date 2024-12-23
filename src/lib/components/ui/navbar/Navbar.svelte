<script lang="ts">
  import { notifications, profile } from '$lib/auth.svelte.js'
  import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
  import {
    amModOfAny,
    isAdmin,
  } from '$lib/components/lemmy/moderation/moderation.js'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { site } from '$lib/lemmy.js'
  import {
    Button,
    Menu,
    MenuButton,
    MenuDivider,
    Modal,
    Spinner,
  } from 'mono-svelte'
  import {
    GlobeAlt,
    Home,
    Icon,
    MagnifyingGlass,
    Newspaper,
    PencilSquare,
    Plus,
    ServerStack,
    XMark,
  } from 'svelte-hero-icons'
  import Profile from './Profile.svelte'
  import NavButton from './NavButton.svelte'
  import { scale } from 'svelte/transition'
  import { backOut } from 'svelte/easing'
  import SearchBar from '$lib/components/lemmy/util/SearchBar.svelte'
  import Logo from '../Logo.svelte'
  import { LINKED_INSTANCE_URL } from '$lib/instance'
  import { t } from '$lib/translations'
  import CommandsWrapper from './commands/CommandsWrapper.svelte'
  import { optimizeImageURL } from '$lib/components/lemmy/post/helpers'
  import { settings } from '$lib/settings.svelte'
  import { dockProps } from '../layout/Shell.svelte'

  let promptOpen: boolean = $state(false)
  interface Props {
    style?: string
    class?: string
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
        {#if $site}
          <Avatar
            alt={$site.site_view.site.name}
            url={$site.site_view.site.icon}
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
    {#if $profile?.user && isAdmin($profile.user)}
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
    {#if amModOfAny($profile?.user)}
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
      <MenuButton link href="/create/post" disabled={!$profile?.jwt}>
        {#snippet prefix()}
          <Icon src={PencilSquare} size="16" micro />
        {/snippet}
        {$t('nav.create.post')}
      </MenuButton>
      <MenuButton
        link
        href="/create/community"
        disabled={!$profile?.jwt ||
          !$profile?.user ||
          ($site?.site_view.local_site.community_creation_admin_only &&
            !isAdmin($profile.user))}
      >
        {#snippet prefix()}
          <Icon src={Newspaper} size="16" micro />
        {/snippet}
        {$t('nav.create.community')}
      </MenuButton>
      {#if !$profile?.jwt}
        <span class="text-sm mx-4 my-1 py-1">
          {$t('nav.create.logingate')}
        </span>
      {/if}
    </Menu>
    {#if $profile?.user?.local_user_view.person.avatar && !$dockProps.noGap}
      <div
        class="absolute right-0 -z-10 h-full
       overflow-hidden w-full ml-auto"
        style="border-radius: inherit;"
      >
        <img
          src={optimizeImageURL(
            $profile?.user?.local_user_view.person.avatar ?? '',
            32,
          )}
          class="blur-2xl -z-10 object-cover w-48 h-48 opacity-20 dark:opacity-50 ml-auto"
          alt=""
        />
      </div>
    {/if}
    <Profile placement="top" />
  </div>
</nav>

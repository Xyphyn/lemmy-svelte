<script lang="ts">
  import { notifications, profile } from '$lib/auth.js'
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
    Icon,
    MagnifyingGlass,
    Newspaper,
    PencilSquare,
    Plus,
    ServerStack,
    Bars3,
    ChevronDoubleDown,
  } from 'svelte-hero-icons'
  import Profile from './Profile.svelte'
  import NavButton from './NavButton.svelte'
  import { fly, scale } from 'svelte/transition'
  import { backOut, expoOut } from 'svelte/easing'
  import SearchBar from '$lib/components/lemmy/util/SearchBar.svelte'
  import Logo from '../Logo.svelte'
  import { LINKED_INSTANCE_URL } from '$lib/instance'
  import { t } from '$lib/translations'
  import CommandsWrapper from './commands/CommandsWrapper.svelte'
  import { optimizeImageURL } from '$lib/components/lemmy/post/helpers'
  import { colorScheme } from '$lib/ui/colors'
  import { page } from '$app/stores'
  import { userSettings } from '$lib/settings'
  import Contents from '$lib/components/lemmy/util/Contents.svelte'
  import ProfileLayer from './layers/ProfileLayer.svelte'

  let promptOpen: boolean = false
  let layer: number = 0

  $: dockMode = layer == 0
</script>

<CommandsWrapper bind:open={promptOpen} />
<div class="flex gap-1">
  <nav
    class="items-center w-full mx-auto z-50 box-border p-0.5
  duration-150 @container grid min-h-[62px] {dockMode
      ? 'max-h-[62px]'
      : 'max-h-[384px]'}
  {$$props.class}
  "
    style="{$$props.style};"
  >
    {#if layer == 0}
      <div
        in:fly={{ y: 16, easing: backOut, duration: 300 }}
        out:fly={{ y: 16, easing: backOut, duration: 300 }}
        class="flex flex-row gap-2 py-2 px-2 items-center w-full overflow-auto"
        style="border-radius: inherit; grid-row: 1; grid-column: 1;"
      >
        <NavButton
          on:contextmenu={(e) => {
            e.preventDefault()
            promptOpen = true
            return true
          }}
          href="/"
          label={$t('nav.home')}
          adaptive={false}
        >
          <svelte:fragment slot="icon">
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
          </svelte:fragment>
        </NavButton>
        <div class="ml-auto" />
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
              />
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
              />
            {/if}
            <ShieldIcon
              let:size
              let:isSelected
              slot="icon"
              filled={isSelected}
              width={size}
            />
          </NavButton>
        {/if}
        <NavButton
          href="/communities"
          label={$t('nav.communities')}
          icon={GlobeAlt}
        />
        <NavButton
          href="/search"
          label={$t('nav.search')}
          icon={MagnifyingGlass}
        />
        <Menu placement="top">
          <NavButton
            class="relative"
            color="primary"
            slot="target"
            label={$t('nav.create.label')}
            icon={Plus}
          />
          <MenuDivider>{$t('nav.create.label')}</MenuDivider>
          <MenuButton link href="/create/post" disabled={!$profile?.jwt}>
            <Icon src={PencilSquare} size="16" micro slot="prefix" />
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
            <Icon src={Newspaper} size="16" micro slot="prefix" />
            {$t('nav.create.community')}
          </MenuButton>
          {#if !$profile?.jwt}
            <span class="text-sm mx-4 my-1 py-1">
              {$t('nav.create.logingate')}
            </span>
          {/if}
        </Menu>
        {#if $profile?.user?.local_user_view.person.avatar}
          <div
            class="absolute right-0 -z-10 h-full
       overflow-hidden w-full ml-auto"
            style="border-radius: inherit;"
          >
            <img
              src={optimizeImageURL(
                $profile?.user?.local_user_view.person.avatar ?? '',
                32
              )}
              class="blur-2xl -z-10 object-cover w-48 h-48 opacity-20 dark:opacity-50 ml-auto"
              alt=""
            />
          </div>
        {/if}
        <svelte:component
          this={$userSettings.dock.altMenu ? Contents : Profile}
        >
          <button
            class="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-zinc-700
    transition-all bg-slate-50 dark:bg-zinc-900 relative
    hover:border-primary-900 hover:dark:border-primary-100 active:scale-95 {$$props.buttonClass}"
            title={$t('profile.profile')}
            slot="target"
            on:click={() => {
              if ($userSettings.dock.altMenu) {
                layer = layer == 1 ? 0 : 1
              }
            }}
          >
            {#if $profile?.user}
              <div
                class="w-full h-full aspect-square object-cover rounded-full grid place-items-center"
              >
                <Avatar
                  url={$profile.user.local_user_view.person.avatar}
                  width={36}
                  alt={$profile.user.local_user_view.person.name}
                />
              </div>
              {#if $notifications.inbox > 0}
                <div
                  class="rounded-full w-2 h-2 bg-red-500 absolute top-0 left-0 z-10"
                />
              {/if}
            {:else}
              <div class="w-full h-full grid place-items-center">
                <Icon src={Bars3} micro size="18" />
              </div>
            {/if}
          </button>
        </svelte:component>
      </div>
    {:else if layer == 1}
      <ProfileLayer on:move={(e) => (layer += e.detail)} />
    {:else if layer == 2 && $page.data?.slots?.nav?.component}
      <div
        in:fly={{ y: -16, easing: backOut, duration: 300 }}
        out:fly={{ y: -16, easing: backOut, duration: 300 }}
        class="flex flex-row gap-2 py-2 px-2 w-full overflow-auto justify-end"
        style="border-radius: inherit; grid-row: 1; grid-column: 1;"
      >
        <svelte:component
          this={$page.data.slots.nav.component}
          {...$page.data.slots.nav.props}
        />
        <NavButton
          adaptive={false}
          on:click={() => (layer -= 1)}
          label={$t('post.image.close')}
          icon={ChevronDoubleDown}
          class="sticky right-0 bg-zinc-900"
        />
      </div>
    {/if}
  </nav>
</div>

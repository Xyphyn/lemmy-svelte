<script lang="ts">
  import {
    ArrowLeftOnRectangle,
    Bookmark,
    Cog6Tooth,
    Identification,
    Inbox,
    UserCircle,
    UserGroup,
  } from 'svelte-hero-icons'
  import { notifications, profile, profileData } from '$lib/auth.svelte.js'
  import { settings } from '$lib/settings.svelte.js'
  import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
  import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
  import ProfileButton from '$lib/components/ui/sidebar/ProfileButton.svelte'
  import { flip } from 'svelte/animate'
  import { expoOut } from 'svelte/easing'
  import { Badge } from 'mono-svelte'
  import Expandable from '$lib/components/ui/Expandable.svelte'
  import EndPlaceholder from '../EndPlaceholder.svelte'
  import { t } from '$lib/translations'
  import { iconOfLink } from '../navbar/link'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'

  interface Props {
    style?: string
    class?: string
  }

  let { style = '', class: clazz = '' }: Props = $props()
</script>

<nav
  class="flex flex-col p-4 overflow-auto
  gap-1 h-fit max-h-screen {clazz}"
  {style}
>
  {#if settings.dock.pins?.length ?? 0 > 0}
    <div class="flex items-center flex-wrap gap-2 pl-1.5">
      {#each settings.dock.pins as pin}
        <SidebarButton
          icon={iconOfLink(pin.url)}
          onclick={() => goto(pin.url)}
          alignment="center"
          selected={`${$page.url.pathname}${$page.url.search}` == pin.url}
          oncontextmenu={(e) => {
            e.preventDefault()
            settings.dock.pins = settings.dock.pins.toSpliced(
              settings.dock.pins.findLastIndex((p) => pin.url == p.url),
              1,
            )
            return false
          }}
          size="square-md"
        ></SidebarButton>
      {/each}
    </div>
    <hr class="border-slate-200 dark:border-zinc-900 my-1" />
  {/if}
  {#if $profile?.jwt}
    <SidebarButton icon={UserCircle} href="/profile">
      {#snippet label()}
        <span>
          {$t('profile.profile')}
        </span>
      {/snippet}
    </SidebarButton>
    <SidebarButton icon={Inbox} href="/inbox">
      {#snippet label()}
        <span class="flex items-center gap-2">
          {$t('profile.inbox')}
          {#if $notifications.inbox}
            <Badge
              class="w-5 h-5 !p-0 grid place-items-center ml-auto"
              color="red-subtle"
            >
              {$notifications.inbox}
            </Badge>
          {/if}
        </span>
      {/snippet}
    </SidebarButton>
    <SidebarButton icon={Bookmark} href="/saved">
      {#snippet label()}
        <span>{$t('profile.saved')}</span>
      {/snippet}
    </SidebarButton>
  {:else}
    <SidebarButton
      href="/login"
      title={$t('account.login')}
      icon={ArrowLeftOnRectangle}
    >
      {#snippet label()}
        <span>{$t('account.login')}</span>
      {/snippet}
    </SidebarButton>
    <SidebarButton
      href="/signup"
      title={$t('account.signup')}
      icon={Identification}
    >
      {#snippet label()}
        <span>{$t('account.signup')}</span>
      {/snippet}
    </SidebarButton>
    <SidebarButton
      href="/settings"
      title={$t('nav.menu.settings')}
      icon={Cog6Tooth}
    >
      {#snippet label()}
        <span>{$t('nav.menu.settings')}</span>
      {/snippet}
    </SidebarButton>
  {/if}
  {#if $profileData.profiles.length >= 1}
    <hr class="border-slate-200 dark:border-zinc-900 my-1" />

    <Expandable
      class="max-w-full min-w-0 w-full"
      bind:open={settings.expand.accounts}
    >
      {#snippet title()}
        <span class="px-2 py-1 w-full">
          <EndPlaceholder>
            {$t('account.accounts')}
            {#snippet action()}
              <span class="dark:text-white text-black">
                {$profileData.profiles.length}
              </span>
            {/snippet}
          </EndPlaceholder>
        </span>
      {/snippet}
      {#each [...$profileData.profiles] as prof, index (prof.id)}
        <div animate:flip={{ duration: 300, easing: expoOut }} class="w-full">
          <ProfileButton {index} {prof} />
        </div>
      {/each}
      <SidebarButton href="/accounts" icon={UserGroup}>
        {$t('account.accounts')}
      </SidebarButton>
    </Expandable>
  {/if}
  <hr class="border-slate-200 dark:border-zinc-900 my-1" />
  {#if $profile?.favorites && $profile?.favorites.length > 0}
    <Expandable
      class="max-w-full min-w-0 w-full"
      bind:open={settings.expand.favorites}
    >
      {#snippet title()}
        <span
          class="px-2 py-1 w-full {settings.expandSidebar
            ? ''
            : '//max-lg:hidden'}"
        >
          <EndPlaceholder>
            {$t('routes.profile.favorites')}
            {#snippet action()}
              <span class="dark:text-white text-black">
                {$profile.favorites?.length}
              </span>
            {/snippet}
          </EndPlaceholder>
        </span>
      {/snippet}
      <CommunityList isFavorites items={$profile.favorites} />
    </Expandable>
    <hr class="border-slate-200 dark:border-zinc-900 my-1" />
  {/if}
  {#if $profile?.user}
    {#if $profile?.user.moderates.length > 0}
      <Expandable
        class="max-w-full min-w-0 w-full"
        bind:open={settings.expand.moderates}
      >
        {#snippet title()}
          <span
            class="px-2 py-1 w-full {settings.expandSidebar
              ? ''
              : '//max-lg:hidden'}"
          >
            <EndPlaceholder>
              {$t('routes.profile.moderates')}
              {#snippet action()}
                <span class="dark:text-white text-black">
                  {$profile.user?.moderates.length}
                </span>
              {/snippet}
            </EndPlaceholder>
          </span>
        {/snippet}
        <CommunityList
          items={$profile.user.moderates.map((i) => i.community)}
        />
      </Expandable>
      <hr class="border-slate-200 dark:border-zinc-900 my-1" />
    {/if}

    <Expandable
      class="max-w-full min-w-0 w-full"
      bind:open={settings.expand.communities}
    >
      {#snippet title()}
        <span
          class="px-2 py-1 w-full {settings.expandSidebar
            ? ''
            : '//max-lg:hidden'}"
        >
          <EndPlaceholder>
            {$t('profile.subscribed')}
            {#snippet action()}
              <span class="dark:text-white text-black">
                {$profile.user?.follows.length}
              </span>
            {/snippet}
          </EndPlaceholder>
        </span>
      {/snippet}
      <CommunityList items={$profile.user.follows.map((i) => i.community)} />
    </Expandable>
  {/if}
</nav>

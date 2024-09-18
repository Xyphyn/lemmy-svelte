<script lang="ts">
  import { page } from '$app/stores'
  import { profile } from '$lib/auth'
  import { t } from '$lib/translations'
  import { colorScheme } from '$lib/ui/colors'
  import { Menu, MenuButton } from 'mono-svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import {
    Bookmark,
    ChevronDoubleUp,
    ChevronDoubleDown,
    Cog6Tooth,
    ComputerDesktop,
    Icon,
    Inbox,
    Moon,
    Sun,
    Swatch,
    UserCircle,
    UserGroup,
    XMark,
  } from 'svelte-hero-icons'
  import { backOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  import NavButton from '../NavButton.svelte'

  const dispatch = createEventDispatcher<{ move: number }>()

  let flexbox: HTMLDivElement

  onMount(() => {
    flexbox.scrollLeft = flexbox.scrollWidth
  })
</script>

<div
  bind:this={flexbox}
  in:fly={{ y: -16, easing: backOut, duration: 300 }}
  out:fly={{ y: -16, easing: backOut, duration: 300 }}
  class="flex flex-row gap-2 py-2 px-2 w-full overflow-auto"
  style="border-radius: inherit; grid-row: 1; grid-column: 1;"
>
  <div class="flex-1" />
  <NavButton
    adaptive={false}
    href="/theme"
    label={$t('nav.menu.theme')}
    icon={Swatch}
  />
  <Menu>
    <NavButton
      slot="target"
      label={$t('nav.menu.colorscheme.label')}
      icon={$colorScheme == 'system'
        ? ComputerDesktop
        : $colorScheme == 'light'
          ? Sun
          : Moon}
      adaptive={false}
    />
    <MenuButton adaptive={false} on:click={() => colorScheme.set('system')}>
      <Icon src={ComputerDesktop} size="16" micro />
      {$t('nav.menu.colorscheme.system')}
    </MenuButton>
    <MenuButton adaptive={false} on:click={() => colorScheme.set('light')}>
      <Icon src={Sun} size="16" micro />
      {$t('nav.menu.colorscheme.light')}
    </MenuButton>
    <MenuButton adaptive={false} on:click={() => colorScheme.set('dark')}>
      <Icon src={Moon} size="16" micro />
      {$t('nav.menu.colorscheme.dark')}
    </MenuButton>
  </Menu>
  <NavButton
    adaptive={false}
    href="/settings"
    label={$t('nav.menu.settings')}
    icon={Cog6Tooth}
  />
  <!-- <hr
          class="flex-1 border-slate-200 dark:border-zinc-800 border-opacity-50"
        /> -->
  <NavButton
    adaptive={false}
    href="/accounts"
    label={$t('account.accounts')}
    icon={UserGroup}
  />
  {#if $profile.jwt}
    <NavButton
      adaptive={false}
      href="/saved"
      label={$t('profile.saved')}
      icon={Bookmark}
    />
    <NavButton
      adaptive={false}
      href="/inbox"
      label={$t('profile.inbox')}
      icon={Inbox}
    />
    <NavButton
      adaptive={false}
      href="/profile/user"
      label={$t('profile.profile')}
      icon={UserCircle}
    />
  {/if}
  {#if $page.data?.slots?.nav?.component}
    <NavButton
      adaptive={false}
      on:click={() => dispatch('move', 1)}
      label={$t('post.image.close')}
      icon={ChevronDoubleUp}
      class="sticky right-0 bg-zinc-900"
    />
  {/if}
  <NavButton
    adaptive={false}
    on:click={() => dispatch('move', -1)}
    label={$t('post.image.close')}
    icon={ChevronDoubleDown}
    class="sticky right-0 bg-zinc-900"
  />
</div>

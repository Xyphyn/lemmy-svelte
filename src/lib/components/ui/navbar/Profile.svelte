<script lang="ts">
  import { notifications, profile } from '$lib/auth'

  import {
    Badge,
    Button,
    Menu,
    MenuButton,
    MenuDivider,
    Modal,
    Select,
    Spinner,
    toast,
  } from 'mono-svelte'
  import Avatar from '../Avatar.svelte'
  import {
    Bars3,
    Bookmark,
    BugAnt,
    CodeBracketSquare,
    Cog6Tooth,
    ComputerDesktop,
    Heart,
    Icon,
    Inbox,
    InformationCircle,
    Moon,
    ServerStack,
    Sun,
    Swatch,
    UserCircle,
    UserGroup,
  } from 'svelte-hero-icons'
  import { colorScheme } from '$lib/ui/colors'
  import { userSettings } from '$lib/settings'
  import { site } from '$lib/lemmy'
  import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
  import { t } from '$lib/translations'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

  let showInstance = false
</script>

{#if showInstance}
  <Modal bind:open={showInstance} title="Instance">
    {#if $site}
      <SiteCard
        site={$site.site_view}
        admins={$site.admins}
        taglines={$site.taglines}
        version={$site.version}
      />
    {:else}
      <Spinner />
    {/if}
  </Modal>
{/if}

<Menu {...$$restProps}>
  <slot name="target" slot="target" />
  {#if $profile?.user}
    <UserLink
      user={$profile?.user.local_user_view.person}
      showInstance={false}
      avatar
      avatarSize={24}
      displayName={false}
      class="font-medium px-2 py-1 pointer-events-none"
    />
  {:else}
    <MenuDivider>{$t('nav.menu.label')}</MenuDivider>
  {/if}
  {#if $profile?.jwt}
    <MenuButton link href="/profile">
      <Icon src={UserCircle} micro width={16} slot="prefix" />
      {$t('profile.profile')}
    </MenuButton>
    <MenuButton link href="/inbox">
      <Icon src={Inbox} micro width={16} slot="prefix" />
      {$t('profile.inbox')}
      {#if $notifications.inbox > 0}
        <Badge color="red-subtle" class="text-xs ml-auto font-bold !py-0.5">
          {$notifications.inbox}
        </Badge>
      {/if}
    </MenuButton>
    <MenuButton link href="/saved">
      <Icon src={Bookmark} micro width={16} slot="prefix" />
      {$t('profile.saved')}
    </MenuButton>
  {/if}
  <MenuButton link href="/accounts">
    <Icon src={UserGroup} micro width={16} slot="prefix" />
    {$t('account.accounts')}
  </MenuButton>
  <MenuDivider>{$t('nav.menu.app')}</MenuDivider>
  <MenuButton link href="/settings">
    <Icon src={Cog6Tooth} micro width={16} slot="prefix" />
    {$t('nav.menu.settings')}
  </MenuButton>
  <MenuButton class="!py-0">
    <Icon
      src={$colorScheme == 'system'
        ? ComputerDesktop
        : $colorScheme == 'light'
          ? Sun
          : $colorScheme == 'dark'
            ? Moon
            : Moon}
      micro
      size="16"
      slot="prefix"
    />
    <span>{$t('nav.menu.colorscheme.label')}</span>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="contents" on:click|stopPropagation={() => {}}>
      <Select bind:value={$colorScheme} class="ml-auto my-auto w-24" size="sm">
        <option value="system">
          <Icon src={ComputerDesktop} size="16" micro />
          {$t('nav.menu.colorscheme.system')}
        </option>
        <option value="light">
          <Icon src={Sun} size="16" micro />
          {$t('nav.menu.colorscheme.light')}
        </option>
        <option value="dark">
          <Icon src={Moon} size="16" micro />
          {$t('nav.menu.colorscheme.dark')}
        </option>
      </Select>
    </div>
  </MenuButton>
  <MenuButton href="/theme">
    <Icon src={Swatch} size="16" micro slot="prefix" />
    {$t('nav.menu.theme')}
  </MenuButton>
  {#if $userSettings.debugInfo}
    <MenuButton link href="/util">
      <Icon src={BugAnt} mini width={16} slot="prefix" />
      Debug
    </MenuButton>
  {/if}
  <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
  <li class="flex flex-col px-2 py-1 mx-auto my-1 text-xs w-full">
    <div class="flex flex-row gap-2 w-full items-center">
      <!-- svelte-ignore missing-declaration -->
      <div class="flex-1">
        <button
          class="hover:brightness-110 transition-all"
          on:click={() => {
            navigator?.clipboard?.writeText(__VERSION__)
            toast({ content: $t('toast.copied') })
          }}
        >
          <Badge color="blue-subtle">{__VERSION__}</Badge>
        </button>
      </div>
      <Button
        on:click={() => (showInstance = !showInstance)}
        color="tertiary"
        title={$t('nav.menu.instance')}
        size="square-md"
      >
        <Icon src={ServerStack} size="16" micro />
      </Button>
      <Button
        color="tertiary"
        href="https://buymeacoffee.com/xylight"
        title={$t('nav.menu.donate')}
        size="square-md"
      >
        <Icon src={Heart} size="16" micro />
      </Button>
      <Button
        color="tertiary"
        href="https://github.com/Xyphyn/Photon"
        title={$t('nav.menu.source')}
        size="square-md"
      >
        <Icon src={CodeBracketSquare} size="16" micro />
      </Button>
    </div>
  </li>
</Menu>

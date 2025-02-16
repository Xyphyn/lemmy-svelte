<script lang="ts">
  import { stopPropagation } from 'svelte/legacy'

  import { notifications, profile } from '$lib/auth.svelte'

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
  import { theme } from '$lib/ui/colors.svelte'
  import { settings } from '$lib/settings.svelte'
  import { site } from '$lib/lemmy.svelte'
  import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
  import { t } from '$lib/translations'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import Option from 'mono-svelte/forms/select/Option.svelte'
  import { env } from '$env/dynamic/public'

  let showInstance = $state(false)

  interface Props {
    buttonClass?: string
    [key: string]: any
  }

  let { buttonClass = '', ...rest }: Props = $props()
</script>

{#if showInstance}
  <Modal bind:open={showInstance} title="Instance">
    {#if site.data}
      <SiteCard
        site={site.data.site_view}
        admins={site.data.admins}
        taglines={site.data.taglines}
        version={site.data.version}
      />
    {:else}
      <Spinner />
    {/if}
  </Modal>
{/if}

<Menu {...rest}>
  {#snippet target()}
    <button
      class="w-10 h-10 rounded-full border-slate-200 dark:border-zinc-700
      transition-all bg-slate-50 dark:bg-zinc-900 relative
      hover:bg-slate-200 hover:dark:bg-zinc-700 {buttonClass}"
      title={$t('profile.profile')}
    >
      {#if profile.data?.user}
        <div
          class="w-full h-full aspect-square object-cover rounded-full grid place-items-center"
        >
          <Avatar
            url={profile.data.user.local_user_view.person.avatar}
            width={32}
            alt={profile.data.user.local_user_view.person.name}
          />
        </div>
        {#if $notifications.inbox > 0}
          <div
            class="rounded-full w-2 h-2 bg-red-500 absolute top-0 left-0 z-10"
          ></div>
        {/if}
      {:else}
        <div class="w-full h-full grid place-items-center">
          <Icon src={Bars3} micro size="18" />
        </div>
      {/if}
    </button>
  {/snippet}
  <MenuDivider>{$t('nav.menu.label')}</MenuDivider>
  {#if profile.data?.jwt}
    <MenuButton link href="/profile">
      {#snippet prefix()}
        <Icon src={UserCircle} micro width={16} />
      {/snippet}
      {$t('profile.profile')}
    </MenuButton>
    <MenuButton link href="/inbox">
      {#snippet prefix()}
        <Icon src={Inbox} micro width={16} />
      {/snippet}
      {$t('profile.inbox')}
      {#if $notifications.inbox > 0}
        <Badge color="red-subtle" class="text-xs ml-auto font-bold !py-0.5">
          {$notifications.inbox}
        </Badge>
      {/if}
    </MenuButton>
    <MenuButton link href="/saved">
      {#snippet prefix()}
        <Icon src={Bookmark} micro width={16} />
      {/snippet}
      {$t('profile.saved')}
    </MenuButton>
  {/if}
  <MenuButton link href="/accounts">
    {#snippet prefix()}
      <Icon src={UserGroup} micro width={16} />
    {/snippet}
    {$t('account.accounts')}
  </MenuButton>
  <MenuDivider>{$t('nav.menu.app')}</MenuDivider>
  <MenuButton link href="/settings">
    {#snippet prefix()}
      <Icon src={Cog6Tooth} micro width={16} />
    {/snippet}
    {$t('nav.menu.settings')}
  </MenuButton>
  <MenuButton class="!py-0">
    {#snippet prefix()}
      <Icon
        src={theme.colorScheme == 'system'
          ? ComputerDesktop
          : theme.colorScheme == 'light'
            ? Sun
            : theme.colorScheme == 'dark'
              ? Moon
              : Moon}
        micro
        size="16"
      />
    {/snippet}
    <span>{$t('nav.menu.colorscheme.label')}</span>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="contents" onclick={stopPropagation(() => {})}>
      <Select
        bind:value={theme.colorScheme}
        class="ml-auto my-auto w-24"
        size="sm"
      >
        <Option value="system" icon={ComputerDesktop}>
          {$t('nav.menu.colorscheme.system')}
        </Option>
        <Option value="light" icon={Sun}>
          {$t('nav.menu.colorscheme.light')}
        </Option>
        <Option value="dark" icon={Moon}>
          {$t('nav.menu.colorscheme.dark')}
        </Option>
      </Select>
    </div>
  </MenuButton>
  <MenuButton href="/theme">
    {#snippet prefix()}
      <Icon src={Swatch} size="16" micro />
    {/snippet}
    {$t('nav.menu.theme')}
  </MenuButton>
  {#if settings.debugInfo}
    <MenuButton link href="/util">
      {#snippet prefix()}
        <Icon src={BugAnt} mini width={16} />
      {/snippet}
      Debug
    </MenuButton>
  {/if}
  <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
  <li class="flex flex-col px-2 py-1 mx-auto my-1 text-xs w-full">
    <div class="flex flex-row gap-2 w-full items-center">
      <div class="flex-1">
        <button
          class="hover:brightness-110 transition-all"
          onclick={() => {
            navigator?.clipboard?.writeText(__VERSION__)
            toast({ content: $t('toast.copied') })
          }}
        >
          <Badge color="blue-subtle">{__VERSION__}</Badge>
        </button>
      </div>
      <Button
        onclick={() => (showInstance = !showInstance)}
        color="tertiary"
        title={$t('nav.menu.instance')}
        size="square-md"
      >
        <Icon src={ServerStack} size="16" micro />
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

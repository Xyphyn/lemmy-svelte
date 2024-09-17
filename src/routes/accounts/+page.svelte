<script lang="ts">
  import {
    profileData,
    setUserID,
    profile as currentProfile,
    deleteProfile,
    moveProfile,
    type Profile,
    profile,
  } from '$lib/auth.js'
  import EditableList from '$lib/components/ui/list/EditableList.svelte'
  import { Menu, MenuButton, Modal } from 'mono-svelte'
  import DebugObject from '$lib/components/util/debug/DebugObject.svelte'
  import { DEFAULT_INSTANCE_URL, LINKED_INSTANCE_URL } from '$lib/instance.js'
  import ProfileAvatar from '$lib/lemmy/ProfileAvatar.svelte'
  import { userSettings } from '$lib/settings.js'
  import { Button, Badge, Spinner } from 'mono-svelte'
  import {
    ArrowLeftOnRectangle,
    ArrowRightOnRectangle,
    ArrowsRightLeft,
    ArrowUturnLeft,
    BugAnt,
    Check,
    ChevronDown,
    ChevronUp,
    EllipsisHorizontal,
    Icon,
    Identification,
    PaintBrush,
    Plus,
    Inbox,
  } from 'svelte-hero-icons'
  import { flip } from 'svelte/animate'
  import { expoOut } from 'svelte/easing'
  import { t } from '$lib/translations'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import FilterTabs from '$lib/components/ui/tabs/FilterTabs.svelte'
  import { fly, slide } from 'svelte/transition'
  import { client } from '$lib/lemmy'
  import ProgressBar from '$lib/components/ui/ProgressBar.svelte'

  let debugging = false
  let debugProfile: Profile | undefined = undefined

  let removing = {
    shown: false,
    account: undefined as Profile | undefined,
  }

  let switching = -2

  let notifications: Map<number, number | null> = new Map()
  let checking = false
  let progress = 0
  async function checkAllInboxes() {
    const profiles = $profileData.profiles.filter((i) => i.jwt != undefined)
    progress = 0

    await Promise.all(
      profiles.map(
        (profile) =>
          new Promise(async (res, rej) => {
            notifications.set(profile.id, null)
            const response = await client({
              auth: profile.jwt,
              instanceURL: profile.instance,
            }).getUnreadCount()

            progress += 1 / profiles.length
            progress = progress

            notifications.set(
              profile.id,
              response.mentions + response.private_messages + response.replies
            )
            notifications = notifications

            res(
              response.mentions + response.private_messages + response.replies
            )
          })
      )
    )

    progress = 0
  }
</script>

<svelte:head>
  <title>{$t('routes.accounts')}</title>
</svelte:head>

{#if debugging}
  <DebugObject
    object={debugProfile?.id == $profile?.id ? $profile : debugProfile}
    bind:open={debugging}
  >
    <span slot="title" class="flex flex-col">
      <h1 class="font-bold text-2xl">Debug</h1>
      <span class="text-slate-600 dark:text-zinc-400 text-base font-normal">
        Do NOT share anything from this menu.
      </span>
    </span>
  </DebugObject>
{/if}

{#if removing.shown && removing.account}
  <Modal bind:open={removing.shown}>
    <span slot="title">Removing Account</span>
    <div class="flex flex-row items-center gap-2">
      <ProfileAvatar profile={removing.account} selected={true} />

      <div class="flex flex-col">
        <span class="font-bold">{removing.account.username}</span>
        <span class="text-sm text-slate-600 dark:text-zinc-400">
          {removing.account.instance}
        </span>
      </div>
    </div>
    <p>This removes the account from Photon, it does not delete the account.</p>
    <div class="flex flex-row gap-2 items-center">
      <Button
        size="lg"
        class="flex-1"
        on:click={() => (removing.shown = false)}
      >
        Cancel
      </Button>
      <Button
        on:click={() => {
          removing.shown = false
          if (removing.account) deleteProfile(removing.account.id)
        }}
        size="lg"
        class="flex-1"
        color="danger"
      >
        Remove
      </Button>
    </div>
  </Modal>
{/if}

{#if $profileData.profiles.length == 0}
  <div class="h-max flex items-center justify-center my-auto">
    <div
      class="flex flex-col justify-center items-center py-8 gap-4
      my-auto"
    >
      <div class="flex flex-col items-center">
        <Icon src={ArrowLeftOnRectangle} size="48" solid />
        <h1 class="font-bold text-3xl">No accounts</h1>
      </div>
      <div class="flex flex-row items-center gap-2">
        <Button href="/login" size="lg">
          <Icon slot="prefix" src={ArrowLeftOnRectangle} size="16" mini />
          Log in
        </Button>
        <Button href="/signup" size="lg">
          <Icon slot="prefix" src={Identification} size="16" mini />
          Sign up
        </Button>
      </div>
    </div>
  </div>
{:else}
  <div class="flex flex-col h-full gap-4">
    <Header pageHeader>
      {$t('routes.accounts')}
      <div class="flex" slot="extended">
        <div class="flex gap-2 mr-auto flex-wrap">
          <Button href="/login" size="lg" class="px-8" color="primary">
            <Icon slot="prefix" src={ArrowLeftOnRectangle} size="16" mini />
            {$t('account.login')}
          </Button>
          {#if !LINKED_INSTANCE_URL}
            <Button href="/login/guest" size="lg">
              <Icon slot="prefix" src={Plus} size="16" mini />
              {$t('account.addGuest')}
            </Button>
          {/if}
          {#if $profileData.profiles.length > 1}
            <Button
              loading={checking}
              disabled={checking}
              on:click={checkAllInboxes}
              size="lg"
            >
              <Icon slot="prefix" src={Inbox} size="16" mini />
              {$t('account.checkInboxes')}
            </Button>
          {/if}
        </div>
      </div>
    </Header>
    {#if progress != 0}
      <div class="w-full h-1" transition:slide={{ axis: 'y' }}>
        <ProgressBar bind:progress />
      </div>
    {/if}
    <FilterTabs items={$profileData.profiles} id={(i) => i.instance} let:items>
      <EditableList
        on:action={(acc) => {
          removing.account = acc.detail
          removing.shown = !removing.shown
        }}
        let:action
      >
        {#each items as profile, index (profile.id)}
          <div
            class="flex flex-row gap-2 items-center py-3"
            animate:flip={{ duration: 500, easing: expoOut }}
          >
            <Button
              title={profile.id == $currentProfile?.id ? 'Switch' : 'Current'}
              on:click={async () => {
                if (profile.id != $currentProfile?.id) {
                  switching = profile.id
                  await setUserID(profile.id)
                  switching = -69
                }
              }}
              size="square-md"
              color={profile.id == $currentProfile?.id ? 'primary' : 'ghost'}
              loading={switching == profile.id}
              disabled={switching == profile.id}
              rounding="pill"
            >
              <svelte:fragment slot="prefix">
                {#if profile.id == $currentProfile?.id}
                  <Icon src={Check} mini size="16" />
                {:else}
                  <Icon src={ArrowsRightLeft} size="16" mini />
                {/if}
              </svelte:fragment>
            </Button>
            <div class="flex items-center gap-2">
              <div class="relative group flex-col items-center">
                <ProfileAvatar
                  {profile}
                  {index}
                  selected={$currentProfile?.id == profile.id}
                  size={24}
                />
                <div
                  class="absolute top-0 left-0 w-full h-full opacity-0
                grid group-hover:opacity-100 z-20 place-items-center
                bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full
                transition-all"
                >
                  <Icon src={PaintBrush} mini size="14" />
                </div>
                <input
                  type="color"
                  class="opacity-0 absolute top-0 left-0 h-full w-full rounded-full cursor-pointer z-30"
                  bind:value={profile.color}
                />
              </div>
              <div class="flex flex-col">
                <span class="font-medium">{profile.username}</span>
                <span class="text-sm text-slate-600 dark:text-zinc-400">
                  {profile.instance}
                </span>
              </div>
            </div>
            <div class="flex-1" />
            {#if typeof notifications.get(profile.id) !== 'undefined'}
              {@const count = notifications.get(profile.id)}
              {#if count === null}
                <Spinner width={20} />
              {:else if count ?? 0 > 0}
                <Badge
                  class="w-6 h-6 grid place-items-center !p-0"
                  color="red-subtle"
                >
                  {count}
                </Badge>
              {/if}
            {/if}
            <Menu placement="bottom-end">
              <Button size="square-md" slot="target">
                <Icon src={EllipsisHorizontal} mini size="16" slot="prefix" />
              </Button>
              <div class="px-4 py-2 flex items-center gap-2">
                <Button
                  size="square-md"
                  color="secondary"
                  title={$t('account.moveUp')}
                  on:click={() => moveProfile(profile.id, true)}
                >
                  <Icon src={ChevronUp} size="16" mini slot="prefix" />
                </Button>
                <Button
                  size="square-md"
                  color="secondary"
                  title={$t('account.moveDown')}
                  on:click={() => moveProfile(profile.id, false)}
                >
                  <Icon src={ChevronDown} size="16" mini slot="prefix" />
                </Button>
              </div>
              <MenuButton
                disabled={!profile.color}
                on:click={() => (profile.color = undefined)}
              >
                <Icon src={ArrowUturnLeft} size="16" mini slot="prefix" />
                {$t('account.resetColor')}
              </MenuButton>
              {#if $userSettings.debugInfo}
                <MenuButton
                  on:click={() => {
                    debugProfile = profile
                    debugging = !debugging
                  }}
                >
                  <Icon src={BugAnt} size="16" mini slot="prefix" />
                  {$t('common.debug')}
                </MenuButton>
              {/if}
              {#if !LINKED_INSTANCE_URL || profile.user}
                <MenuButton
                  on:click={() => action(profile)}
                  color="danger-subtle"
                >
                  <Icon
                    slot="prefix"
                    src={ArrowRightOnRectangle}
                    size="16"
                    mini
                  />
                  {$t('account.logout')}
                </MenuButton>
              {/if}
            </Menu>
          </div>
        {/each}
      </EditableList>
    </FilterTabs>
  </div>
{/if}

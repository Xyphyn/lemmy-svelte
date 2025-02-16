<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { profile, setUserID, type Profile } from '$lib/auth.svelte.js'
  import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
  import { LINKED_INSTANCE_URL } from '$lib/instance.svelte'
  import ProfileAvatar from '$lib/lemmy/ProfileAvatar.svelte'
  import { Button } from 'mono-svelte'
  import { Icon, QuestionMarkCircle } from 'svelte-hero-icons'

  let switching: boolean = $state(false)
  interface Props {
    prof: Profile
    index: number
    guest?: boolean
  }

  let { prof, index, guest = false }: Props = $props()
</script>

<SidebarButton
  color="tertiary"
  alignment="left"
  loading={switching}
  loaderWidth={20}
  selected={profile.data?.id == prof.id}
  onclick={async () => {
    switching = true

    if (profile.data?.id != prof.id) {
      await setUserID(prof.id)
    }

    await goto(page.url, {
      invalidateAll: true,
    })

    switching = false
  }}
  class="w-full font-normal {profile.data?.id == prof.id
    ? '!bg-slate-100 dark:!bg-zinc-900'
    : ''}"
>
  {#snippet customIcon()}
    <ProfileAvatar
      profile={prof}
      {index}
      {guest}
      selected={profile.data?.id == prof.id}
    />
  {/snippet}
  <span
    class="inline-flex flex-col gap-0 {profile.data?.id == prof.id
      ? 'font-semibold'
      : ''}"
  >
    {prof.username ?? prof.user?.local_user_view.person.name}
    {#if !guest && !LINKED_INSTANCE_URL}
      <span class="text-slate-500 dark:text-zinc-400 font-normal text-xs">
        {prof.instance}
      </span>
    {/if}
  </span>
  {#if !prof.jwt}
    <Icon src={QuestionMarkCircle} size="14" micro class="ml-auto opacity-50" />
  {/if}
</SidebarButton>

<script lang="ts">
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { Icon, Plus, Trash } from 'svelte-hero-icons'
  import type { PageData } from './$types.js'
  import { profile } from '$lib/auth.svelte.js'
  import { toast } from 'mono-svelte'
  import { client, getClient } from '$lib/lemmy.svelte.js'
  import { flip } from 'svelte/animate'
  import { Button, TextInput } from 'mono-svelte'
  import { t } from '$lib/translations.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'

  interface Props {
    data: PageData
  }

  let { data: pageData }: Props = $props()
  let data = $state(pageData)

  let formData = $state({
    newModerator: '',
    addingModerator: false,
  })

  async function addModerator() {
    if (!profile.data?.jwt) return

    formData.addingModerator = true

    try {
      if (Number(formData.newModerator)) {
        const addModRes = await getClient().addModToCommunity({
          added: true,
          person_id: Number(formData.newModerator),
          community_id: data.community.community_view.community.id,
        })

        data.community.moderators = addModRes.moderators
        toast({
          content: $t('toast.addMod'),
          type: 'success',
        })

        formData.newModerator = ''
      } else if (formData.newModerator) {
        const res = await getClient().resolveObject({
          q: formData.newModerator,
        })

        if (res.person) {
          const addModRes = await getClient().addModToCommunity({
            added: true,
            person_id: res.person.person.id,
            community_id: data.community.community_view.community.id,
          })

          data.community.moderators = addModRes.moderators

          toast({
            content: $t('toast.addMod'),
            type: 'success',
          })

          formData.newModerator = ''
        } else {
          toast({
            content: $t('toast.failFindUser'),
            type: 'warning',
          })
        }
      }
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    formData.addingModerator = false
  }

  async function removeMod(id: number) {
    if (!profile.data?.jwt) return

    try {
      const res = await getClient().addModToCommunity({
        added: false,
        community_id: data.community.community_view.community.id,
        person_id: id,
      })

      data.community.moderators = res.moderators

      toast({
        content: $t('toast.updateMods'),
        type: 'success',
      })
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }
  }
</script>

<Header pageHeader>Moderators</Header>
<ul class="divide-y divide-slate-200 dark:divide-zinc-800">
  {#each data.community.moderators as moderator (moderator.moderator.id)}
    <div
      class="py-4 flex items-center gap-2 justify-between"
      animate:flip={{ duration: 300 }}
    >
      <div class="flex gap-2 items-center">
        <Avatar
          width={28}
          url={moderator.moderator.avatar}
          alt={moderator.moderator.name}
        />
        <div class="flex flex-col gap-0">
          <UserLink user={moderator.moderator} showInstance={false} />
          <span class="text-xs text-slate-600 dark:text-zinc-400">
            {new URL(moderator.moderator.actor_id).hostname}
          </span>
        </div>
      </div>
      <Button
        size="square-md"
        onclick={() => {
          toast({
            content: `Are you sure you want to remove ${moderator.moderator.name} as a moderator?`,
            action: () => removeMod(moderator.moderator.id),
          })
        }}
      >
        <Icon src={Trash} mini size="16" />
      </Button>
    </div>
  {/each}
</ul>
<form
  onsubmit={(e) => {
    e.preventDefault()
    addModerator()
  }}
  class="mt-auto flex gap-2 w-full"
>
  <TextInput
    bind:value={formData.newModerator}
    class="w-full"
    placeholder="@user@example.com"
  />
  <Button
    loading={formData.addingModerator}
    disabled={formData.addingModerator}
    size="lg"
    class="w-max flex-shrink-0"
    color="primary"
    submit
  >
    {#snippet prefix()}
      <Icon src={Plus} micro size="16" />
    {/snippet} Add moderator
  </Button>
</form>

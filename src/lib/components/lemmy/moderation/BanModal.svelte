<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import Avatar from '$lib/components/ui/Avatar.svelte'
  import type { Community, Person, PersonView } from 'lemmy-js-client'
  import { getClient } from '$lib/lemmy.svelte.js'
  import { toast } from 'mono-svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { Button, Checkbox, Modal, TextInput } from 'mono-svelte'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { t } from '$lib/translations'
  import CommunityLink from '../community/CommunityLink.svelte'
  import Duration from '$lib/components/form/Duration.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'

  interface Props {
    open?: boolean
    user: Person | undefined
    community: Community | undefined
    banned: boolean
  }

  let {
    open = $bindable(false),
    user: item = $bindable(),
    community,
    banned,
  }: Props = $props()

  let reason = $state('')
  let deleteData = $state(false)
  let expires = $state(-1)
  let loading = $state(false)

  // hack due to svelte's reactive declarations
  const resetReason = () => {
    reason = ''
    deleteData = false
    expires = -1
  }

  $effect(() => {
    if (item) resetReason()
  })

  async function submit() {
    if (!item || !profile.data?.user || !profile.data?.jwt) return

    loading = true

    try {
      let date: number | undefined

      if (expires > 0) {
        date = Math.floor(Date.now() / 1000) + expires
      }

      if (community) {
        await getClient().banFromCommunity({
          ban: !banned,
          community_id: community.id,
          person_id: item.id,
          reason: reason || undefined,
          remove_data: deleteData,
          expires: date,
        })
      } else {
        await getClient().banPerson({
          ban: !banned,
          person_id: item.id,
          reason: reason || undefined,
          remove_data: deleteData,
          expires: date,
        })
      }

      open = false

      toast({
        content: banned ? $t('toast.unbannedUser') : $t('toast.bannedUser'),
        type: 'success',
      })

      item.banned = !banned
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    loading = false
  }
</script>

<Modal
  bind:open
  title={banned ? $t('moderation.ban.unbanning') : $t('moderation.ban.banning')}
>
  {#if item}
    <form class="flex flex-col gap-4" onsubmit={preventDefault(submit)}>
      <div class="flex items-center gap-1">
        <Avatar url={item.avatar} alt={item.name} width={24} />
        <span class="font-bold">{item.name}</span>
      </div>
      {#if community}
        <CommunityLink {community} avatar />
      {/if}
      <MarkdownEditor
        required
        bind:value={reason}
        label={$t('moderation.reason')}
      />
      {#if !banned}
        <Checkbox bind:checked={deleteData}>
          {$t('moderation.ban.deleteData')}
          {#snippet description()}
            {$t('moderation.ban.warning')}
          {/snippet}
        </Checkbox>
        <div>
          <SectionTitle>{$t('moderation.ban.expires')}</SectionTitle>
          <Duration bind:value={expires}></Duration>
        </div>
      {/if}
      <Button submit color="primary" {loading} disabled={loading} size="lg">
        {$t('form.submit')}
      </Button>
    </form>
  {/if}
</Modal>

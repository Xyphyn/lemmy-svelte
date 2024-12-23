<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import Avatar from '$lib/components/ui/Avatar.svelte'
  import type { Community, Person, PersonView } from 'lemmy-js-client'
  import { getClient } from '$lib/lemmy.js'
  import { toast } from 'mono-svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { Button, Checkbox, Modal, TextInput } from 'mono-svelte'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { t } from '$lib/translations'
  import CommunityLink from '../community/CommunityLink.svelte'

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
  let expires = $state('')

  let loading = $state(false)

  // hack due to svelte's reactive declarations
  const resetReason = () => {
    reason = ''
    deleteData = false
    expires = ''
  }

  run(() => {
    if (item) resetReason()
  })

  async function submit() {
    if (!item || !$profile?.user || !$profile?.jwt) return

    loading = true

    try {
      let date: number | undefined

      if (expires != '') {
        date = Date.parse(expires)
        if (Number.isNaN(date)) {
          toast({
            content: $t('toast.invalidDateAbsolute'),
            type: 'error',
          })

          loading = false

          return
        }

        if (date < Date.now()) {
          toast({
            content: $t('toast.invalidDateBeforeCurrent'),
            type: 'error',
          })

          loading = false
          return
        }
      }

      if (community) {
        await getClient().banFromCommunity({
          ban: !banned,
          community_id: community.id,
          person_id: item.id,
          reason: reason || undefined,
          remove_data: deleteData,
          expires: date ? Math.floor(date / 1000) : undefined,
        })
      } else {
        await getClient().banPerson({
          ban: !banned,
          person_id: item.id,
          reason: reason || undefined,
          remove_data: deleteData,
          expires: date ? Math.floor(date / 1000) : undefined,
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
        <TextInput
          bind:value={expires}
          label={$t('moderation.ban.expires')}
          placeholder="2024 August 5"
        />
      {/if}
      <Button submit color="primary" {loading} disabled={loading} size="lg">
        {$t('form.submit')}
      </Button>
    </form>
  {/if}
</Modal>

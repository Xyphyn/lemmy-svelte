<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { t } from '$lib/translations'
  import type { Person } from 'lemmy-js-client'
  import { Button, Modal } from 'mono-svelte'

  interface Props {
    open?: boolean
    user: Person
    denying: boolean
    denyReason?: string
  }

  let {
    open = $bindable(false),
    user,
    denying = $bindable(),
    denyReason = $bindable(''),
  }: Props = $props()

  let loading = false

  function deny() {
    denying = true
    open = false
  }
</script>

<Modal bind:open>
  {#snippet customTitle()}
    <h1 class="text-2xl font-bold">
      {$t('routes.admin.applications.modalTitle')}
    </h1>
  {/snippet}
  <form onsubmit={preventDefault(() => deny())} class="flex flex-col gap-4">
    <UserLink avatar {user} />
    <MarkdownEditor
      bind:value={denyReason}
      label={$t('routes.admin.applications.reason')}
      rows={4}
    />
    <Button color="primary" size="lg" submit {loading} disabled={loading}>
      {$t('routes.admin.applications.deny')}
    </Button>
  </form>
</Modal>

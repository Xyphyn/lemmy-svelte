<script lang="ts">
  import { run } from 'svelte/legacy'

  import Button from '../button/Button.svelte'
  import Modal from '../modal/Modal.svelte'
  import { Icon } from 'svelte-hero-icons'
  import { shownModal } from './modal.js'

  let open = $state(false)

  // reactivity hack
  run(() => {
    open = $shownModal ? true : false
  })
</script>

{#if $shownModal}
  <Modal
    title={$shownModal.title}
    dismissable={$shownModal.dismissable}
    on:dismissed={() => shownModal.set(undefined)}
    bind:open
  >
    <p>{$shownModal.body}</p>
    {#if $shownModal.actions}
      <div
        class="flex items-center gap-2 {$shownModal.actions.length >= 3
          ? 'flex-col'
          : 'flex-row'}"
      >
        {#each $shownModal.actions as action}
          <Button
            size="lg"
            class="flex-1 w-full"
            onclick={action.action}
            color={action.type}
          >
            {#if action.icon}
              <Icon src={action.icon} mini size="16" />
            {/if}
            {action.content}
          </Button>
        {/each}
      </div>
    {/if}
  </Modal>
{/if}

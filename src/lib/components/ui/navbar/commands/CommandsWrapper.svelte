<script lang="ts">
  import { t } from '$lib/translations'
  import { Modal, Spinner } from 'mono-svelte'
  import Commands from './Commands.svelte'
  import { CommandLine, Icon } from 'svelte-hero-icons'

  interface Props {
    open?: boolean
  }

  let { open = $bindable(false) }: Props = $props()

  function handleKeydown(event: KeyboardEvent) {
    if (
      (event.ctrlKey && event.key === 'p') ||
      (event.key == '/' && document.activeElement == document.body)
    ) {
      event.preventDefault()
      open = !open
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <Modal bind:open title={null} class="!p-0 !gap-0">
    {#await import('./Commands.svelte')}
      <div class="h-[32rem] flex flex-col gap-2 items-center justify-center">
        <Spinner width={32} />
        <span class="font-medium text-lg">
          {$t('nav.commands.downloading')}
        </span>
      </div>
    {:then { default: Commands }}
      <Commands bind:open />
    {/await}
  </Modal>
{/if}

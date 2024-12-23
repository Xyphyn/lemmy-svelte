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
  <Modal bind:open>
    {#snippet customTitle()}
      <span class="flex items-center gap-1">
        <svg
          width="24"
          height="24"
          fill="currentColor"
          viewBox="15 15 70 70"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M45 20.8868C48.094 19.1004 51.906 19.1004 55 20.8868L72.7128 31.1132C75.8068 32.8996 77.7128 36.2008 77.7128 39.7735V60.2265C77.7128 63.7992 75.8068 67.1004 72.7128 68.8867L55 79.1133C51.906 80.8996 48.094 80.8996 45 79.1133L27.2872 68.8867C24.1932 67.1004 22.2872 63.7992 22.2872 60.2265V39.7735C22.2872 36.2008 24.1932 32.8996 27.2872 31.1132L45 20.8868Z"
          />
        </svg>
        {$t('nav.commands.prompt')}
      </span>
    {/snippet}
    {#await import('./Commands.svelte')}
      <div class="h-96 flex flex-col gap-2 items-center justify-center">
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

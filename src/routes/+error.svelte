<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { errorMessage } from '$lib/lemmy/error'
  import { t } from '$lib/translations'
  import { Button } from 'mono-svelte'
  import { Icon, XMark } from 'svelte-hero-icons'

  function getError(message: string): { string: string; code: boolean } {
    try {
      return { string: errorMessage(JSON.parse(message)), code: false }
    } catch (e) {
      return { string: message, code: true }
    }
  }
</script>

<div
  class="flex flex-col gap-4 my-auto h-full justify-center max-w-md w-full mx-auto"
>
  <h1
    class="text-primary-900 dark:text-primary-100 text-6xl font-black flex items-center flex-row gap-2
    font-display border-b pb-4 border-slate-200 dark:border-zinc-800"
  >
    {$page.status}
  </h1>
  {#if $page?.error?.message}
    {@const error = getError($page?.error?.message)}
    {#if error.code}
      <code class="rounded-md dark:!bg-zinc-950 px-2 py-1 min-w-48">
        {error.string}
      </code>
    {:else}
      <p class="text-lg">
        {error.string}
      </p>
    {/if}
  {/if}
  <div class="flex items-center gap-2">
    <Button
      rounding="xl"
      onclick={() => goto($page.url, { invalidateAll: true })}
    >
      {$t('message.retry')}
    </Button>
    <Button rounding="xl" href="/">
      {$t('nav.home')}
    </Button>
  </div>
</div>

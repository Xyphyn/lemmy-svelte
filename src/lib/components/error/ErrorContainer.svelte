<script lang="ts" module>
  import { writable } from 'svelte/store'

  interface PageScopedError {
    scope: string
    message: string
  }

  export let errors = writable<PageScopedError[]>([])

  export function pushError(args: { scope: string; message: string }) {
    errors.update((e) => [...e, args])
  }

  export function clearErrorScope(scope: string | null | undefined) {
    errors.update((errors) => errors.filter((error) => error.scope != scope))
  }
</script>

<script lang="ts">
  import { Button } from 'mono-svelte'
  import { ExclamationCircle, Icon, XCircle, XMark } from 'svelte-hero-icons'
  import { fly, slide } from 'svelte/transition'
  import { expoOut } from 'svelte/easing'
  import { onDestroy } from 'svelte'

  onDestroy(() => {
    clearErrorScope(scope)
  })
  interface Props {
    scope?: string | undefined | null
    class?: string
  }

  let { scope = undefined, class: clazz = '' }: Props = $props()

  let scopedErrors = $derived(
    $errors.filter((e) => e.scope == scope || e.scope == 'global'),
  )
</script>

{#if scopedErrors.length > 0}
  <div
    class={clazz}
    in:slide={{ duration: 400, easing: expoOut }}
    out:slide={{ duration: 400, delay: 400, easing: expoOut }}
  >
    <div
      class="flex flex-row p-1.5 bg-red-500/20 rounded-3xl border border-red-500/50 gap-2 items-center"
      in:fly={{ y: -8, duration: 400, delay: 200, opacity: 0, easing: expoOut }}
      out:fly={{ y: -8, duration: 400, opacity: 0, easing: expoOut }}
    >
      <div class="rounded-full p-0.5 bg-red-400">
        <Icon
          src={XMark}
          class="text-red-500 dark:text-red-400 p-px rounded-full bg-white dark:bg-zinc-950"
          size="20"
          micro
        />
      </div>
      <div class="flex flex-col text-sm">
        {#each scopedErrors as error}
          {error.message}
        {/each}
      </div>
      <Button
        onclick={() => clearErrorScope(scope)}
        color="tertiary"
        size="square-sm"
        class="ml-auto"
      >
        <Icon src={XMark} size="16" micro />
      </Button>
    </div>
  </div>
{/if}

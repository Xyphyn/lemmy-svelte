<script lang="ts">
  import { Button } from '../index.js'
  import { Check, Icon, Clipboard } from 'svelte-hero-icons'
  import { scale } from 'svelte/transition'

  let copied = $state(false)

  interface Props {
    /**
     * Show a copy button.
     */
    value: string
    copy?: boolean
    class?: string
  }

  let { value, copy = true, class: clazz = '' }: Props = $props()
</script>

<div
  class="px-4 py-1 flex justify-between max-w-full box-border bg-slate-100 dark:bg-zinc-950 items-center gap-4 rounded-md border dark:border-zinc-800
  {clazz}"
>
  <pre class="overflow-auto max-w-full whitespace-nowrap w-max">
		{value}
	</pre>
  {#if copy}
    <Button
      size="square-md"
      color="tertiary"
      aria-label="Copy"
      onclick={() => {
        copied = true
        navigator.clipboard.writeText(value)
        setTimeout(() => (copied = false), 2000)
      }}
    >
      <div class="relative w-full h-full grid place-items-center">
        {#if !copied}
          <div
            transition:scale={{ opacity: 0, start: 0.3 }}
            class="top-0 left-0"
            style="grid-row: 1; grid-column: 1;"
          >
            <Icon src={Clipboard} size="18" mini />
          </div>
        {:else}
          <div
            transition:scale={{ opacity: 0, start: 0.3 }}
            class="top-0 left-0"
            style="grid-row: 1; grid-column: 1;"
          >
            <Icon src={Check} size="18" mini />
          </div>
        {/if}
      </div>
    </Button>
  {/if}
</div>

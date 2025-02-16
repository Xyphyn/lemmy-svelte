<script lang="ts">
  import Button from '../button/Button.svelte'
  import Material from '../materials/Material.svelte'
  import { Check, Icon, Clipboard } from 'svelte-hero-icons'
  import { scale } from 'svelte/transition'

  let copied = $state(false)

  let pre: HTMLPreElement = $state()

  const copy = () => {
    if (children) {
      if (pre) navigator.clipboard.writeText(pre.innerText)
    } else if (src) {
      navigator.clipboard.writeText(src)
    }
  }

  interface Props {
    src: string
    filename?: string | undefined
    htmlSrc?: string | undefined
    children?: import('svelte').Snippet
    class?: string
    [key: string]: any
  }

  let {
    src,
    filename = undefined,
    htmlSrc = undefined,
    children,
    class: clazz = '',
    ...rest
  }: Props = $props()
</script>

<Material
  class="overflow-hidden flex flex-col divide-y divide-slate-200 dark:divide-zinc-800"
  padding="none"
  rounding="md"
>
  {#if filename}
    <div class="flex flex-row items-center justify-between p-3 px-4 text-xs">
      <span>
        {filename}
      </span>
      <Button
        size="square-sm"
        color="tertiary"
        aria-label="Copy"
        onclick={() => {
          copied = true
          copy()
          setTimeout(() => (copied = false), 2000)
        }}
      >
        <div class="relative w-full h-full grid place-items-center">
          {#if !copied}
            <div
              transition:scale={{ opacity: 0, start: 0.3 }}
              style="grid-row: 1; grid-column: 1;"
            >
              <Icon src={Clipboard} size="16" />
            </div>
          {:else}
            <div
              transition:scale={{ opacity: 0, start: 0.3 }}
              style="grid-row: 1; grid-column: 1;"
            >
              <Icon src={Check} size="16" mini />
            </div>
          {/if}
        </div>
      </Button>
    </div>
  {/if}
  <pre
    bind:this={pre}
    {...rest}
    class="{clazz} bg-white dark:bg-zinc-900 px-4 overflow-auto max-h-96">
		{#if htmlSrc}
      {@html htmlSrc}
    {:else if children}
      {@render children?.()}
    {:else if src}
      {src}
    {/if}
	</pre>
</Material>

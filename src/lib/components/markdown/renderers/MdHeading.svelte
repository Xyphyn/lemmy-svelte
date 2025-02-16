<script lang="ts">
  interface Props {
    depth?: number
    raw?: string | undefined
    children?: import('svelte').Snippet
  }

  let { depth = 0, raw = undefined, children }: Props = $props()
</script>

{#if depth === 1}
  <h1 class="font-bold text-4xl">{@render children?.()}</h1>
{:else if depth === 2}
  <h2 class="font-bold text-3xl">{@render children?.()}</h2>
{:else if depth === 3}
  <h3 class="font-bold text-2xl">{@render children?.()}</h3>
{:else if depth === 4}
  <h4 class="font-semibold text-xl">{@render children?.()}</h4>
{:else if depth === 5}
  <h5 class="font-semibold text-lg">{@render children?.()}</h5>
{:else if depth === 6}
  <h6 class="font-semibold text-base">{@render children?.()}</h6>
{:else}
  {raw}
{/if}

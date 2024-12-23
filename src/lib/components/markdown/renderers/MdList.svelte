<script lang="ts">
  interface Props {
    ordered: boolean
    start: number
    children?: import('svelte').Snippet
  }

  let { ordered, start, children }: Props = $props()
</script>

{#if ordered}
  <ol
    {start}
    class="pl-5 list-decimal *:marker:font-medium *:marker:text-primary-900 *:marker:dark:text-primary-100"
  >
    {@render children?.()}
  </ol>
{:else}
  <ul
    class="list-disc pl-4 *:marker:text-primary-900 *:marker:dark:text-primary-100"
  >
    {@render children?.()}
  </ul>
{/if}

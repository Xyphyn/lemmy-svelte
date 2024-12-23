<script lang="ts">
  interface Props {
    header: boolean
    align?: 'left' | 'center' | 'right' | 'justify' | 'char' | null | undefined
    children?: import('svelte').Snippet
  }

  let { header, align = undefined, children }: Props = $props()
</script>

{#if header}
  <th
    class="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-2 px-3"
    {align}
  >
    {@render children?.()}
  </th>
{:else}
  <td
    class="bg-slate-25 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 py-2 px-3"
    {align}
  >
    {@render children?.()}
  </td>
{/if}

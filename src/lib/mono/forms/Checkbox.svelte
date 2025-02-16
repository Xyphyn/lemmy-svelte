<script lang="ts">
  interface Props {
    defaultValue?: boolean
    checked?: boolean | undefined
    inlineDescription?: boolean
    children?: import('svelte').Snippet
    description?: import('svelte').Snippet
  }

  let {
    defaultValue = false,
    checked = $bindable(defaultValue),
    inlineDescription = false,
    children,
    description,
  }: Props = $props()
</script>

<label
  class="font-normal cursor-pointer text-sm flex flex-row items-baseline gap-2"
>
  <input type="checkbox" bind:checked class="cursor-pointer" />
  <div
    class="inline-flex {inlineDescription
      ? 'flex-row'
      : 'flex-col'} font-medium gap-1"
  >
    {@render children?.()}
    {#if description}
      <span class="font-normal text-slate-600 dark:text-zinc-400">
        {@render description?.()}
      </span>
    {/if}
  </div>
</label>

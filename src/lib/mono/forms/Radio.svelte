<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import { generateID } from '../forms/helper.js'

  type T = $$Generic

  interface Props {
    value: T;
    group: T;
    inlineDescription?: boolean;
    id?: string;
    disabled?: boolean;
    children?: import('svelte').Snippet;
    description?: import('svelte').Snippet;
    [key: string]: any
  }

  let {
    value,
    group = $bindable(),
    inlineDescription = false,
    id = generateID(),
    disabled = false,
    children,
    description,
    ...rest
  }: Props = $props();
</script>

<div
  class="font-normal cursor-pointer text-sm flex flex-row items-baseline gap-2"
>
  <input
    {...rest}
    {id}
    type="radio"
    bind:group
    {value}
    onblur={bubble('blur')}
    onchange={bubble('change')}
    {disabled}
    class="cursor-pointer disabled:cursor-not-allowed peer disabled:opacity-50"
  />
  <label
    for={id}
    class="inline-flex {inlineDescription
      ? 'flex-row'
      : 'flex-col'} cursor-pointer peer-disabled:cursor-not-allowed font-medium gap-1 peer-disabled:opacity-50"
  >
    {@render children?.()}
    {#if description}
      <span class="font-normal text-slate-600 dark:text-zinc-400">
        {@render description?.()}
      </span>
    {/if}
  </label>
</div>

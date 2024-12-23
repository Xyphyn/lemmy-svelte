<script lang="ts">
  import Expandable from '$lib/components/ui/Expandable.svelte'
  import { ChevronDown, Icon, Minus, Plus } from 'svelte-hero-icons'
  import { backOut, expoOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'


  interface Props {
    title: string;
    id: string;
    open?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    title,
    id,
    open = $bindable(true),
    children
  }: Props = $props();
</script>

<div class="flex flex-col max-w-full w-full">
  <button
    class="text-left hover:text-primary-900 dark:hover:text-primary-100
    flex items-center justify-between z-0 relative group transition-colors"
    onclick={() => (open = !open)}
  >
    <h2 class="text-xl font-semibold text-inherit" {id}>
      <span>{title}</span>
    </h2>
    <Icon
      src={open ? Minus : Plus}
      size="16"
      micro
      class="{open
        ? ''
        : 'rotate-90'} transition-transform duration-500 ease-out"
    />
    <div
      class="absolute inset-x-0 inset-y-1 opacity-0 rounded-full bg-slate-50 dark:bg-zinc-900
    group-hover:-inset-x-3 group-hover:-inset-y-1 group-hover:opacity-100 transition-all -z-10"
    ></div>
  </button>
  {#if open}
    <div
      transition:slide={{ axis: 'y', duration: 500, easing: expoOut }}
      class="w-full flex flex-col divide-y divide-slate-200 dark:divide-zinc-800 *:py-3"
    >
      {@render children?.()}
    </div>
  {/if}
</div>

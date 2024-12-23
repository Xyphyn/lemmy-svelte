<script lang="ts">
  import { Disclosure } from 'mono-svelte'
  import { Minus, Plus, Icon } from 'svelte-hero-icons'
  interface Props {
    open?: boolean
    icon?: boolean
    class?: string
    title?: import('svelte').Snippet
    extended?: import('svelte').Snippet
    content?: import('svelte').Snippet
    children?: import('svelte').Snippet
  }

  let {
    open = $bindable(false),
    icon = true,
    class: clazz = '',
    title,
    extended,
    content,
    children,
  }: Props = $props()
</script>

<Disclosure
  {extended}
  bind:open
  class="items-start justify-items-start gap-2 {clazz}"
>
  {#snippet summary()}
    <div
      class="font-medium w-full text-left flex flex-row items-center justify-between hover:text-primary-900
      hover:dark:text-primary-100 transition-colors h-full z-0 group relative"
    >
      <div class="flex flex-row gap-1 items-center w-full">
        {@render title?.()}
      </div>
      {#if icon}
        <Icon
          src={open ? Minus : Plus}
          size="16"
          micro
          class="{open
            ? ''
            : 'rotate-90'} transition-transform duration-300 ease-out"
        />
      {/if}
      <div
        class="inset-0 -z-10 opacity-0 absolute bg-slate-100 dark:bg-zinc-900 rounded-full
      group-hover:opacity-100 group-hover:-inset-1 group-hover:-inset-x-2 transition-all"
      ></div>
    </div>
  {/snippet}
  {#if content}{@render content()}{:else}
    <div class="pt-2 text-slate-900 dark:text-zinc-100">
      {@render children?.()}
    </div>
  {/if}
</Disclosure>

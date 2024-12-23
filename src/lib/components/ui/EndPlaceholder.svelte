<script lang="ts">
  interface Props {
    class?: string
    children?: import('svelte').Snippet
    action?: import('svelte').Snippet
  }

  let { class: clazz = '', children, action }: Props = $props()
</script>

<div
  class="flex flex-row items-center
   text-sm text-slate-600 dark:text-zinc-400 gap-2 flex-wrap {clazz}"
>
  <span class="font-medium text-left">
    {@render children?.()}
  </span>
  <hr class="border-slate-200 flex-1 w-full dark:border-zinc-800" />
  {@render action?.()}
</div>

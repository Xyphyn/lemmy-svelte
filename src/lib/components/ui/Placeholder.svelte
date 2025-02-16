<script lang="ts">
  import { Icon, type IconSource } from 'svelte-hero-icons'

  interface Props {
    icon?: IconSource | undefined
    title: string
    description?: string | undefined
    center?: boolean
    class?: string
    children?: import('svelte').Snippet
  }

  let {
    icon = undefined,
    title,
    description = undefined,
    center = false,
    class: clazz = '',
    children,
  }: Props = $props()
</script>

<div
  class="text-slate-700 dark:text-zinc-300 flex flex-col w-max mx-auto items-center gap-4 {clazz}"
>
  <div class="flex flex-col gap-2 items-center max-w-sm">
    {#if icon}
      <div class="bg-slate-100 dark:bg-zinc-950 p-3 rounded-full">
        <Icon src={icon} size="28" solid />
      </div>
    {/if}
    <div class={clazz}>
      <h1
        class="text-slate-900 dark:text-zinc-100 text-base font-medium text-center"
      >
        {title}
      </h1>
      {#if description}
        <!-- <p class="text-sm text-center font-normal">
          {description}
        </p> -->
      {/if}
    </div>
  </div>
  {@render children?.()}
</div>

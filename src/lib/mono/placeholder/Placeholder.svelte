<script lang="ts">
  import { Icon, type IconSource } from 'svelte-hero-icons'
  interface Props {
    icon?: IconSource
    title?: string
    description?: string
    customIcon?: import('svelte').Snippet
    customTitle?: import('svelte').Snippet
    customDescription?: import('svelte').Snippet
    children?: import('svelte').Snippet
  }

  let {
    icon,
    title,
    description,
    customIcon,
    customTitle,
    customDescription,
    children,
  }: Props = $props()
</script>

<div
  class="text-slate-700 dark:text-zinc-300 flex flex-col justify-center items-center gap-2"
>
  {#if icon || customIcon}
    <div
      class="border border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 p-3 rounded-full"
    >
      {#if customIcon}
        {@render customIcon?.()}
      {:else if icon}
        <Icon src={icon} size="28" />
      {/if}
    </div>
  {/if}
  <div class="flex flex-col gap-1 text-center">
    <h1 class="text-slate-900 dark:text-zinc-100 text-lg font-medium">
      {#if customTitle}
        {@render customTitle?.()}
      {:else if title}
        {title}
      {/if}
    </h1>
    {#if description || customDescription}
      <p class="text-sm text-center font-normal">
        {#if customDescription}
          {@render customDescription?.()}
        {:else if description}
          {description}
        {/if}
      </p>
    {/if}
  </div>
  {@render children?.()}
</div>

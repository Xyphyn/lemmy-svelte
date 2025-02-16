<script lang="ts" module>
  export const parseURL = (href: string) => {
    try {
      return new URL(href)
    } catch (e) {
      return undefined
    }
  }
</script>

<script lang="ts">
  interface Props {
    href: string
    highlight?: boolean
    nowrap?: boolean
    children?: import('svelte').Snippet
    class?: string
    icon?: import('svelte').Snippet
    [key: string]: any
  }

  let {
    href,
    highlight = false,
    nowrap = false,
    children,
    class: clazz = '',
    icon,
    ...rest
  }: Props = $props()

  let richURL = $derived(children ? undefined : parseURL(href))
</script>

<a
  {...rest}
  {href}
  class="{highlight
    ? 'text-blue-500'
    : ''} hover:underline max-w-full inline-flex items-center gap-1 {clazz}"
>
  {@render icon?.()}
  {#if children}{@render children()}{:else}
    <span
      class="flex relative gap-0 {nowrap
        ? 'w-full whitespace-nowrap overflow-hidden text-ellipsis text-xs'
        : ''} {clazz}"
    >
      {#if richURL}
        <span class="text-blue-300 dark:text-blue-800">
          {richURL.protocol}//
        </span>
        <span class="font-medium">
          {richURL.hostname}
        </span>
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r
        from-blue-300 via-blue-300 to-blue-300/0 w-full
        dark:from-blue-800 dark:via-blue-800 dark:to-blue-800/0
        "
        >
          {richURL.pathname}
        </span>
      {:else}
        {href}
      {/if}
    </span>
  {/if}
</a>

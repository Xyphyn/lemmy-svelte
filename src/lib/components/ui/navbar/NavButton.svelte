<script lang="ts">
  import { page } from '$app/state'
  import { Button, buttonColor } from 'mono-svelte'
  import { Icon, type IconSource } from 'svelte-hero-icons'
  import type { ButtonProps } from 'mono-svelte/button/Button.svelte'

  interface Props extends ButtonProps {
    label: string
    icon?: IconSource | undefined
    href?: string | undefined
    adaptive?: boolean
    isSelectedFilter?: (path: string) => boolean
    class?: string
    customIcon?: import('svelte').Snippet<[any]>
    children?: import('svelte').Snippet
    [key: string]: any
  }

  let {
    label,
    icon,
    href,
    adaptive = true,
    isSelectedFilter = (path) => href != undefined && path == href,
    class: clazz = '',
    customIcon,
    children,
    ...rest
  }: Props = $props()

  let isSelected = $derived(isSelectedFilter(page.url.pathname))
</script>

<Button
  color="none"
  {...rest}
  class={[
    'flex-shrink-0 rounded-full w-10 h-10 lg:w-max lg:h-8 lg:px-3 lg:rounded-xl',
    isSelected &&
      'bg-slate-200 dark:bg-zinc-900 text-primary-900 dark:!text-primary-100',
    !rest.color && buttonColor.tertiary,
    !rest.color &&
      'lg:bg-white lg:dark:bg-zinc-900 border lg:border-slate-200 lg:border-b-slate-300 lg:dark:border-zinc-800 lg:dark:border-t-zinc-700/50 lg:hover:bg-slate-100 lg:hover:dark:bg-zinc-800 lg:active:bg-slate-200 lg:active:dark:bg-zinc-950',
    clazz,
  ]}
  size="custom"
  rounding="none"
  {href}
  title={label}
  style="transition-property: background-color, filter;"
>
  {#snippet prefix()}
    {#if icon}
      <div class="lg:hidden">
        <Icon src={icon} size="18" />
      </div>
      <div class="max-lg:hidden">
        <Icon src={icon} micro solid={isSelected} size="16" />
      </div>
    {:else}
      {@render customIcon?.({ size: 16, isSelected })}
    {/if}
  {/snippet}
  <span class="hidden {adaptive ? 'lg:block' : ''}">{label}</span>
  {@render children?.()}
</Button>

<script lang="ts">
  import { page } from '$app/stores'
  import { Button } from 'mono-svelte'
  import { Icon, type IconSource } from 'svelte-hero-icons'
  import { dockProps } from '../layout/Shell.svelte'

  interface Props {
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
    icon = undefined,
    href = undefined,
    adaptive = true,
    isSelectedFilter = (path) => href != undefined && path == href,
    class: clazz = '',
    customIcon,
    children,
    ...rest
  }: Props = $props()

  let isSelected = $derived(isSelectedFilter($page.url.pathname))
  let isPanel = $derived(adaptive ? $dockProps.noGap : false)
</script>

<Button
  color={isPanel ? 'secondary' : 'tertiary'}
  {...rest}
  class="rounded-full w-10 h-10 flex-shrink-0 {adaptive
    ? '@3xl:h-8 @3xl:px-3 @3xl:rounded-[10px] @3xl:w-auto'
    : ''} {isSelected
    ? 'bg-slate-200 dark:bg-zinc-900 text-primary-900 dark:!text-primary-100'
    : ''} {clazz}"
  size="custom"
  {href}
  rounding="pill"
  title={label}
  style="transition-property: background-color, filter;"
>
  {#if icon}
    <Icon
      src={icon}
      micro={isPanel}
      solid={!isPanel && isSelected}
      size={isPanel ? '16' : '18'}
    />
  {:else}
    {@render customIcon?.({ size: isPanel ? 16 : 18, isSelected })}
  {/if}
  <span class="hidden {adaptive ? '@3xl:block' : ''}">{label}</span>
  {@render children?.()}
</Button>

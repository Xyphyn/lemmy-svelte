<script lang="ts">
  import Button, {
    type ButtonAlignment,
    type ButtonColor,
  } from '../button/Button.svelte'
  import { Icon, type IconSource } from 'svelte-hero-icons'

  interface Props {
    color?: ButtonColor
    alignment?: ButtonAlignment
    href?: string | undefined
    disabled?: boolean
    class?: string
    icon?: IconSource
    prefix?: import('svelte').Snippet
    children?: import('svelte').Snippet
    suffix?: import('svelte').Snippet
    [key: string]: any
  }

  let {
    color = 'tertiary',
    alignment = 'left',
    href = undefined,
    disabled = false,
    class: clazz = '',
    icon,
    prefix,
    children,
    suffix,
    ...rest
  }: Props = $props()
</script>

<Button
  {...rest}
  {color}
  rounding="none"
  class="w-full px-2 rounded-lg min-h-8 font-normal {disabled
    ? 'opacity-70 pointer-events-none cursor-not-allowed'
    : ''} {color == 'tertiary'
    ? 'hover:dark:bg-zinc-800/70'
    : ''} duration-100 {clazz}"
  {alignment}
  {href}
  {disabled}
>
  {#snippet prefix()}
    <span
      class="contents {color == 'tertiary'
        ? 'text-slate-600 dark:text-zinc-400'
        : ''}
  		flex-shrink-0"
    >
      {#if icon}
        <Icon src={icon} micro size="16" />
      {:else}
        {@render prefix?.()}
      {/if}
    </span>
  {/snippet}
  {@render children?.()}
  {#snippet suffix()}
    {@render suffix?.()}
  {/snippet}
</Button>

<script lang="ts">
  import { run } from 'svelte/legacy'

  import { page } from '$app/state'
  import { settings } from '$lib/settings.svelte.js'
  import { Button } from 'mono-svelte'
  import { Icon, type IconSource } from 'svelte-hero-icons'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  interface Props {
    href?: string | undefined
    icon?: IconSource | undefined
    selected?: boolean
    class?: string
    customIcon?: import('svelte').Snippet<[any]>
    children?: import('svelte').Snippet
    label?: import('svelte').Snippet
    [key: string]: any
  }

  let {
    href = undefined,
    icon = undefined,
    selected = $bindable(false),
    class: clazz = '',
    customIcon,
    children,
    label,
    ...rest
  }: Props = $props()

  run(() => {
    if (href != undefined) {
      selected = page.url.pathname == href
    }
  })
</script>

<Button
  color={selected ? 'primary' : 'tertiary'}
  alignment="left"
  {...rest}
  {href}
  class="font-normal block !origin-left border border-transparent {!selected
    ? 'text-slate-600 dark:text-zinc-400'
    : ''} {clazz}"
>
  {#snippet prefix()}
    {#if customIcon}
      {@render customIcon({ selected })}
    {:else if icon}
      <Icon src={icon} solid={selected} size="20" />
    {/if}
  {/snippet}
  {@render children?.()}
  <div class="contents">
    {@render label?.()}
  </div>
</Button>

<script lang="ts" generics="T">
  import { getContext, onMount, type Snippet } from 'svelte'
  import type { HTMLAttributes, HTMLOptionAttributes } from 'svelte/elements'
  import type { IconSource } from 'svelte-hero-icons'

  interface Props extends Omit<HTMLOptionAttributes, 'prefix'> {
    children: Snippet
    icon?: IconSource
  }
  let { children, icon, ...rest }: Props = $props()

  let optionElement = $state<HTMLOptionElement>()
  let option: any = $derived({
    value: optionElement?.value ?? '',
    label: optionElement?.innerText?.trim() ?? '',
    icon: icon,
    disabled: false,
  })

  interface SelectContext {
    options: {
      value: string
      label: string
      icon?: IconSource
      disabled: boolean
    }[]
  }

  const context = getContext<SelectContext>('select')

  $effect(() => {
    if (!context.options.find((v) => v == option)) {
      context.options.push(option)
    }
  })
</script>

<option {...rest} bind:this={optionElement}>
  {@render children()}
</option>

<script lang="ts">
  import { hexToRgb } from '$lib/ui/colors.svelte'

  interface Props {
    value: string
    class?: string
    oncontextmenu?: (e: MouseEvent) => any
    onchange?: (value: string) => any
  }

  let {
    value = $bindable(),
    oncontextmenu,
    onchange,
    class: clazz = '',
  }: Props = $props()
</script>

<div
  class="w-full h-8 relative rounded-md border dark:border-zinc-600 hover:dark:border-zinc-400
  transition-colors {clazz}"
  style="background-color: rgb({value});"
>
  <input
    class="rounded-md border cursor-pointer absolute top-0 left-0 w-full h-full opacity-0"
    type="color"
    bind:value
    onchange={() => onchange?.(hexToRgb(value))}
    {oncontextmenu}
  />
</div>

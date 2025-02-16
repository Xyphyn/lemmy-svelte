<script lang="ts">
  import Material from '../materials/Material.svelte'
  import Popover, { type Origin } from '../popover/Popover.svelte'
  import {
    offset,
    type Middleware,
    type Placement,
    shift,
    type Strategy,
    flip,
    autoPlacement,
    size,
  } from '@floating-ui/core'

  interface Props {
    openOnHover?: boolean
    open?: boolean
    manual?: boolean
    placement?: Placement
    middleware?: Middleware[]
    strategy?: Strategy
    class?: string
    target?: import('svelte').Snippet
    children?: import('svelte').Snippet
    [key: string]: any
  }

  let {
    openOnHover = false,
    open = $bindable(false),
    manual = false,
    placement = 'bottom-start',
    middleware = [offset(6), shift({ padding: 6 }), flip()],
    strategy = 'absolute',
    class: clazz = '',
    target,
    children,
    ...rest
  }: Props = $props()
</script>

<Popover
  {openOnHover}
  {placement}
  {middleware}
  {strategy}
  {manual}
  {...rest}
  bind:open
  popoverClass="backdrop-blur-xl rounded-2xl w-full max-w-[280px]"
  class={clazz}
  {target}
>
  {#snippet popover()}
    <div
      class="w-full max-w-[280px] origin-top-left
  	max-h-[32rem] overflow-auto list-none shadow-lg rounded-2xl"
    >
      <div
        class="flex flex-col py-2 list-none bg-white/80 dark:bg-zinc-900/90 px-2 gap-px
        rounded-2xl
        border border-slate-300 dark:border-zinc-800 border-opacity-50"
      >
        {@render children?.()}
      </div>
    </div>
  {/snippet}
</Popover>

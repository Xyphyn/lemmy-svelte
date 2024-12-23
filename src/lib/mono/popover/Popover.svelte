<script module lang="ts">
  export type Origin = keyof typeof popoverOrigins

  export const popoverOrigins = {
    'top-right': 'bottom-full right-0 origin-bottom-right',
    'bottom-left': 'top-full origin-top-left',
    'top-left': 'bottom-full left-0 origin-bottom-left',
    'bottom-right': 'top-full right-0 origin-top-right',
    'top-center': 'bottom-full -left-[450%] origin-bottom',
    'bottom-center': 'top-full -left-[450%] origin-top',
  }
</script>

<script lang="ts">
  import { Material } from '../index'
  import { backOut, elasticIn, elasticOut, expoOut } from 'svelte/easing'
  import { fly, scale } from 'svelte/transition'
  import { createFloatingActions } from 'svelte-floating-ui'
  import {
    offset,
    type Middleware,
    flip,
    shift,
    type Placement,
    type Strategy,
    size,
  } from '@floating-ui/core'
  import Portal from './Portal.svelte'
  import { focusTrap } from 'svelte-focus-trap'
  import { tick } from 'svelte'

  interface Props {
    openOnHover?: boolean
    open?: boolean
    placement?: Placement
    middleware?: Middleware[]
    strategy?: Strategy
    manual?: boolean
    popoverClass?: string
    class?: string
    target?: import('svelte').Snippet
    popover?: import('svelte').Snippet
    children?: import('svelte').Snippet
  }

  let {
    openOnHover = false,
    open = $bindable(false),
    placement = 'bottom-start',
    middleware = [offset(6), shift(), flip()],
    strategy = 'fixed',
    manual = false,
    popoverClass = '',
    class: clazz = '',
    target,
    popover,
    children,
  }: Props = $props()

  let canUseContents = $state(true)

  let el: any = $state()

  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: strategy,
    placement: placement,
    middleware: middleware,
  })

  const customFloatingContent = (node: HTMLDivElement) => {
    // if (!canUseContents) return

    floatingContent(node)
  }

  const customFloatingRef = (node: HTMLButtonElement) => {
    const n = node.children.item(0)

    // @ts-ignore
    if (n) floatingRef(n)
    else {
      canUseContents = false
      floatingRef(node)
    }
  }
</script>

<svelte:body
  onclick={(e) => {
    if (openOnHover) return

    if (!el?.contains(e.target) && open) {
      open = false
    }
  }}
  onkeydown={async (e) => {
    if (open && e.key == 'Escape') {
      open = false
      el?.firstChild.focus()
    }
  }}
/>

{#if target}
  <button
    onmouseover={() => (openOnHover ? (open = true) : false)}
    onmouseleave={() => (openOnHover ? (open = false) : false)}
    onfocus={() => (openOnHover ? (open = true) : false)}
    onfocusout={() => (openOnHover ? (open = false) : false)}
    onclick={() => (!openOnHover && !manual ? (open = !open) : false)}
    onkeydown={(e) => {
      if (e.key == 'Escape') open = false
    }}
    role="menu"
    type="button"
    class="{canUseContents ? 'contents text-left' : 'w-max h-max'} {clazz}"
    bind:this={el}
    use:customFloatingRef
  >
    {@render target?.()}
  </button>
{/if}

{#if open}
  <Portal class="z-[150]">
    <div
      transition:scale={{ duration: 200, start: 0.96, easing: backOut }}
      class="z-[150] {popoverClass}"
      use:customFloatingContent
      use:focusTrap
    >
      {#if popover}{@render popover()}{:else}
        <Material elevation="high" color="distinct" class="flex flex-col">
          {@render children?.()}
        </Material>
      {/if}
    </div>
  </Portal>
{/if}

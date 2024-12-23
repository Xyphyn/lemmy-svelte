<script lang="ts" module>
  import { derived as derivedStore } from 'svelte/store'

  const calculateDockProperties = (
    settings: {
      top: boolean | null
      noGap: boolean | null
    },
    screenWidth: number,
  ): {
    noGap: boolean
    top: boolean
  } => {
    let panel = false
    let top = false

    if (screenWidth >= 1000) {
      panel = true
      top = true
    } else if (screenWidth > 800) {
      panel = true
      top = false
    } else if (screenWidth > 600) {
      panel = false
      top = false
    }

    panel = settings.noGap ?? panel
    top = settings.top ?? top

    return {
      noGap: panel,
      top: top,
    }
  }

  export const calculatePadding = (
    panel: boolean,
    top: boolean,
    content: boolean,
  ): {
    top: number
    bottom: number
    class: string
  } => {
    if (panel) {
      if (top) {
        if (content) return { top: 80, class: '!pt-20', bottom: 0 }
        else
          return {
            top: 64,
            class: 'top-16 !max-h-[calc(100vh-4rem)]',
            bottom: 0,
          }
      } else return { top: 0, class: '!pb-20', bottom: 80 }
    } else {
      if (!content) return { top: 0, class: '', bottom: 0 }

      if (top) return { top: 96, class: '!pt-24', bottom: 0 }
      else return { top: 0, class: '!pb-24', bottom: 96 }
    }

    return { top: 0, class: ' failed-to-calculate', bottom: 0 }
  }

  export let screenWidth = writable(1000)
  export let dockProps: Readable<ReturnType<typeof calculateDockProperties>> =
    derivedStore([screenWidth], ([$screenWidth], set) => {
      set(calculateDockProperties(settings.dock, $screenWidth))
    })
  export let contentPadding: Readable<ReturnType<typeof calculatePadding>> =
    derivedStore(dockProps, ($dockProps, set) =>
      set(calculatePadding($dockProps.noGap, $dockProps.top, true)),
    )
</script>

<script lang="ts">
  import { settings } from '$lib/settings.svelte.js'
  import { themeVars } from '$lib/ui/colors'
  import { routes } from '$lib/util.svelte.js'
  import { writable, type Readable, type Writable } from 'svelte/store'

  interface Props {
    route?: { id: string | null } | undefined
    class?: string
    children?: import('svelte').Snippet
    navbar?: import('svelte').Snippet<[any]>
    sidebar?: import('svelte').Snippet<[any]>
    main?: import('svelte').Snippet<[any]>
    suffix?: import('svelte').Snippet<[any]>
    [key: string]: any
  }

  let {
    route = undefined,
    class: clazz = '',
    children,
    navbar,
    sidebar,
    main,
    suffix,
    ...rest
  }: Props = $props()

  let title = $derived(
    route ? routes[(route.id as keyof typeof routes) ?? ''] : '',
  )
  let sidePadding = $derived(
    calculatePadding($dockProps.noGap, $dockProps.top, false),
  )
  let topPanel = $derived($dockProps.noGap && $dockProps.top)
</script>

<svelte:window bind:innerWidth={$screenWidth} />

<div
  {...rest}
  class="shell bg-slate-50 dark:bg-zinc-950 {clazz}"
  style={$themeVars}
>
  {@render children?.()}
  <div
    class="
    {$dockProps.noGap ? '' : 'p-4 max-w-3xl left-1/2 -translate-x-1/2'}
    {$dockProps.top ? 'top-0' : 'bottom-0'}
    {topPanel ? 'fixed top-0' : 'fixed'}
    w-full z-50 pointer-events-none"
    style="grid-area: navbar;
    transition-property: padding, top, bottom;
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);"
  >
    {@render navbar?.({
      class: `
      ${
        $dockProps.noGap
          ? $dockProps.top
            ? 'border-b shadow-none rounded-none'
            : 'border-t rounded-none'
          : 'border rounded-full'
      }
       
       dark:bg-transparent transition-colors duration-500
      pointer-events-auto backdrop-blur-xl ${
        topPanel
          ? 'bg-slate-50/50 dark:bg-zinc-950/90 border-slate-100 dark:border-zinc-900'
          : `border-slate-200 dark:border-zinc-800 shadow-2xl
        bg-white/50 dark:bg-zinc-950/70`
      }`,
      title,
      style: 'transition: border-radius 250ms;',
    })}
  </div>
  <div
    class="content divide-x divide-slate-100 dark:divide-zinc-900 min-h-screen {settings.newWidth
      ? 'limit-width'
      : ''}"
  >
    {@render sidebar?.({
      class: `hidden md:flex sticky top-0 left-0 h-max bg-slate-50 dark:bg-zinc-950
      z-40
      ${sidePadding.class}`,
      style: 'grid-area: sidebar; width: 100% !important;',
    })}
    {@render main?.({
      class: `w-full bg-slate-25 dark:bg-zinc-925 justify-self-center shadow-sm z-0
      ${$contentPadding.class} main`,
      style: 'grid-area: main',
    })}
    {@render suffix?.({
      class:
        'max-xl:hidden w-full sticky top-0 left-0 max-h-screen bg-slate-50 dark:bg-zinc-950 z-40 {sidePadding.class}',
      style: 'grid-area: suffix;',
    })}
  </div>
</div>

<style>
  .shell {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'navbar'
      'content';
  }

  .content {
    width: 100%;
    display: grid;
    margin-left: auto;
    margin-right: auto;
    grid-area: content;
    grid-template-columns: 1fr;
    grid-template-areas: 'main';
    justify-items: start;
  }

  .content.limit-width {
    max-width: 120rem;
  }

  .content > * {
    width: 100%; /* Full width for immediate children */
  }

  @media (min-width: 768px) {
    .content {
      grid-template-columns: 14rem 2fr;
      justify-items: end start;
      grid-template-areas: 'sidebar main';
    }
  }

  @media (min-width: 1280px) {
    .content {
      grid-template-columns: 20% 60% 20%;
      justify-items: end center start;
      grid-template-areas: 'sidebar main suffix';
    }

    .content.limit-width {
      grid-template-columns: 1fr 2fr 1fr;
    }

    :global(.content.limit-width > *:first-child) {
      max-width: 20rem;
      justify-self: end;
      width: 100%;
    }

    :global(.content.limit-width > *:last-child) {
      max-width: 20rem;
      justify-self: start;
      width: 100%;
    }

    .main {
      width: 100%;
    }
  }
</style>

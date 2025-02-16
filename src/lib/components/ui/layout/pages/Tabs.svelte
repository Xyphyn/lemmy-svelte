<script lang="ts">
  import { invalidate, invalidateAll } from '$app/navigation'
  import { page } from '$app/state'
  import { fly } from 'svelte/transition'

  interface Props {
    routes: {
      href: string
      name: string
    }[]
    currentRoute?: string | undefined
    isSelected?: (
      url: URL,
      currentRoute: string | undefined,
      route: string,
      defaultRoute?: string,
    ) => boolean
    buildUrl?: (currentRoute: string | undefined, href: string) => string
    defaultRoute?: string | undefined
    class?: string
    children?: import('svelte').Snippet
  }

  let {
    routes,
    currentRoute = undefined,
    isSelected = (url, currentRoute, route) =>
      (currentRoute ?? url.pathname) == route,
    buildUrl = (route, href) => href,
    defaultRoute = undefined,
    class: clazz = '',
    children,
  }: Props = $props()
</script>

<nav
  class="flex flex-row items-center gap-1 p-1 rounded-full bg-white/60 dark:bg-zinc-800/60
  backdrop-blur-lg border border-slate-200/60 dark:border-zinc-800 shadow-lg border-opacity-50 {clazz ??
    ''}
  "
>
  {#each routes as route}
    <a
      onclick={() => invalidateAll()}
      href={buildUrl(currentRoute, route.href)}
      class="font-medium rounded-full px-4 py-1 hover:bg-slate-200/40 hover:dark:bg-zinc-700/40
      transition-colors duration-100 relative z-0 flex-shrink-0"
    >
      {route.name}
      {#if isSelected(page.url, currentRoute, route.href, defaultRoute)}
        <div
          class="rounded-full bg-slate-100/60 dark:bg-zinc-700/60
          absolute inset-0 w-full h-full -z-10"
        ></div>
      {/if}
    </a>
  {/each}
  {@render children?.()}
</nav>

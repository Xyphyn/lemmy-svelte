<script lang="ts">
  import Routebar from './Routebar.svelte'
  import Button from '../button/Button.svelte'

  type Route = string

  type RouteObject = {
    url: Route
    children?: RouteObject[]
    name: string
  }

  interface Props {
    /**
     * The routes for the routebar.
     */
    routes: RouteObject[]
    currentRoute?: Route | undefined
    parentRoute?: Route | undefined
    depth?: number
  }

  let {
    routes,
    currentRoute = undefined,
    parentRoute = undefined,
    depth = 0,
  }: Props = $props()
</script>

<svelte:element this={depth == 0 ? 'nav' : 'ul'} class="flex flex-col h-full">
  {#each routes as route}
    {#if route.children}
      <Button
        class="{depth > 0 ? 'pl-6' : ''} {route.url == currentRoute
          ? 'border-t-0 border-r-0 border-b-0 border-l !border-slate-900 dark:!border-zinc-50'
          : 'border-t-0 border-r-0 border-b-0 border-l !border-slate-300 dark:!border-zinc-700'} rounded-l-none {depth ==
        0
          ? 'mt-2'
          : ''} font-bold"
        href={route.url}
        alignment="left"
        color="tertiary"
        size="lg"
      >
        {route.name}
      </Button>
      <Routebar
        routes={route.children}
        {currentRoute}
        {parentRoute}
        depth={depth + 1}
      />
    {:else}
      <Button
        href={route.url}
        alignment="left"
        color="tertiary"
        size="lg"
        class="{depth > 1 ? 'pl-12' : depth > 0 ? 'pl-6' : ''} {route.url ==
        currentRoute
          ? 'border-t-0 border-r-0 border-b-0 border-l !border-slate-950 dark:!border-zinc-50'
          : 'border-t-0 border-r-0 border-b-0 border-l !border-slate-300 dark:!border-zinc-700'} font-normal rounded-l-none"
      >
        {route.name}
      </Button>
    {/if}
  {/each}
</svelte:element>

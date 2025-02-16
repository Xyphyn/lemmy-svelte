<script>
  import { t } from '$lib/translations'
  import { Button } from 'mono-svelte'

  import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { page } from '$app/state'
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()

  const routes = [
    {
      name: $t('routes.profile.credentials'),
      url: '/profile/password',
    },
    {
      name: $t('form.profile.2fa.2fa'),
      url: '/profile/password/2fa',
    },
    {
      name: $t('routes.passwordChange.title'),
      url: '/profile/password/change',
    },
    {
      name: $t('routes.profile.logins'),
      url: '/profile/password/logins',
    },
    {
      name: $t('routes.profile.delete.title'),
      url: '/profile/password/delete',
    },
  ]
</script>

<Header pageHeader>
  {routes.find((r) => page.url.pathname == r.url)?.name}
</Header>
<div class="flex flex-row gap-12">
  <nav class="flex flex-col gap-2 flex-1 max-sm:hidden">
    {#each routes as route}
      <SidebarButton
        size="lg"
        rounding="lg"
        selected={page.url.pathname == route.url}
        href={route.url}
      >
        {route.name}
      </SidebarButton>
    {/each}
  </nav>
  <div class="flex-[3] max-w-full w-full min-w-0">
    {@render children?.()}
  </div>
</div>

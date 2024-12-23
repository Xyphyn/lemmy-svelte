<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import MultiSelect from '$lib/components/input/Switch.svelte'
  import Tabs from '$lib/components/ui/layout/pages/Tabs.svelte'
  import { contentPadding } from '$lib/components/ui/layout/Shell.svelte'
  import { t } from '$lib/translations.js'
  import { fullCommunityName } from '$lib/util.svelte.js'
  import type { PageData } from './$types.js'

  interface Props {
    data: PageData
    children?: import('svelte').Snippet
  }

  let { data, children }: Props = $props()

  let communityUrl = $derived(
    `/c/${fullCommunityName(
      data.community.community_view.community.name,
      data.community.community_view.community.actor_id,
    )}`,
  )
</script>

<div class="flex flex-col gap-4 h-full">
  <div
    class="sticky mx-auto z-50 max-w-full min-w-0 flex items-center gap-2"
    style="top: max(1.5rem, {$contentPadding.top}px);"
  >
    <Tabs
      routes={[
        {
          href: `${communityUrl}/settings`,
          name: $t('routes.community.settings.settings'),
        },
        {
          href: `${communityUrl}/settings/team`,
          name: $t('routes.community.settings.team'),
        },
      ]}
    ></Tabs>
  </div>
  {@render children?.()}
</div>

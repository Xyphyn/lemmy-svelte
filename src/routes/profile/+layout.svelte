<script>
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'

  import MultiSelect from '$lib/components/input/Switch.svelte'
  import Tabs from '$lib/components/ui/layout/pages/Tabs.svelte'
  import { contentPadding } from '$lib/components/ui/layout/Shell.svelte'
  import { site } from '$lib/lemmy'
  import { t } from '$lib/translations'
  import { feature } from '$lib/version'
  import { Button, Menu, MenuButton } from 'mono-svelte'
  import {
    ArrowDown,
    ArrowUp,
    EllipsisHorizontal,
    Icon,
    Photo,
  } from 'svelte-hero-icons'
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<svelte:head>
  <title>{$t('profile.profile')}</title>
</svelte:head>

<div class="flex flex-col gap-4 h-full z-0">
  <div
    class="sticky mx-auto z-50 max-w-full min-w-0 flex items-center gap-2"
    style="top: max(1.5rem, {$contentPadding.top}px);"
  >
    <Tabs
      class="overflow-auto"
      routes={[
        {
          href: '/profile',
          name: $t('routes.profile.overview'),
        },
        {
          href: '/profile/user',
          name: $t('routes.profile.submissions'),
        },

        {
          href: '/profile/settings',
          name: $t('routes.profile.settings'),
        },

        {
          href: '/profile/blocks',
          name: $t('routes.profile.blocks.title'),
        },

        {
          href: '/profile/password',
          name: $t('routes.profile.credentials'),
        },
      ]}
    />
    {#if feature('mediaAndVotes', $site?.version)}
      <Menu class="flex-1" placement="bottom-end">
        {#snippet target()}
                <Button
            title={$t('post.actions.more.label')}
            
            size="square-lg"
            rounding="pill"
            color="none"
            class="bg-[#fff]/60 dark:bg-neutral-800/60
          border border-gray-200/60 dark:border-neutral-800
          backdrop-blur-xl shadow-xl hover:bg-slate-100 hover:dark:bg-zinc-800
          flex-shrink-0"
          >
            <Icon src={EllipsisHorizontal} size="16" mini />
          </Button>
              {/snippet}
        <MenuButton href="/profile/media">
          {#snippet prefix()}
                    <Icon src={Photo} size="16" mini  />
                  {/snippet}
          {$t('routes.profile.media.title')}
        </MenuButton>
        <MenuButton href="/profile/voted/up">
          {#snippet prefix()}
                    <Icon src={ArrowUp} size="16" micro  />
                  {/snippet}
          {$t('routes.profile.upvoted')}
        </MenuButton>
        <MenuButton href="/profile/voted/down">
          {#snippet prefix()}
                    <Icon src={ArrowDown} size="16" micro  />
                  {/snippet}
          {$t('routes.profile.downvoted')}
        </MenuButton>
      </Menu>
    {/if}
  </div>
  {@render children?.()}
</div>

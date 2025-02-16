<script lang="ts">
  import type {
    CommunityBlockView,
    InstanceBlockView,
    PersonBlockView,
  } from 'lemmy-js-client'
  import type { PageData } from './$types.js'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
  import { getClient } from '$lib/lemmy.svelte.js'
  import { profile } from '$lib/auth.svelte.js'
  import { Check, Icon, Trash, XMark } from 'svelte-hero-icons'
  import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
  import { flip } from 'svelte/animate'
  import { slide } from 'svelte/transition'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { Button } from 'mono-svelte'
  import Entity from '$lib/components/ui/Entity.svelte'
  import { t } from '$lib/translations.js'
  import Switch from '$lib/components/input/Switch.svelte'
  import UserAutocomplete from '$lib/components/lemmy/user/UserAutocomplete.svelte'
  import { expoOut } from 'svelte/easing'
  import Material from 'mono-svelte/materials/Material.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'

  interface Props {
    // sveltekit doesn't feel like making types work right now
    data: PageData & {
      person_blocks: PersonBlockView[]
      community_blocks: CommunityBlockView[]
    }
  }

  let { data: pageData }: Props = $props()
  let data = $state(pageData)

  async function unblockUser(item: PersonBlockView) {
    if (!profile.data?.jwt) return

    data.person_blocks.splice(
      data.person_blocks.findIndex((i) => i.target.id == item.target.id),
      1,
    )
    // hack to get reactivity working
    data.person_blocks = data.person_blocks

    await getClient().blockPerson({
      block: false,
      person_id: item.target.id,
    })
  }

  async function unblockCommunity(item: CommunityBlockView) {
    if (!profile.data?.jwt) return

    data.community_blocks.splice(
      data.community_blocks.findIndex(
        (i) => i.community.id == item.community.id,
      ),
      1,
    )

    // hack to get reactivity working
    data.community_blocks = data.community_blocks

    await getClient().blockCommunity({
      block: false,
      community_id: item.community.id,
    })
  }

  async function unblockInstances(item: InstanceBlockView) {
    if (!profile.data?.jwt) return
    if (!data.my_user?.instance_blocks) return

    data.my_user.instance_blocks.splice(
      data.my_user.instance_blocks.findIndex(
        (i) => i.instance.id == item.instance.id,
      ),
      1,
    )
    data.my_user.instance_blocks = data.my_user.instance_blocks

    await getClient().blockInstance({
      block: false,
      instance_id: item.instance.id,
    })
  }
</script>

<Header pageHeader>
  {$t('routes.profile.blocks.title')}
</Header>

{#if data.community_blocks?.length > 0 || data.person_blocks?.length > 0 || (data.my_user?.instance_blocks?.length ?? 0) > 0}
  {#if data.community_blocks?.length > 0}
    <div class="space-y-1">
      <SectionTitle>{$t('content.communities')}</SectionTitle>
      <Material
        color="uniform"
        class="bg-white dark:bg-zinc-950 max-h-96 overflow-auto"
        rounding="xl"
      >
        <ul class="divide-y divide-slate-200 dark:divide-zinc-900">
          {#each data.community_blocks as block (block.community.id)}
            <div class="flex flex-row gap-2 items-center py-1 -mx-4 px-4">
              <Button
                title="Unblock"
                size="square-md"
                rounding="pill"
                color="danger"
                onclick={() => unblockCommunity(block)}
              >
                {#snippet prefix()}
                  <Icon src={XMark} micro size="16" />
                {/snippet}
              </Button>
              <CommunityLink community={block.community} avatar />
            </div>
          {/each}
        </ul>
      </Material>
    </div>
  {/if}
  {#if data.person_blocks?.length > 0}
    <div class="space-y-1">
      <SectionTitle>{$t('content.users')}</SectionTitle>
      <Material
        color="uniform"
        class="bg-white dark:bg-zinc-950 max-h-96 overflow-auto"
        rounding="xl"
      >
        <ul class="divide-y divide-slate-200 dark:divide-zinc-900">
          {#each data.person_blocks as block (block.target.id)}
            <div class="flex flex-row gap-2 items-center py-1 -mx-4 px-4">
              <Button
                title="Unblock"
                size="square-md"
                rounding="pill"
                color="danger"
                onclick={() => unblockUser(block)}
              >
                {#snippet prefix()}
                  <Icon src={XMark} micro size="16" />
                {/snippet}
              </Button>
              <UserLink user={block.target} avatar badges />
            </div>
          {/each}
        </ul>
      </Material>
    </div>
  {/if}
  {#if data.my_user?.instance_blocks && (data.my_user?.instance_blocks?.length ?? 0) > 0}
    <div class="space-y-1">
      <SectionTitle class="text-lg">
        {$t('content.instances')}
      </SectionTitle>
      <Material
        color="uniform"
        class="bg-white dark:bg-zinc-950 max-h-96 overflow-auto"
        rounding="xl"
      >
        <ul class="divide-y divide-slate-200 dark:divide-zinc-900">
          {#each data.my_user?.instance_blocks as block (block.instance.id)}
            <div class="flex flex-row gap-2 items-center py-1 -mx-4 px-4">
              <Button
                title="Unblock"
                size="square-md"
                rounding="pill"
                color="danger"
                onclick={() => unblockInstances(block)}
              >
                {#snippet prefix()}
                  <Icon src={XMark} micro size="16" />
                {/snippet}
              </Button>
              <Entity
                icon={block.site?.icon}
                name={block.site?.name ?? block.instance.domain}
                label={block.instance.domain}
              />
            </div>
          {/each}
        </ul>
      </Material>
    </div>
  {/if}
{:else}
  <div class="h-full w-full grid place-items-center">
    <Placeholder
      icon={Check}
      title={$t('routes.profile.blocks.empty.title')}
      description={$t('routes.profile.blocks.empty.description')}
    />
  </div>
{/if}

<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { profile } from '$lib/auth.svelte.js'
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import EditableList from '$lib/components/ui/list/EditableList.svelte'
  import { toast } from 'mono-svelte'
  import { getClient } from '$lib/lemmy.js'
  import type { Tagline } from 'lemmy-js-client'
  import { Button } from 'mono-svelte'
  import { Icon, Plus, QuestionMarkCircle, Trash } from 'svelte-hero-icons'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { t } from '$lib/translations.js'

  let { data } = $props()

  let taglines = $state([
    ...(data.site?.taglines.map((t: Tagline) => t.content) ?? []),
  ])
  let newTagline = $state('')

  let saving = $state(false)

  async function save() {
    if (!$profile?.jwt) return

    saving = true

    try {
      await getClient().editSite({
        taglines: taglines,
      })
      toast({
        content: $t('toast.updatedSite'),
        type: 'success',
      })
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    saving = false
  }
</script>

{#if taglines.length > 0}
  <Header pageHeader class="justify-between">
    {$t('routes.admin.taglines.title')}<Button
      color="primary"
      onclick={save}
      loading={saving}
      disabled={saving}
      size="lg"
      class="h-max"
    >
      {$t('common.save')}
    </Button>
  </Header>

  <EditableList
    on:action={(e) => {
      taglines.splice(
        taglines.findIndex((i) => i == e.detail),
        1,
      )

      // hack for reactivity
      taglines = taglines
    }}
  >
    {#snippet children({ action })}
      {#each taglines as tagline}
        <div class="flex py-3">
          <Markdown source={tagline} inline />

          <div class="flex gap-2 ml-auto">
            <Button onclick={() => action(tagline)} size="square-md">
              <Icon src={Trash} mini size="16" />
            </Button>
          </div>
        </div>
      {/each}
    {/snippet}
  </EditableList>
  <form
    class="flex flex-col mt-auto gap-2 w-full"
    onsubmit={preventDefault(() => {
      if (newTagline == '' || !data.site) return

      taglines = [...taglines, newTagline]

      newTagline = ''
    })}
  >
    <MarkdownEditor bind:value={newTagline} images={false} />

    <Button size="lg" submit>
      {#snippet prefix()}
        <Icon src={Plus} size="16" mini />
      {/snippet}
      {$t('common.add')}
    </Button>
  </form>
{:else}
  <div class="my-auto">
    <Placeholder
      icon={Plus}
      title={$t('routes.admin.taglines.empty.title')}
      description={$t('routes.admin.taglines.empty.description')}
    >
      <div class="mt-4 max-w-xl w-full flex flex-col gap-2">
        <form
          class="flex flex-col gap-2 w-full"
          onsubmit={preventDefault(() => {
            if (newTagline == '' || !data.site) return

            taglines = [...taglines, newTagline]

            newTagline = ''
          })}
        >
          <MarkdownEditor
            bind:value={newTagline}
            placeholder={$t('routes.admin.taglines.add')}
            images={false}
          />

          <Button size="lg" submit>
            {#snippet prefix()}
              <Icon src={Plus} size="16" mini />
            {/snippet}
            {$t('common.add')}
          </Button>
        </form>

        <Button onclick={save} color="primary" size="lg" class="w-full">
          {$t('common.save')}
        </Button>
      </div>
    </Placeholder>
  </div>
{/if}

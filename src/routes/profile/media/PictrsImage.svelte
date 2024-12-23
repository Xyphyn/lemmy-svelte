<script lang="ts">
  import { profile } from '$lib/auth.svelte'
  import { publishedToDate } from '$lib/components/util/date'
  import RelativeDate from '$lib/components/util/RelativeDate.svelte'
  import { instance } from '$lib/instance'
  import { client } from '$lib/lemmy'
  import { t } from '$lib/translations'
  import { instanceToURL } from '$lib/util.svelte'
  import type { LocalImage } from 'lemmy-js-client'
  import { Button, Material, toast } from 'mono-svelte'
  import { createEventDispatcher } from 'svelte'
  import { ArrowDown, ArrowDownTray, Icon, Trash } from 'svelte-hero-icons'

  const dispatch = createEventDispatcher<{ delete: boolean }>()

  let loading = $state(false)

  async function deleteImage(image: LocalImage) {
    if (!$profile?.jwt) return

    try {
      loading = true
      const res = await client().deleteImage({
        token: image.pictrs_delete_token,
        filename: image.pictrs_alias,
      })

      dispatch('delete', res)
    } catch (e) {
      toast({ content: e as any, type: 'error' })
    }
    loading = false
  }

  interface Props {
    image: LocalImage
  }

  let { image }: Props = $props()
</script>

<div class="flex flex-col gap-1">
  <img
    src="{instanceToURL($instance)}/pictrs/image/{image.pictrs_alias}"
    width="500"
    height="500"
    class="aspect-square w-full h-full object-cover rounded-xl"
    alt="pictrs"
  />
  <div class="flex items-center gap-2">
    <RelativeDate
      class="text-sm text-slate-700 dark:text-zinc-300"
      date={publishedToDate(image.published)}
    />
    <Button
      title={$t('routes.profile.media.download')}
      href="{instanceToURL($instance)}/pictrs/image/{image.pictrs_alias}"
      size="square-md"
      class="ml-auto"
    >
      {#snippet prefix()}
        <Icon src={ArrowDownTray} size="16" mini />
      {/snippet}
    </Button>
    <Button
      title={$t('post.actions.more.delete')}
      onclick={() => deleteImage(image)}
      size="square-md"
      {loading}
      disabled={loading}
    >
      {#snippet prefix()}
        <Icon src={Trash} size="16" mini color="text-red-500" />
      {/snippet}
    </Button>
  </div>
</div>

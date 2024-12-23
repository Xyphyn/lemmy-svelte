<script lang="ts" module>
  import { pushState } from '$app/navigation'

  export function showImage(url: string, alt: string = '') {
    pushState('', {
      openImage: url,
    })
  }
</script>

<script lang="ts">
  import { page } from '$app/stores'
  import { Button, Material, toast } from 'mono-svelte'
  import {
    ArrowDownTray,
    Icon,
    MagnifyingGlassMinus,
    MagnifyingGlassPlus,
    Share,
    XMark,
  } from 'svelte-hero-icons'
  import { backOut, elasticOut, expoOut } from 'svelte/easing'
  import { fade, fly, scale } from 'svelte/transition'
  import { focusTrap } from 'svelte-focus-trap'
  import { t } from '$lib/translations'

  let zoomed = $state(false)
  let sharing = $state(false)

  async function downloadImage(url: string) {
    sharing = true
    const response = await fetch(url)

    const blob = await response.blob()

    const file = new File([blob], `photon_image.webp`, { type: blob.type })

    sharing = false
    return file
  }
  interface Props {
    /**
     * The full-resolution image URL
     */
    alt?: string
    class?: string
    children?: import('svelte').Snippet
  }

  let { alt = '', class: clazz = '', children }: Props = $props()
</script>

{#if $page.state.openImage || '' != ''}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_positive_tabindex -->
  <div
    class="fixed top-0 left-0 w-screen h-[100svh] overflow-auto bg-white/50 dark:bg-black/50
    flex flex-col z-[100] backdrop-blur-sm"
    transition:fade={{ duration: 150 }}
    onclick={() => history.back()}
    onkeydown={(e) => {
      if (e.key == 'Escape') history.back()
    }}
    use:focusTrap
  >
    <img
      width={400}
      height={400}
      src={$page.state.openImage}
      class="{zoomed
        ? 'object-cover'
        : 'object-contain'} max-w-max mx-auto my-auto overscroll-contain bg-white dark:bg-zinc-900"
      class:max-w-screen-md={!zoomed}
      class:w-full={!zoomed}
      class:min-h-screen={zoomed}
      class:min-w-screen={zoomed}
      class:w-max={zoomed}
      transition:scale={{ start: 0.95, easing: expoOut, duration: 250 }}
      {alt}
    />
    <div
      class="sticky z-10 bottom-4 left-1/2 -translate-x-1/2 w-max"
      transition:fly={{ duration: 350, y: 14, easing: backOut }}
    >
      <Material
        class="gap-1 p-2 flex flex-row items-center dark:bg-zinc-950"
        rounding="full"
        padding="none"
        color="uniform"
        onclick={(e) => e.stopPropagation()}
      >
        <Button
          download
          href={$page.state.openImage}
          color="tertiary"
          size="square-lg"
          rounding="pill"
          title={$t('routes.profile.media.download')}
        >
          <Icon src={ArrowDownTray} size="20" micro />
        </Button>
        <Button
          onclick={async () => {
            if (navigator.share) {
              const file = await downloadImage($page.state.openImage)

              navigator?.share?.({
                files: [file],
              })
            } else {
              navigator.clipboard.writeText($page.state.openImage)
              toast({ content: $t('toast.copied') })
            }
          }}
          color="tertiary"
          size="square-lg"
          rounding="pill"
          title={$t('post.actions.more.share')}
          loading={sharing}
        >
          {#snippet prefix()}
            <Icon src={Share} size="20" micro />
          {/snippet}
        </Button>
        <Button
          onclick={() => {
            zoomed = !zoomed
          }}
          color="tertiary"
          size="square-lg"
          rounding="pill"
          title={zoomed ? $t('post.image.zoomOut') : $t('post.image.zoomIn')}
        >
          <Icon
            src={zoomed ? MagnifyingGlassMinus : MagnifyingGlassPlus}
            size="20"
            micro
          />
        </Button>
        <Button
          onclick={() => history.back()}
          color="tertiary"
          size="square-lg"
          rounding="pill"
          title={$t('post.image.close')}
        >
          {#snippet prefix()}
            <Icon src={XMark} size="20" micro />
          {/snippet}
        </Button>
      </Material>
    </div>
  </div>
{/if}

<button onclick={() => history.back()} class="contents {clazz}">
  {@render children?.()}
</button>

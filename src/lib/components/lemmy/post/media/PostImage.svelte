<script lang="ts">
  import { stopPropagation } from 'svelte/legacy'

  import { settings, type View } from '$lib/settings.svelte'
  import type { Post } from 'lemmy-js-client'
  import { bestImageURL, postLink } from '../helpers'
  import { showImage } from '$lib/components/ui/ExpandableImage.svelte'
  import { Button, modal } from 'mono-svelte'
  import { onMount } from 'svelte'

  interface Props {
    post: Post
    blur?: boolean
  }

  let { post, blur = false }: Props = $props()

  let imageLoaded: boolean | null = $state(null)

  onMount(() => {
    imageLoaded = false
  })
</script>

<!--disabled preloads here since most people will hover over every image while scrolling-->
<svelte:element
  this={settings.expandImages ? 'button' : 'a'}
  href={postLink(post)}
  class="container mx-auto z-10 rounded-xl max-h-[60vh] relative overflow-hidden bg-slate-100 dark:bg-zinc-900"
  data-sveltekit-preload-data="off"
  aria-label={post.name}
  onclick={() => showImage(bestImageURL(post, false, -1))}
  role="button"
  tabindex="0"
>
  <!-- svelte-ignore a11y_missing_attribute -->
  <img
    loading="lazy"
    fetchpriority="auto"
    src={bestImageURL(post, false, 64)}
    class="-z-10 absolute top-0 left-0 w-full h-full object-cover blur-lg
         scale-[1.2] opacity-50"
  />
  <picture class="max-h-[inherit]">
    <source
      srcset={bestImageURL(post, false, 256)}
      media="(max-width: 256px)"
    />
    <source
      srcset={bestImageURL(post, false, 512)}
      media="(max-width: 512px)"
    />
    <source
      srcset={bestImageURL(post, false, 1024)}
      media="(max-width: 1024px)"
    />
    <source
      srcset={bestImageURL(post, false, 1512)}
      media="(max-width: 1512px)"
    />
    <!-- svelte-ignore a11y_missing_attribute -->
    <img
      src={bestImageURL(post, false, -1)}
      loading="lazy"
      class="max-h-[inherit] max-w-full h-auto z-30
                  transition-opacity duration-500 object-contain mx-auto
          {imageLoaded === false ? 'opacity-0' : 'opacity-100'}"
      width={512}
      height={300}
      class:blur-[64px]={blur}
      alt={post.alt_text ?? ''}
      onload={() => (imageLoaded = true)}
    />
  </picture>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="absolute bottom-0 left-0 right-0 flex justify-between items-center
        rounded-full ml-auto w-max m-2 p-0 gap-1
        *:bg-white *:border *:border-slate-200 *:dark:border-zinc-800 *:dark:bg-zinc-900"
    onclick={(e) => e.stopPropagation()}
  >
    {#if post.alt_text}
      <Button
        onclick={(e) => {
          e.stopPropagation()
          modal({
            title: 'Alt',
            body: post.alt_text ?? '',
          })
        }}
        color="tertiary"
        size="md"
        rounding="pill"
      >
        ALT
      </Button>
    {/if}
  </div>
</svelte:element>

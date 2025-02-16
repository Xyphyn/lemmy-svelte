<script lang="ts">
  import { showImage } from '$lib/components/ui/ExpandableImage.svelte'
  import {
    iframeType,
    mediaType,
    optimizeImageURL,
  } from '$lib/components/lemmy/post/helpers'
  import PostIframe from '$lib/components/lemmy/post/media/PostIframe.svelte'

  interface Props {
    href: string
    title?: string | undefined
    text?: string
  }

  let { href, title = undefined, text = '' }: Props = $props()

  let type = $derived(mediaType(href, 'cozy'))
</script>

<div
  class="w-auto h-auto max-h-96 rounded-2xl p-2 border border-slate-200 dark:border-zinc-800
  inline-block"
>
  {#if type == 'video' || type == 'embed' || type == 'iframe'}
    <PostIframe
      type={iframeType(href)}
      url={href}
      opened={true}
      autoplay={false}
      class="w-auto h-auto max-h-80 inline-block rounded-lg"
    />
  {:else}
    <button
      class="inline"
      onclick={() => showImage(optimizeImageURL(href, -1), text)}
    >
      <img
        src={optimizeImageURL(href, 1024)}
        {title}
        alt={text}
        width={300}
        height={300}
        class="object-contain w-auto h-auto max-h-80 inline rounded-lg"
      />
    </button>
  {/if}
</div>

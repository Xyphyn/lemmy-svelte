<script lang="ts" module>
  const youtubeDomain = (place: 'youtube' | 'invidious' | 'piped') => {
    switch (place) {
      case 'youtube': {
        return 'www.youtube-nocookie.com'
      }
      case 'invidious': {
        return settings.embeds.invidious || 'yewtu.be'
      }
      case 'piped': {
        return settings.embeds.piped || 'piped.video'
      }
    }
  }

  function youtubeVideoID(url: string): string | null {
    const regex =
      /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|live\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
    const match = url.match(regex)

    if (match && match[1]) {
      return match[1]
    }

    return null
  }
</script>

<script lang="ts">
  import {
    Icon,
    PuzzlePiece,
    VideoCamera,
    type IconSource,
  } from 'svelte-hero-icons'
  import { optimizeImageURL, type IframeType, type MediaType } from '../helpers'
  import { settings } from '$lib/settings.svelte'
  import { get } from 'svelte/store'

  const urlToEmbed = (inputUrl: string) => {
    if (type == 'video') {
      return inputUrl
    }

    if (type == 'youtube') {
      const url = new URL(inputUrl)

      const videoID = youtubeVideoID(inputUrl)

      if (autoplay) url.searchParams.set('autoplay', '1')

      return `https://${youtubeDomain(
        settings.embeds.youtube,
      )}/embed/${videoID}?${url.searchParams.toString()}`
    }

    return ''
  }

  const typeData = (
    type: IframeType,
  ): {
    icon: IconSource
    text: string
  } => {
    switch (type) {
      case 'youtube': {
        return {
          icon: VideoCamera,
          text: 'YouTube Video',
        }
      }
      case 'video': {
        return {
          icon: VideoCamera,
          text: 'Video',
        }
      }
      default: {
        return {
          icon: PuzzlePiece,
          text: 'Embed',
        }
      }
    }
  }

  interface Props {
    type?: IframeType
    thumbnail?: string | undefined
    url: string
    opened?: any
    autoplay?: boolean
    class?: string
  }

  let {
    type = 'none',
    thumbnail = undefined,
    url,
    opened = $bindable(!settings.embeds.clickToView),
    autoplay = settings.embeds.clickToView,
    class: clazz = '',
  }: Props = $props()

  let data = $derived(typeData(type))
  let embedUrl = $derived(urlToEmbed(url))
</script>

<!-- 
  @component
  Displays a video file or embedded video iframe.
-->
{#if opened}
  {#if type == 'video'}
    <!-- svelte-ignore a11y_media_has_caption -->
    <video {autoplay} controls class="rounded-xl aspect-video {clazz}">
      <source src={url} />
    </video>
  {:else}
    <iframe
      src={embedUrl}
      title="Embed player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      class="aspect-video rounded-xl dark:bg-zinc-900 {clazz ?? ''}"
    ></iframe>
  {/if}
{:else}
  <button
    onclick={() => (opened = true)}
    class="aspect-video w-full h-full z-0 overflow-hidden relative rounded-xl flex flex-col gap-2 items-center justify-center text-white"
  >
    {#if thumbnail}
      <img
        src={optimizeImageURL(thumbnail, 512)}
        class="absolute top-0 left-0 -z-10 brightness-[25%] w-full object-cover h-full"
        alt=""
      />
    {:else}
      <div
        class="absolute blur-3xl -z-10 top-0 left-0 w-full h-full bg-gradient-to-br from-green-800 via-blue-900 via-20% to-red-700"
      ></div>
    {/if}
    <Icon src={data.icon} solid size="48" />
    <h1 class="font-bold text-xl">{data.text}</h1>
    <p>Click to view this content.</p>
  </button>
{/if}

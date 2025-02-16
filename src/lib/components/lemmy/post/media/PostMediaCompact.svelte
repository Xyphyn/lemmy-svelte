<script lang="ts">
  import {
    bestImageURL,
    optimizeImageURL,
    postLink,
    type MediaType,
  } from '$lib/components/lemmy/post/helpers.js'
  import { showImage } from '$lib/components/ui/ExpandableImage.svelte'
  import { settings, type View } from '$lib/settings.svelte.js'
  import { t } from '$lib/translations'
  import { isImage } from '$lib/ui/image'
  import type { Post } from 'lemmy-js-client'
  import { Material, modal, Popover } from 'mono-svelte'
  import Button from 'mono-svelte/button/Button.svelte'
  import {
    DocumentText,
    Icon,
    Link,
    VideoCamera,
    ExclamationTriangle,
  } from 'svelte-hero-icons'

  const thumbnailSize = (view: View) =>
    view == 'compact' ? 'w-22 h-22 sm:w-28' : 'w-24 h-24 sm:w-32'

  interface Props {
    post: Post
    type?: MediaType
    view?: View
    blur?: boolean
    style?: string
    class?: string
  }

  let {
    post,
    type = 'none',
    view = 'cozy',
    blur = post.nsfw && settings.nsfwBlur,
    style = '',
    class: clazz = '',
  }: Props = $props()

  let size = $derived(thumbnailSize(view))
</script>

<!-- 
  @component
  Thumbnails for compact and list view posts.
-->
<div class="{size} relative group/media {clazz ?? ''}" {style}>
  {#if post.alt_text}
    <Button
      rounding="pill"
      class="w-max absolute bottom-0 left-0 py-0.5 px-1.5 m-1 font-bold"
      onclick={() => modal({ title: 'Alt', body: post.alt_text ?? '' })}
    >
      ALT
    </Button>
  {/if}
  <svelte:element
    this={!settings.expandImages || type != 'image' ? 'a' : 'button'}
    href={postLink(post)}
    onclick={() => {
      if (type == 'image') {
        showImage(bestImageURL(post, false, -1))
      }
    }}
    role="button"
    tabindex="0"
  >
    {#if post.thumbnail_url || isImage(post.url)}
      <div class="relative overflow-hidden rounded-xl">
        <picture>
          <img
            src={optimizeImageURL(post.thumbnail_url || post.url || '', 256)}
            loading="lazy"
            class="object-cover relative overflow-hidden bg-slate-100 dark:bg-zinc-800 rounded-xl
        transition-colors {size}"
            alt={post.alt_text ?? ' '}
            class:blur-xl={blur}
          />
          {#if type != 'image'}
            <div
              class="absolute w-8 h-8 m-1 bottom-0 left-0 rounded-xl text-slate-800 dark:text-zinc-200
              bg-slate-25 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700
              grid place-items-center"
            >
              <Icon
                src={type == 'iframe' ? VideoCamera : Link}
                micro
                size="16"
              />
            </div>
          {/if}
        </picture>
      </div>
      {#if blur}
        <div
          class="absolute w-full h-full grid place-items-center inset-0 z-30"
        >
          <Icon
            src={ExclamationTriangle}
            solid
            size="32"
            class="z-50 opacity-30"
          />
        </div>
      {/if}
    {:else}
      <div
        class="object-cover overflow-hidden bg-slate-50 dark:bg-zinc-900 rounded-xl
        border border-slate-200 dark:border-zinc-800 group-hover/media:border-slate-400
        group-hover/media:dark:border-zinc-600 transition-colors text-slate-400 dark:text-zinc-600 grid
        place-items-center {size}"
      >
        <Icon
          src={type == 'embed'
            ? Link
            : type == 'iframe'
              ? VideoCamera
              : DocumentText}
          solid
          size="32"
        />
      </div>
    {/if}
  </svelte:element>
</div>

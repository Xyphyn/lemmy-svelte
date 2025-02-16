<script lang="ts">
  import Empty from '$lib/components/helper/Empty.svelte'
  import PostLink from '$lib/components/lemmy/post/link/PostLink.svelte'
  import {
    bestImageURL,
    postLink,
    type MediaType,
    iframeType,
  } from '$lib/components/lemmy/post/helpers.js'
  import ExpandableImage, {
    showImage,
  } from '$lib/components/ui/ExpandableImage.svelte'
  import { settings, type View } from '$lib/settings.svelte.js'
  import type { Post } from 'lemmy-js-client'
  import PostIframe from './PostIframe.svelte'
  import { Button, Material, modal } from 'mono-svelte'
  import { onMount } from 'svelte'
  import { ArrowDownTray, Icon } from 'svelte-hero-icons'
  import PostImage from './PostImage.svelte'

  interface Props {
    view?: View
    post: Post
    type?: MediaType
    opened?: boolean | undefined
    blur?: boolean
  }

  let {
    view = 'cozy',
    post,
    type = 'none',
    opened = undefined,
    blur = post.nsfw && settings.nsfwBlur,
  }: Props = $props()
</script>

<!-- 
  @component
  This component will show either
  - A media item (pictures, videos) (large form factor posts only)
  - Embed link/card.
-->
{#if type == 'image' && view == 'cozy'}
  <PostImage {post} {blur} />
{:else if (type == 'iframe' || type == 'video') && view == 'cozy' && post.url}
  <PostIframe
    thumbnail={post.thumbnail_url}
    type={iframeType(post.url)}
    url={post.url}
    {opened}
  />
{:else if type == 'embed' && post.url}
  <PostLink
    url={post.url}
    thumbnail_url={post.thumbnail_url}
    nsfw={post.nsfw}
    embed_description={post.embed_description}
    embed_title={post.embed_title}
    {view}
  />
{/if}

<script lang="ts">
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { settings } from '$lib/settings.svelte.js'
  import type { PostView } from 'lemmy-js-client'
  import { Badge, Button } from 'mono-svelte'
  import { ArchiveBox, Icon, Minus, Plus } from 'svelte-hero-icons'
  import { expoOut } from 'svelte/easing'
  import { fly, slide } from 'svelte/transition'
  import { combineCrossposts } from './crosspost.svelte'

  interface Props {
    posts: PostView[]
    community?: boolean
    feedData: any
    children?: import('svelte').Snippet
    [key: string]: any
  }

  let {
    posts = $bindable(),
    community = false,
    feedData,
    children,
    ...rest
  }: Props = $props()
  let etc = rest

  let combinedPosts = $derived(combineCrossposts(posts))

  let viewPost: number = $state(-1)
</script>

<ul
  class="flex flex-col list-none {settings.view == 'card'
    ? 'gap-3 md:gap-4'
    : 'divide-y'} divide-slate-200 dark:divide-zinc-800"
>
  {#if posts?.length == 0}
    <div class="h-full grid place-items-center">
      <Placeholder
        icon={ArchiveBox}
        title="No posts"
        description="There are no posts that match this filter."
      >
        <Button href="/communities">
          {#snippet prefix()}
            <Icon src={Plus} size="16" mini />
          {/snippet}
          <span>Follow some communities</span>
        </Button>
      </Placeholder>
    </div>
  {:else}
    {#each combinedPosts as post, index}
      {#if !(settings.hidePosts.deleted && post.post.deleted) && !(settings.hidePosts.removed && post.post.removed)}
        <li class="relative post-container">
          <Post
            hideCommunity={community}
            view={(post.post.featured_community || post.post.featured_local) &&
            settings.posts.compactFeatured
              ? 'compact'
              : settings.view}
            {post}
            class="transition-all duration-250"
            on:hide={() => {
              posts = posts.toSpliced(index, 1)
            }}
          >
            {#snippet badges()}
              {#if post.withCrossposts}
                <button
                  onclick={() => {
                    if (viewPost == post.post.id) viewPost = -1
                    else viewPost = post.post.id
                  }}
                >
                  <Badge
                    class="z-10 backdrop-blur-xl hover:brightness-110 cursor-pointer transition-all"
                    color="gray-subtle"
                  >
                    {#if viewPost == post.post.id}
                      <Icon mini src={Minus} size="14" />
                    {:else}
                      <Icon mini src={Plus} size="14" />
                    {/if}
                    {post.crossposts.length} crosspost{post.crossposts.length ==
                    1
                      ? ''
                      : 's'}
                  </Badge>
                </button>{/if}
            {/snippet}
          </Post>
          {#if post.withCrossposts && viewPost == post.post.id}
            <div
              transition:slide|global={{
                axis: 'y',
                duration: 500,
                easing: expoOut,
              }}
            >
              <span
                class="text-sm flex flex-row gap-2 items-center"
                class:my-4={settings.view == 'card'}
              >
                Crossposts <hr class="w-full dark:border-zinc-800" />
                {post.crossposts.length}
              </span>
              {#each post.crossposts as crosspost, index}
                <div class="w-full transition-all mb-4">
                  <Post post={crosspost} view={settings.view} />
                </div>
              {/each}
            </div>
          {/if}
        </li>
      {/if}
    {/each}
  {/if}
  {@render children?.()}
</ul>

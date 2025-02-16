<script lang="ts">
  import { run } from 'svelte/legacy'

  import { browser } from '$app/environment'
  import { afterNavigate } from '$app/navigation'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import EndPlaceholder from '$lib/components/ui/EndPlaceholder.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { client } from '$lib/lemmy.svelte'
  import {
    postFeeds,
    type PostFeed,
    type PostFeedID,
  } from '$lib/lemmy/postfeed'
  import { settings } from '$lib/settings.svelte.js'
  import { t } from '$lib/translations'
  import { createWindowVirtualizer } from '@tanstack/svelte-virtual'
  import type { PostView } from 'lemmy-js-client'
  import { Button } from 'mono-svelte'
  import { onMount } from 'svelte'
  import {
    ArchiveBox,
    ChevronDoubleUp,
    ExclamationTriangle,
    Icon,
    Plus,
  } from 'svelte-hero-icons'
  import InfiniteScroll from 'svelte-infinite-scroll'

  let virtualItemEls: HTMLElement[] = $state([])
  let virtualListEl: HTMLElement | undefined = $state(undefined)

  afterNavigate(() => {
    $virtualizer.scrollToIndex($postFeeds[feedId]?.lastSeen ?? 0)
  })

  interface Props {
    posts: PostView[]
    community?: boolean
    feedId: PostFeedID
    feedData: PostFeed['data']
    children?: import('svelte').Snippet
  }

  let {
    posts = $bindable(),
    community = false,
    feedId,
    feedData = $bindable(),
    children,
  }: Props = $props()

  const virtualizer = createWindowVirtualizer({
    count: posts.length,
    estimateSize: () => 150,
    overscan: 5,
    measureElement: (element, entry, instance) => {
      return element.scrollHeight
    },
  })

  let error: any = $state(undefined)
  let loading = $state(false)
  let hasMore = $state(true)

  async function loadMore() {
    if (!hasMore || loading) return

    try {
      loading = true

      const newPosts = await client()
        .getPosts({
          page_cursor: feedData.cursor.next,
          disliked_only: feedData.disliked_only,
          liked_only: feedData.liked_only,
          community_id: feedData.community_id,
          community_name: feedData.community_name,
          limit: feedData.limit,
          page: feedData.page,
          saved_only: feedData.saved_only,
          show_hidden: feedData.show_hidden,
          sort: feedData.sort,
          type_: feedData.type_,
        })
        .catch((e) => {
          throw new Error(e)
        })

      error = null

      hasMore = newPosts.posts.length != 0

      feedData.cursor.next = newPosts.next_page
      feedData.posts.posts = [...feedData.posts.posts, ...newPosts.posts]

      postFeeds.updateFeed(feedId, {
        data: feedData,
      })

      loading = false
    } catch (e) {
      error = e
      loading = false
    }
  }

  const callback: IntersectionObserverCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      const element = entry.target as HTMLElement
      const id = element.getAttribute('data-index')

      if (!id) return

      postFeeds.updateFeed(feedId, {
        lastSeen: Number(id),
      })
      observer.unobserve(element)
    })
  }

  onMount(() => {
    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    })

    const elements = document.querySelectorAll('.post-container')
    elements.forEach((el) => observer.observe(el))

    const postContainer = document.querySelector('#feed')
    if (postContainer) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (
                node instanceof HTMLElement &&
                node.classList.contains('post-container')
              ) {
                observer.observe(node)
              }
            })
            mutation.removedNodes.forEach((node) => {
              if (
                node instanceof HTMLElement &&
                node.classList.contains('post-container')
              ) {
                observer.unobserve(node)
              }
            })
          }
        })
      })

      mutationObserver.observe(postContainer, {
        childList: true,
        subtree: true,
      })
    }
  })

  let items = $derived($virtualizer.getVirtualItems())
  $effect(() => {
    if (virtualItemEls.length)
      virtualItemEls.forEach($virtualizer.measureElement)
  })
  $effect(() => {
    if (posts.length && virtualListEl)
      $virtualizer.setOptions({
        scrollMargin: virtualListEl?.offsetTop,
        count: posts.length,
      })
  })
</script>

<ul
  class="flex flex-col list-none divide-y divide-slate-200 dark:divide-zinc-800"
>
  {#key posts}
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
      <div
        style="position:relative; height: {browser
          ? `${$virtualizer?.getTotalSize()}px`
          : '100%'}; width: 100%;"
        bind:this={virtualListEl}
      >
        <div
          style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({items?.[0]
            ? items?.[0]?.start - $virtualizer.options.scrollMargin
            : 0}px);"
          class="divide-y divide-slate-200 dark:divide-zinc-900"
          id="feed"
        >
          {#each items as row, index (posts[row.index]?.post.id)}
            {#if posts[row.index]}
              <li
                bind:this={virtualItemEls[index]}
                data-index={row.index}
                style={row.index < 7 ? `--anim-delay: ${index * 100}ms` : ''}
                class="relative post-container {row.index < 7
                  ? 'pop-in opacity-0'
                  : ''} -mx-4 sm:-mx-6 px-4 sm:px-6"
              >
                <Post
                  bind:post={posts[row.index]}
                  hideCommunity={community}
                  view={(posts[row.index]?.post.featured_community ||
                    posts[row.index]?.post.featured_local) &&
                  settings.posts.compactFeatured
                    ? 'compact'
                    : settings.view}
                  class="transition-all duration-250"
                  onhide={() => {
                    posts = posts.toSpliced(row.index, 1)
                  }}
                ></Post>
              </li>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  {/key}

  {#if settings.infiniteScroll && browser}
    {#if error}
      <div
        class="flex flex-col justify-center items-center
        rounded-xl gap-2 py-8 mt-6
        border !border-b !border-red-500 bg-red-500/5 px-4"
      >
        <div class="bg-red-500/30 rounded-full p-3 text-red-500">
          <Icon src={ExclamationTriangle} size="24" solid></Icon>
        </div>
        <pre class="py-0.5">{error}</pre>
        <Button
          color="primary"
          {loading}
          disabled={loading}
          onclick={() => loadMore()}
        >
          {$t('message.retry')}
        </Button>
      </div>
    {:else if hasMore}
      <div class="w-full flex flex-col gap-2 animate-pulse pt-6">
        <div
          class="w-96 max-w-full h-8 bg-slate-100 dark:bg-zinc-800 rounded-md"
        ></div>
        <div class="w-full h-48 bg-slate-100 dark:bg-zinc-800 rounded-md"></div>
        <div class="!bg-transparent h-8 flex justify-between">
          <div class="w-48 h-8 bg-slate-100 dark:bg-zinc-800 rounded-md"></div>
          <div class="w-24 h-8 bg-slate-100 dark:bg-zinc-800 rounded-md"></div>
        </div>
      </div>
    {:else}
      <div style="border-top-width: 0">
        <EndPlaceholder>
          {$t('routes.frontpage.endFeed', {
            // @ts-ignore
            community_name: feedData.community_name ?? 'undefined',
          })}
          {#snippet action()}
            <Button color="tertiary">
              {#snippet prefix()}
                <Icon src={ChevronDoubleUp} size="16" micro />
              {/snippet}
              {$t('routes.post.scrollToTop')}
            </Button>
          {/snippet}
        </EndPlaceholder>
      </div>
    {/if}
    <InfiniteScroll window threshold={1000} on:loadMore={loadMore} />
  {/if}
  {@render children?.()}
</ul>

<style lang="postcss">
  @keyframes popIn {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
    to {
      transform: translateY(0px);
      opacity: 1;
    }
  }

  .pop-in {
    animation: popIn 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards
      var(--anim-delay);
  }
</style>

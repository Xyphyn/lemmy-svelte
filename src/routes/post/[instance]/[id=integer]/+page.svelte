<script lang="ts">
  import { buildCommentsTree } from '$lib/components/lemmy/comment/comments.svelte.js'
  import { isImage } from '$lib/ui/image.js'
  import { client, getClient } from '$lib/lemmy.svelte.js'
  import CommentForm from '$lib/components/lemmy/comment/CommentForm.svelte'
  import { onMount } from 'svelte'
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import { page } from '$app/state'
  import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
  import {
    ArrowLeft,
    ArrowPath,
    ChevronDoubleUp,
    Icon,
    InformationCircle,
    Home,
    PlusCircle,
    ChatBubbleLeftRight,
    Bookmark,
    BookmarkSlash,
    ArrowUp,
    ArrowDown,
    Fire,
    Trophy,
    Star,
    Clock,
    ArrowTrendingDown,
  } from 'svelte-hero-icons'
  import PostMeta, {
    parseTags,
  } from '$lib/components/lemmy/post/PostMeta.svelte'
  import { Select, removeToast, toast } from 'mono-svelte'
  import type { CommentSortType, GetCommentsResponse } from 'lemmy-js-client'
  import { profile } from '$lib/auth.svelte.js'
  import { instance } from '$lib/instance.svelte.js'
  import { afterNavigate, goto } from '$app/navigation'
  import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
  import { Button } from 'mono-svelte'
  import EndPlaceholder from '$lib/components/ui/EndPlaceholder.svelte'
  import { settings } from '$lib/settings.svelte.js'
  import { publishedToDate } from '$lib/components/util/date.js'
  import PostMedia from '$lib/components/lemmy/post/media/PostMedia.svelte'
  import { mediaType } from '$lib/components/lemmy/post/helpers.js'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import Expandable from '$lib/components/ui/Expandable.svelte'
  import { Popover } from 'mono-svelte'
  import { t } from '$lib/translations.js'
  import { resumables } from '$lib/lemmy/item.js'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import CommentListVirtualizer from '$lib/components/lemmy/comment/CommentListVirtualizer.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { fly } from 'svelte/transition'
  import { expoOut } from 'svelte/easing'
  import Option from 'mono-svelte/forms/select/Option.svelte'
  import CommentProvider from './CommentProvider.svelte'

  let { data: loaded = $bindable() } = $props()
  let data = $state(loaded)
  $effect(() => {
    data = loaded
  })

  const updateActions = () => {
    // @ts-ignore
    data.contextual = {
      actions: [
        {
          name: $t('post.actions.vote.upvote'),
          icon: ArrowUp,
          handle: async () => {
            data.post.post_view.my_vote = (
              await client().likePost({
                post_id: data.post.post_view.post.id,
                score: data.post.post_view.my_vote == 1 ? 0 : 1,
              })
            ).post_view.my_vote
          },
        },
        {
          name: $t('post.actions.vote.downvote'),
          icon: ArrowDown,
          handle: async () => {
            data.post.post_view.my_vote = (
              await client().likePost({
                post_id: data.post.post_view.post.id,
                score: data.post.post_view.my_vote == -1 ? 0 : -1,
              })
            ).post_view.my_vote
          },
        },
        {
          name: data.post.post_view.saved
            ? $t('post.actions.unsave')
            : $t('post.actions.save'),
          handle: async () => {
            data.post.post_view.saved = (
              await client().savePost({
                post_id: data.post.post_view.post.id,
                save: !data.post.post_view.saved,
              })
            ).post_view.saved
          },
          icon: data.post.post_view.saved ? BookmarkSlash : Bookmark,
        },
      ],
    }
  }

  $effect(() => {
    if (data.post) updateActions()
  })

  onMount(async () => {
    if (
      !(data.post.post_view.read && settings.markPostsAsRead) &&
      profile.data?.jwt
    ) {
      getClient().markPostAsRead({
        read: settings.markPostsAsRead,
        post_ids: [data.post.post_view.post.id],
        // @ts-ignore
        post_id: data.post.post_view.post.id,
      })
    }

    resumables.add({
      name: data.post.post_view.post.name,
      type: 'post',
      url: page.url.toString(),
      avatar: data.post.post_view.post.thumbnail_url,
    })
  })

  const fetchOnHome = async (jwt: string) => {
    const id = toast({
      content: $t('toast.fetchPostOnHome'),
      loading: true,
    })

    try {
      const res = await getClient().resolveObject({
        q: data.post.post_view.post.ap_id,
      })

      if (res.post) {
        removeToast(id)
        goto(`/post/${instance.data}/${res.post.post.id}`, {}).then(() =>
          removeToast(id),
        )
      }
    } catch (err) {
      removeToast(id)
    }
  }

  let commentsPage = 1
  let commentSort: CommentSortType = $state(data.commentSort)
  let loading = $state(false)

  async function reloadComments() {
    loading = true
    data.comments = getClient().getComments({
      page: 1,
      limit: 25,
      type_: 'All',
      post_id: data.post.post_view.post.id,
      sort: commentSort,
      max_depth: data.post.post_view.counts.comments > 100 ? 1 : 3,
    })
    loading = false
    data.thread.singleThread = false
    commentsPage = 1
  }

  let commenting = $state(false)

  let remoteView = $derived(
    page.params.instance?.toLowerCase() != instance.data?.toLowerCase(),
  )
</script>

<svelte:head>
  <title>{data.post.post_view.post.name}</title>
  <meta property="og:title" content={data.post.post_view.post.name} />
  <meta property="twitter:title" content={data.post.post_view.post.name} />
  <meta property="og:url" content={page.url.toString()} />
  {#if isImage(data.post.post_view.post.url)}
    <meta property="og:image" content={data.post.post_view.post.url} />
    <meta property="twitter:card" content={data.post.post_view.post.url} />
  {:else if data.post.post_view.post.thumbnail_url}
    <meta
      property="og:image"
      content={data.post.post_view.post.thumbnail_url}
    />
    <meta
      property="twitter:card"
      content={data.post.post_view.post.thumbnail_url}
    />
  {/if}
  {#if data.post.post_view.post.body}
    <meta
      property="description"
      content={data.post.post_view.post.body.slice(0, 500)}
    />
    <meta
      property="og:description"
      content={data.post.post_view.post.body.slice(0, 500)}
    />
    <meta
      property="twitter:description"
      content={data.post.post_view.post.body.slice(0, 500)}
    />
  {/if}
</svelte:head>

<article class="flex flex-col gap-2">
  {#if remoteView}
    <div
      class="sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20
      border-b dark:border-zinc-800 border-slate-300
      -mx-4 -mt-4 md:-mt-6 md:-mx-6 sticky-header px-4 py-2
      flex items-center gap-2 mb-4 h-12
      "
    >
      <Popover openOnHover>
        {#snippet target()}
          <Icon
            src={InformationCircle}
            size="24"
            solid
            class="bg-slate-200 dark:bg-zinc-700 p-0.5 rounded-full text-primary-900 dark:text-primary-100"
          />
        {/snippet}
        {$t('routes.post.instanceWarning')}
      </Popover>
      <span class="text-primary-900 dark:text-primary-100 font-bold">
        {$t('routes.post.remoteView')}
      </span>
      {#if profile.data?.jwt}
        <Button
          class="ml-auto"
          onclick={() => {
            if (profile.data?.jwt) {
              fetchOnHome(profile.data?.jwt)
            }
          }}
        >
          <Icon src={Home} mini size="16" />
          {$t('routes.post.localView')}
        </Button>
      {/if}
    </div>
  {/if}

  <header class="flex flex-col gap-2">
    <div class="flex flex-row justify-between items-center gap-2 flex-wrap">
      <PostMeta
        community={data.post.post_view.community}
        user={data.post.post_view.creator}
        bind:subscribed={data.post.community_view.subscribed}
        badges={{
          deleted: data.post.post_view.post.deleted,
          removed: data.post.post_view.post.removed,
          locked: data.post.post_view.post.locked,
          featured:
            data.post.post_view.post.featured_community ||
            data.post.post_view.post.featured_local,
          nsfw: data.post.post_view.post.nsfw,
          saved: data.post.post_view.saved,
          admin: data.post.post_view.creator_is_admin,
          moderator: data.post.post_view.creator_is_moderator,
        }}
        published={publishedToDate(data.post.post_view.post.published)}
        edited={data.post.post_view.post.updated}
        title={data.post.post_view.post.name}
        style="width: max-content;"
        tags={parseTags(data.post.post_view.post.name).tags}
      />
      <Button onclick={() => history.back()} size="square-md">
        {#snippet prefix()}
          <Icon src={ArrowLeft} micro size="16" />
        {/snippet}
      </Button>
    </div>
    <h1 class="font-bold text-xl font-display leading-5">
      <Markdown
        source={parseTags(data.post.post_view.post.name).title ??
          data.post.post_view.post.name}
        inline
      />
    </h1>
  </header>
  <PostMedia
    type={mediaType(data.post.post_view.post.url)}
    post={data.post.post_view.post}
    opened
    view="cozy"
  />
  {#if data.post.post_view.post.body}
    <div class="text-base text-slate-800 dark:text-zinc-300 leading-[1.5]">
      <Markdown source={data.post.post_view.post.body} />
    </div>
  {/if}
  <div class="w-full relative">
    <PostActions
      bind:post={data.post.post_view}
      onedit={() =>
        toast({
          content: 'The post was edited successfully.',
          type: 'success',
        })}
    />
  </div>
  {#if data.post.cross_posts?.length > 0}
    <Expandable
      class="text-base mt-2 w-full cursor-pointer"
      open={data.post.cross_posts?.length <= 3}
    >
      {#snippet title()}
        <div
          class="flex items-center gap-1 w-full text-left text-base font-normal"
        >
          <span class="font-bold">{data.post.cross_posts.length}</span>
          {$t('routes.post.crosspostCount')}
          <hr
            class="flex-1 inline-block w-full border-slate-200 dark:border-zinc-800 mx-3"
          />
        </div>
      {/snippet}
      <div
        class="!divide-y divide-slate-200 dark:divide-zinc-800 flex flex-col"
      >
        {#each data.post.cross_posts as crosspost}
          <Post view="compact" actions={false} post={crosspost} />
        {/each}
      </div>
    </Expandable>
  {/if}
</article>
{#if data.thread.showContext || data.thread.singleThread}
  <div
    class="sticky mx-auto z-50 max-w-lg w-full min-w-0 flex items-center overflow-auto gap-1
    bg-slate-50/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-zinc-800/50
    p-1 rounded-full px-2.5 justify-between top-6 lg:top-22"
  >
    <p class="font-medium text-sm flex items-center gap-2">
      <Icon src={InformationCircle} mini size="20" />
      {data.thread.showContext
        ? $t('routes.post.thread.part')
        : $t('routes.post.thread.single')}
    </p>
    <Button
      color="none"
      rounding="pill"
      {loading}
      disabled={loading}
      href={data.thread.showContext
        ? `/comment/${page.params.instance}/${data.thread.showContext}`
        : undefined}
      class="hover:bg-white/50 dark:hover:bg-zinc-800/30"
      onclick={data.thread.singleThread ? reloadComments : undefined}
    >
      {data.thread.showContext
        ? $t('routes.post.thread.context')
        : $t('routes.post.thread.allComments')}
    </Button>
  </div>
{/if}
<section class="mt-4 flex flex-col gap-2 w-full" id="comments">
  <header>
    <div class="text-base">
      <span class="font-bold">
        <FormattedNumber number={data.post.post_view.counts.comments} />
      </span>
      {$t('routes.post.commentCount')}
    </div>
  </header>
  {#await data.comments}
    <div class="flex flex-col gap-4">
      {#each new Array(10) as empty, index}
        <div
          in:fly|global={{
            duration: 500,
            easing: expoOut,
            y: 8,
            delay: index * 50,
          }}
          class="animate-pulse flex flex-col gap-2 w-full
        *:bg-slate-100 *:dark:bg-zinc-800 *:rounded-md"
        >
          <div class="w-96 h-3"></div>
          <div class="w-full h-12"></div>
          <div class="w-48 h-4"></div>
        </div>
      {/each}
    </div>
  {:then comments}
    <CommentProvider
      post={data.post}
      {comments}
      focus={data.thread.focus}
      onupdate={reloadComments}
      bind:sort={commentSort}
    />
    {#if comments.comments.length == 0}
      <Placeholder
        icon={ChatBubbleLeftRight}
        title={$t('routes.post.emptyComments.title')}
        description={$t('routes.post.emptyComments.description')}
      ></Placeholder>
    {/if}
  {/await}
  {#if data.post.post_view.counts.comments > 5}
    <EndPlaceholder>
      <span class="text-black dark:text-white font-bold">
        {data.post.post_view.counts.comments}
      </span>
      {$t('routes.post.commentCount')}

      {#snippet action()}
        <Button
          color="tertiary"
          onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {#snippet prefix()}
            <Icon src={ChevronDoubleUp} mini size="16" />
          {/snippet}
          {$t('routes.post.scrollToTop')}
        </Button>
      {/snippet}
    </EndPlaceholder>
  {/if}
</section>

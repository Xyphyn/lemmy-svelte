<script lang="ts">
  import { page } from '$app/state'
  import { profile } from '$lib/auth.svelte'
  import CommentForm from '$lib/components/lemmy/comment/CommentForm.svelte'
  import CommentListVirtualizer from '$lib/components/lemmy/comment/CommentListVirtualizer.svelte'
  import { buildCommentsTree } from '$lib/components/lemmy/comment/comments.svelte'
  import EndPlaceholder from '$lib/components/ui/EndPlaceholder.svelte'
  import { instance } from '$lib/instance.svelte'
  import { settings } from '$lib/settings.svelte'
  import { t } from '$lib/translations'
  import type {
    CommentSortType,
    GetCommentsResponse,
    GetPostResponse,
    PostView,
  } from 'lemmy-js-client'
  import { Button, Option, Select } from 'mono-svelte'
  import {
    ArrowPath,
    ArrowTrendingDown,
    Clock,
    Fire,
    Icon,
    PlusCircle,
    Star,
    Trophy,
  } from 'svelte-hero-icons'

  interface Props {
    post: GetPostResponse
    comments: GetCommentsResponse
    sort?: CommentSortType
    onupdate?: () => void
    focus?: string
  }

  let {
    post,
    comments: passedComments,
    sort = $bindable(),
    onupdate,
    focus,
  }: Props = $props()
  let comments = $state(passedComments)

  let commenting = $state(false)
  let tree = $state(buildCommentsTree(comments.comments))
  $effect(() => {
    tree = buildCommentsTree(comments.comments)
  })
</script>

{#if profile.data?.jwt}
  {#if !commenting}
    <EndPlaceholder class="">
      <Button color="primary" onclick={() => (commenting = true)}>
        <Icon src={PlusCircle} size="16" micro />
        {$t('routes.post.addComment')}
      </Button>

      {#snippet action()}
        <div class="gap-2 flex items-center">
          <Select size="md" bind:value={sort} onchange={onupdate}>
            <Option icon={Fire} value="Hot">{$t('filter.sort.hot')}</Option>
            <Option icon={Trophy} value="Top">
              {$t('filter.sort.top.label')}
            </Option>
            <Option icon={Star} value="New">{$t('filter.sort.new')}</Option>
            <Option icon={Clock} value="Old">
              {$t('filter.sort.old')}
            </Option>
            <Option icon={ArrowTrendingDown} value="Controversial">
              {$t('filter.sort.controversial')}
            </Option>
          </Select>
          <Button size="square-md" onclick={onupdate}>
            {#snippet prefix()}
              <Icon src={ArrowPath} size="16" mini />
            {/snippet}
          </Button>
        </div>
      {/snippet}
    </EndPlaceholder>
  {:else}
    <CommentForm
      postId={post.post_view.post.id}
      oncomment={(comment) => {
        comments.comments = [comment.comment_view, ...comments.comments]
      }}
      locked={(post.post_view.post.locked &&
        !(
          profile.data?.user?.local_user_view.local_user.admin ||
          profile.data?.user?.moderates
            .map((c) => c.community.id)
            .includes(post.community_view.community.id)
        )) ||
        page.params.instance.toLowerCase() != instance.data.toLowerCase()}
      banned={post.community_view.banned_from_community}
      onfocus={() => (commenting = true)}
      tools={commenting}
      preview={commenting}
      placeholder={commenting ? undefined : $t('routes.post.addComment')}
      rows={commenting ? 7 : 1}
      oncancel={() => (commenting = false)}
    />
  {/if}
{/if}

{#if commenting || !profile.data.jwt}
  <div class="gap-2 flex items-center">
    <Select size="md" bind:value={sort} onchange={onupdate}>
      <Option icon={Fire} value="Hot">{$t('filter.sort.hot')}</Option>
      <Option icon={Trophy} value="Top">
        {$t('filter.sort.top.label')}
      </Option>
      <Option icon={Star} value="New">{$t('filter.sort.new')}</Option>
      <Option icon={Clock} value="Old">
        {$t('filter.sort.old')}
      </Option>
      <Option icon={ArrowTrendingDown} value="Controversial">
        {$t('filter.sort.controversial')}
      </Option>
    </Select>
    <Button size="square-md" onclick={onupdate}>
      {#snippet prefix()}
        <Icon src={ArrowPath} size="16" mini />
      {/snippet}
    </Button>
  </div>
{/if}
<CommentListVirtualizer
  post={post.post_view.post}
  nodes={tree}
  scrollTo={focus}
/>

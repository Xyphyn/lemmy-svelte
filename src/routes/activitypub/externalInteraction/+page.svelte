<script lang="ts">
  import { t } from '$lib/translations'
  import { Spinner } from 'mono-svelte'
  import type { ResolveObjectResponse } from 'lemmy-js-client'
  import CommunityItem from '$lib/components/lemmy/community/CommunityItem.svelte'
  import UserItem from '$lib/components/lemmy/user/UserItem.svelte'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'

  interface Props {
    data: {
      resolved: Promise<ResolveObjectResponse>
    }
  }

  let { data }: Props = $props()
</script>

<div class="flex flex-col items-center justify-center h-full gap-3">
  {#await data.resolved}
    <Spinner width={32} />
    <span class="font-medium text-lg">{$t('routes.search.federating')}...</span>
  {:then object}
    <div class="w-full max-w-md">
      {#if object.community}
        <CommunityItem bind:community={object.community} />
      {:else if object.person}
        <UserItem user={object.person} />
      {:else if object.post}
        <Post post={object.post} />
      {:else if object.comment}
        <CommentItem comment={object.comment} />
      {/if}
    </div>
  {/await}
</div>

<script lang="ts">
  import { browser } from '$app/environment'
  import PostFeed from '$lib/components/lemmy/post/feed/PostFeed.svelte'
  import VirtualFeed from '$lib/components/lemmy/post/feed/VirtualFeed.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { t } from '$lib/translations'

  let { data = $bindable() } = $props();

  const SvelteComponent = $derived(browser ? VirtualFeed : PostFeed);
</script>

<Header>
  {data.upvoted ? $t('routes.profile.upvoted') : $t('routes.profile.downvoted')}
</Header>

<SvelteComponent
  posts={data.feed.posts.posts}
  bind:feedData={data.feed}
  feedId="main"
/>

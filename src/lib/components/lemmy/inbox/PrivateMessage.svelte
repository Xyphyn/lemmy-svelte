<script lang="ts">
  import { profile } from '$lib/auth.js'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import type { PrivateMessageView } from 'lemmy-js-client'

  export let message: PrivateMessageView
  export let meta: boolean = true
</script>

<div class="flex flex-col gap-2 text-sm" style={$$props.style ?? ''}>
  {#if meta}
    <div class="flex flex-row gap-2 items-center flex-wrap">
      <span class="font-medium text-xs">From</span>
      <UserLink
        showInstance={false}
        user={message.creator}
        avatar
        avatarSize={20}
      />
      {#if $profile?.user?.local_user_view.person.id != message.recipient.id}
        to
        <UserLink
          showInstance={false}
          user={message.recipient}
          avatar
          avatarSize={20}
        />
      {/if}
    </div>
  {/if}
  <Markdown source={message.private_message.content} />
</div>

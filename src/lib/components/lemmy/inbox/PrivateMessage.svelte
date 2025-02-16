<script lang="ts">
  import { profile } from '$lib/auth.svelte.js'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import TextProps from '$lib/components/ui/text/TextProps.svelte'
  import type { PrivateMessageView } from 'lemmy-js-client'

  interface Props {
    message: PrivateMessageView
    meta?: boolean
    style?: string
  }

  let { message, meta = true, style = '' }: Props = $props()
</script>

<div class="flex flex-col gap-2 text-sm" {style}>
  {#if meta}
    <div class="flex flex-row gap-2 items-center flex-wrap">
      <span class="font-medium text-xs">From</span>
      <UserLink
        showInstance={false}
        user={message.creator}
        avatar
        avatarSize={20}
      />
      {#if profile.data?.user?.local_user_view.person.id != message.recipient.id}
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
  <TextProps wrap="no-wrap">
    <Markdown source={message.private_message.content} />
  </TextProps>
</div>

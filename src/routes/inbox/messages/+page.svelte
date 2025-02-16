<script lang="ts">
  import { profile } from '$lib/auth.svelte.js'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { publishedToDate } from '$lib/components/util/date.js'
  import { t } from '$lib/translations.js'
  import type {
    Person,
    PrivateMessageResponse,
    PrivateMessageView,
  } from 'lemmy-js-client'
  import { Spinner } from 'mono-svelte'
  import { backOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'

  interface ConversationPreview {
    user: Person
    message: {
      date: Date
      content: string
    }
  }

  function filterDuplicates<T, K>(array: T[], predicate: (item: T) => K): T[] {
    const seen = new Set()
    return array.filter((element) => {
      const value = predicate(element)
      if (seen.has(value)) {
        return false
      } else {
        seen.add(value)
        return true
      }
    })
  }

  function conversationPreviews(
    conversations: PrivateMessageView[]
  ): ConversationPreview[] {
    const deduplicated = filterDuplicates(conversations, (i) => i.creator.id)

    return deduplicated.map((i) => ({
      user: i.creator,
      message: {
        date: publishedToDate(i.private_message.published),
        content: i.private_message.content,
      },
    }))
  }

  let { data } = $props()
</script>

<Header pageHeader>
  {$t('filter.inbox.messages')}
</Header>
{#await data.messages}
  <div class="w-full h-full grid place-items-center">
    <Spinner width={24} />
  </div>
{:then data}
  {@const conversations = data.private_messages}
  {@const previews = conversationPreviews(conversations).filter(
    (c) => c.user.id != profile.data?.user?.local_user_view.person.id
  )}

  <ul
    class="flex flex-col divide-y divide-slate-200 dark:divide-zinc-800 w-full mt-6"
  >
    {#each previews as preview, index}
      <a
        href="/inbox/messages/{preview.user.id}"
        class="flex flex-row gap-2 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 w-full min-w-0
        hover:bg-slate-100 hover:dark:bg-zinc-900 transition-colors"
        in:fly|global={{
          duration: 700,
          easing: backOut,
          y: 12,
          delay: index * 100,
        }}
      >
        <Avatar url={preview.user.avatar} alt={preview.user.name} width={32} />
        <div class="flex flex-col w-full overflow-hidden">
          <div class="font-medium">{preview.user.name}</div>
          <div
            class="text-sm overflow-ellipsis whitespace-nowrap
            bg-gradient-to-r from-slate-700 via-slate-700 to-slate-700/0 dark:from-zinc-300 dark:via-zinc-300 dark:to-zinc-300/0
            text-transparent bg-clip-text"
          >
            {preview.message.content}
          </div>
        </div>
      </a>
    {/each}
  </ul>
{/await}

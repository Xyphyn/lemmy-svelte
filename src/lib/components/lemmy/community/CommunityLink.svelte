<script lang="ts">
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { settings } from '$lib/settings.svelte.js'
  import { t } from '$lib/translations'
  import type { Community } from 'lemmy-js-client'
  import { ExclamationTriangle, Icon } from 'svelte-hero-icons'

  interface Props {
    community: Community
    avatar?: boolean
    name?: boolean
    avatarSize?: number
    showInstance?: boolean
    displayName?: boolean
    badges?: any
    class?: string
    instanceClass?: string
    [key: string]: any
  }

  let {
    community,
    avatar = false,
    name = true,
    avatarSize = 24,
    showInstance = settings.showInstances.community,
    displayName = true,
    badges = {
      nsfw: false,
    },
    class: clazz = '',
    instanceClass = '',
    ...rest
  }: Props = $props()
</script>

<a
  {...rest}
  class="items-center flex flex-row gap-2 hover:underline max-w-full min-w-0 {clazz}"
  href="/c/{community.name}@{new URL(community.actor_id).hostname}"
  data-sveltekit-preload-data="tap"
>
  {#if avatar}
    <Avatar
      url={community.icon ??
        `https://api.dicebear.com/6.x/initials/svg?seed=${community.name}`}
      alt={community.name}
      width={avatarSize}
    />
  {/if}

  {#if name}
    <span class="flex gap-0 items-center max-w-full min-w-0 flex-shrink">
      <span class="font-medium username-text">
        {displayName ? community.title : community.name}
      </span>
      {#if showInstance}
        <span
          class="text-slate-500 dark:text-zinc-500 font-normal
          instance-text flex-shrink {instanceClass || ''}"
        >
          @{new URL(community.actor_id).hostname}
        </span>
      {/if}
    </span>
  {/if}
  {#if badges}
    {#if badges.nsfw}
      <Icon
        src={ExclamationTriangle}
        size="14"
        micro
        title={$t('post.badges.nsfw')}
        class="text-red-600 dark:text-red-400"
      />
    {/if}
  {/if}
</a>

<style>
  .instance-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    flex: 1;
  }

  .username-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

<script lang="ts" module>
  export interface Tag {
    content: string
    color?: string
    icon?: IconSource
  }

  export const textToTag: Map<string, Tag> = new Map<string, Tag>([
    ['OC', { content: 'OC', color: '#03A8F240' }],
    ['NSFL', { content: 'NSFL', color: '#ff000040' }],
    ['CW', { content: 'CW', color: '#ff000040' }],
  ])

  export const parseTags = (
    title?: string,
  ): { tags: Tag[]; title?: string } => {
    if (!title) return { tags: [] }

    let extracted: Tag[] = []

    const newTitle = title
      .toString()
      .replace(/^(\[.[^\]]+\])|(\[.[^\]]+\])$/g, (match, content) => {
        const contents = match.split(',').map((part: string) => part.trim())

        contents
          .map((i) => i.replaceAll(/(\[|\])/g, ''))
          .forEach((content: string) => {
            extracted.push(
              textToTag.get(content) ?? {
                content: content,
              },
            )
          })
        return ''
      })

    return {
      tags: extracted,
      title: newTitle,
    }
  }
</script>

<script lang="ts">
  import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { Badge, Popover } from 'mono-svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import RelativeDate, {
    formatRelativeDate,
  } from '$lib/components/util/RelativeDate.svelte'
  import type { Community, Person, SubscribedType } from 'lemmy-js-client'
  import {
    Bookmark,
    ExclamationTriangle,
    Icon,
    LockClosed,
    Megaphone,
    Tag,
    Trash,
    PaperAirplane,
  } from 'svelte-hero-icons'
  import ShieldIcon from '../moderation/ShieldIcon.svelte'
  import { settings, type View } from '$lib/settings.svelte'
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import { t } from '$lib/translations'
  import { Pencil, type IconSource } from 'svelte-hero-icons'
  import CommunityHeader from '../community/CommunityHeader.svelte'
  import { publishedToDate } from '$lib/components/util/date'
  import { profile } from '$lib/auth.svelte'

  interface Props {
    community?: Community | undefined
    showCommunity?: boolean
    subscribed?: SubscribedType | undefined
    user?: Person | undefined
    published?: Date | undefined
    title?: string | undefined
    id?: number | undefined
    read?: boolean
    edited?: string | undefined
    view?: View
    // Badges
    badges?: any
    tags?: Tag[]
    style?: string
    titleClass?: string
    extraBadges?: import('svelte').Snippet
  }

  let {
    community = $bindable(undefined),
    showCommunity = true,
    subscribed = $bindable(undefined),
    user = undefined,
    published = undefined,
    title = undefined,
    id = undefined,
    read = false,
    edited = undefined,
    view = 'cozy',
    badges = {
      nsfw: false,
      saved: false,
      featured: false,
      deleted: false,
      removed: false,
      locked: false,
      moderator: false,
      admin: false,
    },
    tags = [],
    style = '',
    titleClass = '',
    extraBadges,
  }: Props = $props()
</script>

<!-- 
  @component
  This component will build two different things: a post's meta block and the title.
-->
<header
  class="grid w-full meta {community
    ? 'grid-rows-2'
    : 'grid-rows-1'} text-xs min-w-0 max-w-full"
  class:compact={view == 'compact'}
  {style}
>
  {#if showCommunity && community}
    <Avatar
      url={community?.icon}
      width={view == 'compact' ? 24 : 32}
      alt={community?.name}
      class="row-span-2 flex-shrink-0 mr-2 self-center"
    />
  {/if}
  {#if showCommunity && community}
    <CommunityLink
      {community}
      style="grid-area: community;"
      class="flex-shrink no-list-margin"
      badges={{
        nsfw: community.nsfw,
      }}
    />
  {/if}
  <div
    class="text-slate-600 dark:text-zinc-400 flex flex-row gap-2 items-center
     no-list-margin {view == 'compact' && showCommunity
      ? 'min-[480px]:mx-2'
      : ''}"
    style="grid-area: stats;"
  >
    {#if user}
      <address class="contents not-italic">
        {#if view == 'compact' && showCommunity}
          <Icon
            src={PaperAirplane}
            size="12"
            micro
            class="rotate-180 text-slate-400 dark:text-zinc-600 max-[480px]:hidden"
          />
        {/if}
        <UserLink
          avatarSize={20}
          {user}
          avatar={!showCommunity}
          class="flex-shrink "
        >
          {#snippet extraBadges()}
            {#if badges.moderator}
              <ShieldIcon filled width={14} class="text-green-500" />
            {/if}
            {#if badges.admin}
              <ShieldIcon filled width={14} class="text-red-500" />
            {/if}
          {/snippet}
        </UserLink>
      </address>
    {/if}
    {#if published}
      <RelativeDate date={published} class="flex-shrink-0" />
    {/if}
    {#if edited}
      <div
        title={$t('post.meta.lastEdited', {
          default: formatRelativeDate(publishedToDate(edited), {
            style: 'long',
          }),
        })}
      >
        <Icon src={Pencil} micro size="14" />
      </div>
    {/if}
  </div>
  <div
    class="flex flex-row min-[480px]:justify-end items-center self-center
    flex-wrap gap-2 [&>*]:flex-shrink-0 badges min-[480px]:ml-2"
    style="grid-area: badges;"
  >
    {#if tags}
      {#each tags as tag}
        <a
          class="hover:brightness-110"
          href="/search?community={community?.id}&q=[{tag.content}]&type=Posts"
          style={tag.color ? `--tag-color: ${tag.color};` : ''}
        >
          <Badge class={tag.color ? 'badge-tag-color' : ''}>
            {#snippet icon()}
              {#if tag.icon}
                <Icon src={tag.icon} micro size="14" />
              {:else}
                <Icon src={Tag} micro size="14" />
              {/if}
            {/snippet}
            {tag.content}
          </Badge>
        </a>
      {/each}
    {/if}
    {#if badges.nsfw}
      <Badge label={$t('post.badges.nsfw')} color="red-subtle" allowIconOnly>
        {#snippet icon()}
          <Icon src={ExclamationTriangle} size="14" micro />
        {/snippet}
        {$t('post.badges.nsfw')}
      </Badge>
    {/if}
    {#if badges.saved}
      <Badge
        label={$t('post.badges.saved')}
        color="yellow-subtle"
        allowIconOnly
      >
        {#snippet icon()}
          <Icon src={Bookmark} micro size="14" />
        {/snippet}
        {$t('post.badges.saved')}
      </Badge>
    {/if}
    {#if badges.locked}
      <Badge
        label={$t('post.badges.locked')}
        color="yellow-subtle"
        allowIconOnly
      >
        {#snippet icon()}
          <Icon src={LockClosed} micro size="14" />
        {/snippet}
        <span class="max-md:hidden">{$t('post.badges.locked')}</span>
      </Badge>
    {/if}
    {#if badges.removed}
      <Badge label={$t('post.badges.removed')} color="red-subtle" allowIconOnly>
        {#snippet icon()}
          <Icon src={Trash} micro size="14" />
        {/snippet}
        <span class="max-md:hidden">{$t('post.badges.removed')}</span>
      </Badge>
    {/if}
    {#if badges.deleted}
      <Badge label={$t('post.badges.deleted')} color="red-subtle" allowIconOnly>
        {#snippet icon()}
          <Icon src={Trash} micro size="14" />
        {/snippet}
        <span class="max-md:hidden">{$t('post.badges.deleted')}</span>
      </Badge>
    {/if}
    {#if badges.featured}
      <Badge
        label={$t('post.badges.featured')}
        color="green-subtle"
        allowIconOnly
      >
        {#snippet icon()}
          <Icon src={Megaphone} micro size="14" />
        {/snippet}
        <span class="max-md:hidden">{$t('post.badges.featured')}</span>
      </Badge>
    {/if}
    {@render extraBadges?.()}
  </div>
</header>
{#if title && id}
  <a
    href="/post/{encodeURIComponent(profile.data.instance)}/{id}"
    class="inline hover:underline
    hover:text-primary-900 hover:dark:text-primary-100 transition-colors max-[480px]:!mt-0
    {settings.font == 'satoshi/nunito'
      ? 'font-display font-semibold'
      : 'font-medium'} {titleClass}"
    class:text-slate-600={settings.markReadPosts && read}
    class:dark:text-zinc-400={settings.markReadPosts && read}
    class:text-base={view == 'compact'}
    class:text-lg={view != 'compact'}
    style="grid-area: title;"
    data-sveltekit-preload-data="tap"
  >
    <Markdown
      source={title}
      inline
      noStyle
      class={view == 'compact' ? '' : 'leading-[1.3]'}
    ></Markdown>
  </a>
{:else}
  <div style="grid-area: title; margin: 0;"></div>
{/if}

<style>
  .meta {
    display: grid;
    grid-template-areas:
      'avatar community badges'
      'avatar stats badges';
    gap: 0;
    grid-template-rows: auto auto;
    grid-template-columns: max-content minmax(0, auto) auto;
  }

  @media screen and (max-width: 480px) {
    .meta {
      grid-template-areas:
        'avatar community'
        'avatar stats'
        'badges badges';
      gap: 0;
      grid-template-rows: auto auto auto;
      grid-template-columns: 40px minmax(0, auto);
    }
  }

  @media screen and (max-width: 480px) {
    .meta.compact {
      grid-template-columns: 32px minmax(0, auto);
    }
  }

  @media screen and (min-width: 480px) {
    .meta.compact {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }

  :global(.badge-tag-color) {
    background-color: var(--tag-color) !important;
  }
</style>

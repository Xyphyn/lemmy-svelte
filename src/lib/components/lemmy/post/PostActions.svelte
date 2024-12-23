<script lang="ts">
  import type { PostView } from 'lemmy-js-client'
  import PostVote from './PostVote.svelte'
  import { getInstance, site } from '$lib/lemmy.js'
  import {
    ArrowsUpDown,
    ArrowTopRightOnSquare,
    Bookmark,
    BookmarkSlash,
    BugAnt,
    ChatBubbleLeftEllipsis,
    ChatBubbleOvalLeft,
    ChatBubbleOvalLeftEllipsis,
    CheckBadge,
    Clock,
    EllipsisHorizontal,
    Eye,
    EyeSlash,
    Flag,
    GlobeAmericas,
    Icon,
    Language,
    MapPin,
    Newspaper,
    Pencil,
    PencilSquare,
    ServerStack,
    Share,
    Star,
    Trash,
    UserCircle,
    XMark,
  } from 'svelte-hero-icons'
  import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
  import { createEventDispatcher } from 'svelte'
  import {
    amMod,
    isAdmin,
    report,
  } from '$lib/components/lemmy/moderation/moderation.js'
  import ModerationMenu from '$lib/components/lemmy/moderation/ModerationMenu.svelte'
  import { profile } from '$lib/auth.svelte.js'
  import { deleteItem, markAsRead, save } from '$lib/lemmy/contentview.js'
  import { setSessionStorage } from '$lib/session.js'
  import { goto } from '$app/navigation'
  import { settings, type View } from '$lib/settings.svelte.js'
  import {
    Button,
    Menu,
    MenuButton,
    MenuDivider,
    Modal,
    Spinner,
    toast,
  } from 'mono-svelte'
  import { fediseer, type Data } from '$lib/fediseer/fediseer'
  import { t } from '$lib/translations'
  import { text } from '$lib/components/translate/translation'
  import { hidePost, postLink } from './helpers'
  import { feature } from '$lib/version'
  import Switch from '$lib/components/input/Switch.svelte'
  import { instanceId, instanceToURL } from '$lib/util.svelte'
  import { publishedToDate } from '$lib/components/util/date'
  import TextProps from '$lib/components/ui/text/TextProps.svelte'
  import { communityLink, userLink } from '$lib/lemmy/generic'
  import RelativeDate, {
    formatRelativeDate,
  } from '$lib/components/util/RelativeDate.svelte'

  const dispatcher = createEventDispatcher<{ edit: PostView; hide: boolean }>()

  let editing = $state(false)
  let saving = $state(false)

  let translating = $state(false)

  let localShare = $state(false)

  interface Props {
    post: PostView
    view?: View
    debug?: boolean
    style?: string
  }

  let {
    post = $bindable(),
    view = 'cozy',
    debug = $bindable(false),
    style = '',
  }: Props = $props()
  let buttonHeight = $derived(view == 'compact' ? 'h-7' : 'h-8')
  let buttonSquare = $derived(view == 'compact' ? 'w-7 h-7' : 'w-8 h-8')
</script>

{#if editing}
  <Modal bind:open={editing}>
    {#snippet customTitle()}
      <h1 class="text-2xl font-bold">Editing post</h1>
    {/snippet}
    {#await import('./form/PostForm.svelte')}
      <div class="mx-auto h-96 flex justify-center items-center">
        <Spinner width={32} />
      </div>
    {:then { default: PostForm }}
      <PostForm
        edit
        editingPost={post.post}
        on:submit={(e) => {
          editing = false
          post = e.detail
          dispatcher('edit', e.detail)
        }}
      >
        {#snippet formtitle()}
          <!-- Have the title not exist at all -->
          {''}
        {/snippet}
      </PostForm>
    {/await}
  </Modal>
{/if}

{#if translating}
  {#await import('$lib/components/translate/Translation.svelte') then { default: Translation }}
    <Translation bind:open={translating} />
  {/await}
{/if}

<footer
  class="flex flex-row gap-2 items-center flex-shrink-0 {buttonHeight}"
  class:flex-row-reverse={settings.posts.reverseActions}
  {style}
>
  <PostVote
    post={post.post}
    vote={post.my_vote}
    score={post.counts.score}
    upvotes={post.counts.upvotes}
    downvotes={post.counts.downvotes}
    showCounts={$profile?.user?.local_user_view?.local_user?.show_scores ??
      true}
  />

  <Button
    size="custom"
    href="{postLink(post.post)}#comments"
    class="!text-inherit h-full px-3 relative"
    color="ghost"
    rounding="pill"
    target={settings.openLinksInNewTab ? '_blank' : ''}
    title={$t('post.actions.comments')}
    animations={{ scale: true, large: false }}
  >
    {@const newComment =
      publishedToDate(post.counts.newest_comment_time).getTime() >
      new Date().getTime() - 5 * 60 * 1000}
    <Icon
      src={newComment ? ChatBubbleOvalLeftEllipsis : ChatBubbleOvalLeft}
      size="18"
    />
    <FormattedNumber number={post.counts.comments} />
  </Button>
  <div class="flex-1"></div>

  {#if settings.debugInfo}
    {#if debug}
      {#await import('$lib/components/util/debug/DebugObject.svelte') then { default: DebugObject }}
        <DebugObject object={post} bind:open={debug} />
      {/await}
    {/if}
    <Button
      onclick={() => (debug = true)}
      title="Debug"
      size="custom"
      color="ghost"
      rounding="pill"
      class={buttonSquare}
      animations={{ scale: true, large: true }}
    >
      {#snippet prefix()}
        <Icon src={BugAnt} micro size="16" />
      {/snippet}
    </Button>
  {/if}
  {#if $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user))}
    <ModerationMenu
      size="custom"
      color="ghost"
      rounding="pill"
      class={buttonSquare}
      bind:item={post}
      community={post.community}
    />
  {/if}

  {#if $profile?.jwt}
    <Button
      onclick={async () => {
        if (!$profile?.jwt) return
        saving = true
        post.saved = await save(post, !post.saved, $profile?.jwt)
        saving = false
      }}
      size="custom"
      class={buttonSquare}
      color="ghost"
      rounding="pill"
      loading={saving}
      disabled={saving}
      title={post.saved ? $t('post.actions.unsave') : $t('post.actions.save')}
      animations={{ scale: true, large: true }}
    >
      {#snippet prefix()}
        <Icon src={post.saved ? BookmarkSlash : Bookmark} size="16" mini />
      {/snippet}
    </Button>
  {/if}

  <Menu
    placement="bottom-end"
    containerClass="overflow-auto max-h-[400px]"
    class="h-8"
    targetClass="h-full"
    title={$t('post.actions.more.label')}
  >
    {#snippet target()}
      <Button
        title={$t('post.actions.more.label')}
        color="ghost"
        rounding="pill"
        size="custom"
        class={buttonSquare}
        animations={{ scale: true, large: true }}
      >
        {#snippet prefix()}
          <Icon src={EllipsisHorizontal} width={16} micro />
        {/snippet}
      </Button>
    {/snippet}
    <MenuDivider>{$t('cards.site.stats')}</MenuDivider>
    <div class="flex flex-row gap-1 items-center">
      <MenuButton class="flex-1">
        {#snippet prefix()}
          <Icon src={Clock} size="16" micro />
        {/snippet}
        <span>
          {publishedToDate(post.post.published).toLocaleDateString(undefined, {
            dateStyle: 'short',
          })}
        </span>
      </MenuButton>
      {#if post.post.updated}
        {@const editedTime = formatRelativeDate(
          publishedToDate(post.post.updated),
          {
            style: 'long',
          },
        )}
        <MenuButton class="flex-1" aria-label={editedTime}>
          {#snippet prefix()}
            <Icon src={Pencil} size="16" micro />
          {/snippet}
          <RelativeDate date={publishedToDate(post.post.updated)} />
        </MenuButton>
      {/if}
    </div>
    {#if post.counts.score}
      {@const ratio =
        post.counts.upvotes / (post.counts.upvotes + post.counts.downvotes)}
      <MenuButton
        aria-label={$t('aria.vote.score', { default: post.counts.score })}
      >
        {#snippet prefix()}
          <Icon src={ArrowsUpDown} size="16" micro />
        {/snippet}
        {$t('post.actions.vote.score')}
        •
        <FormattedNumber
          number={post.counts.score}
          options={{ notation: 'standard' }}
          class="font-medium"
        />
        •
        <FormattedNumber
          number={ratio}
          options={{ style: 'percent' }}
          class="font-medium {ratio > 0.7
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-red-500'}"
        />
      </MenuButton>
    {/if}
    <MenuDivider>{$t('post.actions.more.creator')}</MenuDivider>
    <MenuButton link href={userLink(post.creator)}>
      {#snippet prefix()}
        <Icon src={UserCircle} size="16" micro class="flex-shrink-0" />
      {/snippet}
      <TextProps wrap="no-wrap">
        {post.creator.name}
      </TextProps>
    </MenuButton>
    <MenuButton link href={communityLink(post.community)}>
      {#snippet prefix()}
        <Icon src={Newspaper} size="16" micro class="flex-shrink-0" />
      {/snippet}
      <TextProps wrap="no-wrap">
        {post.community.title}
      </TextProps>
    </MenuButton>
    <MenuDivider>
      {$t('post.actions.more.actions')}
    </MenuDivider>
    {#if $profile?.user && $profile?.jwt && $profile.user.local_user_view.person.id == post.creator.id}
      <MenuButton onclick={() => (editing = true)}>
        {#snippet prefix()}
          <Icon src={PencilSquare} size="16" micro />
        {/snippet}
        {$t('post.actions.more.edit')}
      </MenuButton>
    {/if}
    {#if $profile?.jwt}
      <MenuButton
        onclick={async () => {
          if ($profile?.jwt)
            post.read = await markAsRead(post.post, !post.read, $profile.jwt)
        }}
      >
        {#snippet prefix()}
          <Icon src={post.read ? EyeSlash : Eye} size="16" micro />
        {/snippet}
        {post.read
          ? $t('post.actions.more.markUnread')
          : $t('post.actions.more.markRead')}
      </MenuButton>
    {/if}
    <MenuButton
      onclick={() => {
        navigator.share?.({
          url: localShare
            ? `${instanceToURL(getInstance())}/post/${post.post.id}`
            : post.post.ap_id,
        }) ??
          navigator.clipboard.writeText(
            localShare
              ? `${instanceToURL(getInstance())}/post/${post.post.id}`
              : post.post.ap_id,
          )
        toast({ content: $t('toast.copied') })
      }}
      class="flex-1 !py-0"
    >
      {#snippet prefix()}
        <Icon src={Share} size="16" micro />
      {/snippet}
      {$t('post.actions.more.share')}
      <div class="flex-1"></div>
      {#if !post.post.local}
        <div class="flex">
          <Button
            color={!localShare ? 'primary' : 'secondary'}
            size="square-md"
            roundingSide="left"
            onclick={() => (localShare = false)}
            title={$t('filter.location.global')}
          >
            <Icon src={GlobeAmericas} size="16" micro />
          </Button>
          <Button
            color={localShare ? 'primary' : 'secondary'}
            size="square-md"
            roundingSide="right"
            onclick={() => (localShare = true)}
            title={$t('filter.location.local')}
          >
            <Icon src={MapPin} size="16" micro />
          </Button>
        </div>
      {/if}
    </MenuButton>
    {#if post.post.body && settings.translator}
      <MenuButton
        onclick={() => {
          // @ts-ignore
          text.set(post.post.body)
          translating = !translating
        }}
      >
        {#snippet prefix()}
          <Icon src={Language} size="16" micro />
        {/snippet}
        {$t('post.actions.more.translate')}
      </MenuButton>
    {/if}
    {#if $profile?.jwt}
      <MenuButton
        onclick={() => {
          setSessionStorage('postDraft', {
            body: `${
              settings.crosspostOriginalLink
                ? `cross-posted from: ${post.post.ap_id}`
                : ``
            }\n${
              post.post.body
                ? '>' + post.post.body.split('\n').join('\n> ')
                : ''
            }`,
            url: post.post.url,
            title: post.post.name,
            loading: false,
            nsfw: post.post.nsfw,
            community: null,
            image: null,
          })

          goto('/create/post?crosspost=true')
        }}
      >
        {#snippet prefix()}
          <Icon src={ArrowTopRightOnSquare} size="16" micro />
        {/snippet}
        {$t('post.actions.more.crosspost')}
      </MenuButton>
      {#if $profile.user && post.creator.id == $profile.user.local_user_view.person.id}
        <MenuButton
          onclick={async () => {
            if ($profile?.jwt)
              post.post.deleted = await deleteItem(
                post,
                !post.post.deleted,
                $profile.jwt,
              )
          }}
          color="danger-subtle"
        >
          {#snippet prefix()}
            <Icon src={Trash} size="16" micro />
          {/snippet}
          {post.post.deleted
            ? $t('post.actions.more.restore')
            : $t('post.actions.more.delete')}
        </MenuButton>
      {/if}
      {#if $profile.user?.local_user_view.person.id != post.creator.id}
        {#if feature('hidePosts', $site?.version)}
          <MenuButton
            onclick={async () => {
              if (!$profile?.jwt) return
              const hidden = await hidePost(
                post.post.id,
                !post.hidden,
                $profile?.jwt,
              )
              post.hidden = hidden
              if (hidden) {
                dispatcher('hide', hidden)
              }
            }}
            color="danger-subtle"
          >
            {#snippet prefix()}
              <Icon src={XMark} size="16" micro />
            {/snippet}
            {post.hidden
              ? $t('post.actions.more.unhide')
              : $t('post.actions.more.hide')}
          </MenuButton>
        {/if}
        <MenuButton onclick={() => report(post)} color="danger-subtle">
          {#snippet prefix()}
            <Icon src={Flag} width={16} micro />
          {/snippet}
          {$t('moderation.report')}
        </MenuButton>
      {/if}
    {/if}
  </Menu>
</footer>

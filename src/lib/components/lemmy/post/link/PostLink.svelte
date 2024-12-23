<script lang="ts">
  import Link, { parseURL } from '$lib/components/input/Link.svelte'
  import { Button, Material } from 'mono-svelte'
  import {
    CheckBadge,
    ChevronDown,
    Icon,
    Link as LinkIcon,
  } from 'svelte-hero-icons'
  import { optimizeImageURL } from '../helpers'
  import PostLinkSources from './PostLinkSources.svelte'
  import { t } from '$lib/translations'
  import type { View } from '$lib/settings.svelte'

  interface Props {
    url: string
    thumbnail_url?: string | undefined
    nsfw?: boolean
    embed_title?: string | undefined
    embed_description?: string | undefined
    view?: View
  }

  let {
    url,
    thumbnail_url = undefined,
    nsfw = false,
    embed_title = undefined,
    embed_description = undefined,
    view = 'cozy',
  }: Props = $props()

  let richURL = $derived(parseURL(url))
</script>

<!-- 
  @component
  For embed-type posts. Displays embed card or a compact link.
-->
{#if embed_title && view != 'compact'}
  <Material
    color="distinct"
    class="flex flex-col-reverse sm:flex-row
    overflow-hidden gap-4 embed-card z-0 relative
    dark:border-t-zinc-800 border-opacity-80 max-w-full"
    rounding="xl"
    element="article"
  >
    {#if thumbnail_url}
      <img
        src={optimizeImageURL(thumbnail_url, 64)}
        alt=""
        class="-z-10 absolute w-full object-cover h-full opacity-10 brightness-150
        dark:brightness-90 dark:opacity-20 blur-2xl
        -inset-px"
      />
    {/if}
    <div class="flex flex-col gap-2 mb-2">
      {#if richURL}
        <Link
          href={url}
          target="_blank"
          class="text-slate-600 dark:text-zinc-400 inline-flex items-center gap-1 text-xs"
        >
          {richURL.hostname}
        </Link>
      {/if}
      <a
        href={url}
        target="_blank"
        class="font-medium text-base hover:underline"
      >
        {embed_title}
      </a>
      {#if embed_description}
        <p class="text-sm">
          {embed_description.slice(0, 300)}{embed_description.length > 300
            ? '...'
            : ''}
        </p>
      {/if}
    </div>
    {#if thumbnail_url}
      <a
        href={url}
        target="_blank"
        class="-m-4 mb-auto sm:-mb-4 sm:ml-auto flex-shrink-0 sm:w-1/3 sm:min-h-40 sm:max-w-60"
      >
        <picture>
          <source
            srcset={optimizeImageURL(thumbnail_url, 256)}
            media="(max-width: 256px)"
          />
          <source
            srcset={optimizeImageURL(thumbnail_url, 512)}
            media="(max-width: 512px)"
          />
          <source
            srcset={optimizeImageURL(thumbnail_url, 1024)}
            media="(max-width: 1024px)"
          />
          <img
            src={optimizeImageURL(thumbnail_url, -1)}
            class="object-cover w-full sm:max-w-96 h-48 sm:min-h-40 sm:h-full bg-slate-200 dark:bg-zinc-800"
            width={600}
            height={400}
            alt={embed_title}
            class:blur-3xl={nsfw}
          />
        </picture>
      </a>
    {/if}
  </Material>
  <div
    class="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800
    rounded-full flex p-1 relative -top-7 min-[384px]:mx-3 mt-8 min-[384px]:mt-0 mx-auto -mb-7 w-max max-w-full overflow-auto"
  >
    <PostLinkSources {url}>
      {#snippet target()}
        <Button
          color="tertiary"
          size="sm"
          class="w-max text-slate-600 dark:text-zinc-400 block
        text-xs flex-shrink-0"
          rounding="pill"
        >
          <Icon src={LinkIcon} size="16" micro class="flex-shrink-0" />
          {$t('post.actions.link.actions')}
        </Button>
      {/snippet}
    </PostLinkSources>
  </div>
{:else}
  <div class="flex space-x-1">
    <PostLinkSources {url}>
      {#snippet target()}
        <Button
          color="ghost"
          size="xs"
          rounding="pill"
          class="p-0.5 px-1 w-max mt-auto text-slate-600 dark:text-zinc-400 block
          text-xs"
        >
          <div class="mr-0.5" style="width: 8px;">
            <Icon src={LinkIcon} size="16" micro />
          </div>
          <div class="mr-1" style="width: 8px;">
            <Icon src={ChevronDown} size="16" micro />
          </div>
        </Button>
      {/snippet}
    </PostLinkSources>
    <Button
      href={url}
      target="_blank"
      class="text-slate-900 dark:text-zinc-300 items-center
    text-xs overflow-hidden max-w-full block flex-shrink"
      size="xs"
      color="ghost"
      rounding="pill"
    >
      {#if richURL}
        <div class="flex max-w-full overflow-hidden font-medium">
          {richURL.hostname}
          {#if richURL.pathname != '/'}
            <span
              class="text-slate-500 dark:text-zinc-500 whitespace-nowrap font-normal"
            >
              {richURL.pathname}
            </span>
          {/if}
        </div>
      {:else}
        {url}
      {/if}
    </Button>
  </div>
{/if}

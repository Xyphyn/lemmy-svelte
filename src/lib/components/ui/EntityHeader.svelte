<script lang="ts">
  import { Material } from 'mono-svelte'
  import Avatar from './Avatar.svelte'
  import PostBody from '../lemmy/post/PostBody.svelte'
  import LabelStat from './LabelStat.svelte'
  import { optimizeImageURL } from '../lemmy/post/helpers'
  import FormattedNumber from '../util/FormattedNumber.svelte'
  import Expandable from './Expandable.svelte'
  import { Icon, InformationCircle } from 'svelte-hero-icons'
  import { t } from '$lib/translations'
  import Markdown from '../markdown/Markdown.svelte'
  import EndPlaceholder from './EndPlaceholder.svelte'

  interface Props {
    avatar?: string | undefined
    name: string
    bio?: string | undefined
    banner?: string | undefined
    url?: string | undefined
    stats?: {
      name: string
      value: string
      format?: boolean
    }[]
    center?: boolean
    class?: string
    nameDetail?: import('svelte').Snippet
    actions?: import('svelte').Snippet
    children?: import('svelte').Snippet
    [key: string]: any
  }

  let {
    avatar = undefined,
    name,
    bio = undefined,
    banner = undefined,
    url = undefined,
    stats = [],
    center = false,
    class: clazz = '',
    nameDetail,
    actions,
    children,
    ...rest
  }: Props = $props()
</script>

<div {...rest} class="z-10 relative text-sm contents {clazz}">
  {#if banner}
    <img
      src={banner}
      class="w-full object-cover h-48 rounded-t-xl bg-white dark:bg-zinc-900 rounded-xl"
      class:blur-3xl={!banner}
      height="192"
      alt="User banner"
    />
  {/if}
  <div class="py-4 flex flex-col gap-4">
    <div class="flex-1 flex flex-row items-center text-left gap-4">
      <Avatar
        width={64}
        url={avatar}
        alt={name}
        class=" ring-slate-25 dark:ring-zinc-925 bg-slate-25 dark:bg-zinc-925"
      />
      <div class="flex flex-col">
        <svelte:element
          this={url ? 'a' : 'span'}
          href={url}
          class="text-xl font-semibold {url
            ? 'hover:underline hover:text-primary-900 hover:dark:text-primary-100'
            : ''}"
        >
          {name}
        </svelte:element>
        <span
          class="flex items-center gap-0 text-sm text-slate-600 dark:text-zinc-400 max-w-full w-max"
        >
          {@render nameDetail?.()}
        </span>

        {#if actions}
          <div class="flex flex-col mt-2">
            {@render actions?.()}
          </div>
        {/if}
      </div>
    </div>
    {#if bio}
      <div class="relative w-full {center ? 'text-center' : 'text-left'}">
        <Expandable class="py-2">
          {#snippet title(open)}
            {#if bio.split('\n')?.[0]?.startsWith('#') || open}
              {$t('nav.menu.about')}
            {:else}
              <div
                class={[
                  'overflow-hidden whitespace-nowrap',
                  'bg-gradient-to-r from-slate-700 via-slate-700 to-slate-700/0',
                  'dark:from-zinc-400 dark:via-zinc-400 dark:to-zinc-400/0',
                  'text-transparent bg-clip-text',
                  'max-w-[50%] overflow-hidden',
                ]}
              >
                {bio.split('\n')?.[0].slice(0, 75)}
              </div>
            {/if}
            <hr class="flex-1 border-slate-200 dark:border-zinc-800 mx-2" />
            <div class="mr-2 text-primary-900 dark:text-primary-100">
              {$t('form.post.readMore')}
            </div>
          {/snippet}
          <Markdown source={bio} class="font-normal" />
        </Expandable>
      </div>
    {/if}
  </div>
  <div class="space-y-3 py-4 pt-0">
    {#if stats.length > 0}
      <div
        class="text-sm flex flex-row flex-wrap mx-auto rounded-lg
        overflow-hidden gap-4"
      >
        {#each stats as stat}
          <div class="">
            <div
              class="text-primary-900 dark:text-primary-100 text-xs font-medium"
            >
              {stat.name}
            </div>
            <div class="text-lg font-semibold">
              {#if stat.format ?? true}
                <FormattedNumber
                  number={Number(stat.value)}
                  options={{ notation: 'standard' }}
                />
              {:else}
                {stat.value}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
    {@render children?.()}
  </div>
</div>

<style>
  .banner-mask {
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  }
</style>

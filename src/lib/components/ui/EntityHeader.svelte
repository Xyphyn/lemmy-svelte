<script lang="ts">
  import { Material } from 'mono-svelte'
  import Avatar from './Avatar.svelte'
  import PostBody from '../lemmy/post/PostBody.svelte'
  import LabelStat from './LabelStat.svelte'
  import { optimizeImageURL } from '../lemmy/post/helpers'
  import FormattedNumber from '../util/FormattedNumber.svelte'

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

<Material
  color="transparent"
  padding="none"
  rounding="xl"
  {...rest}
  class="z-10 relative border-slate-200 dark:border-zinc-700 {clazz}"
>
  {#if banner || avatar}
    <div class="max-h-36 overflow-visible">
      <img
        src={banner ?? avatar}
        class="w-full object-cover h-48 rounded-t-xl bg-white dark:bg-zinc-900 banner-mask"
        class:blur-3xl={!banner}
        height="192"
        alt="User banner"
      />
    </div>
    <div
      class="absolute top-0 left-0 -z-10 object-cover h-full w-full rounded-xl
      overflow-hidden"
    >
      <img
        src={optimizeImageURL(banner ?? avatar ?? '', 64)}
        alt=""
        class="opacity-10 blur-2xl h-full w-full saturate-200"
      />
    </div>
  {/if}
  <div class="p-4 flex flex-col gap-4">
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
          class="text-2xl font-semibold {url
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
        <div
          class="p-4 relative bg-white/30 dark:bg-zinc-900/30 border border-slate-300
          dark:border-zinc-800 border-opacity-50 rounded-xl
          max-w-full w-full"
        >
          <PostBody class="text-sm" view="list" body={bio} clickThrough />
        </div>
      </div>
    {/if}
  </div>
  <div class="space-y-3 p-4 pt-0">
    {#if stats.length > 0}
      <div class="text-sm flex flex-row flex-wrap gap-3 mx-auto">
        {#each stats as stat}
          <div
            class="min-w-36 p-3 px-4 rounded-xl flex-1 bg-white/30 dark:bg-zinc-900/30 border border-slate-300 dark:border-zinc-800 border-opacity-50"
          >
            <div class="text-primary-900 dark:text-primary-100">
              {stat.name}
            </div>
            <div class="text-xl font-semibold">
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
</Material>

<style>
  .banner-mask {
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  }
</style>

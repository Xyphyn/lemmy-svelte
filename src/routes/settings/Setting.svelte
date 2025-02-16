<script lang="ts">
  import { t } from '$lib/translations'
  import { Badge } from 'mono-svelte'
  import {
    ComputerDesktop,
    DevicePhoneMobile,
    DeviceTablet,
    Icon,
  } from 'svelte-hero-icons'

  interface Props {
    supportedPlatforms?: any
    mainClass?: string
    itemsClass?: string
    optionClass?: string
    class?: string
    title?: import('svelte').Snippet
    description?: import('svelte').Snippet
    children?: import('svelte').Snippet
  }

  let {
    supportedPlatforms = {
      desktop: true,
      tablet: true,
      mobile: true,
    },
    mainClass = '',
    itemsClass = '',
    optionClass = '',
    class: clazz = '',
    title,
    description,
    children,
  }: Props = $props()
</script>

<div
  class="flex flex-col w-full justify-between gap-2 max-w-full @container/setting {mainClass}"
>
  {#if Object.values(supportedPlatforms).some((v) => v == false)}
    <div class="flex items-center gap-2 flex-wrap">
      {#if supportedPlatforms.desktop}
        <Badge>
          {#snippet icon()}
            <Icon src={ComputerDesktop} micro size="14" />
          {/snippet}
          {$t('settings.desktop')}
        </Badge>
      {/if}
      {#if supportedPlatforms.tablet}
        <Badge>
          {#snippet icon()}
            <Icon src={DeviceTablet} micro size="14" />
          {/snippet}
          {$t('settings.tablet')}
        </Badge>
      {/if}
      {#if supportedPlatforms.mobile}
        <Badge>
          {#snippet icon()}
            <Icon src={DevicePhoneMobile} micro size="14" />
          {/snippet}
          {$t('settings.mobile')}
        </Badge>
      {/if}
    </div>
  {/if}
  <div
    class="flex flex-col @md/setting:flex-row items-center gap-2 {itemsClass}"
  >
    <div
      class="flex flex-col gap-0.5 flex-[2] w-full flex-shrink-0 min-w-48 {clazz}"
    >
      <h1 class="font-medium text-base">{@render title?.()}</h1>
      {#if description}
        <div class="text-slate-600 dark:text-zinc-400 text-sm">
          {@render description?.()}
        </div>
      {/if}
    </div>
    {#if children}
      <div
        class="w-full flex flex-col gap-2 flex-1 max-w-full
         @md/setting:items-end flex-shrink-0 {optionClass}"
      >
        {@render children?.()}
      </div>
    {/if}
  </div>
</div>

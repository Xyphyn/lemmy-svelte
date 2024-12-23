<script lang="ts">
  import { t } from '$lib/translations'
  import { Badge, Switch } from 'mono-svelte'
  import { createEventDispatcher } from 'svelte'
  import {
    ComputerDesktop,
    DevicePhoneMobile,
    DeviceTablet,
    Icon,
  } from 'svelte-hero-icons'


  interface Props {
    title: string;
    description?: string | undefined;
    checked?: boolean;
    beta?: boolean;
    supportedPlatforms?: any;
  }

  let {
    title,
    description = undefined,
    checked = $bindable(false),
    beta = false,
    supportedPlatforms = {
    desktop: true,
    tablet: true,
    mobile: true,
  }
  }: Props = $props();
</script>

<div class="flex flex-col w-full justify-between gap-2 max-w-full">
  {#if Object.values(supportedPlatforms).some((v) => v == false) || beta}
    <div class="flex items-center gap-2 flex-wrap">
      {#if beta}
        <Badge>Beta</Badge>
      {/if}
      {#if Object.values(supportedPlatforms).some((v) => v == false)}
        {#if supportedPlatforms.desktop}
          <Badge>
            {#snippet icon()}
                        <Icon src={ComputerDesktop} micro size="14"  />
                      {/snippet}
            {$t('settings.desktop')}
          </Badge>
        {/if}
        {#if supportedPlatforms.tablet}
          <Badge>
            {#snippet icon()}
                        <Icon src={DeviceTablet} micro size="14"  />
                      {/snippet}
            {$t('settings.tablet')}
          </Badge>
        {/if}
        {#if supportedPlatforms.mobile}
          <Badge>
            {#snippet icon()}
                        <Icon src={DevicePhoneMobile} micro size="14"  />
                      {/snippet}
            {$t('settings.mobile')}
          </Badge>
        {/if}
      {/if}
    </div>
  {/if}
  <Switch
    bind:checked
    class="flex-row-reverse items-center w-full"
    labelClass="flex-1 mr-auto"
  >
    <h1 class="font-medium text-base">{title}</h1>
    {#if description}
      <p class="text-slate-800 dark:text-zinc-200 text-sm">
        {description}
      </p>
    {/if}
  </Switch>
</div>

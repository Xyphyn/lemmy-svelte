<script lang="ts">
  import { Button, Material } from 'mono-svelte'
  import {
    ArrowUturnDown,
    Icon,
    QuestionMarkCircle,
    type IconSource,
  } from 'svelte-hero-icons'
  import Avatar from '../../Avatar.svelte'
  import type { Action } from './actions.svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  interface Props {
    action: Action
    class?: string
    children?: import('svelte').Snippet
    onclick?: HTMLButtonAttributes['onclick']
    [key: string]: any
  }

  let { action, class: clazz = '', children, ...rest }: Props = $props()
</script>

<Button
  href={action.href}
  onclick
  alignment="left"
  color="tertiary"
  size="lg"
  class="focus:bg-slate-200 focus:dark:bg-zinc-800 block w-full {clazz}"
  data-sveltekit-preload-code="viewport"
  data-sveltekit-preload-data="tap"
  {...rest}
>
  {#if typeof action.icon === 'string'}
    <Avatar url={action.icon} width={20} />
  {:else}
    <Icon src={action.icon ?? QuestionMarkCircle} size="20" />
  {/if}
  {@render children?.()}
  <span class="mr-auto inline-flex flex-col">
    <span>{action.name}</span>
    {#if action.detail}
      <span class="font-normal text-xs">{action.detail}</span>
    {/if}
  </span>
  {#if action.shortcut}
    <div class="flex items-center gap-0.5 text-xs font-medium">
      ⌘ {action.shortcut}
    </div>
  {/if}
  {#if action.subActions}
    <Icon src={ArrowUturnDown} size="16" micro />
  {/if}
</Button>

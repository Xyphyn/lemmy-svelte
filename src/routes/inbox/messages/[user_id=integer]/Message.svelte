<script lang="ts">
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import { t } from '$lib/translations'
  import type { PrivateMessageView } from 'lemmy-js-client'
  import { Button, Menu, MenuButton, MenuDivider, Popover } from 'mono-svelte'
  import { EllipsisVertical, Flag, Icon, Trash } from 'svelte-hero-icons'

  interface Props {
    message: PrivateMessageView
    primary?: boolean
    ondelete?: (shouldDelete: boolean) => void
    onreport?: (report: boolean) => void
  }

  let { message, primary = false, ondelete, onreport }: Props = $props()
</script>

<div
  class="group relative w-full flex gap-1 items-center {primary
    ? 'flex-row-reverse'
    : 'flex-row'}"
  style="max-width: min(80vw,24rem)"
>
  <div
    class="{primary
      ? 'bg-primary-900 dark:bg-primary-100 text-slate-50 dark:text-zinc-900 hover:brightness-75'
      : 'bg-slate-100 dark:bg-zinc-900 hover:brightness-125'} rounded-2xl w-full p-1.5 px-3
    font-medium cursor-pointer transition-all"
  >
    <Markdown source={message.private_message.content} class="w-full" />
  </div>
  <Menu>
    {#snippet target()}
      <Button
        color="tertiary"
        class="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all flex-shrink-0"
        size="square-md"
        rounding="pill"
        title={$t('post.actions.more.actions')}
      >
        <Icon src={EllipsisVertical} size="16" micro />
      </Button>
    {/snippet}
    <MenuDivider>{$t('post.actions.more.actions')}</MenuDivider>
    {#if primary}
      <MenuButton color="danger-subtle" onclick={() => ondelete?.(true)}>
        {#snippet prefix()}
          <Icon src={Trash} size="16" micro />
        {/snippet}
        {$t('post.actions.more.delete')}
      </MenuButton>
    {:else}
      <MenuButton color="danger-subtle" onclick={() => onreport?.(true)}>
        {#snippet prefix()}
          <Icon src={Flag} size="16" micro />
        {/snippet}
        {$t('moderation.report')}
      </MenuButton>
    {/if}
  </Menu>
</div>

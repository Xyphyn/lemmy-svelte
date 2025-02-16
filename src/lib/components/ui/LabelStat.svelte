<script lang="ts">
  import FormattedNumber from '../util/FormattedNumber.svelte'

  interface Props {
    label: string
    content: string
    formatted?: boolean
    labelClass?: string
    contentClass?: string
    class?: string
  }

  let {
    label,
    content,
    formatted = false,
    labelClass = '',
    contentClass = '',
    class: clazz = '',
  }: Props = $props()
</script>

<div class="flex flex-col {clazz}">
  <span class="text-slate-600 dark:text-zinc-400 text-xs {labelClass}">
    {label}
  </span>
  <span class="text-base {contentClass}">
    {#if formatted}
      <FormattedNumber number={Number(content)} />
    {:else}
      {content}
    {/if}
  </span>
</div>

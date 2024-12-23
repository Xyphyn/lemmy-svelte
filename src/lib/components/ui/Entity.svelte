<script lang="ts">
  import Avatar from './Avatar.svelte'

  interface Props {
    name: string
    label?: string | undefined
    icon?: string | undefined
    customIcon?: import('svelte').Snippet
  }

  let {
    name,
    label = undefined,
    icon = undefined,
    customIcon,
  }: Props = $props()
</script>

<div class="flex flex-row gap-2 items-center">
  {#if customIcon}{@render customIcon()}{:else}
    <Avatar url={icon} width={32} />
  {/if}
  <div class="flex flex-col">
    <span class="font-semibold text-base">{name}</span>
    <span class="text-sm">{label}</span>
  </div>
</div>

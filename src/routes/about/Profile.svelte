<script lang="ts">
  import { Badge } from 'mono-svelte'

  interface Props {
    name: string
    description: string
    badge?: string | undefined
    link?: string
    class?: string
  }

  let {
    name,
    description,
    badge = undefined,
    link = '#',
    class: clazz = '',
  }: Props = $props()
</script>

<div class="flex flex-col w-max {clazz}">
  <a
    href={link}
    class="text-base font-medium inline-flex items-center gap-2 {link != '#'
      ? 'hover:underline'
      : ''}"
  >
    {name}
    {#if badge}
      <Badge color="gray-subtle" class="!p-0.5 !px-2">{badge}</Badge>
    {/if}
  </a>
  <span class="text-sm">{description}</span>
</div>

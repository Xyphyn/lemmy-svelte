<script lang="ts">
  import { Material, Popover } from 'mono-svelte'

  interface Props {
    href: string
    size?: keyof typeof sizes
    title?: string
    children?: import('svelte').Snippet
  }

  let { href, size = 'medium', title = '', children }: Props = $props()

  const sizes = {
    large: 'h-24',
    medium: 'h-16',
    small: 'h-8',
  }
</script>

<Popover openOnHover placement="right">
  {#snippet target()}
    <a {href}>
      {@render children?.()}
    </a>
  {/snippet}
  {#snippet popover()}
    <Material
      padding="none"
      rounding="xl"
      elevation="medium"
      class="px-3 py-2 font-medium"
    >
      {title}
    </Material>
  {/snippet}
</Popover>
<div class="{sizes[size]} border-l self-center"></div>

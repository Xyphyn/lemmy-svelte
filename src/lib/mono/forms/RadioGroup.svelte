<script lang="ts">
  import { generateID } from '../forms/helper.js'

  interface Props {
    group?: string
    row?: boolean
    class?: string
    children?: import('svelte').Snippet<[any]>
  }

  let {
    group = generateID(),
    row = false,
    class: clazz = '',
    children,
  }: Props = $props()
</script>

<div class="flex flex-col gap-1">
  <div
    class="flex {row ? 'flex-row flex-wrap' : 'flex-col'} gap-4 {clazz || ''}"
  >
    {@render children?.({ group })}
  </div>
</div>

<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()
</script>

<table class="overflow-auto w-full table-fixed rounded-xl">
  {@render children?.()}
</table>

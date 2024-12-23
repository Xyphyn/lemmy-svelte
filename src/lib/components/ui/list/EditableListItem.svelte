<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()
</script>

<div class="p-2 flex flex-row">
  {@render children?.()}
</div>

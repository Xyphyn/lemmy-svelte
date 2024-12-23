<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet<[any]>} [children]
   */

  /** @type {Props & { [key: string]: any }} */
  let { children, ...rest } = $props()
</script>

{@render children?.({ ...rest })}

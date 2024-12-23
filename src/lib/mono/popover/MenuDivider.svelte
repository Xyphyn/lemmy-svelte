<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div
	class="text-slate-800 dark:text-zinc-200 text-xs font-medium py-2 px-2 flex items-center gap-1"
>
	<div>{@render children?.()}</div>
	<hr class="flex-shrink flex-1 border-slate-200 dark:border-zinc-800 border-opacity-70" />
</div>

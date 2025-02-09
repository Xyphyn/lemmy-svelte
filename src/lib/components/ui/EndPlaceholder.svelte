<div
  class="flex flex-row items-center
   text-sm text-slate-600 dark:text-zinc-400 gap-2 flex-wrap {$$props.class ||
    ''}"
>
  <span class="flex-1 font-medium text-left">
    <slot />
  </span>
  <slot name="action" />
</div>

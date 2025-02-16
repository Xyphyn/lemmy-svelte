<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  type T = $$Generic

  interface Props {
    options: T[]
    disabled?: boolean[]
    optionNames?: string[]
    selected: T
    headless?: boolean
    class?: string
    buttonClazz?: string
    children?: import('svelte').Snippet<[any]>
    onselect?: (item: T) => void
  }

  let {
    options,
    disabled = [],
    optionNames = [],
    selected = $bindable(),
    headless = false,
    class: clazz = '',
    buttonClazz = '',
    children,
    onselect,
  }: Props = $props()

  $effect(() => {
    onselect?.(selected)
  })

  let containerClass = `
    flex flex-row rtl:flex-row-reverse items-center w-max max-w-full overflow-auto
    ${headless ? 'pb-1 gap-1' : ''}
    ${clazz}
  `

  const buttonClass = (selected: boolean) => `
    first:rounded-l-lg first:border-l first:dark:border-l-transparent
    last:rounded-r-lg last:border-r last:dark:border-r-transparent
    rounded-l-none
    rounded-r-none
    px-3 py-1.5 text-sm hover:brightness-110 ${buttonClazz || ''}
    ${
      !selected
        ? `hover:dark:bg-zinc-800 border-slate-100 border-t border-b border-b-slate-300 dark:border-b-0
      dark:border-t dark:border-t-zinc-700`
        : ''
    }
     transition-all transition-filters rounded-full
    ${
      selected
        ? headless
          ? ''
          : `bg-primary-900 dark:bg-primary-100 text-slate-50 dark:text-zinc-900`
        : headless
          ? ''
          : 'bg-white dark:bg-zinc-800'
    }
    disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap
    relative
  `
</script>

<div
  class="border rounded-full border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-1 flex items-center gap-1 w-max max-w-full z-0 relative overflow-auto"
>
  {#each options as option, index}
    {@const slctd = selected == option}
    <button
      class={[
        'px-3 py-1 rounded-full text-sm font-medium transition-colors duration-75 relative',
        slctd
          ? 'bg-primary-900 dark:bg-primary-100 text-slate-50 dark:text-zinc-900'
          : 'dark:bg-zinc-900/50 bg-white',
      ]}
      onclick={(e) => {
        e.preventDefault()
        selected = option
      }}
      disabled={disabled[index] ?? false}
      type="button"
    >
      {optionNames[index] || option}
      {#if slctd}
        <div
          class="absolute left-0 top-0 w-full h-full blur-xl scale-75 opacity-50 dark:bg-primary-100 -z-10"
        ></div>
      {/if}
    </button>
  {/each}
</div>
{@render children?.({ selected })}

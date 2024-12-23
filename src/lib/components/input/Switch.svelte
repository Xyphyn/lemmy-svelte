<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import { ChevronDown, Icon } from 'svelte-hero-icons'
  import { Button } from 'mono-svelte'

  import { createEventDispatcher } from 'svelte'
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
  }: Props = $props()

  const dispatcher = createEventDispatcher<{ select: T }>()

  run(() => {
    dispatcher('select', selected)
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

<div class={containerClass}>
  {#each options as option, index}
    <button
      class={buttonClass(selected == option)}
      onclick={preventDefault(() => (selected = option))}
      disabled={disabled[index] ?? false}
      type="button"
    >
      {optionNames[index] || option}
      {#if headless && option == selected}
        <div
          class="absolute -bottom-1 left-0 w-full border-b-2 rounded-t-sm border-black dark:border-white"
        ></div>
      {/if}
    </button>
  {/each}
</div>
{@render children?.({ selected })}

<script module lang="ts">
  export type Size = keyof typeof sizeClass

  export const sizeClass = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  }

  interface Props extends HTMLTextareaAttributes {
    label?: string | undefined
    value?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    size?: Size
    id?: string
    rows?: number
    element?: HTMLTextAreaElement | undefined
    class?: ClassValue
    customLabel?: import('svelte').Snippet
    suffix?: import('svelte').Snippet
    children?: import('svelte').Snippet
  }

  export type { Props as TextAreaProps }
</script>

<script lang="ts">
  import type { ClassValue, HTMLTextareaAttributes } from 'svelte/elements'

  import Label from '../forms/Label.svelte'
  import { generateID } from '../forms/helper.js'

  const borderClass = `
	border border-slate-200 dark:border-zinc-800
	`

  let {
    label = undefined,
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    required = false,
    size = 'md',
    id = generateID(),
    rows = 4,
    element = $bindable(),
    class: clazz = '',
    customLabel,
    suffix,
    children,
    ...rest
  }: Props = $props()
</script>

<div class="flex flex-col gap-1 {clazz}">
  {#if customLabel || label}
    <Label
      for={id}
      text={label}
      class="peer-invalid:text-red-500 {required
        ? "after:content-['*'] after:text-red-500 after:ml-1"
        : ''}"
    >
      {@render customLabel?.()}
    </Label>
  {/if}
  <div
    class="rounded-xl flex flex-col items-center text-sm bg-white dark:bg-zinc-950 {clazz}"
  >
    <textarea
      {id}
      {placeholder}
      {disabled}
      {rows}
      bind:value
      bind:this={element}
      {...rest}
      class={[
        sizeClass[size],
        borderClass,
        `focus:border-slate-800 focus:dark:border-zinc-200 bg-white dark:bg-zinc-950
      focus:outline-none focus:ring-2 ring-slate-800/50 rounded-xl dark:ring-zinc-200/50
      transition-all text-sm w-full disabled:bg-slate-100
		disabled:cursor-not-allowed disabled:dark:bg-zinc-900 invalid:!border-red-500
		peer invalid:text-red-500 z-10`,
        suffix && 'rounded-b-none border-b-0',
        clazz,
      ]}
    ></textarea>
    {#if suffix}
      <div
        class="{borderClass} {sizeClass[
          size
        ]} w-full border-t-0 rounded-xl rounded-t-none
      flex items-center"
      >
        {@render suffix?.()}
      </div>
    {/if}
  </div>
  {@render children?.()}
</div>

<script module lang="ts">
  export type Size = keyof typeof sizeClass
  export type Shadow = keyof typeof shadowClass

  export const sizeClass = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-5 py-3',
  }

  export const shadowClass = {
    sm: 'shadow-sm',
    none: 'shadow-none',
  }

  interface Props extends Omit<HTMLInputAttributes, 'size' | 'prefix'> {
    label?: string | undefined
    placeholder?: string
    disabled?: boolean
    required?: boolean
    size?: Size
    id?: string
    inlineAffixes?: boolean
    shadow?: Shadow
    element?: HTMLInputElement | undefined
    class?: string
    customLabel?: import('svelte').Snippet
    prefix?: import('svelte').Snippet
    suffix?: import('svelte').Snippet
    children?: import('svelte').Snippet
  }

  export type { Props as TextInputProps }
</script>

<script lang="ts">
  import type {
    HTMLInputAttributes,
    HTMLInputTypeAttribute,
  } from 'svelte/elements'

  import Label from '../forms/Label.svelte'
  import { generateID } from '../forms/helper.js'

  const borderClass = `
	border border-slate-200 border-b-slate-300 dark:border-zinc-900 dark:border-t-zinc-800
	`

  let {
    label = undefined,
    value = $bindable(),
    placeholder = '',
    disabled = false,
    required = false,
    size = 'md',
    id = generateID(),
    inlineAffixes = false,
    shadow = 'none',
    element = $bindable(),
    class: clazz = '',
    customLabel,
    prefix,
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
      {#snippet customLabel()}
        {@render customLabel?.()}
      {/snippet}
    </Label>
  {/if}
  <div
    class={[
      shadowClass[shadow],
      borderClass,
      `border focus-within:border-primary-900 focus-within:dark:border-primary-100 focus-within:ring-2
  ring-slate-300 dark:ring-zinc-700
  transition-colors
  rounded-lg flex flex-row items-center text-sm`,
      clazz,
    ]}
  >
    {#if prefix}
      <div
        class="rounded-lg rounded-r-none
			text-slate-600 dark:text-zinc-400 {inlineAffixes
          ? 'bg-white dark:bg-zinc-950 pr-0 w-8'
          : ''} {sizeClass[size]}"
      >
        {@render prefix?.()}
      </div>
    {/if}
    <input
      type="text"
      {id}
      {placeholder}
      {disabled}
      bind:value
      bind:this={element}
      {...rest}
      class={[
        sizeClass[size],
        `bg-white dark:bg-zinc-950
		 focus:outline-none rounded-lg text-sm w-full disabled:bg-slate-100
		disabled:cursor-not-allowed disabled:dark:bg-zinc-950 invalid:!border-red-500
		peer invalid:text-red-500 z-10`,
        prefix && 'rounded-l-none',
        prefix && inlineAffixes && 'border-l-0',
        suffix && 'rounded-r-none',
        suffix && inlineAffixes && 'border-r-0',
        clazz,
      ]}
    />
    {#if suffix}
      <div
        class={[
          'rounded-lg rounded-l-none text-slate-600 dark:text-zinc-400',
          inlineAffixes && 'bg-white dark:bg-zinc-950 pl-0',
          sizeClass[size],
        ]}
      >
        {@render suffix?.()}
      </div>
    {/if}
  </div>
  {@render children?.()}
</div>

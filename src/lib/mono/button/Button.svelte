<script module lang="ts">
  export type ButtonColor = keyof typeof buttonColor
  export type ButtonAlignment = keyof typeof buttonAlignment
  export type ButtonShadow = keyof typeof buttonShadow

  export const buttonAlignment = {
    left: 'justify-start text-left origin-left',
    center: 'justify-center text-center origin-center',
    right: 'justify-end text-right origin-right',
  }

  export const buttonColor = {
    primary: `border border-transparent bg-primary-900 text-white
		 dark:bg-primary-100 dark:text-black hover:brightness-125 dark:hover:brightness-90 active:brightness-90
		 active:dark:brightness-75`,

    secondary: `border border-slate-200 border-b-slate-300 dark:border-zinc-800 dark:border-t-zinc-700/50 bg-white dark:bg-zinc-900
		hover:bg-slate-100 hover:dark:bg-zinc-800 hover:dark:border-zinc-700 hover:dark:border-zinc-700 active:dark:bg-zinc-900 active:bg-slate-200`,

    tertiary:
      'border border-transparent bg-transparent hover:bg-slate-100 hover:dark:bg-zinc-700/30 dark:text-zinc-200',

    danger:
      'border border-red-500 bg-red-500 hover:text-red-500 hover:bg-transparent text-white',
    'danger-subtle': 'text-red-500 hover:bg-red-500 hover:!text-inherit',

    'success-subtle': 'text-green-500 hover:bg-green-500 hover:!text-inherit',

    'warning-subtle': 'text-yellow-500 hover:bg-yellow-500 hover:!text-inherit',

    ghost: `border border-slate-200 dark:border-zinc-800 bg-transparent
		hover:bg-slate-100 hover:dark:bg-zinc-800 hover:dark:border-zinc-700 dark:text-zinc-400 hover:text-inherit
		hover:dark:text-inherit`,

    elevated: `bg-slate-100 dark:bg-zinc-800 border border-slate-200
	 dark:border-zinc-700 hover:bg-zinc-200 hover:dark:bg-zinc-700 hover:border-slate-300
	 hover:dark:border-zinc-600`,

    elevatedLow: `bg-slate-100 dark:bg-zinc-900 border border-slate-200
	dark:border-zinc-800 hover:bg-slate-200 hover:dark:bg-zinc-800 hover:border-slate-300
	hover:dark:border-zinc-700`,

    none: '',
  }

  export const buttonShadow = {
    sm: 'shadow-sm',
    none: 'shadow-none',
  }

  export type ButtonSize = keyof typeof buttonSize

  export const buttonSize = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
    xl: 'px-6 py-3',
    'square-sm': 'w-6 h-6',
    'square-md': 'w-8 h-8',
    'square-lg': 'w-10 h-10',
    'square-xl': 'w-12 h-12',
    custom: '',
  }

  type ButtonRoundness = 'pill' | 'xl' | 'lg' | 'md' | 'none'
  type ButtonRoundingSide = 'all' | 'left' | 'right' | 'top' | 'bottom'

  const buttonRounding = {
    pill: {
      all: 'rounded-full',
      left: 'rounded-l-full',
      right: 'rounded-r-full',
      top: 'rounded-t-full',
      bottom: 'rounded-b-full',
    },

    xl: {
      all: 'rounded-xl',
      left: 'rounded-l-xl',
      right: 'rounded-r-xl',
      top: 'rounded-t-xl',
      bottom: 'rounded-b-xl',
    },

    lg: {
      all: 'rounded-lg',
      left: 'rounded-l-lg',
      right: 'rounded-r-lg',
      top: 'rounded-t-lg',
      bottom: 'rounded-b-lg',
    },

    md: {
      all: 'rounded-md',
      left: 'rounded-l-md',
      right: 'rounded-r-md',
      top: 'rounded-t-md',
      bottom: 'rounded-b-md',
    },

    none: {
      all: '',
      left: '',
      right: '',
      top: '',
      bottom: '',
    },
  }

  interface Props extends Omit<HTMLButtonAttributes, 'prefix'> {
    loading?: boolean
    submit?: boolean
    color?: ButtonColor
    size?: ButtonSize
    rounding?: ButtonRoundness
    roundingSide?: ButtonRoundingSide
    alignment?: ButtonAlignment
    shadow?: ButtonShadow
    column?: boolean
    animations?: any
    loaderWidth?: number | undefined
    href?: string | undefined
    class?: ClassValue
    prefix?: Snippet
    children?: Snippet
    suffix?: Snippet
    onclick?: HTMLButtonAttributes['onclick']
    [key: string]: any
  }

  export type { Props as ButtonProps }
</script>

<script lang="ts">
  import type { ClassValue, HTMLButtonAttributes } from 'svelte/elements'

  import Spinner from '../loader/Spinner.svelte'
  import type { Snippet } from 'svelte'

  let {
    loading = false,
    submit = false,
    color = 'secondary',
    size = 'md',
    rounding = size == 'lg' ? 'xl' : 'lg',
    roundingSide = 'all',
    alignment = 'center',
    shadow = 'none',
    column = false,
    animations = {
      scale: false,
      large: false,
    },
    loaderWidth = undefined,
    href = undefined,
    class: clazz = '',
    prefix,
    children,
    suffix,
    ...rest
  }: Props = $props()
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  role={href ? 'link' : 'button'}
  {href}
  {...rest}
  class={[
    loading ? buttonColor.secondary : buttonColor[color],
    buttonSize[size],
    buttonRounding[rounding][roundingSide],
    buttonShadow[shadow],
    'text-sm transition-all font-medium cursor-pointer duration-75 disabled:opacity-50 disabled:pointer-events-none',
    alignment == 'center'
      ? 'origin-center'
      : alignment == 'left'
        ? 'origin-left'
        : 'origin-right',
    clazz,
  ]}
  type={submit ? 'submit' : 'button'}
>
  <div
    class="flex {column
      ? 'flex-col justify-center'
      : 'flex-row items-center'} h-full gap-1.5 button-content {buttonAlignment[
      alignment
    ]}"
  >
    {#if loading}
      <Spinner width={loaderWidth ?? 16} />
    {:else if prefix}
      {@render prefix?.()}
    {/if}
    {@render children?.()}
    {@render suffix?.()}
  </div>
</svelte:element>

<!--
  @component
  
  @slot `prefix` -- Will be replaced if `loading` is `true`.
  @slot `suffix`
-->

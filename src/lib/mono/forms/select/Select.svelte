<script lang="ts" generics="T">
  import { run, createBubbler } from 'svelte/legacy'

  const bubble = createBubbler()
  import {
    buttonColor,
    buttonSize,
    type ButtonShadow,
    type ButtonSize,
    buttonShadow,
  } from '../../button/Button.svelte'
  import Label from '../Label.svelte'
  import { generateID } from '../helper.js'
  import Menu from '../../popover/Menu.svelte'
  import MenuButton from '../../popover/MenuButton.svelte'
  import Popover from '../../popover/Popover.svelte'
  import { createEventDispatcher, onMount, setContext, tick } from 'svelte'
  import {
    CheckCircle,
    ChevronDown,
    ChevronUpDown,
    Icon,
    type IconSource,
  } from 'svelte-hero-icons'
  import type { ClassValue, HTMLSelectAttributes } from 'svelte/elements'

  let open = $state(false)
  let element: HTMLSelectElement | undefined = $state()

  interface SelectContext {
    options: {
      value: string
      label: string
      icon?: IconSource
      disabled?: boolean
    }[]
  }

  const context = setContext<SelectContext>('select', {
    options: [],
  })

  interface Props extends Omit<HTMLSelectAttributes, 'size'> {
    value?: T | string | undefined
    placeholder?: string | undefined
    label?: string | undefined
    size?: ButtonSize
    shadow?: ButtonShadow
    id?: string
    class?: ClassValue
    baseClass?: ClassValue
    selectClass?: ClassValue
    customLabel?: import('svelte').Snippet
    children?: import('svelte').Snippet
    customOption?: import('svelte').Snippet<[any]>
    oncontextmenu?: HTMLSelectAttributes['oncontextmenu']
    onchange?: HTMLSelectAttributes['onchange']
  }

  let {
    value = $bindable(undefined),
    placeholder = undefined,
    label = undefined,
    size = 'md',
    shadow = 'none',
    id = generateID(),
    class: clazz = '',
    baseClass = '',
    selectClass = '',
    customLabel,
    children,
    customOption,
    oncontextmenu,
    onchange,
    ...rest
  }: Props = $props()
</script>

<div class="flex flex-col gap-1 {clazz} {baseClass}">
  {#if customLabel || label}
    <Label for={id} text={label}>
      {@render customLabel?.()}
    </Label>
  {/if}

  <div class="w-full relative">
    <Menu bind:open>
      {#snippet target()}
        <select
          {...rest}
          {id}
          bind:this={element}
          class="{buttonSize[size]} {buttonShadow[
            shadow
          ]} {buttonColor.secondary} appearance-none transition-colors rounded-lg text-sm
  	w-full min-w-full cursor-pointer pr-6 {buttonColor.secondary}
  	{clazz} {selectClass}"
          bind:value
          onmousedown={(e) => {
            e.preventDefault()
          }}
          onkeypress={(e) => {
            e.preventDefault()
            open = !open
          }}
          {onchange}
          {oncontextmenu}
          {placeholder}
        >
          {#if placeholder}
            <option disabled selected value="">{placeholder}</option>
          {/if}
          {@render children?.()}
        </select>
      {/snippet}

      {#each context.options as option}
        {#if customOption}{@render customOption({
            option,
            selected: option.value == value,
          })}{:else}
          <MenuButton
            onclick={async () => {
              value = option.value
              await tick()
              element?.dispatchEvent(new Event('change', { bubbles: true }))
            }}
            size="custom"
            disabled={option.disabled}
            class="!min-h-0 !py-[5px] {option.value == value
              ? '!bg-slate-100 dark:!bg-zinc-800'
              : ''}"
          >
            {#if option.icon}
              <Icon
                src={option.icon}
                size="16"
                micro
                class="text-slate-600 dark:text-zinc-400"
              />
            {/if}
            {@html option.label}
            {#if option.value == value}
              <Icon
                src={CheckCircle}
                size="16"
                micro
                class="text-primary-900 dark:text-primary-100 ml-auto"
              />
            {/if}
          </MenuButton>
        {/if}
      {/each}
    </Menu>
    <Icon
      src={ChevronUpDown}
      mini
      size="16"
      class="absolute right-0 top-1/4 mx-2 box-border pointer-events-none"
    />
  </div>
</div>

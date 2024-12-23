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
  import { createEventDispatcher, onMount, setContext } from 'svelte'
  import {
    CheckCircle,
    ChevronDown,
    ChevronUpDown,
    Icon,
  } from 'svelte-hero-icons'
  import { browser } from '$app/environment'
  import { writable } from 'svelte/store'

  let open = $state(false)
  let element: HTMLSelectElement | undefined = $state()

  let options: { value: any; label: string | null; disabled: boolean }[] =
    $state([])

  // Capture all options from the select element
  $effect(() => {
    options = element?.options
      ? Array.from(element?.options).map((option) => ({
          value: option.value,
          label: option.innerHTML,
          disabled: option.disabled,
        }))
      : []
  })

  const dispatcher = createEventDispatcher<{
    change: any
    contextmenu: any
    input: any
  }>()
  interface Props {
    value?: T | undefined
    placeholder?: string | undefined
    label?: string | undefined
    size?: ButtonSize
    shadow?: ButtonShadow
    id?: string
    class?: string
    customLabel?: import('svelte').Snippet
    children?: import('svelte').Snippet
    customOption?: import('svelte').Snippet<[any]>
  }

  let {
    value = $bindable(undefined),
    placeholder = undefined,
    label = undefined,
    size = 'md',
    shadow = 'none',
    id = generateID(),
    class: clazz = '',
    customLabel,
    children,
    customOption,
  }: Props = $props()
</script>

<div class="flex flex-col gap-1 {clazz}">
  {#if customLabel || label}
    <Label for={id} text={label}>
      {@render customLabel?.()}
    </Label>
  {/if}

  <div class="w-full relative">
    <Menu bind:open>
      {#snippet target()}
        <select
          {id}
          bind:this={element}
          class="{buttonSize[size]} {buttonShadow[
            shadow
          ]} {buttonColor.secondary} appearance-none transition-colors rounded-lg text-sm
  	w-full min-w-full cursor-pointer pr-6 {buttonColor.secondary}
  	{clazz}"
          bind:value
          onmousedown={(e) => {
            e.preventDefault()
          }}
          onkeypress={(e) => {
            e.preventDefault()
            open = !open
          }}
          onchange={bubble('change')}
          oncontextmenu={bubble('contextmenu')}
          {placeholder}
        >
          {#if placeholder}
            <option disabled selected value="">{placeholder}</option>
          {/if}
          {@render children?.()}
        </select>
      {/snippet}

      {#each options as option}
        {#if customOption}{@render customOption({
            option,
            selected: option.value == value,
          })}{:else}
          <MenuButton
            on:contextmenu={() => dispatcher('contextmenu')}
            onclick={() => {
              value = option.value
              dispatcher('change')
            }}
            size="custom"
            disabled={option.disabled}
            class="!min-h-0 !py-[5px] {option.value == value
              ? '!bg-slate-100 dark:!bg-zinc-800'
              : ''}"
          >
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

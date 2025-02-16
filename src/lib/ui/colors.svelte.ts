import {
  derived,
  get,
  writable,
  type Updater,
  type Writable,
  type Readable,
} from 'svelte/store'
import { env } from '$env/dynamic/public'
import { getDefaultTheme, presets } from './presets'
import { browser } from '$app/environment'
import { t } from '$lib/translations'

type ColorScheme = 'system' | 'light' | 'dark'

export interface ThemeData {
  scheme: ColorScheme
  themes: Theme[]
  currentTheme: number
}

export interface Theme {
  id: number
  colors: ThemeColors
  name: string
}

export interface ThemeColors {
  [scheme: string]: {
    [key: string]: string
  }
}

export function hexToRgb(value: string) {
  // Regular expression to match valid hex color codes
  const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

  if (!hexRegex.test(value)) {
    return value // Not a valid hex color
  }

  // Remove # if present
  let hex = value.replace('#', '')

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  // Convert to RGB values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `${r} ${g} ${b}`
}

export function rgbToHex(rgbString: string): string {
  const rgb = rgbString.split(' ')

  if (rgb.length !== 3) {
    return rgbString
  }

  const [r, g, b] = rgb.map((val) => {
    const num = parseInt(val, 10)
    if (isNaN(num) || num < 0 || num > 255) {
      return 0
    }
    return num
  })

  // Convert to hex and pad with zeros if necessary
  const toHex = (n: number) => n.toString(16).padStart(2, '0')

  // Return the hex color code
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

$effect.root(() => {
  $effect(() => {
    if (browser) {
      const filteredThemes = theme.data.themes.filter((t) => t.id > 0)
      localStorage.setItem(
        'theme.data',
        JSON.stringify({
          ...theme.data,
          themes: filteredThemes,
        }),
      )
    }
  })
  $effect(() => {
    if (browser) {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches

      const html = document.querySelector('html')

      if (theme.colorScheme == 'system')
        html?.classList.toggle('dark', prefersDark)
      else html?.classList.toggle('dark', theme.colorScheme === 'dark')

      localStorage.setItem('colorScheme', theme.colorScheme)
    }
  })
})

const configuredColorScheme = env.PUBLIC_COLORSCHEME ?? 'system'

class ThemeState {
  constructor() {
    const localColorScheme: ColorScheme = browser
      ? (localStorage.getItem('colorScheme') as ColorScheme) ||
        configuredColorScheme
      : (configuredColorScheme as ColorScheme)

    this.#colorScheme = localColorScheme
  }

  #data = $state<ThemeData>(
    loadTheme() ?? {
      scheme: 'system',
      themes: presets,
      currentTheme: 0,
    },
  )
  #current = $derived(
    this.#data.themes.find((i) => i.id == this.#data.currentTheme) ??
      getDefaultTheme(),
  )
  #colorScheme = $state<ColorScheme>(configuredColorScheme as ColorScheme)
  #vars = $derived(calculateVars(this.#current))

  get current() {
    return this.#current
  }
  set current(value) {
    if (!value) return
    const index = this.#data.themes.findIndex((i) => i.id == value?.id)
    this.#data.themes[index] = value
  }

  get colorScheme() {
    return this.#colorScheme
  }
  set colorScheme(value) {
    this.#colorScheme = value
  }

  get vars() {
    return this.#vars
  }

  get data() {
    return this.#data
  }
  set data(value) {
    this.#data = value
  }
}

export let theme = new ThemeState()

export function calculateVars(theme: Theme) {
  let cssVariables = ''

  for (const [scheme, colors] of Object.entries(theme.colors)) {
    for (const [key, value] of Object.entries(colors)) {
      cssVariables += `--c-${scheme[0]}-${key}:${hexToRgb(value)}; `
    }
  }

  return cssVariables.trim()
}

export const inDarkColorScheme = (): boolean => {
  if (browser) {
    return theme.colorScheme == 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme.colorScheme == 'dark'
  }
  return false
}

function loadTheme() {
  if (!browser) return
  const localTheme = localStorage.getItem('theme.data')

  if (localTheme) {
    const data = JSON.parse(localTheme)
    if (!data) return
    data.themes = [...presets, ...data.themes]
    return data
  }

  return
}

// See https://kit.svelte.dev/docs/types#app

import type { ComponentType, SvelteComponent } from 'svelte'

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      instance?: string
    }
    interface PageData {
      slots?: {
        sidebar?: {
          component?: ComponentType
          props?: any
        }
        nav?: {
          component: ComponentType
          props?: any
        }
      }
    }
    interface PageState {
      openImage: url
    }
    // interface Platform {}
  }
  declare const __VERSION__: string
}

export {}
declare const __VERSION__: string

declare module 'markdown-it-sub'
declare module 'markdown-it-sup'

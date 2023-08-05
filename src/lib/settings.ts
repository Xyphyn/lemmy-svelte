import type { SortType } from 'lemmy-js-client'
import { writable } from 'svelte/store'

interface Settings {
  newComments: boolean
  expandableImages: boolean
  markReadPosts: boolean
  instance?: string
  revertColors: boolean
  showInstances: {
    user: boolean
    community: boolean
    comments: boolean
  }
  showCompactPosts: boolean
  defaultSort: {
    sort: SortType
    feed: 'All' | 'Subscribed' | 'Local'
  }
  hidePosts: {
    deleted: boolean,
    removed: boolean,
  },
  fullWidthLayout: boolean
  expandSidebar: boolean
}

const defaultSettings: Settings = {
  newComments: true,
  expandableImages: true,
  markReadPosts: true,
  revertColors: false,
  showInstances: {
    user: false,
    community: false,
    comments: false,
  },
  showCompactPosts: false,
  defaultSort: {
    sort: 'Active',
    feed: 'Local',
  },
  hidePosts: {
    deleted: true,
    removed: true,
  },
  fullWidthLayout: false,
  expandSidebar: true,
}

export const userSettings = writable(defaultSettings)

if (typeof window != 'undefined') {
  let oldUserSettings = JSON.parse(
    localStorage.getItem('settings') ?? JSON.stringify(defaultSettings)
  )

  userSettings.set({ ...defaultSettings, ...oldUserSettings })
}

userSettings.subscribe((settings) => {
  if (typeof window != 'undefined') {
    localStorage.setItem('settings', JSON.stringify(settings))
  }
})

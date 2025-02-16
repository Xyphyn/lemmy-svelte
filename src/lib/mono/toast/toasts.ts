import { writable } from 'svelte/store'

type ToastType = keyof typeof toastColors

export const toastColors = {
  error:
    'bg-white dark:bg-zinc-950 text-red-600 dark:text-red-400 border border-red-700',
  warning:
    'bg-white dark:bg-zinc-950 text-yellow-600 dark:text-yellow-400 border border-yellow-600',
  success:
    'bg-white dark:bg-zinc-950 text-green-700 dark:text-green-400 border border-green-500',
  info: 'dark:bg-zinc-950 bg-white border border-slate-200 dark:border-zinc-800 shadow-lg',
}

export interface Toast {
  id: number
  title?: string
  content: string
  type: ToastType
  loading?: boolean
  action?: () => any
}

export const toasts = writable<Toast[]>([])

export function toast({
  title,
  content,
  type = 'info',
  duration = 5000,
  loading = false,
  action,
}: {
  title?: string
  content: string
  type?: ToastType
  duration?: number
  loading?: boolean
  action?: () => any
}) {
  let id = 0

  toasts.update((toasts) => {
    id = Math.floor(Math.random() * 10000)

    return [
      ...toasts,
      {
        id: id,
        content: content,
        title: title,
        type: type,
        loading: loading,
        action: action,
      },
    ]
  })

  setTimeout(() => {
    toasts.update((toasts) => toasts.filter((toast) => toast.id != id))
  }, duration)

  return id
}

export const removeToast = (id: number) =>
  toasts.update((toasts) => toasts.filter((toast) => toast.id != id))

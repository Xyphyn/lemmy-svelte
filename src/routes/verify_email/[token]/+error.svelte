<script>
  import { page } from '$app/state'
  import { t } from '$lib/translations'
  import { XMark, Icon } from 'svelte-hero-icons'
</script>

<div class="flex flex-col items-center h-max my-auto gap-2">
  <div
    class="rounded-full bg-red-200 dark:bg-red-900 text-red-600 dark:text-red-300 p-3"
  >
    <Icon src={XMark} size="32" mini />
  </div>
  <h1 class="text-red-800 dark:text-red-300 text-2xl font-semibold">
    {$t('message.error')}
  </h1>
  <p class="text-red-800 dark:text-red-300">{$t('routes.verifyEmail.error')}</p>
  <code>{page.error?.message}</code>
</div>

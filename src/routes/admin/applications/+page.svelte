<script lang="ts">
  import { page } from '$app/state'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { searchParam } from '$lib/util.svelte.js'
  import { ClipboardDocumentCheck, Icon } from 'svelte-hero-icons'
  import Application from './Application.svelte'
  import MultiSelect from '$lib/components/input/Switch.svelte'
  import { t } from '$lib/translations'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'

  let { data } = $props()
</script>

<Header pageHeader>{$t('routes.admin.applications.title')}</Header>
<MultiSelect
  options={[false, true]}
  selected={data.unreadOnly ?? true}
  optionNames={[$t('filter.location.all'), $t('filter.unread')]}
  onselect={(e) => searchParam(page.url, 'unreadOnly', e.toString(), 'page')}
/>
{#if data.applications && data.applications.length > 0}
  <div class="flex flex-col gap-4">
    {#each data.applications as application (application.registration_application.id)}
      <Application {application} />
    {/each}
  </div>
  {#if data.applications.length >= 40}
    <div class="mt-auto">
      <Pageination page={data.page} href={(page) => `?page=${page}`} />
    </div>
  {/if}
{:else}
  <Placeholder
    icon={ClipboardDocumentCheck}
    title={$t('routes.admin.applications.empty.title')}
    description={$t('routes.admin.applications.empty.description')}
  />
{/if}

<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { profile } from '$lib/auth.svelte.js'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { Label, Switch, toast } from 'mono-svelte'
  import { getClient } from '$lib/lemmy.js'
  import type { EditSite } from 'lemmy-js-client'
  import type { PageData } from './$types.js'
  import { Button, Checkbox, Select, TextInput } from 'mono-svelte'
  import ImageUploadModal from '$lib/components/lemmy/modal/ImageUploadModal.svelte'
  import { DocumentPlus, Icon } from 'svelte-hero-icons'
  import { t } from '$lib/translations.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'

  interface Props {
    data: PageData
  }

  let { data }: Props = $props()

  const formData: Omit<EditSite, 'auth'> | undefined = $state(
    data.site
      ? {
          ...data.site.site_view.local_site,
          ...data.site.site_view.site,
        }
      : undefined,
  )

  async function save() {
    if (!$profile?.jwt) return

    saving = true
    const { jwt } = $profile

    try {
      await getClient().editSite({
        ...formData,
      })
      toast({
        content: $t('toast.updatedSite'),
        type: 'success',
      })
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    saving = false
  }

  let saving = $state(false)

  let uploading = $state({
    icon: false,
    banner: false,
  })
</script>

<svelte:head>
  <title>{$t('routes.admin.title')}</title>
</svelte:head>

<form class="flex flex-col gap-4" onsubmit={preventDefault(save)}>
  <Header pageHeader>{$t('routes.admin.config.title')}</Header>
  {#if formData}
    <TextInput bind:value={formData.name} label={$t('form.name')} />
    <TextInput
      bind:value={formData.description}
      label={$t('form.description')}
    />
    <MarkdownEditor
      previewButton
      bind:value={formData.sidebar}
      label={$t('routes.admin.config.sidebar')}
    />
    <MarkdownEditor
      previewButton
      bind:value={formData.legal_information}
      label={$t('routes.legal.title')}
    />
    <div class="flex flex-col gap-1">
      <Label>{$t('routes.admin.config.icon')}</Label>
      <button
        type="button"
        onclick={() => (uploading.icon = !uploading.icon)}
        class="flex flex-col gap-4 bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 p-4 w-full h-32 rounded-xl"
      >
        {#if formData.icon}
          <img src={formData.icon} alt="" class="rounded-md mx-auto h-full" />
        {:else}
          <Icon
            src={DocumentPlus}
            size="48"
            class="text-slate-500 dark:text-zinc-500 mx-auto my-auto"
          />
        {/if}
      </button>
      {#if uploading.icon}
        <ImageUploadModal
          bind:open={uploading.icon}
          multiple={false}
          on:upload={(uploaded) => {
            uploading.icon = false
            formData.icon = uploaded.detail[0]
          }}
        />
      {/if}
    </div>
    <div class="flex flex-col gap-1">
      <Label>{$t('routes.admin.config.banner')}</Label>
      <button
        type="button"
        onclick={() => (uploading.banner = !uploading.banner)}
        class="flex flex-col gap-4 bg-white dark:bg-black border border-slate-300 dark:border-zinc-800 p-4 w-full h-32 rounded-xl"
      >
        {#if formData.banner}
          <img src={formData.banner} alt="" class="rounded-md mx-auto h-full" />
        {:else}
          <Icon
            src={DocumentPlus}
            size="48"
            class="text-slate-500 dark:text-zinc-500 mx-auto my-auto"
          />
        {/if}
      </button>
      {#if uploading.banner}
        <ImageUploadModal
          bind:open={uploading.banner}
          multiple={false}
          on:upload={(uploaded) => {
            uploading.banner = false
            formData.banner = uploaded.detail[0]
          }}
        />
      {/if}
    </div>
    <Switch bind:checked={formData.enable_downvotes} defaultValue={true}>
      {$t('routes.admin.config.downvotesEnabled')}
    </Switch>
    <Switch checked={formData.enable_nsfw} defaultValue={true}>
      {$t('routes.admin.config.nsfwEnabled')}
    </Switch>
    <Select
      label={$t('routes.admin.config.registration.label')}
      bind:value={formData.registration_mode}
      class="w-max"
    >
      <option value="Open">
        {$t('routes.admin.config.registration.open')}
      </option>
      <option value="RequireApplication">
        {$t('routes.admin.config.registration.application')}
      </option>
      <option value="Closed">
        {$t('routes.admin.config.registration.closed')}
      </option>
    </Select>
    {#if formData.registration_mode == 'RequireApplication'}
      <MarkdownEditor
        previewButton
        label={$t('routes.admin.config.applicationQuestion')}
        bind:value={formData.application_question}
      />
    {/if}
    <Switch
      bind:checked={formData.community_creation_admin_only}
      defaultValue={true}
    >
      {$t('routes.admin.config.adminCommunityOnly')}
    </Switch>
    <Switch
      bind:checked={formData.require_email_verification}
      defaultValue={true}
    >
      {$t('routes.admin.config.requireVerifyEmail')}
    </Switch>
    <Switch
      bind:checked={formData.application_email_admins}
      defaultValue={true}
    >
      {$t('routes.admin.config.emailAdminsOnApplication')}
    </Switch>
    <Switch bind:checked={formData.reports_email_admins} defaultValue={true}>
      {$t('routes.admin.config.emailAdminsOnReport')}
    </Switch>
    <Select
      label={$t('routes.admin.config.listingType.label')}
      bind:value={formData.default_post_listing_type}
      class="w-max"
    >
      <option value="All">{$t('routes.admin.config.listingType.all')}</option>
      <option value="Local">
        {$t('routes.admin.config.listingType.local')}
      </option>
    </Select>
    <Switch bind:checked={formData.private_instance} defaultValue={true}>
      {$t('routes.admin.config.private')}
    </Switch>
    <Switch bind:checked={formData.hide_modlog_mod_names} defaultValue={true}>
      {$t('routes.admin.config.hideModlogModNames')}
    </Switch>
    <TextInput
      bind:value={formData.slur_filter_regex}
      label={$t('routes.admin.config.slurFilter')}
      placeholder="(word1|word2)"
    />
    <Switch bind:checked={formData.federation_enabled} defaultValue={true}>
      {$t('routes.admin.config.federation')}
    </Switch>
    <Switch bind:checked={formData.federation_debug} defaultValue={false}>
      {$t('routes.admin.config.federationDebug')}
    </Switch>
    <Switch bind:checked={formData.captcha_enabled} defaultValue={false}>
      {$t('routes.admin.config.captcha.enabled')}
    </Switch>
  {/if}
  <Button color="primary" size="lg" loading={saving} disabled={saving} submit>
    {$t('common.save')}
  </Button>
</form>

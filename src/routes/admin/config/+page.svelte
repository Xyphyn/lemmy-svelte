<script lang="ts">
  import { profile } from '$lib/auth.svelte.js'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import {
    Badge,
    Label,
    Material,
    Menu,
    MenuButton,
    Switch,
    toast,
  } from 'mono-svelte'
  import { getClient, site } from '$lib/lemmy.svelte.js'
  import type { EditSite } from 'lemmy-js-client'
  import type { PageData } from './$types.js'
  import { Button, Checkbox, Select, TextInput } from 'mono-svelte'
  import ImageUploadModal from '$lib/components/lemmy/modal/ImageUploadModal.svelte'
  import { DocumentPlus, Icon, Plus } from 'svelte-hero-icons'
  import { t } from '$lib/translations.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import Option from 'mono-svelte/forms/select/Option.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'

  interface Props {
    data: PageData
  }

  let { data: pageData }: Props = $props()
  let data = $state(pageData)

  const formData: Omit<EditSite, 'auth'> | undefined = $state(
    data.site
      ? {
          ...data.site.site_view.local_site,
          ...data.site.site_view.site,
          discussion_languages: data.site.discussion_languages,
        }
      : undefined,
  )

  async function save() {
    if (!profile.data?.jwt) return

    saving = true
    const { jwt } = profile.data

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

<form
  class="flex flex-col gap-4"
  onsubmit={(e) => {
    e.preventDefault()
    save()
  }}
>
  <Header pageHeader>{$t('routes.admin.config.title')}</Header>
  {#if formData}
    <TextInput
      bind:value={() => formData.name ?? '', (v) => (formData.description = v)}
      label={$t('form.name')}
    />
    <TextInput
      bind:value={
        () => formData.description ?? '', (v) => (formData.description = v)
      }
      label={$t('form.description')}
    />
    <MarkdownEditor
      previewButton
      bind:value={() => formData.sidebar ?? '', (v) => (formData.sidebar = v)}
      label={$t('routes.admin.config.sidebar')}
    />
    <MarkdownEditor
      previewButton
      bind:value={
        () => formData.legal_information ?? '',
        (v) => (formData.legal_information = v)
      }
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
          onupload={(uploaded) => {
            uploading.icon = false
            formData.icon = uploaded[0]
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
          onupload={(uploaded) => {
            uploading.banner = false
            formData.banner = uploaded[0]
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
      <Option value="Open">
        {$t('routes.admin.config.registration.open')}
      </Option>
      <Option value="RequireApplication">
        {$t('routes.admin.config.registration.application')}
      </Option>
      <Option value="Closed">
        {$t('routes.admin.config.registration.closed')}
      </Option>
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
      <Option value="All">{$t('routes.admin.config.listingType.all')}</Option>
      <Option value="Local">
        {$t('routes.admin.config.listingType.local')}
      </Option>
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

    <div class="space-y-1">
      <SectionTitle>{$t('form.profile.languages.title')}</SectionTitle>
      <p>{$t('form.profile.languages.description')}</p>
      <Material rounding="xl" color="uniform" class="dark:bg-zinc-950">
        {#if site.data}
          <div class="flex gap-2 flex-wrap flex-row">
            <Menu class="gap-px">
              {#snippet target()}
                <button type="button">
                  <Badge color="blue-subtle">
                    <Icon src={Plus} micro size="14" />
                    {$t('common.add')}
                  </Badge>
                </button>
              {/snippet}
              {#each site.data.all_languages.filter((l) => !formData.discussion_languages?.includes(l.id)) as language, index}
                <MenuButton
                  class="min-h-[16px] py-0"
                  onclick={() => {
                    formData.discussion_languages?.push(language.id)
                  }}
                >
                  {language.name}
                </MenuButton>
              {/each}
            </Menu>
            {#each formData.discussion_languages ?? [] as languageId, index}
              {@const language = site.data.all_languages.find(
                (l) => l.id == languageId,
              )}
              <button
                type="button"
                class="hover:brightness-150 transition-all"
                onclick={() => {
                  formData.discussion_languages?.splice(index, 1)
                }}
              >
                <Badge class="cursor-pointer">{language?.name}</Badge>
              </button>
            {/each}
          </div>
        {/if}
      </Material>
    </div>
  {/if}
  <Button color="primary" size="lg" loading={saving} disabled={saving} submit>
    {$t('common.save')}
  </Button>
</form>

<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { profile, profileData, setUserID } from '$lib/auth.svelte.js'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import {
    Badge,
    ImageInput,
    Material,
    Menu,
    MenuButton,
    removeToast,
    toast,
  } from 'mono-svelte'
  import { getClient, site } from '$lib/lemmy.svelte.js'
  import type { SaveUserSettings } from 'lemmy-js-client'
  import { Button, Switch, TextInput } from 'mono-svelte'
  import { uploadImage } from '$lib/util.svelte.js'
  import { t } from '$lib/translations.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
  import type { PageData } from './$types'
  import { Icon, Plus } from 'svelte-hero-icons'

  interface Props {
    inline?: boolean
    data: PageData
    children?: import('svelte').Snippet
  }

  let { inline = false, data, children }: Props = $props()

  let formData: Omit<SaveUserSettings, 'auth'> | undefined = $state({
    ...data.my_user?.local_user_view?.local_user,
    ...data.my_user?.local_user_view?.person,
    discussion_languages: data.my_user?.discussion_languages,
  })

  let profileImage: FileList | undefined = $state()
  let bannerImage: FileList | undefined = $state()

  async function save() {
    if (!formData || !profile.data?.jwt) return

    loading = true

    try {
      let pfp = profileImage
        ? await uploadImage(
            profileImage[0],
            profile.data.instance,
            profile.data.jwt,
          )
        : undefined

      let banner = bannerImage
        ? await uploadImage(
            bannerImage[0],
            profile.data.instance,
            profile.data.jwt,
          )
        : undefined

      const res = await getClient().saveUserSettings({
        ...formData,
        avatar: pfp,
        banner: banner,
      })

      toast({
        content: $t('toast.saveSettings'),
        type: 'success',
      })
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }
    loading = false
  }

  let loading = $state(false)
</script>

<form class="flex flex-col gap-4 h-full" onsubmit={preventDefault(save)}>
  {#if !inline}
    <Header pageHeader>{$t('routes.profile.settings')}</Header>
  {/if}
  {@render children?.()}
  {#if data.my_user?.local_user_view?.local_user && formData}
    <TextInput label={$t('form.profile.email')} bind:value={formData.email} />
    <TextInput
      label={$t('form.profile.displayName')}
      bind:value={formData.display_name}
      placeholder="Optional"
    />
    <MarkdownEditor
      images={false}
      bind:value={() => formData.bio ?? '', (v) => (formData.bio = v)}
      label={$t('form.profile.bio')}
      previewButton
    />
    <div class="flex gap-2 items-center *:flex-1">
      <ImageInput label={$t('form.profile.avatar')} bind:files={profileImage} />
      <ImageInput label={$t('form.profile.banner')} bind:files={bannerImage} />
    </div>
    <TextInput
      label={$t('form.profile.matrix')}
      bind:value={formData.matrix_user_id}
      placeholder="@user:example.com"
    />
    <Switch bind:checked={formData.show_nsfw}>
      {$t('form.profile.showNSFW')}
    </Switch>
    <Switch bind:checked={formData.show_scores}>
      {$t('form.profile.scores')}
    </Switch>
    <Switch bind:checked={formData.bot_account}>
      {$t('form.profile.bot')}
    </Switch>
    <Switch bind:checked={formData.show_bot_accounts}>
      {$t('form.profile.showBots')}
    </Switch>
    <Switch bind:checked={formData.show_read_posts}>
      {$t('form.profile.showRead')}
    </Switch>
    <div class="space-y-1">
      <SectionTitle>{$t('form.profile.languages.title')}</SectionTitle>
      <p>{$t('form.profile.languages.description')}</p>
      <Material rounding="xl" color="uniform" class="dark:bg-zinc-950">
        {#if site.data && formData.discussion_languages}
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
            {#each formData.discussion_languages as languageId, index}
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

    <Button
      submit
      size="lg"
      color="primary"
      class="mt-auto"
      {loading}
      disabled={loading}
    >
      {$t('common.save')}
    </Button>
  {/if}
</form>

<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { profile, profileData, setUserID } from '$lib/auth.svelte.js'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { ImageInput, Material, removeToast, toast } from 'mono-svelte'
  import { getClient } from '$lib/lemmy.js'
  import type { SaveUserSettings } from 'lemmy-js-client'
  import { Button, Switch, TextInput } from 'mono-svelte'
  import { uploadImage } from '$lib/util.svelte.js'
  import { t } from '$lib/translations.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'

  interface Props {
    inline?: boolean
    data: any
    children?: import('svelte').Snippet
  }

  let { inline = false, data, children }: Props = $props()

  let formData: Omit<SaveUserSettings, 'auth'> | undefined = $state({
    ...data.my_user?.local_user_view?.local_user,
    ...data.my_user?.local_user_view?.person,
  })

  let profileImage: FileList | undefined = $state()
  let bannerImage: FileList | undefined = $state()

  async function save() {
    if (!formData || !$profile?.jwt) return

    loading = true

    try {
      let pfp = profileImage
        ? await uploadImage(profileImage[0], $profile.instance, $profile.jwt)
        : undefined

      let banner = bannerImage
        ? await uploadImage(bannerImage[0], $profile.instance, $profile.jwt)
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
      bind:value={formData.bio}
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

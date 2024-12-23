<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { goto } from '$app/navigation'
  import { profile } from '$lib/auth.svelte.js'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { ImageInput, Switch, toast } from 'mono-svelte'
  import { client, getClient } from '$lib/lemmy.js'
  import { addSubscription } from '$lib/lemmy/user.js'
  import { Button, Checkbox, TextInput } from 'mono-svelte'
  import { uploadImage } from '$lib/util.svelte.js'
  import { t } from '$lib/translations'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import ImagePreviewInput from '$lib/components/input/ImagePreviewInput.svelte'
  import Label from 'mono-svelte/forms/Label.svelte'
  import { DocumentPlus, Icon } from 'svelte-hero-icons'
  import ImageUploadModal from '../modal/ImageUploadModal.svelte'
  import Select from 'mono-svelte/forms/select/Select.svelte'

  interface Props {
    /**
     * The community ID to edit.
     */
    edit?: number | undefined
    formData?: {
      name: string
      displayName: string
      icon?: string
      banner?: string
      sidebar?: string
      nsfw: boolean
      postsLockedToModerators: boolean
      submitting: boolean
      visibility: 'Public' | 'LocalOnly'
    }
    formtitle?: import('svelte').Snippet
  }

  let {
    edit = undefined,
    formData = $bindable({
      name: '',
      displayName: '',
      sidebar: '',
      nsfw: false,
      postsLockedToModerators: false,
      submitting: false,
      visibility: 'Public',
    }),
    formtitle,
  }: Props = $props()

  async function submit() {
    if (!$profile?.jwt) return
    if ((!edit && formData.name == '') || formData.displayName == '') return

    formData.submitting = true

    try {
      const res = edit
        ? await getClient().editCommunity({
            title: formData.displayName,
            description: formData.sidebar,
            nsfw: formData.nsfw,
            posting_restricted_to_mods: formData.postsLockedToModerators,
            icon: formData.icon,
            banner: formData.banner,
            community_id: edit,
            visibility: formData.visibility,
          })
        : await getClient().createCommunity({
            name: formData.name,
            title: formData.displayName,
            description: formData.sidebar,
            nsfw: formData.nsfw,
            posting_restricted_to_mods: formData.postsLockedToModerators,
            icon: formData.icon,
            banner: formData.banner,
            visibility: formData.visibility,
          })

      toast({
        content: $t('toast.updatedCommunity'),
        type: 'success',
      })

      if ($profile.user) {
        const c = $profile.user.moderates
          .map((m) => m.community.id)
          .indexOf(res.community_view.community.id)
        if (c != -1) {
          $profile.user.moderates[c] = {
            community: res.community_view.community,
            moderator: $profile.user.local_user_view.person,
          }
        } else {
          $profile.user = {
            ...$profile.user,
            moderates: [
              ...$profile.user.moderates,
              {
                community: res.community_view.community,
                moderator: $profile.user.local_user_view.person,
              },
            ],
          }
        }

        addSubscription(res.community_view.community, true)
      }

      if (!edit)
        goto(
          `/c/${res.community_view.community.name}@${
            new URL(res.community_view.community.actor_id).hostname
          }`,
        )
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    formData.submitting = false
  }

  let uploading = $state({
    banner: false,
    icon: false,
  })
</script>

<form
  onsubmit={preventDefault(submit)}
  class="flex flex-col gap-4 h-full w-full"
>
  {#if formtitle}{@render formtitle()}{:else}
    <Header>{$t('routes.createCommunity')}</Header>
  {/if}
  <TextInput
    required
    label={$t('form.name')}
    bind:value={formData.name}
    on:input={() => {
      formData.name = formData.name.toLowerCase().replaceAll(' ', '_')
    }}
    disabled={edit != undefined}
  />
  <TextInput
    required
    label={$t('form.profile.displayName')}
    bind:value={formData.displayName}
  />
  <div class="flex flex-row gap-4 flex-wrap *:flex-1">
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
  </div>
  <MarkdownEditor
    previewButton
    label={$t('routes.admin.config.sidebar')}
    bind:value={formData.sidebar}
  />

  <Switch bind:checked={formData.nsfw}>{$t('post.badges.nsfw')}</Switch>
  <Switch bind:checked={formData.postsLockedToModerators}>
    Only moderators can post
  </Switch>
  <Select label="Visibility" class="w-max" bind:value={formData.visibility}>
    <option value="Public">Public</option>
    <option value="LocalOnly">Local Only</option>
  </Select>
  <Button
    submit
    color="primary"
    size="lg"
    class="mt-auto"
    loading={formData.submitting}
    disabled={formData.submitting}
  >
    {edit ? $t('common.save') : $t('form.submit')}
  </Button>
</form>

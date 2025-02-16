<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { goto } from '$app/navigation'
  import { profile } from '$lib/auth.svelte.js'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import { Badge, ImageInput, MenuButton, Switch, toast } from 'mono-svelte'
  import { client, getClient, site } from '$lib/lemmy.svelte.js'
  import { addSubscription } from '$lib/lemmy/user.js'
  import { Button, Checkbox, TextInput } from 'mono-svelte'
  import { uploadImage } from '$lib/util.svelte.js'
  import { t } from '$lib/translations'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import ImagePreviewInput from '$lib/components/input/ImagePreviewInput.svelte'
  import Label from 'mono-svelte/forms/Label.svelte'
  import { DocumentPlus, GlobeAlt, Icon, MapPin, Plus } from 'svelte-hero-icons'
  import ImageUploadModal from '../modal/ImageUploadModal.svelte'
  import Select from 'mono-svelte/forms/select/Select.svelte'
  import Option from 'mono-svelte/forms/select/Option.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
  import Material from 'mono-svelte/materials/Material.svelte'
  import Menu from 'mono-svelte/popover/Menu.svelte'

  interface Props {
    /**
     * The community ID to edit.
     */
    edit?: number
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
      languages?: number[]
    }
    formtitle?: import('svelte').Snippet
  }

  let {
    edit = undefined,
    formData: passedFormData = $bindable({
      name: '',
      displayName: '',
      sidebar: '',
      nsfw: false,
      postsLockedToModerators: false,
      submitting: false,
      visibility: 'Public',
      languages: undefined,
    }),
    formtitle,
  }: Props = $props()

  let formData = $state(passedFormData)

  async function submit() {
    if (!profile.data?.jwt) return
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
            discussion_languages: formData.languages,
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
            discussion_languages: formData.languages,
          })

      toast({
        content: $t('toast.updatedCommunity'),
        type: 'success',
      })

      if (profile.data.user) {
        const c = profile.data.user.moderates
          .map((m) => m.community.id)
          .indexOf(res.community_view.community.id)
        if (c != -1) {
          profile.data.user.moderates[c] = {
            community: res.community_view.community,
            moderator: profile.data.user.local_user_view.person,
          }
        } else {
          profile.data.user = {
            ...profile.data.user,
            moderates: [
              ...profile.data.user.moderates,
              {
                community: res.community_view.community,
                moderator: profile.data.user.local_user_view.person,
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
    oninput={() => {
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
    <Option icon={GlobeAlt} value="Public">Public</Option>
    <Option icon={MapPin} value="LocalOnly">Local Only</Option>
  </Select>

  <div class="space-y-1">
    <SectionTitle>{$t('form.profile.languages.title')}</SectionTitle>
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
            {#each site.data.all_languages.filter((l) => !formData.languages?.includes(l.id)) as language, index}
              <MenuButton
                class="min-h-[16px] py-0"
                onclick={() => {
                  formData.languages = [
                    ...(formData.languages ?? []),
                    language.id,
                  ]
                }}
              >
                {language.name}
              </MenuButton>
            {/each}
          </Menu>
          {#each formData.languages ?? [] as languageId, index}
            {@const language = site.data.all_languages.find(
              (l) => l.id == languageId,
            )}
            <button
              type="button"
              class="hover:brightness-150 transition-all"
              onclick={() => {
                formData.languages?.splice(index, 1)
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
    color="primary"
    size="lg"
    class="mt-auto"
    loading={formData.submitting}
    disabled={formData.submitting}
  >
    {edit ? $t('common.save') : $t('form.submit')}
  </Button>
</form>

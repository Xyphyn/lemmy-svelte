<script lang="ts">
  import CommunityForm from '$lib/components/lemmy/community/CommunityForm.svelte'
  import CommunityTitle from '$lib/components/lemmy/community/CommunityTitle.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'

  let { data } = $props()
</script>

<div class="flex flex-col gap-4">
  <Header pageHeader>
    <span>Settings</span>
    {#snippet extended()}
      <CommunityTitle community={data.community.community_view.community} />
    {/snippet}
  </Header>
  <CommunityForm
    edit={data.community.community_view.community.id}
    formData={{
      name: data.community.community_view.community.name,
      displayName: data.community.community_view.community.title,
      nsfw: data.community.community_view.community.nsfw,
      postsLockedToModerators:
        data.community.community_view.community.posting_restricted_to_mods,
      sidebar: data.community.community_view.community.description ?? '',
      icon: data.community.community_view.community.icon,
      banner: data.community.community_view.community.banner,
      visibility: data.community.community_view.community.visibility,
      submitting: false,
      languages: data.community.discussion_languages,
    }}
  >
    {#snippet formtitle()}
      {''}
    {/snippet}
  </CommunityForm>
</div>

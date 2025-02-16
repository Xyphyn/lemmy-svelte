<script lang="ts">
  import UserPage from '../../u/[name]/+page.svelte'
  let { data } = $props()
</script>

{#if data.user && data.sort && data.type && data.page}
  <UserPage
    inline
    data={{
      items: data.user.submissions,
      page: data.page,
      person_view: data.user.person_view,
      moderates: data.user.moderates,
      sort: data.sort,
      type: data.type,
    }}
  />
{:else}
  User data is missing.
  <pre>
    {JSON.stringify(data)}
  </pre>
{/if}

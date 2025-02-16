<script lang="ts">
  import EntityHeader from '$lib/components/ui/EntityHeader.svelte'
  import { t } from '$lib/translations'
  import { Material } from 'mono-svelte'
  import {
    Icon,
    Identification,
    Key,
    Trash,
    UserGroup,
  } from 'svelte-hero-icons'

  let { data } = $props()
</script>

<div
  class="grid grid-cols-1 lg:grid-cols-2 gap-4
  grid-rows-2"
>
  <EntityHeader
    color="default"
    avatar={data.my_user?.local_user_view.person.avatar}
    name={$t('routes.profile.welcome', {
      default: data.my_user?.local_user_view.person.name,
    })}
    stats={[
      {
        name: $t('profile.subscribed'),
        value: data.my_user?.follows.length.toString() ?? '',
      },
      {
        name: $t('routes.profile.moderates'),
        value: data.my_user?.moderates.length.toString() ?? '',
      },
    ]}
    rounding="2xl"
    class="row-span-2"
  />
  <a href="/profile/password/2fa" class="row-span-1">
    <Material
      class="hover:ring-primary-900 dark:hover:ring-primary-100 hover:ring-2 transition-all
      flex flex-col gap-2 h-full"
      rounding="2xl"
    >
      <Material
        rounding="full"
        padding="sm"
        color="default"
        class="h-max w-max"
      >
        <Icon src={Key} size="24" />
      </Material>
      <span class="font-medium text-lg">{$t('form.profile.2fa.2fa')}</span>
      <span class="text-sm">
        {data.my_user?.local_user_view.local_user.totp_2fa_enabled
          ? $t('common.enabled')
          : $t('common.disabled')}
      </span>
    </Material>
  </a>
  <a href="/profile/password/change" class="row-span-1">
    <Material
      class="hover:ring-primary-900 dark:hover:ring-primary-100 hover:ring-2 transition-all
      flex flex-col gap-2 h-full"
      rounding="2xl"
    >
      <Material rounding="full" padding="sm" color="default" class="w-max">
        <Icon src={Identification} size="24" />
      </Material>
      <span class="font-medium text-lg">
        {$t('routes.passwordChange.title')}
      </span>
    </Material>
  </a>
  <a href="/profile/password/logins" class="sm:col-span-1">
    <Material
      class="hover:ring-primary-900 dark:hover:ring-primary-100 hover:ring-2 transition-all
      flex flex-col gap-2 h-full"
      rounding="2xl"
    >
      <Material rounding="full" padding="sm" color="default" class="w-max">
        <Icon src={UserGroup} size="24" />
      </Material>
      <span class="font-medium text-lg">
        {$t('routes.profile.logins')}
      </span>
    </Material>
  </a>
  <a href="/profile/password/delete" class="sm:col-span-1">
    <Material
      class="hover:ring-red-500 dark:hover:ring-red-500 hover:ring-2 transition-all
      flex flex-col gap-2 h-full text-red-500"
      rounding="2xl"
    >
      <Material rounding="full" padding="sm" color="default" class="w-max">
        <Icon src={Trash} size="24" />
      </Material>
      <span class="font-medium text-lg">
        {$t('routes.profile.delete.title')}
      </span>
    </Material>
  </a>
</div>

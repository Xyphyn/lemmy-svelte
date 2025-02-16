<script lang="ts">
  import { notifications, profile } from '$lib/auth.svelte.js'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
  import { Material, toast } from 'mono-svelte'
  import { getClient } from '$lib/lemmy.svelte.js'
  import type {
    ApproveRegistrationApplication,
    RegistrationApplicationView,
  } from 'lemmy-js-client'
  import { Button } from 'mono-svelte'
  import { Check, Icon, XMark } from 'svelte-hero-icons'
  import RelativeDate from '$lib/components/util/RelativeDate.svelte'
  import { publishedToDate } from '$lib/components/util/date'
  import ApplicationDenyModal from '$lib/components/lemmy/modal/ApplicationDenyModal.svelte'
  import { t } from '$lib/translations'

  interface Props {
    application: RegistrationApplicationView
  }

  let { application = $bindable() }: Props = $props()

  let approving = $state(false)
  let denying = $state(false)
  let denyReason = $state('')
  let reviewing = $state(false)

  async function review(approve: boolean) {
    if (!profile.data?.jwt) return

    let registrationApplicationAnswer: ApproveRegistrationApplication = {
      approve: approve,
      id: application.registration_application.id,
    }

    if (approve) {
      approving = true
    } else {
      reviewing = true
      while (reviewing) {
        await new Promise((res) => setTimeout(res, 1000))
      }
      if (!denying) {
        denyReason = ''
        return
      }
      if (denyReason != '') {
        registrationApplicationAnswer.deny_reason = denyReason
      }
    }

    try {
      await getClient().approveRegistrationApplication(
        registrationApplicationAnswer,
      )
      toast({
        content: approve
          ? $t('toast.approvedApplication')
          : $t('toast.deniedApplication'),
        type: 'success',
      })
      application.creator_local_user.accepted_application = approve
      application.admin = profile.data.user!.local_user_view.person
      application.registration_application.deny_reason = denyReason

      $notifications.applications -= 1
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    approving = false
    denying = false
    denyReason = ''
  }
</script>

{#if reviewing}
  <ApplicationDenyModal
    bind:open={reviewing}
    bind:denying
    bind:denyReason
    user={application.creator}
  />
{/if}
<Material class="flex flex-col gap-2">
  <div class="flex flex-col gap-1">
    <span class="text-slate-600 dark:text-zinc-400">
      <RelativeDate
        date={publishedToDate(application.registration_application.published)}
      />
    </span>

    <SectionTitle>{$t('routes.admin.applications.user')}</SectionTitle>
    <span class="text-sm">
      <UserLink user={application.creator} avatar avatarSize={20} />
    </span>
  </div>
  <div>
    <SectionTitle>Application</SectionTitle>
    <p>{application.registration_application.answer}</p>
  </div>
  <div class="flex flex-col md:flex-row gap-2 md:items-center">
    {#if application.admin}
      {#if typeof application.registration_application.deny_reason !== 'undefined' && application.registration_application.deny_reason !== ''}
        <div>
          <div class="flex items-center gap-1 text-sm">
            <UserLink avatar user={application.admin} />
            <SectionTitle>
              {application.creator_local_user.accepted_application
                ? $t('routes.admin.applications.approved')
                : $t('routes.admin.applications.denied')}
            </SectionTitle>
            <SectionTitle>:</SectionTitle>
          </div>
          <p>{application.registration_application.deny_reason}</p>
        </div>
        <div class="md:ml-auto"></div>
      {:else}
        <div class="flex items-center gap-1 text-sm">
          <UserLink avatar user={application.admin} />
          <SectionTitle>
            {application.creator_local_user.accepted_application
              ? $t('routes.admin.applications.approved')
              : $t('routes.admin.applications.denied')}
          </SectionTitle>
        </div>
        <div class="md:ml-auto"></div>
      {/if}
    {/if}
    <div class="ml-auto self-end">
      <Button
        size="square-md"
        class="hover:bg-slate-200 {application.creator_local_user
          .accepted_application === false && application.admin
          ? '!text-red-500'
          : ''}"
        aria-label={$t('routes.admin.applications.deny')}
        onclick={() => review(false)}
        loading={denying || reviewing}
        disabled={approving || denying || reviewing}
      >
        {#snippet prefix()}
          <Icon src={XMark} mini size="16" />
        {/snippet}
      </Button>
      <Button
        size="square-md"
        class="hover:bg-slate-200 {application.creator_local_user
          .accepted_application
          ? '!text-green-500'
          : ''}"
        title={$t('routes.admin.applications.approve')}
        onclick={() => review(true)}
        loading={approving}
        disabled={approving || denying || reviewing}
      >
        {#snippet prefix()}
          <Icon src={Check} mini size="16" />
        {/snippet}
      </Button>
    </div>
  </div>
</Material>

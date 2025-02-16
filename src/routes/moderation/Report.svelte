<script lang="ts">
  import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import { Material, toast } from 'mono-svelte'
  import { getClient } from '$lib/lemmy.svelte.js'
  import { isCommentReport, isPostReport } from '$lib/lemmy/item.js'
  import type {
    CommentReportView,
    PostReportView,
    PrivateMessageReportView,
  } from 'lemmy-js-client'
  import { Check, CheckCircle, Icon } from 'svelte-hero-icons'
  import { notifications, profile } from '$lib/auth.svelte.js'
  import { Button } from 'mono-svelte'
  import type { ReportView } from '$lib/lemmy/report.js'
  import PrivateMessage from '$lib/components/lemmy/inbox/PrivateMessage.svelte'
  import { t } from '$lib/translations'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

  interface Props {
    item: ReportView
  }

  let { item = $bindable() }: Props = $props()

  let resolving = $state(false)
  async function resolve() {
    if (!profile.data?.jwt || !profile.data.user) return
    resolving = true

    try {
      switch (item.type) {
        case 'comment': {
          const res = await getClient().resolveCommentReport({
            report_id: item.id,
            resolved: !item.resolved,
          })

          item.resolved = res.comment_report_view.comment_report.resolved
          item.resolver = res.comment_report_view.resolver

          toast({
            content: item.resolved
              ? $t('toast.resolveReport')
              : $t('toast.unresolveReport'),
            type: 'success',
          })

          break
        }
        case 'post': {
          const res = await getClient().resolvePostReport({
            report_id: item.id,
            resolved: !item.resolved,
          })

          item.resolved = res.post_report_view.post_report.resolved
          item.resolver = res.post_report_view.resolver
          toast({
            content: item.resolved
              ? $t('toast.resolveReport')
              : $t('toast.unresolveReport'),
            type: 'success',
          })

          break
        }
        case 'message': {
          const res = await getClient().resolvePrivateMessageReport({
            report_id: item.id,
            resolved: !item.resolved,
          })

          item.resolved =
            res.private_message_report_view.private_message_report.resolved

          item.resolver = res.private_message_report_view.resolver

          toast({
            content: item.resolved
              ? $t('toast.resolveReport')
              : $t('toast.unresolveReport'),
            type: 'success',
          })

          break
        }
      }

      $notifications.reports += item.resolved ? 1 : -1
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }

    resolving = false
  }
</script>

<div class="flex flex-row">
  <div class="flex flex-col gap-1.5 flex-1">
    <span class="text-xs font-medium">Report from</span>
    <span class="font-bold">
      <UserLink avatar user={item.creator} />
    </span>
  </div>

  <Button
    onclick={resolve}
    class="h-max self-end {item.resolved
      ? '!text-green-600 dark:!text-green-400'
      : ''}"
    loading={resolving}
    disabled={resolving}
    rounding="pill"
    color="ghost"
  >
    {#snippet prefix()}
      <Icon src={CheckCircle} micro={item.resolved} size="18" />
    {/snippet}
    {!item.resolved
      ? $t('routes.moderation.resolve')
      : $t('routes.moderation.resolved')}
  </Button>
</div>

<Material rounding="xl" color="uniform" class="dark:bg-zinc-950">
  {#if item.type == 'comment'}
    <CommentItem community={true} comment={item.item} class="!p-0" />
  {:else if item.type == 'post'}
    <Post post={item.item} class="!p-0" />
  {:else if item.type == 'message'}
    <PrivateMessage
      message={{
        creator: item.reportee,
        private_message: item.item,
        recipient: item.creator,
      }}
    />
  {/if}
</Material>

<div class="flex flex-row gap-4 items-center flex-wrap">
  <div>
    <SectionTitle small>
      {$t('routes.moderation.reason')}
    </SectionTitle>
    <p>
      {item.reason}
    </p>
  </div>
  {#if item.resolver}
    <div>
      <SectionTitle small>
        {$t('routes.moderation.resolvedBy')}
      </SectionTitle>
      <UserLink avatar user={item.resolver} />
    </div>
  {/if}
</div>

<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { client } from '$lib/lemmy.js'
  import { t } from '$lib/translations.js'
  import { qr } from '@svelte-put/qr/svg'
  import { Button, Material, TextInput, toast } from 'mono-svelte'
  import { ClipboardDocument, Icon } from 'svelte-hero-icons'

  let { data } = $props()

  // @ts-ignore
  let totpLink: string | undefined = $state(undefined)
  let totpEnabled = $state(
    data.my_user?.local_user_view.local_user.totp_2fa_enabled,
  )

  let verify_totp = $state('')

  async function twofa(enabled: boolean, update: boolean = false) {
    try {
      if (update) {
        await client().updateTotp({
          enabled: enabled,
          totp_token: verify_totp,
        })

        toast({
          content: `2FA has been ${enabled ? 'enabled' : 'disabled'}`,
          type: 'success',
        })

        goto($page.url, { invalidateAll: true })
      } else {
        const res = await client().generateTotpSecret()
        totpLink = res.totp_secret_url
        totpEnabled = true
      }
    } catch (e) {
      toast({ content: e as any, type: 'error' })
    }
  }
</script>

<div class="w-full flex flex-col">
  <p class="">
    <span class="font-medium text-lg">
      {totpEnabled ? $t('common.enabled') : $t('common.disabled')}
    </span>
  </p>
  {#if totpEnabled || totpLink}
    {#if totpLink && !totpEnabled}
      <Material color="transparent" class="!fill-white">
        <svg use:qr={{ data: totpLink, logo: '/img/logo-isolated.svg' }} />
      </Material>
      <TextInput
        disabled
        type="password"
        value={totpLink}
        label={$t('form.profile.2fa.totp')}
      >
        {#snippet suffix()}
          <button
            class="contents"
            onclick={() => {
              if (!totpLink) return
              navigator.clipboard?.writeText(totpLink)
              toast({ content: $t('toast.copied') })
            }}
          >
            <Icon src={ClipboardDocument} size="20" mini />
          </button>
        {/snippet}
        <span class="font-normal text-xs">
          {$t('form.profile.2fa.paste')}
        </span>
      </TextInput>
    {/if}
    <form
      class="flex flex-col gap-2 w-full"
      onsubmit={(e) => e.preventDefault()}
    >
      <TextInput
        bind:value={verify_totp}
        placeholder="012345"
        label={$t('form.2fa')}
      />
      {#if totpEnabled}
        <Button onclick={() => twofa(false, true)} size="lg" color="primary">
          {$t('common.disable')}
        </Button>
      {:else}
        <Button onclick={() => twofa(true, true)} size="lg" color="primary">
          {$t('common.enable')}
        </Button>
      {/if}
    </form>
  {:else}
    <Button onclick={() => twofa(true)} size="lg" color="primary">
      {$t('form.setup')}
    </Button>
  {/if}
</div>

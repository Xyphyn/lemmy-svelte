<script lang="ts">
  import { preventDefault } from 'svelte/legacy'

  import { deleteProfile, profile, setUser } from '$lib/auth.svelte'
  import { client } from '$lib/lemmy.svelte'
  import { instance as currentInstance } from '$lib/instance.svelte'
  import { t } from '$lib/translations'
  import { Button, TextInput, toast } from 'mono-svelte'
  import { errorMessage } from '$lib/lemmy/error'

  let oldPassword = $state(''),
    newPassword = $state(''),
    newPasswordVerify = $state('')
  let loading = $state(false)

  async function changePassword() {
    try {
      loading = true
      const res = await client().changePassword({
        new_password: newPassword,
        new_password_verify: newPasswordVerify,
        old_password: oldPassword,
      })
      if (res?.jwt) {
        const { instance, username } = profile.data
        deleteProfile(profile.data.id)
        await setUser(res.jwt, instance, username!)
        $currentInstance = instance

        toast({ content: $t('toast.loginRefresh'), type: 'success' })
      } else {
        throw new Error($t('toast.invalidLogin'))
      }

      toast({ content: $t('toast.passwordReset') })
    } catch (e) {
      toast({
        content: errorMessage(e as any),
        type: 'error',
      })
    }

    loading = false
  }
</script>

<form onsubmit={preventDefault(changePassword)} class="flex flex-col gap-4">
  <TextInput
    bind:value={oldPassword}
    label={$t('form.profile.currentPassword')}
    type="password"
    minlength={10}
    required
  />
  <TextInput
    bind:value={newPassword}
    label={$t('form.profile.newPassword')}
    type="password"
    minlength={10}
    required
  />
  <TextInput
    bind:value={newPasswordVerify}
    label={$t('form.profile.verifyNewPassword')}
    type="password"
    minlength={10}
    required
  />
  <Button
    class="sm:ml-auto"
    size="lg"
    color="primary"
    submit
    {loading}
    disabled={loading}
  >
    {$t('form.submit')}
  </Button>
</form>

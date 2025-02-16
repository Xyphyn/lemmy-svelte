<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { setUser } from '$lib/auth.svelte.js'
  import Markdown from '$lib/components/markdown/Markdown.svelte'
  import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { Checkbox, Material, Spinner, toast } from 'mono-svelte'
  import { getClient } from '$lib/lemmy.svelte.js'
  import type { GetCaptchaResponse } from 'lemmy-js-client'
  import { Button, TextInput } from 'mono-svelte'
  import {
    ArrowPath,
    ExclamationCircle,
    ExclamationTriangle,
    Icon,
    Plus,
    QuestionMarkCircle,
    XCircle,
  } from 'svelte-hero-icons'
  import { instance as currentInstance } from '$lib/instance.svelte.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { t } from '$lib/translations.js'

  let { data } = $props()

  const instance = page.params.instance

  let captchaRequired = data.site_view.local_site.captcha_enabled

  let email: string | undefined = $state('')

  $effect(() => {
    if (email == '') email = undefined
  })

  let username = $state(''),
    password = $state(''),
    passwordVerify = $state(''),
    captcha: GetCaptchaResponse | null = $state(null),
    verifyCaptcha: string | undefined = $state(undefined),
    application: string = $state(''),
    submitting: boolean = $state(false),
    honeypot: string | undefined = $state(undefined),
    nsfw: boolean = $state(false)

  const getCaptcha = async () =>
    (captcha = await getClient(instance, fetch).getCaptcha())

  let captchaAudio = $derived(
    captcha?.ok?.wav ? `data:audio/wav;base64,${captcha.ok.wav}` : '',
  )

  async function submit() {
    submitting = true

    try {
      const res = await getClient(instance, fetch).register({
        username: username,
        email: email,
        password: password,
        password_verify: passwordVerify,
        show_nsfw: nsfw,
        answer: application,
        captcha_answer: verifyCaptcha,
        captcha_uuid: captcha?.ok?.uuid,
        honeypot,
      })

      if (res?.jwt) {
        await setUser(res.jwt, page.params.instance, username)

        toast({ content: $t('toast.logIn'), type: 'success' })
        goto('/')
      } else if (
        res.verify_email_sent ||
        data.site_view.local_site.registration_mode == 'RequireApplication'
      ) {
        if (res.verify_email_sent) {
          toast({
            content: $t('toast.verifyEmail'),
            type: 'info',
          })
        }
        if (
          data.site_view.local_site.registration_mode == 'RequireApplication'
        ) {
          toast({
            content: $t('toast.waitApplication'),
            type: 'info',
          })
        }
        goto('/')
      } else {
        throw new Error($t('toast.failSignup'))
      }

      toast({
        content: $t('toast.successSignup'),
        type: 'success',
      })
    } catch (err) {
      toast({
        content: err as any,
        type: 'error',
      })
    }
    submitting = false
  }
</script>

<svelte:head>
  <title>Sign up</title>
</svelte:head>

<form
  class="flex flex-col gap-4 max-w-2xl mx-auto h-full w-full"
  onsubmit={preventDefault(submit)}
>
  <span class="flex gap-4 items-center font-bold text-xl text-center mx-auto">
    {#if data.site_view.site.icon}
      <Avatar circle={false} width={48} url={data.site_view.site.icon} />
    {/if}
    {data.site_view.site.name}
  </span>

  {#if data.site_view.local_site.registration_mode != 'Closed'}
    <Header>{$t('form.signup.title')}</Header>
    <TextInput
      bind:value={email}
      label={$t('form.email')}
      required={data.site_view.local_site.require_email_verification}
      type="email"
    />
    <TextInput bind:value={username} label={$t('form.username')} required />
    <TextInput
      bind:value={password}
      label={$t('form.password')}
      required
      type="password"
    />
    <TextInput
      bind:value={passwordVerify}
      label={$t('form.confirmPassword')}
      required
      type="password"
    />
    {#if data.site_view.local_site.registration_mode == 'RequireApplication'}
      <Material class="dark:text-yellow-200 text-yellow-800 bg-yellow-500/20">
        <Icon src={ExclamationTriangle} mini size="20" />
        {$t('form.signup.application.info')}
      </Material>
      {#if data.site_view.local_site.application_question}
        <Markdown source={data.site_view.local_site.application_question} />
      {/if}
      <MarkdownEditor
        label={$t('form.signup.application.label')}
        required
        bind:value={application}
      />
    {/if}
    {#if captchaRequired}
      <div>
        <div class="block my-1 font-bold text-sm">Captcha</div>
        <div class="flex flex-col gap-4">
          {#await getCaptcha()}
            <Spinner width={32} />
          {:then}
            {#if captcha?.ok}
              <img
                src="data:image/png;base64,{captcha.ok.png}"
                alt="Captcha"
                class="w-max"
              />
              <audio controls src={captchaAudio}></audio>
            {:else}
              <Material
                class="flex gap-2 dark:text-yellow-200 text-yellow-800 bg-yellow-500/20"
              >
                <Icon src={QuestionMarkCircle} mini size="24" />
                No captcha was returned
              </Material>
            {/if}
          {:catch err}
            <Material
              padding="sm"
              class="flex gap-2 dark:text-yellow-200 text-yellow-800 bg-yellow-500/20"
            >
              <Icon src={ExclamationCircle} mini size="24" />
              {err}
            </Material>
          {/await}
          <Button onclick={() => getCaptcha()} size="square-md">
            <Icon src={ArrowPath} size="16" mini />
          </Button>
          <TextInput required bind:value={verifyCaptcha} />
        </div>
      </div>
    {/if}
    <Checkbox bind:checked={nsfw}>{$t('form.profile.showNSFW')}</Checkbox>
    <input type="dn" name="honeypot" bind:value={honeypot} class="hidden" />
    <Button
      submit
      color="primary"
      size="lg"
      loading={submitting}
      disabled={submitting}
      class="mt-auto"
    >
      {$t('form.submit')}
    </Button>
  {:else}
    <div class="my-auto">
      <Placeholder
        icon={XCircle}
        title={$t('form.signup.closed.title')}
        description={$t('form.signup.closed.description')}
      >
        <Button icon={Plus} href="/signup">
          {$t('form.signup.closed.anotherInstance')}
        </Button>
      </Placeholder>
    </div>
  {/if}
</form>

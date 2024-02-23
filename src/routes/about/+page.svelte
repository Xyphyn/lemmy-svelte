<script>
  import Link from '$lib/components/input/Link.svelte'
  import Logo from '$lib/components/ui/Logo.svelte'
  import Profile from './Profile.svelte'
</script>

<div class="max-w-xl mx-auto">
  <div class="flex items-center gap-1 mx-auto w-max">
    <Logo width={48} />
    <span class="text-2xl font-bold">Photon</span>
  </div>
  <h1 class="text-2xl font-bold leading-8">About</h1>
  <p class="my-3">
    <strong>Photon</strong>
    is a client for
    <a href="https://join-lemmy.org" class="underline">Lemmy</a>
    that is meant to replace the default lemmy-ui.
  </p>
  <p class="my-3">
    It's named that because some random person in a Discord server said that
    would be a good name. Great choice, I know.
  </p>
  <h1 class="text-2xl font-bold leading-8">Links</h1>
  <ul class="list-disc pl-4 my-3">
    <li>
      <Link highlight href="https://github.com/Xyphyn/photon">Github</Link>
    </li>
    <li>
      <Link
        highlight
        href="https://photon.xylight.dev/c/photon@lemmy.xylight.dev"
      >
        Community
      </Link>
    </li>
    <li>
      <Link href="https://xylight.dev" highlight>Xylight's portfolio</Link>
    </li>
    <li>
      <Link href="https://buymeacoffee.com/xylight" highlight>Donate</Link>
    </li>
  </ul>
  <h1 class="text-2xl font-bold leading-8">Credits</h1>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Profile
      avatar="https://avatars.githubusercontent.com/u/80978739?v=4"
      description="Main developer"
      name="Xylight"
      class="sm:col-span-3 place-self-center"
      link="https://xylight.dev"
    />
    <hr class="border-slate-200 dark:border-zinc-800 w-full sm:col-span-3" />
    <Profile
      description="Early contributor"
      name="pbui"
      link="https://github.com/pbui"
    />
    <Profile
      description="Early supporter"
      name="iJeff of lemdro.id"
      link="https://lemdro.id/u/ijeff"
    />
    <Profile
      description="Early contributor"
      name="Cole of lemdro.id"
      link="https://lemdro.id/u/cole"
    />
    <Profile
      description="Big supporter"
      name="lemmy.world team"
      link="https://lemmy.world"
    />
    <Profile description="Massive donator" name="rooki" />
    <Profile description="Programming help" name="Sheodox" />
    <Profile description="Design inspiration" name="ljdawson" />
  </div>
  <div class="mt-4">
    If you've contributed in any way and aren't mentioned here, please let me
    know and I'll add you here ASAP.
  </div>
</div>

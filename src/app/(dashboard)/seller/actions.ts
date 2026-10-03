'use server'

import { redirect } from 'next/navigation'

export async function signOutAction() {
  // Cache-bust the post-logout landing URL so no cache layer (browser, SW,
  // Cloudflare) can replay a stale HTML/RSC payload after logout.
  const target = `/en?logout=1&t=${Date.now()}`;
  redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent(target)}`);
}

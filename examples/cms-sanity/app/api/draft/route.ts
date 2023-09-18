import { urlSecretId, token } from '@/lib/env'
import { client } from '@/lib/client'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { isValidSecret } from 'sanity-plugin-iframe-pane/is-valid-secret'
import { resolveHref } from '@/lib/links'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const documentType = searchParams.get('type')

  if (!token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required.',
    )
  }
  if (!secret) {
    return new Response('Invalid secret', { status: 401 })
  }

  const authenticatedClient = client.withConfig({ token })
  const validSecret = await isValidSecret(
    authenticatedClient,
    urlSecretId,
    secret,
  )
  if (!validSecret) {
    return new Response('Invalid secret', { status: 401 })
  }

  const href = resolveHref(documentType!, slug!)
  if (!href) {
    return new Response(
      'Unable to resolve preview URL based on the current document type and slug',
      { status: 400 },
    )
  }

  draftMode().enable()

  redirect(href)
}

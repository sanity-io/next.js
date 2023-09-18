/* eslint-disable no-process-env */
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

// Triggers a revalidation of the static data in the example above
export async function POST(req: NextRequest): Promise<any> {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string
      _id: string
      slug?: string | undefined
    }>(req, process.env.SANITY_REVALIDATE_SECRET)
    if (!isValidSignature) {
      const message = 'Invalid signature'
      return new Response(message, { status: 401 })
    }

    if (!body?._type) {
      return new Response('Bad Request', { status: 400 })
    }

    revalidateTag(body._type)
    if (body.slug && typeof body.slug === 'string') {
      revalidateTag(`${body._type}:${body.slug}`)
    }
    return NextResponse.json({ revalidated: true, now: Date.now(), body })
  } catch (err: any) {
    console.error(err)
    return new Response(err.message, { status: 500 })
  }
}

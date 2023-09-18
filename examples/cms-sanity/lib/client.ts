import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, revalidateSecret } from './env'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  // If the GROQ revalidate hook is setup we use the Vercel Data Cache to handle on-demand revalidation, and the Sanity API CDN if not
  useCdn: revalidateSecret ? false : true,
  perspective: 'published',
  // Setting the `studioUrl` enables Vercel Visual Editing, if the
  // Sanity Project has access to Content Source Maps
  studioUrl: '/studio',
})

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...index]]/page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import {
  Iframe,
  type IframeOptions,
  defineUrlResolver,
} from 'sanity-plugin-iframe-pane'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId, urlSecretId } from './lib/env'
import { types } from './lib/sanity/schema'

const iframeOptions = {
  url: defineUrlResolver({ base: '/api/draft' }),
  urlSecretId,
  reload: { button: true, revision: true, postMessage: true },
} satisfies IframeOptions

const config = defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './src/sanity/schema' folder
  schema: { types },
  plugins: [
    deskTool({
      // `defaultDocumentNode` is responsible for adding a Preview to the document pane
      defaultDocumentNode: (S) =>
        S.document().views([
          S.view.form(),
          S.view.component(Iframe).options(iframeOptions).title('Preview'),
        ]),
    }),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    // Vision is a tool that lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
export default config

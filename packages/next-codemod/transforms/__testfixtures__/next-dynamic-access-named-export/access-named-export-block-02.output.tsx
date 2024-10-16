import type { JSX } from 'react'
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(
  () => import('./component').then(mod => {
    return {
      default: mod.default
    };
  })
)

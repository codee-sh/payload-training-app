import { PayloadSDK } from '@payloadcms/sdk'
import type { Config } from '@/payload-types'

export const sdk = new PayloadSDK<Config>({
  baseURL: '/api',
  baseInit: { credentials: 'include' },
})

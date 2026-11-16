import axios from 'axios'

import { env } from '@/core/env'

export const refreshHttp = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
})

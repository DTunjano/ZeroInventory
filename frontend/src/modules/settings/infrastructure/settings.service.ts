import { http } from '@/infrastructure/http/http'
import type {
  UserSettings,
  UpdateSettingsInput,
  UpdatePasswordInput,
} from '../domain/settings.models'

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const { data } = await http.get<UserSettings>('/settings')
    return data
  },

  async updateSettings(input: UpdateSettingsInput): Promise<{ message: string }> {
    const { data } = await http.put<{ message: string }>('/settings', input)
    return data
  },

  async updatePassword(input: UpdatePasswordInput): Promise<{ message: string }> {
    const { data } = await http.patch<{ message: string }>('/settings/password', input)
    return data
  },
}

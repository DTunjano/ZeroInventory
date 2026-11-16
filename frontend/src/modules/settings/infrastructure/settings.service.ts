import { http } from '@/infrastructure/http/http'
import type {
  UserSettings,
  Theme,
  UpdateGeneralSettingsInput,
  UpdatePasswordInput,
  UpdateAppearanceInput,
} from '../domain/settings.models'

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const { data } = await http.get<UserSettings>('/settings')
    return data
  },

  async getAppearance(): Promise<{ theme: Theme }> {
    const { data } = await http.get<{ theme: Theme }>('/settings/appearance')
    return data
  },

  async updateSettings(input: UpdateGeneralSettingsInput): Promise<{ message: string }> {
    const { data } = await http.put<{ message: string }>('/settings', input)
    return data
  },

  async updateAppearance(input: UpdateAppearanceInput): Promise<{ message: string }> {
    const { data } = await http.patch<{ message: string }>('/settings/appearance', input)
    return data
  },

  async updatePassword(input: UpdatePasswordInput): Promise<{ message: string }> {
    const { data } = await http.patch<{ message: string }>('/settings/password', input)
    return data
  },
}

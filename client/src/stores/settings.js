import { defineStore } from 'pinia'
import { useSocketStore } from './socket'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    username: '',
    mood: {
      type: 'casual',
      tags: [],
      subject: '',
    },
    preferences: {
      language: 'any',
      skillLevel: 'any',
    }
  }),

  actions: {
    setUsername(username) {
      this.username = username
      // Notify socket about username change
      const socketStore = useSocketStore()
      socketStore.updateUserInfo({ 
        username,
        type: 'username_update'
      })
    },

    setMood(type, tags = [], subject = '') {
      this.mood = {
        type,
        tags,
        subject
      }
      // Notify socket about mood change
      const socketStore = useSocketStore()
      socketStore.updateUserInfo({ 
        mood: this.mood,
        type: 'mood_update'
      })
    },

    setPreferences(preferences) {
      this.preferences = {
        ...this.preferences,
        ...preferences
      }
      // Notify socket about preferences change
      const socketStore = useSocketStore()
      socketStore.updateUserInfo({ 
        preferences: this.preferences,
        type: 'preferences_update'
      })
    },

    // New method to update all settings at once
    updateAllSettings(settings) {
      if (settings.username) this.username = settings.username
      if (settings.mood) this.mood = settings.mood
      if (settings.preferences) this.preferences = settings.preferences

      const socketStore = useSocketStore()
      socketStore.updateUserInfo({
        ...settings,
        type: 'settings_update'
      })
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user-settings',
        storage: localStorage,
      }
    ]
  }
}) 
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    mood: {
      type: 'casual', // casual, language, study, interview, cultural, gaming, music, tech, art, fitness, business
      tags: [], // specific interests within the mood
      subject: '', // specific subject/topic within the mood type
    },
    preferences: {
      language: 'any',
      skillLevel: 'any', // beginner, intermediate, advanced
    }
  }),

  actions: {
    setMood(type, tags = [], subject = '') {
      this.mood.type = type
      this.mood.tags = tags
      this.mood.subject = subject
    },

    setPreferences(preferences) {
      this.preferences = {
        ...this.preferences,
        ...preferences
      }
    }
  }
}) 
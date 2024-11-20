// Mood Types
export const MOOD_TYPES = {
  LANGUAGE: 'language',
  STUDY: 'study',
  CULTURAL: 'cultural',
  TECH: 'tech',
  ARTS: 'arts',
  BUSINESS: 'business',
  INTERVIEW: 'interview',
  GAMING: 'gaming',
  FITNESS: 'fitness',
  TRAVEL: 'travel',
  CASUAL: 'casual',
  FOOD: 'food'
}

// Mood Configurations
export const MOOD_CONFIG = {
  [MOOD_TYPES.LANGUAGE]: {
    emoji: '🗣️',
    color: 'blue',
    tags: ['practice', 'learn'],
    name: 'Language Exchange'
  },
  [MOOD_TYPES.STUDY]: {
    emoji: '📚',
    color: 'purple',
    tags: ['academic', 'learn'],
    name: 'Study Buddy'
  },
  [MOOD_TYPES.CULTURAL]: {
    emoji: '🌍',
    color: 'red',
    tags: ['traditions', 'exchange'],
    name: 'Cultural Exchange'
  },
  [MOOD_TYPES.TECH]: {
    emoji: '💻',
    color: 'emerald',
    tags: ['coding', 'development'],
    name: 'Tech Talk'
  },
  [MOOD_TYPES.ARTS]: {
    emoji: '🎨',
    color: 'pink',
    tags: ['music', 'visual', 'performance'],
    name: 'Arts & Music'
  },
  [MOOD_TYPES.BUSINESS]: {
    emoji: '💼',
    color: 'yellow',
    tags: ['networking', 'entrepreneurship'],
    name: 'Business'
  },
  [MOOD_TYPES.INTERVIEW]: {
    emoji: '👔',
    color: 'indigo',
    tags: ['practice', 'professional'],
    name: 'Interview Prep'
  },
  [MOOD_TYPES.GAMING]: {
    emoji: '🎮',
    color: 'violet',
    tags: ['games', 'esports'],
    name: 'Gaming'
  },
  [MOOD_TYPES.FITNESS]: {
    emoji: '💪',
    color: 'green',
    tags: ['workout', 'health'],
    name: 'Fitness'
  },
  [MOOD_TYPES.TRAVEL]: {
    emoji: '✈️',
    color: 'cyan',
    tags: ['adventure', 'exploration'],
    name: 'Travel Talk'
  },
  [MOOD_TYPES.CASUAL]: {
    emoji: '☕',
    color: 'orange',
    tags: ['friendly', 'relaxed'],
    name: 'Casual Chat'
  },
  [MOOD_TYPES.FOOD]: {
    emoji: '🍳',
    color: 'rose',
    tags: ['cooking', 'cuisine'],
    name: 'Food & Cooking'
  }
}

// Utility Functions
export const moodUtils = {
  getMoodEmoji: (type) => {
    return MOOD_CONFIG[type]?.emoji || '🎯'
  },

  getMoodName: (type) => {
    return MOOD_CONFIG[type]?.name || type.charAt(0).toUpperCase() + type.slice(1)
  },

  getMoodColor: (type) => {
    const color = MOOD_CONFIG[type]?.color || 'gray'
    return `bg-${color}-500/20 ring-2 ring-${color}-500`
  },

  getMoodTags: (type) => {
    return MOOD_CONFIG[type]?.tags || []
  },

  // Get recommended skill levels based on mood type
  getRecommendedSkillLevels: (type) => {
    switch (type) {
      case MOOD_TYPES.LANGUAGE:
      case MOOD_TYPES.TECH:
      case MOOD_TYPES.ARTS:
        return ['beginner', 'intermediate', 'advanced']
      case MOOD_TYPES.INTERVIEW:
      case MOOD_TYPES.BUSINESS:
        return ['intermediate', 'advanced']
      default:
        return ['any']
    }
  },

  // Get available languages based on mood type
  getAvailableLanguages: (type) => {
    const commonLanguages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' }
    ]

    switch (type) {
      case MOOD_TYPES.LANGUAGE:
        return commonLanguages
      case MOOD_TYPES.BUSINESS:
      case MOOD_TYPES.TECH:
        return [
          { code: 'en', name: 'English' },
          { code: 'zh', name: 'Chinese' }
        ]
      default:
        return [{ code: 'any', name: 'Any Language' }, ...commonLanguages]
    }
  },

  // Get topics based on mood type
  getTopics: (type) => {
    return MOOD_CONFIG[type]?.tags.map(tag => ({
      id: tag,
      name: tag.charAt(0).toUpperCase() + tag.slice(1)
    })) || []
  },

  // Check if two moods are compatible
  areMoodsCompatible: (mood1, mood2) => {
    if (mood1.type === mood2.type) return true
    if (mood1.type === MOOD_TYPES.CASUAL || mood2.type === MOOD_TYPES.CASUAL) return true
    
    // Check for related moods
    const relatedMoods = {
      [MOOD_TYPES.TECH]: [MOOD_TYPES.STUDY, MOOD_TYPES.BUSINESS],
      [MOOD_TYPES.ARTS]: [MOOD_TYPES.CULTURAL],
      [MOOD_TYPES.BUSINESS]: [MOOD_TYPES.INTERVIEW, MOOD_TYPES.TECH],
      [MOOD_TYPES.CULTURAL]: [MOOD_TYPES.FOOD, MOOD_TYPES.TRAVEL, MOOD_TYPES.ARTS]
    }

    return relatedMoods[mood1.type]?.includes(mood2.type) || 
           relatedMoods[mood2.type]?.includes(mood1.type)
  }
}

// Export a function to initialize a new mood
export const createMood = (type, additionalTags = []) => {
  const baseTags = MOOD_CONFIG[type]?.tags || []
  return {
    type,
    tags: [...new Set([...baseTags, ...additionalTags])],
    subject: ''
  } 
}
const adjectives = [
  'Happy', 'Clever', 'Bright', 'Swift', 'Kind', 'Brave', 'Calm', 'Wise', 
  'Quick', 'Cool', 'Fresh', 'Warm', 'Sharp', 'Smart', 'Bold'
]

const nouns = [
  'Panda', 'Fox', 'Eagle', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Hawk', 
  'Dolphin', 'Owl', 'Cat', 'Dog', 'Bird', 'Star', 'Moon'
]

export const generateRandomUsername = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 1000)
  return `${adjective}${noun}${number}`
} 
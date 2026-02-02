/**
 * User Identity Management
 * Generates and persists anonymous user identifiers
 */

const USER_ID_KEY = 'vitanova_user_id'
const USER_ID_VERSION = 'v1'

export interface UserIdentity {
  userId: string
  version: string
  createdAt: string
}

/**
 * Get or create anonymous user identifier
 * Uses localStorage for persistence across sessions
 */
export function getUserIdentifier(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    const stored = localStorage.getItem(USER_ID_KEY)
    
    if (stored) {
      const identity: UserIdentity = JSON.parse(stored)
      
      // Validate structure
      if (identity.userId && identity.version === USER_ID_VERSION) {
        return identity.userId
      }
    }

    // Generate new identifier
    const newIdentity: UserIdentity = {
      userId: crypto.randomUUID(),
      version: USER_ID_VERSION,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(USER_ID_KEY, JSON.stringify(newIdentity))
    return newIdentity.userId
  } catch (error) {
    console.error('Error managing user identity:', error)
    // Fallback to session-only identifier
    return crypto.randomUUID()
  }
}

/**
 * Clear user identity (for testing or reset)
 */
export function clearUserIdentifier(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(USER_ID_KEY)
  } catch (error) {
    console.error('Error clearing user identity:', error)
  }
}

/**
 * Get full identity object
 */
export function getUserIdentity(): UserIdentity | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(USER_ID_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error retrieving user identity:', error)
    return null
  }
}

import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'fallback-key-for-development-only'
const ALGORITHM = 'aes-256-gcm'

export interface EncryptedData {
  encryptedToken: string
  iv: string
  tag: string
}

export function encryptToken(token: string): EncryptedData {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  return {
    encryptedToken: encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  }
}

export function decryptToken(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format')
    }
    
    const [encrypted, iv, tag] = parts
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Token decryption failed:', error)
    throw new Error('Failed to decrypt GitHub token')
  }
}

export function formatEncryptedToken(data: EncryptedData): string {
  return `${data.encryptedToken}:${data.iv}:${data.tag}` 
}

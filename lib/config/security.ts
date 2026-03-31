export const securityConfig = {
  // Token encryption
  tokenEncryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
  },
  
  // Rate limiting
  rateLimits: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 100,
    },
    webhook: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: process.env.NODE_ENV === 'development' ? 500 : 50,
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    },
  },
  
  // Request limits
  maxBodySize: 10 * 1024 * 1024, // 10MB
  maxUrlLength: 2048,
  
  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000'] 
      : [process.env.NEXT_PUBLIC_APP_URL || ''],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },
}

export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GROQ_API_KEY',
    'TOKEN_ENCRYPTION_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  // Validate token encryption key length
  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY
  if (encryptionKey && encryptionKey.length < 32) {
    console.warn('⚠️ TOKEN_ENCRYPTION_KEY should be at least 32 characters for security')
  }
  
  console.log('✅ Environment validation passed')
}

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const title = searchParams.get('title') || 'Fixr'
    const description = searchParams.get('description') || 'AI-Powered CI/CD Pipeline Monitor'
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050508',
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)
            `,
            fontSize: 48,
            fontWeight: 700,
            color: 'white',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              marginBottom: 24,
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
            }}
          >
            F
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: 16,
              background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
              maxWidth: '80%',
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              textAlign: 'center',
              color: '#94a3b8',
              marginBottom: 32,
              maxWidth: '70%',
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: 8,
                fontSize: 16,
                color: '#06b6d4',
              }}
            >
              AI-Powered
            </div>
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: 8,
                fontSize: 16,
                color: '#8b5cf6',
              }}
            >
              Auto-Fix
            </div>
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: 8,
                fontSize: 16,
                color: '#ec4899',
              }}
            >
              Real-time
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: 16,
              color: '#64748b',
              position: 'absolute',
              bottom: 40,
            }}
          >
            fixr.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}

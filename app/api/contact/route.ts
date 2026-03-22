import { NextRequest } from 'next/server'
import { secureAPIRoute } from '@/lib/middleware/security'
import { apiRateLimit } from '@/lib/middleware/rate-limit'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  subject: z.enum(['bug', 'feature', 'security', 'account', 'general']),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

const contactHandler = secureAPIRoute(
  async (req: NextRequest) => {
    try {
      const body = await req.json()
      
      // Validate input
      const result = contactSchema.safeParse(body)
      if (!result.success) {
        return Response.json(
          { error: 'Validation failed', details: result.error.flatten() },
          { status: 400 }
        )
      }
      
      const data: ContactFormData = result.data
      
      // In production, send email via Resend or similar service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send email via Resend
        // await sendEmailViaResend(data)
        console.log('Contact form submission:', data)
      } else {
        // Development: Just log
        console.log('Contact form submission (dev):', data)
      }
      
      // Log the contact submission
      console.log('Contact form received:', {
        from: data.email,
        subject: data.subject,
        timestamp: new Date().toISOString(),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      })
      
      return Response.json({ 
        success: true, 
        message: 'Message sent successfully' 
      })
      
    } catch (error) {
      console.error('Contact form error:', error)
      return Response.json(
        { error: 'Failed to send message' }, 
        { status: 500 }
      )
    }
  },
  {
    requireAuth: false, // Allow contact from non-authenticated users
    rateLimit: apiRateLimit,
    validateContentType: true,
    maxBodySize: 50 * 1024, // 50KB limit
  }
)

// Helper function for sending email via Resend (when you set it up)
async function sendEmailViaResend(data: ContactFormData) {
  // Example implementation
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // 
  // await resend.emails.send({
  //   from: 'contact@fixr.ai',
  //   to: 'support@fixr.ai',
  //   subject: `[${data.subject.toUpperCase()}] Contact from ${data.name}`,
  //   html: `
  //     <h2>New Contact Form Submission</h2>
  //     <p><strong>From:</strong> ${data.name} (${data.email})</p>
  //     <p><strong>Subject:</strong> ${data.subject}</p>
  //     <p><strong>Message:</strong></p>
  //     <p>${data.message}</p>
  //   `,
  // })
}

export { contactHandler as POST }

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { db, users } from '@/lib/db'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error: Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    try {
      await db.insert(users).values({
        clerkId: evt.data.id,
        email: evt.data.email_addresses?.[0]?.email_address || '',
        githubUsername: evt.data.external_accounts?.find((acc: any) => acc.provider === 'github')?.username,
      })
      console.log('User created in database:', evt.data.id)
    } catch (error) {
      console.error('Error creating user in database:', error)
    }
  }

  return new Response('', { status: 200 })
}

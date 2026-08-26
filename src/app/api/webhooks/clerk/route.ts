import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  // You will get this secret from your Clerk Dashboard later
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, it's a fake request. Block it.
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the actual data Clerk sent us
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload is actually from Clerk
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // THE MAGIC HAPPENS HERE:
  const eventType = evt.type

  // If a new user just signed up...
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    // Grab their primary email
    const primaryEmail = email_addresses[0]?.email_address?.toLowerCase()?.trim()
    if (!primaryEmail) {
      return new Response('No email address provided', { status: 400 })
    }

    // Check if user already exists by email (with different ID, e.g. guest checkout user)
    const existingUser = await prisma.user.findUnique({
      where: { email: primaryEmail }
    });

    if (existingUser) {
      if (existingUser.id === id) {
        console.log(`User already exists with exact matching ID: ${primaryEmail}`);
        return new Response('', { status: 200 });
      }

      // If previous user was a guest or previous instance, transfer orders and reviews safely
      await prisma.$transaction(async (tx) => {
        // 1. Temporarily release unique email constraint on the old user record
        await tx.user.update({
          where: { id: existingUser.id },
          data: { email: `${primaryEmail}_old_${Date.now()}` }
        });

        // 2. Create the new official Clerk user record
        await tx.user.create({
          data: {
            id: id,
            email: primaryEmail,
            firstName: first_name || existingUser.firstName || '',
            lastName: last_name || existingUser.lastName || '',
            phone: existingUser.phone || null
          }
        });

        // 3. Reassign orders & reviews to new Clerk user ID
        await tx.order.updateMany({
          where: { userId: existingUser.id },
          data: { userId: id }
        });

        await tx.review.updateMany({
          where: { userId: existingUser.id },
          data: { userId: id }
        });

        // 4. Clean up old cart and old user placeholder
        await tx.cartItem.deleteMany({ where: { userId: existingUser.id } });
        await tx.user.delete({ where: { id: existingUser.id } });
      });

      console.log(`Successfully migrated user history from guest to Clerk account: ${primaryEmail}`);
      return new Response('', { status: 200 });
    }

    // Tell Prisma to create a permanent row for them in our Database
    await prisma.user.create({
      data: {
        id: id, // We use the Clerk ID so they match perfectly!
        email: primaryEmail,
        firstName: first_name || '',
        lastName: last_name || '',
      },
    })
    
    console.log(`Successfully created user vault for: ${primaryEmail}`)
  }

  return new Response('', { status: 200 })
}
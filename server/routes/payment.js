import { Router } from 'express'
import Stripe from 'stripe'
import { verifyAuth, supabaseAdmin } from '../middleware/auth.js'

const router = Router()

let stripe = null
function getStripe() {
    if (!stripe) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    }
    return stripe
}

// Create Stripe Checkout session for Pro plan
router.post('/create-checkout-session', verifyAuth, async (req, res) => {
    try {
        const userId = req.user.id
        const userEmail = req.user.email

        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: userEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: 'ContractAI Pro',
                            description: 'Unlimited contract analyses, full reports, PDF downloads, and priority support',
                        },
                        unit_amount: 29900, // ₹299.00 in paise
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
            },
            billing_address_collection: 'auto',
            phone_number_collection: { enabled: false },
            payment_method_options: {
                card: {
                    request_three_d_secure: 'automatic',
                },
            },
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?payment=success`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?payment=cancelled`,
        })

        // Save transaction record
        const admin = supabaseAdmin()
        if (admin) {
            await admin.from('transactions').insert({
                user_id: userId,
                stripe_session_id: session.id,
                amount: 29900,
                currency: 'inr',
                status: 'pending',
            })
        }

        res.json({ url: session.url })
    } catch (err) {
        console.error('Checkout error:', err)
        res.status(500).json({ error: 'Failed to create checkout session' })
    }
})

// Stripe Webhook handler
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event

    try {
        event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret)
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object
            const userId = session.metadata?.userId

            if (userId) {
                // Upgrade user to Pro
                const admin = supabaseAdmin()
                if (admin) {
                    await admin
                        .from('profiles')
                        .update({ plan: 'pro' })
                        .eq('id', userId)

                    // Update transaction status
                    await admin
                        .from('transactions')
                        .update({ status: 'completed' })
                        .eq('stripe_session_id', session.id)
                }

                console.log(`✅ User ${userId} upgraded to Pro`)
            }
            break
        }

        case 'customer.subscription.deleted': {
            // Handle subscription cancellation
            const subscription = event.data.object
            const customerEmail = subscription.customer_email

            if (customerEmail) {
                // Find user by email and downgrade
                const whAdmin = supabaseAdmin()
                const { data: profiles } = await whAdmin
                    .from('profiles')
                    .select('id')
                    .eq('email', customerEmail)

                if (profiles && profiles.length > 0) {
                    await whAdmin
                        .from('profiles')
                        .update({ plan: 'free' })
                        .eq('id', profiles[0].id)

                    console.log(`⚠️ User ${profiles[0].id} downgraded to Free (subscription cancelled)`)
                }
            }
            break
        }

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
})

export default router

import { createClient } from '@supabase/supabase-js'

// Admin client for server-side operations (lazy init)
let supabaseAdmin = null

function getSupabaseAdmin() {
    if (!supabaseAdmin) {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

        if (!supabaseUrl || supabaseUrl.includes('your') || !supabaseServiceKey || supabaseServiceKey.includes('your')) {
            return null
        }
        supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    }
    return supabaseAdmin
}

export async function verifyAuth(req, res, next) {
    const admin = getSupabaseAdmin()
    if (!admin) {
        return res.status(503).json({ error: 'Supabase is not configured. Please add your Supabase keys to .env' })
    }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authorization header' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const { data: { user }, error } = await admin.auth.getUser(token)
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' })
        }
        req.user = user
        req.supabase = admin
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Authentication failed' })
    }
}

export { getSupabaseAdmin as supabaseAdmin }

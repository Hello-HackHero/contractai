import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load env vars BEFORE any other imports that need them
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

// Now dynamically import routes (so env vars are available)
const { default: express } = await import('express')
const { default: cors } = await import('cors')
const { default: analyzeRouter } = await import('./routes/analyze.js')
const { default: reportRouter } = await import('./routes/report.js')
const { default: chatRouter } = await import('./routes/chat.js')

const app = express()
const PORT = process.env.PORT || 3001

// Stripe webhook needs raw body — must be before express.json()
app.use('/api/webhook', express.raw({ type: 'application/json' }))

// Standard middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Routes
app.use('/api', analyzeRouter)
app.use('/api', reportRouter)
app.use('/api', chatRouter)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Production static serving
if (process.env.NODE_ENV === 'production') {
    const __dirname = dirname(fileURLToPath(import.meta.url))
    app.use(express.static(join(__dirname, '../client/dist')))
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, '../client/dist/index.html'))
    })
}

app.listen(PORT, () => {
    console.log(`🚀 ContractAI server running on port ${PORT}`)
})

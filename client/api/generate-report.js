import { createClient } from '@supabase/supabase-js'
import PDFDocument from 'pdfkit'

function getSupabase() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase env vars')
    return createClient(url, key)
}

async function verifyAuth(req) {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw { status: 401, message: 'Missing authorization header' }
    }
    const token = authHeader.split(' ')[1]
    const supabase = getSupabase()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) throw { status: 401, message: 'Invalid token' }
    return { user, supabase }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { user, supabase } = await verifyAuth(req)
        const userId = user.id
        const { contractId } = req.body

        // Verify Pro subscription
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription')
            .eq('id', userId)
            .single()

        if (profile?.subscription !== 'pro') {
            return res.status(403).json({ error: 'PDF reports are available for Pro users only' })
        }

        // Fetch contract
        const { data: contract } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', contractId)
            .eq('user_id', userId)
            .single()

        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' })
        }

        const analysis = contract.analysis_result || {}

        // Generate PDF
        const doc = new PDFDocument({ margin: 50 })

        // Collect PDF chunks
        const chunks = []
        doc.on('data', (chunk) => chunks.push(chunk))

        const pdfComplete = new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)))
        })

        // Header
        doc.fontSize(24).fillColor('#2563EB').text('SamvidAI', { align: 'center' })
        doc.fontSize(10).fillColor('#666').text('AI-Powered Contract Analysis Report', { align: 'center' })
        doc.moveDown()
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E5E7EB').stroke()
        doc.moveDown()

        // File info
        doc.fontSize(12).fillColor('#1F2937')
            .text(`File: ${contract.file_name}`)
            .text(`Analyzed: ${new Date(contract.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`)
        doc.moveDown()

        // Risk Score
        const riskColor = contract.risk_score < 40 ? '#10B981' : contract.risk_score < 70 ? '#F59E0B' : '#EF4444'
        const riskLabel = contract.risk_score < 40 ? 'Low Risk' : contract.risk_score < 70 ? 'Medium Risk' : 'High Risk'
        doc.fontSize(16).fillColor('#1F2937').text('Risk Score')
        doc.fontSize(32).fillColor(riskColor).text(`${contract.risk_score}/100`)
        doc.fontSize(12).fillColor(riskColor).text(riskLabel)
        doc.moveDown()

        // Summary
        doc.fontSize(16).fillColor('#1F2937').text('Summary')
        doc.moveDown(0.5)
        doc.fontSize(11).fillColor('#4B5563')
            .text(analysis.simplified_summary || analysis.summary || 'No summary available.', { lineGap: 4 })
        doc.moveDown()

        // Risky Clauses
        const clauses = analysis.risky_clauses || []
        if (clauses.length > 0) {
            doc.fontSize(16).fillColor('#1F2937').text('Risky Clauses')
            doc.moveDown(0.5)
            clauses.forEach((clause, i) => {
                doc.fontSize(12).fillColor('#EF4444').text(`${i + 1}. ${clause.title || 'Risky Clause'}`)
                doc.fontSize(10).fillColor('#4B5563').text(clause.description || clause.text || '', { lineGap: 3 })
                if (clause.severity) {
                    doc.fontSize(9).fillColor(
                        clause.severity === 'high' ? '#EF4444' : clause.severity === 'medium' ? '#F59E0B' : '#10B981'
                    ).text(`Severity: ${clause.severity.toUpperCase()}`)
                }
                doc.moveDown(0.5)
            })
        }

        // Alternatives
        const alts = analysis.alternatives || []
        if (alts.length > 0) {
            doc.addPage()
            doc.fontSize(16).fillColor('#1F2937').text('Safer Alternatives')
            doc.moveDown(0.5)
            alts.forEach((alt, i) => {
                doc.fontSize(12).fillColor('#2563EB').text(`${i + 1}. ${alt.title || 'Alternative'}`)
                if (alt.original) {
                    doc.fontSize(9).fillColor('#EF4444').text('Original:')
                    doc.fontSize(10).fillColor('#4B5563').text(alt.original, { lineGap: 2 })
                }
                if (alt.suggested) {
                    doc.fontSize(9).fillColor('#10B981').text('Suggested:')
                    doc.fontSize(10).fillColor('#4B5563').text(alt.suggested, { lineGap: 2 })
                }
                doc.moveDown(0.5)
            })
        }

        // Footer
        doc.fontSize(8).fillColor('#9CA3AF')
            .text(
                'Generated by SamvidAI • This report is for informational purposes only and does not constitute legal advice.',
                50, doc.page.height - 40, { align: 'center' }
            )

        doc.end()

        const pdfBuffer = await pdfComplete
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="SamvidAI_Report_${contract.file_name}.pdf"`)
        return res.send(pdfBuffer)
    } catch (err) {
        console.error('Report generation error:', err)
        const status = err.status || 500
        return res.status(status).json({ error: err.message || 'Failed to generate report' })
    }
}

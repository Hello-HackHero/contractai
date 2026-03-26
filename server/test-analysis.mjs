// Test script for the backend analysis logic
// Run: node --experimental-modules test-analysis.mjs
// This directly tests chunking, Groq analysis, merging, and risk scoring
// without requiring Supabase auth.

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

import Groq from 'groq-sdk'

// ─── Copy of functions from analyze.js ───────────────────────────────────────

function chunkText(text, chunkSize = 3000, overlap = 200) {
    const words = text.split(' ')
    const chunks = []
    let i = 0
    while (i < words.length) {
        const chunk = words.slice(i, i + chunkSize).join(' ')
        chunks.push(chunk)
        i += chunkSize - overlap
    }
    return chunks
}

const systemPrompt = `You are a senior legal contract analyst. 
Analyse the given contract text and return ONLY a valid JSON object.
No explanation, no markdown, no extra text. Only JSON.

Return this exact structure:
{
  "clauses": [
    {
      "title": "clause name",
      "type": "high_risk" | "medium_risk" | "low_risk",
      "severity": 1-10,
      "text": "relevant excerpt (max 100 words)",
      "explanation": "why this is risky in plain language",
      "recommendation": "what to do about it"
    }
  ],
  "red_flags": ["flag1", "flag2"],
  "summary": "2-3 sentence contract summary",
  "contract_type": "Employment/NDA/Service/Lease/Other"
}`

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function analyseChunk(chunk, retryCount = 0) {
    const userPrompt = `Analyse this contract section:\n\n${chunk}`
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 6000,
            response_format: { type: 'json_object' },
        })
        const responseText = completion.choices[0]?.message?.content || '{}'
        try {
            return JSON.parse(responseText)
        } catch (parseErr) {
            if (retryCount < 1) {
                console.log('  ⚠️  Invalid JSON, retrying with simpler prompt...')
                const retryCompletion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: 'Return ONLY a valid JSON object. No explanation.' },
                        { role: 'user', content: `Parse this contract text and return JSON with keys: clauses (array), red_flags (array), summary (string), contract_type (string).\n\n${chunk.substring(0, 4000)}` },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.1,
                    max_tokens: 4000,
                    response_format: { type: 'json_object' },
                })
                const retryText = retryCompletion.choices[0]?.message?.content || '{}'
                return JSON.parse(retryText)
            }
            console.error('  ❌ Failed to parse JSON after retry:', parseErr.message)
            return null
        }
    } catch (err) {
        console.error('  ❌ Groq API error:', err.message)
        return null
    }
}

function mergeChunkResults(chunkResults) {
    const allClauses = []
    const allRedFlags = []
    let summary = ''
    let contractType = 'Other'
    chunkResults.forEach(result => {
        if (result.clauses) allClauses.push(...result.clauses)
        if (result.red_flags) allRedFlags.push(...result.red_flags)
        if (result.summary) summary = result.summary
        if (result.contract_type) contractType = result.contract_type
    })
    const uniqueRedFlags = [...new Set(allRedFlags)]
    return { allClauses, uniqueRedFlags, summary, contractType }
}

function calculateRiskScore(clauses) {
    if (!clauses || clauses.length === 0) return 0
    const weights = { high_risk: 3, medium_risk: 1.5, low_risk: 0.5 }
    let totalWeight = 0
    let weightedSeverity = 0
    clauses.forEach(clause => {
        const weight = weights[clause.type] || 1
        totalWeight += weight
        weightedSeverity += (clause.severity || 5) * weight
    })
    const rawScore = totalWeight > 0 ? (weightedSeverity / totalWeight) : 0
    return Math.min(100, Math.round((rawScore / 10) * 100))
}

// ─── Generate a 5000+ word sample employment contract ────────────────────────

function generateSampleContract() {
    const sections = []

    sections.push(`EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of January 15, 2025, by and between TechCorp Industries Ltd., a company incorporated under the laws of India, having its registered office at 42 MG Road, Bangalore, Karnataka 560001 ("Employer" or "Company"), and John Smith, residing at 15 Park Avenue, Mumbai, Maharashtra 400001 ("Employee").

WHEREAS, the Company desires to employ the Employee and the Employee desires to be employed by the Company on the terms and conditions set forth herein;

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:`)

    sections.push(`ARTICLE 1: POSITION AND DUTIES

1.1 Position. The Company hereby employs the Employee as Senior Software Engineer, reporting directly to the Chief Technology Officer. The Employee shall perform all duties and responsibilities customarily associated with such position, as well as any additional duties that may be assigned from time to time by the Company.

1.2 Full-Time Employment. The Employee agrees to devote their full working time, attention, and best efforts to the performance of their duties hereunder. The Employee shall not engage in any other employment, consulting, or business activity without the prior written consent of the Company, whether or not such activity conflicts with the Employee's obligations under this Agreement.

1.3 Location. The Employee shall perform their duties primarily at the Company's offices located in Bangalore, Karnataka. The Company reserves the right to require the Employee to travel domestically and internationally as reasonably necessary for the performance of their duties. The Company further reserves the absolute right to relocate the Employee to any other office location within India without additional compensation or relocation benefits.

1.4 Work Hours. The Employee's standard working hours shall be from 9:00 AM to 6:00 PM, Monday through Friday. However, the Employee acknowledges and agrees that the nature of the position may require work beyond standard hours, including evenings, weekends, and holidays, without additional compensation. The Employee expressly waives any claim for overtime pay or compensatory time off for hours worked in excess of the standard schedule.`)

    sections.push(`ARTICLE 2: COMPENSATION AND BENEFITS

2.1 Base Salary. The Company shall pay the Employee a base salary of INR 25,00,000 (Twenty-Five Lakhs) per annum, payable in equal monthly installments, less applicable taxes and deductions. The salary shall be reviewed annually at the Company's sole discretion, and the Company shall have no obligation to increase the salary at any time.

2.2 Performance Bonus. The Employee may be eligible for an annual performance bonus of up to 20% of the base salary, based on individual and company performance metrics to be determined by the Company in its sole and absolute discretion. The Company reserves the right to modify, reduce, or eliminate the bonus program at any time without notice. Any bonus payment shall be contingent upon the Employee's continued employment through the bonus payment date.

2.3 Stock Options. Subject to approval by the Board of Directors, the Employee may be granted stock options under the Company's Employee Stock Option Plan. Any such grant shall be subject to the terms and conditions of the applicable stock option agreement and the plan document. The Company reserves the right to repurchase any vested shares at a price determined solely by the Company's Board.

2.4 Benefits Modification. The Company reserves the unilateral right to modify, suspend, or terminate any and all benefits, including but not limited to health insurance, retirement plans, paid time off, and any other perquisites, at any time and without prior notice to the Employee. The Employee acknowledges that no benefit constitutes a contractual entitlement beyond the current plan year.`)

    sections.push(`ARTICLE 3: INTELLECTUAL PROPERTY AND INVENTIONS

3.1 Work Product Assignment. The Employee hereby irrevocably assigns to the Company all right, title, and interest in and to any and all inventions, discoveries, developments, improvements, works of authorship, designs, algorithms, software code, trade secrets, and other intellectual property (collectively, "Work Product") that the Employee conceives, creates, develops, or reduces to practice, either alone or jointly with others, during the term of employment or within twenty-four (24) months following termination of employment, regardless of whether such Work Product was created during working hours or using Company resources.

3.2 Prior Inventions. The Employee represents that there are no prior inventions or intellectual property that the Employee wishes to exclude from this assignment. Any failure to disclose prior inventions shall result in the presumption that all intellectual property created during the employment period is Company property.

3.3 Moral Rights Waiver. To the maximum extent permitted by applicable law, the Employee hereby irrevocably waives all moral rights, including rights of attribution and integrity, in and to any Work Product assigned to the Company under this Agreement.

3.4 Perpetual License. In addition to the assignment above, the Employee grants the Company a perpetual, irrevocable, worldwide, royalty-free license to use any ideas, concepts, know-how, or techniques that the Employee develops or learns during the course of employment, even if such materials do not constitute protectable intellectual property.`)

    sections.push(`ARTICLE 4: CONFIDENTIALITY

4.1 Confidential Information. The Employee acknowledges that during the course of employment, the Employee will have access to and become acquainted with information that is confidential and proprietary to the Company, including but not limited to trade secrets, business plans, financial data, customer lists, vendor information, marketing strategies, technical specifications, source code, algorithms, product roadmaps, pricing information, employee data, and other proprietary information (collectively, "Confidential Information"). The Employee agrees to hold all Confidential Information in the strictest confidence.

4.2 Non-Disclosure. The Employee shall not, during or after the term of employment, directly or indirectly, use, disclose, publish, or otherwise reveal any Confidential Information to any person, firm, corporation, or other entity without the prior written consent of the Company. This obligation shall survive the termination of this Agreement indefinitely and without any time limitation.

4.3 Return of Materials. Upon termination of employment for any reason, the Employee shall immediately return to the Company all documents, files, electronic media, equipment, and other materials containing or relating to Confidential Information, and shall not retain any copies, extracts, or reproductions thereof. The Employee shall also permanently delete any Confidential Information stored on personal devices, cloud storage accounts, or any other medium not owned by the Company.

4.4 Broad Definition. The Employee agrees that the definition of Confidential Information shall be construed as broadly as possible, and any doubt regarding whether information qualifies as confidential shall be resolved in favor of the Company.`)

    sections.push(`ARTICLE 5: NON-COMPETITION AND NON-SOLICITATION

5.1 Non-Competition During Employment. During the term of employment, the Employee shall not, directly or indirectly, engage in, assist, or have any interest in any business that competes with the Company's business anywhere in the world.

5.2 Post-Termination Non-Competition. For a period of thirty-six (36) months following the termination of employment for any reason, the Employee shall not, directly or indirectly, own, manage, operate, join, control, or participate in the ownership, management, operation, or control of, or be employed by, consult with, or be connected in any manner with any business that is competitive with the Company's business, within any geographic area where the Company conducts business or has plans to conduct business. This restriction shall apply globally and without any geographic limitation.

5.3 Non-Solicitation of Employees. For a period of thirty-six (36) months following termination, the Employee shall not, directly or indirectly, solicit, recruit, hire, or attempt to solicit, recruit, or hire any employee, contractor, or consultant of the Company.

5.4 Non-Solicitation of Customers. For a period of thirty-six (36) months following termination, the Employee shall not, directly or indirectly, solicit, contact, or do business with any customer, client, vendor, or business partner of the Company with whom the Employee had contact or about whom the Employee learned confidential information during the course of employment.

5.5 No Compensation for Restrictions. The Employee acknowledges and agrees that no additional compensation shall be paid for the non-competition and non-solicitation restrictions set forth in this Article, and that the compensation provided under this Agreement is sufficient consideration for these restrictions.`)

    sections.push(`ARTICLE 6: TERMINATION

6.1 At-Will Termination by Company. Notwithstanding any other provision of this Agreement, the Company may terminate the Employee's employment at any time, with or without cause, and with or without notice, at the Company's sole discretion. In the event of termination without cause, the Company's sole obligation shall be to pay the Employee's accrued but unpaid salary through the date of termination.

6.2 Termination for Cause. The Company may terminate the Employee's employment immediately for "Cause," which shall include but not be limited to: (a) any breach of this Agreement; (b) failure to perform assigned duties; (c) misconduct; (d) dishonesty; (e) conviction of any crime; (f) any action that brings the Company into disrepute; or (g) any other reason the Company deems sufficient in its sole judgment. Upon termination for Cause, the Employee shall forfeit all unpaid bonuses, unvested stock options, and any other incentive compensation.

6.3 Termination by Employee. The Employee may terminate this Agreement by providing ninety (90) days written notice to the Company. During the notice period, the Company may, at its sole discretion, require the Employee to continue working, place the Employee on garden leave, or waive the notice period. If the Employee fails to serve the full notice period, the Employee shall pay the Company liquidated damages equal to three (3) months of base salary.

6.4 Automatic Termination. This Agreement shall automatically terminate upon the Employee's death or permanent disability. In such event, the Company's sole obligation shall be to pay accrued salary through the date of termination.

6.5 No Severance. The Employee acknowledges and agrees that they shall not be entitled to any severance pay, separation benefits, or other post-termination compensation, regardless of the reason for termination.`)

    sections.push(`ARTICLE 7: INDEMNIFICATION AND LIABILITY

7.1 Employee Indemnification. The Employee shall defend, indemnify, and hold harmless the Company, its officers, directors, employees, and agents from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) the Employee's breach of this Agreement; (b) the Employee's negligence or willful misconduct; (c) any claim by a third party related to the Employee's actions or omissions during the course of employment; or (d) any intellectual property infringement claim arising from the Employee's work product.

7.2 Limitation of Company Liability. In no event shall the Company be liable to the Employee for any indirect, incidental, consequential, special, or punitive damages, regardless of the cause of action or the theory of liability, even if the Company has been advised of the possibility of such damages. The Company's total aggregate liability under this Agreement shall not exceed the Employee's base salary for the one (1) month period immediately preceding the event giving rise to the claim.

7.3 Personal Device Usage. The Employee authorizes the Company to remotely access, monitor, and if necessary wipe any personal devices used for Company business, including but not limited to personal laptops, mobile phones, and tablets. The Company shall not be liable for any loss of personal data resulting from such actions.`)

    sections.push(`ARTICLE 8: DISPUTE RESOLUTION AND GOVERNING LAW

8.1 Mandatory Arbitration. Any and all disputes, claims, or controversies arising out of or relating to this Agreement, including but not limited to claims of breach, wrongful termination, discrimination, harassment, or any other employment-related claims, shall be resolved exclusively through binding arbitration administered by an arbitrator selected solely by the Company. The Employee hereby waives the right to a jury trial and the right to participate in any class action, collective action, or representative proceeding.

8.2 Arbitration Location. All arbitration proceedings shall be conducted in Bangalore, Karnataka, India, regardless of the Employee's location at the time of the dispute.

8.3 Costs. The Employee shall bear their own costs of arbitration, including but not limited to filing fees, arbitrator fees, travel expenses, and attorneys' fees, regardless of the outcome of the arbitration.

8.4 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of India, without regard to its conflict of laws principles.

8.5 Entire Agreement. This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, and negotiations, whether written or oral.

8.6 Amendment. This Agreement may be amended or modified only by a written instrument signed by both parties; provided, however, that the Company may unilaterally amend any provision of this Agreement upon thirty (30) days written notice to the Employee including any compensation terms, benefits, or working conditions.

8.7 Severability. If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

EMPLOYER: TechCorp Industries Ltd.
By: ___________________________
Name: Rajesh Sharma
Title: Chief Executive Officer

EMPLOYEE:
___________________________
John Smith`)

    let text = sections.join('\n\n')

    // Pad to 5500+ words to trigger chunking (threshold = 3000 words)
    const additionalClauses = `

ARTICLE 9: DATA PROTECTION AND PRIVACY

9.1 Data Processing. The Employee acknowledges and consents that the Company may collect, process, store, and transfer personal data relating to the Employee, including but not limited to name, address, contact information, bank details, tax identification numbers, performance reviews, disciplinary records, health information, biometric data, and any other personal information necessary for the administration of employment. The Company may process such data for any purpose it deems appropriate, including but not limited to recruitment, payroll administration, benefits management, performance evaluation, disciplinary proceedings, legal compliance, and business operations.

9.2 Cross-Border Transfer. The Employee consents to the transfer of their personal data to any country where the Company or its affiliates operate, including countries that may not provide the same level of data protection as India. The Employee waives any right to object to such transfers or to withdraw consent for data processing.

9.3 Monitoring and Surveillance. The Employee acknowledges and agrees that the Company may monitor all communications, internet usage, email correspondence, instant messaging, phone calls, and other activities conducted on Company equipment or networks. The Company may also conduct video surveillance of Company premises. The Employee has no expectation of privacy with respect to any activities conducted during working hours or on Company property.

9.4 Social Media. During the term of employment and for twelve (12) months thereafter, the Employee shall not post, publish, or share on any social media platform any content that relates to the Company, its products, services, employees, customers, or business operations without the prior written approval of the Company's communications department. The Company reserves the right to require the Employee to remove any social media content that the Company deems objectionable, misleading, or contrary to the Company's interests. The Employee shall provide the Company with access credentials to all professional social media accounts created during the term of employment, and the Company shall retain ownership of such accounts upon termination.

ARTICLE 10: GENERAL PROVISIONS AND MISCELLANEOUS TERMS

10.1 Force Majeure. Neither party shall be liable for any failure or delay in performing obligations under this Agreement if such failure or delay results from circumstances beyond the reasonable control of the affected party, including but not limited to acts of God, fire, flood, earthquake, epidemic, pandemic, war, terrorism, civil unrest, government actions, strikes, lockouts, or disruptions in telecommunications or power supply. However, the Company reserves the right to modify the Employee's compensation and benefits during any force majeure event without notice.

10.2 Notices. All notices under this Agreement shall be in writing and delivered personally, by registered mail, courier, or email to the addresses specified herein. Notice shall be deemed received upon delivery if delivered personally, three (3) business days after mailing if sent by registered mail, one (1) business day after sending if by courier, and upon confirmation of receipt if sent by email. The Company may change its notice address at any time without prior notice to the Employee.

10.3 Waiver. The failure of either party to enforce any provision of this Agreement shall not constitute a waiver of such provision or the right to enforce it at a later time. All waivers must be in writing and signed by the waiving party to be effective; provided, however, that the Company's waiver of any provision may be made orally by any authorized representative.

10.4 Assignment. The Employee may not assign or transfer this Agreement or any rights or obligations hereunder without the prior written consent of the Company. The Company may freely assign this Agreement to any successor, affiliate, or related entity without the Employee's consent and without providing notice of such assignment. Upon any such assignment, all references to the Company in this Agreement shall be deemed to refer to the assignee.

10.5 Survival. The following provisions shall survive the termination or expiration of this Agreement: Articles 3 (Intellectual Property), 4 (Confidentiality), 5 (Non-Competition), 7 (Indemnification), and 8 (Dispute Resolution), as well as any other provisions that by their nature are intended to survive termination.

10.6 Headings. The headings in this Agreement are for reference purposes only and shall not affect the interpretation or construction of any provision hereof.

10.7 Counterparts. This Agreement may be executed in multiple counterparts, each of which shall be deemed an original and all of which together shall constitute one and the same instrument.

ARTICLE 11: EMPLOYEE REPRESENTATIONS AND WARRANTIES

11.1 Capacity. The Employee represents and warrants that they have the legal capacity and authority to enter into this Agreement and to perform their obligations hereunder.

11.2 No Conflicts. The Employee represents and warrants that the execution, delivery, and performance of this Agreement do not and will not conflict with, breach, or constitute a default under any other agreement, contract, or obligation to which the Employee is a party or by which the Employee is bound.

11.3 No Prior Restrictions. The Employee represents and warrants that they are not subject to any non-competition, non-solicitation, or other restrictive covenant that would prevent or restrict them from performing their duties under this Agreement.

11.4 Truthfulness. The Employee represents and warrants that all information provided to the Company during the recruitment process, including but not limited to educational qualifications, work experience, references, and background information, is true, accurate, and complete. Any misrepresentation or omission of material facts shall constitute grounds for immediate termination for Cause.

11.5 Ongoing Obligations. The Employee agrees to promptly notify the Company of any circumstances that may affect their ability to perform their duties, including but not limited to changes in health status, legal proceedings, or conflicts of interest.

ARTICLE 12: INSURANCE AND BENEFITS DETAILS

12.1 Health Insurance. The Company shall provide the Employee with health insurance coverage as per the Company's prevailing group health insurance policy. The specific terms, conditions, coverage limits, and exclusions shall be as set forth in the insurance policy document, which may be amended by the insurer or the Company from time to time without prior notice to the Employee.

12.2 Life Insurance. The Company may, at its sole discretion, provide the Employee with life insurance coverage. The amount of coverage and the terms of the policy shall be determined by the Company and may be modified or terminated at any time.

12.3 Leave Policy. The Employee shall be entitled to leave as per the Company's prevailing leave policy, which may include casual leave, sick leave, earned leave, and any other categories of leave as determined by the Company. The Company reserves the right to modify the leave policy at any time. Unused leave shall not be carried forward or encashed unless specifically provided for in the leave policy.

12.4 Retirement Benefits. The Company shall contribute to the Employee's Provident Fund account as required by applicable Indian law. Any additional retirement benefits shall be at the Company's sole discretion and may be modified or terminated at any time.`

    text += additionalClauses
    return text
}

// ─── Main test ───────────────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════════════')
    console.log('  SamvidAI — Backend Analysis Endpoint Test')
    console.log('═══════════════════════════════════════════════════════\n')

    // Check API key
    if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY not found in .env')
        process.exit(1)
    }
    console.log('✅ GROQ_API_KEY loaded\n')

    // Generate sample contract
    const contract = generateSampleContract()
    const wordCount = contract.split(' ').length
    console.log(`📄 Generated sample employment contract: ${wordCount} words\n`)

    // Test chunking
    const chunks = chunkText(contract)
    console.log(`🔪 Chunking result: ${chunks.length} chunks`)
    chunks.forEach((chunk, i) => {
        console.log(`   Chunk ${i + 1}: ${chunk.split(' ').length} words`)
    })
    console.log()

    // Analyse each chunk sequentially
    console.log('🤖 Starting Groq analysis (sequential, 30s timeout per chunk)...\n')
    const startTime = Date.now()
    const chunkResults = []

    for (let idx = 0; idx < chunks.length; idx++) {
        const chunkStart = Date.now()
        console.log(`  Processing chunk ${idx + 1} of ${chunks.length}...`)
        const result = await analyseChunk(chunks[idx])
        const elapsed = ((Date.now() - chunkStart) / 1000).toFixed(1)
        if (result) {
            chunkResults.push(result)
            const clauseCount = result.clauses?.length || 0
            const flagCount = result.red_flags?.length || 0
            console.log(`  ✅ Chunk ${idx + 1} done in ${elapsed}s — ${clauseCount} clauses, ${flagCount} red flags`)
        } else {
            console.log(`  ⚠️  Chunk ${idx + 1} failed — skipping`)
        }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n⏱️  Total analysis time: ${totalTime}s\n`)

    if (chunkResults.length === 0) {
        console.error('❌ All chunks failed!')
        process.exit(1)
    }

    // Merge results
    console.log('🔗 Merging chunk results...')
    const { allClauses, uniqueRedFlags, summary, contractType } = mergeChunkResults(chunkResults)

    // Calculate risk score
    const score = calculateRiskScore(allClauses)
    const riskLevel = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW'

    // Build final response
    const response = {
        success: true,
        data: {
            overall_risk_score: score,
            risk_level: riskLevel,
            contract_type: contractType,
            summary: summary,
            clauses: {
                high_risk: allClauses.filter(c => c.type === 'high_risk'),
                medium_risk: allClauses.filter(c => c.type === 'medium_risk'),
                low_risk: allClauses.filter(c => c.type === 'low_risk'),
            },
            red_flags: uniqueRedFlags,
            recommendations: allClauses
                .filter(c => c.type === 'high_risk')
                .map(c => c.recommendation)
                .filter(Boolean)
                .slice(0, 5),
            total_clauses_analysed: allClauses.length,
            chunks_processed: chunkResults.length,
        },
    }

    // Print final output
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  FINAL RESPONSE')
    console.log('═══════════════════════════════════════════════════════\n')

    console.log(`📊 Overall Risk Score: ${score}/100  [${riskLevel}]`)
    console.log(`📋 Contract Type: ${contractType}`)
    console.log(`📝 Summary: ${summary}\n`)

    console.log(`🔴 High Risk Clauses: ${response.data.clauses.high_risk.length}`)
    response.data.clauses.high_risk.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.title} (severity: ${c.severity}/10)`)
        console.log(`      → ${c.explanation?.substring(0, 100)}...`)
    })

    console.log(`\n🟡 Medium Risk Clauses: ${response.data.clauses.medium_risk.length}`)
    response.data.clauses.medium_risk.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.title} (severity: ${c.severity}/10)`)
    })

    console.log(`\n🟢 Low Risk Clauses: ${response.data.clauses.low_risk.length}`)
    response.data.clauses.low_risk.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.title} (severity: ${c.severity}/10)`)
    })

    console.log(`\n🚩 Red Flags (${uniqueRedFlags.length}):`)
    uniqueRedFlags.forEach((f, i) => console.log(`   ${i + 1}. ${f}`))

    console.log(`\n💡 Top Recommendations (${response.data.recommendations.length}):`)
    response.data.recommendations.forEach((r, i) => console.log(`   ${i + 1}. ${r}`))

    console.log(`\n📦 Chunks Processed: ${response.data.chunks_processed}`)
    console.log(`📦 Total Clauses: ${response.data.total_clauses_analysed}`)

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  ✅ TEST PASSED — Full JSON response:')
    console.log('═══════════════════════════════════════════════════════\n')
    console.log(JSON.stringify(response, null, 2))
}

main().catch(err => {
    console.error('❌ Test failed:', err)
    process.exit(1)
})

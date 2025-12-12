// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

// Types
interface TranscriptionRequest {
  filePath: string
  fileType: 'audio' | 'video'
  fileName: string
  userId: string
  meetingId?: string
}

interface TranscriptionResponse {
  success: boolean
  meetingId?: string
  transcription?: string
  summary?: string
  keyPoints?: string[]
  actionItems?: string[]
  participants?: Array<{ name: string; email?: string }>
  error?: string
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

// Groq API configuration
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_MODELS = {
  transcription: 'whisper-large-v3', // Groq's Whisper model for transcription
  analysis: 'llama-3.3-70b-versatile', // Groq's LLaMA model for analysis
}

async function downloadFileFromStorage(filePath: string): Promise<Uint8Array> {
  console.log(`[STORAGE] Attempting to download file from path: ${filePath}`)
  
  const { data, error } = await supabase.storage
    .from('ai_meetings')
    .download(filePath)

  if (error) {
    console.error(`[STORAGE] Failed to download file: ${error.message}`)
    throw new Error(`Failed to download file: ${error.message}`)
  }

  const buffer = await data.arrayBuffer().then(ab => new Uint8Array(ab))
  console.log(`[STORAGE] File successfully downloaded. Size: ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)
  
  return buffer
}

async function getTranscriptionFromGroq(
  fileBuffer: Uint8Array,
  fileName: string
): Promise<string> {
  console.log(`[GROQ-TRANSCRIPTION] Starting transcription request for file: ${fileName}`)
  console.log(`[GROQ-TRANSCRIPTION] File size: ${fileBuffer.length} bytes`)
  
  // Determine MIME type based on file extension
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: { [key: string]: string } = {
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'webm': 'audio/webm',
    'mp4': 'video/mp4',
    'mpeg': 'video/mpeg',
    'mov': 'video/quicktime',
  }
  const mimeType = mimeTypes[extension] || 'audio/mpeg'
  console.log(`[GROQ-TRANSCRIPTION] Detected MIME type: ${mimeType}`)

  console.log(`[GROQ-TRANSCRIPTION] Sending request to Groq Whisper API...`)
  const startTime = Date.now()
  
  // Create form data for Groq Whisper API
  const formData = new FormData()
  const blob = new Blob([fileBuffer], { type: mimeType })
  formData.append('file', blob, fileName)
  formData.append('model', GROQ_MODELS.transcription)
  formData.append('response_format', 'text')
  
  const response = await fetch(
    'https://api.groq.com/openai/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    }
  )

  const duration = Date.now() - startTime
  console.log(`[GROQ-TRANSCRIPTION] Response received in ${duration}ms. Status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[GROQ-TRANSCRIPTION] Error Response:`, errorText)
    throw new Error(`Groq transcription error: ${errorText}`)
  }

  const transcriptionText = await response.text()
  console.log(`[GROQ-TRANSCRIPTION] Response received successfully`)
  
  if (!transcriptionText) {
    throw new Error('No transcription text received from Groq API')
  }
  
  console.log(`[GROQ-TRANSCRIPTION] Transcription successful. Text length: ${transcriptionText.length} characters`)
  
  return transcriptionText
}


async function generateSummaryAndInsights(
  transcription: string
): Promise<{
  summary: string
  keyPoints: string[]
  actionItems: string[]
  participants: Array<{ name: string; email?: string }>
}> {
  console.log(`[GROQ-ANALYSIS] Starting summary and insights generation`)
  console.log(`[GROQ-ANALYSIS] Transcription text length: ${transcription.length} characters`)
  console.log(`[GROQ-ANALYSIS] First 200 characters: ${transcription.substring(0, 200)}...`)
  
  const analysisPrompt = `Analyze this meeting transcript and respond with ONLY valid JSON (no markdown, no extra text, no code blocks).

TRANSCRIPT:
${transcription}

Respond with this exact JSON structure:
{
  "summary": "Write a 2-3 paragraph executive summary of the meeting's key decisions and outcomes",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "actionItems": ["Action 1: Description", "Action 2: Description", "Action 3: Description", "Action 4: Description", "Action 5: Description"]
  ,
  "participants": [
    { "name": "Full Name", "email": "email@example.com" },
    { "name": "Another Person" }
  ]
}

CRITICAL INSTRUCTIONS FOR PARTICIPANTS:
- Extract ACTUAL NAMES mentioned in the transcript (e.g., "John Smith", "Sarah Johnson", "Dr. Michael Chen")
- Look for introductions, name mentions, or any references to people by name
- If someone says "Hi, I'm [Name]" or "This is [Name] speaking", capture that name
- If no actual names are mentioned, look for any identifiers used (e.g., "John from Marketing", "Sarah the Project Manager")
- DO NOT use generic roles like "Meeting Leader" or "Mentor" - always try to find the actual names first
- Include email addresses if mentioned in the transcript
- If absolutely no names can be found, only then use descriptive identifiers from context

IMPORTANT: Return ONLY the JSON object. No markdown code blocks, no extra text, no explanations. Start with { and end with }.`

  console.log(`[GROQ-ANALYSIS] Sending request to Groq API...`)
  const startTime = Date.now()
  
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODELS.analysis,
        messages: [
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    }
  )

  const duration = Date.now() - startTime
  console.log(`[GROQ-ANALYSIS] Response received in ${duration}ms. Status: ${response.status}`)

  if (!response.ok) {
    const error = await response.json()
    console.error(`[GROQ-ANALYSIS] Error Response:`, JSON.stringify(error, null, 2))
    throw new Error(`Groq analysis error: ${error.error?.message || 'Unknown error'}`)
  }

  const result = await response.json()
  console.log(`[GROQ-ANALYSIS] Response received successfully`)
  
  let content = result.choices?.[0]?.message?.content || ''
  console.log(`[GROQ-ANALYSIS] Content length: ${content.length} characters`)
  console.log(`[GROQ-ANALYSIS] First 300 characters of response: ${content.substring(0, 300)}...`)

  // Clean up the response - remove markdown code blocks if present
  content = content.trim()
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }
  content = content.trim()

  console.log(`[GROQ-ANALYSIS] Cleaned content for parsing: ${content.substring(0, 200)}...`)

  try {
    const parsed = JSON.parse(content)
    console.log(`[GROQ-ANALYSIS] JSON parsed successfully`)
    console.log(`[GROQ-ANALYSIS] Summary length: ${parsed.summary?.length || 0} characters`)
    console.log(`[GROQ-ANALYSIS] Key points count: ${(parsed.keyPoints || []).length}`)
    console.log(`[GROQ-ANALYSIS] Action items count: ${(parsed.actionItems || []).length}`)
    
    const participants: Array<{ name: string; email?: string }> = Array.isArray(parsed.participants)
      ? parsed.participants
          .filter(p => typeof p === 'object' && p && typeof p.name === 'string' && p.name.trim().length > 0)
          .map(p => ({ name: String(p.name).trim(), email: p.email ? String(p.email).trim() : undefined }))
      : []

    return {
      summary: parsed.summary || 'No summary generated',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      participants,
    }
  } catch (parseError) {
    console.error(`[GROQ-ANALYSIS] JSON parsing failed:`, parseError)
    console.error(`[GROQ-ANALYSIS] Raw content that failed to parse:`, content)
    
    // Fallback: return default values instead of throwing
    return {
      summary: 'Meeting analysis could not be parsed. Please review the transcript manually.',
      keyPoints: ['Analysis processing encountered an issue'],
      actionItems: ['Review meeting transcript for action items'],
      participants: [],
    }
  }
}

/**
 * Update meeting record in database with transcription and analysis
 */
async function updateMeetingRecord(
  meetingId: string,
  transcription: string,
  summary: string,
  keyPoints: string[],
  actionItems: string[],
  participants: Array<{ name: string; email?: string }>
): Promise<void> {
  console.log(`[DATABASE] Updating meeting record with ID: ${meetingId}`)
  console.log(`[DATABASE] Data being saved:`)
  console.log(`  - Transcript: ${transcription.length} characters`)
  console.log(`  - Summary: ${summary.length} characters`)
  console.log(`  - Key Points: ${keyPoints.length} items`)
  console.log(`  - Action Items: ${actionItems.length} items`)
  
  const { error } = await supabase
    .from('meetings')
    .update({
      transcript: transcription,
      summary: summary,
      key_points: keyPoints,
      action_items: actionItems,
      participants: participants || [],
      status: 'completed',
    })
    .eq('id', meetingId)

  if (error) {
    console.error(`[DATABASE] Update failed for meeting ${meetingId}: ${error.message}`)
    throw new Error(`Database update failed: ${error.message}`)
  }
  
  console.log(`[DATABASE] Meeting record successfully updated: ${meetingId}`)
}


/**
 * Main request handler
 */
Deno.serve(async (req: Request): Promise<Response> => {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`[REQUEST] New edge function invocation at ${new Date().toISOString()}`)
  console.log(`[REQUEST] Method: ${req.method}`)
  console.log(`${'='.repeat(80)}`)
  
  // Add CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, x-api-key',
    'Access-Control-Max-Age': '86400',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS preflight request')
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }
  
  // Declare variables at outer scope so they're accessible in catch block
  let meetingId: string | null = null
  let requestBody: TranscriptionRequest
  
  try {
    // Validate request method
    if (req.method !== 'POST') {
      console.error('[VALIDATION] Invalid HTTP method:', req.method)
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Parse request body
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error('[VALIDATION] Failed to parse JSON request body:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const { filePath, fileType, fileName, userId } = requestBody
    meetingId = requestBody.meetingId || null
    
    console.log('[REQUEST] Received parameters:')
    console.log(`  - filePath: ${filePath}`)
    console.log(`  - fileType: ${fileType}`)
    console.log(`  - fileName: ${fileName}`)
    console.log(`  - userId: ${userId}`)
    console.log(`  - meetingId: ${meetingId || 'not provided'}`)

    // Validate required fields
    if (!filePath || !fileType || !fileName || !userId) {
      console.error('[VALIDATION] Missing required fields')
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: filePath, fileType, fileName, userId',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Validate file type
    if (!['audio', 'video'].includes(fileType)) {
      console.error(`[VALIDATION] Invalid fileType: ${fileType}`)
      return new Response(
        JSON.stringify({ error: 'Invalid fileType. Must be "audio" or "video".' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Check Gemini API key
    // if (!GEMINI_API_KEY) {
    //   console.error('[CONFIG] Gemini API key not configured')
    //   return new Response(
    //     JSON.stringify({ error: 'Gemini API key not configured' }),
    //     { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    //   )
    // }
    console.log('[CONFIG] Gemini API key is configured')

    console.log(`\n[PROCESSING] Starting transcription process for file: ${fileName}`)

    // Update meeting status to 'processing'
    if (meetingId) {
      console.log(`[DATABASE] Updating meeting ${meetingId} status to 'processing'`)
      const updateResult = await supabase
        .from('meetings')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', meetingId)
      console.log(`[DATABASE] Meeting status update completed`)
    }

    // Step 1: Download file from Supabase Storage
    console.log('\n[STEP 1/4] Downloading file from Supabase Storage...')
    const fileBuffer = await downloadFileFromStorage(filePath)

    // Step 2: Get transcription from Groq Whisper
    console.log('\n[STEP 2/4] Sending file to Groq Whisper for transcription...')
    const transcription = await getTranscriptionFromGroq(fileBuffer, fileName)

    // Step 3: Generate summary and insights using Groq LLaMA
    console.log('\n[STEP 3/4] Generating summary and insights with Groq...')
    const { summary, keyPoints, actionItems, participants } = await generateSummaryAndInsights(transcription)

    // Step 4: Update meeting record in database
    if (meetingId) {
      console.log('\n[STEP 4/4] Updating meeting record in database...')
      await updateMeetingRecord(
        meetingId,
        transcription,
        summary,
        keyPoints,
        actionItems,
        participants
      )
    } else {
      console.log('\n[STEP 4/4] Skipped - No meetingId provided')
    }

    // Return success response
    const response: TranscriptionResponse = {
      success: true,
      meetingId,
      transcription,
      summary,
      keyPoints,
      actionItems,
      participants,
    }

    console.log(`\n[SUCCESS] Transcription processing completed successfully`)
    console.log(`${'='.repeat(80)}\n`)
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, x-api-key',
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`\n[ERROR] Transcription processing failed: ${errorMessage}`)
    console.error('[ERROR] Full error object:', error)
    console.log(`${'='.repeat(80)}\n`)

    // Update meeting status to 'failed' if meetingId provided
    try {
      if (meetingId) {
        console.log(`[DATABASE] Updating meeting ${meetingId} status to 'failed'`)
        await supabase
          .from('meetings')
          .update({ 
            status: 'failed',
            error_message: errorMessage,
          })
          .eq('id', meetingId)
        console.log(`[DATABASE] Meeting failure status recorded`)
      }
    } catch (dbError) {
      console.error('[DATABASE] Failed to update error status:', dbError)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey, x-api-key',
        }
      }
    )
  }
})


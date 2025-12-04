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

// Google Gemini configuration
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') 
const GEMINI_MODELS = {
  transcription: 'gemini-2.0-flash', // Used for file transcription
  analysis: 'gemini-2.0-flash', // Used for summary and insights
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

async function getTranscriptionFromGemini(
  fileBuffer: Uint8Array,
  fileName: string
): Promise<string> {
  console.log(`[GEMINI-TRANSCRIPTION] Starting transcription request for file: ${fileName}`)
  console.log(`[GEMINI-TRANSCRIPTION] File size: ${fileBuffer.length} bytes`)
  
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
  console.log(`[GEMINI-TRANSCRIPTION] Detected MIME type: ${mimeType}`)

  console.log(`[GEMINI-TRANSCRIPTION] Sending request to Gemini API...`)
  const startTime = Date.now()
  
  // Convert buffer to base64 safely (avoid call stack exceeded for large files)
  let base64Data = ''
  const chunkSize = 8192
  for (let i = 0; i < fileBuffer.length; i += chunkSize) {
    const chunk = fileBuffer.subarray(i, Math.min(i + chunkSize, fileBuffer.length))
    base64Data += String.fromCharCode.apply(null, Array.from(chunk) as any)
  }
  base64Data = btoa(base64Data)
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Please transcribe this audio/video file accurately. Provide only the transcribed text.',
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
    }
  )

  const duration = Date.now() - startTime
  console.log(`[GEMINI-TRANSCRIPTION] Response received in ${duration}ms. Status: ${response.status}`)

  if (!response.ok) {
    const error = await response.json()
    console.error(`[GEMINI-TRANSCRIPTION] Error Response:`, JSON.stringify(error, null, 2))
    throw new Error(`Gemini transcription error: ${error.error?.message || 'Unknown error'}`)
  }

  const result = await response.json()
  console.log(`[GEMINI-TRANSCRIPTION] Response received successfully`)
  
  // Extract text from Gemini response
  const transcriptionText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
  
  if (!transcriptionText) {
    throw new Error('No transcription text received from Gemini API')
  }
  
  console.log(`[GEMINI-TRANSCRIPTION] Transcription successful. Text length: ${transcriptionText.length} characters`)
  
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
  console.log(`[GEMINI-ANALYSIS] Starting summary and insights generation`)
  console.log(`[GEMINI-ANALYSIS] Transcription text length: ${transcription.length} characters`)
  console.log(`[GEMINI-ANALYSIS] First 200 characters: ${transcription.substring(0, 200)}...`)
  
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

IMPORTANT: Return ONLY the JSON object. No markdown code blocks, no extra text, no explanations. Start with { and end with }.`

  console.log(`[GEMINI-ANALYSIS] Sending request to Gemini API...`)
  const startTime = Date.now()
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: analysisPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    }
  )

  const duration = Date.now() - startTime
  console.log(`[GEMINI-ANALYSIS] Response received in ${duration}ms. Status: ${response.status}`)

  if (!response.ok) {
    const error = await response.json()
    console.error(`[GEMINI-ANALYSIS] Error Response:`, JSON.stringify(error, null, 2))
    throw new Error(`Gemini analysis error: ${error.error?.message || 'Unknown error'}`)
  }

  const result = await response.json()
  console.log(`[GEMINI-ANALYSIS] Response received successfully`)
  
  let content = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
  console.log(`[GEMINI-ANALYSIS] Content length: ${content.length} characters`)
  console.log(`[GEMINI-ANALYSIS] First 300 characters of response: ${content.substring(0, 300)}...`)

  // Clean up the response - remove markdown code blocks if present
  content = content.trim()
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }
  content = content.trim()

  console.log(`[GEMINI-ANALYSIS] Cleaned content for parsing: ${content.substring(0, 200)}...`)

  try {
    const parsed = JSON.parse(content)
    console.log(`[GEMINI-ANALYSIS] JSON parsed successfully`)
    console.log(`[GEMINI-ANALYSIS] Summary length: ${parsed.summary?.length || 0} characters`)
    console.log(`[GEMINI-ANALYSIS] Key points count: ${(parsed.keyPoints || []).length}`)
    console.log(`[GEMINI-ANALYSIS] Action items count: ${(parsed.actionItems || []).length}`)
    
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
    console.error(`[GEMINI-ANALYSIS] JSON parsing failed:`, parseError)
    console.error(`[GEMINI-ANALYSIS] Raw content that failed to parse:`, content)
    
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
    if (!GEMINI_API_KEY) {
      console.error('[CONFIG] Gemini API key not configured')
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
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

    // Step 2: Get transcription from Gemini
    console.log('\n[STEP 2/4] Sending file to Gemini for transcription...')
    const transcription = await getTranscriptionFromGemini(fileBuffer, fileName)

    // Step 3: Generate summary and insights using Gemini
    console.log('\n[STEP 3/4] Generating summary and insights with Gemini...')
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


export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MAX_SIZE_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'signals'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed. Use JPG, PNG, GIF, WebP, MP4, or WebM.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Max ${MAX_SIZE_MB}MB.` }, { status: 400 })
    }

    // Build path: userId/timestamp-filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${session.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('[Upload error]', error)
      // If bucket doesn't exist, return a helpful message
      if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
        return NextResponse.json({
          error: 'Storage bucket not configured. Create a bucket named "signals" in Supabase Storage.',
          setup: true,
        }, { status: 500 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path)

    return NextResponse.json({ url: publicUrl, path, type: file.type })
  } catch (err) {
    console.error('[Upload error]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

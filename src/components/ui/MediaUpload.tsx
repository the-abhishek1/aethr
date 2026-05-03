'use client'
import { useState, useRef, useCallback } from 'react'

interface MediaUploadProps {
  onUpload: (url: string, type: string) => void
  onClear: () => void
  preview?: string
  accept?: string
}

export default function MediaUpload({ onUpload, onClear, preview, accept = 'image/*,video/mp4,video/webm' }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File) => {
    setUploading(true); setError(''); setProgress(10)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'signals')

    try {
      setProgress(40)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      setProgress(80)
      const data = await res.json()

      if (!res.ok) {
        if (data.setup) {
          setError('Storage not set up yet. Create a "signals" bucket in Supabase Storage (public read).')
        } else {
          setError(data.error || 'Upload failed')
        }
        return
      }

      setProgress(100)
      onUpload(data.url, data.type)
    } catch {
      setError('Upload failed. Check your connection.')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }, [onUpload])

  const handleFile = (file: File) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return }
    upload(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  // If we have a preview, show it
  if (preview) {
    const isVideo = preview.includes('.mp4') || preview.includes('.webm') || preview.includes('video')
    return (
      <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
        {isVideo ? (
          <video src={preview} controls style={{ width: '100%', maxHeight: 240, borderRadius: '2px', border: '0.5px solid var(--border)' }} />
        ) : (
          <img src={preview} alt="attachment" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: '2px', border: '0.5px solid var(--border)', display: 'block' }} />
        )}
        <button onClick={onClear} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: 24, height: 24, borderRadius: '50%', background: 'rgba(4,4,10,0.85)', border: '0.5px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        style={{ border: `0.5px dashed ${dragOver ? 'var(--aether)' : 'var(--border)'}`, borderRadius: '2px', padding: '0.75rem 1rem', cursor: 'none', transition: 'all 0.2s', background: dragOver ? 'var(--aether-dim)' : 'transparent', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
      >
        <span style={{ fontSize: '1.1rem' }}>📎</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: uploading ? 'var(--aether)' : 'var(--text-dim)' }}>
          {uploading ? `Uploading... ${progress}%` : 'Attach image or video (max 10MB)'}
        </span>
        {progress > 0 && progress < 100 && (
          <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--aether)', transition: 'width 0.3s ease' }} />
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
      {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#D85A30', marginTop: '0.35rem' }}>{error}</p>}
    </div>
  )
}

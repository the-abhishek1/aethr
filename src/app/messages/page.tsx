'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRealtimeMessages } from '@/hooks/useRealtime'
import SectionLabel from '@/components/ui/SectionLabel'
import { useAuth } from '@/context/AuthContext'

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [partner, setPartner] = useState<any>(null)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newUserId, setNewUserId] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [typing, setTyping] = useState(false)
  const typingTimer = useRef<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadConvs = useCallback(async () => {
    const res = await fetch('/api/messages')
    const data = await res.json()
    setConversations(data.conversations || [])
    setLoading(false)
  }, [])

  const loadThread = useCallback(async (userId: string) => {
    const res = await fetch(`/api/messages/${userId}`)
    const data = await res.json()
    setMessages(data.messages || [])
    setPartner(data.partner)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [])

  useEffect(() => { loadConvs() }, [loadConvs])

  // Live messages — incoming DMs appear instantly
  useRealtimeMessages(useCallback((msg: any) => {
    // Refresh conversations list
    loadConvs()
    // If this thread is open, append message
    if (partner && (msg.from_user_id === partner.id || msg.to_user_id === partner.id)) {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [partner, loadConvs]))

  useEffect(() => {
    if (selected) loadThread(selected.user.id)
  }, [selected, loadThread])

  const handleContentChange = (val: string) => {
    setContent(val)
    setTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setTyping(false), 1500)
  }

  const send = async () => {
    if (!content.trim() || !partner) return
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId: partner.id, content }),
    })
    const data = await res.json()
    if (data.message) {
      setMessages(prev => [...prev, data.message])
      setContent('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    setSending(false)
  }

  const startNew = async () => {
    const name = newUserId.trim().replace('@', '')
    if (!name) return
    // Use profile PUT endpoint — works for any username length
    const res = await fetch(`/api/profile?username=${encodeURIComponent(name)}`, { method: 'PUT' })
    if (!res.ok) { alert('User not found'); return }
    const data = await res.json()
    const found = data.user
    if (!found) { alert('User not found'); return }
    setPartner(found)
    setMessages([])
    setSelected({ user: found })
    setShowNew(false)
    setNewUserId('')
  }

  return (
    <>
      <style>{`
        .msg-layout { display: grid; grid-template-columns: 280px 1fr; height: calc(100vh - 140px); }
        .msg-list { border-right: 0.5px solid var(--border); overflow-y: auto; }
        .msg-thread { display: flex; flex-direction: column; }
        @media (max-width: 768px) {
          .msg-layout { grid-template-columns: 1fr !important; height: auto !important; }
          .msg-list { border-right: none !important; border-bottom: 0.5px solid var(--border); max-height: 240px; }
        }
      `}</style>

      <div style={{ paddingTop: '7rem' }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <SectionLabel>Transmission</SectionLabel>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300 }}>Messages</h1>
          </div>
          <button onClick={() => setShowNew(!showNew)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.5rem 1.1rem', background: 'transparent', border: `0.5px solid ${showNew ? 'var(--aether)' : 'var(--border)'}`, color: showNew ? 'var(--aether)' : 'var(--text-dim)', borderRadius: '2px', cursor: 'none' }}>{showNew ? '× Cancel' : '+ New'}</button>
        </div>

        {showNew && (
          <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid var(--border)', background: 'var(--deep)', display: 'flex', gap: '0.5rem' }}>
            <input value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="Search username..." onKeyDown={e => e.key === 'Enter' && startNew()} style={{ flex: 1, background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.6rem 0.9rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text)' }} />
            <button onClick={startNew} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.6rem 1.25rem', background: 'var(--aether)', color: 'var(--void)', border: 'none', borderRadius: '2px', cursor: 'none' }}>Find →</button>
          </div>
        )}

        <div className="msg-layout">
          {/* Conversation list */}
          <div className="msg-list">
            {loading ? (
              <div style={{ padding: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', textAlign: 'center' }}>Loading...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>No messages yet.<br />Start a new conversation.</p>
              </div>
            ) : conversations.map((c: any) => (
              <div key={c.user.id} onClick={() => setSelected(c)} style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)', cursor: 'none', background: selected?.user.id === c.user.id ? 'var(--deep)' : 'transparent', borderLeft: `2px solid ${selected?.user.id === c.user.id ? 'var(--aether)' : 'transparent'}`, transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, position: 'relative' }}>
                    {c.user.avatarEmoji}
                    {c.unread > 0 && <span style={{ position: 'absolute', top: -2, right: -2, width: 14, height: 14, borderRadius: '50%', background: 'var(--aether)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.45rem', color: 'var(--void)', fontWeight: 700 }}>{c.unread}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.15rem' }}>@{c.user.username}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage.content.slice(0, 40)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Thread */}
          <div className="msg-thread">
            {!partner ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>Select a conversation or start a new one.</p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{partner.avatarEmoji}</div>
                  <div>
                    <Link href={`/profile/${partner.username}`} style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', textDecoration: 'none' }}>@{partner.username} →</Link>
                    {partner.bio && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--text-dim)' }}>{partner.bio.slice(0, 60)}</div>}
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>Start the conversation.</div>
                  )}
                  {messages.map((m: any) => {
                    const isMe = m.fromUserId === user?.id
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '70%', padding: '0.65rem 1rem', borderRadius: '2px', background: isMe ? 'var(--aether-dim)' : 'var(--deep)', border: `0.5px solid ${isMe ? 'rgba(168,155,255,0.3)' : 'var(--border)'}` }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.5 }}>{m.content}</p>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', marginTop: '0.25rem', textAlign: isMe ? 'right' : 'left' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '0.75rem 1.5rem', borderTop: '0.5px solid var(--border)' }}>
                  {/* Typing indicator */}
                  {typing && partner && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ display: 'flex', gap: '2px' }}>
                        {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-dim)', display: 'block', animation: `pulse-soft 1s ${i * 0.15}s infinite` }} />)}
                      </span>
                      You are typing...
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input value={content} onChange={e => handleContentChange(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder={`Message @${partner.username}...`} style={{ flex: 1, background: 'transparent', border: '0.5px solid var(--border-bright)', borderRadius: '2px', outline: 'none', padding: '0.7rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text)', transition: 'border-color 0.2s' }} onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--aether)'} onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border-bright)'} />
                    <button onClick={send} disabled={sending || !content.trim()} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.7rem 1.25rem', background: content.trim() ? 'var(--aether)' : 'var(--aether-dim)', color: content.trim() ? 'var(--void)' : 'var(--aether)', border: 'none', borderRadius: '2px', cursor: 'none', whiteSpace: 'nowrap' }}>Send →</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

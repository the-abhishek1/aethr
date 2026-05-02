'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WORLDS } from '@/lib/constants'

const steps = ['signal','persona','world','presence']
const personas = [
  { id: 'creator', label: 'The Creator', desc: 'You make things. Art, music, ideas, code.', glyph: '🔥' },
  { id: 'explorer', label: 'The Explorer', desc: 'You discover. Curious about everything.', glyph: '🔭' },
  { id: 'connector', label: 'The Connector', desc: 'You gather people. The social glue.', glyph: '🌿' },
  { id: 'challenger', label: 'The Challenger', desc: 'You debate. Ideas need scrutiny.', glyph: '⚔️' },
]
const presences = [
  { id: 'open', label: 'Open to connect', color: '#a89bff' },
  { id: 'creating', label: 'Creating', color: '#BA7517' },
  { id: 'exploring', label: 'Exploring', color: '#378ADD' },
  { id: 'deep-work', label: 'Deep work', color: '#1D9E75' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [persona, setPersona] = useState('')
  const [world, setWorld] = useState('')
  const [presence, setPresence] = useState('')
  const router = useRouter()
  const liveWorlds = WORLDS.filter(w => w.status === 'live')
  const disabled = (step === 0 && !name.trim()) || (step === 1 && !persona) || (step === 2 && !world) || (step === 3 && !presence)

  return (
    <>
      <style>{`
        .onboard-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 7rem 1.5rem 3rem; }
        .onboard-inner { width: 100%; max-width: 560px; animation: fadeUp 0.5s ease; }
        .persona-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 480px) { .persona-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div className="onboard-wrap">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '4rem' }}>
          {steps.map((_,i) => <div key={i} style={{ width: i===step?24:6, height:6, borderRadius:3, background: i===step?'var(--aether)':i<step?'var(--border-bright)':'var(--border)', transition:'all 0.3s ease' }} />)}
        </div>
        <div className="onboard-inner">
          {step === 0 && (
            <div>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--aether)', marginBottom:'1.5rem' }}>Your signal</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,6vw,4rem)', fontWeight:300, lineHeight:1.1, marginBottom:'2.5rem' }}>What shall the<br /><em style={{color:'var(--aether)'}}>galaxy call you?</em></h2>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name or alias..." style={{ width:'100%', background:'transparent', border:'none', borderBottom:'0.5px solid var(--border-bright)', outline:'none', padding:'1rem 0', fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,5vw,2rem)', fontWeight:300, color:'var(--text)' }} />
            </div>
          )}
          {step === 1 && (
            <div>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--aether)', marginBottom:'1.5rem' }}>Your nature</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:300, lineHeight:1.1, marginBottom:'2.5rem' }}>Which facet<br /><em style={{color:'var(--gold)'}}>leads you?</em></h2>
              <div className="persona-grid">
                {personas.map(p => (
                  <button key={p.id} onClick={()=>setPersona(p.id)} style={{ padding:'1.25rem', border:`0.5px solid ${persona===p.id?'var(--aether)':'var(--border)'}`, background:persona===p.id?'var(--aether-dim)':'var(--deep)', borderRadius:'2px', cursor:'none', textAlign:'left', transition:'all 0.2s' }}>
                    <div style={{fontSize:'1.3rem',marginBottom:'0.6rem'}}>{p.glyph}</div>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:persona===p.id?'var(--aether)':'var(--text)',marginBottom:'0.3rem'}}>{p.label}</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'var(--text-muted)',lineHeight:1.6}}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--aether)', marginBottom:'1.5rem' }}>First step</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:300, lineHeight:1.1, marginBottom:'2.5rem' }}>Where will you<br /><em style={{color:'var(--gold)'}}>enter first?</em></h2>
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {liveWorlds.map(w => (
                  <button key={w.id} onClick={()=>setWorld(w.id)} style={{ padding:'1.25rem 1.5rem', border:`0.5px solid ${world===w.id?w.color:'var(--border)'}`, background:world===w.id?`${w.color}11`:'var(--deep)', borderRadius:'2px', cursor:'none', textAlign:'left', display:'flex', alignItems:'center', gap:'1.25rem', transition:'all 0.2s' }}>
                    <span style={{fontSize:'1.4rem'}}>{w.glyph}</span>
                    <div>
                      <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:world===w.id?w.color:'var(--text)'}}>{w.name}</div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:'0.6rem',color:'var(--text-muted)'}}>{w.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--aether)', marginBottom:'1.5rem' }}>Your aura</p>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:300, lineHeight:1.1, marginBottom:'0.75rem' }}>How are you<br /><em style={{color:'var(--aether)'}}>arriving today?</em></h2>
              <p style={{fontFamily:'var(--font-mono)',fontSize:'0.68rem',color:'var(--text-muted)',lineHeight:1.8,marginBottom:'2.5rem'}}>Others sense your presence without interrupting it.</p>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {presences.map(p => (
                  <button key={p.id} onClick={()=>setPresence(p.id)} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem', border:`0.5px solid ${presence===p.id?p.color+'66':'var(--border)'}`, background:presence===p.id?`${p.color}11`:'transparent', borderRadius:'2px', cursor:'none', transition:'all 0.2s' }}>
                    <span style={{width:10,height:10,borderRadius:'50%',background:p.color,flexShrink:0,opacity:presence===p.id?1:0.4,boxShadow:presence===p.id?`0 0 8px ${p.color}`:'none',transition:'all 0.2s'}} />
                    <span style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',color:presence===p.id?'var(--text)':'var(--text-muted)'}}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => { if (step < steps.length-1) setStep(s=>s+1); else router.push('/dashboard') }} disabled={disabled} style={{ marginTop:'3rem', width:'100%', fontFamily:'var(--font-mono)', fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'1rem', borderRadius:'2px', border:'none', background:'var(--aether)', color:'var(--void)', cursor:'none', opacity: disabled ? 0.3 : 1, transition:'opacity 0.2s' }}>
            {step === steps.length-1 ? 'Enter Aethr →' : 'Continue →'}
          </button>
        </div>
      </div>
    </>
  )
}

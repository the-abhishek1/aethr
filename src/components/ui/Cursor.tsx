'use client'
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0, rx: 0, ry: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX
      pos.current.y = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    let raf: number
    const animate = () => {
      const { x, y } = pos.current
      pos.current.rx += (x - pos.current.rx) * 0.12
      pos.current.ry += (y - pos.current.ry) * 0.12
      if (dotRef.current) {
        dotRef.current.style.left = x + 'px'
        dotRef.current.style.top = y + 'px'
      }
      if (ringRef.current) {
        ringRef.current.style.left = pos.current.rx + 'px'
        ringRef.current.style.top = pos.current.ry + 'px'
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    const grow = () => {
      if (ringRef.current) {
        ringRef.current.style.width = '48px'
        ringRef.current.style.height = '48px'
        ringRef.current.style.borderColor = 'rgba(168,155,255,0.6)'
      }
    }
    const shrink = () => {
      if (ringRef.current) {
        ringRef.current.style.width = '32px'
        ringRef.current.style.height = '32px'
        ringRef.current.style.borderColor = 'rgba(168,155,255,0.35)'
      }
    }
    document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', grow)
      el.addEventListener('mouseleave', shrink)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', width: 6, height: 6,
        background: 'var(--aether)', borderRadius: '50%',
        pointerEvents: 'none', zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'screen', transition: 'opacity 0.2s',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', width: 32, height: 32,
        border: '0.5px solid rgba(168,155,255,0.35)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 9998,
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.2s, height 0.2s, border-color 0.2s',
      }} />
    </>
  )
}

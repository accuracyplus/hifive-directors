import React, { useRef, useState } from 'react'

const THRESHOLD = 72  // px to reveal actions
const MAX_SWIPE = 140 // px max drag

export default function SwipeableCard({ children, onComplete, onCancel, disabled }) {
  const [offset, setOffset]   = useState(0)
  const [open,   setOpen]     = useState(false)
  const startX  = useRef(null)
  const startOff= useRef(0)
  const moving  = useRef(false)

  if (disabled) return <div>{children}</div>

  function onTouchStart(e) {
    startX.current  = e.touches[0].clientX
    startOff.current = offset
    moving.current  = false
  }

  function onTouchMove(e) {
    const dx = e.touches[0].clientX - startX.current
    if (Math.abs(dx) < 6) return
    moving.current = true
    const next = Math.max(-MAX_SWIPE, Math.min(0, startOff.current + dx))
    setOffset(next)
  }

  function onTouchEnd() {
    if (!moving.current) return
    if (offset < -THRESHOLD) {
      setOffset(-MAX_SWIPE)
      setOpen(true)
    } else {
      setOffset(0)
      setOpen(false)
    }
  }

  function close() { setOffset(0); setOpen(false) }

  async function handleAction(fn) {
    close()
    await fn()
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '18px' }}>
      {/* Action buttons revealed behind */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        display: 'flex', alignItems: 'stretch', gap: '4px', padding: '4px 4px 4px 0'
      }}>
        <button
          onClick={() => handleAction(onComplete)}
          style={{
            width: '64px', border: 'none', borderRadius: '14px',
            background: 'linear-gradient(180deg,#16a06d,#0f6e56)',
            color: '#fff', fontWeight: '700', fontSize: '11px',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '3px'
          }}
        >
          <span style={{ fontSize: '18px' }}>✓</span>
          Done
        </button>
        <button
          onClick={() => handleAction(onCancel)}
          style={{
            width: '64px', border: 'none', borderRadius: '14px',
            background: 'linear-gradient(180deg,#d9534f,#c0392b)',
            color: '#fff', fontWeight: '700', fontSize: '11px',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '3px'
          }}
        >
          <span style={{ fontSize: '18px' }}>✕</span>
          Cancel
        </button>
      </div>

      {/* Card — slides left */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: moving.current ? 'none' : 'transform 0.25s ease',
          position: 'relative', zIndex: 1,
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  )
}

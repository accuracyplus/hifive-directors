import React, { useState, useEffect } from 'react'
import { DIRS, DIR_ORDER } from '../constants.js'

const NAVY = '#0a2240'

// ── Google Fonts (Nunito — rounded, elegant) ──────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap"

// ── Director cards config ─────────────────────────────────────────────────────
const DIRECTOR_ORDER = [...DIR_ORDER, 'admin']
const DIRECTOR_LABELS = {
  ameen:'Ameen', junaid:'Junaid', praveen:'Praveen',
  sajeed:'Sajeed', suhail:'Suhail', admin:'Admin / PA'
}

// ── Bouncing loader ───────────────────────────────────────────────────────────
function BouncingLoader() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
      <div className="hf-loader-wrapper">
        <div className="hf-circle" />
        <div className="hf-circle" />
        <div className="hf-circle" />
        <div className="hf-shadow" />
        <div className="hf-shadow" />
        <div className="hf-shadow" />
      </div>
      <div style={{ fontSize:'13px', fontWeight:'600', color:'rgba(255,255,255,0.7)', letterSpacing:'.04em' }}>Verifying…</div>
    </div>
  )
}

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, subtext, type='error', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [])

  const isError = type==='error'
  const color   = isError ? '#c0392b' : '#0f6e56'
  const bgColor = isError ? '#fef2f2' : '#f0fdf4'
  const fillColor = isError ? 'rgba(192,57,43,0.15)' : 'rgba(4,228,0,0.15)'
  const iconBg  = isError ? 'rgba(192,57,43,0.15)' : 'rgba(4,228,0,0.28)'

  return (
    <div style={{ position:'absolute', top:'16px', left:'50%', transform:'translateX(-50%)', zIndex:100, width:'320px', animation:'hf-toast-in 0.3s cubic-bezier(.2,.7,.2,1)' }}>
      <div className="hf-toast-card" style={{ background:'#ffffff', borderRadius:'12px', boxShadow:'rgba(149,157,165,0.25) 0px 8px 24px', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'space-around', gap:'12px', padding:'12px 14px', height:'72px' }}>
        {/* Wave */}
        <svg className="hf-wave" style={{ position:'absolute', transform:'rotate(90deg)', left:'-28px', top:'28px', width:'72px', fill:fillColor }} viewBox="0 0 440 440">
          <path d="M0,440 C160,440 280,280 440,280 L440,440 Z"/>
        </svg>
        {/* Icon */}
        <div style={{ width:'32px', height:'32px', display:'flex', justifyContent:'center', alignItems:'center', background:iconBg, borderRadius:'50%', flexShrink:0, marginLeft:'6px' }}>
          {isError ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6m0-6 6 6"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
          )}
        </div>
        {/* Text */}
        <div style={{ display:'flex', flexDirection:'column', flexGrow:1 }}>
          <p style={{ margin:0, color, fontSize:'15px', fontWeight:'700', fontFamily:'Nunito,sans-serif' }}>{message}</p>
          {subtext && <p style={{ margin:0, fontSize:'12px', color:'#555', fontFamily:'Nunito,sans-serif' }}>{subtext}</p>}
        </div>
        {/* Close */}
        <svg onClick={onClose} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" style={{ cursor:'pointer', flexShrink:0 }}><path d="m18 6-12 12m0-12 12 12"/></svg>
      </div>
    </div>
  )
}

export default function LoginScreen({ selUser, onSelectUser, pin, onKey, onBack, error, busy }) {
  const [toast, setToast] = useState(null)

  // Show toast when error arrives
  useEffect(() => {
    if (error) setToast({ message:'Incorrect PIN', subtext:'Please try again', type:'error' })
  }, [error])

  const keys = ['1','2','3','4','5','6','7','8','9',null,'0','⌫']

  return (
    <>
      {/* Inject styles */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={FONT_LINK} rel="stylesheet" />
      <style>{`
        *, *::before, *::after { font-family: 'Nunito', -apple-system, sans-serif !important; }

        .hf-login-bg {
          background: radial-gradient(ellipse at 20% 20%, rgba(21,101,168,0.55), transparent 55%),
                      radial-gradient(ellipse at 80% 10%, rgba(43,166,164,0.35), transparent 50%),
                      radial-gradient(ellipse at 80% 80%, rgba(133,79,11,0.3), transparent 55%),
                      radial-gradient(ellipse at 10% 80%, rgba(153,53,86,0.25), transparent 50%),
                      linear-gradient(160deg, #06112a 0%, #0c2040 50%, #081828 100%);
          min-height: 100%;
        }

        .hf-dir-btn {
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border-radius: 18px;
          padding: 10px 8px;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(.2,.7,.2,1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.85);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .01em;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
        }
        .hf-dir-btn.selected {
          background: rgba(255,255,255,0.22);
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 8px 32px -8px rgba(21,101,168,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
          transform: translateY(-2px);
          color: #fff;
        }
        .hf-dir-btn:active { transform: scale(0.95); }

        .hf-numkey {
          height: 60px;
          border-radius: 18px;
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.16);
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s ease;
          -webkit-tap-highlight-color: transparent;
          letter-spacing: 0;
        }
        .hf-numkey:active {
          background: rgba(255,255,255,0.25);
          transform: scale(0.94);
        }

        .hf-login-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 100%);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.35);
          color: #fff;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: .02em;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 32px -8px rgba(0,0,0,0.4);
          transition: all 0.18s ease;
        }
        .hf-login-btn:active { transform: scale(0.98); opacity: 0.85; }

        /* Bouncing loader */
        .hf-loader-wrapper {
          width: 120px;
          height: 50px;
          position: relative;
        }
        .hf-circle {
          width: 16px; height: 16px;
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          left: 15%;
          transform-origin: 50%;
          animation: hfBounce .5s alternate infinite ease;
        }
        .hf-circle:nth-child(2) { left: 45%; animation-delay: .2s; }
        .hf-circle:nth-child(3) { left: auto; right: 15%; animation-delay: .3s; }
        .hf-shadow {
          width: 16px; height: 3px;
          border-radius: 50%;
          background: rgba(0,0,0,0.35);
          position: absolute;
          top: 52px;
          transform-origin: 50%;
          z-index: -1;
          left: 15%;
          filter: blur(1px);
          animation: hfShadow .5s alternate infinite ease;
        }
        .hf-shadow:nth-child(4) { left: 45%; animation-delay: .2s; }
        .hf-shadow:nth-child(5) { left: auto; right: 15%; animation-delay: .3s; }

        @keyframes hfBounce {
          0%   { top: 50px; height: 5px; border-radius: 50px 50px 25px 25px; transform: scaleX(1.7); }
          40%  { height: 16px; border-radius: 50%; transform: scaleX(1); }
          100% { top: 0%; }
        }
        @keyframes hfShadow {
          0%   { transform: scaleX(1.5); }
          40%  { transform: scaleX(1); opacity: .7; }
          100% { transform: scaleX(.2); opacity: .4; }
        }

        @keyframes hf-toast-in {
          from { opacity:0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="hf-login-bg" style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>

        {/* Toast */}
        {toast && <Toast {...toast} onClose={()=>setToast(null)} />}

        {/* Scrollable body */}
        <div style={{ flex:1, overflowY:'auto', padding:'32px 22px 28px', display:'flex', flexDirection:'column', gap:'24px' }}>

          {/* Logo + brand */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
            <div style={{
              width:'80px', height:'80px', borderRadius:'24px',
              background:'rgba(255,255,255,0.12)',
              backdropFilter:'blur(20px) saturate(180%)',
              WebkitBackdropFilter:'blur(20px) saturate(180%)',
              border:'1px solid rgba(255,255,255,0.25)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'inset 0 1px 0 rgba(255,255,255,0.3), 0 16px 40px -12px rgba(0,0,0,0.5)'
            }}>
              <img
                src="/logo.png"
                alt="HiFive"
                style={{ width:'58px', height:'58px', objectFit:'contain', filter:'brightness(0) invert(1)' }}
                onError={e=>{e.target.style.display='none'}}
              />
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'22px', fontWeight:'900', color:'#fff', letterSpacing:'.01em', lineHeight:'1.2' }}>Director Tracker</div>
              <div style={{ fontSize:'12px', fontWeight:'600', color:'rgba(255,255,255,0.55)', marginTop:'3px', letterSpacing:'.06em', textTransform:'uppercase' }}>HiFive Holdings</div>
            </div>
          </div>

          {/* Director selector */}
          <div>
            <div style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.5)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'12px' }}>Select your name</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
              {DIRECTOR_ORDER.map(id => {
                const d = DIRS[id]
                const isSel = selUser === id
                return (
                  <button
                    key={id}
                    onClick={() => onSelectUser(id)}
                    className={`hf-dir-btn${isSel?' selected':''}`}
                  >
                    {/* Avatar circle */}
                    <div style={{
                      width:'38px', height:'38px', borderRadius:'50%',
                      background: isSel ? d.color : `${d.color}55`,
                      border: isSel ? `2px solid ${d.color}` : '2px solid rgba(255,255,255,0.15)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'13px', fontWeight:'800', color:'#fff',
                      transition:'all 0.18s ease',
                      boxShadow: isSel ? `0 4px 16px -4px ${d.color}` : 'none'
                    }}>{d.initials}</div>
                    {DIRECTOR_LABELS[id]}
                    {/* Selected checkmark */}
                    {isSel && (
                      <div style={{ position:'absolute', top:'6px', right:'6px', width:'16px', height:'16px', borderRadius:'50%', background:d.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="m20 6-11 11-5-5"/></svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* PIN section */}
          <div>
            <div style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.5)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'14px', textAlign:'center' }}>Enter your PIN</div>

            {/* PIN dots */}
            <div style={{ display:'flex', gap:'14px', justifyContent:'center', marginBottom:'20px' }}>
              {[0,1,2,3].map(i=>(
                <div key={i} style={{
                  width:'14px', height:'14px', borderRadius:'50%',
                  background: i<pin.length ? '#fff' : 'transparent',
                  border: `2px solid ${i<pin.length ? '#fff' : 'rgba(255,255,255,0.35)'}`,
                  boxShadow: i<pin.length ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                  transition:'all 0.15s cubic-bezier(.2,.7,.2,1)'
                }}/>
              ))}
            </div>

            {/* Numpad */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', maxWidth:'260px', margin:'0 auto' }}>
              {keys.map((k,i)=>{
                if (k===null) return <div key={i}/>
                if (k==='⌫') return (
                  <button key={i} onClick={onBack} className="hf-numkey" style={{ fontSize:'18px' }}>⌫</button>
                )
                return <button key={i} onClick={()=>onKey(k)} className="hf-numkey" disabled={busy}>{k}</button>
              })}
            </div>
          </div>

          {/* Login / Loading */}
          {busy ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'8px 0' }}>
              <BouncingLoader/>
            </div>
          ) : (
            <button
              onClick={()=>{
                if (!selUser) { setToast({message:'Select a name first',subtext:'Tap your name above',type:'error'}); return }
                if (pin.length<4) { setToast({message:'Enter your 4-digit PIN',subtext:'',type:'error'}); return }
              }}
              className="hf-login-btn"
              disabled={pin.length<4||!selUser}
              style={{ opacity: pin.length<4||!selUser ? 0.5 : 1 }}
            >
              Sign in
            </button>
          )}

          <div style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.3)', fontWeight:'600', letterSpacing:'.04em' }}>
            HIFIVE HOLDINGS LLC · UAE
          </div>
        </div>
      </div>
    </>
  )
}

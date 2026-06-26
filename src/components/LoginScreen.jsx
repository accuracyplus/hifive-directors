import React, { useState, useEffect, useRef } from 'react'
import { DIRS, DIR_ORDER } from '../constants.js'

const ALL_USERS = [...DIR_ORDER, 'admin']
const DIR_LABELS = { ameen:'Ameen', junaid:'Junaid', praveen:'Praveen', sajeed:'Sajeed', suhail:'Suhail', admin:'Admin / PA' }

// ── Biometric helper (WebAuthn / platform authenticator) ─────────────────────
async function tryBiometric(username) {
  try {
    if (!window.PublicKeyCredential) return null
    const avail = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    if (!avail) return null

    // Create a challenge — in production this comes from the server
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname
      }
    })
    return credential ? true : null
  } catch(e) {
    // User cancelled or not enrolled — fall through to PIN
    return null
  }
}

function Toast({ message, subtext, type='error', onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,3500); return()=>clearTimeout(t) },[])
  const col = type==='error'?'#c0392b':'#0f6e56'
  const bg  = type==='error'?'#fef2f2':'#f0fdf4'
  const bdr = type==='error'?'#fecaca':'#bbf7d0'
  return (
    <div style={{position:'absolute',top:'12px',left:'50%',transform:'translateX(-50%)',zIndex:200,width:'300px',animation:'hfToastIn 0.3s ease'}}>
      <div style={{background:'#fff',borderRadius:'16px',boxShadow:'0 8px 32px -8px rgba(15,23,42,0.2)',padding:'12px 14px',display:'flex',alignItems:'center',gap:'10px',border:`1.5px solid ${bdr}`}}>
        <div style={{width:'30px',height:'30px',borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          {type==='error'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6m0-6 6 6"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
          }
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:'13px',fontWeight:'700',color:col}}>{message}</div>
          {subtext&&<div style={{fontSize:'11px',color:'#64748b',marginTop:'1px'}}>{subtext}</div>}
        </div>
        <svg onClick={onClose} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" style={{cursor:'pointer'}}><path d="m18 6-12 12m0-12 12 12"/></svg>
      </div>
    </div>
  )
}

function FaceIDIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>
      <path d="M9 15s1 1 3 1 3-1 3-1"/>
    </svg>
  )
}

export default function LoginScreen({ selUser, onSelectUser, pin, onKey, onBack, error, busy, onBiometricSuccess }) {
  const [toast, setToast]         = useState(null)
  const [bioAvail, setBioAvail]   = useState(false)
  const [bioTrying, setBioTrying] = useState(false)
  const [showPIN, setShowPIN]     = useState(false)

  useEffect(()=>{
    if (error) setToast({message:'Incorrect PIN',subtext:'Please try again',type:'error'})
  },[error])

  useEffect(()=>{
    PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.()
      .then(v=>setBioAvail(v))
      .catch(()=>setBioAvail(false))
  },[])

  async function handleBiometric() {
    if (!selUser){setToast({message:'Select your name first',subtext:'',type:'error'});return}
    if (selUser==='admin'){setShowPIN(true);return} // admin always uses PIN
    setBioTrying(true)
    const result = await tryBiometric(selUser)
    setBioTrying(false)
    if (result) {
      onBiometricSuccess(selUser)
    } else {
      setShowPIN(true)
    }
  }

  const isAdmin = selUser==='admin'
  const keys=['1','2','3','4','5','6','7','8','9',null,'0','⌫']

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .hf-login-root * { font-family:'Nunito',sans-serif!important; }
        .hf-login-bg {
          background: linear-gradient(160deg,#f0f7ff 0%,#e8f4fd 40%,#dbeafe 70%,#eff6ff 100%);
          position:relative; overflow:hidden;
        }
        .hf-orb { position:absolute;border-radius:50%;filter:blur(45px);opacity:0.55;animation:hfFloat 9s ease-in-out infinite;pointer-events:none; }
        .hf-orb-1{width:240px;height:240px;background:radial-gradient(circle,rgba(59,130,246,0.35),transparent);top:-80px;left:-70px;animation-delay:0s}
        .hf-orb-2{width:190px;height:190px;background:radial-gradient(circle,rgba(99,179,237,0.3),transparent);top:28%;right:-50px;animation-delay:2.5s}
        .hf-orb-3{width:170px;height:170px;background:radial-gradient(circle,rgba(147,197,253,0.4),transparent);bottom:22%;left:5%;animation-delay:5s}
        .hf-orb-4{width:130px;height:130px;background:radial-gradient(circle,rgba(191,219,254,0.5),transparent);bottom:8%;right:8%;animation-delay:1.5s}
        @keyframes hfFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(14px,-20px) scale(1.06)}66%{transform:translate(-10px,12px) scale(0.94)}}
        .hf-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(59,130,246,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.045) 1px,transparent 1px);background-size:34px 34px}

        .hf-dir-btn{background:#fff;border:2px solid #e2e8f0;border-radius:18px;padding:11px 6px 9px;cursor:pointer;transition:all 0.2s cubic-bezier(.2,.7,.2,1);display:flex;flex-direction:column;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#475569;-webkit-tap-highlight-color:transparent;position:relative;box-shadow:0 2px 8px -4px rgba(15,23,42,0.1)}
        .hf-dir-btn.sel{background:#0a2240;border-color:#0a2240;color:#fff;box-shadow:0 10px 24px -6px rgba(10,34,64,0.45),0 0 0 4px rgba(10,34,64,0.12);transform:translateY(-3px) scale(1.03)}
        .hf-dir-btn:active{transform:scale(0.94)}

        .hf-numkey{height:56px;border-radius:16px;background:#fff;border:1.5px solid #e2e8f0;font-size:22px;font-weight:700;color:#1e293b;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.1s ease;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px -4px rgba(15,23,42,0.08)}
        .hf-numkey:active{background:#f1f5f9;transform:scale(0.92);box-shadow:none}

        .hf-bio-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:15px;border:2px solid #0a2240;border-radius:18px;background:#fff;color:#0a2240;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px -6px rgba(10,34,64,0.2);transition:all 0.18s ease;-webkit-tap-highlight-color:transparent}
        .hf-bio-btn:active{transform:scale(0.97);background:#f8fafc}

        .hf-sign-btn{width:100%;padding:15px;border:none;border-radius:18px;background:linear-gradient(135deg,#1565a8,#0a2240);color:#fff;font-size:16px;font-weight:800;cursor:pointer;letter-spacing:.02em;box-shadow:0 8px 24px -6px rgba(10,34,64,0.45);transition:all 0.18s ease}
        .hf-sign-btn:active{transform:scale(0.98)}
        .hf-sign-btn:disabled{opacity:0.4}

        .hf-pin-fallback{text-align:center;font-size:12px;color:#94a3b8;font-weight:600;cursor:pointer;padding:4px;text-decoration:underline;text-underline-offset:3px}

        .hf-loader-wrapper{width:100px;height:44px;position:relative}
        .hf-circle{width:14px;height:14px;position:absolute;border-radius:50%;left:15%;transform-origin:50%;animation:hfBounce .5s alternate infinite ease}
        .hf-circle:nth-child(2){left:45%;animation-delay:.2s}
        .hf-circle:nth-child(3){left:auto;right:15%;animation-delay:.3s}
        .hf-shadow{width:14px;height:3px;border-radius:50%;background:rgba(0,0,0,0.1);position:absolute;top:46px;transform-origin:50%;z-index:-1;left:15%;filter:blur(1px);animation:hfShadow .5s alternate infinite ease}
        .hf-shadow:nth-child(4){left:45%;animation-delay:.2s}
        .hf-shadow:nth-child(5){left:auto;right:15%;animation-delay:.3s}
        @keyframes hfBounce{0%{top:44px;height:5px;border-radius:50px 50px 25px 25px;transform:scaleX(1.7)}40%{height:14px;border-radius:50%;transform:scaleX(1)}100%{top:0%}}
        @keyframes hfShadow{0%{transform:scaleX(1.5)}40%{transform:scaleX(1);opacity:.7}100%{transform:scaleX(.2);opacity:.4}}
        @keyframes hfToastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes hfSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hf-pin-section{animation:hfSlideUp 0.3s ease}
      `}</style>

      <div className="hf-login-root hf-login-bg" style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',position:'relative'}}>
        <div className="hf-grid"/>
        <div className="hf-orb hf-orb-1"/><div className="hf-orb hf-orb-2"/>
        <div className="hf-orb hf-orb-3"/><div className="hf-orb hf-orb-4"/>

        {toast&&<Toast {...toast} onClose={()=>setToast(null)}/>}

        <div style={{flex:1,overflowY:'auto',padding:'28px 20px 24px',display:'flex',flexDirection:'column',gap:'20px',position:'relative',zIndex:1}}>

          {/* Logo + brand */}
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'10px'}}>
            <div style={{width:'72px',height:'72px',borderRadius:'20px',background:'#0a2240',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 12px 32px -8px rgba(10,34,64,0.4)'}}>
              <img src="/logo.png" alt="HiFive" style={{width:'52px',height:'52px',objectFit:'contain',filter:'brightness(0) invert(1)'}} onError={e=>e.target.style.display='none'}/>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'21px',fontWeight:'900',color:'#0a2240'}}>Director Tracker</div>
              <div style={{fontSize:'10px',fontWeight:'700',color:'#94a3b8',marginTop:'2px',letterSpacing:'.1em',textTransform:'uppercase'}}>HiFive Holdings</div>
            </div>
          </div>

          {/* Director selector */}
          <div>
            <div style={{fontSize:'10px',fontWeight:'800',color:'#94a3b8',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'10px'}}>Who are you?</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
              {ALL_USERS.map(id=>{
                const d=DIRS[id]; const isSel=selUser===id
                return (
                  <button key={id} onClick={()=>{onSelectUser(id);setShowPIN(false)}} className={`hf-dir-btn${isSel?' sel':''}`}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',background:isSel?d.color:`${d.color}20`,border:`2.5px solid ${isSel?d.color:`${d.color}40`}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'800',color:isSel?'#fff':d.color,transition:'all 0.2s'}}>
                      {isSel
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="m20 6-11 11-5-5"/></svg>
                        : d.initials
                      }
                    </div>
                    {DIR_LABELS[id]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Auth section */}
          {selUser && (
            <div className="hf-pin-section" style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {/* Biometric button — shown when available and not admin and PIN not forced */}
              {bioAvail && !isAdmin && !showPIN && (
                <>
                  <button onClick={handleBiometric} className="hf-bio-btn" disabled={bioTrying}>
                    {bioTrying
                      ? <div className="hf-loader-wrapper" style={{margin:'0 auto',width:'80px',height:'32px',transform:'scale(0.7)'}}><div className="hf-circle" style={{background:'#0a2240'}}/><div className="hf-circle" style={{background:'#1565a8'}}/><div className="hf-circle" style={{background:'#2d8bdb'}}/><div className="hf-shadow"/><div className="hf-shadow"/><div className="hf-shadow"/></div>
                      : <><FaceIDIcon/>Use Face ID / Touch ID</>
                    }
                  </button>
                  <div className="hf-pin-fallback" onClick={()=>setShowPIN(true)}>Use PIN instead</div>
                </>
              )}

              {/* PIN entry — shown for admin, or when biometric not available, or user chose PIN */}
              {(isAdmin || !bioAvail || showPIN) && (
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  <div style={{fontSize:'10px',fontWeight:'800',color:'#94a3b8',letterSpacing:'.1em',textTransform:'uppercase',textAlign:'center'}}>Enter 4-digit PIN</div>
                  <div style={{display:'flex',gap:'14px',justifyContent:'center'}}>
                    {[0,1,2,3].map(i=>(
                      <div key={i} style={{width:'14px',height:'14px',borderRadius:'50%',background:i<pin.length?'#0a2240':'transparent',border:`2.5px solid ${i<pin.length?'#0a2240':'#cbd5e1'}`,boxShadow:i<pin.length?'0 0 0 3px rgba(10,34,64,0.12)':'none',transition:'all 0.15s ease'}}/>
                    ))}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',maxWidth:'252px',margin:'0 auto',width:'100%'}}>
                    {keys.map((k,i)=>{
                      if (k===null) return <div key={i}/>
                      if (k==='⌫') return <button key={i} onClick={onBack} className="hf-numkey" style={{fontSize:'18px',color:'#64748b'}}>⌫</button>
                      return <button key={i} onClick={()=>onKey(k)} className="hf-numkey" disabled={busy}>{k}</button>
                    })}
                  </div>
                  {busy && (
                    <div style={{display:'flex',justifyContent:'center',padding:'4px 0'}}>
                      <div className="hf-loader-wrapper">
                        <div className="hf-circle" style={{background:'#1565a8'}}/><div className="hf-circle" style={{background:'#0f6e56'}}/><div className="hf-circle" style={{background:'#c0392b'}}/>
                        <div className="hf-shadow"/><div className="hf-shadow"/><div className="hf-shadow"/>
                      </div>
                    </div>
                  )}
                  {!busy && showPIN && !isAdmin && (
                    <div className="hf-pin-fallback" onClick={()=>setShowPIN(false)}>← Back to Face ID</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{textAlign:'center',fontSize:'10px',color:'#94a3b8',fontWeight:'700',letterSpacing:'.06em',paddingTop:'4px'}}>HIFIVE HOLDINGS LLC · UAE</div>
        </div>
      </div>
    </>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { AdminOtpVerify } from '../../services/auth/authService'
import { toast } from 'react-toastify'

export default function OtpVerifyPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [timer, setTimer] = useState(120)
    const [canResend, setCanResend] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
    const [step, setStep] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const navigate = useNavigate();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(prev => (prev + 1) % 3)
        }, 2800)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (timer > 0) {
            const countdown = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(countdown)
        }
    }, [timer])

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1]
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (!pasted) return
        const newOtp = [...otp]
        pasted.split('').forEach((char, i) => { newOtp[i] = char })
        setOtp(newOtp)
        const nextEmpty = Math.min(pasted.length, 5)
        inputRefs.current[nextEmpty]?.focus()
    }

    const handleVerify = async () => {
        const finalOtp = otp.join("")
        setIsLoading(true)

        const data = await AdminOtpVerify(finalOtp)
        const message = data?.message || data?.massage || "Something went wrong."

        if (data?.status === 200) {
            toast.success(message);
            navigate('/reset-password');
        } else {
            toast.error(message);
        }

        setIsLoading(false)
    }

    const handleResend = async () => {
        setIsLoading(true)
        await new Promise(r => setTimeout(r, 1200))
        setIsLoading(false)
        setOtp(['', '', '', '', '', ''])
        setTimer(120)
        setCanResend(false)
        inputRefs.current[0]?.focus()
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const isOtpComplete = otp.every(d => d !== '')
    const timerPercent = (timer / 120) * 100

    const steps = [
        {
            id: 0,
            label: 'Enter Email',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" />
                </svg>
            ),
            desc: 'Enter your registered admin email address',
        },
        {
            id: 1,
            label: 'Verify OTP',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            ),
            desc: 'Enter the 6-digit OTP sent to your inbox',
        },
        {
            id: 2,
            label: 'Reset Password',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
            desc: 'Set your new secure password',
        },
    ]

    return (
        <div style={{
            height: '100vh',
            background: '#FAFAF8',
            display: 'flex',
            fontFamily: "'Outfit', sans-serif",
            overflow: 'hidden',
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes timerShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes popIn {
          0% { transform: scale(0.85); opacity: 0; }
          60% { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes digitFill {
          0% { transform: translateY(-8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .panel-left  { animation: fadeIn 0.7s ease both; }
        .panel-right { animation: scaleIn 0.6s cubic-bezier(0.4,0,0.2,1) 0.1s both; }

        .fr { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both; }
        .fr:nth-child(1){animation-delay:0.25s} .fr:nth-child(2){animation-delay:0.33s}
        .fr:nth-child(3){animation-delay:0.41s} .fr:nth-child(4){animation-delay:0.49s}
        .fr:nth-child(5){animation-delay:0.55s} .fr:nth-child(6){animation-delay:0.61s}

        .float-card { animation: floatCard 5s ease-in-out infinite; }

        .otp-input {
          width: 52px;
          height: 60px;
          background: #FFFFFF;
          border: 1.5px solid #E8E4DE;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 600;
          color: #1A1A1A;
          text-align: center;
          outline: none;
          transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
          caret-color: transparent;
        }
        .otp-input:focus {
          border-color: #2A6344;
          box-shadow: 0 0 0 3px rgba(42,99,68,0.10);
          background: #FDFFFE;
        }
        .otp-input.filled {
          border-color: #2A6344;
          background: #EAF4EE;
          animation: digitFill 0.18s ease both;
        }

        .cta-btn {
          width: 100%;
          padding: 14px;
          background: #1A1A1A;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: #FFFFFF;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: background 0.22s, transform 0.22s, box-shadow 0.22s;
        }
        .cta-btn:hover:not(:disabled) {
          background: #2A2A2A;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(26,26,26,0.16);
        }
        .cta-btn:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
        .cta-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .preview-digit {
          width: 28px;
          height: 32px;
          background: #F4F2EE;
          border: 1px solid #E0DDD6;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #B0ACA4;
          transition: all 0.3s ease;
        }
        .preview-digit.active {
          background: #EAF4EE;
          border-color: #2A6344;
          color: #2A6344;
        }
      `}</style>

            {/* ── LEFT PANEL ── */}
            {!isMobile && (
                <div className="panel-left" style={{
                    flex: 1,
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '40px 48px',
                    borderRight: '1px solid #EEEBE5',
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: 0,
                }}>
                    {/* Dot grid bg */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: 'radial-gradient(circle, #D4D0C8 1px, transparent 1px)',
                        backgroundSize: '26px 26px', opacity: 0.3,
                    }} />
                    {/* Top accent bar */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                        background: 'linear-gradient(90deg, #2A6344, #48A87A, #2A6344)',
                    }} />

                    {/* Logo */}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                            width: 36, height: 36, background: '#1A1A1A', borderRadius: 9,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, color: '#1A1A1A' }}>Arova</div>
                            <div style={{ fontSize: 10, color: '#8A8680', letterSpacing: '0.13em', textTransform: 'uppercase', fontWeight: 500 }}>Commerce Suite</div>
                        </div>
                    </div>

                    {/* Center preview card */}
                    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '20px 0' }}>

                        <div className="float-card" style={{
                            width: '100%', maxWidth: 340,
                            background: '#FAFAF8', border: '1px solid #E0DDD6',
                            borderRadius: 14, overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.04)',
                        }}>
                            {/* Fake browser bar */}
                            <div style={{ background: '#1A1A1A', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {['#FF6058', '#FFBD2E', '#27C93F'].map(c => (
                                    <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                                ))}
                                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginLeft: 6, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>arova.io/verify-otp</span>
                                </div>
                            </div>

                            <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {/* Steps */}
                                {steps.map((s, i) => (
                                    <div key={s.id} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                                        {i < steps.length - 1 && (
                                            <div style={{
                                                position: 'absolute', left: 17, top: 38, width: 2, height: 32,
                                                background: step >= i + 1 ? '#2A6344' : '#E8E4DC',
                                                transition: 'background 0.5s ease', borderRadius: 2,
                                            }} />
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: i < steps.length - 1 ? 28 : 0 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: step > s.id ? '#2A6344' : step === s.id ? '#EAF4EE' : '#F4F2EE',
                                                border: `2px solid ${step > s.id ? '#2A6344' : step === s.id ? '#2A6344' : '#E0DDD6'}`,
                                                color: step > s.id ? '#FFFFFF' : step === s.id ? '#2A6344' : '#B0ACA4',
                                                transition: 'all 0.4s ease',
                                                boxShadow: step === s.id ? '0 0 0 4px rgba(42,99,68,0.12)' : 'none',
                                            }}>
                                                {step > s.id ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                ) : (
                                                    <div style={{ color: 'inherit' }}>{s.icon}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ paddingTop: 6, paddingBottom: i < steps.length - 1 ? 28 : 0 }}>
                                            <div style={{
                                                fontSize: 12, fontWeight: 600,
                                                color: step === s.id ? '#1A1A1A' : step > s.id ? '#2A6344' : '#B0ACA4',
                                                marginBottom: 3, transition: 'color 0.3s',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                            }}>
                                                {s.label}
                                                {step === s.id && (
                                                    <span style={{ fontSize: 9, background: '#EAF4EE', color: '#2A6344', padding: '1px 7px', borderRadius: 10, fontWeight: 500, letterSpacing: '0.05em' }}>
                                                        Active
                                                    </span>
                                                )}
                                                {step > s.id && (
                                                    <span style={{ fontSize: 9, background: '#F0FFF6', color: '#2A6344', padding: '1px 7px', borderRadius: 10, fontWeight: 500 }}>
                                                        Done ✓
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 10.5, color: '#9A968F', lineHeight: 1.4, fontWeight: 300 }}>
                                                {s.desc}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* OTP preview digits */}
                                <div style={{ marginTop: 14, background: '#FFFFFF', border: '1px solid #EAE6E0', borderRadius: 8, padding: '12px 14px' }}>
                                    <div style={{ fontSize: 9.5, color: '#9A968F', fontWeight: 500, marginBottom: 10, letterSpacing: '0.04em' }}>
                                        ENTER YOUR 6-DIGIT OTP
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                        {otp.map((digit, i) => (
                                            <div key={i} className={`preview-digit ${digit ? 'active' : ''}`}>
                                                {digit || '·'}
                                            </div>
                                        ))}
                                    </div>
                                    {/* mini timer bar */}
                                    <div style={{ marginTop: 10, height: 3, background: '#F0EDE8', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 2,
                                            width: `${timerPercent}%`,
                                            background: timer > 60 ? '#2A6344' : timer > 30 ? '#B8860B' : '#DC2626',
                                            transition: 'width 1s linear, background 0.5s',
                                        }} />
                                    </div>
                                    <div style={{ marginTop: 5, fontSize: 8.5, color: timer > 60 ? '#2A6344' : timer > 30 ? '#B8860B' : '#DC2626', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                                        {formatTime(timer)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div style={{ display: 'flex', gap: 18 }}>
                            {[
                                {
                                    label: 'Expires 2 min',
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'One-time use',
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'SSL Encrypted',
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    ),
                                },
                            ].map(b => (
                                <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: '#EAF4EE', border: '1px solid #C4DFD0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>{b.icon}</div>
                                    <span style={{ fontSize: 10, color: '#9A968F', letterSpacing: '0.04em', textAlign: 'center' }}>{b.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom quote */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 28, height: 2, background: '#2A6344', marginBottom: 13 }} />
                        <p style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 15, fontWeight: 400, fontStyle: 'italic',
                            color: '#2A2520', lineHeight: 1.5, marginBottom: 8,
                        }}>
                            "Your account security is our top priority."
                        </p>
                        <p style={{ fontSize: 11, color: '#9A968F', letterSpacing: '0.03em' }}>
                            OTP codes are single-use and expire in 2 minutes
                        </p>
                    </div>
                </div>
            )}

            {/* ── RIGHT PANEL ── */}
            <div className="panel-right" style={{
                width: isMobile ? '100%' : 460,
                flexShrink: 0,
                background: '#FAFAF8',
                position: 'relative',
                overflow: 'auto',
            }}>
                {/* Corner decoration */}
                <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05, pointerEvents: 'none' }}
                    width="180" height="180" viewBox="0 0 200 200">
                    <circle cx="200" cy="0" r="120" fill="none" stroke="#2A6344" strokeWidth="1" />
                    <circle cx="200" cy="0" r="80" fill="none" stroke="#1A1A1A" strokeWidth="0.8" />
                </svg>

                <div style={{ padding: isMobile ? '40px 28px 32px' : '48px 48px 36px' }}>

                    {/* Mobile logo */}
                    {isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
                            <div style={{ width: 34, height: 34, background: '#1A1A1A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8">
                                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 01-8 0" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 500, color: '#1A1A1A' }}>Arova</div>
                                <div style={{ fontSize: 9.5, color: '#8A8680', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>Commerce Suite</div>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="fr" style={{ marginBottom: 32 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: '#EAF4EE', border: '1px solid #C4DFD0',
                            borderRadius: 20, padding: '4px 12px', marginBottom: 18,
                        }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="2.5">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m2 7 10 7 10-7" />
                            </svg>
                            <span style={{ fontSize: 11, color: '#2A6344', fontWeight: 500, letterSpacing: '0.07em' }}>OTP Sent</span>
                        </div>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: isMobile ? 30 : 34,
                            fontWeight: 500, color: '#1A1A1A',
                            letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10,
                        }}>
                            Verify your<br />identity
                        </h1>
                        <p style={{ fontSize: 13.5, color: '#8A8680', fontWeight: 300, lineHeight: 1.6 }}>
                            We've sent a 6-digit code to your registered email. Enter it below to continue.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* OTP inputs */}
                        <div className="fr">
                            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A4540', letterSpacing: '0.04em', marginBottom: 12 }}>
                                Enter 6-digit OTP
                            </label>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }} onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => { inputRefs.current[index] = el }}
                                        className={`otp-input ${digit ? 'filled' : ''}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(index, e.target.value)}
                                        onKeyDown={e => handleKeyDown(index, e)}
                                        onFocus={() => setFocusedIndex(index)}
                                        onBlur={() => setFocusedIndex(null)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Timer */}
                        <div className="fr">
                            <div style={{
                                background: timer === 0 ? '#FEF2F2' : '#FAFAF8',
                                border: `1px solid ${timer === 0 ? '#FECACA' : '#E8E4DC'}`,
                                borderRadius: 10, overflow: 'hidden',
                                transition: 'all 0.4s',
                            }}>
                                {/* Timer progress bar */}
                                <div style={{ height: 3, background: '#F0EDE8' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${timerPercent}%`,
                                        background: timer > 60 ? '#2A6344' : timer > 30 ? '#B8860B' : '#DC2626',
                                        transition: 'width 1s linear, background 0.5s',
                                        borderRadius: '0 2px 2px 0',
                                    }} />
                                </div>
                                <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                            stroke={timer === 0 ? '#DC2626' : timer > 60 ? '#2A6344' : '#B8860B'}
                                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span style={{
                                            fontSize: 12, fontWeight: 500,
                                            color: timer === 0 ? '#DC2626' : timer > 60 ? '#2A6344' : '#B8860B',
                                        }}>
                                            {timer === 0 ? 'Code expired' : 'Code expires in'}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: 15, fontWeight: 700,
                                        color: timer === 0 ? '#DC2626' : timer > 60 ? '#2A6344' : '#B8860B',
                                        fontFamily: 'monospace', letterSpacing: '0.04em',
                                    }}>
                                        {formatTime(timer)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="fr" style={{
                            background: '#F6F9FF', border: '1px solid #D4E2FF',
                            borderRadius: 10, padding: '11px 14px',
                            display: 'flex', gap: 10, alignItems: 'flex-start',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A7AE8" strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                            </svg>
                            <p style={{ fontSize: 12, color: '#3A5CB0', lineHeight: 1.5, fontWeight: 400 }}>
                                Check your inbox and spam folder. The OTP is valid for <strong>2 minutes</strong> only.
                            </p>
                        </div>

                        {/* Verify button */}
                        <div className="fr">
                            <button
                                className="cta-btn"
                                onClick={handleVerify}
                                disabled={isLoading || !isOtpComplete}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"
                                            style={{ animation: 'spinLoader 0.7s linear infinite' }}>
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                                        Verify OTP
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Resend */}
                        <div className="fr" style={{ textAlign: 'center' }}>
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    disabled={isLoading}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#2A6344', cursor: 'pointer',
                                        fontSize: 13, fontFamily: 'inherit',
                                        fontWeight: 500, textDecoration: 'underline',
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                    }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="2.2">
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                    </svg>
                                    Resend OTP
                                </button>
                            ) : (
                                <p style={{ fontSize: 13, color: '#8A8680' }}>
                                    Didn't receive it?{' '}
                                    <span style={{ color: '#B0ACA4', fontFamily: 'monospace', fontWeight: 600 }}>
                                        {formatTime(timer)}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Back */}
                        <div className="fr" style={{ textAlign: 'center' }}>
                            <Link to="/forgot-password" style={{
                                fontSize: 13, color: '#6A6560', textDecoration: 'none',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                transition: 'color 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#2A6344')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#6A6560')}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back to forgot password
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #EEEAE4' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <p style={{ fontSize: 11, color: '#B0ACA4' }}>© 2026 Arova</p>
                            <div style={{ display: 'flex', gap: 16 }}>
                                {['Privacy', 'Terms', 'Support'].map(l => (
                                    <a key={l} href="#" style={{ fontSize: 11, color: '#B0ACA4', textDecoration: 'none', transition: 'color 0.18s' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#2A6344')}
                                        onMouseLeave={e => (e.currentTarget.style.color = '#B0ACA4')}
                                    >{l}</a>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#C0BCB4' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C0BCB4" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            256-bit SSL encrypted · SOC 2 Type II certified
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
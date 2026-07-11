import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { forgotPassword } from '../../services/auth/authService'
import { toast } from 'react-toastify'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [stage, setStage] = useState<'email' | 'success'>('email')
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [step, setStep] = useState(0)

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

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const data = await forgotPassword(email);
        const message = data?.message || data?.massage || "Something went wrong."
        if (data?.status === 200) {
            sessionStorage.setItem('resetEmail', email);
            toast.success(message);
            navigate('/otp-verify');
        } else {
            toast.error(message);
        }
        setIsLoading(false)
    }

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
            label: 'Check Inbox',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
            ),
            desc: 'We send a secure reset link to your inbox',
        },
        {
            id: 2,
            label: 'Reset Password',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            ),
            desc: 'Click the link and set your new password',
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
        @keyframes successScale {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }

        .panel-left  { animation: fadeIn 0.7s ease both; }
        .panel-right { animation: scaleIn 0.6s cubic-bezier(0.4,0,0.2,1) 0.1s both; }

        .fr { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both; }
        .fr:nth-child(1){animation-delay:0.3s} .fr:nth-child(2){animation-delay:0.38s}
        .fr:nth-child(3){animation-delay:0.46s} .fr:nth-child(4){animation-delay:0.54s}
        .fr:nth-child(5){animation-delay:0.60s} .fr:nth-child(6){animation-delay:0.66s}

        .float-card { animation: floatCard 5s ease-in-out infinite; }

        .field-input {
          width: 100%;
          background: #FFFFFF;
          border: 1.5px solid #E8E4DE;
          border-radius: 10px;
          padding: 13px 44px 13px 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #1A1A1A;
          outline: none;
          transition: border-color 0.22s, box-shadow 0.22s;
          caret-color: #2A6344;
        }
        .field-input::placeholder { color: #B8B4AD; font-weight: 300; }
        .field-input:focus {
          border-color: #2A6344;
          box-shadow: 0 0 0 3px rgba(42,99,68,0.09);
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
        .cta-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .success-anim {
          animation: successScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
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
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: 'radial-gradient(circle, #D4D0C8 1px, transparent 1px)',
                        backgroundSize: '26px 26px', opacity: 0.3,
                    }} />
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

                    {/* Center — Animated Steps Preview */}
                    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '20px 0' }}>
                        <div className="float-card" style={{
                            width: '100%', maxWidth: 340,
                            background: '#FAFAF8', border: '1px solid #E0DDD6',
                            borderRadius: 14, overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.04)',
                        }}>
                            <div style={{ background: '#1A1A1A', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {['#FF6058', '#FFBD2E', '#27C93F'].map(c => (
                                    <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                                ))}
                                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginLeft: 6, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>arova.io/reset-password</span>
                                </div>
                            </div>

                            <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {steps.map((s, i) => (
                                    <div key={s.id} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                                        {i < steps.length - 1 && (
                                            <div style={{
                                                position: 'absolute', left: 17, top: 38, width: 2,
                                                height: 32,
                                                background: step >= i + 1 ? '#2A6344' : '#E8E4DC',
                                                transition: 'background 0.5s ease',
                                                borderRadius: 2,
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
                                                fontSize: 12, fontWeight: 600, color: step === s.id ? '#1A1A1A' : step > s.id ? '#2A6344' : '#B0ACA4',
                                                marginBottom: 3, transition: 'color 0.3s',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                            }}>
                                                {s.label}
                                                {step === s.id && (
                                                    <span style={{
                                                        fontSize: 9, background: '#EAF4EE', color: '#2A6344',
                                                        padding: '1px 7px', borderRadius: 10, fontWeight: 500,
                                                        letterSpacing: '0.05em',
                                                    }}>
                                                        Active
                                                    </span>
                                                )}
                                                {step > s.id && (
                                                    <span style={{
                                                        fontSize: 9, background: '#F0FFF6', color: '#2A6344',
                                                        padding: '1px 7px', borderRadius: 10, fontWeight: 500,
                                                    }}>
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

                                <div style={{
                                    marginTop: 14, background: '#FFFFFF', border: '1px solid #EAE6E0',
                                    borderRadius: 8, padding: '10px 12px',
                                    opacity: step >= 1 ? 1 : 0.3, transition: 'opacity 0.5s ease',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#EAF4EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="2">
                                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                                <path d="m2 7 10 7 10-7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 9.5, fontWeight: 600, color: '#1A1A1A' }}>Password Reset · Arova</div>
                                            <div style={{ fontSize: 8.5, color: '#9A968F' }}>noreply@arova.io</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', fontSize: 8, color: '#9A968F' }}>Just now</div>
                                    </div>
                                    <div style={{ fontSize: 9, color: '#6A6560', lineHeight: 1.5 }}>
                                        Hi there! Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.
                                    </div>
                                    <div style={{
                                        marginTop: 8, background: step >= 1 ? '#1A1A1A' : '#E8E4DC',
                                        color: 'white', fontSize: 9, fontWeight: 500,
                                        padding: '5px 12px', borderRadius: 6, display: 'inline-block',
                                        transition: 'background 0.4s',
                                        letterSpacing: '0.05em',
                                    }}>
                                        Reset My Password →
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 18 }}>
                            {[
                                {
                                    label: 'Expires in 15 min',
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'One-time link',
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
                            🔐 Reset links are single-use & expire in 15 minutes
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
                <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05, pointerEvents: 'none' }}
                    width="180" height="180" viewBox="0 0 200 200">
                    <circle cx="200" cy="0" r="120" fill="none" stroke="#2A6344" strokeWidth="1" />
                    <circle cx="200" cy="0" r="80" fill="none" stroke="#1A1A1A" strokeWidth="0.8" />
                </svg>

                <div style={{ padding: isMobile ? '40px 28px 32px' : '48px 48px 36px' }}>

                    {isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
                            <div style={{
                                width: 34, height: 34, background: '#1A1A1A', borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
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

                    {/* STAGE 1: EMAIL INPUT */}
                    {stage === 'email' && (
                        <>
                            <div className="fr" style={{ marginBottom: 32 }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: '#FEF3E2', border: '1px solid #F5D99A',
                                    borderRadius: 20, padding: '4px 12px', marginBottom: 18,
                                }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A05A10" strokeWidth="2.2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <span style={{ fontSize: 11, color: '#A05A10', fontWeight: 500, letterSpacing: '0.07em' }}>Password Recovery</span>
                                </div>
                                <h1 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: isMobile ? 30 : 34,
                                    fontWeight: 500, color: '#1A1A1A',
                                    letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10,
                                }}>
                                    Forgot your<br />password?
                                </h1>
                                <p style={{ fontSize: 13.5, color: '#8A8680', fontWeight: 300, lineHeight: 1.6 }}>
                                    No worries! Enter your admin email and we'll send you a secure reset link.
                                </p>
                            </div>

                            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="fr">
                                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A4540', letterSpacing: '0.04em', marginBottom: 6 }}>
                                        Email address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="field-input"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="admin@yourstore.com"
                                            required
                                        />
                                        <div style={{
                                            position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                                            opacity: focusedField === 'email' ? 1 : 0.28, transition: 'opacity 0.2s',
                                        }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.8">
                                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                                <path d="m2 7 10 7 10-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

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
                                        We'll send a secure reset link to your email. The link expires in <strong>15 minutes</strong>.
                                    </p>
                                </div>

                                <div className="fr" style={{ marginTop: 4 }}>
                                    <button className="cta-btn" type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"
                                                    style={{ animation: 'spinLoader 0.7s linear infinite' }}>
                                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                                </svg>
                                                Sending OTP...
                                            </span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                                                Send OTP
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="fr" style={{ textAlign: 'center' }}>
                                    <Link to="/login" style={{
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
                                        Back to sign in
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}

                    {/* STAGE 2: SUCCESS */}
                    {stage === 'success' && (
                        <div className="success-anim" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 40 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: '#EAF4EE', border: '2px solid #C4DFD0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 24,
                                boxShadow: '0 0 0 8px rgba(42,99,68,0.08)',
                            }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m2 7 10 7 10-7" />
                                </svg>
                            </div>

                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#EAF4EE', border: '1px solid #C4DFD0',
                                borderRadius: 20, padding: '4px 12px', marginBottom: 16,
                            }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2A6344' }} />
                                <span style={{ fontSize: 11, color: '#2A6344', fontWeight: 500, letterSpacing: '0.07em' }}>Email Sent!</span>
                            </div>

                            <h2 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: isMobile ? 26 : 30,
                                fontWeight: 500, color: '#1A1A1A',
                                letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12,
                            }}>
                                Check your inbox
                            </h2>
                            <p style={{ fontSize: 13.5, color: '#8A8680', fontWeight: 300, lineHeight: 1.6, maxWidth: 320, marginBottom: 8 }}>
                                We've sent a password reset link to
                            </p>
                            <p style={{ fontSize: 14, fontWeight: 500, color: '#2A2520', marginBottom: 28 }}>
                                {email}
                            </p>

                            <div style={{
                                background: '#FFF7E6', border: '1px solid #FFE7B8',
                                borderRadius: 10, padding: '12px 16px',
                                fontSize: 12, color: '#B8860B', lineHeight: 1.6,
                                maxWidth: 300, marginBottom: 28, textAlign: 'left',
                                display: 'flex', gap: 10, alignItems: 'flex-start',
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                The link expires in <strong>15 minutes</strong>. If you don't see it, check your spam folder.
                            </div>

                            <Link to="/login" style={{ textDecoration: 'none', width: '100%', maxWidth: 280 }}>
                                <button className="cta-btn">
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                                        Back to Sign In
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </button>
                            </Link>

                            {/* Resend option */}
                            <button
                                onClick={() => setStage('email')}
                                style={{
                                    marginTop: 16, background: 'none', border: 'none',
                                    fontSize: 13, color: '#6A6560', cursor: 'pointer',
                                    fontFamily: 'inherit', textDecoration: 'underline',
                                }}
                            >
                                Didn't receive it? Try again
                            </button>
                        </div>
                    )}

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
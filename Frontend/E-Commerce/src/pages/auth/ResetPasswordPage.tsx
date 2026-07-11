import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { ResetPassword } from '../../services/auth/authService'
import { toast } from 'react-toastify'
// import { toast } from 'react-toastify'

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState({ new_password: '', confirm_password: '' })
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    const getStrength = (pwd: string) => {
        if (!pwd) return { score: 0, label: '', color: '' }
        let score = 0
        if (pwd.length >= 8) score++
        if (pwd.length >= 12) score++
        if (/[A-Z]/.test(pwd)) score++
        if (/[0-9]/.test(pwd)) score++
        if (/[^A-Za-z0-9]/.test(pwd)) score++

        if (score <= 1) return { score, label: 'Too weak', color: '#DC2626' }
        if (score === 2) return { score, label: 'Weak', color: '#DC2626' }
        if (score === 3) return { score, label: 'Fair', color: '#B8860B' }
        if (score === 4) return { score, label: 'Strong', color: '#2A6344' }
        return { score, label: 'Very strong', color: '#166534' }
    }

    const strength = getStrength(newPassword.new_password)

    const checks = [
        { label: 'At least 8 characters', pass: newPassword.new_password.length >= 8 },
        { label: 'One uppercase letter', pass: /[A-Z]/.test(newPassword.new_password) },
        { label: 'One number', pass: /[0-9]/.test(newPassword.new_password) },
        { label: 'One special character', pass: /[^A-Za-z0-9]/.test(newPassword.new_password) },
    ]

    const passwordsMatch = newPassword.new_password && newPassword.confirm_password && newPassword.new_password === newPassword.confirm_password
    const canSubmit = strength.score >= 3 && passwordsMatch && !isLoading

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        if (!canSubmit) return
        setIsLoading(true)

        const data = await ResetPassword(newPassword.new_password);
        const message = data?.message || data?.massage || "Something went wrong."

        if (data?.status === 200) {
            sessionStorage.clear();
            toast.success(message)
            navigate('/login')
        } else {
            toast.error(message)
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

    const currentStep = 2

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
        @keyframes checkPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }

        .panel-left  { animation: fadeIn 0.7s ease both; }
        .panel-right { animation: scaleIn 0.6s cubic-bezier(0.4,0,0.2,1) 0.1s both; }

        .fr { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both; }
        .fr:nth-child(1){animation-delay:0.25s} .fr:nth-child(2){animation-delay:0.33s}
        .fr:nth-child(3){animation-delay:0.41s} .fr:nth-child(4){animation-delay:0.49s}
        .fr:nth-child(5){animation-delay:0.55s} .fr:nth-child(6){animation-delay:0.61s}
        .fr:nth-child(7){animation-delay:0.67s}

        .float-card { animation: floatCard 5s ease-in-out infinite; }

        .pw-input {
          width: 100%;
          height: 50px;
          background: #FFFFFF;
          border: 1.5px solid #E8E4DE;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #1A1A1A;
          padding: 0 44px 0 14px;
          outline: none;
          transition: border-color 0.22s, box-shadow 0.22s;
        }
        .pw-input:focus {
          border-color: #2A6344;
          box-shadow: 0 0 0 3px rgba(42,99,68,0.10);
        }
        .pw-input.match {
          border-color: #2A6344;
          background: #FDFFFE;
        }
        .pw-input.mismatch {
          border-color: #DC2626;
          box-shadow: 0 0 0 3px rgba(220,38,38,0.08);
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

        .eye-btn {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #9A968F;
          display: flex;
          align-items: center;
          transition: color 0.18s;
        }
        .eye-btn:hover { color: #2A6344; }

        .check-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          transition: color 0.3s;
        }
        .check-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid #D0CBC2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .check-dot.pass {
          background: #2A6344;
          border-color: #2A6344;
          animation: checkPop 0.25s ease both;
        }
      `}</style>

            {/* LEFT PANEL */}
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
                    {/* Dot grid */}
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
                            {/* Browser bar */}
                            <div style={{ background: '#1A1A1A', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {['#FF6058', '#FFBD2E', '#27C93F'].map(c => (
                                    <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                                ))}
                                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginLeft: 6, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>arova.io/reset-password</span>
                                </div>
                            </div>

                            <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {/* Steps */}
                                {steps.map((s, i) => (
                                    <div key={s.id} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                                        {i < steps.length - 1 && (
                                            <div style={{
                                                position: 'absolute', left: 17, top: 38, width: 2, height: 32,
                                                background: currentStep >= i + 1 ? '#2A6344' : '#E8E4DC',
                                                transition: 'background 0.5s ease', borderRadius: 2,
                                            }} />
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: i < steps.length - 1 ? 28 : 0 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: currentStep > s.id ? '#2A6344' : currentStep === s.id ? '#EAF4EE' : '#F4F2EE',
                                                border: `2px solid ${currentStep > s.id ? '#2A6344' : currentStep === s.id ? '#2A6344' : '#E0DDD6'}`,
                                                color: currentStep > s.id ? '#FFFFFF' : currentStep === s.id ? '#2A6344' : '#B0ACA4',
                                                transition: 'all 0.4s ease',
                                                boxShadow: currentStep === s.id ? '0 0 0 4px rgba(42,99,68,0.12)' : 'none',
                                            }}>
                                                {currentStep > s.id ? (
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
                                                color: currentStep === s.id ? '#1A1A1A' : currentStep > s.id ? '#2A6344' : '#B0ACA4',
                                                marginBottom: 3, transition: 'color 0.3s',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                            }}>
                                                {s.label}
                                                {currentStep === s.id && (
                                                    <span style={{ fontSize: 9, background: '#EAF4EE', color: '#2A6344', padding: '1px 7px', borderRadius: 10, fontWeight: 500, letterSpacing: '0.05em' }}>
                                                        Active
                                                    </span>
                                                )}
                                                {currentStep > s.id && (
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

                                {/* Password strength preview */}
                                <div style={{ marginTop: 14, background: '#FFFFFF', border: '1px solid #EAE6E0', borderRadius: 8, padding: '12px 14px' }}>
                                    <div style={{ fontSize: 9.5, color: '#9A968F', fontWeight: 500, marginBottom: 10, letterSpacing: '0.04em' }}>
                                        PASSWORD STRENGTH
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <div key={n} style={{ flex: 1, height: 5, background: '#F0EDE8', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: strength.score >= n ? '100%' : '0%',
                                                    background: strength.color || '#E0DDD6',
                                                    borderRadius: 3,
                                                    transition: 'width 0.4s ease',
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 10, color: strength.color || '#B0ACA4', fontWeight: 600 }}>
                                            {strength.label || 'Enter password'}
                                        </span>
                                        <span style={{ fontSize: 9.5, color: '#C0BCB4', fontFamily: 'monospace' }}>
                                            {newPassword.new_password.length > 0 ? `${newPassword.new_password.length} chars` : '0 chars'}
                                        </span>
                                    </div>
                                    {/* Mini checklist */}
                                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        {checks.map((c, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{
                                                    width: 14, height: 14, borderRadius: '50%',
                                                    background: c.pass ? '#2A6344' : '#F0EDE8',
                                                    border: `1.5px solid ${c.pass ? '#2A6344' : '#D0CBC2'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.3s',
                                                    flexShrink: 0,
                                                }}>
                                                    {c.pass && (
                                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: 9.5, color: c.pass ? '#2A6344' : '#B0ACA4', transition: 'color 0.3s' }}>{c.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Match indicator in left panel */}
                                    {newPassword.confirm_password && (
                                        <div style={{
                                            marginTop: 10, padding: '6px 10px', borderRadius: 6,
                                            background: passwordsMatch ? '#EAF4EE' : '#FEF2F2',
                                            border: `1px solid ${passwordsMatch ? '#C4DFD0' : '#FECACA'}`,
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            transition: 'all 0.3s',
                                        }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                                stroke={passwordsMatch ? '#2A6344' : '#DC2626'}
                                                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                {passwordsMatch
                                                    ? <polyline points="20 6 9 17 4 12" />
                                                    : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                                                }
                                            </svg>
                                            <span style={{ fontSize: 9.5, color: passwordsMatch ? '#2A6344' : '#DC2626', fontWeight: 500 }}>
                                                {passwordsMatch ? 'Passwords match' : "Passwords don't match"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div style={{ display: 'flex', gap: 18 }}>
                            {[
                                { label: 'Min 8 chars', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
                                { label: 'Encrypted', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
                                { label: 'Secure hash', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg> },
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
                            "A strong password is your first line of defence."
                        </p>
                        <p style={{ fontSize: 11, color: '#9A968F', letterSpacing: '0.03em' }}>
                            Use a mix of letters, numbers, and symbols
                        </p>
                    </div>
                </div>
            )}

            {/* RIGHT PANEL */}
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
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span style={{ fontSize: 11, color: '#2A6344', fontWeight: 500, letterSpacing: '0.07em' }}>Final Step</span>
                        </div>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: isMobile ? 30 : 34,
                            fontWeight: 500, color: '#1A1A1A',
                            letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10,
                        }}>
                            Reset your<br />password
                        </h1>
                        <p style={{ fontSize: 13.5, color: '#8A8680', fontWeight: 300, lineHeight: 1.6 }}>
                            Choose a strong password to secure your admin account.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* New Password */}
                        <div className="fr">
                            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A4540', letterSpacing: '0.04em', marginBottom: 8 }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className={`pw-input ${newPassword.new_password && strength.score >= 3 ? 'match' : ''}`}
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    value={newPassword.new_password}
                                    onChange={e => setNewPassword(prev => ({ ...prev, new_password: e.target.value }))}
                                    onFocus={() => setFocusedField('new')}
                                    onBlur={() => setFocusedField(null)}
                                    autoComplete="new-password"
                                />
                                <button className="eye-btn" onClick={() => setShowNew(v => !v)} type="button" tabIndex={-1}>
                                    {showNew ? (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {newPassword.new_password && (
                                <div style={{ marginTop: 10 }}>
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <div key={n} style={{ flex: 1, height: 4, background: '#EEEBE5', borderRadius: 2, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: strength.score >= n ? '100%' : '0%',
                                                    background: strength.color,
                                                    borderRadius: 2,
                                                    transition: 'width 0.4s ease',
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 11.5, color: strength.color, fontWeight: 500 }}>{strength.label}</span>
                                </div>
                            )}
                        </div>

                        {/* Password checklist */}
                        {newPassword.new_password && (
                            <div className="fr" style={{
                                background: '#FAFAF8', border: '1px solid #E8E4DC',
                                borderRadius: 10, padding: '12px 14px',
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px',
                            }}>
                                {checks.map((c, i) => (
                                    <div key={i} className="check-item" style={{ color: c.pass ? '#2A6344' : '#9A968F' }}>
                                        <div className={`check-dot ${c.pass ? 'pass' : ''}`}>
                                            {c.pass && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                        {c.label}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Confirm Password */}
                        <div className="fr">
                            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A4540', letterSpacing: '0.04em', marginBottom: 8 }}>
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className={`pw-input ${newPassword.confirm_password ? (passwordsMatch ? 'match' : 'mismatch') : ''}`}
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Re-enter your password"
                                    value={newPassword.confirm_password}
                                    onChange={e => setNewPassword(prev => ({ ...prev, confirm_password: e.target.value }))}
                                    onFocus={() => setFocusedField('confirm')}
                                    onBlur={() => setFocusedField(null)}
                                    autoComplete="new-password"
                                />
                                <button className="eye-btn" onClick={() => setShowConfirm(v => !v)} type="button" tabIndex={-1}>
                                    {showConfirm ? (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {/* Match message */}
                            {newPassword.confirm_password && (
                                <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                        stroke={passwordsMatch ? '#2A6344' : '#DC2626'}
                                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        {passwordsMatch
                                            ? <polyline points="20 6 9 17 4 12" />
                                            : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                                        }
                                    </svg>
                                    <span style={{ fontSize: 12, color: passwordsMatch ? '#2A6344' : '#DC2626', fontWeight: 500 }}>
                                        {passwordsMatch ? 'Passwords match' : "Passwords don't match"}
                                    </span>
                                </div>
                            )}
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
                                After resetting, you'll be redirected to login. All active sessions will be <strong>signed out</strong>.
                            </p>
                        </div>

                        {/* Submit button */}
                        <div className="fr">
                            <button
                                className="cta-btn"
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"
                                            style={{ animation: 'spinLoader 0.7s linear infinite' }}>
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                        </svg>
                                        Resetting password...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                                        Reset Password
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Back */}
                        <div className="fr" style={{ textAlign: 'center' }}>
                            <Link to="/verify-otp" style={{
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
                                Back to OTP verification
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
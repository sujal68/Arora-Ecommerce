import React, { useState, useEffect } from 'react'
import { adminLogin } from '../../services/auth/authService'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router'

export default function LoginPage() {
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    })
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [remember, setRemember] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    const [liveStats, setLiveStats] = useState({
        revenue: 84.2,
        orders: 1429,
        returns: 2.1
    })
    const [lastOrder, setLastOrder] = useState({ name: 'Wireless Headphones', qty: 24, status: 'Shipped', time: '2 min ago' })
    const [newOrderNotification, setNewOrderNotification] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveStats(prev => ({
                revenue: +(prev.revenue + (Math.random() * 3 - 1.5)).toFixed(1),
                orders: prev.orders + Math.floor(Math.random() * 8 - 3),
                returns: +(prev.returns + (Math.random() * 0.3 - 0.15)).toFixed(1)
            }))

            if (Math.random() > 0.6) {
                const newOrders = [
                    { name: 'Premium Backpack', qty: 3, status: 'Processing', time: 'just now' },
                    { name: 'Smart Watch', qty: 7, status: 'Shipped', time: 'just now' },
                    { name: 'Cotton T-Shirt', qty: 12, status: 'Processing', time: 'just now' },
                    { name: 'Coffee Mug Set', qty: 5, status: 'Pending', time: 'just now' }
                ]
                const randomOrder = newOrders[Math.floor(Math.random() * newOrders.length)]
                setLastOrder(randomOrder)
                setNewOrderNotification(true)
                setTimeout(() => setNewOrderNotification(false), 2000)
            }
        }, 4200)

        return () => clearInterval(interval)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const data = await adminLogin(loginData)
        const message = data?.message || data?.massage || "Unable to login. Please try again."

        if (data?.status === 200) {
            localStorage.setItem("adminAuthToken", data.result.token);
            toast.success(message);
            navigate('/dashboard');
        } else {
            toast.error(message);
        }

        setIsLoading(false)
    }



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
        @keyframes floatDot {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes numberPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); color: #2A6344; }
          100% { transform: scale(1); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulseGreen {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .panel-left  { animation: fadeIn 0.7s ease both; }
        .panel-right { animation: scaleIn 0.6s cubic-bezier(0.4,0,0.2,1) 0.1s both; }

        .fr { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both; }
        .fr:nth-child(1){animation-delay:0.3s} .fr:nth-child(2){animation-delay:0.38s}
        .fr:nth-child(3){animation-delay:0.46s} .fr:nth-child(4){animation-delay:0.54s}
        .fr:nth-child(5){animation-delay:0.60s} .fr:nth-child(6){animation-delay:0.66s}
        .fr:nth-child(7){animation-delay:0.72s} .fr:nth-child(8){animation-delay:0.78s}

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

        .sso-btn {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 11px 10px;
          background: #FFFFFF;
          border: 1.5px solid #E8E4DE;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px; font-weight: 400;
          color: #4A4540;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s;
        }
        .sso-btn:hover {
          border-color: #C4C0B8;
          background: #F6F4F0;
          transform: translateY(-1px);
          box-shadow: 0 3px 12px rgba(0,0,0,0.06);
        }

        .dot1 { animation: floatDot 3s ease-in-out infinite; }
        .dot2 { animation: floatDot 3s ease-in-out infinite 0.8s; }
        .dot3 { animation: floatDot 3s ease-in-out infinite 1.6s; }

        .number-change {
          animation: numberPop 0.3s ease-out;
        }

        .notification-toast {
          animation: slideInRight 0.4s ease-out forwards;
        }
      `}</style>

            {/* ── LEFT PANEL — hidden on mobile ── */}
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
                    {/* Dot-grid bg */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: 'radial-gradient(circle, #D4D0C8 1px, transparent 1px)',
                        backgroundSize: '26px 26px', opacity: 0.3,
                    }} />
                    {/* Top green stripe */}
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

                    {/* Center — LIVE dashboard mockup */}
                    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '20px 0' }}>
                        {/* Mockup card */}
                        <div style={{
                            width: '100%', maxWidth: 340,
                            background: '#FAFAF8', border: '1px solid #E0DDD6',
                            borderRadius: 14, overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.07), 0 4px 14px rgba(0,0,0,0.04)',
                            position: 'relative',
                        }}>
                            {/* New order notification toast */}
                            {newOrderNotification && (
                                <div className="notification-toast" style={{
                                    position: 'absolute', top: 12, right: 12, zIndex: 10,
                                    background: '#1A1A1A', color: 'white', padding: '6px 12px',
                                    borderRadius: 20, fontSize: 11, fontWeight: 500,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#48A87A', animation: 'pulseGreen 1s infinite' }} />
                                    🛍️ New order received!
                                </div>
                            )}

                            <div style={{ background: '#1A1A1A', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {['#FF6058', '#FFBD2E', '#27C93F'].map(c => (
                                    <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                                ))}
                                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginLeft: 6 }} />
                                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>LIVE</span>
                            </div>

                            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {/* Stat cards with animated numbers */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                                    {[
                                        { label: 'Revenue', val: `$${liveStats.revenue.toFixed(1)}K`, up: liveStats.revenue > (84.2) ? true : false, change: ((liveStats.revenue - 84.2) / 84.2 * 100).toFixed(1) },
                                        { label: 'Orders', val: liveStats.orders.toLocaleString(), up: liveStats.orders > 1429, change: ((liveStats.orders - 1429) / 1429 * 100).toFixed(1) },
                                        { label: 'Returns', val: `${liveStats.returns.toFixed(1)}%`, up: false, change: ((liveStats.returns - 2.1) / 2.1 * 100).toFixed(1) },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: '#FFF', border: '1px solid #EAE6E0', borderRadius: 7, padding: '9px 8px 7px' }}>
                                            <div style={{ fontSize: 8, color: '#9A968F', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{s.label}</div>
                                            <div className="number-change" style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginTop: 2 }}>{s.val}</div>
                                            <div style={{ fontSize: 8, color: s.up ? '#2A6344' : '#B84040', fontWeight: 500, marginTop: 2 }}>
                                                {s.up ? '↑' : '↓'} {Math.abs(parseFloat(s.change))}%
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Weekly Sales with more context */}
                                <div style={{ background: '#FFF', border: '1px solid #EAE6E0', borderRadius: 7, padding: '9px 11px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <div style={{ fontSize: 8, color: '#9A968F', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Weekly Sales</div>
                                        <div style={{ fontSize: 7, color: '#2A6344', background: '#EAF4EE', padding: '2px 6px', borderRadius: 10 }}>
                                            ↑ 8% vs last week
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
                                        {[60, 38, 75, 52, 90, 64, 82].map((h, i) => (
                                            <div key={i} style={{ flex: 1, position: 'relative' }}>
                                                <div style={{ width: '100%', height: `${h}%`, background: i === 4 ? '#2A6344' : '#E8E4DC', borderRadius: '2px 2px 0 0', transition: 'height 0.5s ease' }} />
                                                {i === 4 && (
                                                    <div style={{ fontSize: 6, textAlign: 'center', marginTop: 3, color: '#2A6344', fontWeight: 500 }}>Peak</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 7, color: '#B0ACA4' }}>
                                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                    </div>
                                </div>

                                {/* Recent Orders - dynamically updating */}
                                <div style={{ background: '#FFF', border: '1px solid #EAE6E0', borderRadius: 7, padding: '8px 10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <div style={{ fontSize: 8, color: '#9A968F', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Recent Order</div>
                                        <div style={{ fontSize: 7, color: '#48A87A' }}>{lastOrder.time}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 500, color: '#2A2520' }}>{lastOrder.name}</div>
                                            <div style={{ fontSize: 8, color: '#9A968F', marginTop: 1 }}>Qty: {lastOrder.qty}</div>
                                        </div>
                                        <div style={{
                                            fontSize: 8, fontWeight: 500, padding: '3px 7px', borderRadius: 20,
                                            background: lastOrder.status === 'Shipped' ? '#EAF4EE' : lastOrder.status === 'Processing' ? '#FEF3E2' : '#FFEBEE',
                                            color: lastOrder.status === 'Shipped' ? '#2A6344' : lastOrder.status === 'Processing' ? '#A05A10' : '#C62828',
                                            letterSpacing: '0.05em',
                                        }}>{lastOrder.status}</div>
                                    </div>
                                </div>

                                {/* Live visitor count */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: '#F6F4F0', borderRadius: 7 }}>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#2A6344', opacity: 0.6 + Math.random() * 0.4 }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 9, color: '#4A4540' }}>
                                        🟢 24 active shoppers right now
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Feature icons */}
                        <div style={{ display: 'flex', gap: 24 }}>
                            {[
                                {
                                    label: 'Inventory', cls: 'dot1',
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                            <line x1="12" y1="22.08" x2="12" y2="12" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'Analytics', cls: 'dot2',
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="20" x2="18" y2="10" />
                                            <line x1="12" y1="20" x2="12" y2="4" />
                                            <line x1="6" y1="20" x2="6" y2="14" />
                                            <path d="M2 20h20" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'Logistics', cls: 'dot3',
                                    icon: (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="1" y="3" width="15" height="13" rx="1" />
                                            <path d="M16 8h4l3 5v3h-7V8z" />
                                            <circle cx="5.5" cy="18.5" r="2.5" />
                                            <circle cx="18.5" cy="18.5" r="2.5" />
                                        </svg>
                                    ),
                                },
                            ].map(f => (
                                <div key={f.label} className={f.cls} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: '#EAF4EE', border: '1px solid #C4DFD0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>{f.icon}</div>
                                    <span style={{ fontSize: 10, color: '#9A968F', letterSpacing: '0.06em' }}>{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom quote with real-time stat */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 28, height: 2, background: '#2A6344', marginBottom: 13 }} />
                        <p style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 15, fontWeight: 400, fontStyle: 'italic',
                            color: '#2A2520', lineHeight: 1.5, marginBottom: 8,
                        }}>
                            "Everything you need to run a world-class store, in one place."
                        </p>
                        <p style={{ fontSize: 11, color: '#9A968F', letterSpacing: '0.03em' }}>
                            🚀 {Math.floor(8100 + liveStats.orders * 1.2).toLocaleString()}+ merchants worldwide
                        </p>
                    </div>
                </div>
            )}

            {/* ── RIGHT PANEL (same as before) ── */}
            <div className="panel-right" style={{
                width: isMobile ? '100%' : 460,
                flexShrink: 0,
                background: '#FAFAF8',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Corner arc */}
                <svg style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05, pointerEvents: 'none' }}
                    width="180" height="180" viewBox="0 0 200 200">
                    <circle cx="200" cy="0" r="120" fill="none" stroke="#2A6344" strokeWidth="1" />
                    <circle cx="200" cy="0" r="80" fill="none" stroke="#1A1A1A" strokeWidth="0.8" />
                </svg>

                <div className="right-scroll">
                    <div style={{ padding: isMobile ? '40px 28px 32px' : '48px 48px 36px' }}>

                        {/* Mobile-only logo */}
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

                        {/* Heading */}
                        <div className="fr" style={{ marginBottom: 28 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#EAF4EE', border: '1px solid #C4DFD0',
                                borderRadius: 20, padding: '4px 12px', marginBottom: 18,
                            }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2A6344' }} />
                                <span style={{ fontSize: 11, color: '#2A6344', fontWeight: 500, letterSpacing: '0.07em' }}>Admin Portal</span>
                            </div>
                            <h1 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: isMobile ? 30 : 34,
                                fontWeight: 500, color: '#1A1A1A',
                                letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8,
                            }}>
                                Sign in to your<br />dashboard
                            </h1>
                            <p style={{ fontSize: 13.5, color: '#8A8680', fontWeight: 300, lineHeight: 1.5 }}>
                                Manage your store, track orders and grow your business.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                            {/* Email */}
                            <div className="fr">
                                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 500, color: '#4A4540', letterSpacing: '0.04em', marginBottom: 6 }}>
                                    Email address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="field-input"
                                        type="email"
                                        onChange={(event) =>
                                            setLoginData((prev) => ({
                                                ...prev,
                                                email: event.target.value,
                                            }))
                                        }
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

                            {/* Password */}
                            <div className="fr">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <label style={{ fontSize: 11.5, fontWeight: 500, color: '#4A4540', letterSpacing: '0.04em' }}>Password</label>
                                    <Link to={'/forgot-password'} style={{ fontSize: 11.5, color: '#2A6344', textDecoration: 'none' }}
                                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                                    >Forgot password?</Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="field-input"
                                        type={showPassword ? 'text' : 'password'}
                                        onChange={(event) =>
                                            setLoginData((prev) => ({
                                                ...prev,
                                                password: event.target.value,
                                            }))
                                        }
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                        position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                                        opacity: focusedField === 'password' ? 0.8 : 0.28, transition: 'opacity 0.2s',
                                    }}>
                                        {showPassword ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.8">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A6344" strokeWidth="1.8">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember */}
                            <div className="fr" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                <div onClick={() => setRemember(!remember)} style={{
                                    width: 17, height: 17, borderRadius: 5, cursor: 'pointer', flexShrink: 0,
                                    border: `1.5px solid ${remember ? '#2A6344' : '#D0CCC4'}`,
                                    background: remember ? '#2A6344' : '#FFFFFF',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.18s',
                                }}>
                                    {remember && (
                                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#FFFFFF" strokeWidth="2.2">
                                            <polyline points="2 6 5 9 10 3" />
                                        </svg>
                                    )}
                                </div>
                                <span style={{ fontSize: 12.5, color: '#6A6560' }}>Keep me signed in for 30 days</span>
                            </div>

                            {/* Submit */}
                            <div className="fr" style={{ marginTop: 2 }}>
                                <button className="cta-btn" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"
                                                style={{ animation: 'spinLoader 0.7s linear infinite' }}>
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                            </svg>
                                            Signing you in...
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                                            Access Dashboard
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="fr" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ flex: 1, height: 1, background: '#E8E4DE' }} />
                                <span style={{ fontSize: 11.5, color: '#B0ACA4' }}>or continue with</span>
                                <div style={{ flex: 1, height: 1, background: '#E8E4DE' }} />
                            </div>

                            {/* SSO */}
                            <div className="fr" style={{ display: 'flex', gap: 10 }}>
                                {[
                                    {
                                        label: 'Google',
                                        icon: (
                                            <svg width="16" height="16" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        label: 'Microsoft',
                                        icon: (
                                            <svg width="16" height="16" viewBox="0 0 24 24">
                                                <path fill="#F25022" d="M1 1h10v10H1z" />
                                                <path fill="#00A4EF" d="M13 1h10v10H13z" />
                                                <path fill="#7FBA00" d="M1 13h10v10H1z" />
                                                <path fill="#FFB900" d="M13 13h10v10H13z" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        label: 'Apple',
                                        icon: (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A1A1A">
                                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                            </svg>
                                        ),
                                    },
                                ].map(s => (
                                    <button key={s.label} type="button" className="sso-btn">
                                        {s.icon}
                                        <span>{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="fr" style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #EEEAE4' }}>
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
        </div>
    )
}
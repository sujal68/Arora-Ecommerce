import React, { useState } from 'react';
import { registerUser } from '../../services/auth/authService';
import { toast } from 'react-toastify';

const C = {
    bg: '#FAFAF8',
    white: '#FFFFFF',
    dark: '#1A1A1A',
    green: '#2A6344',
    greenLight: '#48A87A',
    greenBg: '#EAF4EE',
    greenBorder: '#C4DFD0',
    border: '#EEEBE5',
    borderInput: '#E8E4DE',
    textMuted: '#9A968F',
    textSub: '#6A6560',
    sand: '#F6F4F0',
    red: '#C62828',
    redBg: '#FFEBEE',
    amber: '#A05A10',
    amberBg: '#FEF3E2',
    blue: '#1A56DB',
    blueBg: '#E8F0FE',
    purple: '#7C3AED',
    purpleBg: '#F3E8FF',
};

type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
type Tier = 'Standard' | 'Silver' | 'Gold' | 'Platinum';

const TIERS: { id: Tier; label: string; desc: string; color: string; bg: string; icon: React.ReactNode }[] = [
    {
        id: 'Standard', label: 'Standard', desc: 'Default new user tier', color: C.textSub, bg: C.sand,
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
    },
    {
        id: 'Silver', label: 'Silver', desc: 'Loyal shoppers, early perks', color: '#6B7280', bg: '#F3F4F6',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    },
    {
        id: 'Gold', label: 'Gold', desc: 'Frequent buyers, priority support', color: '#B45309', bg: '#FFFBEB',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
    },
    {
        id: 'Platinum', label: 'Platinum', desc: 'VIP members, exclusive access', color: C.purple, bg: C.purpleBg,
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3L8 9l4 13 4-13-3-6" /><path d="M2 9h20" /></svg>
    },
];

const PREFERENCES = [
    { id: 'marketing_emails', label: 'Marketing Emails', desc: 'Promotions & new arrivals' },
    { id: 'order_updates', label: 'Order Updates', desc: 'Shipping & delivery alerts' },
    { id: 'sms_notifications', label: 'SMS Notifications', desc: 'Text alerts for orders' },
    { id: 'wishlist_alerts', label: 'Wishlist Alerts', desc: 'Price drops on saved items' },
];

function InputField({ label, value, onChange, type = 'text', placeholder, error, hint, prefix, prefixIcon }: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
    placeholder?: string; error?: string; hint?: string; prefix?: string; prefixIcon?: React.ReactNode; half?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                {prefix && (
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.textMuted, pointerEvents: 'none', zIndex: 1 }}>{prefix}</div>
                )}
                {prefixIcon && (
                    <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1, display: 'flex' }}>{prefixIcon}</div>
                )}
                <input
                    type={type} value={value} onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    style={{
                        width: '100%', padding: prefix ? '10px 14px 10px 26px' : prefixIcon ? '10px 14px 10px 33px' : '10px 14px',
                        background: C.white, border: `1.5px solid ${error ? C.red : focused ? C.green : C.borderInput}`,
                        borderRadius: 9, fontSize: 13, color: C.dark, outline: 'none',
                        fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box',
                        boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(198,40,40,0.08)' : 'rgba(42,99,68,0.08)'}` : 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                />
            </div>
            {error && <span style={{ fontSize: 11, color: C.red, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                {error}
            </span>}
            {hint && !error && <span style={{ fontSize: 11, color: C.textMuted }}>{hint}</span>}
        </div>
    );
}

export default function AddUser() {
    const [step, setStep] = useState<1 | 2>(1);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', dob: '', gender: '' as Gender | '', address: '', city: '', pincode: '', password: '', confirmPassword: '' });
    const [tier, setTier] = useState<Tier>('Standard');
    const [prefs, setPrefs] = useState<Set<string>>(new Set(['order_updates']));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const set = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));
    const togglePref = (id: string) => setPrefs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const strengthScore = (() => {
        const p = form.password; let s = 0;
        if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore];
    const strengthColor = ['', C.red, C.amber, C.blue, C.green][strengthScore];

    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!form.firstName.trim()) e.firstName = 'First name is required';
        if (!form.lastName.trim()) e.lastName = 'Last name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
        setErrors(e); return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e: Record<string, string> = {};
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 8) e.password = 'Minimum 8 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e); return Object.keys(e).length === 0;
    };

    const handleNext = async () => {
        if (step === 1) {
            if (validateStep1()) setStep(2);
        } else {
            if (!validateStep2()) return;
            setIsSaving(true);
            try {
                const data = {
                    first_name: form.firstName.trim(),
                    last_name: form.lastName.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    phone: form.phone.trim(),
                    gender: form.gender || 'Prefer not to say',
                    address: form.address.trim() || undefined
                };

                const res = await registerUser(data);
                if (res && (res.status === 200 || res.status === 201)) {
                    toast.success(res.massage || "User account created successfully.");
                    setSubmitted(true);
                } else {
                    toast.error(res?.massage || "Failed to create user account.");
                }
            } catch (error) {
                toast.error("Failed to create user account.");
            } finally {
                setIsSaving(false);
            }
        }
    };

    // ─── Success ────────────────────────────────────────────────────────────────
    if (submitted) {
        const tierCfg = TIERS.find(t => t.id === tier)!;
        return (
            <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", padding: 24 }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                    *{box-sizing:border-box;margin:0;padding:0;}
                    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
                    @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
                    @keyframes ring{0%{box-shadow:0 0 0 0 rgba(42,99,68,0.3)}100%{box-shadow:0 0 0 18px rgba(42,99,68,0)}}
                `}</style>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 22, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center', animation: 'fadeUp 0.4s ease both', boxShadow: '0 20px 60px rgba(0,0,0,0.07)' }}>
                    <div style={{ width: 68, height: 68, borderRadius: '50%', background: C.greenBg, border: `2px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'checkPop 0.4s cubic-bezier(0.4,0,0.2,1) both 0.15s, ring 1s ease 0.55s' }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 23, fontWeight: 500, color: C.dark, marginBottom: 8 }}>User Account Created</div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6 }}>
                        <strong style={{ color: C.dark }}>{form.firstName} {form.lastName}</strong> has been added successfully
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: tierCfg.bg, border: `1px solid ${tierCfg.color}30`, borderRadius: 20, padding: '5px 14px', marginBottom: 10 }}>
                        <span style={{ color: tierCfg.color }}>{tierCfg.icon}</span>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: tierCfg.color }}>{tier} Member</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 28 }}>Welcome email will be sent to <span style={{ color: C.blue }}>{form.email}</span></div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => { setForm({ firstName: '', lastName: '', email: '', phone: '', dob: '', gender: '', address: '', city: '', pincode: '', password: '', confirmPassword: '' }); setTier('Standard'); setPrefs(new Set(['order_updates'])); setErrors({}); setSubmitted(false); setStep(1); }}
                            style={{ flex: 1, padding: '10px', background: C.sand, border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: C.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>Add another</button>
                        <button onClick={() => window.location.href = '/dashboard/users'} style={{ flex: 1, padding: '10px', background: C.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>View all users →</button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Main Form ──────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", padding: '32px 24px', boxSizing: 'border-box' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                *{box-sizing:border-box;margin:0;padding:0;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
                .tier-card{transition:all 0.2s;cursor:pointer;}
                .tier-card:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,0.07) !important;}
                .pref-toggle{transition:all 0.18s;cursor:pointer;}
                .pref-toggle:hover{border-color:${C.green} !important;background:${C.greenBg} !important;}
                .btn-primary{transition:all 0.18s;}
                .btn-primary:hover{opacity:0.88;transform:translateY(-1px);}
                .btn-secondary{transition:all 0.18s;}
                .btn-secondary:hover{background:#F0EDE8 !important;}
                @media(max-width:560px){.grid-2{grid-template-columns:1fr !important;} .grid-3{grid-template-columns:1fr !important;} .tier-grid{grid-template-columns:1fr 1fr !important;}}
            `}</style>

            <div style={{ margin: '0 auto', width: '100%' }}>

                {/* Header */}
                <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease both' }}>
                    <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Users / Add New</div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: C.dark, letterSpacing: '-0.02em' }}>Add User</h1>
                    <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Create a new customer account and configure their profile.</p>
                </div>

                {/* Step Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, animation: 'fadeUp 0.4s ease both 0.06s' }}>
                    {[{ n: 1, label: 'Profile & Membership' }, { n: 2, label: 'Security & Preferences' }].map((s, idx) => (
                        <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: idx < 1 ? 'initial' : 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step === s.n ? C.dark : step > s.n ? C.green : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s' }}>
                                    {step > s.n
                                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                        : <span style={{ fontSize: 11, fontWeight: 700, color: step === s.n ? '#fff' : C.textMuted }}>{s.n}</span>}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: step === s.n ? 600 : 400, color: step === s.n ? C.dark : C.textMuted, whiteSpace: 'nowrap' }}>{s.label}</span>
                            </div>
                            {idx < 1 && <div style={{ flex: 1, height: 1, background: step > 1 ? C.green : C.border, margin: '0 14px', transition: 'background 0.3s', minWidth: 40 }} />}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', animation: 'fadeUp 0.4s ease both 0.1s' }}>

                    {/* ── STEP 1 ─── */}
                    {step === 1 && (
                        <div style={{ padding: 28 }}>
                            {/* Name */}
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <InputField label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="e.g. Ananya" error={errors.firstName} />
                                <InputField label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="e.g. Sharma" error={errors.lastName} />
                            </div>

                            {/* Email + Phone */}
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <InputField label="Email Address" value={form.email} onChange={set('email')} type="email" placeholder="ananya@email.com" error={errors.email} />
                                <InputField label="Phone (optional)" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210"
                                    prefixIcon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 01-2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>}
                                />
                            </div>

                            {/* DOB + Gender */}
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                <InputField label="Date of Birth (optional)" value={form.dob} onChange={set('dob')} type="date" />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <label style={{ fontSize: 11.5, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em' }}>Gender (optional)</label>
                                    <select value={form.gender} onChange={e => set('gender')(e.target.value as any)}
                                        style={{ padding: '10px 14px', background: C.white, border: `1.5px solid ${C.borderInput}`, borderRadius: 9, fontSize: 13, color: form.gender ? C.dark : C.textMuted, outline: 'none', fontFamily: "'Outfit', sans-serif", cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A968F' strokeWidth='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                                        <option value="">Select gender</option>
                                        {(['Male', 'Female', 'Other', 'Prefer not to say'] as Gender[]).map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Address section */}
                            <div style={{ paddingTop: 20, borderTop: `1px solid ${C.border}`, marginBottom: 24 }}>
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em', marginBottom: 12 }}>Address (optional)</div>
                                <div style={{ marginBottom: 12 }}>
                                    <InputField label="Street Address" value={form.address} onChange={set('address')} placeholder="e.g. 42, MG Road, Indiranagar" />
                                </div>
                                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <InputField label="City" value={form.city} onChange={set('city')} placeholder="Bengaluru" />
                                    <InputField label="Pincode" value={form.pincode} onChange={set('pincode')} placeholder="560038" />
                                </div>
                            </div>

                            {/* Membership Tier */}
                            <div>
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em', marginBottom: 10 }}>Membership Tier</div>
                                <div className="tier-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                    {TIERS.map(t => {
                                        const selected = tier === t.id;
                                        return (
                                            <div key={t.id} className="tier-card" onClick={() => setTier(t.id)}
                                                style={{ padding: '12px 12px', borderRadius: 10, border: `1.5px solid ${selected ? t.color : C.border}`, background: selected ? t.bg : C.white, textAlign: 'center', boxShadow: selected ? `0 2px 14px ${t.color}20` : 'none' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 9, background: selected ? `${t.color}18` : C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: selected ? t.color : C.textMuted, transition: 'all 0.18s' }}>
                                                    {t.icon}
                                                </div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: selected ? t.color : C.dark, marginBottom: 2 }}>{t.label}</div>
                                                <div style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.3 }}>{t.desc}</div>
                                                {selected && (
                                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px auto 0' }}>
                                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2 ─── */}
                    {step === 2 && (
                        <div style={{ padding: 28 }}>
                            {/* Password */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em', marginBottom: 6 }}>Password</div>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password')(e.target.value)} placeholder="Min. 8 characters"
                                        style={{ width: '100%', padding: '10px 40px 10px 14px', background: C.white, border: `1.5px solid ${errors.password ? C.red : C.borderInput}`, borderRadius: 9, fontSize: 13, color: C.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                                    <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{showPass ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}</svg>
                                    </button>
                                </div>
                                {form.password && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                                            {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strengthScore ? strengthColor : '#E8E4DC', transition: 'background 0.25s' }} />)}
                                        </div>
                                        <div style={{ fontSize: 10.5, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</div>
                                    </div>
                                )}
                                {errors.password && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{errors.password}</div>}
                            </div>

                            {/* Confirm Password */}
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em', marginBottom: 6 }}>Confirm Password</div>
                                <div style={{ position: 'relative' }}>
                                    <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword')(e.target.value)} placeholder="Repeat password"
                                        style={{ width: '100%', padding: '10px 40px 10px 14px', background: C.white, border: `1.5px solid ${errors.confirmPassword ? C.red : C.borderInput}`, borderRadius: 9, fontSize: 13, color: C.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                                    <button onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{showConfirm ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}</svg>
                                    </button>
                                </div>
                                {errors.confirmPassword && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{errors.confirmPassword}</div>}
                                {form.confirmPassword && form.confirmPassword === form.password && (
                                    <div style={{ fontSize: 11, color: C.green, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Passwords match
                                    </div>
                                )}
                            </div>

                            {/* Notification Preferences */}
                            <div style={{ paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>Notification Preferences</div>
                                        <div style={{ fontSize: 11, color: C.textMuted }}>Choose what this user receives</div>
                                    </div>
                                    <div style={{ fontSize: 10.5, color: C.green, fontWeight: 600, background: C.greenBg, padding: '3px 10px', borderRadius: 20 }}>{prefs.size} enabled</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {PREFERENCES.map(p => {
                                        const on = prefs.has(p.id);
                                        return (
                                            <div key={p.id} className="pref-toggle" onClick={() => togglePref(p.id)}
                                                style={{ padding: '10px 12px', borderRadius: 9, border: `1.5px solid ${on ? C.greenBorder : C.border}`, background: on ? C.greenBg : C.white, display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 16, height: 16, borderRadius: 4, background: on ? C.green : C.white, border: `1.5px solid ${on ? C.green : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s' }}>
                                                    {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 11.5, fontWeight: 600, color: on ? C.green : C.dark }}>{p.label}</div>
                                                    <div style={{ fontSize: 10, color: C.textMuted }}>{p.desc}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ padding: '16px 28px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bg }}>
                        <div style={{ fontSize: 11.5, color: C.textMuted }}>Step {step} of 2</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {step === 2 && (
                                <button className="btn-secondary" onClick={() => setStep(1)} disabled={isSaving}
                                    style={{ padding: '9px 20px', background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: C.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                            )}
                            <button className="btn-primary" onClick={handleNext} disabled={isSaving}
                                style={{ padding: '9px 24px', background: C.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {isSaving ? 'Creating...' : step === 1 ? <>Continue <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg></> : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Create User</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
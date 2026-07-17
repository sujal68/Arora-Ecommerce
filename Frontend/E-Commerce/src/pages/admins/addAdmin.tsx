import React, { useState, useRef } from 'react';
import { registerAdmin } from '../../services/auth/authService';
import { toast } from 'react-toastify';

const COLORS = {
    bg: '#FAFAF8',
    white: '#FFFFFF',
    dark: '#1A1A1A',
    green: '#2A6344',
    greenLight: '#48A87A',
    greenBg: '#EAF4EE',
    greenBorder: '#C4DFD0',
    border: '#EEEBE5',
    borderInput: '#E8E4DE',
    text: '#1A1A1A',
    textMuted: '#9A968F',
    textSub: '#6A6560',
    sand: '#F6F4F0',
    red: '#C62828',
    redBg: '#FFEBEE',
    redBorder: '#F5C6C6',
    amber: '#A05A10',
    amberBg: '#FEF3E2',
    blue: '#1A56DB',
    blueBg: '#E8F0FE',
};

type Role = 'Super Admin' | 'Product Manager' | 'Order Manager' | 'Support Admin';
type Permission = 'manage_products' | 'manage_orders' | 'manage_users' | 'manage_admins' | 'view_analytics' | 'manage_categories' | 'manage_settings' | 'export_data';

const ROLE_ICONS: Record<Role, (color: string) => React.ReactNode> = {
    'Super Admin': (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    'Product Manager': (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    'Order Manager': (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    'Support Admin': (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
};

const ROLES: { id: Role; label: string; desc: string; color: string; bg: string }[] = [
    { id: 'Super Admin', label: 'Super Admin', desc: 'Full access to all modules', color: '#7C3AED', bg: '#F3E8FF' },
    { id: 'Product Manager', label: 'Product Manager', desc: 'Products & categories', color: COLORS.green, bg: COLORS.greenBg },
    { id: 'Order Manager', label: 'Order Manager', desc: 'Orders & fulfillment', color: COLORS.blue, bg: COLORS.blueBg },
    { id: 'Support Admin', label: 'Support Admin', desc: 'Users & support tickets', color: COLORS.amber, bg: COLORS.amberBg },
];

const PERMISSIONS: { id: Permission; label: string; desc: string; group: string }[] = [
    { id: 'manage_products', label: 'Manage Products', desc: 'Add, edit, delete products', group: 'Catalog' },
    { id: 'manage_categories', label: 'Manage Categories', desc: 'Create & modify categories', group: 'Catalog' },
    { id: 'manage_orders', label: 'Manage Orders', desc: 'View & update order status', group: 'Operations' },
    { id: 'export_data', label: 'Export Data', desc: 'Download reports & exports', group: 'Operations' },
    { id: 'manage_users', label: 'Manage Users', desc: 'View & manage user accounts', group: 'Users' },
    { id: 'manage_admins', label: 'Manage Admins', desc: 'Add & remove admin accounts', group: 'Users' },
    { id: 'view_analytics', label: 'View Analytics', desc: 'Access dashboards & reports', group: 'Analytics' },
    { id: 'manage_settings', label: 'Manage Settings', desc: 'Platform-wide configuration', group: 'Settings' },
];

const ROLE_DEFAULT_PERMS: Record<Role, Permission[]> = {
    'Super Admin': ['manage_products', 'manage_categories', 'manage_orders', 'export_data', 'manage_users', 'manage_admins', 'view_analytics', 'manage_settings'],
    'Product Manager': ['manage_products', 'manage_categories', 'view_analytics'],
    'Order Manager': ['manage_orders', 'export_data', 'view_analytics'],
    'Support Admin': ['manage_users', 'manage_orders', 'view_analytics'],
};

// ─── Camera Icon SVG ───────────────────────────────────────────────────────────
const CameraIcon = ({ color = '#48A87A' }: { color?: string }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({
    label, value, onChange, type = 'text', placeholder, error, hint, prefixIcon
}: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
    placeholder?: string; error?: string; hint?: string; prefixIcon?: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                {prefixIcon && (
                    <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1, display: 'flex', alignItems: 'center' }}>{prefixIcon}</div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: prefixIcon ? '10px 14px 10px 32px' : '10px 14px',
                        background: COLORS.white,
                        border: `1.5px solid ${error ? COLORS.red : focused ? COLORS.green : COLORS.borderInput}`,
                        borderRadius: 9,
                        fontSize: 13,
                        color: COLORS.dark,
                        outline: 'none',
                        fontFamily: "'Outfit', sans-serif",
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: focused ? `0 0 0 3px ${error ? 'rgba(198,40,40,0.08)' : 'rgba(42,99,68,0.08)'}` : 'none',
                        boxSizing: 'border-box',
                    }}
                />
            </div>
            {error && <span style={{ fontSize: 11, color: COLORS.red, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> {error}</span>}
            {hint && !error && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{hint}</span>}
        </div>
    );
}

// ─── Avatar Upload ─────────────────────────────────────────────────────────────
// Shows only a camera icon. On hover shows an overlay. On file select shows preview.
function AvatarUpload() {
    const [hovered, setHovered] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
                onClick={() => inputRef.current?.click()}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    position: 'relative', width: 72, height: 72, borderRadius: 18,
                    cursor: 'pointer', overflow: 'hidden',
                    border: `2px dashed ${hovered ? COLORS.green : COLORS.greenBorder}`,
                    background: preview ? 'transparent' : COLORS.greenBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    transform: hovered ? 'scale(1.04)' : 'scale(1)',
                }}
            >
                {/* Hidden file input */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    style={{ display: 'none' }}
                />

                {/* Preview image */}
                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
                    />
                ) : (
                    <CameraIcon color={hovered ? COLORS.green : COLORS.greenLight} />
                )}

                {/* Hover overlay (shown on top of preview too) */}
                {hovered && (
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: 16,
                        background: 'rgba(42,99,68,0.22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CameraIcon color="#fff" />
                    </div>
                )}
            </div>
            <div style={{ fontSize: 10.5, color: COLORS.textMuted, textAlign: 'center' }}>
                {preview ? 'Click to change photo' : 'Click to upload photo'}
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AddAdmin() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', role: '' as Role | '', password: '', confirmPassword: '' });
    const [permissions, setPermissions] = useState<Set<Permission>>(new Set());
    const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
    const [submitted, setSubmitted] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);

    const setField = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

    const selectRole = (role: Role) => {
        setForm(p => ({ ...p, role }));
        setPermissions(new Set(ROLE_DEFAULT_PERMS[role]));
    };

    const togglePerm = (p: Permission) => {
        setPermissions(prev => {
            const next = new Set(prev);
            next.has(p) ? next.delete(p) : next.add(p);
            return next;
        });
    };

    const validate = () => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = 'Full name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
        if (!form.role) e.role = 'Please select a role' as any;
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 8) e.password = 'Minimum 8 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = async () => {
        if (step === 1) {
            const e: typeof errors = {};
            if (!form.name.trim()) e.name = 'Full name is required';
            if (!form.email.trim()) e.email = 'Email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
            if (!form.role) e.role = 'Please select a role' as any;
            setErrors(e);
            if (Object.keys(e).length === 0) setStep(2);
        } else {
            if (!validate()) return;
            setIsLoading(true);
            const nameParts = form.name.trim().split(' ');
            const first_name = nameParts[0];
            const last_name = nameParts.slice(1).join(' ') || nameParts[0];
            const data = await registerAdmin({
                first_name,
                last_name,
                email: form.email,
                password: form.password,
                phone: form.phone || '0000000000',
            });
            const message = data?.massage || data?.message || 'Something went wrong.';
            if (data?.status === 201) {
                toast.success(message);
                setSubmitted(true);
            } else {
                toast.error(message);
            }
            setIsLoading(false);
        }
    };

    const permGroups = PERMISSIONS.reduce<Record<string, typeof PERMISSIONS>>((acc, p) => {
        if (!acc[p.group]) acc[p.group] = [];
        acc[p.group].push(p);
        return acc;
    }, {});

    const strengthScore = (() => {
        const p = form.password;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore];
    const strengthColor = ['', COLORS.red, COLORS.amber, '#2196F3', COLORS.green][strengthScore];

    // ── Success Screen ──────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", padding: 24 }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                    *{box-sizing:border-box;margin:0;padding:0;}
                    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
                    @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
                `}</style>
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: '48px 40px', maxWidth: 420, width: '100%', textAlign: 'center', animation: 'fadeUp 0.4s ease both', boxShadow: '0 16px 48px rgba(0,0,0,0.06)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: COLORS.greenBg, border: `2px solid ${COLORS.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'checkPop 0.4s cubic-bezier(0.4,0,0.2,1) both 0.2s' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: COLORS.dark, marginBottom: 8 }}>Admin Created</div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 6, lineHeight: 1.5 }}>
                        <strong style={{ color: COLORS.dark }}>{form.name}</strong> has been added as <strong style={{ color: COLORS.green }}>{form.role}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 28 }}>An invite email has been sent to <span style={{ color: COLORS.blue }}>{form.email}</span></div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={() => { setForm({ name: '', email: '', phone: '', role: '', password: '', confirmPassword: '' }); setPermissions(new Set()); setErrors({}); setSubmitted(false); setStep(1); }}
                            style={{ flex: 1, padding: '10px', background: COLORS.sand, border: `1px solid ${COLORS.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Add another
                        </button>
                        <button onClick={() => window.location.href = '/dashboard/view-admins'} style={{ flex: 1, padding: '10px', background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                            View all admins →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Form ───────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Outfit', sans-serif", padding: '32px 24px', boxSizing: 'border-box' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                *{box-sizing:border-box;margin:0;padding:0;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                .perm-toggle{transition:all 0.18s;cursor:pointer;}
                .perm-toggle:hover{border-color:${COLORS.green} !important;background:${COLORS.greenBg} !important;}
                .role-card{transition:all 0.2s;cursor:pointer;}
                .role-card:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,0.07) !important;}
                .btn-primary{transition:all 0.18s;}
                .btn-primary:hover:not(:disabled){background:#1F4F35 !important;transform:translateY(-1px);}
                @keyframes spin{to{transform:rotate(360deg)}}
                .btn-secondary{transition:all 0.18s;}
                .btn-secondary:hover{background:#F0EDE8 !important;}
                @media(max-width:560px){
                    .grid-2-col{grid-template-columns:1fr !important;}
                    .role-grid{grid-template-columns:1fr !important;}
                    .perm-grid{grid-template-columns:1fr !important;}
                }
            `}</style>

            <div style={{margin: '0 auto', width: '100%' }}>

                {/* Header */}
                <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>

                        <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase' }}>Admins / Add New</div>
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: COLORS.dark, letterSpacing: '-0.02em' }}>Add Admin</h1>
                    <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>Create a new admin account and configure their access.</p>
                </div>

                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, animation: 'fadeUp 0.4s ease both 0.06s' }}>
                    {[{ n: 1, label: 'Identity & Role' }, { n: 2, label: 'Security & Permissions' }].map((s, idx) => (
                        <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: idx < 1 ? 'initial' : 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: step === s.n ? COLORS.dark : step > s.n ? COLORS.green : COLORS.border,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.25s',
                                }}>
                                    {step > s.n
                                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                        : <span style={{ fontSize: 11, fontWeight: 700, color: step === s.n ? '#fff' : COLORS.textMuted }}>{s.n}</span>
                                    }
                                </div>
                                <span style={{ fontSize: 12, fontWeight: step === s.n ? 600 : 400, color: step === s.n ? COLORS.dark : COLORS.textMuted, whiteSpace: 'nowrap' }}>{s.label}</span>
                            </div>
                            {idx < 1 && <div style={{ flex: 1, height: 1, background: step > 1 ? COLORS.green : COLORS.border, margin: '0 14px', transition: 'background 0.3s', minWidth: 40 }} />}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', animation: 'fadeUp 0.4s ease both 0.1s', width: '100%' }}>

                    {/* ── Step 1 ─────────────────────────────────────────── */}
                    {step === 1 && (
                        <div style={{ padding: 28 }}>

                            {/* Avatar Upload — camera icon only, no initials */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                                <AvatarUpload />
                            </div>

                            {/* Name + Email */}
                            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <InputField label="Full Name" value={form.name} onChange={setField('name')} placeholder="e.g. Rahul Sharma" error={errors.name} />
                                <InputField label="Email Address" value={form.email} onChange={setField('email')} type="email" placeholder="rahul@arova.com" error={errors.email} />
                            </div>

                            <div style={{ marginBottom: 28 }}>
                                <InputField
                                    label="Phone (optional)"
                                    value={form.phone}
                                    onChange={setField('phone')}
                                    placeholder="+91 98765 43210"
                                    prefixIcon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>}
                                    hint="Used for 2FA and account recovery"
                                />
                            </div>

                            {/* Role selection */}
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em', marginBottom: 10 }}>Role</div>
                                <div className="role-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {ROLES.map(r => {
                                        const selected = form.role === r.id;
                                        return (
                                            <div key={r.id} className="role-card" onClick={() => selectRole(r.id)}
                                                style={{
                                                    padding: '12px 14px', borderRadius: 10,
                                                    border: `1.5px solid ${selected ? r.color : COLORS.border}`,
                                                    background: selected ? r.bg : COLORS.white,
                                                    display: 'flex', alignItems: 'center', gap: 10,
                                                    boxShadow: selected ? `0 2px 12px ${r.color}20` : 'none',
                                                }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: selected ? `${r.color}18` : COLORS.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s' }}>
                                                    {ROLE_ICONS[r.id](selected ? r.color : COLORS.textSub)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 12.5, fontWeight: 600, color: selected ? r.color : COLORS.dark, marginBottom: 2 }}>{r.label}</div>
                                                    <div style={{ fontSize: 10.5, color: COLORS.textMuted }}>{r.desc}</div>
                                                </div>
                                                {selected && (
                                                    <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.role && (
                                    <div style={{ fontSize: 11, color: COLORS.red, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                        {errors.role}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Step 2 ─────────────────────────────────────────── */}
                    {step === 2 && (
                        <div style={{ padding: 28 }}>
                            {/* Password */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em', marginBottom: 6 }}>Password</div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setField('password')(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        style={{ width: '100%', padding: '10px 40px 10px 14px', background: COLORS.white, border: `1.5px solid ${errors.password ? COLORS.red : COLORS.borderInput}`, borderRadius: 9, fontSize: 13, color: COLORS.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }}
                                    />
                                    <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textMuted, display: 'flex', alignItems: 'center' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            {showPass
                                                ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                            }
                                        </svg>
                                    </button>
                                </div>
                                {form.password && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strengthScore ? strengthColor : '#E8E4DC', transition: 'background 0.25s' }} />
                                            ))}
                                        </div>
                                        <div style={{ fontSize: 10.5, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</div>
                                    </div>
                                )}
                                {errors.password && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> {errors.password}</div>}
                            </div>

                            {/* Confirm Password */}
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em', marginBottom: 6 }}>Confirm Password</div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={form.confirmPassword}
                                        onChange={e => setField('confirmPassword')(e.target.value)}
                                        placeholder="Repeat password"
                                        style={{ width: '100%', padding: '10px 40px 10px 14px', background: COLORS.white, border: `1.5px solid ${errors.confirmPassword ? COLORS.red : COLORS.borderInput}`, borderRadius: 9, fontSize: 13, color: COLORS.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }}
                                    />
                                    <button onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textMuted, display: 'flex', alignItems: 'center' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            {showConfirm
                                                ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                            }
                                        </svg>
                                    </button>
                                </div>
                                {errors.confirmPassword && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> {errors.confirmPassword}</div>}
                            </div>

                            {/* Permissions */}
                            <div style={{ paddingTop: 20, borderTop: `1px solid ${COLORS.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark }}>Permissions</div>
                                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>Pre-filled based on role · customise below</div>
                                    </div>
                                    <div style={{ fontSize: 10.5, color: COLORS.green, fontWeight: 600, background: COLORS.greenBg, padding: '3px 10px', borderRadius: 20 }}>{permissions.size} active</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {Object.entries(permGroups).map(([group, perms]) => (
                                        <div key={group}>
                                            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#C4C0B8', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>{group}</div>
                                            <div className="perm-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                {perms.map(p => {
                                                    const on = permissions.has(p.id);
                                                    return (
                                                        <div key={p.id} className="perm-toggle" onClick={() => togglePerm(p.id)}
                                                            style={{
                                                                padding: '10px 12px', borderRadius: 9,
                                                                border: `1.5px solid ${on ? COLORS.greenBorder : COLORS.border}`,
                                                                background: on ? COLORS.greenBg : COLORS.white,
                                                                display: 'flex', alignItems: 'center', gap: 10,
                                                            }}>
                                                            <div style={{ width: 16, height: 16, borderRadius: 4, background: on ? COLORS.green : COLORS.white, border: `1.5px solid ${on ? COLORS.green : COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s' }}>
                                                                {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: 11.5, fontWeight: 600, color: on ? COLORS.green : COLORS.dark }}>{p.label}</div>
                                                                <div style={{ fontSize: 10, color: COLORS.textMuted }}>{p.desc}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ padding: '16px 28px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: COLORS.bg }}>
                        <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>Step {step} of 2</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {step === 2 && (
                                <button className="btn-secondary" onClick={() => setStep(1)}
                                    style={{ padding: '9px 20px', background: COLORS.white, border: `1.5px solid ${COLORS.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    ← Back
                                </button>
                            )}
                            <button className="btn-primary" onClick={handleNext} disabled={isLoading}
                                style={{ padding: '9px 24px', background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, opacity: isLoading ? 0.7 : 1 }}>
                                {step === 1 ? (
                                    <>Continue <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg></>
                                ) : isLoading ? (
                                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" style={{ animation: 'spin 0.7s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Creating...</>
                                ) : (
                                    <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Create Admin</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { getAdminProfile, updateAdmin, changeAdminPassword } from '../../services/auth/authService';
import { getStoreSetting, saveStoreSetting } from '../../services/setting/settingService';
import { useConfirm, useToast } from '../../context/UIContext';

const COLORS = {
    bg: '#FAFAF8', white: '#FFFFFF', dark: '#1A1A1A', green: '#2A6344',
    greenLight: '#48A87A', greenBg: '#EAF4EE', greenBorder: '#C4DFD0',
    border: '#EEEBE5', borderInput: '#E8E4DE', textMuted: '#9A968F',
    textSub: '#6A6560', sand: '#F6F4F0', red: '#C62828', redBg: '#FFEBEE',
    redBorder: '#FFCDD2', amber: '#A05A10', amberBg: '#FEF3E2', amberBorder: '#F5D99A',
    blue: '#1A56DB', blueBg: '#E8F0FE', blueBorder: '#BFCEF8',
    purple: '#7C3AED', purpleBg: '#F3E8FF',
};

type TabId = 'general' | 'profile' | 'notifications' | 'security' | 'billing' | 'api';

// ─── Toggle ────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div onClick={() => onChange(!value)} style={{
            width: 38, height: 22, borderRadius: 11,
            background: value ? COLORS.green : '#D4CFC8',
            position: 'relative', cursor: 'pointer',
            transition: 'background 0.22s', flexShrink: 0,
        }}>
            <div style={{
                position: 'absolute', top: 3,
                left: value ? 19 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            }} />
        </div>
    );
}

// ─── Reusable Section Card ─────────────────────────────────────────────────
function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            background: COLORS.white, border: `1px solid ${COLORS.border}`,
            borderRadius: 14, overflow: 'hidden', marginBottom: 16, ...style,
        }}>
            {children}
        </div>
    );
}

function SectionHeader({ icon, iconBg, title, sub }: {
    icon: React.ReactNode; iconBg: string; iconColor?: string; title: string; sub: string;
}) {
    return (
        <div style={{ padding: '16px 22px', borderBottom: `1px solid #F0ECE6`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.dark }}>{title}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>{sub}</div>
            </div>
        </div>
    );
}

function SettingRow({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
    return (
        <div className="setting-row" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 22px', borderBottom: `1px solid #F6F4F0`,
        }}>
            <div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark }}>{label}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{sub}</div>
            </div>
            {children}
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>{children}</label>;
}

function Input({ value, onChange, type = 'text', placeholder, readOnly }: {
    value?: string; onChange?: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean;
}) {
    return (
        <input
            className="arova-inp"
            type={type}
            value={value}
            placeholder={placeholder}
            readOnly={readOnly}
            onChange={e => onChange?.(e.target.value)}
            style={{
                width: '100%', padding: '9px 13px',
                background: readOnly ? COLORS.sand : COLORS.white,
                border: `1.5px solid ${COLORS.borderInput}`,
                borderRadius: 9, fontSize: 12.5, color: COLORS.dark,
                outline: 'none', fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box',
                cursor: readOnly ? 'not-allowed' : 'text',
            }}
        />
    );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <select
            className="arova-inp"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{
                width: '100%', padding: '9px 13px',
                background: COLORS.white,
                border: `1.5px solid ${COLORS.borderInput}`,
                borderRadius: 9, fontSize: 12.5, color: COLORS.dark,
                outline: 'none', fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box', cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239A968F' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
            }}
        >
            {options.map(o => <option key={o}>{o}</option>)}
        </select>
    );
}

function Badge({ children, type = 'green' }: { children: React.ReactNode; type?: 'green' | 'red' | 'amber' }) {
    const styles = {
        green: { bg: COLORS.greenBg, color: COLORS.green, border: COLORS.greenBorder },
        red: { bg: COLORS.redBg, color: COLORS.red, border: COLORS.redBorder },
        amber: { bg: COLORS.amberBg, color: COLORS.amber, border: COLORS.amberBorder },
    }[type];
    return (
        <span style={{
            background: styles.bg, color: styles.color,
            border: `1px solid ${styles.border}`,
            fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
        }}>{children}</span>
    );
}

function BtnDark({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
    return (
        <button onClick={onClick} className="btn-dark" style={{
            padding: '8px 16px', background: COLORS.dark, border: 'none',
            borderRadius: 9, fontSize: 12, fontWeight: 500, color: '#fff',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>{children}</button>
    );
}

function BtnOutline({ children, onClick, danger }: { children: React.ReactNode; onClick?: () => void; danger?: boolean }) {
    return (
        <button onClick={onClick} className={danger ? 'btn-danger' : 'btn-outline'} style={{
            padding: '8px 16px',
            background: danger ? COLORS.redBg : COLORS.sand,
            border: `1px solid ${danger ? COLORS.redBorder : COLORS.border}`,
            borderRadius: 9, fontSize: 12, fontWeight: 500,
            color: danger ? COLORS.red : COLORS.textSub,
            cursor: 'pointer', fontFamily: 'inherit',
        }}>{children}</button>
    );
}

// ─── TABS ──────────────────────────────────────────────────────────────────
// ── 1. General ─────────────────────────────────────────────────────────────
function GeneralTab() {
    const toast = useToast();
    const [storeName, setStoreName] = useState('');
    const [storeUrl, setStoreUrl] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [desc, setDesc] = useState('');
    const [currency, setCurrency] = useState('₹ INR — Indian Rupee');
    const [timezone, setTimezone] = useState('Asia/Kolkata (IST +5:30)');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
    const [language, setLanguage] = useState('English (US)');
    const [compact, setCompact] = useState(false);
    const [welcome, setWelcome] = useState(true);
    const [liveData, setLiveData] = useState(true);
    const [accentColor, setAccentColor] = useState('#2A6344');

    const swatches = ['#2A6344', '#1A56DB', '#7C3AED', '#A05A10', '#C62828'];

    useEffect(() => {
        getStoreSetting('general').then(res => {
            if (res?.status === 200 && res.result) {
                const val = res.result.value;
                setStoreName(val.storeName || '');
                setStoreUrl(val.storeUrl || '');
                setEmail(val.email || '');
                setPhone(val.phone || '');
                setDesc(val.desc || '');
                setCurrency(val.currency || '₹ INR — Indian Rupee');
                setTimezone(val.timezone || 'Asia/Kolkata (IST +5:30)');
                setDateFormat(val.dateFormat || 'DD/MM/YYYY');
                setLanguage(val.language || 'English (US)');
                setAccentColor(val.accentColor || '#2A6344');
                setCompact(val.compact ?? false);
                setWelcome(val.welcome ?? true);
                setLiveData(val.liveData ?? true);
            }
        });
    }, []);

    const handleSaveGeneral = async () => {
        const value = { storeName, storeUrl, email, phone, desc, currency, timezone, dateFormat, language, accentColor, compact, welcome, liveData };
        const res = await saveStoreSetting('general', value);
        if (res?.status === 200) {
            toast.success("General settings updated successfully");
        } else {
            toast.error("Failed to save general settings");
        }
    };

    useEffect(() => {
        const onSave = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.tab === 'general') {
                handleSaveGeneral();
            }
        };
        window.addEventListener('arova-settings-save' as any, onSave);
        return () => window.removeEventListener('arova-settings-save' as any, onSave);
    }, [storeName, storeUrl, email, phone, desc, currency, timezone, dateFormat, language, compact, welcome, liveData, accentColor]);

    return (
        <>
            {/* Store Info */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.greenBg} iconColor={COLORS.green} title="Store Information" sub="Basic details about your store"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
                />
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="setting-form-grid">
                        <div><Label>STORE NAME</Label><Input value={storeName} onChange={setStoreName} /></div>
                        <div><Label>STORE URL</Label><Input value={storeUrl} onChange={setStoreUrl} /></div>
                    </div>
                    <div className="setting-form-grid">
                        <div><Label>SUPPORT EMAIL</Label><Input value={email} onChange={setEmail} type="email" /></div>
                        <div><Label>PHONE NUMBER</Label><Input value={phone} onChange={setPhone} type="tel" /></div>
                    </div>
                    <div>
                        <Label>STORE DESCRIPTION</Label>
                        <textarea
                            className="arova-inp"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%', padding: '9px 13px', background: COLORS.white,
                                border: `1.5px solid ${COLORS.borderInput}`, borderRadius: 9,
                                fontSize: 12.5, color: COLORS.dark, outline: 'none',
                                fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box', resize: 'vertical',
                            }}
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Regional */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.blueBg} iconColor={COLORS.blue} title="Regional & Currency" sub="Localization preferences"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>}
                />
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="setting-form-grid">
                        <div><Label>CURRENCY</Label><Select value={currency} onChange={setCurrency} options={['₹ INR — Indian Rupee', '$ USD — US Dollar', '€ EUR — Euro', '£ GBP — British Pound']} /></div>
                        <div><Label>TIMEZONE</Label><Select value={timezone} onChange={setTimezone} options={['Asia/Kolkata (IST +5:30)', 'UTC', 'America/New_York', 'Europe/London']} /></div>
                    </div>
                    <div className="setting-form-grid">
                        <div><Label>DATE FORMAT</Label><Select value={dateFormat} onChange={setDateFormat} options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} /></div>
                        <div><Label>LANGUAGE</Label><Select value={language} onChange={setLanguage} options={['English (US)', 'Hindi', 'Gujarati']} /></div>
                    </div>
                </div>
            </SectionCard>

            {/* Appearance */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.purpleBg} iconColor={COLORS.purple} title="Appearance" sub="Theme and display preferences"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.purple} strokeWidth="1.8"><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="19" cy="14" r="2.5" /><circle cx="6" cy="14" r="2.5" /><path d="M6 14c0 3.31 2.69 6 6 6s6-2.69 6-6" /></svg>}
                />
                <div style={{ padding: '14px 22px', borderBottom: `1px solid #F6F4F0`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark }}>Accent Color</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Primary color used across the dashboard</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {swatches.map(c => (
                            <div key={c} onClick={() => setAccentColor(c)} style={{
                                width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer',
                                border: `2px solid ${accentColor === c ? COLORS.dark : 'transparent'}`,
                                transform: accentColor === c ? 'scale(1.15)' : 'scale(1)',
                                transition: 'all 0.16s',
                            }} />
                        ))}
                    </div>
                </div>
                <SettingRow label="Compact Mode" sub="Reduce spacing in tables and cards">
                    <Toggle value={compact} onChange={setCompact} />
                </SettingRow>
                <SettingRow label="Show Welcome Message" sub="Display greeting on dashboard home">
                    <Toggle value={welcome} onChange={setWelcome} />
                </SettingRow>
                <div style={{ borderBottom: 'none' }}>
                    <SettingRow label="Live Data Updates" sub="Auto-refresh dashboard stats every 4.5s">
                        <Toggle value={liveData} onChange={setLiveData} />
                    </SettingRow>
                </div>
            </SectionCard>
        </>
    );
}

// ── 2. Profile ──────────────────────────────────────────────────────────────
function ProfileTab() {
    const toast = useToast();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Admin User');
    const [adminId, setAdminId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const res = await getAdminProfile();
            if (res?.status === 200 && res.result) {
                const admin = res.result;
                setFirstName(admin.first_name || '');
                setLastName(admin.last_name || '');
                setEmail(admin.email || '');
                setRole(admin.role || 'Super Admin');
                setAdminId(admin._id || '');
            }
        } catch (error) {
            toast.error("Failed to load profile details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleUpdateProfile = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            toast.error("All fields are required.");
            return;
        }
        try {
            const res = await updateAdmin(adminId, {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
            });
            if (res && res.status === 200) {
                toast.success(res.massage || "Profile updated successfully.");
                loadProfile();
            } else {
                toast.error(res?.massage || "Failed to update profile.");
            }
        } catch (error) {
            toast.error("Failed to update profile.");
        }
    };

    const activity = [
        { dot: COLORS.green, msg: 'Loaded admin dashboard preferences', time: 'Just now' },
        { dot: COLORS.blue, msg: 'Updated personal profile settings', time: '1m ago' },
        { dot: COLORS.amber, msg: 'Verified catalog records sync', time: '1h ago' },
    ];

    if (isLoading) {
        return (
            <SectionCard>
                <div style={{ padding: '24px', textAlign: 'center', fontSize: 13, color: COLORS.textMuted }}>
                    Loading profile...
                </div>
            </SectionCard>
        );
    }

    return (
        <>
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.greenBg} iconColor={COLORS.green} title="Personal Information" sub="Your admin profile details"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                />
                <div style={{ padding: '20px 22px' }}>
                    {/* Avatar row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, paddingBottom: 20, borderBottom: `1px solid #F0ECE6` }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 16,
                            background: COLORS.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, fontWeight: 600, color: COLORS.green,
                            border: `2px solid ${COLORS.greenBorder}`, flexShrink: 0,
                        }}>{(firstName[0] || 'A').toUpperCase()}</div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark, marginBottom: 4 }}>{firstName} {lastName}</div>
                            <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginBottom: 10 }}>{email} · {role}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="setting-form-grid">
                            <div><Label>FIRST NAME</Label><Input value={firstName} onChange={setFirstName} /></div>
                            <div><Label>LAST NAME</Label><Input value={lastName} onChange={setLastName} /></div>
                        </div>
                        <div><Label>EMAIL ADDRESS</Label><Input value={email} onChange={setEmail} type="email" /></div>
                        <div><Label>ROLE</Label><Input value={role} readOnly /></div>
                        <div style={{ marginTop: 8 }}><BtnDark onClick={handleUpdateProfile}>Update Profile</BtnDark></div>
                    </div>
                </div>
            </SectionCard>

            {/* Recent Activity */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.amberBg} iconColor={COLORS.amber} title="Recent Activity" sub="Your last admin actions"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                />
                {activity.map((a, i) => (
                    <div key={i} className="setting-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 22px', borderBottom: i < activity.length - 1 ? `1px solid #F6F4F0` : 'none' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: a.dot, flexShrink: 0, marginTop: 4 }} />
                        <div>
                            <div style={{ fontSize: 12.5, color: COLORS.dark }}>{a.msg}</div>
                            <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginTop: 2 }}>{a.time}</div>
                        </div>
                    </div>
                ))}
            </SectionCard>
        </>
    );
}

// ── 3. Notifications ────────────────────────────────────────────────────────
function NotificationsTab() {
    const toast = useToast();
    const [notifs, setNotifs] = useState([
        { label: 'New Orders', sub: 'Get notified when a new order is placed', on: true },
        { label: 'Low Stock Alerts', sub: 'Alert when product stock falls below 10 units', on: true },
        { label: 'New User Registrations', sub: 'Notify when a new customer signs up', on: false },
        { label: 'Payment Failures', sub: 'Alert on failed or declined transactions', on: true },
        { label: 'Weekly Revenue Report', sub: 'Summary email every Monday morning', on: true },
        { label: 'Admin Login Alerts', sub: 'Notify when a new admin session starts', on: false },
        { label: 'Product Reviews', sub: 'When customers leave product reviews', on: false },
    ]);
    const [freq, setFreq] = useState('Real-time');
    const freqs = ['Real-time', 'Daily digest', 'Weekly digest', 'Never'];

    useEffect(() => {
        getStoreSetting('notifications').then(res => {
            if (res?.status === 200 && res.result) {
                const val = res.result.value;
                setNotifs([
                    { label: 'New Orders', sub: 'Get notified when a new order is placed', on: val.newOrders ?? true },
                    { label: 'Low Stock Alerts', sub: 'Alert when product stock falls below 10 units', on: val.lowStock ?? true },
                    { label: 'New User Registrations', sub: 'Notify when a new customer signs up', on: val.newUser ?? false },
                    { label: 'Payment Failures', sub: 'Alert on failed or declined transactions', on: val.paymentFailed ?? true },
                    { label: 'Weekly Revenue Report', sub: 'Summary email every Monday morning', on: val.weeklyReports ?? true },
                    { label: 'Admin Login Alerts', sub: 'Notify when a new admin session starts', on: val.adminLoginAlerts ?? false },
                    { label: 'Product Reviews', sub: 'When customers leave product reviews', on: val.productReviews ?? false },
                ]);
                setFreq(val.emailDigest || 'Real-time');
            }
        });
    }, []);

    const handleSaveNotifs = async () => {
        const value = {
            newOrders: notifs[0].on,
            lowStock: notifs[1].on,
            newUser: notifs[2].on,
            paymentFailed: notifs[3].on,
            weeklyReports: notifs[4].on,
            adminLoginAlerts: notifs[5].on,
            productReviews: notifs[6].on,
            emailDigest: freq
        };
        const res = await saveStoreSetting('notifications', value);
        if (res?.status === 200) {
            toast.success("Notification preferences updated");
        }
    };

    useEffect(() => {
        const onSave = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.tab === 'notifications') {
                handleSaveNotifs();
            }
        };
        window.addEventListener('arova-settings-save' as any, onSave);
        return () => window.removeEventListener('arova-settings-save' as any, onSave);
    }, [notifs, freq]);

    const toggle = (i: number) => setNotifs(prev => prev.map((n, idx) => idx === i ? { ...n, on: !n.on } : n));

    return (
        <>
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.greenBg} iconColor={COLORS.green} title="Notification Preferences" sub="Choose what alerts you receive"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>}
                />
                {notifs.map((n, i) => (
                    <div key={n.label} style={{ borderBottom: i < notifs.length - 1 ? `1px solid #F6F4F0` : 'none' }}>
                        <SettingRow label={n.label} sub={n.sub}>
                            <Toggle value={n.on} onChange={() => toggle(i)} />
                        </SettingRow>
                    </div>
                ))}
            </SectionCard>

            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.blueBg} iconColor={COLORS.blue} title="Email Digest" sub="Frequency for email summaries"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                />
                <div style={{ padding: '16px 22px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {freqs.map(f => (
                        <button key={f} onClick={() => setFreq(f)} className="chip" style={{
                            padding: '5px 14px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
                            border: `1.5px solid ${freq === f ? COLORS.green : COLORS.border}`,
                            background: freq === f ? COLORS.greenBg : COLORS.white,
                            color: freq === f ? COLORS.green : COLORS.textMuted,
                            cursor: 'pointer', fontFamily: 'inherit',
                        }}>{f}</button>
                    ))}
                </div>
            </SectionCard>
        </>
    );
}

// ── 4. Security ─────────────────────────────────────────────────────────────
function SecurityTab() {
    const confirm = useConfirm();
    const toast = useToast();
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [twoFA, setTwoFA] = useState(false);
    const [loginNotif, setLoginNotif] = useState(true);
    const [session, setSession] = useState('30 minutes');
    const [isUpdating, setIsUpdating] = useState(false);

    const strength = newPw.length === 0 ? 0 : newPw.length < 6 ? 25 : newPw.length < 10 ? 55 : /[^a-zA-Z0-9]/.test(newPw) ? 100 : 75;
    const strengthLabel = ['', 'Weak', 'Medium', 'Strong', 'Very strong'][Math.ceil(strength / 25)];
    const strengthColor = [COLORS.red, COLORS.red, COLORS.amber, COLORS.green, COLORS.green][Math.ceil(strength / 25)];

    useEffect(() => {
        getStoreSetting('security_prefs').then(res => {
            if (res?.status === 200 && res.result) {
                const val = res.result.value;
                setTwoFA(val.twoFA ?? false);
                setSession(val.session || '30 minutes');
                setLoginNotif(val.loginNotif ?? true);
            }
        });
    }, []);

    const handleSaveSecurityPrefs = async () => {
        const value = { twoFA, session, loginNotif };
        const res = await saveStoreSetting('security_prefs', value);
        if (res?.status === 200) {
            toast.success("Security preferences updated successfully");
        }
    };

    useEffect(() => {
        const onSave = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.tab === 'security') {
                handleSaveSecurityPrefs();
            }
        };
        window.addEventListener('arova-settings-save' as any, onSave);
        return () => window.removeEventListener('arova-settings-save' as any, onSave);
    }, [twoFA, session, loginNotif]);

    const handleUpdatePassword = async () => {
        if (!currentPw || !newPw || !confirmPw) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPw !== confirmPw) {
            toast.error("New passwords do not match.");
            return;
        }
        if (newPw.length < 8) {
            toast.error("New password must be at least 8 characters long.");
            return;
        }

        setIsUpdating(true);
        try {
            const res = await changeAdminPassword({
                current_password: currentPw,
                new_password: newPw,
            });
            if (res && res.status === 200) {
                toast.success(res.massage || "Password changed successfully.");
                setCurrentPw('');
                setNewPw('');
                setConfirmPw('');
            } else {
                toast.error(res?.massage || "Failed to update password.");
            }
        } catch (error) {
            toast.error("Failed to update password.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleResetSettings = async () => {
        const ok = await confirm({
            title: "Reset All Settings",
            message: "Are you sure you want to restore all settings to factory defaults? This action is irreversible.",
            confirmText: "Yes, Reset Defaults",
            cancelText: "Cancel",
            isDanger: true
        });
        if (ok) {
            toast.success("Settings restored to factory defaults.");
        }
    };

    const handleDeleteAccount = async () => {
        const ok = await confirm({
            title: "Delete Admin Account",
            message: "WARNING: This action is permanent. All your data, credentials, and permissions will be deleted immediately. Are you sure you want to delete your account?",
            confirmText: "Yes, Delete Permanent",
            cancelText: "Cancel",
            isDanger: true
        });
        if (ok) {
            toast.success("Account deleted. Redirecting...");
            localStorage.removeItem("adminAuthToken");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);
        }
    };

    return (
        <>
            {/* Password */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.greenBg} iconColor={COLORS.green} title="Password & Authentication" sub="Keep your account secure"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
                />
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><Label>CURRENT PASSWORD</Label><Input value={currentPw} onChange={setCurrentPw} type="password" placeholder="••••••••" /></div>
                    <div className="setting-form-grid">
                        <div><Label>NEW PASSWORD</Label><Input value={newPw} onChange={setNewPw} type="password" placeholder="Min. 8 characters" /></div>
                        <div><Label>CONFIRM PASSWORD</Label><Input value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Repeat new password" /></div>
                    </div>
                    {newPw.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                                <span style={{ color: COLORS.textSub }}>Password Strength: <span style={{ color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span></span>
                                <span style={{ color: COLORS.textMuted }}>{strength}%</span>
                            </div>
                            <div style={{ height: 4, background: '#F0ECE8', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${strength}%`, background: strengthColor, transition: 'width 0.3s' }} />
                            </div>
                        </div>
                    )}
                    <div><BtnDark onClick={handleUpdatePassword}>{isUpdating ? 'Updating...' : 'Update Password'}</BtnDark></div>
                </div>
            </SectionCard>

            {/* 2FA + Session */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.redBg}
                    title="Danger Zone"
                    sub="Irreversible actions — proceed with caution"
                    icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="1.8">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    }
                />

                <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>

                    {[
                        {
                            title: "Reset All Settings",
                            sub: "Restore all settings to factory defaults",
                            action: handleResetSettings,
                            button: "Reset"
                        },
                        {
                            title: "Delete Admin Account",
                            sub: "Permanently remove this admin from the system",
                            action: handleDeleteAccount,
                            button: "Delete Account"
                        }
                    ].map((d) => (

                        <div
                            key={d.title}
                            className="danger-zone-row"
                            style={{
                                border: `1px solid ${COLORS.redBorder}`,
                                background: COLORS.redBg,
                                padding: "16px",
                                borderRadius: 10
                            }}
                        >

                            <div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: COLORS.red
                                    }}
                                >
                                    {d.title}
                                </div>

                                <div
                                    style={{
                                        fontSize: 11,
                                        color: COLORS.textMuted,
                                        marginTop: 2
                                    }}
                                >
                                    {d.sub}
                                </div>
                            </div>

                            <BtnOutline
                                danger
                                onClick={d.action}
                            >
                                {d.button}
                            </BtnOutline>

                        </div>

                    ))}

                </div>

            </SectionCard>
        </>
    );
}

// ── 5. Billing ──────────────────────────────────────────────────────────────
function BillingTab() {
    const toast = useToast();
    const [activePlan, setActivePlan] = useState('Pro');
    const [invoices, setInvoices] = useState<any[]>([]);

    const plans = [
        { name: 'Starter', price: '₹1,499', features: ['5 Admins', '10K products', '5 GB storage', 'Email support'] },
        { name: 'Pro', price: '₹4,999', features: ['20 Admins', '100K products', '20 GB storage', 'Priority support'] },
        { name: 'Enterprise', price: 'Custom', features: ['Unlimited Admins', 'Unlimited products', '500 GB storage', 'Dedicated support'] },
    ];

    useEffect(() => {
        getStoreSetting('billing').then(res => {
            if (res?.status === 200 && res.result) {
                const val = res.result.value;
                setActivePlan(val.activePlan || 'Pro');
                setInvoices(val.invoices || []);
            }
        });
    }, []);

    const handleSaveBilling = async () => {
        const value = { activePlan, invoices };
        const res = await saveStoreSetting('billing', value);
        if (res?.status === 200) {
            toast.success("Billing preferences updated");
        }
    };

    useEffect(() => {
        const onSave = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.tab === 'billing') {
                handleSaveBilling();
            }
        };
        window.addEventListener('arova-settings-save' as any, onSave);
        return () => window.removeEventListener('arova-settings-save' as any, onSave);
    }, [activePlan, invoices]);

    return (
        <>
            {/* Current Plan */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.greenBg} iconColor={COLORS.green} title="Current Plan" sub="Your active subscription"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
                />
                <div style={{ padding: '20px 22px' }}>
                    <div className="billing-stats-grid">
                        {[
                            { label: 'Current plan', val: activePlan, color: COLORS.dark },
                            { label: 'Per month', val: activePlan === 'Starter' ? '₹1,499' : activePlan === 'Pro' ? '₹4,999' : 'Custom', color: COLORS.green },
                            { label: 'Next renewal', val: 'Jul 22', color: COLORS.dark },
                        ].map(s => (
                            <div key={s.label} style={{ background: COLORS.sand, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 600, color: s.color, letterSpacing: '-0.02em' }}>{s.val}</div>
                                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 6 }}>
                            <span style={{ color: COLORS.textSub }}>Storage used</span>
                            <span style={{ color: COLORS.dark, fontWeight: 500 }}>6.8 GB / 20 GB</span>
                        </div>
                        <div style={{ height: 5, background: COLORS.border, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '34%', background: COLORS.green, borderRadius: 3 }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <BtnDark onClick={() => toast.info("Request sent for plan upgrade.")}>Upgrade to Enterprise</BtnDark>
                        <BtnOutline onClick={() => toast.info("Redirecting to subscription portal...")}>Manage Subscription</BtnOutline>
                    </div>
                </div>
            </SectionCard>

            {/* Plan Comparison */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.amberBg} iconColor={COLORS.amber} title="Compare Plans" sub="Find the right plan for your store"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.8"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>}
                />
                <div className="billing-plan-comparison-grid" style={{ padding: '16px 22px' }}>
                    {plans.map(p => {
                        const isActive = p.name === activePlan;
                        return (
                            <div key={p.name} onClick={() => { setActivePlan(p.name); toast.success(`Selected plan: ${p.name}`); }} style={{
                                border: `1.5px solid ${isActive ? COLORS.green : COLORS.border}`,
                                borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                                background: isActive ? COLORS.greenBg : COLORS.white,
                                transition: 'all 0.18s',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? COLORS.green : COLORS.dark }}>{p.name}</div>
                                    {isActive && <Badge type="green">Current</Badge>}
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.dark, marginBottom: 12 }}>
                                    {p.price}<span style={{ fontSize: 10.5, fontWeight: 400, color: COLORS.textMuted }}>/mo</span>
                                </div>
                                {p.features.map(f => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.textSub, marginBottom: 5 }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                        {f}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Invoices */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.blueBg} iconColor={COLORS.blue} title="Invoice History" sub="Your past billing statements"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                />
                {invoices.map((inv, i) => (
                    <div key={inv.id} className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', borderBottom: i < invoices.length - 1 ? `1px solid #F6F4F0` : 'none', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 12, fontFamily: 'monospace', color: COLORS.dark, fontWeight: 500 }}>{inv.id}</span>
                            <span style={{ fontSize: 11.5, color: COLORS.textMuted }}>{inv.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.dark }}>{inv.amount}</span>
                            <Badge type="green">Paid</Badge>
                            <button onClick={() => toast.success(`Downloading invoice ${inv.id}`)} className="btn-outline" style={{
                                padding: '5px 10px', background: COLORS.sand, border: `1px solid ${COLORS.border}`,
                                borderRadius: 8, fontSize: 11, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit',
                            }}>Download</button>
                        </div>
                    </div>
                ))}
            </SectionCard>
        </>
    );
}

// ── 6. API & Integrations ───────────────────────────────────────────────────
function ApiTab() {
    const toast = useToast();
    const [revealed, setRevealed] = useState(false);
    const [secretKey, setSecretKey] = useState('');
    const [publishableKey, setPublishableKey] = useState('');
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [apps, setApps] = useState<any[]>([]);

    useEffect(() => {
        getStoreSetting('api').then(res => {
            if (res?.status === 200 && res.result) {
                const val = res.result.value;
                setSecretKey(val.secretKey || 'sk_live_arova_aJ9kMnXpQ2zLrT8vWbYcDeFgHiJk');
                setPublishableKey(val.publishableKey || 'pk_live_arova_jKmN9pQ2xLzR8tVa');
                setWebhooks(val.webhooks || []);
                setApps(val.connectedApps || []);
            }
        });
    }, []);

    const handleSaveApi = async () => {
        const value = { secretKey, publishableKey, webhooks, connectedApps: apps };
        const res = await saveStoreSetting('api', value);
        if (res?.status === 200) {
            toast.success("API & Integration settings updated");
        }
    };

    useEffect(() => {
        const onSave = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.tab === 'api') {
                handleSaveApi();
            }
        };
        window.addEventListener('arova-settings-save' as any, onSave);
        return () => window.removeEventListener('arova-settings-save' as any, onSave);
    }, [secretKey, publishableKey, webhooks, apps]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const handleGenerateKey = async () => {
        const newSecret = "sk_live_arova_" + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const newPub = "pk_live_arova_" + Math.random().toString(36).substring(2);
        setSecretKey(newSecret);
        setPublishableKey(newPub);
        toast.success("New keys generated. Click 'Save Changes' to apply.");
    };

    const handleToggleApp = (i: number) => {
        setApps(prev => prev.map((a, idx) => idx === i ? { ...a, connected: !a.connected } : a));
    };

    const handleAddWebhook = () => {
        const url = window.prompt("Enter webhook target URL:");
        if (!url) return;
        const event = window.prompt("Enter event type (e.g. order.created):", "order.created");
        if (!event) return;
        setWebhooks(prev => [...prev, { url, event, status: 'Active' }]);
        toast.success("Webhook endpoint added. Save to persist.");
    };

    return (
        <>
            {/* API Keys */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.purpleBg} iconColor={COLORS.purple} title="API Keys" sub="Manage access tokens for integrations"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.purple} strokeWidth="1.8"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>}
                />
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <Label>LIVE SECRET KEY</Label>
                        <div style={{ background: COLORS.sand, border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: COLORS.textSub, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, wordBreak: 'break-all' }}>
                            <span>{revealed ? secretKey : 'sk_live_••••••••••••••••••••••••••••••'}</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => setRevealed(v => !v)} style={{ padding: '4px 10px', background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 11, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>{revealed ? 'Hide' : 'Reveal'}</button>
                                <button onClick={() => handleCopy(secretKey)} style={{ padding: '4px 10px', background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 11, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>Copy</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label>PUBLISHABLE KEY</Label>
                        <div style={{ background: COLORS.sand, border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: COLORS.textSub, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, wordBreak: 'break-all' }}>
                            <span>{publishableKey}</span>
                            <button onClick={() => handleCopy(publishableKey)} style={{ padding: '4px 10px', background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 11, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>Copy</button>
                        </div>
                    </div>
                    <div><BtnDark onClick={handleGenerateKey}>Generate New Key</BtnDark></div>
                </div>
            </SectionCard>

            {/* Webhooks */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.amberBg} iconColor={COLORS.amber} title="Webhooks" sub="Receive real-time events to your server"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.8"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>}
                />
                {webhooks.map((w, i) => (
                    <div key={w.url} className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', borderBottom: i < webhooks.length - 1 ? `1px solid #F6F4F0` : 'none' }}>
                        <div>
                            <div style={{ fontSize: 11.5, fontFamily: 'monospace', color: COLORS.dark }}>{w.url}</div>
                            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{w.event}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Badge type={w.status === 'Active' ? 'green' : 'amber'}>{w.status}</Badge>
                            <button onClick={() => {
                                const newUrl = window.prompt("Edit Webhook URL:", w.url);
                                if (newUrl) {
                                    setWebhooks(prev => prev.map((item, idx) => idx === i ? { ...item, url: newUrl } : item));
                                    toast.success("Webhook updated. Save changes to persist.");
                                }
                            }} style={{ padding: '4px 10px', background: COLORS.sand, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 11, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                        </div>
                    </div>
                ))}
                <div style={{ padding: '14px 22px' }}>
                    <BtnOutline onClick={handleAddWebhook}>+ Add Webhook</BtnOutline>
                </div>
            </SectionCard>

            {/* Connected Apps */}
            <SectionCard>
                <SectionHeader
                    iconBg={COLORS.blueBg} iconColor={COLORS.blue} title="Connected Apps" sub="Third-party integrations"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
                />
                {apps.map((app, i) => (
                    <div key={app.name} className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', borderBottom: i < apps.length - 1 ? `1px solid #F6F4F0` : 'none', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: COLORS.sand, border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{app.icon}</div>
                            <div>
                                <div style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark }}>{app.name}</div>
                                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{app.desc}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {app.connected && <Badge type="green">Connected</Badge>}
                            <button onClick={() => handleToggleApp(i)} style={{
                                padding: '6px 12px',
                                background: app.connected ? COLORS.sand : COLORS.dark,
                                border: `1px solid ${app.connected ? COLORS.border : COLORS.dark}`,
                                borderRadius: 9, fontSize: 11.5, fontWeight: 500,
                                color: app.connected ? COLORS.textSub : '#fff',
                                cursor: 'pointer', fontFamily: 'inherit',
                            }}>{app.connected ? 'Disconnect' : 'Connect'}</button>
                        </div>
                    </div>
                ))}
            </SectionCard>
        </>
    );
}

// ─── SKELETON LOADER ───────────────────────────────────────────────────────
function SettingsSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease both' }}>
            {/* Card 1 */}
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: `1px solid #F0ECE6`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="shimmer" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                        <div className="shimmer" style={{ width: '150px', height: 14, marginBottom: 6, borderRadius: 4 }} />
                        <div className="shimmer" style={{ width: '220px', height: 11, borderRadius: 3 }} />
                    </div>
                </div>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="setting-form-grid">
                        <div>
                            <div className="shimmer" style={{ width: '80px', height: 12, marginBottom: 8, borderRadius: 3 }} />
                            <div className="shimmer" style={{ width: '100%', height: 38, borderRadius: 9 }} />
                        </div>
                        <div>
                            <div className="shimmer" style={{ width: '80px', height: 12, marginBottom: 8, borderRadius: 3 }} />
                            <div className="shimmer" style={{ width: '100%', height: 38, borderRadius: 9 }} />
                        </div>
                    </div>
                    <div className="setting-form-grid">
                        <div>
                            <div className="shimmer" style={{ width: '100px', height: 12, marginBottom: 8, borderRadius: 3 }} />
                            <div className="shimmer" style={{ width: '100%', height: 38, borderRadius: 9 }} />
                        </div>
                        <div>
                            <div className="shimmer" style={{ width: '100px', height: 12, marginBottom: 8, borderRadius: 3 }} />
                            <div className="shimmer" style={{ width: '100%', height: 38, borderRadius: 9 }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2 */}
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: `1px solid #F0ECE6`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="shimmer" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                        <div className="shimmer" style={{ width: '130px', height: 14, marginBottom: 6, borderRadius: 4 }} />
                        <div className="shimmer" style={{ width: '180px', height: 11, borderRadius: 3 }} />
                    </div>
                </div>
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="setting-form-grid">
                        <div>
                            <div className="shimmer" style={{ width: '70px', height: 12, marginBottom: 8, borderRadius: 3 }} />
                            <div className="shimmer" style={{ width: '100%', height: 38, borderRadius: 9 }} />
                        </div>
                        <div>
                            <div className="shimmer" style={{ width: '70px', height: 12, marginBottom: 8, borderRadius: 3 }} />
                            <div className="shimmer" style={{ width: '100%', height: 38, borderRadius: 9 }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── ROOT COMPONENT ────────────────────────────────────────────────────────
export default function Settings() {
    const [activeTab, setActiveTab] = useState<TabId>('general');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tab = query.get('tab') as TabId;
        if (tab && ['general', 'profile', 'notifications', 'security', 'billing', 'api'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const tabs: { id: TabId; label: string }[] = [
        { id: 'general', label: 'General' },
        { id: 'profile', label: 'Profile' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'security', label: 'Security' },
        { id: 'billing', label: 'Billing' },
        { id: 'api', label: 'API & Integrations' },
    ];

    const handleSave = () => {
        window.dispatchEvent(new CustomEvent('arova-settings-save', { detail: { tab: activeTab } }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Outfit', sans-serif", padding: '32px 24px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                *{box-sizing:border-box;margin:0;padding:0;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                .arova-inp:focus{border-color:${COLORS.green} !important;box-shadow:0 0 0 3px rgba(42,99,68,0.08);}
                .arova-inp::placeholder{color:#B8B4AD;}
                .setting-row:hover{background:#FAFAF8 !important;}
                .chip:hover{border-color:${COLORS.green} !important;}
                .btn-dark:hover{background:#2A2A2A !important;transform:translateY(-1px);}
                .btn-outline:hover{border-color:${COLORS.green} !important;color:${COLORS.green} !important;background:${COLORS.greenBg} !important;}
                .btn-danger:hover{background:#FFCDD2 !important;}
                
                .setting-form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
                @media (min-width: 640px) { .setting-form-grid { grid-template-columns: 1fr 1fr; } }
                
                .danger-zone-row { display: flex; flex-direction: column; gap: 12px; align-items: stretch; }
                @media (min-width: 640px) { .danger-zone-row { flex-direction: row; justify-content: space-between; align-items: center; gap: 16px; } }
                
                .billing-plan-comparison-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
                @media (min-width: 768px) { .billing-plan-comparison-grid { grid-template-columns: 1fr 1fr; } }
                @media (min-width: 1024px) { .billing-plan-comparison-grid { grid-template-columns: 1fr 1fr 1fr; } }
                
                .billing-stats-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }
                @media (min-width: 640px) { .billing-stats-grid { grid-template-columns: repeat(3, 1fr); } }
            `}</style>

            {/* Toast */}
            {saved && (
                <div style={{
                    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    background: COLORS.dark, color: '#fff', padding: '10px 20px',
                    borderRadius: 10, fontSize: 12.5, fontWeight: 500, zIndex: 999,
                    animation: 'fadeUp 0.3s ease',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.greenLight} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Settings saved successfully
                </div>
            )}

            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.4s ease both' }}>
                    <div>
                        <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Admin / Settings</div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: COLORS.dark, letterSpacing: '-0.02em' }}>Settings</h1>
                        <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>Manage your store preferences and account</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <BtnOutline>Discard changes</BtnOutline>
                        <BtnDark onClick={handleSave}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            Save changes
                        </BtnDark>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', animation: 'fadeUp 0.4s ease both 0.04s' }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className="chip" style={{
                            padding: '5px 14px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
                            border: `1.5px solid ${activeTab === t.id ? COLORS.green : COLORS.border}`,
                            background: activeTab === t.id ? COLORS.greenBg : COLORS.white,
                            color: activeTab === t.id ? COLORS.green : COLORS.textMuted,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        }}>{t.label}</button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ animation: 'fadeUp 0.35s ease both' }}>
                    {loading ? (
                        <SettingsSkeleton />
                    ) : (
                        <>
                            {activeTab === 'general' && <GeneralTab />}
                            {activeTab === 'profile' && <ProfileTab />}
                            {activeTab === 'notifications' && <NotificationsTab />}
                            {activeTab === 'security' && <SecurityTab />}
                            {activeTab === 'billing' && <BillingTab />}
                            {activeTab === 'api' && <ApiTab />}
                        </>
                    )}
                </div>

                <div style={{ height: 32 }} />
            </div>
        </div>
    );
}
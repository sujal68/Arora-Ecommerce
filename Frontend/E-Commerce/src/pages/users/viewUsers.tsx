import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser, toggleUserActive, updateUser } from '../../services/auth/authService';
import { useConfirm, useToast } from '../../context/UIContext';

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

type Tier = 'Standard' | 'Silver' | 'Gold' | 'Platinum';
type Status = 'Active' | 'Inactive';

const TIER_CONFIG: Record<Tier, { color: string; bg: string; icon: React.ReactNode }> = {
    Standard: { color: C.textSub, bg: C.sand, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg> },
    Silver: { color: '#4B5563', bg: '#F3F4F6', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
    Gold: { color: '#B45309', bg: '#FFFBEB', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> },
    Platinum: { color: C.purple, bg: C.purpleBg, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3L8 9l4 13 4-13-3-6" /><path d="M2 9h20" /></svg> },
};

const STATUS_CONFIG: Record<Status, { color: string; bg: string; dot: string }> = {
    Active: { color: C.green, bg: C.greenBg, dot: C.green },
    Inactive: { color: C.textMuted, bg: '#F0ECE8', dot: '#B0ACA4' }
};

const AVATAR_COLORS = [
    { bg: '#EAF4EE', color: '#2A6344' }, { bg: '#E8F0FE', color: '#1A56DB' },
    { bg: '#FEF3E2', color: '#A05A10' }, { bg: '#F3E8FF', color: '#7C3AED' },
    { bg: '#FFEBEE', color: '#C62828' }, { bg: '#E0F7FA', color: '#00838F' },
    { bg: '#FFF3E0', color: '#E65100' }, { bg: '#F3F4F6', color: '#374151' },
];

type User = {
    _id: string;
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    tier: Tier;
    status: Status;
    joinedAt: string;
    lastOrder: string;
    totalOrders: number;
    totalSpent: string;
    city: string;
    firstName?: string;
    lastName?: string;
};

function UserDrawer({ user, onClose, onUpdate }: { user: User; onClose: () => void; onUpdate: () => void }) {
    const tc = TIER_CONFIG[user.tier];
    const sc = STATUS_CONFIG[user.status];
    const ac = AVATAR_COLORS[parseInt(user._id.slice(-4), 16) % AVATAR_COLORS.length] || AVATAR_COLORS[0];
    
    const toast = useToast();
    const confirm = useConfirm();
    const [isProcessing, setIsProcessing] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editFirstName, setEditFirstName] = useState(user.firstName || '');
    const [editLastName, setEditLastName] = useState(user.lastName || '');
    const [editEmail, setEditEmail] = useState(user.email || '');
    const [editPhone, setEditPhone] = useState(user.phone || '');
    const [editAddress, setEditAddress] = useState(user.city || '');

    useEffect(() => {
        setEditFirstName(user.firstName || '');
        setEditLastName(user.lastName || '');
        setEditEmail(user.email || '');
        setEditPhone(user.phone || '');
        setEditAddress(user.city || '');
    }, [user, isEditing]);

    const handleSaveEdit = async () => {
        if (!user._id) return;
        if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
            toast.error("First name, last name, and email are required.");
            return;
        }
        setIsProcessing(true);
        try {
            const data = await updateUser(user._id, {
                first_name: editFirstName.trim(),
                last_name: editLastName.trim(),
                email: editEmail.trim(),
                phone: editPhone.trim(),
                address: editAddress.trim(),
            });
            const msg = data?.massage || data?.message || 'User updated successfully.';
            if (data?.status === 200) {
                toast.success(msg);
                setIsEditing(false);
                onUpdate();
                onClose();
            } else {
                toast.error(msg);
            }
        } catch (error) {
            toast.error("Failed to update user.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggleStatus = async () => {
        setIsProcessing(true);
        try {
            const res = await toggleUserActive(user._id);
            if (res && res.status === 200) {
                toast.success(res.massage || "User status updated.");
                onUpdate();
                onClose();
            } else {
                toast.error(res?.massage || "Failed to update user status.");
            }
        } catch (error) {
            toast.error("Failed to update user status.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteUser = async () => {
        const ok = await confirm({
            title: "Delete User",
            message: "Are you sure you want to permanently delete this user account? This action may not be reversible.",
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            isDanger: true
        });
        if (!ok) return;
        setIsProcessing(true);
        try {
            const res = await deleteUser(user._id);
            if (res && res.status === 200) {
                toast.success(res.massage || "User deleted.");
                onUpdate();
                onClose();
            } else {
                toast.error(res?.massage || "Failed to delete user.");
            }
        } catch (error) {
            toast.error("Failed to delete user.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
            <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease' }} />
            <div style={{ width: 390, background: C.white, height: '100%', overflowY: 'auto', boxShadow: '-12px 0 48px rgba(0,0,0,0.1)', animation: 'slideRight 0.28s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>User Profile</div>
                    <button onClick={onClose} disabled={isProcessing} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div style={{ padding: 24, flex: 1 }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#C4C0B8', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>Edit Details</div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em' }}>FIRST NAME</label>
                                <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} style={{ width: '100%', padding: '9px 13px', background: C.white, border: `1.5px solid ${C.borderInput}`, borderRadius: 9, fontSize: 12.5, color: C.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em' }}>LAST NAME</label>
                                <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)} style={{ width: '100%', padding: '9px 13px', background: C.white, border: `1.5px solid ${C.borderInput}`, borderRadius: 9, fontSize: 12.5, color: C.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em' }}>EMAIL ADDRESS</label>
                                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ width: '100%', padding: '9px 13px', background: C.white, border: `1.5px solid ${C.borderInput}`, borderRadius: 9, fontSize: 12.5, color: C.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em' }}>PHONE NUMBER</label>
                                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ width: '100%', padding: '9px 13px', background: C.white, border: `1.5px solid ${C.borderInput}`, borderRadius: 9, fontSize: 12.5, color: C.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub, letterSpacing: '0.04em' }}>ADDRESS</label>
                                <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} style={{ width: '100%', padding: '9px 13px', background: C.white, border: `1.5px solid ${C.borderInput}`, borderRadius: 9, fontSize: 12.5, color: C.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button onClick={handleSaveEdit} disabled={isProcessing} style={{ flex: 1, padding: '10px', background: C.green, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: isProcessing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    {isProcessing ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '10px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: C.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Avatar card */}
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20, textAlign: 'center' }}>
                                <div style={{ width: 60, height: 60, borderRadius: '50%', background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: ac.color, margin: '0 auto 12px' }}>{user.avatar}</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 3 }}>{user.name}</div>
                                <div style={{ fontSize: 11.5, color: C.textMuted, marginBottom: 10 }}>{user.email}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: tc.bg, borderRadius: 20, fontSize: 11, fontWeight: 600, color: tc.color }}>
                                        {tc.icon} {user.tier}
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: sc.bg, borderRadius: 20, fontSize: 11, fontWeight: 600, color: sc.color }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot }} />{user.status}
                                    </span>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                                {[
                                    { label: 'Orders', val: user.totalOrders.toString() },
                                    { label: 'Total Spent', val: user.totalSpent },
                                    { label: 'City', val: user.city },
                                ].map(s => (
                                    <div key={s.label} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, letterSpacing: '-0.02em' }}>{s.val}</div>
                                        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Account Info */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#C4C0B8', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>Account Info</div>
                                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
                                    {[
                                        { label: 'User ID', value: user.id, mono: true },
                                        { label: 'Phone', value: user.phone, mono: false },
                                        { label: 'Joined', value: user.joinedAt, mono: false },
                                        { label: 'Last Order', value: user.lastOrder, mono: false },
                                    ].map((row, i, arr) => (
                                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                                            <span style={{ fontSize: 11.5, color: C.textMuted }}>{row.label}</span>
                                            <span style={{ fontSize: 12, fontWeight: 500, color: C.dark, fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <button onClick={() => setIsEditing(true)} style={{ width: '100%', padding: '10px', background: C.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> Edit User
                                </button>
                                <button onClick={handleToggleStatus} disabled={isProcessing} style={{ width: '100%', padding: '10px', background: user.status === 'Active' ? C.amberBg : C.greenBg, border: `1px solid ${user.status === 'Active' ? '#F5D99A' : C.greenBorder}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: user.status === 'Active' ? C.amber : C.green, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                    {user.status === 'Active'
                                        ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> Deactivate Account</>
                                        : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg> Activate Account</>}
                                </button>
                                <button onClick={handleDeleteUser} disabled={isProcessing} style={{ width: '100%', padding: '10px', background: C.white, border: `1px solid #F5C6C6`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: C.red, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                                    Delete User Account
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ViewUsers() {
    const toast = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState<Tier | 'All'>('All');
    const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'tier' | 'orders' | 'spent'>('orders');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await fetchUsers();
            if (data?.status === 200 && Array.isArray(data.result)) {
                const mapped: User[] = data.result.map((u: any) => ({
                    _id: u._id,
                    id: u._id?.slice(-5).toUpperCase() || 'U0000',
                    name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'No Name',
                    email: u.email || '',
                    phone: u.phone || '',
                    avatar: ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || 'U',
                    tier: 'Standard',
                    status: u.isActive ? 'Active' : 'Inactive',
                    joinedAt: u.createAt ? u.createAt.split(' ')[0] : 'N/A',
                    lastOrder: 'N/A',
                    totalOrders: 0,
                    totalSpent: '₹0',
                    city: u.address || 'N/A',
                    firstName: u.first_name || '',
                    lastName: u.last_name || '',
                }));
                setUsers(mapped);
            }
        } catch (error) {
            toast.error("Failed to fetch users.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filtered = users.filter(u => {
        const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
        const mt = tierFilter === 'All' || u.tier === tierFilter;
        const mst = statusFilter === 'All' || u.status === statusFilter;
        return ms && mt && mst;
    }).sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'tier') return ['Standard', 'Silver', 'Gold', 'Platinum'].indexOf(b.tier) - ['Standard', 'Silver', 'Gold', 'Platinum'].indexOf(a.tier);
        if (sortBy === 'orders') return b.totalOrders - a.totalOrders;
        return 0;
    });

    const totalSpentSum = users.reduce((s, u) => s + parseInt(u.totalSpent.replace(/[^0-9]/g, '') || '0'), 0);
    const fmtCrore = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${n.toLocaleString('en-IN')}`;

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", padding: '32px 24px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                *{box-sizing:border-box;margin:0;padding:0;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                @keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
                .table-row{transition:background 0.14s;}
                .table-row:hover{background:#F8F6F2 !important;}
                .filter-chip{transition:all 0.16s;cursor:pointer;}
                .filter-chip:hover{border-color:${C.green} !important;}
                .search-box{background:${C.white};border:1.5px solid ${C.borderInput};border-radius:9px;padding:8px 14px 8px 36px;font-family:'Outfit',sans-serif;font-size:12.5px;color:${C.dark};outline:none;transition:all 0.2s;caret-color:${C.green};}
                .search-box::placeholder{color:#B8B4AD;}
                .search-box:focus{border-color:${C.green};box-shadow:0 0 0 3px rgba(42,99,68,0.08);}
                .user-card{transition:all 0.2s;cursor:pointer;}
                .user-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.08) !important;}
                .expand-btn svg{transition:transform 0.25s cubic-bezier(0.4,0,0.2,1);}
                .expand-row{display:grid;transition:grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1);}
                .expand-row-inner{overflow:hidden;}
                .scroll-area::-webkit-scrollbar{width:4px;height:4px;}
                .scroll-area::-webkit-scrollbar-track{background:transparent;}
                .scroll-area::-webkit-scrollbar-thumb{background:#E0DDD6;border-radius:4px;}
                
                .user-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
                @media (min-width: 1024px) { .user-stats-grid { grid-template-columns: repeat(4, 1fr); } }
            `}</style>

            {selectedUser && <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} onUpdate={loadUsers} />}

            <div style={{ margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.4s ease both' }}>
                    <div>
                        <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Users / All</div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: C.dark, letterSpacing: '-0.02em' }}>User Accounts</h1>
                        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
                            {users.filter(u => u.status === 'Active').length} active · {fmtCrore(totalSpentSum)} total revenue · {users.length} customers
                        </p>
                    </div>
                    <button onClick={() => window.location.href = '/dashboard/add-user'} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 36, background: C.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#2A2A2A'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.dark; e.currentTarget.style.transform = ''; }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add User
                    </button>
                </div>

                {/* Stat strips */}
                <div className="user-stats-grid" style={{ animation: 'fadeUp 0.4s ease both 0.06s' }}>
                    {[
                        { label: 'Total Users', val: users.length, color: C.dark, bg: C.white },
                        { label: 'Active', val: users.filter(u => u.status === 'Active').length, color: C.green, bg: C.greenBg },
                        { label: 'Total Revenue', val: fmtCrore(totalSpentSum), color: C.blue, bg: C.blueBg },
                        { label: 'Platinum', val: users.filter(u => u.tier === 'Platinum').length, color: C.purple, bg: C.purpleBg },
                    ].map(s => (
                        <div key={s.label} style={{ background: s.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', animation: 'fadeUp 0.4s ease both 0.1s' }}>
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8B4AD" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input className="search-box" style={{ width: '100%' }} type="text" placeholder="Search by name, email or ID…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {/* Tier filters */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(['All', 'Standard', 'Silver', 'Gold', 'Platinum'] as const).map(t => {
                            const tc = t !== 'All' ? TIER_CONFIG[t] : null;
                            return (
                                <button key={t} className="filter-chip" onClick={() => setTierFilter(t)}
                                    style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1.5px solid ${tierFilter === t ? (tc?.color || C.green) : C.border}`, background: tierFilter === t ? (tc?.bg || C.greenBg) : C.white, color: tierFilter === t ? (tc?.color || C.green) : C.textMuted, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    {t !== 'All' && <span style={{ color: tierFilter === t ? tc?.color : C.textMuted }}>{tc?.icon}</span>}
                                    {t}
                                </button>
                            );
                        })}
                    </div>

                    {/* Status filters */}
                    <div style={{ display: 'flex', gap: 6 }}>
                        {(['All', 'Active', 'Inactive'] as const).map(s => {
                            const sc = s !== 'All' ? STATUS_CONFIG[s] : null;
                            return (
                                <button key={s} className="filter-chip" onClick={() => setStatusFilter(s)}
                                    style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1.5px solid ${statusFilter === s ? (sc?.dot || C.green) : C.border}`, background: statusFilter === s ? (sc?.bg || C.greenBg) : C.white, color: statusFilter === s ? (sc?.color || C.green) : C.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    {s}
                                </button>
                            );
                        })}
                    </div>

                    {/* View toggle */}
                    <div style={{ display: 'flex', background: C.sand, borderRadius: 8, padding: 2, gap: 2, marginLeft: 'auto' }}>
                        {(['table', 'grid'] as const).map(m => (
                            <button key={m} onClick={() => setViewMode(m)} style={{ width: 30, height: 28, borderRadius: 6, border: 'none', background: viewMode === m ? C.white : 'transparent', color: viewMode === m ? C.dark : C.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', boxShadow: viewMode === m ? '0 1px 4px rgba(0,0,0,0.07)' : 'none' }}>
                                {m === 'table'
                                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="9" x2="9" y2="21" /></svg>
                                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>}
                             </button>
                        ))}
                    </div>
                </div>

                {/* Results note */}
                {(search || tierFilter !== 'All' || statusFilter !== 'All') && (
                    <div style={{ fontSize: 11.5, color: C.textMuted, marginBottom: 10, animation: 'fadeIn 0.2s ease' }}>
                        Showing {filtered.length} of {users.length} users
                        <button onClick={() => { setSearch(''); setTierFilter('All'); setStatusFilter('All'); }} style={{ marginLeft: 8, fontSize: 11, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Clear filters</button>
                    </div>
                )}

                {/* TABLE VIEW */}
                {viewMode === 'table' ? (
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 0.4s ease both 0.14s' }}>
                        <div className="scroll-area" style={{ overflowX: 'auto' }}>
                            <div style={{ minWidth: 850 }}>
                                {/* Table head */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr 0.8fr 0.8fr 0.4fr', padding: '10px 20px', background: '#FAFAF8', borderBottom: `1px solid #F0ECE6` }}>
                                    {[
                                        { label: 'Customer', key: 'name' as const },
                                        { label: 'Tier', key: 'tier' as const },
                                        { label: 'Status', key: null },
                                        { label: 'Orders', key: 'orders' as const },
                                        { label: 'Spent', key: 'spent' as const },
                                        { label: 'Last Order', key: null },
                                        { label: '', key: null },
                                    ].map(h => (
                                        <div key={h.label} onClick={() => h.key && setSortBy(h.key)} style={{ fontSize: 9.5, fontWeight: 600, color: h.key && sortBy === h.key ? C.green : C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: h.key ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            {h.label}
                                            {h.key && sortBy === h.key && <span style={{ fontSize: 8, color: C.green }}>▲</span>}
                                        </div>
                                    ))}
                                </div>

                        {/* Rows */}
                        {isLoading ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, color: C.textMuted }}>Loading users...</div>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sand, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 4 }}>No users found</div>
                                    <div style={{ fontSize: 12, color: C.textMuted }}>Try adjusting your filters</div>
                                </div>
                            ) : filtered.map((u, i) => {
                                const tc = TIER_CONFIG[u.tier];
                                const sc = STATUS_CONFIG[u.status];
                                const ac = AVATAR_COLORS[parseInt(u._id.slice(-4), 16) % AVATAR_COLORS.length] || AVATAR_COLORS[0];
                                const isExpanded = expandedId === u._id;
                                const isLast = i === filtered.length - 1;
                                return (
                                    <React.Fragment key={u._id}>
                                        <div className="table-row" onClick={() => setSelectedUser(u)}
                                            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr 0.8fr 0.8fr 0.4fr', padding: '12px 20px', borderBottom: (isLast && !isExpanded) ? 'none' : `1px solid #F6F4F0`, alignItems: 'center', background: hoveredRow === u._id ? '#F8F6F2' : C.white, cursor: 'pointer' }}
                                            onMouseEnter={() => setHoveredRow(u._id)} onMouseLeave={() => setHoveredRow(null)}>
                                            {/* Customer */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, color: ac.color, flexShrink: 0 }}>{u.avatar}</div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{u.name}</div>
                                                    <div style={{ fontSize: 11, color: C.textMuted }}>{u.id} · {u.city}</div>
                                                </div>
                                            </div>
                                                {/* Tier */}
                                                <div>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: tc.bg, fontSize: 10.5, fontWeight: 600, color: tc.color }}>
                                                        {tc.icon} {u.tier}
                                                    </span>
                                                </div>
                                                {/* Status */}
                                                <div>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: sc.bg, fontSize: 10.5, fontWeight: 500, color: sc.color }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot }} />{u.status}
                                                    </span>
                                                </div>
                                                {/* Orders */}
                                                <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{u.totalOrders}</div>
                                                {/* Spent */}
                                                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.green }}>{u.totalSpent}</div>
                                                {/* Last Order */}
                                                <div style={{ fontSize: 11.5, color: C.textSub }}>{u.lastOrder}</div>
                                                {/* Expand */}
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <button className="expand-btn" onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : u._id); }}
                                                        style={{ width: 26, height: 26, borderRadius: 7, border: `1.5px solid ${isExpanded ? C.green : C.border}`, background: isExpanded ? C.greenBg : C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExpanded ? C.green : C.textMuted, cursor: 'pointer', transition: 'all 0.18s' }}>
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}><polyline points="9 18 15 12 9 6" /></svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expand panel */}
                                            <div className="expand-row" style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr', background: '#F8F6F2', borderBottom: isLast ? 'none' : `1px solid #F6F4F0` }}>
                                                <div className="expand-row-inner">
                                                    <div style={{ padding: '4px 20px 20px 64px', display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                        {[
                                                            { label: 'Email', value: u.email },
                                                            { label: 'Phone', value: u.phone },
                                                            { label: 'Joined', value: u.joinedAt },
                                                        ].map(row => (
                                                            <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#B8B4AD', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</span>
                                                                <span style={{ fontSize: 12.5, fontWeight: 500, color: C.dark }}>{row.value}</span>
                                                            </div>
                                                        ))}
                                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignSelf: 'center' }}>
                                                            <button onClick={e => { e.stopPropagation(); setSelectedUser(u); }} style={{ padding: '6px 14px', background: C.dark, border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>View profile</button>
                                                            <button onClick={e => { e.stopPropagation(); setExpandedId(null); }} style={{ padding: '6px 14px', background: 'transparent', border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 500, color: C.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* GRID VIEW */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, animation: 'fadeUp 0.4s ease both 0.14s' }}>
                        {filtered.map((u) => {
                            const tc = TIER_CONFIG[u.tier];
                            const sc = STATUS_CONFIG[u.status];
                            const ac = AVATAR_COLORS[parseInt(u._id.slice(-4), 16) % AVATAR_COLORS.length] || AVATAR_COLORS[0];
                            return (
                                <div key={u._id} className="user-card" onClick={() => setSelectedUser(u)}
                                    style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div style={{ width: 46, height: 46, borderRadius: '50%', background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: ac.color }}>{u.avatar}</div>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: sc.bg, fontSize: 10, fontWeight: 600, color: sc.color }}>
                                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: sc.dot }} />{u.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 2 }}>{u.name}</div>
                                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: tc.bg, fontSize: 10.5, fontWeight: 600, color: tc.color }}>
                                            {tc.icon} {u.tier}
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{u.totalOrders}</div>
                                            <div style={{ fontSize: 10, color: C.textMuted }}>orders</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{u.totalSpent}</div>
                                            <div style={{ fontSize: 10, color: C.textMuted }}>spent</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: C.textMuted }}>
                    <span>Showing {filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${C.green}`, background: C.greenBg, fontSize: 11.5, fontWeight: 600, color: C.green, cursor: 'pointer', fontFamily: 'inherit' }}>1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
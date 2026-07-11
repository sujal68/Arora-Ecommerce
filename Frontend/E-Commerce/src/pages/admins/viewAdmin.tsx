import React, { useState, useEffect } from 'react';
import { fetchAdmins, deleteAdmin, toggleAdminActive, updateAdmin } from '../../services/auth/authService';
import { useConfirm, useToast } from '../../context/UIContext';

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
    amber: '#A05A10',
    amberBg: '#FEF3E2',
    blue: '#1A56DB',
    blueBg: '#E8F0FE',
};

type Role = 'Super Admin' | 'Product Manager' | 'Order Manager' | 'Support Admin';
type Status = 'Active' | 'Inactive' | 'Pending';

type Admin = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    status: Status;
    joinedAt: string;
    lastActive: string;
    permissions: number;
    avatar: string;
    _id?: string;
    firstName?: string;
    lastName?: string;
};

const ROLE_ICONS: Record<Role, (c: string) => React.ReactNode> = {
    'Super Admin': (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    'Product Manager': (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    'Order Manager': (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    'Support Admin': (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
};
const ROLE_CONFIG: Record<Role, { color: string; bg: string }> = {
    'Super Admin': { color: '#7C3AED', bg: '#F3E8FF' },
    'Product Manager': { color: COLORS.green, bg: COLORS.greenBg },
    'Order Manager': { color: COLORS.blue, bg: COLORS.blueBg },
    'Support Admin': { color: COLORS.amber, bg: COLORS.amberBg },
};

const STATUS_CONFIG: Record<Status, { color: string; bg: string; dot: string }> = {
    Active: { color: COLORS.green, bg: COLORS.greenBg, dot: COLORS.green },
    Inactive: { color: COLORS.textMuted, bg: '#F0ECE8', dot: '#B0ACA4' },
    Pending: { color: COLORS.amber, bg: COLORS.amberBg, dot: '#F59E0B' },
};

const AVATAR_COLORS = [
    { bg: '#EAF4EE', color: '#2A6344' }, { bg: '#E8F0FE', color: '#1A56DB' },
    { bg: '#FEF3E2', color: '#A05A10' }, { bg: '#F3E8FF', color: '#7C3AED' },
    { bg: '#FFEBEE', color: '#C62828' }, { bg: '#E0F7FA', color: '#00838F' },
];

const SAMPLE_ADMINS: Admin[] = [
    { id: 'A001', name: 'Rohan Mehta', email: 'rohan@arova.com', phone: '+91 98765 43210', role: 'Super Admin', status: 'Active', joinedAt: 'Jan 12, 2024', lastActive: '2m ago', permissions: 8, avatar: 'RM' },
    { id: 'A002', name: 'Priya Kapoor', email: 'priya@arova.com', phone: '+91 87654 32109', role: 'Product Manager', status: 'Active', joinedAt: 'Mar 3, 2024', lastActive: '1h ago', permissions: 3, avatar: 'PK' },
    { id: 'A003', name: 'Dev Anand', email: 'dev@arova.com', phone: '+91 76543 21098', role: 'Order Manager', status: 'Active', joinedAt: 'Apr 18, 2024', lastActive: '3h ago', permissions: 3, avatar: 'DA' },
    { id: 'A004', name: 'Sana Sheikh', email: 'sana@arova.com', phone: '+91 65432 10987', role: 'Support Admin', status: 'Inactive', joinedAt: 'Feb 7, 2024', lastActive: '5d ago', permissions: 3, avatar: 'SS' },
    { id: 'A005', name: 'Arjun Nair', email: 'arjun@arova.com', phone: '+91 54321 09876', role: 'Product Manager', status: 'Pending', joinedAt: 'Jun 15, 2024', lastActive: 'Never', permissions: 3, avatar: 'AN' },
    { id: 'A006', name: 'Meera Pillai', email: 'meera@arova.com', phone: '+91 43210 98765', role: 'Order Manager', status: 'Active', joinedAt: 'May 22, 2024', lastActive: '30m ago', permissions: 4, avatar: 'MP' },
];

function AdminDrawer({ admin, onClose, onRefresh }: { admin: Admin; onClose: () => void; onRefresh: () => void }) {
    const rc = ROLE_CONFIG[admin.role];
    const sc = STATUS_CONFIG[admin.status];
    const ac = AVATAR_COLORS[parseInt(admin.id.replace('A', '')) % AVATAR_COLORS.length];
    
    const toast = useToast();
    const confirm = useConfirm();
    const [actionLoading, setActionLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editFirstName, setEditFirstName] = useState(admin.firstName || '');
    const [editLastName, setEditLastName] = useState(admin.lastName || '');
    const [editEmail, setEditEmail] = useState(admin.email || '');
    const [editPhone, setEditPhone] = useState(admin.phone || '');

    useEffect(() => {
        setEditFirstName(admin.firstName || '');
        setEditLastName(admin.lastName || '');
        setEditEmail(admin.email || '');
        setEditPhone(admin.phone || '');
    }, [admin, isEditing]);

    const handleSaveEdit = async () => {
        if (!admin._id) return;
        if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
            toast.error("First name, last name, and email are required.");
            return;
        }
        setActionLoading(true);
        try {
            const data = await updateAdmin(admin._id, {
                first_name: editFirstName.trim(),
                last_name: editLastName.trim(),
                email: editEmail.trim(),
                phone: editPhone.trim(),
            });
            const msg = data?.massage || data?.message || 'Admin updated successfully.';
            if (data?.status === 200) {
                toast.success(msg);
                setIsEditing(false);
                onRefresh();
                onClose();
            } else {
                toast.error(msg);
            }
        } catch (error) {
            toast.error("Failed to update admin.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!admin._id) return;
        const ok = await confirm({
            title: "Remove Admin",
            message: "Are you sure you want to permanently remove this admin account? This action cannot be undone.",
            confirmText: "Yes, Remove",
            cancelText: "Cancel",
            isDanger: true
        });
        if (!ok) return;
        setActionLoading(true);
        const data = await deleteAdmin(admin._id);
        const msg = data?.massage || data?.message || 'Something went wrong.';
        if (data?.status === 200) {
            toast.success(msg);
            onClose();
            onRefresh();
        } else {
            toast.error(msg);
        }
        setActionLoading(false);
    };

    const handleToggle = async () => {
        if (!admin._id) return;
        setActionLoading(true);
        const data = await toggleAdminActive(admin._id);
        const msg = data?.massage || data?.message || 'Something went wrong.';
        if (data?.status === 200) {
            toast.success(msg);
            onClose();
            onRefresh();
        } else {
            toast.error(msg);
        }
        setActionLoading(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
            <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease' }} />
            <div style={{
                width: 380, background: COLORS.white, height: '100%', overflowY: 'auto',
                boxShadow: '-12px 0 48px rgba(0,0,0,0.1)',
                animation: 'slideRight 0.28s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Drawer header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark }}>Admin Details</div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${COLORS.border}`, background: COLORS.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div style={{ padding: 24, flex: 1 }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#C4C0B8', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>Edit Details</div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em' }}>FIRST NAME</label>
                                <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} style={{ width: '100%', padding: '9px 13px', background: COLORS.white, border: `1.5px solid ${COLORS.borderInput}`, borderRadius: 9, fontSize: 12.5, color: COLORS.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em' }}>LAST NAME</label>
                                <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)} style={{ width: '100%', padding: '9px 13px', background: COLORS.white, border: `1.5px solid ${COLORS.borderInput}`, borderRadius: 9, fontSize: 12.5, color: COLORS.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em' }}>EMAIL ADDRESS</label>
                                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ width: '100%', padding: '9px 13px', background: COLORS.white, border: `1.5px solid ${COLORS.borderInput}`, borderRadius: 9, fontSize: 12.5, color: COLORS.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em' }}>PHONE NUMBER</label>
                                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ width: '100%', padding: '9px 13px', background: COLORS.white, border: `1.5px solid ${COLORS.borderInput}`, borderRadius: 9, fontSize: 12.5, color: COLORS.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button onClick={handleSaveEdit} disabled={actionLoading} style={{ flex: 1, padding: '10px', background: COLORS.green, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    {actionLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '10px', background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Profile */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: 16, background: COLORS.bg, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: ac.color, flexShrink: 0 }}>{admin.avatar}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>{admin.name}</div>
                                    <div style={{ fontSize: 11.5, color: COLORS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.email}</div>
                                </div>
                                <div style={{ padding: '4px 10px', background: sc.bg, borderRadius: 20, fontSize: 10.5, color: sc.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot }} />{admin.status}
                                </div>
                            </div>

                            {/* Role */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#C4C0B8', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>Role</div>
                                <div style={{ padding: '10px 14px', background: rc.bg, border: `1px solid ${rc.color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${rc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ROLE_ICONS[admin.role](rc.color)}</div>
                                    <div>
                                        <div style={{ fontSize: 12.5, fontWeight: 600, color: rc.color }}>{admin.role}</div>
                                        <div style={{ fontSize: 10.5, color: COLORS.textMuted }}>{admin.permissions} permissions granted</div>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#C4C0B8', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>Account Info</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: COLORS.bg, borderRadius: 10, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
                                    {[
                                        { label: 'Admin ID', value: admin.id },
                                        { label: 'Phone', value: admin.phone },
                                        { label: 'Joined', value: admin.joinedAt },
                                        { label: 'Last active', value: admin.lastActive },
                                    ].map((row, i, arr) => (
                                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                                            <span style={{ fontSize: 11.5, color: COLORS.textMuted }}>{row.label}</span>
                                            <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.dark, fontFamily: row.label === 'Admin ID' ? 'monospace' : 'inherit' }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <button onClick={() => setIsEditing(true)} style={{ width: '100%', padding: '10px', background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> Edit Admin
                                </button>
                                <button onClick={handleToggle} disabled={actionLoading} style={{ width: '100%', padding: '10px', background: admin.status === 'Active' ? COLORS.amberBg : COLORS.greenBg, border: `1px solid ${admin.status === 'Active' ? '#F5D99A' : COLORS.greenBorder}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: admin.status === 'Active' ? COLORS.amber : COLORS.green, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>
                                    {admin.status === 'Active'
                                        ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> Deactivate Account</>
                                        : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg> Activate Account</>
                                    }
                                </button>
                                <button onClick={handleDelete} disabled={actionLoading} style={{ width: '100%', padding: '10px', background: COLORS.white, border: `1px solid ${COLORS.redBg}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: COLORS.red, cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg> Remove Admin
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ViewAdmins() {
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
    const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'role' | 'status' | 'joined'>('joined');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAdmins = async () => {
        setIsLoading(true);
        const data = await fetchAdmins();
        if (data?.status === 200 && Array.isArray(data.result)) {
            const mapped: Admin[] = data.result.map((a: any, i: number) => ({
                _id: a._id,
                id: a._id?.slice(-5).toUpperCase() || `A00${i + 1}`,
                name: `${a.first_name} ${a.last_name}`,
                email: a.email,
                phone: a.phone || 'N/A',
                role: 'Super Admin' as Role,
                status: a.isActive ? 'Active' : 'Inactive' as Status,
                joinedAt: a.createAt || a.create_at || 'N/A',
                lastActive: 'N/A',
                permissions: 8,
                avatar: `${a.first_name?.[0] || ''}${a.last_name?.[0] || ''}`.toUpperCase(),
                firstName: a.first_name || '',
                lastName: a.last_name || '',
            }));
            setAdmins(mapped);
        } else {
            const msg = data?.massage || data?.message || 'Failed to fetch admins.';
            toast.error(msg);
        }
        setIsLoading(false);
    };

    useEffect(() => { loadAdmins(); }, []);

    const filtered = admins.filter(a => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'All' || a.role === roleFilter;
        const matchStatus = statusFilter === 'All' || a.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    }).sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'role') return a.role.localeCompare(b.role);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
    });

    const activeCount = admins.filter(a => a.status === 'Active').length;
    const pendingCount = admins.filter(a => a.status === 'Pending').length;

    return (
        <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Outfit', sans-serif", padding: '32px 24px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                * { box-sizing:border-box; margin:0; padding:0; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes slideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                .table-row { transition: background 0.14s, box-shadow 0.14s; }
                .table-row:hover { background: #F8F6F2 !important; }
                .filter-chip { transition: all 0.16s; cursor: pointer; }
                .filter-chip:hover { border-color: ${COLORS.green} !important; }
                .icon-btn { width:34px; height:34px; border-radius:8px; border:1.5px solid ${COLORS.border}; background:${COLORS.white}; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s; color:#4A4540; }
                .icon-btn:hover { border-color:${COLORS.green}; background:${COLORS.greenBg}; color:${COLORS.green}; }
                .search-box { background:${COLORS.white}; border:1.5px solid ${COLORS.borderInput}; border-radius:9px; padding:8px 14px 8px 36px; font-family:'Outfit',sans-serif; font-size:12.5px; color:${COLORS.dark}; outline:none; transition:border-color 0.2s, box-shadow 0.2s; caret-color:${COLORS.green}; }
                .search-box::placeholder { color:#B8B4AD; }
                .search-box:focus { border-color:${COLORS.green}; box-shadow:0 0 0 3px rgba(42,99,68,0.08); }
                .admin-card { transition: all 0.2s; cursor: pointer; }
                .admin-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.08) !important; }
                .scroll-area::-webkit-scrollbar { width:4px; height:4px; }
                .scroll-area::-webkit-scrollbar-track { background:transparent; }
                .scroll-area::-webkit-scrollbar-thumb { background:#E0DDD6; border-radius:4px; }
                .expand-btn svg { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
                .expand-row { display:grid; transition: grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1); }
                .expand-row-inner { overflow:hidden; }
                .admin-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
                @media (min-width: 1024px) { .admin-stats-grid { grid-template-columns: repeat(4, 1fr); } }
            `}</style>

            {selectedAdmin && <AdminDrawer admin={selectedAdmin} onClose={() => setSelectedAdmin(null)} onRefresh={loadAdmins} />}

            <div style={{ margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.4s ease both' }}>
                    <div>
                        <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Admins / All</div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: COLORS.dark, letterSpacing: '-0.02em' }}>Admin Accounts</h1>
                        <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>{activeCount} active · {pendingCount} pending · {admins.length} total</p>
                    </div>
                    <button onClick={() => window.location.href = '/dashboard/add-admin'} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 36, background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#2A2A2A'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = COLORS.dark; e.currentTarget.style.transform = ''; }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Admin
                    </button>
                </div>

                {/* Stat strips */}
                <div className="admin-stats-grid" style={{ animation: 'fadeUp 0.4s ease both 0.06s' }}>
                    {[
                        { label: 'Total', val: admins.length, color: COLORS.dark, bg: COLORS.white },
                        { label: 'Active', val: activeCount, color: COLORS.green, bg: COLORS.greenBg },
                        { label: 'Inactive', val: admins.filter(a => a.status === 'Inactive').length, color: COLORS.textMuted, bg: '#F0ECE8' },
                        { label: 'Pending', val: pendingCount, color: COLORS.amber, bg: COLORS.amberBg },
                    ].map(s => (
                        <div key={s.label} style={{ background: s.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', animation: 'fadeUp 0.4s ease both 0.1s' }}>
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8B4AD" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input className="search-box" style={{ width: '100%' }} type="text" placeholder="Search by name, email or ID…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(['All', 'Super Admin', 'Product Manager', 'Order Manager', 'Support Admin'] as const).map(r => (
                            <button key={r} className="filter-chip" onClick={() => setRoleFilter(r as any)}
                                style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1.5px solid ${roleFilter === r ? COLORS.green : COLORS.border}`, background: roleFilter === r ? COLORS.greenBg : COLORS.white, color: roleFilter === r ? COLORS.green : COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {(['All', 'Active', 'Inactive', 'Pending'] as const).map(s => {
                            const sc = s !== 'All' ? STATUS_CONFIG[s] : null;
                            return (
                                <button key={s} className="filter-chip" onClick={() => setStatusFilter(s as any)}
                                    style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1.5px solid ${statusFilter === s ? (sc?.dot || COLORS.green) : COLORS.border}`, background: statusFilter === s ? (sc?.bg || COLORS.greenBg) : COLORS.white, color: statusFilter === s ? (sc?.color || COLORS.green) : COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    {s}
                                </button>
                            );
                        })}
                    </div>
                    {/* View toggle */}
                    <div style={{ display: 'flex', background: COLORS.sand, borderRadius: 8, padding: 2, gap: 2, marginLeft: 'auto' }}>
                        {(['table', 'grid'] as const).map(m => (
                            <button key={m} onClick={() => setViewMode(m)} style={{ width: 30, height: 28, borderRadius: 6, border: 'none', background: viewMode === m ? COLORS.white : 'transparent', color: viewMode === m ? COLORS.dark : COLORS.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', boxShadow: viewMode === m ? '0 1px 4px rgba(0,0,0,0.07)' : 'none' }}>
                                {m === 'table'
                                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="9" x2="9" y2="21" /></svg>
                                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                {search || roleFilter !== 'All' || statusFilter !== 'All' ? (
                    <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginBottom: 10, animation: 'fadeIn 0.2s ease' }}>
                        Showing {filtered.length} of {SAMPLE_ADMINS.length} admins
                        <button onClick={() => { setSearch(''); setRoleFilter('All'); setStatusFilter('All'); }} style={{ marginLeft: 8, fontSize: 11, color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Clear filters</button>
                    </div>
                ) : null}

                {isLoading ? (
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '60px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both 0.14s' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite', margin: '0 auto 12px', display: 'block' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                        <div style={{ fontSize: 13, color: COLORS.textMuted }}>Loading admins...</div>
                    </div>
                ) : viewMode === 'table' ? (
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 0.4s ease both 0.14s' }}>
                        <div className="scroll-area" style={{ overflowX: 'auto' }}>
                            <div style={{ minWidth: 800 }}>
                                {/* Table header */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 0.5fr', padding: '10px 20px', background: '#FAFAF8', borderBottom: `1px solid #F0ECE6` }}>
                                    {[
                                        { label: 'Admin', key: 'name' as const },
                                        { label: 'Role', key: 'role' as const },
                                        { label: 'Status', key: 'status' as const },
                                        { label: 'Joined', key: 'joined' as const },
                                        { label: 'Last Active', key: null },
                                        { label: '', key: null },
                                    ].map(h => (
                                        <div key={h.label} onClick={() => h.key && setSortBy(h.key)} style={{ fontSize: 9.5, fontWeight: 600, color: h.key && sortBy === h.key ? COLORS.green : COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: h.key ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            {h.label}
                                            {h.key && sortBy === h.key && <span style={{ fontSize: 8, color: COLORS.green }}>▲</span>}
                                        </div>
                                    ))}
                                </div>
                                {/* Rows */}
                                {filtered.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: COLORS.sand, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark, marginBottom: 4 }}>No admins found</div>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>Try adjusting your filters</div>
                                </div>
                            ) : filtered.map((a, i) => {
                                const rc = ROLE_CONFIG[a.role];
                                const sc = STATUS_CONFIG[a.status];
                                const ac = AVATAR_COLORS[parseInt(a.id.replace('A', '')) % AVATAR_COLORS.length];
                                const isExpanded = expandedId === a.id;
                                const isLast = i === filtered.length - 1;
                                return (
                                    <React.Fragment key={a.id}>
                                        <div className="table-row" onClick={() => setSelectedAdmin(a)}
                                            style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 1fr 0.5fr', padding: '13px 20px', borderBottom: (isLast && !isExpanded) ? 'none' : `1px solid #F6F4F0`, alignItems: 'center', background: isExpanded ? '#F8F6F2' : (hoveredRow === a.id ? '#F8F6F2' : COLORS.white), cursor: 'pointer' }}
                                            onMouseEnter={() => setHoveredRow(a.id)} onMouseLeave={() => setHoveredRow(null)}>
                                            {/* Admin */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: 10, background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, color: ac.color, flexShrink: 0 }}>{a.avatar}</div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark }}>{a.name}</div>
                                                    <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace' }}>{a.id} · {a.email.split('@')[0]}</div>
                                                </div>
                                            </div>
                                                {/* Role */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ width: 22, height: 22, borderRadius: 6, background: rc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ROLE_ICONS[a.role](rc.color)}</div>
                                                    <span style={{ fontSize: 11.5, fontWeight: 500, color: rc.color, background: rc.bg, padding: '2px 8px', borderRadius: 6 }}>{a.role}</span>
                                                </div>
                                                {/* Status */}
                                                <div>
                                                    <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: sc.bg, color: sc.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot }} />{a.status}
                                                    </span>
                                                </div>
                                                {/* Joined */}
                                                <div style={{ fontSize: 11.5, color: COLORS.textSub }}>{a.joinedAt}</div>
                                                {/* Last active */}
                                                <div style={{ fontSize: 11.5, color: a.lastActive === 'Never' ? COLORS.textMuted : COLORS.textSub }}>{a.lastActive}</div>
                                                {/* Expand arrow */}
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="expand-btn"
                                                        onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : a.id); }}
                                                        style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${isExpanded ? COLORS.green : COLORS.border}`, background: isExpanded ? COLORS.greenBg : COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isExpanded ? COLORS.green : COLORS.textMuted, cursor: 'pointer', transition: 'all 0.18s' }}
                                                        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                                                    >
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}><polyline points="9 18 15 12 9 6" /></svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Inline slide-down detail panel */}
                                            <div className="expand-row" style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr', background: '#F8F6F2', borderBottom: isLast ? 'none' : `1px solid #F6F4F0` }}>
                                                <div className="expand-row-inner">
                                                    <div style={{ padding: '4px 20px 20px 64px', display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 130 }}>
                                                            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#B8B4AD', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin ID</span>
                                                            <span style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark, fontFamily: 'monospace' }}>{a.id}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 150 }}>
                                                            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#B8B4AD', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone</span>
                                                            <span style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark }}>{a.phone}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 150 }}>
                                                            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#B8B4AD', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</span>
                                                            <span style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark }}>{a.email}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 130 }}>
                                                            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#B8B4AD', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Permissions</span>
                                                            <span style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark }}>{a.permissions} granted</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignSelf: 'center' }}>
                                                            <button onClick={(e) => { e.stopPropagation(); setExpandedId(null); }} style={{ padding: '7px 14px', background: 'transparent', border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 500, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, animation: 'fadeUp 0.4s ease both 0.14s' }}>
                        {filtered.map((a, i) => {
                            const rc = ROLE_CONFIG[a.role];
                            const sc = STATUS_CONFIG[a.status];
                            const ac = AVATAR_COLORS[parseInt(a.id.replace('A', '')) % AVATAR_COLORS.length];
                            return (
                                <div key={a.id} className="admin-card" onClick={() => setSelectedAdmin(a)}
                                    style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', animationDelay: `${i * 0.04}s` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: ac.color }}>{a.avatar}</div>
                                        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: sc.dot }} />{a.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>{a.name}</div>
                                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
                                    <div style={{ padding: '7px 10px', background: rc.bg, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                                        <div style={{ width: 22, height: 22, borderRadius: 6, background: `${rc.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ROLE_ICONS[a.role](rc.color)}</div>
                                        <span style={{ fontSize: 11.5, fontWeight: 600, color: rc.color }}>{a.role}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: COLORS.textMuted, paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
                                        <span>Joined {a.joinedAt}</span>
                                        <span>Active {a.lastActive}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: COLORS.textMuted }}>
                    <span>Showing {filtered.length} admin{filtered.length !== 1 ? 's' : ''}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {[1].map(p => (
                            <button key={p} style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${COLORS.green}`, background: COLORS.greenBg, fontSize: 11.5, fontWeight: 600, color: COLORS.green, cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useRef, useEffect } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory, toggleCategoryActive } from '../../services/catalog/catalogService';
import { useConfirm, useToast } from '../../context/UIContext';

const COLORS = {
    bg: '#FAFAF8', white: '#FFFFFF', dark: '#1A1A1A', green: '#2A6344',
    greenLight: '#48A87A', greenBg: '#EAF4EE', greenBorder: '#C4DFD0',
    border: '#EEEBE5', borderInput: '#E8E4DE', textMuted: '#9A968F',
    textSub: '#6A6560', sand: '#F6F4F0', red: '#C62828', redBg: '#FFEBEE',
    amber: '#A05A10', amberBg: '#FEF3E2',
};

type Category = {
    _id?: string;
    id: string;
    name: string;
    image: string | null;
    active: boolean;
    itemCount: number;
    createdAt: string;
};

const CAT_COLORS = [
    { bg: '#EAF4EE', color: '#2A6344' }, { bg: '#E8F0FE', color: '#1A56DB' },
    { bg: '#FEF3E2', color: '#A05A10' }, { bg: '#F3E8FF', color: '#7C3AED' },
    { bg: '#FFEBEE', color: '#C62828' }, { bg: '#E0F7FA', color: '#00838F' },
];

function CameraIcon({ color = '#48A87A' }: { color?: string }) {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
        </svg>
    );
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <div onClick={() => !disabled && onChange(!value)} style={{
            width: 38, height: 22, borderRadius: 11,
            background: value ? COLORS.green : '#D4CFC8',
            position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 0.22s',
            flexShrink: 0,
            opacity: disabled ? 0.6 : 1
        }}>
            <div style={{
                position: 'absolute', top: 3, left: value ? 19 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            }} />
        </div>
    );
}

function AddCategoryModal({ onClose, onSave, categoryToEdit }: { onClose: () => void; onSave: () => void; categoryToEdit?: Category | null }) {
    const toast = useToast();
    const [name, setName] = useState(categoryToEdit ? categoryToEdit.name : '');
    const [active, setActive] = useState(categoryToEdit ? categoryToEdit.active : true);
    const [preview, setPreview] = useState<string | null>(categoryToEdit ? categoryToEdit.image : null);
    const [file, setFile] = useState<File | null>(null);
    const [nameErr, setNameErr] = useState('');
    const [hovered, setHovered] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        const r = new FileReader();
        r.onload = ev => setPreview(ev.target?.result as string);
        r.readAsDataURL(f);
    };

    const handleSubmit = async () => {
        if (!name.trim()) { setNameErr('Category name is required'); return; }
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('category_name', name.trim());
            formData.append('isActive', String(active));
            if (file) {
                formData.append('image', file);
            }

            let res;
            if (categoryToEdit && categoryToEdit._id) {
                res = await updateCategory(categoryToEdit._id, formData);
            } else {
                res = await createCategory(formData);
            }

            if (res && (res.status === 200 || res.status === 201)) {
                toast.success(res.massage || res.message || "Category saved successfully.");
                onSave();
                onClose();
            } else {
                toast.error(res?.massage || res?.message || "Failed to save category.");
            }
        } catch (error) {
            toast.error("Something went wrong!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.28)', animation: 'fadeIn 0.18s ease' }}>
            <div style={{ background: COLORS.white, borderRadius: 18, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.14)', animation: 'fadeUp 0.24s ease', overflow: 'hidden' }}>
                {/* Modal header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark }}>{categoryToEdit ? 'Edit Category' : 'Add Category'}</div>
                        <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 1 }}>{categoryToEdit ? 'Update details below' : 'Fill in the details below'}</div>
                    </div>
                    <button onClick={onClose} disabled={isSaving} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${COLORS.border}`, background: COLORS.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div style={{ padding: 24 }}>
                    {/* Image upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
                        <div
                            onClick={() => !isSaving && inputRef.current?.click()}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            style={{
                                width: 88, height: 88, borderRadius: 18,
                                border: `2px dashed ${hovered ? COLORS.green : COLORS.greenBorder}`,
                                background: preview ? 'transparent' : COLORS.greenBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                transition: 'all 0.2s', transform: hovered ? 'scale(1.03)' : 'scale(1)',
                            }}
                        >
                            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                            {preview
                                ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
                                : <CameraIcon color={hovered ? COLORS.green : COLORS.greenLight} />
                            }
                            {hovered && (
                                <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(42,99,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CameraIcon color="#fff" />
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginTop: 8 }}>{preview ? 'Click to change' : 'Click to upload image'}</div>
                    </div>

                    {/* Name */}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>Category Name</label>
                        <input
                            value={name} onChange={e => { setName(e.target.value); setNameErr(''); }}
                            placeholder="e.g. Electronics"
                            disabled={isSaving}
                            style={{ width: '100%', padding: '10px 14px', background: COLORS.white, border: `1.5px solid ${nameErr ? COLORS.red : COLORS.borderInput}`, borderRadius: 9, fontSize: 13, color: COLORS.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }}
                        />
                        {nameErr && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>⚠ {nameErr}</div>}
                    </div>

                    {/* Active toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: COLORS.sand, borderRadius: 10, border: `1px solid ${COLORS.border}`, marginBottom: 22 }}>
                        <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.dark }}>Active</div>
                            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Visible to customers on storefront</div>
                        </div>
                        <Toggle value={active} onChange={setActive} disabled={isSaving} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={onClose} disabled={isSaving} style={{ flex: 1, padding: '10px', background: COLORS.sand, border: `1px solid ${COLORS.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={handleSubmit} disabled={isSaving} style={{ flex: 2, padding: '10px', background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {isSaving ? 'Saving...' : categoryToEdit ? 'Save Changes' : 'Add Category'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Categories() {
    const confirm = useConfirm();
    const toast = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [isLoading, setIsLoading] = useState(true);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const data = await fetchCategories();
            if (data?.status === 200 && Array.isArray(data.result)) {
                const mapped: Category[] = data.result.map((cat: any) => ({
                    _id: cat._id,
                    id: cat._id?.slice(-5).toUpperCase() || 'C0000',
                    name: cat.category_name,
                    image: cat.image || null,
                    active: cat.isActive,
                    itemCount: 0,
                    createdAt: cat.createAt ? cat.createAt.split(' ')[0] : 'N/A'
                }));
                setCategories(mapped);
            } else {
                toast.error(data?.massage || "Failed to load categories.");
            }
        } catch (error) {
            toast.error("Failed to load categories.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const filtered = categories.filter(c => {
        const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
        const mf = filter === 'All' || (filter === 'Active' ? c.active : !c.active);
        return ms && mf;
    });

    const toggleActive = async (id: string, mongoId?: string) => {
        if (!mongoId) return;
        try {
            const res = await toggleCategoryActive(mongoId);
            if (res && res.status === 200) {
                toast.success(res.massage || "Status updated.");
                setCategories(prev => prev.map(c => c._id === mongoId ? { ...c, active: !c.active } : c));
            } else {
                toast.error(res?.massage || "Failed to update status.");
            }
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleDelete = async (mongoId?: string) => {
        if (!mongoId) return;
        const cat = categories.find(c => c._id === mongoId);
        const name = cat ? `"${cat.name}"` : "this category";
        const ok = await confirm({
            title: "Delete Category",
            message: `Are you sure you want to delete ${name}? All sub-categories, extra-categories, and products associated with it will need reallocation.`,
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            isDanger: true
        });
        if (!ok) return;
        try {
            const res = await deleteCategory(mongoId);
            if (res && res.status === 200) {
                toast.success(res.massage || "Category deleted.");
                setCategories(prev => prev.filter(c => c._id !== mongoId));
            } else {
                toast.error(res?.massage || "Failed to delete category.");
            }
        } catch (error) {
            toast.error("Failed to delete category.");
        }
    };

    const handleEdit = (cat: Category) => {
        setCategoryToEdit(cat);
        setShowModal(true);
    };

    return (
        <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Outfit', sans-serif", padding: '32px 24px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                *{box-sizing:border-box;margin:0;padding:0;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                .trow{transition:background 0.13s;cursor:default;}
                .trow:hover{background:#F8F6F2 !important;}
                .chip{transition:all 0.15s;cursor:pointer;}
                .chip:hover{border-color:${COLORS.green} !important;}
                .search-inp{background:${COLORS.white};border:1.5px solid ${COLORS.borderInput};border-radius:9px;padding:8px 14px 8px 36px;font-family:'Outfit',sans-serif;font-size:12.5px;color:${COLORS.dark};outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
                .search-inp:focus{border-color:${COLORS.green};box-shadow:0 0 0 3px rgba(42,99,68,0.08);}
                .search-inp::placeholder{color:#B8B4AD;}
                .add-btn{transition:all 0.18s;}
                .add-btn:hover{background:#1F4F35 !important;transform:translateY(-1px);}
                .icon-action{width:28px;height:28px;border-radius:7px;border:1px solid ${COLORS.border};background:${COLORS.white};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.16s;color:${COLORS.textMuted};}
                .icon-action:hover{border-color:${COLORS.green};background:${COLORS.greenBg};color:${COLORS.green};}
                .scroll-area::-webkit-scrollbar{height:4px;}
                .scroll-area::-webkit-scrollbar-track{background:transparent;}
                .scroll-area::-webkit-scrollbar-thumb{background:#E0DDD6;border-radius:4px;}
                
                .cat-stats-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 20px; }
                @media (min-width: 640px) { .cat-stats-grid { grid-template-columns: repeat(3, 1fr); } }
            `}</style>

            {showModal && (
                <AddCategoryModal
                    onClose={() => { setShowModal(false); setCategoryToEdit(null); }}
                    onSave={loadCategories}
                    categoryToEdit={categoryToEdit}
                />
            )}

            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.4s ease both' }}>
                    <div>
                        <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Catalog / Categories</div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: COLORS.dark, letterSpacing: '-0.02em' }}>Categories</h1>
                        <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>
                            {categories.filter(c => c.active).length} active · {categories.filter(c => !c.active).length} inactive · {categories.length} total
                        </p>
                    </div>
                    <button className="add-btn" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 36, background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Category
                    </button>
                </div>

                {/* Stat strips */}
                <div className="cat-stats-grid" style={{ animation: 'fadeUp 0.4s ease both 0.06s' }}>
                    {[
                        { label: 'Total Categories', val: categories.length, color: COLORS.dark, bg: COLORS.white },
                        { label: 'Active', val: categories.filter(c => c.active).length, color: COLORS.green, bg: COLORS.greenBg },
                        { label: 'Inactive', val: categories.filter(c => !c.active).length, color: COLORS.textMuted, bg: '#F0ECE8' },
                    ].map(s => (
                        <div key={s.label} style={{ background: s.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter bar */}
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', animation: 'fadeUp 0.4s ease both 0.1s' }}>
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8B4AD" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input className="search-inp" style={{ width: '100%' }} placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {(['All', 'Active', 'Inactive'] as const).map(f => (
                            <button key={f} className="chip" onClick={() => setFilter(f)}
                                style={{ padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1.5px solid ${filter === f ? COLORS.green : COLORS.border}`, background: filter === f ? COLORS.greenBg : COLORS.white, color: filter === f ? COLORS.green : COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 0.4s ease both 0.14s' }}>
                    <div className="scroll-area" style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: 640 }}>
                            {/* Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '48px 2fr 1fr 1fr 100px 80px', padding: '10px 20px', background: '#FAFAF8', borderBottom: `1px solid #F0ECE6` }}>
                                {['', 'Category', 'ID', 'Items', 'Status', 'Actions'].map(h => (
                                    <div key={h} style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                                ))}
                            </div>
                            {isLoading ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>Loading categories...</div>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark, marginBottom: 4 }}>No categories found</div>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>Try a different search or filter</div>
                                </div>
                            ) : filtered.map((c, i) => {
                                const ac = CAT_COLORS[i % CAT_COLORS.length];
                                return (
                                    <div key={c._id} className="trow" style={{ display: 'grid', gridTemplateColumns: '48px 2fr 1fr 1fr 100px 80px', padding: '12px 20px', borderBottom: i < filtered.length - 1 ? `1px solid #F6F4F0` : 'none', alignItems: 'center', background: COLORS.white }}>
                                        {/* Image */}
                                        <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', border: `1px solid ${COLORS.border}`, background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {c.image
                                                ? <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <span style={{ fontSize: 13, fontWeight: 700, color: ac.color }}>{c.name[0]}</span>
                                            }
                                        </div>
                                        {/* Name */}
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark }}>{c.name}</div>
                                            <div style={{ fontSize: 10.5, color: COLORS.textMuted }}>Added {c.createdAt}</div>
                                        </div>
                                        {/* ID */}
                                        <div style={{ fontSize: 11.5, color: COLORS.textMuted, fontFamily: 'monospace' }}>{c.id}</div>
                                        {/* Items */}
                                        <div style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark }}>{c.itemCount} <span style={{ fontSize: 10.5, color: COLORS.textMuted, fontWeight: 400 }}>items</span></div>
                                        {/* Status toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Toggle value={c.active} onChange={() => toggleActive(c.id, c._id)} />
                                            <span style={{ fontSize: 11, color: c.active ? COLORS.green : COLORS.textMuted, fontWeight: 500 }}>{c.active ? 'Active' : 'Inactive'}</span>
                                        </div>
                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="icon-action" onClick={() => handleEdit(c)} title="Edit">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button className="icon-action" onClick={() => handleDelete(c._id)} title="Delete" style={{ borderColor: '#F5C6C6' }} onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.background = COLORS.redBg; e.currentTarget.style.color = COLORS.red; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#F5C6C6'; e.currentTarget.style.background = COLORS.white; e.currentTarget.style.color = COLORS.textMuted; }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: COLORS.textMuted }}>
                    <span>Showing {filtered.length} of {categories.length} categories</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${COLORS.green}`, background: COLORS.greenBg, fontSize: 11.5, fontWeight: 600, color: COLORS.green, cursor: 'pointer', fontFamily: 'inherit' }}>1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useRef, useEffect } from 'react';
import { fetchCategories, fetchSubCategories, createSubCategory, updateSubCategory, deleteSubCategory, toggleSubCategoryActive } from '../../services/catalog/catalogService';
import { useConfirm, useToast } from '../../context/UIContext';

const COLORS = {
    bg: '#FAFAF8', white: '#FFFFFF', dark: '#1A1A1A', green: '#2A6344',
    greenLight: '#48A87A', greenBg: '#EAF4EE', greenBorder: '#C4DFD0',
    border: '#EEEBE5', borderInput: '#E8E4DE', textMuted: '#9A968F',
    textSub: '#6A6560', sand: '#F6F4F0', red: '#C62828', redBg: '#FFEBEE',
    amber: '#A05A10', amberBg: '#FEF3E2', blue: '#1A56DB', blueBg: '#E8F0FE',
};

type SubCategory = {
    _id?: string;
    id: string;
    name: string;
    category: string;
    categoryId: string;
    active: boolean;
    itemCount: number;
    createdAt: string;
};

type ParentCategory = {
    _id: string;
    name: string;
};

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
    'Electronics': { bg: '#E8F0FE', color: '#1A56DB' },
    'Clothing': { bg: '#F3E8FF', color: '#7C3AED' },
    'Home & Kitchen': { bg: '#EAF4EE', color: '#2A6344' },
    'Sports': { bg: '#FEF3E2', color: '#A05A10' },
    'Books': { bg: '#E0F7FA', color: '#00838F' },
    'Beauty': { bg: '#FFEBEE', color: '#C62828' },
};

function getCatColor(name: string) {
    return CAT_COLORS[name] || { bg: '#F6F4F0', color: '#6A6560' };
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <div onClick={() => !disabled && onChange(!value)} style={{ width: 38, height: 22, borderRadius: 11, background: value ? COLORS.green : '#D4CFC8', position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.22s', flexShrink: 0, opacity: disabled ? 0.6 : 1 }}>
            <div style={{ position: 'absolute', top: 3, left: value ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
        </div>
    );
}

function CategoryDropdown({ value, onChange, list, disabled }: { value: string; onChange: (v: string) => void; list: ParentCategory[]; disabled?: boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedCat = list.find(c => c._id === value);
    const cc = selectedCat ? getCatColor(selectedCat.name) : null;

    return (
        <div ref={ref} style={{ position: 'relative', opacity: disabled ? 0.7 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
            <div onClick={() => setOpen(o => !o)} style={{ padding: '10px 14px', background: COLORS.white, border: `1.5px solid ${open ? COLORS.green : COLORS.borderInput}`, borderRadius: 9, fontSize: 13, color: value ? COLORS.dark : '#B8B4AD', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, boxShadow: open ? `0 0 0 3px rgba(42,99,68,0.08)` : 'none', transition: 'all 0.2s', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {cc && <span style={{ width: 8, height: 8, borderRadius: '50%', background: cc.color, display: 'inline-block', flexShrink: 0 }} />}
                    <span>{selectedCat ? selectedCat.name : 'Select parent category'}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            {open && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: COLORS.white, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.1)', zIndex: 50, overflowY: 'auto', maxHeight: 200, animation: 'fadeUp 0.15s ease' }}>
                    {list.map(cat => {
                        const c = getCatColor(cat.name);
                        const sel = value === cat._id;
                        return (
                            <div key={cat._id} onClick={() => { onChange(cat._id); setOpen(false); }}
                                style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: sel ? COLORS.greenBg : COLORS.white, transition: 'background 0.13s' }}
                                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = COLORS.sand; }}
                                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = COLORS.white; }}>
                                <div style={{ width: 26, height: 26, borderRadius: 7, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{cat.name[0]}</span>
                                </div>
                                <span style={{ fontSize: 12.5, fontWeight: sel ? 600 : 400, color: sel ? COLORS.green : COLORS.dark }}>{cat.name}</span>
                                {sel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12" /></svg>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AddSubCatModal({ onClose, onSave, parentCategories, subCatToEdit }: { onClose: () => void; onSave: () => void; parentCategories: ParentCategory[]; subCatToEdit?: SubCategory | null }) {
    const toast = useToast();
    const [name, setName] = useState(subCatToEdit ? subCatToEdit.name : '');
    const [category, setCategory] = useState(subCatToEdit ? subCatToEdit.categoryId : '');
    const [active, setActive] = useState(subCatToEdit ? subCatToEdit.active : true);
    const [nameErr, setNameErr] = useState('');
    const [catErr, setCatErr] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        let ok = true;
        if (!name.trim()) { setNameErr('Sub-category name is required'); ok = false; }
        if (!category) { setCatErr('Please select a parent category'); ok = false; }
        if (!ok) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('sub_category_name', name.trim());
            formData.append('category_id', category);
            formData.append('isActive', String(active));

            let res;
            if (subCatToEdit && subCatToEdit._id) {
                res = await updateSubCategory(subCatToEdit._id, formData);
            } else {
                res = await createSubCategory(formData);
            }

            if (res && (res.status === 200 || res.status === 201)) {
                toast.success(res.massage || res.message || "Sub-category saved successfully.");
                onSave();
                onClose();
            } else {
                toast.error(res?.massage || res?.message || "Failed to save sub-category.");
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
                <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark }}>{subCatToEdit ? 'Edit Sub-Category' : 'Add Sub-Category'}</div>
                        <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 1 }}>Link it to a parent category</div>
                    </div>
                    <button onClick={onClose} disabled={isSaving} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${COLORS.border}`, background: COLORS.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div style={{ padding: 24 }}>
                    {/* Parent category dropdown */}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>Parent Category</label>
                        <CategoryDropdown value={category} onChange={v => { setCategory(v); setCatErr(''); }} list={parentCategories} disabled={isSaving} />
                        {catErr && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>⚠ {catErr}</div>}
                    </div>

                    {/* Sub-category name */}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>Sub-Category Name</label>
                        <input
                            value={name} onChange={e => { setName(e.target.value); setNameErr(''); }}
                            placeholder="e.g. Smartphones"
                            disabled={isSaving}
                            style={{ width: '100%', padding: '10px 14px', background: COLORS.white, border: `1.5px solid ${nameErr ? COLORS.red : COLORS.borderInput}`, borderRadius: 9, fontSize: 13, color: COLORS.dark, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' }}
                        />
                        {nameErr && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>⚠ {nameErr}</div>}
                    </div>

                    {/* Active toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: COLORS.sand, borderRadius: 10, border: `1px solid ${COLORS.border}`, marginBottom: 22 }}>
                        <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.dark }}>Active</div>
                            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Visible to customers</div>
                        </div>
                        <Toggle value={active} onChange={setActive} disabled={isSaving} />
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={onClose} disabled={isSaving} style={{ flex: 1, padding: '10px', background: COLORS.sand, border: `1px solid ${COLORS.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        <button onClick={handleSubmit} disabled={isSaving} style={{ flex: 2, padding: '10px', background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {isSaving ? 'Saving...' : subCatToEdit ? 'Save Changes' : 'Add Sub-Category'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SubCategories() {
    const confirm = useConfirm();
    const toast = useToast();
    const [items, setItems] = useState<SubCategory[]>([]);
    const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [showModal, setShowModal] = useState(false);
    const [subCatToEdit, setSubCatToEdit] = useState<SubCategory | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [catsRes, subCatsRes] = await Promise.all([
                fetchCategories(),
                fetchSubCategories()
            ]);

            if (catsRes?.status === 200 && Array.isArray(catsRes.result)) {
                setParentCategories(catsRes.result.map((c: any) => ({
                    _id: c._id,
                    name: c.category_name
                })));
            }

            if (subCatsRes?.status === 200 && Array.isArray(subCatsRes.result)) {
                const mapped: SubCategory[] = subCatsRes.result.map((sc: any) => ({
                    _id: sc._id,
                    id: sc._id?.slice(-5).toUpperCase() || 'SC000',
                    name: sc.sub_category_name,
                    category: sc.category_id?.category_name || 'N/A',
                    categoryId: sc.category_id?._id || '',
                    active: sc.isActive,
                    itemCount: 0,
                    createdAt: sc.createAt ? sc.createAt.split(' ')[0] : 'N/A'
                }));
                setItems(mapped);
            }
        } catch (error) {
            toast.error("Failed to load sub-categories.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = items.filter(s => {
        const ms = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
        const mc = catFilter === 'All' || s.category === catFilter;
        const mst = statusFilter === 'All' || (statusFilter === 'Active' ? s.active : !s.active);
        return ms && mc && mst;
    });

    const toggleActive = async (id: string, mongoId?: string) => {
        if (!mongoId) return;
        try {
            const res = await toggleSubCategoryActive(mongoId);
            if (res && res.status === 200) {
                toast.success(res.massage || "Status updated.");
                setItems(prev => prev.map(s => s._id === mongoId ? { ...s, active: !s.active } : s));
            } else {
                toast.error(res?.massage || "Failed to update status.");
            }
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleDelete = async (mongoId?: string) => {
        if (!mongoId) return;
        const subCat = items.find(s => s._id === mongoId);
        const name = subCat ? `"${subCat.name}"` : "this sub-category";
        const ok = await confirm({
            title: "Delete Sub-Category",
            message: `Are you sure you want to delete ${name}? Products inside this sub-category will lose their association.`,
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            isDanger: true
        });
        if (!ok) return;
        try {
            const res = await deleteSubCategory(mongoId);
            if (res && res.status === 200) {
                toast.success(res.massage || "Sub-category deleted.");
                setItems(prev => prev.filter(s => s._id !== mongoId));
            } else {
                toast.error(res?.massage || "Failed to delete sub-category.");
            }
        } catch (error) {
            toast.error("Failed to delete sub-category.");
        }
    };

    const handleEdit = (subCat: SubCategory) => {
        setSubCatToEdit(subCat);
        setShowModal(true);
    };

    return (
        <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Outfit', sans-serif", padding: '32px 24px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                *{box-sizing:border-box;margin:0;padding:0;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                .trow{transition:background 0.13s;}
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
                
                .subcat-stats-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 20px; }
                @media (min-width: 640px) { .subcat-stats-grid { grid-template-columns: repeat(3, 1fr); } }
            `}</style>

            {showModal && (
                <AddSubCatModal
                    onClose={() => { setShowModal(false); setSubCatToEdit(null); }}
                    onSave={loadData}
                    parentCategories={parentCategories}
                    subCatToEdit={subCatToEdit}
                />
            )}

            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.4s ease both' }}>
                    <div>
                        <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Catalog / Sub-Categories</div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: COLORS.dark, letterSpacing: '-0.02em' }}>Sub-Categories</h1>
                        <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>
                            {items.filter(s => s.active).length} active · {items.filter(s => !s.active).length} inactive · {items.length} total
                        </p>
                    </div>
                    <button className="add-btn" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 36, background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Sub-Category
                    </button>
                </div>

                {/* Stats */}
                <div className="subcat-stats-grid" style={{ animation: 'fadeUp 0.4s ease both 0.06s' }}>
                    {[
                        { label: 'Total Sub-Categories', val: items.length, color: COLORS.dark, bg: COLORS.white },
                        { label: 'Active', val: items.filter(s => s.active).length, color: COLORS.green, bg: COLORS.greenBg },
                        { label: 'Inactive', val: items.filter(s => !s.active).length, color: COLORS.textMuted, bg: '#F0ECE8' },
                    ].map(s => (
                        <div key={s.label} style={{ background: s.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter bar */}
                <div className="flex flex-col md:flex-row gap-3" style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, alignItems: 'center', animation: 'fadeUp 0.4s ease both 0.1s', width: '100%' }}>
                    <div style={{ position: 'relative', width: '100%' }} className="md:flex-1">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8B4AD" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input className="search-inp" style={{ width: '100%' }} placeholder="Search sub-categories…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {/* Category filter chips */}
                    <div style={{ display: 'flex', gap: 6, width: '100%' }} className="md:w-auto overflow-x-auto pb-1 md:pb-0 scroll-area">
                        <button className="chip" onClick={() => setCatFilter('All')}
                            style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1.5px solid ${catFilter === 'All' ? COLORS.green : COLORS.border}`, background: catFilter === 'All' ? COLORS.greenBg : COLORS.white, color: catFilter === 'All' ? COLORS.green : COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
                            All
                        </button>
                        {parentCategories.map(c => {
                            const cc = getCatColor(c.name);
                            const sel = catFilter === c.name;
                            return (
                                <button key={c._id} className="chip" onClick={() => setCatFilter(c.name)}
                                    style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1.5px solid ${sel ? cc.color : COLORS.border}`, background: sel ? cc.bg : COLORS.white, color: sel ? cc.color : COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                                    {sel && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cc.color, display: 'inline-block' }} />}
                                    {c.name}
                                </button>
                            );
                        })}
                    </div>
                    {/* Status filter */}
                    <div style={{ display: 'flex', gap: 6 }} className="md:ml-auto">
                        {(['All', 'Active', 'Inactive'] as const).map(s => (
                            <button key={s} className="chip" onClick={() => setStatusFilter(s)}
                                style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1.5px solid ${statusFilter === s ? COLORS.green : COLORS.border}`, background: statusFilter === s ? COLORS.greenBg : COLORS.white, color: statusFilter === s ? COLORS.green : COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 0.4s ease both 0.14s' }}>
                    <div className="scroll-area" style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: 680 }}>
                            {/* Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.4fr 0.8fr 1fr 100px 80px', padding: '10px 20px', background: '#FAFAF8', borderBottom: `1px solid #F0ECE6` }}>
                                {['Sub-Category', 'Parent Category', 'ID', 'Items', 'Status', 'Actions'].map(h => (
                                    <div key={h} style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                                ))}
                            </div>
                            {isLoading ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>Loading sub-categories...</div>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark, marginBottom: 4 }}>No sub-categories found</div>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>Try a different search or filter</div>
                                </div>
                            ) : filtered.map((s, i) => {
                                const cc = getCatColor(s.category);
                                return (
                                    <div key={s._id} className="trow" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.4fr 0.8fr 1fr 100px 80px', padding: '12px 20px', borderBottom: i < filtered.length - 1 ? `1px solid #F6F4F0` : 'none', alignItems: 'center', background: COLORS.white }}>
                                        {/* Name */}
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark }}>{s.name}</div>
                                            <div style={{ fontSize: 10.5, color: COLORS.textMuted }}>Added {s.createdAt}</div>
                                        </div>
                                        {/* Parent category badge */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: 6, background: cc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: cc.color }}>{s.category[0]}</span>
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 500, color: cc.color, background: cc.bg, padding: '2px 8px', borderRadius: 6 }}>{s.category}</span>
                                        </div>
                                        {/* ID */}
                                        <div style={{ fontSize: 11.5, color: COLORS.textMuted, fontFamily: 'monospace' }}>{s.id}</div>
                                        {/* Items */}
                                        <div style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark }}>{s.itemCount} <span style={{ fontSize: 10.5, color: COLORS.textMuted, fontWeight: 400 }}>items</span></div>
                                        {/* Status */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Toggle value={s.active} onChange={() => toggleActive(s.id, s._id)} />
                                            <span style={{ fontSize: 11, color: s.active ? COLORS.green : COLORS.textMuted, fontWeight: 500 }}>{s.active ? 'Active' : 'Off'}</span>
                                        </div>
                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="icon-action" onClick={() => handleEdit(s)} title="Edit">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button className="icon-action" onClick={() => handleDelete(s._id)} title="Delete" style={{ borderColor: '#F5C6C6' }} onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.background = COLORS.redBg; e.currentTarget.style.color = COLORS.red; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#F5C6C6'; e.currentTarget.style.background = COLORS.white; e.currentTarget.style.color = COLORS.textMuted; }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: COLORS.textMuted }}>
                    <span>Showing {filtered.length} of {items.length} sub-categories</span>
                    <button style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${COLORS.green}`, background: COLORS.greenBg, fontSize: 11.5, fontWeight: 600, color: COLORS.green, cursor: 'pointer', fontFamily: 'inherit' }}>1</button>
                </div>
            </div>
        </div>
    );
}
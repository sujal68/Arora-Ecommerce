import React, { useState, useEffect } from 'react';
import { fetchProducts, deleteProduct, toggleProductActive, fetchCategories } from '../../services/catalog/catalogService';
import { useConfirm, useToast } from '../../context/UIContext';

const COLORS = {
    bg: '#FAFAF8', white: '#FFFFFF', dark: '#1A1A1A', green: '#2A6344',
    greenLight: '#48A87A', greenBg: '#EAF4EE', greenBorder: '#C4DFD0',
    border: '#EEEBE5', borderInput: '#E8E4DE', textMuted: '#9A968F',
    textSub: '#6A6560', sand: '#F6F4F0', red: '#C62828', redBg: '#FFEBEE',
    amber: '#A05A10', amberBg: '#FEF3E2', blue: '#1A56DB', blueBg: '#E8F0FE',
};

type Product = {
    _id: string;
    id: string;
    name: string;
    category: string;
    categoryId: string;
    price: number;
    comparePrice: number | null;
    stock: number;
    lowStockAlert: number;
    unit: string;
    active: boolean;
    featured: boolean;
    image: string | null;
    sku: string;
    createdAt: string;
};

type CategoryItem = {
    _id: string;
    name: string;
};

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
    Electronics: { bg: '#E8F0FE', color: '#1A56DB' },
    Clothing: { bg: '#F3E8FF', color: '#7C3AED' },
    'Home & Kitchen': { bg: '#FEF3E2', color: '#A05A10' },
    Sports: { bg: '#EAF4EE', color: '#2A6344' },
    Books: { bg: '#E0F7FA', color: '#00838F' },
    Beauty: { bg: '#FFEBEE', color: '#C62828' },
};

function getCatColor(name: string) {
    return CAT_COLORS[name] || { bg: '#F6F4F0', color: '#6A6560' };
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <div onClick={() => !disabled && onChange(!value)} style={{
            width: 34, height: 20, borderRadius: 10,
            background: value ? COLORS.green : '#D4CFC8',
            position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.22s', flexShrink: 0,
            opacity: disabled ? 0.6 : 1
        }}>
            <div style={{
                position: 'absolute', top: 2, left: value ? 16 : 2,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            }} />
        </div>
    );
}

function StockBadge({ stock, lowStockAlert }: { stock: number; lowStockAlert: number }) {
    if (stock === 0) return (
        <span style={{ padding: '3px 8px', borderRadius: 6, background: COLORS.redBg, color: COLORS.red, fontSize: 10.5, fontWeight: 600 }}>Out of stock</span>
    );
    if (stock <= lowStockAlert) return (
        <span style={{ padding: '3px 8px', borderRadius: 6, background: COLORS.amberBg, color: COLORS.amber, fontSize: 10.5, fontWeight: 600 }}>Low · {stock}</span>
    );
    return (
        <span style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.dark }}>{stock}</span>
    );
}

type SortKey = 'name' | 'price' | 'stock' | 'createdAt';
type SortDir = 'asc' | 'desc';

export default function ViewProducts() {
    const confirm = useConfirm();
    const toast = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive' | 'Low Stock' | 'Out of Stock'>('All');
    const [filterCat, setFilterCat] = useState('All');
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [catsRes, prodsRes] = await Promise.all([
                fetchCategories(),
                fetchProducts({ limit: 1000 })
            ]);

            if (catsRes?.status === 200 && Array.isArray(catsRes.result)) {
                setCategories(catsRes.result.map((c: any) => ({
                    _id: c._id,
                    name: c.category_name
                })));
            }

            if (prodsRes?.status === 200 && prodsRes.result && Array.isArray(prodsRes.result.products)) {
                const mapped: Product[] = prodsRes.result.products.map((p: any) => ({
                    _id: p._id,
                    id: p._id?.slice(-5).toUpperCase() || 'P0000',
                    name: p.product_name,
                    category: p.category_id?.category_name || 'N/A',
                    categoryId: p.category_id?._id || '',
                    price: p.price || 0,
                    comparePrice: p.comparePrice || null,
                    stock: p.stock || 0,
                    lowStockAlert: p.lowStockAlert || 10,
                    unit: p.unit || 'piece',
                    active: p.isActive,
                    featured: p.isFeatured || false,
                    image: p.thumbnail || (p.images && p.images[0]) || null,
                    sku: p.sku || 'N/A',
                    createdAt: p.createAt ? p.createAt.split(' ')[0] : 'N/A'
                }));
                setProducts(mapped);
            }
        } catch (error) {
            toast.error("Failed to load products.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const filtered = products
        .filter(p => {
            const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
            const mf = filterStatus === 'All' ? true
                : filterStatus === 'Active' ? p.active
                    : filterStatus === 'Inactive' ? !p.active
                        : filterStatus === 'Low Stock' ? (p.stock > 0 && p.stock <= p.lowStockAlert)
                            : p.stock === 0;
            const mc = filterCat === 'All' || p.categoryId === filterCat;
            return ms && mf && mc;
        })
        .sort((a, b) => {
            let av: string | number, bv: string | number;
            if (sortKey === 'price') { av = a.price; bv = b.price; }
            else if (sortKey === 'stock') { av = a.stock; bv = b.stock; }
            else if (sortKey === 'name') { av = a.name; bv = b.name; }
            else { av = a.createdAt; bv = b.createdAt; }
            return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
        });

    const handleToggleActive = async (productId: string, mongoId: string) => {
        setIsUpdatingStatus(productId);
        try {
            const res = await toggleProductActive(mongoId);
            if (res && res.status === 200) {
                toast.success(res.massage || "Status updated.");
                setProducts(prev => prev.map(p => p._id === mongoId ? { ...p, active: !p.active } : p));
            } else {
                toast.error(res?.massage || "Failed to update status.");
            }
        } catch (error) {
            toast.error("Failed to update status.");
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    const handleDeleteClick = async (product: Product) => {
        const ok = await confirm({
            title: "Delete Product",
            message: `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`,
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            isDanger: true
        });
        if (!ok) return;
        setIsDeleting(true);
        try {
            const res = await deleteProduct(product._id);
            if (res && res.status === 200) {
                toast.success(res.massage || "Product deleted successfully.");
                setProducts(prev => prev.filter(p => p._id !== product._id));
                setSelected(prev => {
                    const next = new Set(prev);
                    next.delete(product.id);
                    return next;
                });
            } else {
                toast.error(res?.massage || "Failed to delete product.");
            }
        } catch (error) {
            toast.error("Failed to delete product.");
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };
    const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));
    const toggleAll = () => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(filtered.map(p => p.id)));
    };

    const SortIcon = ({ k }: { k: SortKey }) => (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: sortKey === k ? 1 : 0.35 }}>
            {sortKey === k && sortDir === 'asc'
                ? <polyline points="18 15 12 9 6 15" />
                : <polyline points="6 9 12 15 18 9" />
            }
        </svg>
    );

    const stats = [
        { label: 'Total Products', val: products.length, color: COLORS.dark, bg: COLORS.white },
        { label: 'Active', val: products.filter(p => p.active).length, color: COLORS.green, bg: COLORS.greenBg },
        { label: 'Low Stock', val: products.filter(p => p.stock > 0 && p.stock <= p.lowStockAlert).length, color: COLORS.amber, bg: COLORS.amberBg },
        { label: 'Out of Stock', val: products.filter(p => p.stock === 0).length, color: COLORS.red, bg: COLORS.redBg },
    ];

    const handleBulkAction = async (action: 'Activate' | 'Deactivate' | 'Delete') => {
        const selectedProducts = products.filter(p => selected.has(p.id));
        if (selectedProducts.length === 0) return;

        if (action === 'Delete') {
            const ok = await confirm({
                title: `Delete ${selectedProducts.length} Products`,
                message: `Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`,
                confirmText: "Yes, Delete All",
                cancelText: "Cancel",
                isDanger: true
            });
            if (!ok) return;
        }

        toast.info(`Performing bulk ${action}...`);
        try {
            await Promise.all(selectedProducts.map(async (p) => {
                if (action === 'Delete') {
                    await deleteProduct(p._id);
                } else {
                    const shouldActivate = action === 'Activate';
                    if (p.active !== shouldActivate) {
                        await toggleProductActive(p._id);
                    }
                }
            }));
            toast.success(`Bulk ${action} completed.`);
            loadData();
            setSelected(new Set());
        } catch (error) {
            toast.error(`Some bulk actions failed.`);
            loadData();
        }
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
                .sort-th{cursor:pointer;user-select:none;transition:color 0.15s;}
                .sort-th:hover{color:${COLORS.dark} !important;}
                .scroll-area::-webkit-scrollbar{height:4px;width:4px;}
                .scroll-area::-webkit-scrollbar-track{background:transparent;}
                .scroll-area::-webkit-scrollbar-thumb{background:#E0DDD6;border-radius:4px;}
                .cat-pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10.5px;font-weight:600;}
                .product-stats-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 20px; }
                @media (min-width: 640px) { .product-stats-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .product-stats-grid { grid-template-columns: repeat(4, 1fr); } }
            `}</style>

            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.4s ease both' }}>
                    <div>
                        <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Catalog / Products</div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: COLORS.dark, letterSpacing: '-0.02em' }}>Products</h1>
                        <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>
                            {products.filter(p => p.active).length} active · {products.filter(p => p.stock === 0).length} out of stock · {products.length} total
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="add-btn" onClick={() => window.location.href = '/dashboard/add-product'} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px', height: 36, background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="product-stats-grid" style={{ animation: 'fadeUp 0.4s ease both 0.06s' }}>
                    {stats.map(s => (
                        <div key={s.label} style={{ background: s.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3" style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, alignItems: 'center', animation: 'fadeUp 0.4s ease both 0.1s', width: '100%' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', width: '100%' }} className="md:flex-1">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8B4AD" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input className="search-inp" style={{ width: '100%' }} placeholder="Search name, SKU, ID…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {/* Category filter */}
                    <div style={{ position: 'relative', width: '100%' }} className="md:w-auto">
                        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: '100%', padding: '7px 28px 7px 12px', background: COLORS.white, border: `1.5px solid ${COLORS.borderInput}`, borderRadius: 8, fontSize: 12, color: COLORS.dark, outline: 'none', fontFamily: 'inherit', appearance: 'none', cursor: 'pointer' }}>
                            <option value="All">All Categories</option>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2.5" style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
                    </div>

                    {/* Status chips */}
                    <div style={{ display: 'flex', gap: 6, width: '100%' }} className="md:w-auto overflow-x-auto pb-1 md:pb-0 scroll-area">
                        {(['All', 'Active', 'Inactive', 'Low Stock', 'Out of Stock'] as const).map(f => (
                            <button key={f} className="chip" onClick={() => setFilterStatus(f)}
                                style={{ padding: '5px 11px', borderRadius: 20, fontSize: 10.5, fontWeight: 500, border: `1.5px solid ${filterStatus === f ? COLORS.green : COLORS.border}`, background: filterStatus === f ? COLORS.greenBg : COLORS.white, color: filterStatus === f ? COLORS.green : COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk action bar */}
                {selected.size > 0 && (
                    <div style={{ background: COLORS.dark, borderRadius: 10, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeUp 0.2s ease' }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>{selected.size} selected</span>
                        <div style={{ flex: 1 }} />
                        {[
                            { label: 'Activate' as const },
                            { label: 'Deactivate' as const },
                            { label: 'Delete' as const, red: true },
                        ].map(a => (
                            <button key={a.label} onClick={() => handleBulkAction(a.label)}
                                style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${a.red ? COLORS.red : 'rgba(255,255,255,0.2)'}`, background: a.red ? COLORS.redBg : 'rgba(255,255,255,0.1)', fontSize: 11.5, fontWeight: 600, color: a.red ? COLORS.red : '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                                {a.label}
                            </button>
                        ))}
                        <button onClick={() => setSelected(new Set())} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', fontSize: 11.5, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
                    </div>
                )}

                {/* Table */}
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 0.4s ease both 0.14s' }}>
                    <div className="scroll-area" style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: 1000 }}>
                            {/* Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '36px 52px 2.5fr 1fr 100px 90px 90px 80px 80px', padding: '10px 20px', background: '#FAFAF8', borderBottom: `1px solid #F0ECE6`, alignItems: 'center' }}>
                                <div>
                                    <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: COLORS.green }} />
                                </div>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}></div>
                                <div className="sort-th" onClick={() => toggleSort('name')} style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4 }}>Product <SortIcon k="name" /></div>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category</div>
                                <div className="sort-th" onClick={() => toggleSort('price')} style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4 }}>Price <SortIcon k="price" /></div>
                                <div className="sort-th" onClick={() => toggleSort('stock')} style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4 }}>Stock <SortIcon k="stock" /></div>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</div>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Featured</div>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</div>
                            </div>
                            {isLoading ? (
                                <div style={{ padding: '52px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>Loading products...</div>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: '52px 20px', textAlign: 'center' }}>
                                    <div style={{ width: 52, height: 52, borderRadius: 16, background: COLORS.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.6"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark, marginBottom: 4 }}>No products found</div>
                                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>Try adjusting your search or filters</div>
                                </div>
                            ) : filtered.map((p, i) => {
                                const catColor = getCatColor(p.category);
                                const discount = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : null;
                                const isSelected = selected.has(p.id);

                                return (
                                    <div key={p.id} className="trow" style={{
                                        display: 'grid', gridTemplateColumns: '36px 52px 2.5fr 1fr 100px 90px 90px 80px 80px',
                                        padding: '12px 20px', borderBottom: i < filtered.length - 1 ? `1px solid #F6F4F0` : 'none',
                                        alignItems: 'center', background: isSelected ? COLORS.greenBg : COLORS.white,
                                        transition: 'background 0.13s',
                                    }}>
                                        {/* Checkbox */}
                                        <div><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)} style={{ cursor: 'pointer', accentColor: COLORS.green }} /></div>

                                        {/* Image */}
                                        <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', border: `1px solid ${COLORS.border}`, background: catColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {p.image
                                                ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <span style={{ fontSize: 14, fontWeight: 700, color: catColor.color }}>{p.name[0]}</span>
                                            }
                                        </div>

                                        {/* Name + SKU */}
                                        <div style={{ paddingRight: 12 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 }} title={p.name}>{p.name}</div>
                                            <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginTop: 1 }}>
                                                <span style={{ fontFamily: 'monospace' }}>{p.sku}</span>
                                                <span style={{ margin: '0 5px', opacity: 0.4 }}>·</span>
                                                <span>{p.id}</span>
                                                <span style={{ margin: '0 5px', opacity: 0.4 }}>·</span>
                                                <span>Added {p.createdAt}</span>
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <span className="cat-pill" style={{ background: catColor.bg, color: catColor.color }}>{p.category}</span>
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.dark }}>₹{p.price.toLocaleString()}</div>
                                            {p.comparePrice && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                                                    <span style={{ fontSize: 10.5, color: COLORS.textMuted, textDecoration: 'line-through' }}>₹{p.comparePrice.toLocaleString()}</span>
                                                    <span style={{ fontSize: 9.5, fontWeight: 700, color: COLORS.green, background: COLORS.greenBg, padding: '1px 5px', borderRadius: 4 }}>{discount}%</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stock */}
                                        <div>
                                            <StockBadge stock={p.stock} lowStockAlert={p.lowStockAlert} />
                                            {p.stock > 0 && <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>{p.unit}s</div>}
                                        </div>

                                        {/* Status toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Toggle value={p.active} onChange={() => handleToggleActive(p.id, p._id)} disabled={isUpdatingStatus === p.id} />
                                            <span style={{ fontSize: 10.5, color: p.active ? COLORS.green : COLORS.textMuted, fontWeight: 500 }}>{p.active ? 'On' : 'Off'}</span>
                                        </div>

                                        {/* Featured */}
                                        <div>
                                            {p.featured
                                                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, background: '#FFF8E1', color: '#C17B00', fontSize: 10.5, fontWeight: 600 }}>
                                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#C17B00" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                    Yes
                                                </span>
                                                : <span style={{ fontSize: 10.5, color: COLORS.textMuted }}>—</span>
                                            }
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            <button className="icon-action" onClick={() => window.location.href = `/dashboard/add-product?editId=${p._id}`} title="Edit">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button
                                                className="icon-action" title="Delete"
                                                style={{ borderColor: '#F5C6C6' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = COLORS.red; (e.currentTarget as HTMLElement).style.background = COLORS.redBg; (e.currentTarget as HTMLElement).style.color = COLORS.red; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F5C6C6'; (e.currentTarget as HTMLElement).style.background = COLORS.white; (e.currentTarget as HTMLElement).style.color = COLORS.textMuted; }}
                                                onClick={() => handleDeleteClick(p)}>
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
                    <span>Showing {filtered.length} of {products.length} products</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${COLORS.green}`, background: COLORS.greenBg, fontSize: 11.5, fontWeight: 600, color: COLORS.green, cursor: 'pointer', fontFamily: 'inherit' }}>1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
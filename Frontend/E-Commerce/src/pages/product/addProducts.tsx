import React, { useState, useRef, useEffect } from 'react';
import { fetchCategories, fetchSubCategories, fetchExtraCategories, createProduct, updateProduct, fetchSingleProduct } from '../../services/catalog/catalogService';
import { toast } from 'react-toastify';

const COLORS = {
    bg: '#FAFAF8', white: '#FFFFFF', dark: '#1A1A1A', green: '#2A6344',
    greenLight: '#48A87A', greenBg: '#EAF4EE', greenBorder: '#C4DFD0',
    border: '#EEEBE5', borderInput: '#E8E4DE', textMuted: '#9A968F',
    textSub: '#6A6560', sand: '#F6F4F0', red: '#C62828', redBg: '#FFEBEE',
    amber: '#A05A10', amberBg: '#FEF3E2',
};

const UNITS = ['piece', 'kg', 'litre', 'box', 'pair', 'set'];

type Step = 1 | 2 | 3;

interface ProductForm {
    name: string;
    category: string;
    subCategory: string;
    extraCategory: string;
    description: string;
    sku: string;
    price: string;
    comparePrice: string;
    costPrice: string;
    stock: string;
    lowStockAlert: string;
    unit: string;
    weight: string;
    active: boolean;
    featured: boolean;
    images: string[];
}

const INIT: ProductForm = {
    name: '', category: '', subCategory: '', extraCategory: '', description: '', sku: '',
    price: '', comparePrice: '', costPrice: '',
    stock: '', lowStockAlert: '10', unit: 'piece', weight: '',
    active: true, featured: false, images: [],
};

type ParentCategory = {
    _id: string;
    name: string;
};

type SubCategoryItem = {
    _id: string;
    name: string;
    categoryId: string;
};

type ExtraCategoryItem = {
    _id: string;
    name: string;
    subCategoryId: string;
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div onClick={() => onChange(!value)} style={{
            width: 38, height: 22, borderRadius: 11,
            background: value ? COLORS.green : '#D4CFC8',
            position: 'relative', cursor: 'pointer', transition: 'background 0.22s', flexShrink: 0,
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

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textSub, letterSpacing: '0.04em', display: 'block', marginBottom: 5 }}>{label}</label>
            {children}
            {hint && !error && <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginTop: 4 }}>{hint}</div>}
            {error && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>⚠ {error}</div>}
        </div>
    );
}

const inputStyle = (err?: string): React.CSSProperties => ({
    width: '100%', padding: '10px 14px',
    background: COLORS.white, border: `1.5px solid ${err ? COLORS.red : COLORS.borderInput}`,
    borderRadius: 9, fontSize: 13, color: COLORS.dark, outline: 'none',
    fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
});

const selectStyle = (err?: string): React.CSSProperties => ({
    width: '100%', padding: '10px 14px',
    background: COLORS.white, border: `1.5px solid ${err ? COLORS.red : COLORS.borderInput}`,
    borderRadius: 9, fontSize: 13, color: COLORS.dark, outline: 'none',
    fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box', cursor: 'pointer',
    appearance: 'none',
});

// ─── Step 1: Basic Details ───────────────────────────────────────────────────
function StepDetails({
    form,
    setForm,
    errors,
    parentCategories,
    subCategories,
    extraCategories,
}: {
    form: ProductForm;
    setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
    errors: Partial<ProductForm>;
    parentCategories: ParentCategory[];
    subCategories: SubCategoryItem[];
    extraCategories: ExtraCategoryItem[];
}) {
    const set = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const val = e.target.value;
        setForm(p => {
            const next = { ...p, [k]: val };
            if (k === 'category') {
                next.subCategory = '';
                next.extraCategory = '';
            } else if (k === 'subCategory') {
                next.extraCategory = '';
            }
            return next;
        });
    };

    const filteredSubCategories = subCategories.filter(sc => sc.categoryId === form.category);
    const filteredExtraCategories = extraCategories.filter(ec => ec.subCategoryId === form.subCategory);

    return (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>Basic Information</div>
                <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>Product name, category cascade, and description</div>
            </div>

            <Field label="Product Name" error={errors.name}>
                <input
                    value={form.name} onChange={set('name')} placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    style={inputStyle(errors.name)}
                />
            </Field>

            <div className="form-grid-2">
                <Field label="Category" error={errors.category}>
                    <div style={{ position: 'relative' }}>
                        <select value={form.category} onChange={set('category')} style={selectStyle(errors.category)}>
                            <option value="">Select category</option>
                            {parentCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2.5"
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </Field>

                <Field label="Sub-Category" error={errors.subCategory}>
                    <div style={{ position: 'relative' }}>
                        <select value={form.subCategory} onChange={set('subCategory')} disabled={!form.category} style={selectStyle(errors.subCategory)}>
                            <option value="">Select sub-category</option>
                            {filteredSubCategories.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
                        </select>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2.5"
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </Field>
            </div>

            <div className="form-grid-2">
                <Field label="Extra Category (Optional)">
                    <div style={{ position: 'relative' }}>
                        <select value={form.extraCategory} onChange={set('extraCategory')} disabled={!form.subCategory} style={selectStyle()}>
                            <option value="">Select extra category</option>
                            {filteredExtraCategories.map(ec => <option key={ec._id} value={ec._id}>{ec.name}</option>)}
                        </select>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2.5"
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </Field>

                <Field label="SKU / Product Code" hint="Leave blank to auto-generate">
                    <input value={form.sku} onChange={set('sku')} placeholder="e.g. ELEC-001" style={inputStyle()} />
                </Field>
            </div>

            <Field label="Description" hint="Describe the product clearly for customers">
                <textarea
                    value={form.description} onChange={set('description')}
                    placeholder="What makes this product special? Include key features, materials, and use cases…"
                    rows={4}
                    style={{
                        ...inputStyle(), resize: 'vertical', lineHeight: 1.6,
                        minHeight: 100, maxHeight: 240,
                    }}
                />
            </Field>

            <div className="form-grid-2" style={{ gap: 10, marginTop: 4 }}>
                {[
                    { key: 'active' as const, label: 'Active', sub: 'Visible on storefront' },
                    { key: 'featured' as const, label: 'Featured', sub: 'Show in featured section' },
                ].map(({ key, label, sub }) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: COLORS.sand, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
                        <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.dark }}>{label}</div>
                            <div style={{ fontSize: 10.5, color: COLORS.textMuted }}>{sub}</div>
                        </div>
                        <Toggle value={form[key] as boolean} onChange={v => setForm(p => ({ ...p, [key]: v }))} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Step 2: Pricing & Inventory ─────────────────────────────────────────────
function StepPricing({ form, setForm, errors }: { form: ProductForm; setForm: React.Dispatch<React.SetStateAction<ProductForm>>; errors: Partial<ProductForm> }) {
    const set = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const margin = form.price && form.costPrice
        ? (((parseFloat(form.price) - parseFloat(form.costPrice)) / parseFloat(form.price)) * 100).toFixed(1)
        : null;

    return (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>Pricing & Inventory</div>
                <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>Set prices, stock levels, and units</div>
            </div>

            {/* Pricing */}
            <div style={{ background: COLORS.greenBg, border: `1px solid ${COLORS.greenBorder}`, borderRadius: 12, padding: '16px 16px 6px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Pricing</div>
                <div className="pricing-grid">
                    <Field label="Selling Price ₹" error={errors.price}>
                        <input type="number" value={form.price} onChange={set('price')} placeholder="0.00" style={inputStyle(errors.price)} min="0" step="0.01" />
                    </Field>
                    <Field label="Compare-at Price ₹" hint="Strike-through price">
                        <input type="number" value={form.comparePrice} onChange={set('comparePrice')} placeholder="0.00" style={inputStyle()} min="0" step="0.01" />
                    </Field>
                    <Field label="Cost Price ₹" hint="Your purchase price">
                        <input type="number" value={form.costPrice} onChange={set('costPrice')} placeholder="0.00" style={inputStyle()} min="0" step="0.01" />
                    </Field>
                </div>
                {margin !== null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: COLORS.white, borderRadius: 8, marginBottom: 12, border: `1px solid ${COLORS.greenBorder}` }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                        <span style={{ fontSize: 11.5, color: COLORS.green, fontWeight: 600 }}>Profit margin: {margin}%</span>
                        {form.comparePrice && form.price && parseFloat(form.comparePrice) > parseFloat(form.price) && (
                            <span style={{ fontSize: 11, color: COLORS.amber, fontWeight: 600, marginLeft: 8, background: COLORS.amberBg, padding: '2px 8px', borderRadius: 20 }}>
                                {Math.round(((parseFloat(form.comparePrice) - parseFloat(form.price)) / parseFloat(form.comparePrice)) * 100)}% off shown
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Inventory */}
            <div style={{ background: COLORS.sand, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '16px 16px 6px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSub, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Inventory</div>
                <div className="inventory-grid">
                    <Field label="Stock Qty" error={errors.stock}>
                        <input type="number" value={form.stock} onChange={set('stock')} placeholder="0" style={inputStyle(errors.stock)} min="0" />
                    </Field>
                    <Field label="Low Stock Alert" hint="Notify when below">
                        <input type="number" value={form.lowStockAlert} onChange={set('lowStockAlert')} placeholder="10" style={inputStyle()} min="0" />
                    </Field>
                    <Field label="Unit">
                        <div style={{ position: 'relative' }}>
                            <select value={form.unit} onChange={set('unit')} style={selectStyle()}>
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2.5"
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </Field>
                    <Field label="Weight (kg)" hint="For shipping calc">
                        <input type="number" value={form.weight} onChange={set('weight')} placeholder="0.00" style={inputStyle()} min="0" step="0.01" />
                    </Field>
                </div>
            </div>
        </div>
    );
}

// ─── Step 3: Media ───────────────────────────────────────────────────────────
function StepMedia({ form, setForm, onFilesAdded, parentCategories, isEdit }: { form: ProductForm; setForm: React.Dispatch<React.SetStateAction<ProductForm>>; onFilesAdded: (files: File[]) => void; parentCategories: ParentCategory[]; isEdit: boolean }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const addImages = (files: FileList | null) => {
        if (!files) return;
        const newFilesArray: File[] = [];
        Array.from(files).forEach(f => {
            newFilesArray.push(f);
            const r = new FileReader();
            r.onload = ev => {
                setForm(p => {
                    const existing = isEdit && p.images.every(url => url.startsWith('http')) ? [] : p.images;
                    return { ...p, images: [...existing, ev.target?.result as string].slice(0, 8) };
                });
            };
            r.readAsDataURL(f);
        });
        onFilesAdded(newFilesArray);
    };

    const removeImage = (i: number) => {
        setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
    };

    const selectedCategoryName = parentCategories.find(c => c._id === form.category)?.name || 'Category';

    return (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>Product Images</div>
                <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>Add up to 8 images · First image is the main photo</div>
            </div>

            {/* Drop zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); addImages(e.dataTransfer.files); }}
                style={{
                    border: `2px dashed ${dragging ? COLORS.green : COLORS.greenBorder}`,
                    borderRadius: 14, padding: '32px 20px', textAlign: 'center',
                    background: dragging ? COLORS.greenBg : COLORS.sand,
                    cursor: 'pointer', transition: 'all 0.2s', marginBottom: 16,
                    transform: dragging ? 'scale(1.01)' : 'scale(1)',
                }}
            >
                <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => addImages(e.target.files)} style={{ display: 'none' }} />
                <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.greenBg, border: `1.5px solid ${COLORS.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.greenLight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.dark, marginBottom: 4 }}>
                    {dragging ? 'Drop images here' : 'Click or drag images here'}
                </div>
                <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>PNG, JPG, WebP · Max 5 MB each · Up to 8 images</div>
            </div>

            {/* Image grid */}
            {form.images.length > 0 && (
                <div className="image-grid">
                    {form.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `2px solid ${i === 0 ? COLORS.green : COLORS.border}`, aspectRatio: '1', background: COLORS.sand }}>
                            <img src={img} alt={`Product ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            {i === 0 && (
                                <div style={{ position: 'absolute', top: 6, left: 6, background: COLORS.green, color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Main</div>
                            )}
                            <button
                                onClick={e => { e.stopPropagation(); removeImage(i); }}
                                style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                    ))}
                    {form.images.length < 8 && (
                        <div onClick={() => inputRef.current?.click()} style={{ border: `2px dashed ${COLORS.greenBorder}`, borderRadius: 12, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: COLORS.greenBg, transition: 'all 0.18s' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.greenLight} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </div>
                    )}
                </div>
            )}

            {/* Summary card */}
            <div style={{ marginTop: 20, background: COLORS.greenBg, border: `1px solid ${COLORS.greenBorder}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Review Summary</div>
                <div className="form-grid-2" style={{ gap: 6 }}>
                    {[
                        { label: 'Name', val: form.name || '—' },
                        { label: 'Category', val: selectedCategoryName || '—' },
                        { label: 'Price', val: form.price ? `₹${form.price}` : '—' },
                        { label: 'Stock', val: form.stock ? `${form.stock} ${form.unit}` : '—' },
                        { label: 'Status', val: form.active ? 'Active' : 'Inactive' },
                        { label: 'Images', val: `${form.images.length} uploaded` },
                    ].map(({ label, val }) => (
                        <div key={label} style={{ display: 'flex', gap: 6 }}>
                            <span style={{ fontSize: 11.5, color: COLORS.textMuted, minWidth: 64 }}>{label}</span>
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.dark }}>{val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddProduct() {
    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState<ProductForm>(INIT);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<Partial<ProductForm>>({});
    const [submitted, setSubmitted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
    const [extraCategories, setExtraCategories] = useState<ExtraCategoryItem[]>([]);

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('editId');
    const isEdit = !!editId;

    useEffect(() => {
        const loadCategoriesData = async () => {
            try {
                const [catsRes, subCatsRes, extraCatsRes] = await Promise.all([
                    fetchCategories(),
                    fetchSubCategories(),
                    fetchExtraCategories()
                ]);

                if (catsRes?.status === 200 && Array.isArray(catsRes.result)) {
                    setParentCategories(catsRes.result.map((c: any) => ({
                        _id: c._id,
                        name: c.category_name
                    })));
                }

                if (subCatsRes?.status === 200 && Array.isArray(subCatsRes.result)) {
                    setSubCategories(subCatsRes.result.map((sc: any) => ({
                        _id: sc._id,
                        name: sc.sub_category_name,
                        categoryId: sc.category_id?._id || ''
                    })));
                }

                if (extraCatsRes?.status === 200 && Array.isArray(extraCatsRes.result)) {
                    setExtraCategories(extraCatsRes.result.map((ec: any) => ({
                        _id: ec._id,
                        name: ec.extra_category_name,
                        subCategoryId: ec.sub_category_id?._id || ''
                    })));
                }
            } catch (error) {
                toast.error("Failed to load catalog filters.");
            }
        };

        const loadProductToEdit = async () => {
            if (!editId) return;
            try {
                const res = await fetchSingleProduct(editId);
                if (res?.status === 200 && res.result) {
                    const p = res.result;
                    setForm({
                        name: p.product_name || '',
                        category: p.category_id?._id || p.category_id || '',
                        subCategory: p.sub_category_id?._id || p.sub_category_id || '',
                        extraCategory: p.extra_category_id?._id || p.extra_category_id || '',
                        description: p.description || '',
                        sku: p.sku || '',
                        price: String(p.price || ''),
                        comparePrice: String(p.comparePrice || ''),
                        costPrice: String(p.costPrice || ''),
                        stock: String(p.stock || ''),
                        lowStockAlert: String(p.lowStockAlert || '10'),
                        unit: p.unit || 'piece',
                        weight: String(p.weight || ''),
                        active: p.isActive,
                        featured: p.isFeatured || false,
                        images: p.images || []
                    });
                }
            } catch (error) {
                toast.error("Failed to load product details.");
            }
        };

        loadCategoriesData().then(loadProductToEdit);
    }, [editId]);

    const steps = [
        { n: 1 as Step, label: 'Details', icon: '📋' },
        { n: 2 as Step, label: 'Pricing', icon: '₹' },
        { n: 3 as Step, label: 'Media', icon: '🖼' },
    ];

    const validate = (): boolean => {
        const e: Partial<ProductForm> = {};
        if (step === 1) {
            if (!form.name.trim()) e.name = 'Product name is required';
            if (!form.category) e.category = 'Please select a category';
            if (!form.subCategory) e.subCategory = 'Please select a sub-category';
        }
        if (step === 2) {
            if (!form.price) e.price = 'Selling price is required';
            if (!form.stock) e.stock = 'Stock quantity is required';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => { if (validate()) setStep(s => (s < 3 ? (s + 1) as Step : s)); };
    const back = () => { setErrors({}); setStep(s => (s > 1 ? (s - 1) as Step : s)); };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('product_name', form.name.trim());
            formData.append('category_id', form.category);
            formData.append('sub_category_id', form.subCategory);
            if (form.extraCategory) {
                formData.append('extra_category_id', form.extraCategory);
            }
            formData.append('description', form.description.trim());
            formData.append('sku', form.sku.trim());
            formData.append('price', form.price);
            if (form.comparePrice) formData.append('comparePrice', form.comparePrice);
            if (form.costPrice) formData.append('costPrice', form.costPrice);
            formData.append('stock', form.stock);
            formData.append('lowStockAlert', form.lowStockAlert);
            formData.append('unit', form.unit);
            if (form.weight) formData.append('weight', form.weight);
            formData.append('isActive', String(form.active));
            formData.append('isFeatured', String(form.featured));

            newFiles.forEach(file => {
                formData.append('images', file);
            });

            let res;
            if (isEdit) {
                res = await updateProduct(editId, formData);
            } else {
                res = await createProduct(formData);
            }

            if (res && (res.status === 200 || res.status === 201)) {
                toast.success(res.massage || res.message || "Product saved successfully.");
                setSubmitted(true);
            } else {
                toast.error(res?.massage || res?.message || "Failed to save product.");
            }
        } catch (error) {
            toast.error("Failed to save product.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFilesAdded = (files: File[]) => {
        setNewFiles(prev => [...prev, ...files].slice(0, 8));
    };

    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes popIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}`}</style>
                <div style={{ textAlign: 'center', animation: 'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: COLORS.greenBg, border: `2px solid ${COLORS.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, color: COLORS.dark, marginBottom: 8 }}>{isEdit ? 'Product Updated!' : 'Product Added!'}</h2>
                    <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 28 }}><strong style={{ color: COLORS.dark }}>{form.name}</strong> has been saved.</p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        {!isEdit && (
                            <button onClick={() => { setForm(INIT); setStep(1); setSubmitted(false); setNewFiles([]); }} style={{ padding: '10px 22px', background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Add Another</button>
                        )}
                        <button onClick={() => window.location.href = '/dashboard/view-products'} style={{ padding: '10px 22px', background: COLORS.sand, border: `1px solid ${COLORS.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>View Products</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Outfit', sans-serif", padding: '32px 24px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                *{box-sizing:border-box;margin:0;padding:0;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
                input:focus,textarea:focus{border-color:${COLORS.green} !important;box-shadow:0 0 0 3px rgba(42,99,68,0.08) !important;}
                select:focus{outline:none;border-color:${COLORS.green} !important;box-shadow:0 0 0 3px rgba(42,99,68,0.08) !important;}
                
                .form-grid-2 { display: grid; grid-template-columns: 1fr; gap: 14px; }
                @media (min-width: 640px) { .form-grid-2 { grid-template-columns: 1fr 1fr; } }
                
                .pricing-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
                @media (min-width: 640px) { .pricing-grid { grid-template-columns: 1fr 1fr 1fr; } }
                
                .inventory-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
                @media (min-width: 480px) { .inventory-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 768px) { .inventory-grid { grid-template-columns: repeat(4, 1fr); } }
                
                .image-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                @media (min-width: 480px) { .image-grid { grid-template-columns: repeat(4, 1fr); } }
                
                .step-label { display: none; }
                @media (min-width: 480px) { .step-label { display: block; } }
            `}</style>

            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease both' }}>
                    <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Catalog / Products / {isEdit ? 'Edit' : 'New'}</div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: COLORS.dark, letterSpacing: '-0.02em' }}>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
                    <p style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>{isEdit ? 'Update fields to save changes' : 'Fill in the steps below to list a new product'}</p>
                </div>

                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, animation: 'fadeUp 0.4s ease both 0.06s' }}>
                    {steps.map((s, i) => (
                        <React.Fragment key={s.n}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: step === s.n ? COLORS.dark : step > s.n ? COLORS.green : COLORS.sand,
                                    border: `2px solid ${step === s.n ? COLORS.dark : step > s.n ? COLORS.green : COLORS.border}`,
                                    transition: 'all 0.25s', fontSize: step > s.n ? 0 : 11, fontWeight: 700, color: step >= s.n ? '#fff' : COLORS.textMuted,
                                }}>
                                    {step > s.n
                                        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                        : s.n
                                    }
                                </div>
                                <div className="step-label">
                                    <div style={{ fontSize: 11, fontWeight: 600, color: step >= s.n ? COLORS.dark : COLORS.textMuted }}>{s.label}</div>
                                </div>
                            </div>
                            {i < steps.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: step > s.n ? COLORS.green : COLORS.border, margin: '0 12px', borderRadius: 2, transition: 'background 0.3s' }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Card */}
                <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28, animation: 'fadeUp 0.4s ease both 0.1s' }}>
                    {step === 1 && <StepDetails form={form} setForm={setForm} errors={errors} parentCategories={parentCategories} subCategories={subCategories} extraCategories={extraCategories} />}
                    {step === 2 && <StepPricing form={form} setForm={setForm} errors={errors} />}
                    {step === 3 && <StepMedia form={form} setForm={setForm} onFilesAdded={handleFilesAdded} parentCategories={parentCategories} isEdit={isEdit} />}

                    {/* Nav buttons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${COLORS.border}` }}>
                        {step > 1 && (
                            <button onClick={back} disabled={isSaving} style={{ flex: 1, padding: '11px', background: COLORS.sand, border: `1px solid ${COLORS.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: COLORS.textSub, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                                Back
                            </button>
                        )}
                        <button
                            onClick={step === 3 ? handleSubmit : next}
                            disabled={isSaving}
                            style={{ flex: 2, padding: '11px', background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s, transform 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1F4F35'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.dark; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
                        >
                            {step === 3 ? (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    {isSaving ? 'Saving...' : 'Save Product'}
                                </>
                            ) : (
                                <>
                                    Continue
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Progress */}
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: COLORS.textMuted }}>
                    <div style={{ flex: 1, height: 4, background: COLORS.border, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((step - 1) / 2) * 100}%`, background: COLORS.green, borderRadius: 4, transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
                    </div>
                    <span>Step {step} of 3</span>
                </div>
            </div>
        </div>
    );
}
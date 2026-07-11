import React, { useState, useEffect } from 'react';
import { fetchAllOrders, updateOrderStatus, cancelOrder } from '../../services/order/orderService';
import { toast } from 'react-toastify';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
    bg: '#FAFAF8', white: '#FFFFFF', dark: '#1A1A1A', green: '#2A6344',
    greenLight: '#48A87A', greenBg: '#EAF4EE', greenBorder: '#C4DFD0',
    border: '#EEEBE5', borderInput: '#E8E4DE', textMuted: '#9A968F',
    textSub: '#6A6560', sand: '#F6F4F0',
    red: '#C62828', redBg: '#FFEBEE', redBorder: '#F5C6C6',
    amber: '#A05A10', amberBg: '#FEF3E2', amberBorder: '#F5D49A',
    blue: '#1A56DB', blueBg: '#E8F0FE', blueBorder: '#BBCEFB',
    purple: '#6B21A8', purpleBg: '#F3E8FF', purpleBorder: '#D8B4FE',
    teal: '#00838F', tealBg: '#E0F7FA', tealBorder: '#80DEEA',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';
type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';

type OrderItem = { name: string; sku: string; qty: number; price: number; category: string };

type Order = {
    _id: string;
    id: string;
    customer: { name: string; email: string; phone: string };
    items: OrderItem[];
    status: OrderStatus;
    payment: PaymentStatus;
    method: string;
    address: string;
    city: string;
    total: number;
    discount: number;
    shipping: number;
    createdAt: string;
    updatedAt: string;
    notes: string;
    trackingId: string | null;
};

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { bg: string; color: string; border: string; icon: string }> = {
    Pending: { bg: C.amberBg, color: C.amber, border: C.amberBorder, icon: '⏳' },
    Confirmed: { bg: C.blueBg, color: C.blue, border: C.blueBorder, icon: '✓' },
    Shipped: { bg: C.purpleBg, color: C.purple, border: C.purpleBorder, icon: '📦' },
    Delivered: { bg: C.greenBg, color: C.green, border: C.greenBorder, icon: '✔' },
    Cancelled: { bg: C.redBg, color: C.red, border: C.redBorder, icon: '✕' },
    Refunded: { bg: '#F0ECE8', color: C.textSub, border: C.border, icon: '↩' },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { bg: string; color: string }> = {
    Paid: { bg: C.greenBg, color: C.green },
    Pending: { bg: C.amberBg, color: C.amber },
    Failed: { bg: C.redBg, color: C.red },
    Refunded: { bg: '#F0ECE8', color: C.textSub },
};

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

// ─── Tiny components ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
    const s = STATUS_CONFIG[status];
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 700, color: s.color, whiteSpace: 'nowrap' }}>
            {status}
        </span>
    );
}

function PayBadge({ status }: { status: PaymentStatus }) {
    const s = PAYMENT_CONFIG[status];
    return (
        <span style={{ padding: '3px 8px', borderRadius: 6, background: s.bg, fontSize: 10.5, fontWeight: 600, color: s.color }}>{status}</span>
    );
}

// ─── Timeline step for drawer ─────────────────────────────────────────────────
const TIMELINE: { status: OrderStatus; label: string }[] = [
    { status: 'Pending', label: 'Order placed' },
    { status: 'Confirmed', label: 'Confirmed' },
    { status: 'Shipped', label: 'Shipped' },
    { status: 'Delivered', label: 'Delivered' },
];

function OrderTimeline({ current }: { current: OrderStatus }) {
    if (current === 'Cancelled' || current === 'Refunded') {
        const s = STATUS_CONFIG[current];
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, marginBottom: 18 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: s.color }}>Order {current}</span>
            </div>
        );
    }
    const currentIdx = TIMELINE.findIndex(t => t.status === current);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 22, position: 'relative' }}>
            {TIMELINE.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                    <div key={step.status} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {i < TIMELINE.length - 1 && (
                            <div style={{ position: 'absolute', top: 10, left: '50%', width: '100%', height: 2, background: i < currentIdx ? C.green : C.border, zIndex: 0, transition: 'background 0.3s' }} />
                        )}
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? C.green : C.sand, border: `2px solid ${done ? C.green : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, transition: 'all 0.3s', boxShadow: active ? `0 0 0 4px ${C.greenBg}` : 'none' }}>
                            {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: done ? C.green : C.textMuted, marginTop: 6, textAlign: 'center' }}>{step.label}</div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────
function OrderDrawer({ order, onClose, onStatusChange }: { order: Order; onClose: () => void; onStatusChange: (id: string, s: OrderStatus) => void }) {
    const subtotal = order.items.reduce((sum, i) => sum + i.qty * i.price, 0);

    return (
        <>
            {/* Backdrop */}
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.22)', animation: 'fadeIn 0.2s ease' }} />

            {/* Drawer */}
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: '100%', maxWidth: 480, background: C.white, boxShadow: '-8px 0 48px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.28s cubic-bezier(0.4,0,0.2,1)' }}>
                {/* Drawer header */}
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{order.id}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{order.createdAt}</div>
                    </div>
                    <StatusBadge status={order.status} />
                </div>

                {/* Scrollable body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="drawer-scroll">

                    {/* Timeline */}
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Order Progress</div>
                    <OrderTimeline current={order.status} />

                    {/* Customer */}
                    <div style={{ background: C.sand, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Customer</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.greenBg, border: `1.5px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: C.green, flexShrink: 0 }}>
                                {order.customer.name[0]}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{order.customer.name}</div>
                                <div style={{ fontSize: 11.5, color: C.textMuted }}>{order.customer.email}</div>
                                <div style={{ fontSize: 11.5, color: C.textMuted }}>{order.customer.phone}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Delivery Address</div>
                            <div style={{ fontSize: 12.5, color: C.dark, lineHeight: 1.5 }}>{order.address}, {order.city}</div>
                        </div>
                    </div>

                    {/* Items */}
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {order.items.length} Item{order.items.length > 1 ? 's' : ''}
                        </div>
                        {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < order.items.length - 1 ? `1px solid #F6F4F0` : 'none' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 9, background: C.greenBg, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: C.green, flexShrink: 0 }}>
                                    {item.name[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.dark }}>{item.name}</div>
                                    <div style={{ fontSize: 10.5, color: C.textMuted, fontFamily: 'monospace' }}>{item.sku}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.dark }}>₹{(item.qty * item.price).toLocaleString()}</div>
                                    <div style={{ fontSize: 10.5, color: C.textMuted }}>×{item.qty} @ ₹{item.price.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}

                        {/* Price breakdown */}
                        <div style={{ padding: '12px 16px', background: C.sand, borderTop: `1px solid ${C.border}` }}>
                            {[
                                { label: 'Subtotal', val: `₹${subtotal.toLocaleString()}` },
                                ...(order.discount > 0 ? [{ label: 'Discount', val: `-₹${order.discount.toLocaleString()}` }] : []),
                                { label: `Shipping${order.shipping === 0 ? ' (Free)' : ''}`, val: order.shipping === 0 ? '₹0' : `₹${order.shipping}` },
                            ].map(r => (
                                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textMuted, marginBottom: 5 }}>
                                    <span>{r.label}</span><span>{r.val}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 700, color: C.dark, marginTop: 8, paddingTop: 8, borderTop: `1.5px solid ${C.border}` }}>
                                <span>Total</span><span>₹{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                        <div style={{ background: C.sand, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Payment</div>
                            <PayBadge status={order.payment} />
                            <div style={{ fontSize: 11.5, color: C.textSub, marginTop: 6, fontWeight: 500 }}>{order.method}</div>
                        </div>
                        {order.trackingId && (
                            <div style={{ background: C.sand, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Tracking ID</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, fontFamily: 'monospace' }}>{order.trackingId}</div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div style={{ background: C.amberBg, border: `1px solid ${C.amberBorder}`, borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <div style={{ fontSize: 12, color: C.amber, lineHeight: 1.5 }}>{order.notes}</div>
                        </div>
                    )}

                    {/* Update Status */}
                    {order.status !== 'Cancelled' && order.status !== 'Refunded' && order.status !== 'Delivered' && (
                        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Update Status</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {ALL_STATUSES.filter(s => s !== order.status).map(s => {
                                    const sc = STATUS_CONFIG[s];
                                    return (
                                        <button key={s} onClick={() => onStatusChange(order._id, s)}
                                            style={{ padding: '8px 12px', borderRadius: 9, border: `1.5px solid ${sc.border}`, background: sc.bg, fontSize: 11.5, fontWeight: 600, color: sc.color, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = 'brightness(0.95)'}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'none'}>
                                            → {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Main Orders Page ─────────────────────────────────────────────────────────
export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
    const [filterPayment, setFilterPayment] = useState<PaymentStatus | 'All'>('All');
    const [selected, setSelected] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [isLoading, setIsLoading] = useState(true);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAllOrders();
            if (res?.status === 200 && Array.isArray(res.result)) {
                const mapped: Order[] = res.result.map((ord: any) => ({
                    _id: ord._id,
                    id: ord._id?.slice(-8).toUpperCase() || 'ORD-0000',
                    customer: {
                        name: `${ord.user_id?.first_name || ''} ${ord.user_id?.last_name || ''}`.trim() || 'Guest',
                        email: ord.user_id?.email || 'N/A',
                        phone: ord.user_id?.phone || 'N/A'
                    },
                    items: ord.items.map((item: any) => ({
                        name: item.name || 'Product',
                        sku: item.sku || 'N/A',
                        qty: item.qty || 1,
                        price: item.price || 0,
                        category: item.category || 'N/A'
                    })),
                    status: ord.status,
                    payment: ord.payment,
                    method: ord.method || 'COD',
                    address: ord.address || '',
                    city: ord.city || '',
                    total: ord.total || 0,
                    discount: ord.discount || 0,
                    shipping: ord.shipping || 0,
                    createdAt: ord.createAt || 'N/A',
                    updatedAt: ord.updateAt || 'N/A',
                    notes: ord.notes || '',
                    trackingId: ord.trackingId || null
                }));
                setOrders(mapped);
            }
        } catch (error) {
            toast.error("Failed to load orders.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const selectedOrder = orders.find(o => o._id === selected) ?? null;

    const filtered = orders
        .filter(o => {
            const ms = o.id.toLowerCase().includes(search.toLowerCase())
                || o.customer.name.toLowerCase().includes(search.toLowerCase())
                || o.customer.email.toLowerCase().includes(search.toLowerCase());
            const mfs = filterStatus === 'All' || o.status === filterStatus;
            const mfp = filterPayment === 'All' || o.payment === filterPayment;
            return ms && mfs && mfp;
        })
        .sort((a, b) => sortDir === 'desc' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt));

    const handleStatusChange = async (mongoId: string, status: OrderStatus) => {
        try {
            let res;
            if (status === 'Cancelled') {
                if (!window.confirm("Are you sure you want to cancel this order? This will restore stock levels.")) return;
                res = await cancelOrder(mongoId);
            } else {
                let trackingId: string | undefined = undefined;
                if (status === 'Shipped') {
                    const idInput = window.prompt("Please enter a tracking ID/AWB number (optional):");
                    if (idInput !== null) trackingId = idInput;
                }
                res = await updateOrderStatus(mongoId, { status, trackingId });
            }

            if (res && res.status === 200) {
                toast.success(res.massage || "Order updated successfully.");
                loadOrders();
            } else {
                toast.error(res?.massage || "Failed to update order.");
            }
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    };

    const totalRevenue = orders.filter(o => o.payment === 'Paid').reduce((s, o) => s + o.total, 0);

    const stats = [
        { label: 'Total Orders', val: orders.length, sub: 'All time', color: C.dark, bg: C.white },
        { label: 'Revenue', val: `₹${(totalRevenue / 1000).toFixed(1)}k`, sub: 'Paid orders', color: C.green, bg: C.greenBg },
        { label: 'Pending', val: orders.filter(o => o.status === 'Pending').length, sub: 'Awaiting action', color: C.amber, bg: C.amberBg },
        { label: 'Shipped', val: orders.filter(o => o.status === 'Shipped').length, sub: 'In transit', color: C.purple, bg: C.purpleBg },
        { label: 'Cancelled', val: orders.filter(o => o.status === 'Cancelled' || o.status === 'Refunded').length, sub: 'Cancelled/refunded', color: C.red, bg: C.redBg },
    ];

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", padding: '32px 24px' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');
                *{box-sizing:border-box;margin:0;padding:0;}
                @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
                .trow{transition:background 0.13s,box-shadow 0.13s;cursor:pointer;}
                .trow:hover{background:#F3F7F5 !important;box-shadow:inset 3px 0 0 ${C.green};}
                .chip{transition:all 0.15s;cursor:pointer;}
                .chip:hover{border-color:${C.green} !important;color:${C.green} !important;}
                .search-inp{background:${C.white};border:1.5px solid ${C.borderInput};border-radius:9px;padding:8px 14px 8px 36px;font-family:'Outfit',sans-serif;font-size:12.5px;color:${C.dark};outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
                .search-inp:focus{border-color:${C.green};box-shadow:0 0 0 3px rgba(42,99,68,0.08);}
                .search-inp::placeholder{color:#B8B4AD;}
                .drawer-scroll::-webkit-scrollbar{width:4px;}
                .drawer-scroll::-webkit-scrollbar-track{background:transparent;}
                .drawer-scroll::-webkit-scrollbar-thumb{background:#E0DDD6;border-radius:4px;}
                .stat-card{transition:transform 0.15s,box-shadow 0.15s;cursor:pointer;}
                .stat-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.08);}
                .orders-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
                @media (min-width: 640px) { .orders-stats-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (min-width: 1024px) { .orders-stats-grid { grid-template-columns: repeat(5, 1fr); } }
            `}</style>

            {selectedOrder && (
                <OrderDrawer order={selectedOrder} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
            )}

            <div style={{ maxWidth: 1060, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.4s ease both' }}>
                    <div>
                        <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Store / Orders</div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: C.dark, letterSpacing: '-0.02em' }}>Orders</h1>
                        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
                            {orders.filter(o => o.status === 'Pending').length} pending · {orders.filter(o => o.status === 'Shipped').length} in transit · {orders.length} total
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 36, background: C.sand, border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: C.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                            {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="orders-stats-grid" style={{ animation: 'fadeUp 0.4s ease both 0.06s' }}>
                    {stats.map(s => (
                        <div key={s.label} className="stat-card" onClick={() => { if (s.label !== 'Total Orders' && s.label !== 'Revenue') setFilterStatus(s.label as OrderStatus); else setFilterStatus('All'); }}
                            style={{ background: s.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{s.label}</div>
                            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 1, opacity: 0.7 }}>{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Filter bar */}
                <div className="flex flex-col md:flex-row gap-3" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, alignItems: 'center', animation: 'fadeUp 0.4s ease both 0.1s', width: '100%' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', width: '100%' }} className="md:flex-1">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8B4AD" strokeWidth="2"
                            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input className="search-inp" style={{ width: '100%' }} placeholder="Search order ID, customer name, email…" value={search} onChange={e => setSearch(e.target.value)} />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 14, lineHeight: 1 }}>×</button>
                        )}
                    </div>

                    {/* Status chips */}
                    <div style={{ display: 'flex', gap: 5, width: '100%' }} className="md:w-auto overflow-x-auto pb-1 md:pb-0 scroll-area">
                        <button className="chip" onClick={() => setFilterStatus('All')}
                            style={{ padding: '5px 11px', borderRadius: 20, fontSize: 10.5, fontWeight: 500, border: `1.5px solid ${filterStatus === 'All' ? C.green : C.border}`, background: filterStatus === 'All' ? C.greenBg : C.white, color: filterStatus === 'All' ? C.green : C.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
                            All
                        </button>
                        {ALL_STATUSES.map(f => {
                            const sc = STATUS_CONFIG[f];
                            const active = filterStatus === f;
                            return (
                                <button key={f} className="chip" onClick={() => setFilterStatus(f)}
                                    style={{ padding: '5px 11px', borderRadius: 20, fontSize: 10.5, fontWeight: 500, border: `1.5px solid ${active ? sc.border : C.border}`, background: active ? sc.bg : C.white, color: active ? sc.color : C.textMuted, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                    {f}
                                </button>
                            );
                        })}
                    </div>

                    {/* Payment filter */}
                    <div style={{ position: 'relative', width: '100%' }} className="md:w-auto">
                        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value as PaymentStatus | 'All')}
                            style={{ width: '100%', padding: '7px 28px 7px 12px', background: C.white, border: `1.5px solid ${C.borderInput}`, borderRadius: 8, fontSize: 12, color: C.dark, outline: 'none', fontFamily: 'inherit', appearance: 'none', cursor: 'pointer' }}>
                            <option value="All">All Payments</option>
                            {(['Paid', 'Pending', 'Failed', 'Refunded'] as PaymentStatus[]).map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.5"
                            style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', animation: 'fadeUp 0.4s ease both 0.14s' }}>
                    <div className="scroll-area" style={{ overflowX: 'auto' }}>
                        <div style={{ minWidth: 900 }}>
                            {/* Table header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '160px 1.8fr 1fr 90px 90px 120px 36px', padding: '10px 20px', background: '#FAFAF8', borderBottom: `1px solid #F0ECE6` }}>
                                {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', ''].map(h => (
                                    <div key={h} style={{ fontSize: 9.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                                ))}
                            </div>
                            {isLoading ? (
                                <div style={{ padding: '52px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 12, color: C.textMuted }}>Loading orders...</div>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: '52px 20px', textAlign: 'center' }}>
                                    <div style={{ width: 52, height: 52, borderRadius: 16, background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.6"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 4 }}>No orders found</div>
                                    <div style={{ fontSize: 12, color: C.textMuted }}>Try a different search or filter</div>
                                </div>
                            ) : filtered.map((order, i) => {
                                const itemSummary = order.items.length === 1
                                    ? order.items[0].name
                                    : `${order.items[0].name} +${order.items.length - 1} more`;

                                return (
                                    <div key={order._id} className="trow"
                                        onClick={() => setSelected(order._id)}
                                        style={{ display: 'grid', gridTemplateColumns: '160px 1.8fr 1fr 90px 90px 120px 36px', padding: '13px 20px', borderBottom: i < filtered.length - 1 ? `1px solid #F6F4F0` : 'none', alignItems: 'center', background: selected === order._id ? '#F0F7F3' : C.white }}>

                                        {/* Order ID */}
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, fontFamily: 'monospace', letterSpacing: '0.03em' }}>{order.id}</div>
                                            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{order.createdAt.split(' ')[0]}</div>
                                        </div>

                                        {/* Customer */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.greenBg, border: `1.5px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C.green, flexShrink: 0 }}>
                                                {order.customer.name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.dark }}>{order.customer.name}</div>
                                                <div style={{ fontSize: 10.5, color: C.textMuted }}>{order.city}</div>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div>
                                            <div style={{ fontSize: 12, color: C.dark, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{itemSummary}</div>
                                            <div style={{ fontSize: 10.5, color: C.textMuted }}>{order.items.reduce((s, it) => s + it.qty, 0)} unit{order.items.reduce((s, it) => s + it.qty, 0) > 1 ? 's' : ''}</div>
                                        </div>

                                        {/* Total */}
                                        <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>₹{order.total.toLocaleString()}</div>

                                        {/* Payment */}
                                        <div><PayBadge status={order.payment} /></div>

                                        {/* Status */}
                                        <div><StatusBadge status={order.status} /></div>

                                        {/* Arrow */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: C.textMuted }}>
                    <span>Showing {filtered.length} of {orders.length} orders</span>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ marginRight: 4 }}>Page</span>
                        <button style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px solid ${C.green}`, background: C.greenBg, fontSize: 11.5, fontWeight: 600, color: C.green, cursor: 'pointer', fontFamily: 'inherit' }}>1</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
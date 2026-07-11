import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import Sidebar from './sidebar';
import { fetchAnalyticsStats, fetchRevenueCharts, exportReport } from '../../../services/dashboard/dashboardService';
import { fetchNotifications, markNotificationsRead } from '../../../services/notification/notificationService';
import { getAdminProfile } from '../../../services/auth/authService';
import { useConfirm, useToast } from '../../../context/UIContext';

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

type ExpandableNavKey = 'admins' | 'users' | 'categories' | 'products' | 'orders';
type NavItemId =
    | 'dashboard' | 'admins' | 'users' | 'categories' | 'products'
    | 'orders' | 'settings' | 'add-admin' | 'view-admins' | 'all-users'
    | 'active-users' | 'main-categories' | 'sub-categories' | 'extra-categories'
    | 'all-products' | 'add-product' | 'all-orders' | 'pending-orders' | 'shipped-orders';

type RecentOrderStatus = 'Shipped' | 'Processing' | 'Delivered' | 'Pending';
type RecentOrder = {
    id: string; product: string; customer: string; amount: string;
    status: RecentOrderStatus; time: string; avatar: string;
};

const RECENT_ORDERS: RecentOrder[] = [
    { id: '#8821', product: 'Premium Backpack', customer: 'Sophia L.', amount: '$129', status: 'Shipped', time: '2m ago', avatar: 'SL' },
    { id: '#8820', product: 'Smart Watch X2', customer: 'James R.', amount: '$349', status: 'Processing', time: '14m ago', avatar: 'JR' },
    { id: '#8819', product: 'Cotton T-Shirt', customer: 'Priya S.', amount: '$39', status: 'Delivered', time: '1h ago', avatar: 'PS' },
    { id: '#8818', product: 'Coffee Mug Set', customer: 'Marcus T.', amount: '$58', status: 'Pending', time: '2h ago', avatar: 'MT' },
    { id: '#8817', product: 'Wireless Headphones', customer: 'Elena K.', amount: '$219', status: 'Shipped', time: '3h ago', avatar: 'EK' },
    { id: '#8816', product: 'Yoga Mat Pro', customer: 'Arjun V.', amount: '$89', status: 'Delivered', time: '5h ago', avatar: 'AV' },
];

const TOP_PRODUCTS = [
    { name: 'Smart Watch X2', units: 247, rev: '$86K', pct: 88 },
    { name: 'Premium Backpack', units: 198, rev: '$25K', pct: 70 },
    { name: 'Wireless Headphones', units: 174, rev: '$38K', pct: 62 },
    { name: 'Cotton T-Shirt', units: 139, rev: '$5K', pct: 49 },
    { name: 'Coffee Mug Set', units: 112, rev: '$6.5K', pct: 40 },
];

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
    Shipped: { bg: '#EAF4EE', color: '#2A6344', dot: '#2A6344' },
    Processing: { bg: '#FEF3E2', color: '#A05A10', dot: '#F59E0B' },
    Delivered: { bg: '#E8F0FE', color: '#1A56DB', dot: '#1A56DB' },
    Pending: { bg: '#FFEBEE', color: '#C62828', dot: '#C62828' },
};

const AVATAR_COLORS = [
    { bg: '#EAF4EE', color: '#2A6344' }, { bg: '#E8F0FE', color: '#1A56DB' },
    { bg: '#FEF3E2', color: '#A05A10' }, { bg: '#F3E8FF', color: '#7C3AED' },
    { bg: '#FFEBEE', color: '#C62828' }, { bg: '#E0F7FA', color: '#00838F' },
];

const WEEKLY = [55, 72, 48, 88, 65, 124, 78];
const WEEKLY_PREV = [48, 61, 55, 74, 58, 97, 70];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHLY = [42, 58, 51, 67, 73, 62, 80, 75, 88, 71, 90, 84];
const MONTHLY_PREV = [38, 50, 46, 60, 65, 58, 72, 68, 80, 64, 82, 77];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Sparkline data for revenue card — 6-month daily-ish points
const SPARK_POINTS = [38, 41, 37, 45, 42, 48, 44, 52, 49, 55, 51, 58, 54, 61, 57, 63, 60, 67, 63, 70, 66, 72, 69, 76, 72, 79, 75, 82, 79, 84];
const SPARK_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

type AnimatedNumberProps = { value: number; format?: (value: number) => string; duration?: number; };
function AnimatedNumber({ value, format = v => Math.round(v).toLocaleString(), duration = 600 }: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const previousValue = useRef(value);
    useEffect(() => {
        const startValue = previousValue.current;
        const endValue = value;
        if (startValue === endValue) { setDisplayValue(endValue); previousValue.current = endValue; return; }
        let raf = 0;
        const startTime = performance.now();
        const step = (time: number) => {
            const elapsed = Math.min(time - startTime, duration);
            const progress = elapsed / duration;
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(startValue + (endValue - startValue) * eased);
            if (elapsed < duration) raf = requestAnimationFrame(step);
            else { setDisplayValue(endValue); previousValue.current = endValue; }
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return <>{format(displayValue)}</>;
}

// Interactive sparkline for revenue card
function RevenueSparkline({ sparklinePoints, liveRevenue }: { sparklinePoints?: number[]; liveRevenue: number }) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const W = 200, H = 56;
    
    // If no points, show a flat line of 30 zeros
    const pts = sparklinePoints && sparklinePoints.length > 0 ? sparklinePoints : Array(30).fill(0);
    const minV = Math.min(...pts);
    const maxV = Math.max(...pts);
    const diff = maxV - minV;
    const toX = (i: number) => (i / (pts.length - 1)) * W;
    const toY = (v: number) => diff > 0 ? H - ((v - minV) / diff) * H : H - 2;

    const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const area = path + ` L${W},${H} L0,${H} Z`;

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const ratio = x / rect.width;
        const idx = Math.round(ratio * (pts.length - 1));
        setHoverIdx(Math.max(0, Math.min(pts.length - 1, idx)));
    }, [pts.length]);

    const hoverX = hoverIdx !== null ? toX(hoverIdx) : null;
    const hoverY = hoverIdx !== null ? toY(pts[hoverIdx]) : null;
    const hoverVal = hoverIdx !== null ? pts[hoverIdx] : null;
    // month label — map index to approximate month
    const monthIdx = hoverIdx !== null ? Math.min(5, Math.floor((hoverIdx / pts.length) * 6)) : null;
    const hoverMonth = monthIdx !== null ? SPARK_MONTHS[monthIdx] : null;

    return (
        <div style={{ position: 'relative', marginBottom: 2 }}>
            {/* Tooltip */}
            {hoverIdx !== null && hoverVal !== null && hoverX !== null && (
                <div style={{
                    position: 'absolute',
                    top: -28,
                    left: `${(hoverX / W) * 100}%`,
                    transform: 'translateX(-50%)',
                    background: COLORS.dark,
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 500,
                    padding: '3px 7px',
                    borderRadius: 5,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 10,
                    fontFamily: "'Outfit', sans-serif",
                }}>
                    {hoverMonth} · {hoverVal >= 1000 ? `₹${(hoverVal / 1000).toFixed(1)}K` : `₹${Math.round(hoverVal).toLocaleString()}`}
                </div>
            )}
            <svg
                ref={svgRef}
                width="100%"
                height={H}
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: 'crosshair', display: 'block' }}
            >
                <defs>
                    <linearGradient id="sparkG2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2A6344" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#2A6344" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={area} fill="url(#sparkG2)" />
                <path d={path} fill="none" stroke="#2A6344" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {hoverIdx !== null && hoverX !== null && hoverY !== null && (
                    <>
                        <line x1={hoverX} y1={0} x2={hoverX} y2={H} stroke="#2A6344" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5" />
                        <circle cx={hoverX} cy={hoverY} r="3.5" fill="#fff" stroke="#2A6344" strokeWidth="1.5" />
                    </>
                )}
            </svg>
        </div>
    );
}

export default function ArovaDashboard() {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const toast = useToast();

    const handleLogout = async () => {
        const ok = await confirm({
            title: "Sign Out",
            message: "Are you sure you want to sign out of the admin panel?",
            confirmText: "Sign Out",
            cancelText: "Cancel",
            isDanger: true
        });
        if (ok) {
            localStorage.removeItem("adminAuthToken");
            window.location.href = "/login";
        }
    };
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const isSm = isMobile;
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [hoveredStat, setHoveredStat] = useState<number | null>(null);
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
    
    // Date Filters
    const [dateRange, setDateRange] = useState<'Today' | 'This Week' | 'This Month' | 'This Year' | 'Custom'>('This Week');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [rangeSelectorOpen, setRangeSelectorOpen] = useState(false);
    
    // Exports
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState('Orders');
    const [exportFormat, setExportFormat] = useState('CSV');
    const [exporting, setExporting] = useState(false);

    // Profile Dropdown
    const [profileOpen, setProfileOpen] = useState(false);
    const [adminProfile, setAdminProfile] = useState<any>(null);
    const profileRef = useRef<HTMLDivElement | null>(null);

    // Notifications
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef<HTMLDivElement | null>(null);

    // Chart Data from DB
    const [chartData, setChartData] = useState<number[]>([]);
    const [chartLabels, setChartLabels] = useState<string[]>([]);
    const [thisPeriodTotal, setThisPeriodTotal] = useState(0);
    const [lastPeriodTotal, setLastPeriodTotal] = useState(0);

    const [live, setLive] = useState({
        admins: 0,
        users: 0,
        products: 0,
        categories: 0,
        revenue: 0,
        earnings: 0,
        pending: 0,
        processing: 0,
        awaitingPayment: 0,
        onHold: 0,
        fulfillmentRate: 100,
        liveVisitors: 1,
        statusDistribution: { Delivered: 0, Shipped: 0, Processing: 0, Pending: 0 },
        topProducts: [] as any[],
        recentOrders: [] as any[],
        ytdProgress: 0,
        revenueGrowth: 0,
        sparklinePoints: [] as number[]
    });
    
    const [statsLoaded, setStatsLoaded] = useState(false);
    const [newOrderPing, setNewOrderPing] = useState(false);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setMobileSidebar(false);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Load admin profile
    useEffect(() => {
        getAdminProfile().then(res => {
            if (res?.status === 200 && res.result) {
                setAdminProfile(res.result);
            }
        });
    }, []);

    // Load dynamic statistics
    const loadStats = useCallback(() => {
        fetchAnalyticsStats(dateRange, customStart, customEnd).then(res => {
            if (res?.status === 200 && res.result) {
                // If order count increased, trigger order ping sound/visual
                if (statsLoaded && res.result.pending > live.pending) {
                    setNewOrderPing(true);
                    setTimeout(() => setNewOrderPing(false), 8000);
                }
                setLive(res.result);
                setStatsLoaded(true);
            }
        });
    }, [dateRange, customStart, customEnd, statsLoaded, live.pending]);

    useEffect(() => {
        loadStats();
        const iv = setInterval(loadStats, 30000);
        return () => clearInterval(iv);
    }, [loadStats]);

    // Load chart data
    useEffect(() => {
        fetchRevenueCharts(chartView).then(res => {
            if (res?.status === 200 && res.result) {
                setChartData(res.result.data || []);
                setChartLabels(res.result.labels || []);
                setThisPeriodTotal(res.result.thisPeriodTotal || 0);
                setLastPeriodTotal(res.result.lastPeriodTotal || 0);
            }
        });
    }, [chartView, dateRange]);

    // Load notifications
    const loadNotifs = async () => {
        const res = await fetchNotifications();
        if (res?.status === 200 && res.result) {
            setNotifications(res.result);
            setUnreadCount(res.result.filter((n: any) => !n.read).length);
        }
    };

    useEffect(() => {
        loadNotifs();
        const iv = setInterval(loadNotifs, 15000);
        return () => clearInterval(iv);
    }, []);

    const handleMarkAllRead = async () => {
        const res = await markNotificationsRead();
        if (res?.status === 200) {
            loadNotifs();
            toast.success("All notifications marked as read.");
        }
    };

    const handleMarkSingleRead = async (id: string) => {
        const res = await markNotificationsRead(id);
        if (res?.status === 200) {
            loadNotifs();
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportReport(exportType, exportFormat.toLowerCase());
            toast.success(`${exportType} report exported successfully!`);
            setExportModalOpen(false);
        } catch (error) {
            toast.error("Export failed.");
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const location = useLocation();
    const isDashboardHome = location.pathname === '/dashboard';

    const effectiveChartData = chartData.length > 0 ? chartData : (chartView === 'weekly' ? [0,0,0,0,0,0,0] : [0,0,0,0,0,0,0,0,0,0,0,0]);
    const effectiveLabels = chartLabels.length > 0 ? chartLabels : (chartView === 'weekly' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    const maxVal = Math.max(...effectiveChartData, 1);

    const pendingTotal = live.pending + live.processing + live.awaitingPayment + live.onHold;
    const processingPct = pendingTotal > 0 ? Math.round((live.processing / pendingTotal) * 100) : 0;
    const awaitingPct = pendingTotal > 0 ? Math.round((live.awaitingPayment / pendingTotal) * 100) : 0;
    const onHoldPct = pendingTotal > 0 ? Math.round((live.onHold / pendingTotal) * 100) : 0;
    const processingCount = live.processing;
    const awaitingCount = live.awaitingPayment;
    const onHoldCount = live.onHold;

    return (
        <div style={{ height: '100vh', display: 'flex', background: COLORS.bg, fontFamily: "'Outfit', sans-serif", overflow: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
                @keyframes ping { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2.2);opacity:0} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                .sidebar-nav-item { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; cursor:pointer; color:#7A7570; font-size:13px; font-weight:400; transition:all 0.18s; white-space:nowrap; overflow:hidden; position:relative; user-select:none; }
                .sidebar-nav-item:hover { background:#F0EDE8; color:#1A1A1A; }
                .sidebar-nav-item.active { background:#1A1A1A; color:#fff; }
                .sidebar-nav-item.active:hover { background:#2A2A2A; }
                .sidebar-sub-item { display:flex; align-items:center; gap:8px; padding:6px 10px 6px 34px; border-radius:7px; cursor:pointer; color:#9A968F; font-size:12px; font-weight:400; transition:all 0.16s; white-space:nowrap; overflow:hidden; }
                .sidebar-sub-item:hover { background:#F6F4F0; color:#1A1A1A; }
                .sidebar-sub-item.active { color:#2A6344; background:#EAF4EE; font-weight:500; }
                .icon-btn { width:34px; height:34px; border-radius:8px; border:1.5px solid #E8E4DE; background:#FFFFFF; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s; color:#4A4540; flex-shrink:0; }
                .icon-btn:hover { border-color:#2A6344; background:#EAF4EE; color:#2A6344; }
                .card { background:#FFFFFF; border:1px solid #E8E4DE; border-radius:14px; }
                .table-row { transition:background 0.15s; cursor:default; }
                .table-row:hover { background:#F8F6F2 !important; }
                .stat-card { animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both; transition: transform 0.2s, box-shadow 0.22s; }
                .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.07) !important; }
                .bar-item { transition:all 0.18s; cursor:default; }
                .bar-item:hover .bar-fill-cur { opacity:1 !important; }
                .bar-item:hover .bar-label { color:#1A1A1A !important; }
                .notif-dropdown { animation: slideDown 0.2s cubic-bezier(0.4,0,0.2,1); }
                .search-box { background:#FAFAF8; border:1.5px solid #E8E4DE; border-radius:9px; padding:7px 14px 7px 34px; font-family:'Outfit',sans-serif; font-size:12.5px; color:#1A1A1A; outline:none; transition:border-color 0.2s, box-shadow 0.2s; width:210px; caret-color:#2A6344; }
                .search-box::placeholder { color:#B8B4AD; }
                .search-box:focus { border-color:#2A6344; box-shadow:0 0 0 3px rgba(42,99,68,0.08); background:#fff; }
                .main-fade { animation: fadeIn 0.35s ease both; }
                .scroll-area::-webkit-scrollbar { width:4px; }
                .scroll-area::-webkit-scrollbar-track { background:transparent; }
                .scroll-area::-webkit-scrollbar-thumb { background:#E0DDD6; border-radius:4px; }
                .scroll-area::-webkit-scrollbar-thumb:hover { background:#C4C0B8; }
                .section-label { font-size:9.5px; font-weight:600; letter-spacing:0.13em; text-transform:uppercase; color:#C4C0B8; padding:12px 10px 4px; }
                .tab-pill { padding:5px 14px; border-radius:20px; font-size:11.5px; font-weight:500; cursor:pointer; transition:all 0.18s; border:none; font-family:'Outfit',sans-serif; }
                .logout-btn { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:8px; cursor:pointer; color:#C62828; font-size:12.5px; font-weight:500; transition:all 0.18s; background:none; border:none; font-family:'Outfit',sans-serif; width:100%; }
                .logout-btn:hover { background:#FFEBEE; }
                .product-row { transition: background 0.14s; border-radius: 8px; padding: 6px 8px; margin: 0 -8px; cursor: default; }
                .product-row:hover { background: #F6F4F0; }
                .product-bar-fill { transition: width 0.7s ease, background 0.2s; }
                
                .stats-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }
                @media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
                
                .earnings-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }
                @media (min-width: 768px) { .earnings-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .earnings-grid { grid-template-columns: repeat(3, 1fr); } }
                
                .chart-products-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 18px; }
                @media (min-width: 1024px) { .chart-products-grid { grid-template-columns: 1.6fr 1fr; } }
            `}</style>


            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(v => !v)}
                isMobile={isMobile}
                mobileOpen={mobileSidebar}
                onMobileClose={() => setMobileSidebar(false)}
            />

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                {/* Header */}
                <div style={{ height: 58, background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', flexShrink: 0, gap: 14, position: 'relative', zIndex: 95 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button className="icon-btn" onClick={() => isMobile ? setMobileSidebar(v => !v) : setCollapsed(v => !v)} title="Toggle sidebar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        </button>
                        {!isMobile && (
                            <div style={{ position: 'relative' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B8B4AD" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                <input className="search-box" type="text" placeholder="Search anything..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {newOrderPing && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.greenBg, border: `1px solid ${COLORS.greenBorder}`, borderRadius: 20, padding: '4px 10px', animation: 'fadeIn 0.3s ease', fontSize: 11, color: COLORS.green, fontWeight: 500 }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.green, position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', background: COLORS.green, animation: 'ping 1s infinite', opacity: 0.5 }} />
                                </div>
                                New order!
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: COLORS.greenBg, border: `1px solid ${COLORS.greenBorder}`, borderRadius: 20, padding: '4px 10px', fontSize: 10, color: COLORS.green, fontWeight: 600, letterSpacing: '0.08em' }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.green, animation: 'pulse 1.5s infinite' }} />
                            LIVE
                        </div>
                        <div style={{ position: 'relative' }} ref={notifRef}>
                            <button className="icon-btn" onClick={() => setNotifOpen(v => !v)} style={{ position: 'relative' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                                {unreadCount > 0 && (
                                    <div style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#E53E3E', border: '1.5px solid #fff' }} />
                                )}
                            </button>
                            {notifOpen && (
                                <div className="notif-dropdown" style={{ position: 'absolute', top: 42, right: 0, width: 270, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                                    <div style={{ padding: '12px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Notifications ({unreadCount})</span>
                                        <span onClick={handleMarkAllRead} style={{ fontSize: 10.5, color: COLORS.green, cursor: 'pointer', fontWeight: 500 }}>Mark all read</span>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: COLORS.textMuted }}>No notifications.</div>
                                    ) : notifications.slice(0, 5).map((n) => (
                                        <div key={n._id} onClick={() => handleMarkSingleRead(n._id)} style={{ padding: '10px 16px', borderTop: `1px solid #F6F4F0`, cursor: 'pointer', transition: 'background 0.14s', display: 'flex', gap: 10, alignItems: 'flex-start', background: n.read ? '' : 'rgba(42,99,68,0.03)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F8F6F2'}
                                            onMouseLeave={e => e.currentTarget.style.background = n.read ? '' : 'rgba(42,99,68,0.03)'}>
                                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.type === 'warn' ? '#F59E0B' : n.type === 'order' ? COLORS.green : n.type === 'admin' ? COLORS.blue : '#B0ACA4', marginTop: 3, flexShrink: 0 }} />
                                            <div><div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.4, fontWeight: n.read ? 400 : 500 }}>{n.message}</div><div style={{ fontSize: 10.5, color: COLORS.textMuted, marginTop: 2 }}>{n.time || new Date(n.createAt).toLocaleTimeString()}</div></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div ref={profileRef} style={{ position: 'relative' }}>
                            <div onClick={() => setProfileOpen(v => !v)} style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'box-shadow 0.18s' }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(42,99,68,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                            {profileOpen && (
                                <div style={{ position: 'absolute', top: 42, right: 0, width: 170, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden', padding: 6 }}>
                                    <button onClick={() => { setProfileOpen(false); navigate('/dashboard/settings?tab=profile'); }} className="sidebar-sub-item" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', padding: '8px 10px', color: COLORS.textSub }}>My Profile</button>
                                    <button onClick={() => { setProfileOpen(false); navigate('/dashboard/settings?tab=general'); }} className="sidebar-sub-item" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', padding: '8px 10px', color: COLORS.textSub }}>Settings</button>
                                    <button onClick={() => { setProfileOpen(false); navigate('/dashboard/settings?tab=security'); }} className="sidebar-sub-item" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', padding: '8px 10px', color: COLORS.textSub }}>Change Password</button>
                                    <div style={{ height: 1, background: COLORS.border, margin: '4px 0' }} />
                                    <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="logout-btn" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', padding: '8px 10px' }}>Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isMobile ? '20px 14px' : '26px 26px' }}>
                    {!isDashboardHome ? <Outlet /> : <>
                    {/* Page header */}
                    <div style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, animation: 'fadeUp 0.4s ease both', position: 'relative', zIndex: 50 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                                <svg width="52" height="52" viewBox="0 0 52 52" style={{ overflow: 'visible' }}>
                                    <defs>
                                        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FFF176" /><stop offset="40%" stopColor="#FFD600" /><stop offset="100%" stopColor="#FF8F00" /></radialGradient>
                                        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FFD600" stopOpacity="0.4" /><stop offset="100%" stopColor="#FF6F00" stopOpacity="0" /></radialGradient>
                                        <filter id="softGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                                    </defs>
                                    <circle cx="26" cy="26" r="23" fill="url(#glowGrad)" />
                                    <g>{Array.from({ length: 8 }).map((_, i) => <rect key={i} x="24.5" y="2" width="3" height="9" rx="1.5" fill="#FFB300" opacity="0.6" style={{ transformOrigin: '26px 26px', transform: `rotate(${i * 45}deg)` }} />)}</g>
                                    <g>{Array.from({ length: 8 }).map((_, i) => <rect key={i} x="25" y="8" width="2" height="7" rx="1" fill="#FFF176" opacity="0.35" style={{ transformOrigin: '26px 26px', transform: `rotate(${i * 45 + 22.5}deg)` }} />)}</g>
                                    <circle cx="26" cy="26" r="13" fill="url(#coreGrad)" filter="url(#softGlow)" />
                                    <ellipse cx="22" cy="22" rx="4" ry="3" fill="#FFF9C4" opacity="0.45" />
                                    <circle cx="26" cy="26" r="13" fill="none" stroke="#FF6F00" strokeWidth="1.5" opacity="0.25" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 10.5, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 5 }}>Overview</div>
                                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: isMobile ? 22 : 26, fontWeight: 500, color: COLORS.dark, letterSpacing: '-0.02em' }}>
                                    Good morning, {adminProfile ? adminProfile.first_name : 'Admin'} ✦
                                </h1>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setRangeSelectorOpen(v => !v)} className="icon-btn" style={{ width: 'auto', padding: '0 12px', gap: 6, display: 'flex', alignItems: 'center', fontSize: 11.5, color: '#4A4540' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    {dateRange === 'Custom' ? `${customStart || 'Start'} to ${customEnd || 'End'}` : dateRange}
                                </button>
                                {rangeSelectorOpen && (
                                    <div style={{ position: 'absolute', top: 38, right: 0, width: 220, background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.1)', zIndex: 100, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {(['Today', 'This Week', 'This Month', 'This Year', 'Custom'] as const).map(r => (
                                            <button key={r} onClick={() => { setDateRange(r); if (r !== 'Custom') setRangeSelectorOpen(false); }} style={{ width: '100%', border: 'none', background: dateRange === r ? COLORS.greenBg : 'none', color: dateRange === r ? COLORS.green : COLORS.textSub, textAlign: 'left', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: dateRange === r ? 600 : 400 }}>{r}</button>
                                        ))}
                                        {dateRange === 'Custom' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, paddingTop: 4, borderTop: `1px solid ${COLORS.border}` }}>
                                                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ padding: 4, borderRadius: 4, border: `1px solid ${COLORS.border}`, fontSize: 11 }} />
                                                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ padding: 4, borderRadius: 4, border: `1px solid ${COLORS.border}`, fontSize: 11 }} />
                                                <button onClick={() => setRangeSelectorOpen(false)} style={{ width: '100%', padding: '6px', fontSize: 11, border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', background: COLORS.dark }}>Apply</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setExportModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px', height: 34, background: COLORS.dark, border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 500, color: '#fff', cursor: 'pointer', transition: 'background 0.18s, transform 0.18s' }} onMouseEnter={e => { e.currentTarget.style.background = '#2A2A2A'; e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseLeave={e => { e.currentTarget.style.background = COLORS.dark; e.currentTarget.style.transform = '' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                {!isMobile && 'Export'}
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards Row */}
                    <div className="stats-grid">
                        {[
                            { label: 'Total Admins', value: live.admins, format: (v: number) => Math.round(v).toString(), change: 'admins', up: true, sub: 'registered admins', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, accent: COLORS.green, accentBg: COLORS.greenBg, accentBorder: COLORS.greenBorder },
                            { label: 'Total Users', value: live.users, format: (v: number) => Math.round(v).toLocaleString(), change: 'users', up: true, sub: 'registered users', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={COLORS.blue} strokeWidth="1.7"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>, accent: COLORS.blue, accentBg: COLORS.blueBg, accentBorder: '#BFCEF8' },
                            { label: 'Products', value: live.products, format: (v: number) => Math.round(v).toString(), change: 'in catalog', up: true, sub: 'in catalog', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="1.7"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>, accent: COLORS.amber, accentBg: COLORS.amberBg, accentBorder: '#F5D99A' },
                            { label: 'Categories', value: live.categories, format: (v: number) => Math.round(v).toString(), change: 'cat + sub + extra', up: true, sub: 'main + sub + extra', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.7"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>, accent: '#7C3AED', accentBg: '#F3E8FF', accentBorder: '#DDD6FE' }
                        ].map((s, i) => (
                            <div key={s.label} className="stat-card card" style={{ padding: '16px 16px 14px', animationDelay: `${i * 0.08}s`, boxShadow: hoveredStat === i ? '0 12px 28px rgba(0,0,0,0.08)' : 'none' }} onMouseEnter={() => setHoveredStat(i)} onMouseLeave={() => setHoveredStat(null)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div style={{ fontSize: 10.5, color: COLORS.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.3 }}>{s.label}</div>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: s.accentBg, border: `1px solid ${s.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                                </div>
                                <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 600, color: COLORS.dark, letterSpacing: '-0.025em', marginBottom: 7, lineHeight: 1 }}><AnimatedNumber value={s.value} format={s.format} /></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 20, ...(s.up ? { color: COLORS.green, background: COLORS.greenBg } : { color: COLORS.red, background: COLORS.redBg }) }}>{s.up ? '↑' : '↓'} {s.change}</span>
                                    <span style={{ fontSize: 10, color: '#C4C0B8' }}>{s.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Earnings + Pending + Revenue Row */}
                    <div className="earnings-grid">
                        {/* Total Earnings */}
                        <div className="card" style={{ padding: '20px', background: '#1A1A1A', borderColor: '#2A2A2A', animation: 'fadeUp 0.5s ease both 0.2s', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(42,99,68,0.15)' }} />
                            <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(72,168,122,0.08)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Total Earnings</div>
                                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(42,99,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={COLORS.greenLight} strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                                    </div>
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}><AnimatedNumber value={live.earnings} format={v => `₹${Math.round(v).toLocaleString()}`} /></div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Lifetime platform earnings</div>
                                <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${live.ytdProgress}%`, background: 'linear-gradient(90deg,#2A6344,#48A87A)', borderRadius: 3 }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}><span>YTD progress</span><span>{live.ytdProgress}%</span></div>
                            </div>
                        </div>

                        {/* Pending Orders — IMPROVED */}
                        <div className="card" style={{ padding: '20px', animation: 'fadeUp 0.5s ease both 0.28s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <div style={{ fontSize: 10.5, color: COLORS.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Pending Orders</div>
                                <div style={{ padding: '4px 10px', background: COLORS.amberBg, border: `1px solid #F5D99A`, borderRadius: 20, fontSize: 10.5, color: COLORS.amber, fontWeight: 500 }}>Needs action</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 16 }}>
                                <div style={{ fontSize: 32, fontWeight: 600, color: COLORS.dark, letterSpacing: '-0.03em', lineHeight: 1 }}>
                                    <AnimatedNumber value={live.pending} format={v => Math.round(v).toString()} />
                                </div>
                                <div style={{ fontSize: 11, color: COLORS.textMuted, paddingBottom: 4 }}>orders awaiting action</div>
                            </div>
                            {/* Segmented progress bar */}
                            <div style={{ display: 'flex', gap: 2, height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                                <div style={{ width: `${processingPct}%`, background: '#F59E0B', transition: 'width 0.6s ease' }} />
                                <div style={{ width: `${awaitingPct}%`, background: COLORS.red, transition: 'width 0.6s ease' }} />
                                <div style={{ width: `${onHoldPct}%`, background: '#C4C0B8', transition: 'width 0.6s ease' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                {[
                                    { label: 'Processing', count: processingCount, pct: processingPct, color: '#F59E0B' },
                                    { label: 'Awaiting payment', count: awaitingCount, pct: awaitingPct, color: COLORS.red },
                                    { label: 'On hold', count: onHoldCount, pct: onHoldPct, color: '#B0ACA4' },
                                ].map(row => (
                                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 11.5, color: COLORS.textSub, flex: 1 }}>{row.label}</span>
                                        <span style={{ fontSize: 10.5, color: COLORS.textMuted }}>{row.pct}%</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.dark, minWidth: 18, textAlign: 'right' }}>{row.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Revenue — IMPROVED interactive sparkline */}
                        <div className="card" style={{ padding: '20px', animation: 'fadeUp 0.5s ease both 0.34s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                                <div>
                                    <div style={{ fontSize: 10.5, color: COLORS.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Revenue</div>
                                    <div style={{ fontSize: 28, fontWeight: 600, color: COLORS.dark, letterSpacing: '-0.03em' }}>
                                        <AnimatedNumber value={live.revenue} format={v => v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${Math.round(v).toLocaleString()}`} />
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    color: live.revenueGrowth >= 0 ? COLORS.green : COLORS.red,
                                    background: live.revenueGrowth >= 0 ? COLORS.greenBg : COLORS.redBg,
                                    padding: '3px 8px',
                                    borderRadius: 20,
                                    marginTop: 2
                                }}>
                                    {live.revenueGrowth >= 0 ? '↑' : '↓'} {live.revenueGrowth >= 0 ? '+' : ''}{live.revenueGrowth}%
                                </span>
                            </div>
                            <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginBottom: 10 }}>vs last month · hover to explore</div>
                            <RevenueSparkline sparklinePoints={live.sparklinePoints} liveRevenue={live.revenue} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#C4C0B8', marginTop: 4 }}>
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Now</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart + Top Products */}
                    <div className="chart-products-grid">
                        {/* Sales Overview — IMPROVED with ghost bars + better tooltip */}
                        <div className="card" style={{ padding: '20px', animation: 'fadeUp 0.5s ease both 0.38s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                                <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>Sales Overview</div>
                                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>Revenue across time</div>
                                </div>
                                <div style={{ display: 'flex', background: '#F6F4F0', borderRadius: 20, padding: 3, gap: 2 }}>
                                    {(['weekly', 'monthly'] as const).map(v => (
                                        <button key={v} className="tab-pill" onClick={() => setChartView(v)} style={{ background: chartView === v ? COLORS.white : 'transparent', color: chartView === v ? COLORS.dark : COLORS.textMuted, boxShadow: chartView === v ? '0 1px 4px rgba(0,0,0,0.07)' : 'none' }}>
                                            {v.charAt(0).toUpperCase() + v.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: chartView === 'weekly' ? (isMobile ? 4 : 10) : (isMobile ? 2 : 6), height: 120, padding: '0 4px' }}>
                                {effectiveChartData.map((h, i) => {
                                    const isHovered = hoveredBar === i;
                                    const prevH = h * 0.85;
                                    const curH_px = (h / maxVal) * 100;
                                    const prevH_px = (prevH / maxVal) * 100;
                                    const tooltipVal = h >= 1000
                                        ? `₹${(h / 1000).toFixed(1)}K`
                                        : `₹${Math.round(h).toLocaleString()}`;
                                    return (
                                        <div key={i} className="bar-item" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
                                            onMouseEnter={() => setHoveredBar(i)}
                                            onMouseLeave={() => setHoveredBar(null)}>
                                            <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 100, gap: 2 }}>
                                                {/* Tooltip */}
                                                {isHovered && (
                                                    <div style={{ position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)', background: COLORS.dark, color: '#fff', fontSize: 9.5, padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap', zIndex: 2, pointerEvents: 'none' }}>
                                                        {tooltipVal}
                                                    </div>
                                                )}
                                                {/* Previous period ghost bar */}
                                                <div style={{ width: '40%', height: `${prevH_px}px`, background: isHovered ? '#D0CCC4' : '#E8E4DC', borderRadius: '3px 3px 0 0', transition: 'height 0.5s cubic-bezier(0.4,0,0.2,1), background 0.18s' }} />
                                                {/* Current period bar */}
                                                <div className="bar-fill-cur" style={{ width: '40%', height: `${curH_px}px`, background: isHovered ? COLORS.green : (i === 4 && chartView === 'weekly' ? COLORS.green : '#B8D4C3'), borderRadius: '3px 3px 0 0', opacity: isHovered ? 1 : 0.9, transition: 'height 0.5s cubic-bezier(0.4,0,0.2,1), background 0.18s, opacity 0.18s' }} />
                                            </div>
                                            <div className="bar-label" style={{ fontSize: 9, color: isHovered ? COLORS.dark : COLORS.textMuted, fontWeight: 500, transition: 'color 0.15s' }}>{effectiveLabels[i]}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: `1px solid #F0ECE6` }}>
                                {[
                                    { label: 'This period', val: thisPeriodTotal >= 1000 ? `₹${(thisPeriodTotal / 1000).toFixed(1)}K` : `₹${Math.round(thisPeriodTotal).toLocaleString()}`, col: COLORS.green },
                                    { label: 'Last period', val: lastPeriodTotal >= 1000 ? `₹${(lastPeriodTotal / 1000).toFixed(1)}K` : `₹${Math.round(lastPeriodTotal).toLocaleString()}`, col: '#D0CCC4' },
                                ].map(s => (
                                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: s.col }} />
                                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>{s.label}</span>
                                        <span style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.dark }}>{s.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Products — IMPROVED with hover + revenue */}
                        <div className="card" style={{ padding: '20px', animation: 'fadeUp 0.5s ease both 0.44s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.dark, marginBottom: 2 }}>Top Products</div>
                                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>By units sold</div>
                                </div>
                                <button onClick={() => navigate('/dashboard/products')} style={{ fontSize: 11, color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>View all →</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {live.topProducts.length === 0 ? (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 12, color: COLORS.textMuted }}>
                                        No top products found for this range.
                                    </div>
                                ) : live.topProducts.map((p, i) => (
                                    <div key={p.name} className="product-row"
                                        onMouseEnter={() => setHoveredProduct(i)}
                                        onMouseLeave={() => setHoveredProduct(null)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <div style={{ width: 18, height: 18, borderRadius: 5, background: i === 0 ? COLORS.greenBg : '#F6F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: i === 0 ? COLORS.green : COLORS.textMuted, flexShrink: 0 }}>#{i + 1}</div>
                                                <span style={{ fontSize: 12, fontWeight: i === 0 ? 600 : 400, color: COLORS.dark }}>{p.name}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 10.5, color: COLORS.textMuted }}>{p.units} units</div>
                                                {hoveredProduct === i && (
                                                    <div style={{ fontSize: 10, color: COLORS.green, fontWeight: 600, animation: 'fadeIn 0.15s ease' }}>{p.revenue}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ height: 4, background: '#F0EDE8', borderRadius: 3 }}>
                                            <div className="product-bar-fill" style={{ height: '100%', width: `${p.percentage}%`, background: hoveredProduct === i ? COLORS.green : (i === 0 ? COLORS.green : i === 1 ? '#6BAF8A' : '#C4D9CC'), borderRadius: 3 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Orders Table + Quick Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: isSm ? '1fr' : '1fr 260px', gap: isSm ? 10 : 16, marginBottom: 18 }}>
                        <div className="card" style={{ overflow: 'hidden', animation: 'fadeUp 0.5s ease both 0.48s' }}>
                            <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid #F6F4F0` }}>
                                <div>
                                    <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.dark }}>Recent Orders</div>
                                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Latest transactions</div>
                                </div>
                                <button onClick={() => navigate('/dashboard/orders')} style={{ fontSize: 11.5, color: COLORS.green, background: COLORS.greenBg, border: `1px solid ${COLORS.greenBorder}`, borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.18s' }} onMouseEnter={e => { e.currentTarget.style.background = '#D4EBDB' }} onMouseLeave={e => { e.currentTarget.style.background = COLORS.greenBg }}>View all</button>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <div style={{ minWidth: 520 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.4fr 1fr 0.7fr 0.85fr', padding: '9px 20px', background: '#FAFAF8', borderBottom: `1px solid #F0ECE6` }}>
                                        {['Order', 'Product', 'Customer', 'Amount', 'Status'].map(h => (
                                            <div key={h} style={{ fontSize: 9.5, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                                        ))}
                                    </div>
                                    {live.recentOrders.length === 0 ? (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 12, color: COLORS.textMuted }}>
                                            No recent orders found.
                                        </div>
                                    ) : live.recentOrders.map((o, i) => {
                                        const sc = STATUS_CONFIG[o.status] || { bg: '#FAFAF8', color: COLORS.textSub, dot: '#B8B4AD' };
                                        const ac = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                        return (
                                            <div key={o.id} className="table-row" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.4fr 1fr 0.7fr 0.85fr', padding: '11px 20px', borderBottom: i < live.recentOrders.length - 1 ? `1px solid #F6F4F0` : 'none', alignItems: 'center', background: hoveredRow === i ? '#FBFAF7' : '#fff' }}
                                                onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
                                                <div style={{ fontSize: 11.5, fontWeight: 500, color: COLORS.dark, fontFamily: 'monospace' }}>{o.id}</div>
                                                <div style={{ fontSize: 12, color: '#2A2520' }}>{o.product}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                    <div style={{ width: 22, height: 22, borderRadius: 6, background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8.5, fontWeight: 600, color: ac.color, flexShrink: 0 }}>{o.avatar}</div>
                                                    <span style={{ fontSize: 11.5, color: COLORS.textSub }}>{o.customer}</span>
                                                </div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.dark }}>{o.amount}</div>
                                                <div>
                                                    <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.04em', background: sc.bg, color: sc.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: sc.dot }} />{o.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="card" style={{ padding: '18px', animation: 'fadeUp 0.5s ease both 0.52s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.dark }}>Live Visitors</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: COLORS.green, fontWeight: 500 }}>
                                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.green, animation: 'pulse 1.5s infinite' }} />Real-time
                                    </div>
                                </div>
                                <div style={{ fontSize: 32, fontWeight: 600, color: COLORS.dark, letterSpacing: '-0.03em', marginBottom: 4 }}>{live.liveVisitors}</div>
                                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 12 }}>active sessions right now</div>
                                <div style={{ display: 'flex', gap: 3 }}>{Array.from({ length: 10 }).map((_, i) => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < live.liveVisitors ? COLORS.green : '#E8E4DC' }} />))}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 9.5, color: '#C4C0B8' }}><span>0</span><span>30 max</span></div>
                            </div>
                            <div className="card" style={{ padding: '18px', animation: 'fadeUp 0.5s ease both 0.56s' }}>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.dark, marginBottom: 14 }}>Fulfillment Rate</div>
                                <div style={{ position: 'relative', width: 76, height: 76, margin: '0 auto 10px' }}>
                                    <svg viewBox="0 0 76 76" width="76" height="76">
                                        <circle cx="38" cy="38" r="30" fill="none" stroke="#F0ECE6" strokeWidth="5" />
                                        <circle cx="38" cy="38" r="30" fill="none" stroke={COLORS.green} strokeWidth="5" strokeDasharray="188.4" strokeDashoffset={`${188.4 - (188.4 * live.fulfillmentRate) / 100}`} strokeLinecap="round" />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: COLORS.dark }}>{Math.round(live.fulfillmentRate)}%</div>
                                </div>
                                <div style={{ fontSize: 10.5, color: COLORS.textMuted, textAlign: 'center' }}>Fulfillment rate for current orders</div>
                            </div>
                            <div className="card" style={{ padding: '16px', animation: 'fadeUp 0.5s ease both 0.6s' }}>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.dark, marginBottom: 12 }}>Order Status</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    {[
                                        { label: 'Delivered', val: live.statusDistribution.Delivered, color: COLORS.blue },
                                        { label: 'Shipped', val: live.statusDistribution.Shipped, color: COLORS.green },
                                        { label: 'Processing', val: live.statusDistribution.Processing, color: '#F59E0B' },
                                        { label: 'Pending', val: live.statusDistribution.Pending, color: COLORS.red },
                                    ].map(s => (
                                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: 11.5, color: COLORS.textSub, flex: 1 }}>{s.label}</span>
                                            <div style={{ width: 52, height: 3, background: '#F0EDE8', borderRadius: 3 }}><div style={{ height: '100%', width: `${s.val}%`, background: s.color, borderRadius: 3 }} /></div>
                                            <span style={{ fontSize: 11, fontWeight: 500, color: COLORS.dark, minWidth: 24, textAlign: 'right' }}>{Math.round(s.val)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: 16 }} />
                    </>}
                </div>
            </div>

            {exportModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, width: 320, padding: 22, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark }}>Export Data</span>
                            <button onClick={() => setExportModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: COLORS.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>×</button>
                        </div>
                        <div>
                            <label style={{ fontSize: 10.5, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, display: 'block', marginBottom: 4 }}>Data Type</label>
                            <select value={exportType} onChange={e => setExportType(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, outline: 'none', fontSize: 12, fontFamily: 'inherit' }}>
                                <option>Orders</option>
                                <option>Products</option>
                                <option>Users</option>
                                <option>Revenue</option>
                                <option>Summary</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 10.5, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, display: 'block', marginBottom: 4 }}>Format</label>
                            <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, outline: 'none', fontSize: 12, fontFamily: 'inherit' }}>
                                <option>CSV</option>
                                <option>JSON</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <button onClick={() => setExportModalOpen(false)} style={{ flex: 1, padding: '8px', border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', background: COLORS.sand, color: COLORS.textSub, fontFamily: 'inherit' }}>Cancel</button>
                            <button onClick={handleExport} disabled={exporting} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: COLORS.dark, color: '#fff', fontFamily: 'inherit' }}>
                                {exporting ? 'Exporting...' : 'Export'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
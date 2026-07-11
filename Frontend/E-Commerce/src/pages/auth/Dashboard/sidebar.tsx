import { useState, useRef, useEffect } from "react";
import {
    LayoutDashboard, ShieldUser, Users, Folders, ShoppingBag,
    Settings, LogOut, ChevronDown, UserPlus, Eye, PlusCircle,
    ListOrdered, Package, Tag, Layers, Store, X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { appRoutes } from "../../../routes/router";
import { getAdminProfile } from "../../../services/auth/authService";
import { fetchAnalyticsStats } from "../../../services/dashboard/dashboardService";
import { useConfirm } from "../../../context/UIContext";

type NavItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    path?: string;
    badge?: number;
    children?: Array<{ id: string; label: string; path: string; icon?: React.ReactNode }>;
};

const C = {
    bgCard: "#FFFFFF", border: "#EEEBE5", dark: "#1A1A1A",
    textSub: "#6A6560", textMuted: "#9A968F", sand: "#F6F4F0",
    green: "#2A6344", greenLight: "#48A87A", greenBg: "#EAF4EE", greenBorder: "#C4DFD0",
};

type Props = { collapsed: boolean; onToggle: () => void; isMobile: boolean; mobileOpen: boolean; onMobileClose: () => void; };

export default function Sidebar({ collapsed, onToggle, isMobile, mobileOpen, onMobileClose }: Props) {
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [hoveredLogout, setHoveredLogout] = useState(false);
    const [flyout, setFlyout] = useState<{ id: string; top: number } | null>(null);
    const flyoutTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const location = useLocation();
    const [profile, setProfile] = useState<{ name: string; email: string }>({ name: 'Admin', email: '' });
    const [orderCount, setOrderCount] = useState<number>(0);
    const confirm = useConfirm();

    useEffect(() => {
        getAdminProfile().then(data => {
            if (data?.status === 200 && data.result) {
                const a = data.result;
                setProfile({ name: `${a.first_name} ${a.last_name}`, email: a.email });
            }
        });
    }, []);

    useEffect(() => {
        fetchAnalyticsStats("All").then(res => {
            if (res?.status === 200 && res.result) {
                setOrderCount(res.result.totalOrders || 0);
            }
        });
    }, []);

    // close mobile drawer on route change
    useEffect(() => { if (isMobile) onMobileClose(); }, [location.pathname]);

    // prevent body scrolling when mobile sidebar is open
    useEffect(() => {
        if (isMobile && mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobile, mobileOpen]);

    // auto expand parent menu when navigating directly or loading
    useEffect(() => {
        const matchingMenu = managementNav.find(item =>
            item.children?.some(c => location.pathname === c.path)
        );
        if (matchingMenu) {
            setExpandedMenus({ [matchingMenu.id]: true });
        }
    }, [location.pathname]);

    const toggleMenu = (id: string) => setExpandedMenus(prev => {
        const isOpen = prev[id] ?? false;
        return { [id]: !isOpen };
    });
    
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
            window.location.href = appRoutes.login;
        }
    };

    const showFlyout = (id: string, e: React.MouseEvent) => {
        if (!collapsed || isMobile) return;
        if (flyoutTimeout.current) clearTimeout(flyoutTimeout.current);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const sidebarEl = (e.currentTarget as HTMLElement).closest("aside");
        if (!sidebarEl) return;
        setFlyout({ id, top: rect.top - sidebarEl.getBoundingClientRect().top });
    };
    const hideFlyout = () => { flyoutTimeout.current = setTimeout(() => setFlyout(null), 120); };
    const keepFlyout = () => { if (flyoutTimeout.current) clearTimeout(flyoutTimeout.current); };

    const mainNav: NavItem[] = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={2} />, path: appRoutes.dashboard },
    ];
    const managementNav: NavItem[] = [
        { id: "admins", label: "Admins", icon: <ShieldUser size={18} strokeWidth={2} />, children: [{ id: "add-admin", label: "Add Admin", path: `${appRoutes.dashboard}/add-admin`, icon: <UserPlus size={13} /> }, { id: "view-admins", label: "View Admins", path: `${appRoutes.dashboard}/view-admins`, icon: <Eye size={13} /> }] },
        { id: "users", label: "Users", icon: <Users size={18} strokeWidth={2} />, children: [{ id: "add-user", label: "Add User", path: `${appRoutes.dashboard}/add-user`, icon: <UserPlus size={13} /> }, { id: "view-users", label: "View Users", path: `${appRoutes.dashboard}/view-users`, icon: <Eye size={13} /> }] },
        { id: "categories", label: "Categories", icon: <Folders size={18} strokeWidth={2} />, children: [{ id: "main-categories", label: "Categories", path: `${appRoutes.dashboard}/categories`, icon: <PlusCircle size={13} /> }, { id: "sub-categories", label: "Sub Categories", path: `${appRoutes.dashboard}/sub-categories`, icon: <Layers size={13} /> }, { id: "extra-categories", label: "Extra Categories", path: `${appRoutes.dashboard}/extra-categories`, icon: <Layers size={13} /> }] },
        { id: "products", label: "Products", icon: <Package size={18} strokeWidth={2} />, children: [{ id: "add-product", label: "Add Product", path: `${appRoutes.dashboard}/add-product`, icon: <PlusCircle size={13} /> }, { id: "view-products", label: "View Products", path: `${appRoutes.dashboard}/view-products`, icon: <Eye size={13} /> }] },
        { id: "orders", label: "Orders", icon: <ShoppingBag size={18} strokeWidth={2} />, badge: orderCount, children: [{ id: "all-orders", label: "Orders", path: `${appRoutes.dashboard}/orders`, icon: <ListOrdered size={13} /> }] },
    ];
    const systemNav: NavItem[] = [{ id: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={2} />, path: `${appRoutes.dashboard}/settings` }];

    const allGroups = [{ label: null, items: mainNav }, { label: "Management", items: managementNav }, { label: "System", items: systemNav }];
    const allItems = [...mainNav, ...managementNav, ...systemNav];
    const activeFlyoutItem = allItems.find(i => i.id === flyout?.id);

    const isCollapsed = isMobile ? false : collapsed;

    const renderExpanded = (item: NavItem) => {
        if (item.children) {
            const isOpen = expandedMenus[item.id] ?? false;
            const hasActiveChild = item.children.some(c => location.pathname === c.path);
            const parentActive = isOpen || hasActiveChild;
            return (
                <div key={item.id} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    <button onClick={() => toggleMenu(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 400, fontFamily: "'Outfit', sans-serif", transition: "all 0.15s", background: parentActive ? C.sand : "transparent", color: parentActive ? C.dark : C.textSub }}
                        onMouseEnter={e => { if (!parentActive) { (e.currentTarget as HTMLElement).style.background = C.sand; (e.currentTarget as HTMLElement).style.color = C.dark; } }}
                        onMouseLeave={e => { if (!parentActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.textSub; } }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ display: "flex", color: parentActive ? C.green : "#B0ACA4" }}>{item.icon}</span>
                            <span style={{ fontWeight: parentActive ? 500 : 400 }}>{item.label}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {item.badge !== undefined && item.badge > 0 && !isOpen && <span style={{ fontSize: 10, fontWeight: 600, background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: "1px 6px" }}>{item.badge}</span>}
                            <ChevronDown size={14} style={{ color: "#C4C0B8", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s ease" }} />
                        </div>
                    </button>
                    <div style={{ overflow: "hidden", maxHeight: isOpen ? 200 : 0, opacity: isOpen ? 1 : 0, transition: "max-height 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s", display: "flex", flexDirection: "column", gap: 2, marginTop: isOpen ? 2 : 0 }}>
                        {item.children.map(child => {
                            const isActive = location.pathname === child.path;
                            return (
                                <NavLink key={child.id} to={child.path} onClick={() => { if (isMobile) onMobileClose(); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 8px 38px", borderRadius: 8, textDecoration: "none", fontSize: 12.5, fontWeight: isActive ? 500 : 400, transition: "all 0.15s", background: isActive ? C.greenBg : "transparent", color: isActive ? C.green : C.textMuted, border: isActive ? `1px solid ${C.greenBorder}` : "1px solid transparent" }}>
                                    {child.icon && <span style={{ display: "flex", color: isActive ? C.green : "#C4C0B8" }}>{child.icon}</span>}
                                    <span>{child.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return (
            <NavLink key={item.id} to={item.path!} end={item.id === "dashboard"} onClick={() => { if (isMobile) onMobileClose(); }} style={({ isActive }) => ({ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: isActive ? 500 : 400, transition: "all 0.15s", background: isActive ? C.dark : "transparent", color: isActive ? "#FFFFFF" : C.textSub })}>
                {({ isActive }) => (<><span style={{ display: "flex", color: isActive ? "#fff" : "#B0ACA4" }}>{item.icon}</span><span style={{ fontWeight: isActive ? 500 : 400 }}>{item.label}</span></>)}
            </NavLink>
        );
    };

    const renderCollapsed = (item: NavItem) => {
        const hasActiveChild = item.children?.some(c => location.pathname === c.path);
        const isActive = (item.path && location.pathname === item.path) || hasActiveChild;
        return (
            <div key={item.id} style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }} onMouseEnter={e => showFlyout(item.id, e)} onMouseLeave={hideFlyout}>
                {item.path ? (
                    <NavLink to={item.path} style={({ isActive: a }) => ({ width: 40, height: 40, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", borderRadius: 8, textDecoration: "none", transition: "all 0.15s", background: a ? C.dark : "transparent", color: a ? "#fff" : "#B0ACA4" })}>{item.icon}</NavLink>
                ) : (
                    <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, transition: "all 0.15s", cursor: "pointer", background: isActive ? C.sand : "transparent", color: isActive ? C.green : "#B0ACA4", position: "relative" }}>
                        {item.icon}
                        {item.badge !== undefined && item.badge > 0 && !isActive && <span style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: "50%", background: C.green, border: "1.5px solid #fff" }} />}
                    </div>
                )}
            </div>
        );
    };

    const sidebarContent = (
        <aside style={{ width: isCollapsed ? 64 : 252, minWidth: isCollapsed ? 64 : 252, maxWidth: isCollapsed ? 64 : 252, flexShrink: 0, height: "100vh", background: C.bgCard, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "visible", fontFamily: "'Outfit', sans-serif", position: "relative", zIndex: 30, transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
            <style>{`
                .arova-sb-nav::-webkit-scrollbar{width:3px}.arova-sb-nav::-webkit-scrollbar-thumb{background:#E0DDD6;border-radius:3px}
                @keyframes arovaFlyIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
                .arova-flyout{animation:arovaFlyIn 0.16s cubic-bezier(0.4,0,0.2,1)}
                .arova-flyout-item:hover{background:${C.sand}!important;color:${C.dark}!important}
            `}</style>

            {/* Top stripe */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${C.green},${C.greenLight},${C.green})`, pointerEvents: "none" }} />

            {/* Brand */}
            <div style={{ padding: isCollapsed ? "20px 0" : "22px 18px 14px", borderBottom: `1px solid ${C.border}`, marginTop: 3, display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", transition: "padding 0.28s", overflow: "hidden" }}>
                {!isCollapsed && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, width: "auto", overflow: "hidden", whiteSpace: "nowrap" }}>
                        <div style={{ width: 34, height: 34, background: C.dark, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Store size={17} color="#FFFFFF" strokeWidth={1.8} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, color: C.dark }}>Arova</div>
                            <div style={{ fontSize: 9.5, color: C.textMuted, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}>Commerce Suite</div>
                        </div>
                    </div>
                )}
                {isCollapsed && <div style={{ width: 34, height: 34, background: C.dark, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}><Store size={17} color="#FFFFFF" strokeWidth={1.8} /></div>}

                {/* Mobile close button */}
                {isMobile && (
                    <button onClick={onMobileClose} style={{ width: 28, height: 28, flexShrink: 0, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted }}>
                        <X size={13} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="arova-sb-nav" style={{ flex: 1, overflowY: "auto", overflowX: "visible", padding: isCollapsed ? "14px 0" : "14px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                {allGroups.map((group, gi) => (
                    <div key={gi} style={{ width: "100%" }}>
                        {!isCollapsed && group.label && <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "#C4C0B8", padding: "14px 12px 6px" }}>{group.label}</div>}
                        {isCollapsed && group.label && <div style={{ height: 1, background: C.border, margin: "8px 12px" }} />}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: "100%", padding: isCollapsed ? "0 12px" : "0" }}>
                            {group.items.map(item => isCollapsed ? renderCollapsed(item) : renderExpanded(item))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User card */}
            <div style={{ padding: isCollapsed ? "10px 0" : "10px", borderTop: `1px solid ${C.border}` }}>
                {!isCollapsed ? (
                    <div style={{ padding: "10px 12px", background: C.sand, border: `1px solid ${C.border}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.bgCard, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: C.dark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</div>
                            <div style={{ fontSize: 10.5, color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.email}</div>
                        </div>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                    </div>
                ) : (
                    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: C.sand, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            <div style={{ position: "absolute", bottom: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: C.green, border: "1.5px solid #fff" }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Logout */}
            <div style={{ padding: "0 10px 10px 10px" }}>
                <button onClick={handleLogout} title="Sign out" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start", gap: 10, padding: "10px 12px", borderRadius: 8, border: `1px solid ${hoveredLogout ? "rgba(220,38,38,0.15)" : "transparent"}`, cursor: "pointer", fontSize: 13, fontWeight: 400, fontFamily: "'Outfit', sans-serif", transition: "all 0.15s", background: hoveredLogout ? "#FEF2F2" : "transparent", color: hoveredLogout ? "#DC2626" : C.textSub }}
                    onMouseEnter={() => setHoveredLogout(true)} onMouseLeave={() => setHoveredLogout(false)}>
                    <LogOut size={16} strokeWidth={2} />
                    {!isCollapsed && <span>Sign out</span>}
                </button>
            </div>

            {/* Flyout (collapsed desktop only) */}
            {isCollapsed && flyout && activeFlyoutItem && (
                <div className="arova-flyout" onMouseEnter={keepFlyout} onMouseLeave={hideFlyout}
                    style={{ position: "absolute", left: 68, top: flyout.top, zIndex: 200, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", minWidth: 178, padding: 6 }}>
                    <div style={{ padding: "6px 10px 8px", fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, marginBottom: 4 }}>{activeFlyoutItem.label}</div>
                    {activeFlyoutItem.children
                        ? activeFlyoutItem.children.map(child => {
                            const isActive = location.pathname === child.path;
                            return (
                                <NavLink key={child.id} to={child.path} onClick={() => setFlyout(null)} className="arova-flyout-item"
                                    style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 7, textDecoration: "none", fontSize: 13, fontWeight: isActive ? 500 : 400, transition: "all 0.14s", background: isActive ? C.greenBg : "transparent", color: isActive ? C.green : C.textSub, border: isActive ? `1px solid ${C.greenBorder}` : "1px solid transparent" }}>
                                    {child.icon && <span style={{ display: "flex", color: isActive ? C.green : "#C4C0B8" }}>{child.icon}</span>}
                                    <span>{child.label}</span>
                                </NavLink>
                            );
                        })
                        : activeFlyoutItem.path && (
                            <NavLink to={activeFlyoutItem.path} onClick={() => setFlyout(null)} className="arova-flyout-item"
                                style={({ isActive }) => ({ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 7, textDecoration: "none", fontSize: 13, transition: "all 0.14s", background: isActive ? C.dark : "transparent", color: isActive ? "#fff" : C.textSub })}>
                                {activeFlyoutItem.icon && <span style={{ display: "flex" }}>{activeFlyoutItem.icon}</span>}
                                <span>{activeFlyoutItem.label}</span>
                            </NavLink>
                        )
                    }
                </div>
            )}
        </aside>
    );

    if (isMobile) {
        return (
            <>
                {/* Backdrop */}
                {mobileOpen && (
                    <div onClick={onMobileClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1000, backdropFilter: "blur(4px)" }} />
                )}
                {/* Drawer */}
                <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: 252, zIndex: 1001, transform: mobileOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
                    {sidebarContent}
                </div>
            </>
        );
    }

    return sidebarContent;
}
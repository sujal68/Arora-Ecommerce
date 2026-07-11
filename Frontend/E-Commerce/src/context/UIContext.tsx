import React, { createContext, useContext, useState } from 'react';

// ── TOAST TYPES ─────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type Toast = {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
};

// ── CONFIRM TYPES ───────────────────────────────────────────────────────────
export type ConfirmOptions = {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
};

type ConfirmState = {
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
};

// ── CONTEXT TYPE ────────────────────────────────────────────────────────────
type UIContextType = {
    toast: {
        success: (msg: string) => void;
        error: (msg: string) => void;
        warning: (msg: string) => void;
        info: (msg: string) => void;
        loading: (msg: string) => string; // returns toast ID to manually close/update
        dismiss: (id: string) => void;
    };
    confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

const COLORS = {
    success: { bg: '#EAF4EE', border: '#C4DFD0', text: '#2A6344' },
    error: { bg: '#FFEBEE', border: '#FFCDD2', text: '#C62828' },
    warning: { bg: '#FEF3E2', border: '#FFE0B2', text: '#A05A10' },
    info: { bg: '#E8F0FE', border: '#D2E3FC', text: '#1A56DB' },
    loading: { bg: '#FAFAF8', border: '#E8E4DE', text: '#4A4540' },
    dark: '#1A1A1A',
    border: '#E8E4DE',
    white: '#FFFFFF',
    textSub: '#6A6560',
    textMuted: '#9A968F'
};

export const UIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmState, setConfirmState] = useState<ConfirmState>({
        isOpen: false,
        options: {},
        resolve: null
    });

    // Toast operations
    const showToast = (message: string, type: ToastType, duration = 3000) => {
        // Prevent duplicate toasts (same message and type) from piling up
        let existingId = '';
        setToasts(prev => {
            const dup = prev.find(t => t.message === message && t.type === type);
            if (dup) {
                existingId = dup.id;
                return prev;
            }
            return prev;
        });

        if (existingId) return existingId;

        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message, type, duration };
        setToasts(prev => [...prev, newToast]);

        if (type !== 'loading' && duration > 0) {
            setTimeout(() => {
                dismissToast(id);
            }, duration);
        }
        return id;
    };

    const dismissToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toastApi = {
        success: (msg: string) => { showToast(msg, 'success'); },
        error: (msg: string) => { showToast(msg, 'error'); },
        warning: (msg: string) => { showToast(msg, 'warning'); },
        info: (msg: string) => { showToast(msg, 'info'); },
        loading: (msg: string) => showToast(msg, 'loading', 0),
        dismiss: dismissToast
    };

    // Confirm Modal trigger
    const confirmApi = (options: ConfirmOptions): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({
                isOpen: true,
                options,
                resolve
            });
        });
    };

    const handleConfirmResponse = (response: boolean) => {
        if (confirmState.resolve) {
            confirmState.resolve(response);
        }
        setConfirmState({
            isOpen: false,
            options: {},
            resolve: null
        });
    };

    return (
        <UIContext.Provider value={{ toast: toastApi, confirm: confirmApi }}>
            {children}

            {/* Injected style helper for animations */}
            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalZoomIn {
                    from { transform: scale(0.92); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .toast-container {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 999999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                    max-width: 90%;
                    width: 340px;
                }
                @media (min-width: 768px) {
                    .toast-container {
                        left: auto;
                        right: 20px;
                        transform: none;
                        max-width: 340px;
                    }
                }
                .custom-toast {
                    animation: toastSlideIn 0.26s cubic-bezier(0.2, 0.9, 0.4, 1.1) both;
                    transition: all 0.2s ease;
                }
                .confirm-modal-overlay {
                    animation: modalFadeIn 0.2s ease both;
                }
                .confirm-modal-box {
                    animation: modalZoomIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
            `}</style>

            {/* ── TOAST NOTIFICATIONS RENDER STACK ──────────────────────────────── */}
            <div className="toast-container" style={{
                fontFamily: "'Outfit', sans-serif"
            }}>
                {toasts.map((t) => {
                    const c = COLORS[t.type];
                    return (
                        <div key={t.id} className="custom-toast" style={{
                            pointerEvents: 'auto',
                            background: c.bg,
                            border: `1.5px solid ${c.border}`,
                            borderRadius: '12px',
                            padding: '12px 16px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            width: '100%'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                {/* Dynamic Status Icon */}
                                {t.type === 'success' && (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.text} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                )}
                                {t.type === 'error' && (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.text} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                )}
                                {t.type === 'warning' && (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.text} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                )}
                                {t.type === 'info' && (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.text} strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                )}
                                {t.type === 'loading' && (
                                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${c.border}`, borderTopColor: c.text, animation: 'spin 0.8s linear infinite' }} />
                                )}
                                <span style={{ fontSize: '12.5px', color: COLORS.dark, fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word' }}>{t.message}</span>
                            </div>
                            <button onClick={() => dismissToast(t.id)} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: COLORS.textMuted,
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 2
                            }}>×</button>
                        </div>
                    );
                })}
            </div>

            {/* ── GLOBAL CONFIRMATION MODAL OVERLAY ─────────────────────────────── */}
            {confirmState.isOpen && (
                <div className="confirm-modal-overlay" style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000000,
                    fontFamily: "'Outfit', sans-serif"
                }}>
                    <div className="confirm-modal-box" style={{
                        background: COLORS.white,
                        border: `1.5px solid ${COLORS.border}`,
                        borderRadius: '16px',
                        width: '350px',
                        padding: '24px',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            {confirmState.options.isDanger ? (
                                <div style={{
                                    width: 36, height: 36, borderRadius: '10px', background: COLORS.error.bg,
                                    border: `1px solid ${COLORS.error.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.error.text} strokeWidth="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                </div>
                            ) : (
                                <div style={{
                                    width: 36, height: 36, borderRadius: '10px', background: COLORS.warning.bg,
                                    border: `1px solid ${COLORS.warning.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.warning.text} strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                </div>
                            )}
                            <div>
                                <h3 style={{ fontSize: '15px', fontWeight: 600, color: COLORS.dark, margin: 0 }}>{confirmState.options.title || 'Confirm Action'}</h3>
                                <p style={{ fontSize: '12px', color: COLORS.textSub, marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
                                    {confirmState.options.message || 'Are you sure you want to continue? This action may not be reversible.'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <button onClick={() => handleConfirmResponse(false)} style={{
                                flex: 1,
                                padding: '9px 14px',
                                background: COLORS.white,
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: COLORS.textSub,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'background 0.16s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = COLORS.loading.bg}
                            onMouseLeave={e => e.currentTarget.style.background = COLORS.white}>
                                {confirmState.options.cancelText || 'Cancel'}
                            </button>
                            <button onClick={() => handleConfirmResponse(true)} style={{
                                flex: 1,
                                padding: '9px 14px',
                                background: confirmState.options.isDanger ? COLORS.error.text : COLORS.dark,
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                transition: 'opacity 0.16s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                {confirmState.options.confirmText || 'Yes, Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UIContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error('useToast must be used within UIContextProvider');
    return ctx.toast;
};

export const useConfirm = () => {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error('useConfirm must be used within UIContextProvider');
    return ctx.confirm;
};

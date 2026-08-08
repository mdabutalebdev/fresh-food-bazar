"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FiBell, FiShoppingCart, FiStar, FiMessageSquare, FiClock, FiCheckCircle,
} from 'react-icons/fi';
import { useGetRecentOrdersQuery } from '@/redux/api/dashboardApi';
import { useGetAllReviewsQuery } from '@/redux/api/reviewApi';
import { useGetInquiriesQuery } from '@/redux/api/inquiryApi';

type Noti = {
    id: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    title: string;
    sub: string;
    href: string;
    ts: number;
};

const timeAgo = (date?: string) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

/**
 * The admin header bell. Aggregates the things that actually need an admin's
 * attention — pending orders, reviews awaiting approval and unanswered
 * inquiries — into one dropdown, with a live count badge. Poll every 30s so a
 * new order shows up without a manual refresh.
 */
const AdminNotifications: React.FC = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const { data: ordersData } = useGetRecentOrdersQuery(6, { pollingInterval: 30000 });
    const { data: reviewsData } = useGetAllReviewsQuery({ limit: 1, status: 'pending' }, { pollingInterval: 60000 });
    const { data: inquiriesData } = useGetInquiriesQuery({ limit: 1, status: 'pending' }, { pollingInterval: 60000 });

    const orders: any[] = ordersData?.data || [];
    const pendingOrders = orders.filter((o) => o.status === 'pending');
    const pendingReviews: number = reviewsData?.meta?.counts?.pending || 0;
    const pendingInquiries: number = inquiriesData?.meta?.total || 0;

    // Close on outside click
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    // Build the summary rows (only the ones that have something) + recent orders.
    const summaries: Noti[] = [];
    if (pendingOrders.length > 0) {
        summaries.push({
            id: 'sum-orders', icon: FiShoppingCart, color: '#B45309', bg: '#FFFBEB',
            title: `${pendingOrders.length} order${pendingOrders.length > 1 ? 's' : ''} pending`,
            sub: 'Tap to review and confirm', href: '/dashboard/admin/orders?status=pending', ts: Date.now(),
        });
    }
    if (pendingReviews > 0) {
        summaries.push({
            id: 'sum-reviews', icon: FiStar, color: '#C2410C', bg: '#FFF7ED',
            title: `${pendingReviews} review${pendingReviews > 1 ? 's' : ''} to approve`,
            sub: 'Awaiting your approval', href: '/dashboard/admin/reviews', ts: Date.now(),
        });
    }
    if (pendingInquiries > 0) {
        summaries.push({
            id: 'sum-inq', icon: FiMessageSquare, color: '#1D4ED8', bg: '#EFF6FF',
            title: `${pendingInquiries} inquir${pendingInquiries > 1 ? 'ies' : 'y'} to reply`,
            sub: 'Customers are waiting', href: '/dashboard/admin/inquiries', ts: Date.now(),
        });
    }

    const recent: Noti[] = orders.slice(0, 5).map((o) => ({
        id: o._id,
        icon: o.status === 'delivered' ? FiCheckCircle : FiShoppingCart,
        color: '#0C2E20', bg: '#f0fdf4',
        title: `Order ${o.orderNumber || ''} · ৳${(o.total || 0).toLocaleString()}`,
        sub: `${o.user?.firstName || o.guestInfo?.name || 'Customer'} · ${o.status}`,
        href: `/dashboard/admin/orders`,
        ts: o.createdAt ? new Date(o.createdAt).getTime() : 0,
    }));

    const totalCount = pendingOrders.length + pendingReviews + pendingInquiries;

    const go = (href: string) => { setOpen(false); router.push(href); };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Notifications"
                style={{
                    position: 'relative', background: open ? '#f4f5f7' : 'none', border: 'none',
                    cursor: 'pointer', color: '#667085', padding: '8px', borderRadius: '9px',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f4f5f7'}
                onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
                <FiBell size={18} />
                {totalCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '1px', right: '1px', minWidth: '15px', height: '15px',
                        padding: '0 3px', borderRadius: '999px', background: '#f04438', color: '#fff',
                        border: '2px solid #fff', fontSize: '9px', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                    }}>
                        {totalCount > 9 ? '9+' : totalCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: '340px',
                    maxHeight: '460px', overflowY: 'auto', background: '#fff', borderRadius: '14px',
                    border: '1px solid #eceff2', boxShadow: '0 16px 40px -12px rgba(16,24,40,0.25)', zIndex: 60,
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', borderBottom: '1px solid #f2f4f7', position: 'sticky', top: 0, background: '#fff',
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#101828' }}>Notifications</span>
                        {totalCount > 0 && (
                            <span style={{
                                fontSize: '11px', fontWeight: 700, color: '#B42318',
                                background: '#FEF3F2', padding: '2px 9px', borderRadius: '999px',
                            }}>
                                {totalCount} pending
                            </span>
                        )}
                    </div>

                    {summaries.length === 0 && recent.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <FiCheckCircle size={30} color="#d0d5dd" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: '13px', color: '#98a2b3', margin: 0 }}>You&apos;re all caught up 🎉</p>
                        </div>
                    ) : (
                        <>
                            {summaries.map((n) => (
                                <button key={n.id} onClick={() => go(n.href)} style={rowStyle}>
                                    <span style={{ ...iconWrap, background: n.bg, color: n.color }}><n.icon size={15} /></span>
                                    <span style={{ minWidth: 0, textAlign: 'left', flex: 1 }}>
                                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#101828' }}>{n.title}</span>
                                        <span style={{ display: 'block', fontSize: '11.5px', color: '#98a2b3' }}>{n.sub}</span>
                                    </span>
                                </button>
                            ))}

                            {recent.length > 0 && (
                                <div style={{ padding: '10px 16px 4px', fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.5px', color: '#98a2b3', textTransform: 'uppercase' }}>
                                    Recent Orders
                                </div>
                            )}
                            {recent.map((n) => (
                                <button key={n.id} onClick={() => go(n.href)} style={rowStyle}>
                                    <span style={{ ...iconWrap, background: n.bg, color: n.color }}><n.icon size={15} /></span>
                                    <span style={{ minWidth: 0, textAlign: 'left', flex: 1 }}>
                                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                                        <span style={{ display: 'block', fontSize: '11.5px', color: '#98a2b3', textTransform: 'capitalize' }}>{n.sub}</span>
                                    </span>
                                    <span style={{ fontSize: '10.5px', color: '#cbd2d9', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                                        <FiClock size={9} /> {timeAgo(new Date(n.ts).toISOString())}
                                    </span>
                                </button>
                            ))}

                            {/* Footer */}
                            <button
                                onClick={() => go('/dashboard/admin/orders')}
                                style={{
                                    width: '100%', padding: '12px', border: 'none', borderTop: '1px solid #f2f4f7',
                                    background: '#fff', color: 'var(--color-primary)', fontSize: '12.5px',
                                    fontWeight: 700, cursor: 'pointer',
                                }}
                            >
                                View all orders
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '11px', width: '100%',
    padding: '11px 16px', border: 'none', borderBottom: '1px solid #f7f8fa',
    background: '#fff', cursor: 'pointer', textAlign: 'left',
};

const iconWrap: React.CSSProperties = {
    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default AdminNotifications;

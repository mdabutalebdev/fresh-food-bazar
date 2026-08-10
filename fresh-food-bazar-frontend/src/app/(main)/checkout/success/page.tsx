"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiHome, FiShoppingBag, FiPackage, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { useGetOrderByIdQuery } from '@/redux/api/orderApi';

const ORANGE = '#F47B20';

function SuccessContent() {
    const params = useSearchParams();
    const raw = params.get('order') || params.get('id') || '';
    const trackingId = raw ? raw.slice(-10).toUpperCase() : '';

    const { data: orderData, isLoading } = useGetOrderByIdQuery(raw, {
        skip: !raw
    });
    const order = orderData?.data;

    return (
        <div className="min-h-screen bg-[var(--color-background)] pb-20">
            <div className="container mx-auto px-4 lg:px-8 pt-10 max-w-[900px]">
                
                {/* SUCCESS HEADER */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FFF7ED' }}>
                        <FiCheckCircle style={{ color: ORANGE }} size={36} />
                    </div>
                    <h1 className="text-[26px] font-bold text-[#222831] mb-2">Thank You for your Order!</h1>
                    <p className="text-gray-500 mb-6 text-sm">
                        Your order has been placed successfully. We've received it and will process it shortly.
                    </p>
                    
                    {trackingId && (
                        <div className="inline-block bg-gray-50 rounded-xl px-8 py-4 mb-4 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Order Tracking ID</p>
                            <p className="text-xl font-extrabold tracking-wide text-[#222831]">
                                #{trackingId}
                            </p>
                        </div>
                    )}
                    
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                        <Link
                            href="/dashboard/user/orders"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: ORANGE }}
                        >
                            <FiShoppingBag size={16} /> View My Orders
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-[13px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <FiHome size={16} /> Continue Shopping
                        </Link>
                    </div>
                </div>

                {/* ORDER DETAILS */}
                {isLoading ? (
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse text-center">
                        <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-400">Loading order details...</p>
                    </div>
                ) : order ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* LEFT: Items & Summary */}
                        <div className="md:col-span-7 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <FiPackage size={18} style={{ color: ORANGE }} />
                                    <h2 className="text-[15px] font-semibold text-[#222831]">Order Items</h2>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 px-5 py-4">
                                            <div className="w-[60px] h-[60px] rounded bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                                                {item.thumbnail || item.image ? (
                                                    <img src={item.thumbnail || item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <FiPackage size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13.5px] font-medium text-[#222831] line-clamp-2 leading-snug">{item.name}</p>
                                                {(item.color || item.size) && (
                                                    <p className="text-[11.5px] text-gray-400 mt-1">
                                                        {item.color && `Color: ${item.color}`}{item.color && item.size && ' · '}{item.size && `Size: ${item.size}`}
                                                    </p>
                                                )}
                                                <p className="text-[12px] text-gray-500 mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-[14px] font-semibold text-[#222831] whitespace-nowrap">
                                                ৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Totals */}
                                <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-100 space-y-2">
                                    <div className="flex justify-between text-[13.5px]">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-semibold text-gray-700">৳{order.subtotal?.toLocaleString() || order.total?.toLocaleString()}</span>
                                    </div>
                                    {order.shippingCost > 0 && (
                                        <div className="flex justify-between text-[13.5px]">
                                            <span className="text-gray-500">Delivery Cost</span>
                                            <span className="font-semibold text-gray-700">৳{order.shippingCost?.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-[13.5px]">
                                            <span className="text-gray-500">Discount {order.couponCode && `(${order.couponCode})`}</span>
                                            <span className="font-semibold text-green-600">-৳{order.discount?.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[16px] pt-3 mt-2 border-t border-gray-200">
                                        <span className="font-bold text-[#222831]">Total Amount</span>
                                        <span className="font-bold" style={{ color: ORANGE }}>৳{order.total?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Address & Info */}
                        <div className="md:col-span-5 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                    <FiMapPin size={18} style={{ color: ORANGE }} />
                                    <h2 className="text-[15px] font-semibold text-[#222831]">Shipping Details</h2>
                                </div>
                                {order.shippingAddress ? (
                                    <div className="text-[13.5px] text-gray-600 space-y-2.5">
                                        <p className="font-semibold text-[#222831] text-[14.5px] mb-1">{order.shippingAddress.fullName}</p>
                                        <p className="flex items-start gap-2">
                                            <FiMapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                                            <span>
                                                {order.shippingAddress.address}<br />
                                                {[order.shippingAddress.city, order.shippingAddress.area].filter(Boolean).join(', ')}
                                                {order.shippingAddress.postalCode && ` - ${order.shippingAddress.postalCode}`}
                                            </span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FiPhone size={14} className="shrink-0 text-gray-400" />
                                            {order.shippingAddress.phone}
                                        </p>
                                        {order.shippingAddress.email && (
                                            <p className="flex items-center gap-2">
                                                <FiMail size={14} className="shrink-0 text-gray-400" />
                                                {order.shippingAddress.email}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-[13px] text-gray-400">No shipping information available.</p>
                                )}
                            </div>
                            
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <div className="flex justify-between items-center text-[13.5px]">
                                    <span className="text-gray-500">Payment Method</span>
                                    <span className="font-semibold text-[#222831] uppercase">{order.paymentMethod || 'COD'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13.5px] mt-2 pt-2 border-t border-gray-50">
                                    <span className="text-gray-500">Payment Status</span>
                                    <span className={`font-semibold text-[11px] px-2 py-0.5 rounded uppercase tracking-wider ${
                                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {order.paymentStatus || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={null}>
            <SuccessContent />
        </Suspense>
    );
}

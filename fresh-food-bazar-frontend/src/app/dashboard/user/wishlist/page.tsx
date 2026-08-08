"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    FiHeart,
    FiShoppingCart,
    FiTrash2,
    FiStar,
    FiEye,
} from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@/redux';
import { removeFromWishlist, WishlistItem } from '@/redux/slices/wishlistSlice';
import { addToCart } from '@/redux/slices/cartSlice';
import { openCartModal } from '@/redux/slices/uiSlice';

export default function WishlistPage() {
    const wishlistItems = useAppSelector((s) => s.wishlist.items);
    const dispatch = useAppDispatch();

    // The wishlist lives in localStorage and is hydrated after mount. Wait for the
    // client so we don't flash the empty state — and so this page reads the exact
    // same Redux source as the header badge and the public /wishlist page.
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const handleRemove = (id: string) => dispatch(removeFromWishlist(id));

    const handleAddToCart = (w: WishlistItem) => {
        dispatch(addToCart({
            id: w.id,
            productId: w.id,
            name: w.name,
            price: w.price,
            mrp: w.mrp || w.price,
            image: w.image,
            category: w.category || 'General',
            quantity: 1,
        }));
        dispatch(openCartModal());
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {wishlistItems.length} saved item{wishlistItems.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="px-5 py-2.5 bg-[var(--filter-accent)] text-white rounded-xl font-semibold text-sm hover:brightness-95 transition-all shadow-md shadow-[var(--filter-accent)]/25"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>

            {/* Wishlist Grid */}
            {!mounted ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : wishlistItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-sm">
                    <FiHeart size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-1">Your wishlist is empty</h3>
                    <p className="text-sm text-gray-400 mb-4">Save items you love to your wishlist</p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-2.5 bg-[var(--filter-accent)] text-white rounded-xl font-semibold text-sm hover:brightness-95 transition-all shadow-md shadow-[var(--filter-accent)]/25"
                    >
                        Explore Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map((product: WishlistItem) => {
                        const href = `/product/${product.slug || product.id}`;
                        const hasDiscount = product.mrp && product.mrp > product.price;
                        return (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                {/* Image */}
                                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                                    {product.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                                            <FiShoppingCart size={32} />
                                        </div>
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <Link
                                            href={href}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-[var(--filter-accent)] hover:text-white transition-all"
                                        >
                                            <FiEye size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)] transition-all"
                                        >
                                            <FiShoppingCart size={16} />
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemove(product.id)}
                                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>

                                    {/* Discount Badge */}
                                    {hasDiscount && (
                                        <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md shadow-md">
                                            -{Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <Link href={href}>
                                        <h3 className="text-sm font-bold text-gray-800 hover:text-[var(--color-text-primary)] transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    {/* Rating */}
                                    {product.rating > 0 && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <FiStar size={12} className="text-amber-400 fill-amber-400" />
                                            <span className="text-xs font-semibold text-gray-600">
                                                {product.rating?.toFixed(1)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Price */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-lg font-bold text-[var(--color-text-primary)]">
                                            ৳{product.price?.toLocaleString()}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ৳{product.mrp?.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Add to cart */}
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="mt-3 w-full h-9 rounded-lg flex items-center justify-center gap-1.5 bg-[var(--filter-accent)] text-white text-[13px] font-semibold hover:brightness-95 transition-all"
                                    >
                                        <FiShoppingCart size={14} /> Add To Cart
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

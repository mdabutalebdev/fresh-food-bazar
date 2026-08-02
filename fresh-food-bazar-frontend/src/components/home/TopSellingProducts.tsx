"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingCart } from 'react-icons/fi';
import { useGetProductsQuery } from '@/redux/api/productApi';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import { useAppDispatch } from '@/redux';
import { addToCart } from '@/redux/slices/cartSlice';

interface Product {
    _id?: string;
    id?: string;
    name: string;
    slug?: string;
    price: number;
    originalPrice?: number | null;
    thumbnail?: string;
    category?: { name?: string } | string;
}

const SECTION_BG = '#FBF7EF';
const HEADING = '#1F3347';
const ORANGE = '#F47B20';
const RED = '#EA3E23';
const GREEN = '#A9E34B';

// How many cards the section shows, and how many carry the "Best Selling" flag.
const LIMIT = 4;
const BADGE_COUNT = 2;

const money = (n: number) => `৳${n.toLocaleString('en-US')}`;

const idOf = (p: any) => (typeof p === 'object' && p ? p._id : p) || '';

const TopSellingProducts: React.FC = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();

    // Admin config from Admin → Top Selling. When products are hand-picked we
    // show those in the chosen order; otherwise we fall back to auto ranking.
    const { data: siteRes } = useGetSiteContentQuery(undefined);
    const cfg = siteRes?.data?.topSelling;
    const heading: string = cfg?.title || 'Top Selling Products';
    const pickedIds: string[] = (cfg?.products || []).map((p: any) => String(idOf(p))).filter(Boolean);
    const hasPicked = pickedIds.length > 0;

    // Two sources, one active at a time (the other is skipped): hand-picked by id,
    // or auto-ranked by how much each product has actually sold.
    const { data: pickedData } = useGetProductsQuery(
        { ids: pickedIds.join(','), limit: 40 },
        { skip: !hasPicked },
    );
    const { data: autoData, isLoading } = useGetProductsQuery(
        { sort: '-totalSold', limit: LIMIT },
        { skip: hasPicked },
    );

    const products: Product[] = hasPicked
        // Restore the admin's exact order — the API doesn't guarantee it for `ids`.
        ? pickedIds
            .map((id) => (pickedData?.data || []).find((p: any) => String(p._id) === id))
            .filter(Boolean) as Product[]
        : (autoData?.data || []);

    // Admin switched the whole section off.
    if (cfg && cfg.active === false) return null;

    const buildCartItem = (p: Product) => {
        const id = String(p._id || p.id);
        return {
            id,
            productId: id,
            name: p.name,
            price: p.price,
            mrp: p.originalPrice || p.price,
            image: p.thumbnail || '',
            category: typeof p.category === 'object' ? p.category?.name || 'General' : 'General',
        };
    };

    const handleAddToCart = (p: Product) => dispatch(addToCart(buildCartItem(p)));

    const handleBuyNow = (p: Product) => {
        dispatch(addToCart(buildCartItem(p)));
        router.push('/checkout');
    };

    if (!isLoading && products.length === 0) return null;

    return (
        <section style={{ background: SECTION_BG }} className="py-6 lg:py-11">
            <div className="mx-auto max-w-[1500px] px-4 lg:px-8">

                <h2
                    className="text-center text-[18px] lg:text-[26px] font-semibold mb-5 lg:mb-8"
                    style={{ color: HEADING }}
                >
                    {heading}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[22px]">
                    {isLoading
                        ? Array.from({ length: LIMIT }).map((_, i) => (
                            <div key={i} className="h-[240px] lg:h-[300px] rounded-lg bg-white/70 animate-pulse" />
                        ))
                        : products.map((p, i) => {
                            const id = String(p._id || p.id);
                            const href = `/product/${p.slug || id}`;
                            const saves = p.originalPrice && p.originalPrice > p.price
                                ? p.originalPrice - p.price
                                : 0;

                            return (
                                <div
                                    key={id}
                                    className="relative bg-white rounded-lg overflow-hidden flex items-center group"
                                >
                                    {i < BADGE_COUNT && (
                                        <span
                                            className="absolute top-0 right-0 z-10 flex items-center gap-1 px-3 py-1 text-white text-[12px] font-medium rounded-bl-lg"
                                            style={{ background: RED }}
                                        >
                                            <FiShoppingCart size={12} />
                                            Best Selling
                                        </span>
                                    )}

                                    {/* Image — left ~44% of the card */}
                                    <Link
                                        href={href}
                                        className="shrink-0 w-[38%] lg:w-[44%] h-[200px] lg:h-[300px] flex items-center justify-center p-4 overflow-hidden"
                                    >
                                        {/* The image zoom is the card's only hover effect */}
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={p.thumbnail || '/images/categories/organic.svg'}
                                            alt={p.name}
                                            draggable={false}
                                            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 py-5 pr-5">
                                        <Link href={href}>
                                            <h3
                                                className="text-[17px] lg:text-[19px] font-semibold leading-snug"
                                                style={{ color: HEADING }}
                                            >
                                                {p.name}
                                            </h3>
                                        </Link>

                                        <div className="mt-3 flex items-baseline gap-3 flex-wrap">
                                            <span className="text-[17px] lg:text-[19px] font-bold" style={{ color: ORANGE }}>
                                                {money(p.price)}
                                            </span>
                                            {saves > 0 && (
                                                <span className="text-[15px] text-gray-400 line-through">
                                                    {money(p.originalPrice as number)}
                                                </span>
                                            )}
                                        </div>

                                        {saves > 0 && (
                                            <span
                                                className="inline-block mt-2.5 px-2.5 py-[3px] rounded text-[12.5px] font-medium"
                                                style={{ background: GREEN, color: '#20351F' }}
                                            >
                                                Save {money(saves)}
                                            </span>
                                        )}

                                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                                            <button
                                                onClick={() => handleAddToCart(p)}
                                                className="h-[34px] px-3.5 rounded-md border bg-white flex items-center gap-1.5 text-[13.5px] font-medium hover:bg-orange-50 transition-colors"
                                                style={{ borderColor: ORANGE, color: ORANGE }}
                                            >
                                                <FiShoppingCart size={14} />
                                                Add To Cart
                                            </button>
                                            <button
                                                onClick={() => handleBuyNow(p)}
                                                className="h-[34px] px-4 rounded-md text-white flex items-center gap-1.5 text-[13.5px] font-medium hover:brightness-95 transition"
                                                style={{ background: ORANGE }}
                                            >
                                                <FiShoppingCart size={14} />
                                                Buy now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </section>
    );
};

export default TopSellingProducts;

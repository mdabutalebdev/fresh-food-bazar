"use client";

import React from 'react';
import Link from 'next/link';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import HeroCarousel, { HeroSlide } from './HeroCarousel';

interface HeroSideBanner {
    imageUrl?: string;
    link?: string;
    active?: boolean;
    order?: number;
}

// Shipped defaults, shown until banners are uploaded from Admin → Site Content → Hero.
// The filenames contain spaces, so they must be URL-encoded.
const DEFAULT_SLIDE = '/images/hero%20banar01.png';
const DEFAULT_SIDE_BANNER = '/images/hero%20banar02.png';

// Both panels share this height so their top and bottom edges line up exactly.
const PANEL_HEIGHT = 'h-[200px] sm:h-[280px] md:h-[340px] lg:h-[392px]';

const HeroSection: React.FC = () => {
    // `undefined` (not `{}`) so this shares one cache entry with the header and
    // the home sliders, and refetch-on-mount so a banner saved in the admin shows
    // up on the next page load instead of serving a stale cached response.
    const { data: res } = useGetSiteContentQuery(undefined, { refetchOnMountOrArgChange: true });

    const apiSlides: HeroSlide[] = res?.data?.heroSlides?.filter((s: HeroSlide) => s.active !== false) || [];
    const slides: HeroSlide[] = apiSlides.length > 0
        ? apiSlides
        : [{ mediaType: 'image', imageUrl: DEFAULT_SLIDE }];

    // Side banners are an array now; the old single `heroSideBanner` is the fallback
    // for installs that haven't been migrated yet.
    const legacySide: HeroSideBanner = res?.data?.heroSideBanner || {};
    const sideList: HeroSideBanner[] = (res?.data?.heroSideBanners || [])
        .filter((b: HeroSideBanner) => b.active !== false && b.imageUrl)
        .sort((a: HeroSideBanner, b: HeroSideBanner) => (a.order ?? 0) - (b.order ?? 0));

    const sideBanners: HeroSideBanner[] = sideList.length > 0
        ? sideList
        : legacySide.imageUrl && legacySide.active !== false
            ? [legacySide]
            : [{ imageUrl: DEFAULT_SIDE_BANNER }];

    // Hidden only when an admin turned every side banner off
    const showSide = sideList.length > 0
        || legacySide.active !== false
        || (res?.data?.heroSideBanners?.length ?? 0) === 0;

    const single = sideBanners.length === 1 ? sideBanners[0] : null;

    return (
        <section className="w-full">
            <div className="mx-auto max-w-[1500px] px-4 lg:px-8 py-4 lg:py-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-[18px]">

                    {/* Carousel — two thirds */}
                    <div className={`${showSide ? 'lg:col-span-2' : 'lg:col-span-3'} rounded-lg overflow-hidden ${PANEL_HEIGHT}`}>
                        <HeroCarousel slides={slides} className="h-full" />
                    </div>

                    {/* Side banner — one third on desktop. Hidden on phones/tablets so
                        only the main slider shows there (like the reference mobile). */}
                    {showSide && (
                        <div className={`hidden lg:block lg:col-span-1 rounded-lg overflow-hidden bg-[#0A2A1C] ${PANEL_HEIGHT}`}>
                            {single ? (
                                single.link ? (
                                    <Link href={single.link} className="block w-full h-full">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={single.imageUrl} alt="Fresh Food Bazar" className="w-full h-full object-cover" />
                                    </Link>
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={single.imageUrl} alt="Fresh Food Bazar" className="w-full h-full object-cover" />
                                )
                            ) : (
                                <HeroCarousel
                                    slides={sideBanners.map(b => ({ mediaType: 'image' as const, imageUrl: b.imageUrl }))}
                                    className="h-full"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;

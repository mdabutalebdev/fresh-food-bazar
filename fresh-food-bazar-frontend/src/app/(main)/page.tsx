import { Suspense } from 'react';
import type { Metadata } from 'next';
import NewHomePage from '@/components/home/NewHomePage';

export const metadata: Metadata = {
  // Brand leads the tab title so "Fresh Food Bazar" stays visible even when truncated.
  title: { absolute: "Fresh Food Bazar — Source Quality Products from China to Bangladesh" },
  description: "Fresh Food Bazar is your trusted B2B trading platform — sourcing, shipping, freight forwarding, and customs clearance from China to Bangladesh. Browse thousands of quality products at the best prices.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-background)]" />}>
      <NewHomePage />
    </Suspense>
  );
}

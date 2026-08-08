"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPasswordMutation } from '@/redux/api/authApi';
import { toast } from 'react-hot-toast';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import BrandLogo from '@/components/shared/BrandLogo';

const AcceptInviteInner = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [done, setDone] = useState(false);
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return toast.error('Invalid or missing invite link');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');
        if (password !== confirm) return toast.error('Passwords do not match');
        try {
            await resetPassword({ token, newPassword: password }).unwrap();
            setDone(true);
            toast.success('Account activated! You can now sign in.');
            setTimeout(() => router.push('/login'), 1800);
        } catch (err: any) {
            toast.error(err?.data?.message || 'This invite link is invalid or has expired');
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <Link href="/" className="flex justify-center mb-6">
                <BrandLogo src="/logo.jpg" alt="Fresh Food Bazar" className="h-12 w-auto object-contain" />
            </Link>

            {done ? (
                <div className="text-center py-6">
                    <FiCheckCircle className="text-green-500 mx-auto mb-3" size={40} />
                    <h1 className="text-xl font-bold text-gray-900">Account activated!</h1>
                    <p className="text-sm text-gray-500 mt-2">Redirecting you to sign in…</p>
                    <Link href="/login" className="inline-block mt-4 text-sm font-semibold text-[var(--color-primary)] hover:underline">
                        Go to Sign In
                    </Link>
                </div>
            ) : (
                <>
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Accept Your Invite</h1>
                        <p className="text-sm text-gray-500 mt-1">Set a password to activate your account</p>
                    </div>

                    {!token && (
                        <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                            <FiAlertCircle className="text-red-500 shrink-0" size={18} />
                            <p className="text-sm text-red-600">This invite link is missing its token. Please use the link from your email.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <input
                                    type={show ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    autoComplete="new-password"
                                    className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm outline-none focus:border-[var(--color-primary)]"
                                />
                                <button type="button" onClick={() => setShow(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                            <input
                                type={show ? 'text' : 'password'}
                                required
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Re-enter your password"
                                autoComplete="new-password"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[var(--color-primary)]"
                            />
                            {confirm && password !== confirm && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !token}
                            className="w-full py-2.5 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-semibold hover:brightness-95 transition-all disabled:opacity-60"
                        >
                            {isLoading ? 'Activating…' : 'Activate Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already activated?{' '}
                        <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Sign In</Link>
                    </p>
                </>
            )}
        </div>
    );
};

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-sm text-gray-400">Loading…</div>}>
            <AcceptInviteInner />
        </Suspense>
    );
}

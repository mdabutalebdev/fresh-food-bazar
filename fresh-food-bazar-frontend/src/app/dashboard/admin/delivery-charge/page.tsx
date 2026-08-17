"use client";

import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from '@/redux/api/siteContentApi';
import toast from 'react-hot-toast';

const InputField = ({ label, type = 'text', value, onChange, placeholder, helper, ...props }: any) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
        <input
            type={type}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none font-medium text-sm"
            value={value} onChange={onChange} placeholder={placeholder} {...props}
        />
        {helper && <p className="text-[10px] text-gray-400 mt-1 italic">{helper}</p>}
    </div>
);

export default function DeliveryChargePage() {
    const { data: res, isLoading } = useGetSiteContentQuery({});
    const [updateContent, { isLoading: isSaving }] = useUpdateSiteContentMutation();

    const [formData, setFormData] = useState<any>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (res?.data) {
            setFormData({
                deliveryCharge: res.data.deliveryCharge || {
                    insideDhaka: 60,
                    outsideDhaka: 120,
                },
            });
        }
    }, [res]);

    const updateDeliveryCharge = (field: string, value: any) => {
        setFormData((p: any) => ({ ...p, deliveryCharge: { ...p.deliveryCharge, [field]: value } }));
    };

    const handleSave = async () => {
        try {
            await updateContent(formData).unwrap();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
            toast.success('Delivery charges saved successfully!');
        } catch (error) {
            toast.error('Failed to save delivery charges');
        }
    };

    if (isLoading || !formData) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Delivery Charge</h1>
                    <p className="text-gray-500 mt-1">Configure your location-based delivery costs</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <FiRefreshCw size={16} className="animate-spin" /> : saveSuccess ? <FiCheckCircle size={16} /> : <FiSave size={16} />}
                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                            <FiTruck size={18} className="text-[var(--color-text-primary)]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">Location Charges</h3>
                            <p className="text-xs text-gray-500">Set the amount to charge for inside and outside Dhaka</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField 
                            label="Inside Dhaka (৳)" 
                            type="number" 
                            value={formData.deliveryCharge?.insideDhaka ?? 60} 
                            onChange={(e: any) => updateDeliveryCharge('insideDhaka', Number(e.target.value))} 
                            placeholder="e.g. 60" 
                        />
                        <InputField 
                            label="Outside Dhaka (৳)" 
                            type="number" 
                            value={formData.deliveryCharge?.outsideDhaka ?? 120} 
                            onChange={(e: any) => updateDeliveryCharge('outsideDhaka', Number(e.target.value))} 
                            placeholder="e.g. 120" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

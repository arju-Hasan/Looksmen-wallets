'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  User,
  DollarSign,
  FileText,
  Sparkles,
  Trash,
} from 'lucide-react';
import {
  Transaction,
  TransactionInput,
  TransactionType,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  PaymentMethod,
} from '@/types/transaction';
import { convertImageToWebP } from '@/lib/imageUtils';
import { useUploadImage } from '@/hooks/useTransactions';

interface TransactionModalProps {
  isOpen: boolean;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  staffUsers?: string[];
  onClose: () => void;
  onSubmit: (data: TransactionInput, editingId?: string) => Promise<void>;
}

export default function TransactionModal({
  isOpen,
  initialType = 'INCOME',
  editingTransaction,
  staffUsers = [],
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [recordedBy, setRecordedBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>('');

  // Image handling & WebP conversion states
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isConvertingWebP, setIsConvertingWebP] = useState<boolean>(false);
  const [webpSavings, setWebpSavings] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImage();

  // Reset form or populate from editing transaction
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      const catList: readonly string[] =
        editingTransaction.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      const isPredefined = catList.includes(editingTransaction.category);

      if (isPredefined) {
        setCategory(editingTransaction.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(editingTransaction.category);
      }

      setAmount(String(editingTransaction.amount));
      setPaymentMethod((editingTransaction.paymentMethod as PaymentMethod) || 'Cash');
      setRecordedBy(editingTransaction.recordedBy || '');
      setNotes(editingTransaction.notes || '');

      const txDate = editingTransaction.date
        ? new Date(editingTransaction.date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);
      setDate(txDate);

      setImageUrl(editingTransaction.imageUrl || null);
      setImagePreview(editingTransaction.imageUrl || null);
      setWebpSavings(null);
    } else {
      setType(initialType);
      const defaultCategories = initialType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      setCategory(defaultCategories[0]);
      setCustomCategory('');
      setAmount('');
      setPaymentMethod('Cash');
      // Suggest last operator or default
      setRecordedBy((prev) => prev || (staffUsers[0] || ''));
      setNotes('');
      setDate(new Date().toISOString().slice(0, 16));
      setImageUrl(null);
      setImagePreview(null);
      setWebpSavings(null);
    }
    setErrorMsg(null);
  }, [isOpen, editingTransaction, initialType, staffUsers]);

  // When type toggles (Income <-> Expense), adjust default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const availableCategories = newType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setCategory(availableCategories[0]);
    setCustomCategory('');
  };

  // Image upload and client-side WebP conversion
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsConvertingWebP(true);
      setErrorMsg(null);

      // Convert to WebP client side
      const { file: webpFile, dataUrl, sizeReductionPercent } = await convertImageToWebP(file);
      setImagePreview(dataUrl);
      setWebpSavings(sizeReductionPercent);

      // Upload to Cloudinary via server API
      const res = await uploadImageMutation.mutateAsync({ file: webpFile });
      if (res?.imageUrl) {
        setImageUrl(res.imageUrl);
      }
    } catch (err: any) {
      console.error('[WebP Image Conversion/Upload Error]', err);
      setErrorMsg('Image processing failed. Using original file preview.');
    } finally {
      setIsConvertingWebP(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    setWebpSavings(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    const finalCategory = category === 'Custom' ? customCategory.trim() : category;
    if (!finalCategory) {
      setErrorMsg('Please specify a category.');
      return;
    }

    if (!recordedBy.trim()) {
      setErrorMsg('Operator name (Recorded By) is required.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: TransactionInput = {
        type,
        category: finalCategory,
        amount: parsedAmount,
        paymentMethod,
        recordedBy: recordedBy.trim(),
        notes: notes.trim() || undefined,
        imageUrl: imageUrl || undefined,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
      };

      await onSubmit(payload, editingTransaction?.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeCategories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${type === 'INCOME'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
            >
              {type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {editingTransaction ? 'Edit Transaction' : `Add ${type === 'INCOME' ? 'Income' : 'Expense'}`}
              </h3>
              <p className="text-xs text-slate-400">
                Looksmen Business Tracking System
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-md text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Type Switcher (Income vs Expense) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${type === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Income (Revenue)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${type === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Expense (Cost)</span>
            </button>
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Amount (BDT ৳) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ৳
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-md text-sm font-semibold text-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span>Date & Time *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-md text-xs text-white focus:outline-none transition [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-md text-xs text-white focus:outline-none cursor-pointer"
            >
              {activeCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Custom">+ Other Custom Category</option>
            </select>

            {category === 'Custom' && (
              <input
                type="text"
                placeholder="Enter custom category name..."
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>

          {/* Payment Method & Recorded By Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>Payment Method *</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-md text-xs text-white focus:outline-none cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            {/* Recorded By (Operator Name) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recorded By (Name) *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Owner, Tanvir, Rahim"
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  list="staff-suggestions"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-md text-xs text-white focus:outline-none transition"
                />
                <datalist id="staff-suggestions">
                  {staffUsers.map((user) => (
                    <option key={user} value={user} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Notes / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes / Details (Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Order #104, Supplier invoice #441, Friday cash settlement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Receipt / Invoice Photo (Cloudinary & WebP) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Invoice / Receipt Photo</span>
              </label>
            </div>

            {imagePreview ? (
              <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Receipt Preview"
                  className="w-14 h-14 object-cover rounded-md border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Receipt Attached (.webp)</span>
                  </div>
                  {webpSavings !== null && (
                    <p className="text-[11px] text-slate-400">
                      Compressed by {webpSavings}% with WebP
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                  title="Remove Image"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/50 rounded-xl p-4 text-center cursor-pointer transition hover:bg-slate-950 flex flex-col items-center justify-center gap-1.5"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <Camera className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium">Click to upload screenshot or receipt</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  PNG, JPG, HEIC automatically converted to lightweight WebP
                </p>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {isConvertingWebP && (
              <p className="text-xs text-amber-400 animate-pulse text-center">
                Optimizing and compressing image to WebP...
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isConvertingWebP}
              className={`px-5 py-2.5 rounded-md font-bold text-xs text-white transition flex items-center gap-2 shadow-lg cursor-pointer ${type === 'INCOME'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950'
                } ${(isSubmitting || isConvertingWebP) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Entry...</span>
                </>
              ) : (
                <span>{editingTransaction ? 'Save Changes' : `Confirm ${type}`}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Tag, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { getOrCreateConversationForListing, sendChatOffer } from '@/lib/chatService';
import { useRouter } from 'next/navigation';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  currentUser?: any;
  onOfferSent?: (offerAmount: number) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
  onOfferSent,
}) => {
  const router = useRouter();

  const originalPrice = React.useMemo(() => {
    if (!listing) return 0;
    if (typeof listing.price === 'number') return listing.price;
    return parseFloat(String(listing.price || '0').replace(/\D/g, '')) || 0;
  }, [listing]);

  const currency = listing?.currency === 'RON' ? 'RON' : 'EUR';

  // Quick discount calculation chips
  const quickDiscounts = React.useMemo(() => {
    if (!originalPrice || originalPrice <= 0) return [];
    return [
      { label: '-5%', amount: Math.round(originalPrice * 0.95) },
      { label: '-10%', amount: Math.round(originalPrice * 0.90) },
      { label: '-15%', amount: Math.round(originalPrice * 0.85) },
      { label: '-20%', amount: Math.round(originalPrice * 0.80) },
    ];
  }, [originalPrice]);

  const [selectedOffer, setSelectedOffer] = useState<string>(() => {
    return originalPrice > 0 ? String(Math.round(originalPrice * 0.9)) : '';
  });
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync initial offer when modal opens
  React.useEffect(() => {
    if (isOpen && originalPrice > 0) {
      setSelectedOffer(String(Math.round(originalPrice * 0.9)));
      setIsSuccess(false);
    }
  }, [isOpen, originalPrice]);

  if (!isOpen || !listing) return null;

  const currentOfferNum = parseFloat(selectedOffer.replace(/\D/g, '')) || 0;
  const discountPercent = originalPrice > 0 && currentOfferNum > 0 && currentOfferNum < originalPrice
    ? Math.round(((originalPrice - currentOfferNum) / originalPrice) * 100)
    : 0;

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentOfferNum <= 0 || isSubmitting) return;

    setIsSubmitting(true);

    const buyerName = currentUser?.displayName || localStorage.getItem('monky_user_name') || 'Eu';
    const buyerAvatar = currentUser?.photoURL || localStorage.getItem('monky_user_avatar') || '/images/avatar/an61.png';
    const buyerId = currentUser?.uid || 'current-user-id';

    const conv = getOrCreateConversationForListing(listing, {
      id: buyerId,
      name: buyerName,
      avatar: buyerAvatar,
    });

    sendChatOffer(
      conv.id,
      currentOfferNum,
      { id: buyerId, name: buyerName, avatar: buyerAvatar },
      offerMessage.trim() || undefined
    );

    setIsSubmitting(false);
    setIsSuccess(true);

    if (onOfferSent) {
      onOfferSent(currentOfferNum);
    }

    setTimeout(() => {
      onClose();
      router.push(`/mesaje?id=${conv.id}`);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1e1e24] w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title and Close button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#03c1a2]/15 text-[#03c1a2] flex items-center justify-center">
              <Tag size={18} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Fă o ofertă de preț
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Listing Mini Card */}
        <div className="flex items-center gap-3.5 my-4 p-3 bg-slate-50 dark:bg-[#282830] rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
            <img
              src={listing.image || (listing.gallery && listing.gallery[0]) || '/42.svg'}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {listing.title}
            </h4>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs text-slate-400">Preț inițial:</span>
              <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                {originalPrice.toLocaleString('ro-RO')} {currency}
              </span>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Check size={28} className="stroke-[3]" />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Ofertă trimisă cu succes!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Deschidem conversația din chat...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitOffer} className="space-y-4">
            {/* Quick Suggestion Chips */}
            {quickDiscounts.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Sugestii rapide de negociere:
                </label>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {quickDiscounts.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSelectedOffer(String(item.amount))}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        currentOfferNum === item.amount
                          ? 'bg-[#03c1a2] text-slate-950 border-[#03c1a2] shadow-xs scale-102'
                          : 'bg-slate-100 dark:bg-[#282830] text-slate-700 dark:text-slate-300 border-transparent hover:border-[#03c1a2]/40'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold opacity-80">{item.label}</span>
                      <span className="truncate">{item.amount.toLocaleString('ro-RO')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Suma oferită de tine:
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={selectedOffer}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setSelectedOffer(clean);
                  }}
                  className="w-full bg-slate-50 dark:bg-[#282830] border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 pr-16 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#03c1a2]/40 focus:border-[#03c1a2] transition-all"
                  placeholder="Introdu prețul..."
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400 dark:text-slate-500">
                  {currency}
                </span>
              </div>
              {discountPercent > 0 && (
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  Economisești {discountPercent}% față de prețul afișat!
                </p>
              )}
            </div>

            {/* Optional message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mesaj către vânzător (opțional):
              </label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-[#282830] border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#03c1a2]/40 focus:border-[#03c1a2] resize-none transition-all placeholder-slate-400"
                placeholder="Ex: Pot veni să o văd mâine cu banii cash..."
              />
            </div>

            {/* Buyer Protection Micro-Badge */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#282830]/50 p-2.5 rounded-xl">
              <ShieldCheck size={16} className="text-[#03c1a2] flex-shrink-0" />
              <span>Oferta nu te obligă la plată imediată. Vânzătorul o poate accepta sau refuza.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#282830] hover:bg-slate-200 dark:hover:bg-[#343440] transition-colors cursor-pointer"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={currentOfferNum <= 0 || isSubmitting}
                className={`flex-2 py-3 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer select-none ${
                  currentOfferNum > 0
                    ? 'bg-[#03c1a2] hover:bg-[#02ab8f] active:scale-98 text-slate-950 shadow-[#03c1a2]/25'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>{isSubmitting ? 'Se trimite...' : 'Trimite oferta'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

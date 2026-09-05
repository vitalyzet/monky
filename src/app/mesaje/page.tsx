'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Send,
  Tag,
  ArrowLeft,
  Check,
  CheckCheck,
  MoreVertical,
  Trash2,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Phone,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  ChatConversation,
  ChatMessage,
  getChatConversations,
  getChatConversationById,
  getOrCreateConversationForListing,
  sendChatMessage,
  sendChatOffer,
  updateOfferDecision,
  markChatConversationAsRead,
  deleteChatConversation,
} from '@/lib/chatService';
import { getCachedListing } from '@/lib/adCache';
import { getListingById } from '@/lib/db';
import { useAuth } from '@/lib/AuthContext';
import { OfferModal } from '@/components/OfferModal';
import { formatTimeAgo } from '@/lib/timeUtils';

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser } = useAuth();

  const conversationIdParam = searchParams.get('id');
  const listingIdParam = searchParams.get('listing');

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(conversationIdParam || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'buying' | 'selling'>('all');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUser?.uid || 'current-user-id';
  const currentUserName = currentUser?.displayName || (typeof window !== 'undefined' ? localStorage.getItem('monky_user_name') : null) || 'Eu';
  const currentUserAvatar = currentUser?.photoURL || (typeof window !== 'undefined' ? localStorage.getItem('monky_user_avatar') : null) || '/images/avatar/an61.png';

  // Load conversations and subscribe to updates
  const refreshConversations = () => {
    const list = getChatConversations();
    setConversations(list);
    return list;
  };

  useEffect(() => {
    const initialList = refreshConversations();

    // If listing parameter is present, resolve or create conversation
    if (listingIdParam) {
      const cached = getCachedListing(listingIdParam);
      if (cached) {
        const conv = getOrCreateConversationForListing(cached, {
          id: currentUserId,
          name: currentUserName,
          avatar: currentUserAvatar,
        });
        setSelectedConvId(conv.id);
        refreshConversations();
      } else {
        getListingById(listingIdParam).then((found) => {
          if (found) {
            const conv = getOrCreateConversationForListing(found, {
              id: currentUserId,
              name: currentUserName,
              avatar: currentUserAvatar,
            });
            setSelectedConvId(conv.id);
            refreshConversations();
          }
        });
      }
    } else if (conversationIdParam) {
      setSelectedConvId(conversationIdParam);
    } else if (initialList.length > 0 && window.innerWidth >= 768) {
      // On desktop auto-select first conversation
      setSelectedConvId(initialList[0].id);
    }

    const handleChatUpdate = () => {
      refreshConversations();
    };

    window.addEventListener('monky_chat_updated', handleChatUpdate);
    return () => window.removeEventListener('monky_chat_updated', handleChatUpdate);
  }, [listingIdParam, conversationIdParam]);

  // Selected conversation object
  const activeConversation = React.useMemo(() => {
    if (!selectedConvId) return null;
    return conversations.find((c) => c.id === selectedConvId) || null;
  }, [conversations, selectedConvId]);

  // Mark as read when active conversation changes
  useEffect(() => {
    if (selectedConvId) {
      markChatConversationAsRead(selectedConvId, false);
      scrollToBottom('auto');
    }
  }, [selectedConvId, activeConversation?.messages.length]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      if (chatScrollContainerRef.current) {
        chatScrollContainerRef.current.scrollTo({
          top: chatScrollContainerRef.current.scrollHeight,
          behavior,
        });
      }
    }, 40);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || messageInput).trim();
    if (!text || !selectedConvId) return;

    sendChatMessage(selectedConvId, text, {
      id: currentUserId,
      name: currentUserName,
      avatar: currentUserAvatar,
    });

    setMessageInput('');
    scrollToBottom('smooth');
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleOfferDecision = (offerId: string, decision: 'accepted' | 'rejected') => {
    if (!selectedConvId) return;
    updateOfferDecision(selectedConvId, offerId, decision, currentUserName);
    scrollToBottom();
  };

  const handleDeleteChat = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Sigur dorești să ștergi această conversație?')) {
      deleteChatConversation(convId);
      if (selectedConvId === convId) {
        setSelectedConvId(null);
      }
      refreshConversations();
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (activeTab === 'buying' && c.buyerId !== currentUserId) return false;
    if (activeTab === 'selling' && c.sellerId !== currentUserId && c.buyerId === currentUserId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.listingTitle.toLowerCase().includes(q);
      const matchUser = c.sellerName.toLowerCase().includes(q) || c.buyerName.toLowerCase().includes(q);
      const matchMsg = c.lastMessage.toLowerCase().includes(q);
      return matchTitle || matchUser || matchMsg;
    }
    return true;
  });

  const QUICK_QUESTIONS = [
    'Bună, mai este valabil anunțul?',
    'Care este ultimul preț?',
    'Unde se poate vedea produsul?',
    'Acceptați schimburi?',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f8] dark:bg-[#131417] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar favoriteCount={0} />

      <main className="flex-grow max-w-[1240px] w-full mx-auto px-2 sm:px-4 py-3 sm:py-6 flex flex-col">
        {/* Breadcrumb Bar */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Tevinde.ro
          </Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Mesaje & Chat</span>
        </div>

        {/* Chat Application Container */}
        <div className="flex-grow bg-white dark:bg-[#1c1d22] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[640px] max-h-[calc(100vh-140px)]">
          {/* Left Panel: Conversation List */}
          <div
            className={`w-full md:w-[360px] lg:w-[400px] border-r border-slate-200/80 dark:border-slate-800 flex flex-col ${
              selectedConvId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Left Header & Search */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <MessageCircle size={22} className="text-[#03c1a2]" />
                  <span>Mesaje</span>
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {conversations.length} {conversations.length === 1 ? 'conversație' : 'conversații'}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Caută în mesaje sau anunțuri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#26272e] border-none rounded-2xl py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#03c1a2]/40"
                />
              </div>

              {/* Tabs: Toate / Cumpăr / Vând */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#26272e] p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-[#1c1d22] text-slate-950 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Toate
                </button>
                <button
                  onClick={() => setActiveTab('buying')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'buying'
                      ? 'bg-white dark:bg-[#1c1d22] text-slate-950 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Cumpăr
                </button>
                <button
                  onClick={() => setActiveTab('selling')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'selling'
                      ? 'bg-white dark:bg-[#1c1d22] text-slate-950 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Vând
                </button>
              </div>
            </div>

            {/* Conversations Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 no-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#26272e] flex items-center justify-center mb-3 text-slate-400">
                    <MessageCircle size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Nu ai mesaje încă</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Când contactezi un vânzător sau faci o ofertă, conversațiile vor apărea aici.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === selectedConvId;
                  const otherName = conv.buyerId === currentUserId ? conv.sellerName : conv.buyerName;
                  const otherAvatar = conv.buyerId === currentUserId ? conv.sellerAvatar : conv.buyerAvatar;
                  const unread = conv.buyerId === currentUserId ? conv.unreadCountBuyer : conv.unreadCountSeller;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        router.replace(`/mesaje?id=${conv.id}`, { scroll: false });
                      }}
                      className={`p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer transition-colors relative group ${
                        isSelected
                          ? 'bg-[#03c1a2]/10 dark:bg-[#03c1a2]/15'
                          : 'hover:bg-slate-50 dark:hover:bg-[#23242a]'
                      }`}
                    >
                      {/* Left: Thumbnail combo (Seller avatar + Ad photo badge) */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-xs border border-slate-200 dark:border-slate-700">
                          <img
                            src={conv.listingImage || '/42.svg'}
                            alt={conv.listingTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full overflow-hidden border-2 border-white dark:border-[#1c1d22] bg-slate-800 shadow-xs">
                          <img
                            src={otherAvatar || '/images/avatar/an32.png'}
                            alt={otherName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                            {conv.listingTitle}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400 flex-shrink-0">
                            {formatTimeAgo(conv.lastMessageTime)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {otherName}:{' '}
                            </span>
                            {conv.lastMessage}
                          </p>

                          {unread > 0 && (
                            <span className="w-5 h-5 rounded-full bg-[#03c1a2] text-slate-950 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                              {unread}
                            </span>
                          )}
                        </div>

                        {/* Offer micro-indicator */}
                        {conv.currentOffer && (
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold">
                            <Tag size={11} className="text-[#03c1a2]" />
                            <span className="text-[#03c1a2]">
                              Ofertă: {conv.currentOffer.amount.toLocaleString('ro-RO')} {conv.currentOffer.currency}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[9px] ${
                                conv.currentOffer.status === 'accepted'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                  : conv.currentOffer.status === 'rejected'
                                  ? 'bg-red-100 dark:bg-red-950/60 text-red-600'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              }`}
                            >
                              {conv.currentOffer.status === 'accepted'
                                ? 'Acceptată'
                                : conv.currentOffer.status === 'rejected'
                                ? 'Refuzată'
                                : 'În așteptare'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Delete button on hover */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteChat(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title="Șterge conversația"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Thread */}
          {activeConversation ? (
            <div className="flex-1 flex flex-col bg-[#fdfdfd] dark:bg-[#18191e]">
              {/* Active Chat Header */}
              <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1c1d22] flex items-center justify-between gap-3 z-10 shadow-2xs">
                {/* Back button for mobile */}
                <button
                  type="button"
                  onClick={() => setSelectedConvId(null)}
                  className="md:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
                >
                  <ArrowLeft size={18} />
                </button>

                {/* Ad Details Mini Bar */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                    <img
                      src={activeConversation.listingImage || '/42.svg'}
                      alt={activeConversation.listingTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {activeConversation.listingTitle}
                      </h3>
                      <Link
                        href={`/anunt/${activeConversation.listingId}`}
                        className="text-slate-400 hover:text-[#03c1a2] transition-colors"
                        title="Vezi anunțul"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className="font-black text-[#03c1a2] text-sm">
                        {activeConversation.listingPrice.toLocaleString('ro-RO')}{' '}
                        {activeConversation.listingCurrency}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 dark:text-slate-400 truncate">
                        Vânzător: <strong className="text-slate-700 dark:text-slate-300">{activeConversation.sellerName}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Make Offer Button in Chat Header */}
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(true)}
                  className="bg-[#03c1a2] hover:bg-[#02ab8f] active:scale-95 text-slate-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all flex-shrink-0 cursor-pointer"
                >
                  <Tag size={15} />
                  <span>Fă o ofertă</span>
                </button>
              </div>

              {/* Chat Messages Body */}
              <div
                ref={chatScrollContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar"
              >
                {/* Security Banner */}
                <div className="flex items-center justify-center">
                  <div className="bg-slate-100 dark:bg-[#24262e] border border-slate-200 dark:border-slate-700/60 rounded-2xl px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 max-w-md text-center">
                    <ShieldCheck size={16} className="text-[#03c1a2] flex-shrink-0" />
                    <span>
                      Nu trimite bani în avans și nu comunica date bancare confidențiale în chat.
                    </span>
                  </div>
                </div>

                {/* Message items */}
                {activeConversation.messages.map((msg) => {
                  const isMine = msg.senderId === currentUserId;

                  // Render Offer Card in Chat
                  if (msg.type === 'offer' && msg.offer) {
                    const offer = msg.offer;
                    const canDecide = !isMine && offer.status === 'pending';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} my-3`}
                      >
                        <div className="max-w-[340px] sm:max-w-[400px] w-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 dark:to-[#22242c] border-2 border-[#03c1a2] rounded-3xl p-4 sm:p-5 shadow-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#03c1a2] uppercase tracking-wider">
                              <Tag size={14} />
                              <span>Ofertă de preț</span>
                            </span>
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                offer.status === 'accepted'
                                  ? 'bg-emerald-500 text-slate-950'
                                  : offer.status === 'rejected'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-amber-400 text-slate-950 animate-pulse'
                              }`}
                            >
                              {offer.status === 'accepted'
                                ? 'ACCEPTATĂ'
                                : offer.status === 'rejected'
                                ? 'REFUZATĂ'
                                : 'ÎN AȘTEPTARE'}
                            </span>
                          </div>

                          <div className="my-2">
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                              {offer.amount.toLocaleString('ro-RO')} {offer.currency}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Preț inițial: {offer.originalPrice.toLocaleString('ro-RO')} {offer.currency}
                            </div>
                          </div>

                          {msg.text && msg.text !== `Ofertă de preț trimisă: ${offer.amount.toLocaleString('ro-RO')} ${offer.currency}` && (
                            <p className="text-xs text-slate-700 dark:text-slate-300 italic my-2 bg-white/50 dark:bg-black/20 p-2.5 rounded-xl">
                              "{msg.text}"
                            </p>
                          )}

                          {/* Decision Buttons for the recipient */}
                          {canDecide && (
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <button
                                type="button"
                                onClick={() => handleOfferDecision(offer.id, 'rejected')}
                                className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                              >
                                Refuză
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOfferDecision(offer.id, 'accepted')}
                                className="flex-1 py-2 px-3 rounded-xl bg-[#03c1a2] hover:bg-[#02ab8f] text-slate-950 font-extrabold text-xs transition-colors shadow-xs cursor-pointer"
                              >
                                Acceptă oferta
                              </button>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400 text-right mt-2">
                            {formatTimeAgo(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render System Message
                  if (msg.type === 'system') {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="bg-slate-200 dark:bg-[#282a32] text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-1.5 rounded-full shadow-2xs">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }

                  // Render Standard Text Message
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-300 dark:bg-slate-700 flex-shrink-0 shadow-2xs">
                          <img
                            src={msg.senderAvatar || '/images/avatar/an32.png'}
                            alt={msg.senderName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-2xs text-sm leading-relaxed whitespace-pre-wrap ${
                          isMine
                            ? 'bg-[#03c1a2] text-slate-950 font-medium rounded-br-xs'
                            : 'bg-white dark:bg-[#252730] text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div
                          className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${
                            isMine ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          <span>{formatTimeAgo(msg.timestamp)}</span>
                          {isMine && <CheckCheck size={13} className="text-slate-900" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-[#1a1b20] border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
                  <Sparkles size={13} className="text-[#03c1a2]" />
                  <span>Întrebări rapide:</span>
                </span>
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-white dark:bg-[#26272e] border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#03c1a2] hover:text-[#03c1a2] whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-white dark:bg-[#1c1d22] border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 sm:gap-3">
                {/* Make offer quick button */}
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(true)}
                  className="p-2.5 sm:px-3 sm:py-2.5 rounded-2xl bg-[#03c1a2]/15 text-[#03c1a2] hover:bg-[#03c1a2]/25 font-bold text-xs flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer"
                  title="Fă o ofertă de preț"
                >
                  <Tag size={18} />
                  <span className="hidden sm:inline">Ofertă</span>
                </button>

                {/* Text input */}
                <input
                  type="text"
                  placeholder="Scrie un mesaj..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-slate-100 dark:bg-[#26272e] border-none rounded-2xl py-3 px-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#03c1a2]/40"
                />

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!messageInput.trim()}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                    messageInput.trim()
                      ? 'bg-[#03c1a2] hover:bg-[#02ab8f] text-slate-950 shadow-md shadow-[#03c1a2]/20 active:scale-95'
                      : 'bg-slate-100 dark:bg-[#26272e] text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>

              {/* Offer Modal */}
              {isOfferModalOpen && (
                <OfferModal
                  isOpen={isOfferModalOpen}
                  onClose={() => setIsOfferModalOpen(false)}
                  listing={{
                    id: activeConversation.listingId,
                    title: activeConversation.listingTitle,
                    price: activeConversation.listingPrice,
                    currency: activeConversation.listingCurrency,
                    image: activeConversation.listingImage,
                    seller: {
                      name: activeConversation.sellerName,
                      avatar: activeConversation.sellerAvatar,
                    },
                  }}
                  currentUser={currentUser}
                  onOfferSent={() => {
                    refreshConversations();
                    scrollToBottom();
                  }}
                />
              )}
            </div>
          ) : (
            /* Empty State on Desktop */
            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#fafafa] dark:bg-[#18191e]">
              <div className="w-20 h-20 rounded-3xl bg-[#03c1a2]/15 text-[#03c1a2] flex items-center justify-center mb-4 shadow-sm">
                <MessageCircle size={38} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Selectează o conversație
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Alege un chat din lista din stânga pentru a trimite mesaje și a negocia prețul prin oferte în timp real.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f8] dark:bg-[#131417]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#03c1a2] border-t-transparent animate-spin" />
            <span className="text-xs text-slate-500">Se încarcă chat-ul...</span>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

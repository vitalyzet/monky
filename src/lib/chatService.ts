import { getDistinctSellerAvatar } from './avatarUtils';
import { AdListing } from './db';

export interface ChatOffer {
  id: string;
  amount: number;
  originalPrice: number;
  currency: 'EUR' | 'RON';
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterAmount?: number;
  createdAt: number;
  senderId: string;
  senderName: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  read: boolean;
  type?: 'text' | 'offer' | 'system';
  offer?: ChatOffer;
}

export interface ChatConversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingCurrency: 'EUR' | 'RON';
  listingImage: string;
  listingLocation?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  messages: ChatMessage[];
  currentOffer?: ChatOffer;
}

const STORAGE_KEY = 'monky_chat_conversations';

/**
 * Returns demo conversations if storage is empty
 */
function getInitialSeedConversations(): ChatConversation[] {
  const now = Date.now();
  return [
    {
      id: 'conv-demo-mercedes-s400',
      listingId: 'demo-mercedes-s400',
      listingTitle: 'Mercedes S400 4MATIC AMG Line',
      listingPrice: 40000,
      listingCurrency: 'EUR',
      listingImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80',
      listingLocation: 'Slatina, Olt',
      sellerId: 'seller-alex37',
      sellerName: 'ALEX37',
      sellerAvatar: '/images/avatar/an32.png',
      buyerId: 'current-user-id',
      buyerName: 'Eu (Cumpărător)',
      buyerAvatar: '/images/avatar/an61.png',
      lastMessage: 'Am acceptat oferta ta de 38.500 EUR! Când dorești să stabilim întâlnirea?',
      lastMessageTime: now - 15 * 60 * 1000, // 15 mins ago
      unreadCountBuyer: 1,
      unreadCountSeller: 0,
      currentOffer: {
        id: 'offer-1',
        amount: 38500,
        originalPrice: 40000,
        currency: 'EUR',
        status: 'accepted',
        createdAt: now - 35 * 60 * 1000,
        senderId: 'current-user-id',
        senderName: 'Eu',
      },
      messages: [
        {
          id: 'msg-1',
          senderId: 'current-user-id',
          senderName: 'Eu',
          senderAvatar: '/images/avatar/an61.png',
          text: 'Bună ziua! Mai este valabil Mercedesul?',
          timestamp: now - 45 * 60 * 1000,
          read: true,
          type: 'text',
        },
        {
          id: 'msg-2',
          senderId: 'seller-alex37',
          senderName: 'ALEX37',
          senderAvatar: '/images/avatar/an32.png',
          text: 'Salut! Da, mașina este încă disponibilă. Are toate reviziile la zi la reprezentanță.',
          timestamp: now - 40 * 60 * 1000,
          read: true,
          type: 'text',
        },
        {
          id: 'msg-3',
          senderId: 'current-user-id',
          senderName: 'Eu',
          senderAvatar: '/images/avatar/an61.png',
          text: 'Am trimis o ofertă de preț de 38.500 EUR.',
          timestamp: now - 35 * 60 * 1000,
          read: true,
          type: 'offer',
          offer: {
            id: 'offer-1',
            amount: 38500,
            originalPrice: 40000,
            currency: 'EUR',
            status: 'accepted',
            createdAt: now - 35 * 60 * 1000,
            senderId: 'current-user-id',
            senderName: 'Eu',
          },
        },
        {
          id: 'msg-4',
          senderId: 'seller-alex37',
          senderName: 'ALEX37',
          senderAvatar: '/images/avatar/an32.png',
          text: 'Am acceptat oferta ta de 38.500 EUR! Când dorești să stabilim întâlnirea?',
          timestamp: now - 15 * 60 * 1000,
          read: false,
          type: 'text',
        },
      ],
    },
    {
      id: 'conv-demo-audi-a1',
      listingId: 'demo-audi-a1',
      listingTitle: 'Audi A1 Sportback 1.4 TFSI S-Line',
      listingPrice: 15900,
      listingCurrency: 'EUR',
      listingImage: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&auto=format&fit=crop&q=80',
      listingLocation: 'Sinaia, Prahova',
      sellerId: 'seller-marian',
      sellerName: 'Marian Auto',
      sellerAvatar: '/images/avatar/an54.png',
      buyerId: 'current-user-id',
      buyerName: 'Eu (Cumpărător)',
      buyerAvatar: '/images/avatar/an61.png',
      lastMessage: 'Bună, mă interesează oferta dumneavoastră. Mai este valabilă?',
      lastMessageTime: now - 2 * 3600 * 1000, // 2 hours ago
      unreadCountBuyer: 0,
      unreadCountSeller: 0,
      messages: [
        {
          id: 'msg-a1-1',
          senderId: 'current-user-id',
          senderName: 'Eu',
          senderAvatar: '/images/avatar/an61.png',
          text: 'Bună, mă interesează oferta dumneavoastră. Mai este valabilă?',
          timestamp: now - 2 * 3600 * 1000,
          read: true,
          type: 'text',
        },
      ],
    },
  ];
}

/**
 * Gets all conversations from local storage
 */
export function getChatConversations(): ChatConversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getInitialSeedConversations();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const seed = getInitialSeedConversations();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  } catch (e) {
    console.error('Error reading chat conversations:', e);
    return [];
  }
}

/**
 * Saves conversations array to local storage and triggers window event
 */
export function saveChatConversations(conversations: ChatConversation[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    window.dispatchEvent(new CustomEvent('monky_chat_updated'));
  } catch (e) {
    console.error('Error saving chat conversations:', e);
  }
}

/**
 * Gets a specific conversation by ID
 */
export function getChatConversationById(id: string): ChatConversation | null {
  const all = getChatConversations();
  return all.find((c) => c.id === id) || null;
}

/**
 * Creates or gets an existing conversation for a listing
 */
export function getOrCreateConversationForListing(
  listing: any,
  buyerInfo: { id?: string; name?: string; avatar?: string }
): ChatConversation {
  const all = getChatConversations();
  const listingId = String(listing.id || 'unknown');
  const buyerId = buyerInfo.id || 'current-user-id';
  const buyerName = buyerInfo.name || 'Eu';
  const buyerAvatar = buyerInfo.avatar || '/images/avatar/an61.png';

  const sellerName = listing.seller?.name || listing.sellerName || 'Vânzător';
  const sellerId = listing.userId || `seller-${sellerName.toLowerCase().replace(/\s+/g, '_')}`;
  const sellerAvatar = listing.seller?.avatar || getDistinctSellerAvatar(sellerName, sellerId);

  const priceNum = typeof listing.price === 'number' ? listing.price : parseFloat(String(listing.price || '0').replace(/\D/g, '')) || 0;
  const currency = listing.currency === 'RON' ? 'RON' : 'EUR';
  const image = listing.image || (listing.gallery && listing.gallery[0]) || '/42.svg';

  // Check if conversation already exists for this listing & buyer
  const existing = all.find((c) => c.listingId === listingId && c.buyerId === buyerId);
  if (existing) {
    return existing;
  }

  const newConv: ChatConversation = {
    id: `conv-${listingId}-${Date.now().toString(36)}`,
    listingId,
    listingTitle: listing.title || 'Anunț fără titlu',
    listingPrice: priceNum,
    listingCurrency: currency,
    listingImage: image,
    listingLocation: listing.location || 'România',
    sellerId,
    sellerName,
    sellerAvatar,
    buyerId,
    buyerName,
    buyerAvatar,
    lastMessage: 'Conversație inițiată',
    lastMessageTime: Date.now(),
    unreadCountBuyer: 0,
    unreadCountSeller: 0,
    messages: [],
  };

  const updated = [newConv, ...all];
  saveChatConversations(updated);
  return newConv;
}

/**
 * Sends a regular text message into a conversation
 */
export function sendChatMessage(
  conversationId: string,
  text: string,
  sender: { id: string; name: string; avatar?: string }
): ChatConversation | null {
  if (!text.trim()) return null;
  const all = getChatConversations();
  const idx = all.findIndex((c) => c.id === conversationId);
  if (idx === -1) return null;

  const conv = all[idx];
  const now = Date.now();
  const isBuyer = sender.id === conv.buyerId;

  const newMsg: ChatMessage = {
    id: `msg-${now}-${Math.random().toString(36).substring(2, 7)}`,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    text: text.trim(),
    timestamp: now,
    read: false,
    type: 'text',
  };

  conv.messages.push(newMsg);
  conv.lastMessage = text.trim();
  conv.lastMessageTime = now;

  if (isBuyer) {
    conv.unreadCountSeller = (conv.unreadCountSeller || 0) + 1;
  } else {
    conv.unreadCountBuyer = (conv.unreadCountBuyer || 0) + 1;
  }

  all.splice(idx, 1);
  all.unshift(conv); // Bring conversation to top of list
  saveChatConversations(all);
  return conv;
}

/**
 * Sends a price offer message into a conversation
 */
export function sendChatOffer(
  conversationId: string,
  offerAmount: number,
  sender: { id: string; name: string; avatar?: string },
  customMessage?: string
): ChatConversation | null {
  if (offerAmount <= 0) return null;
  const all = getChatConversations();
  const idx = all.findIndex((c) => c.id === conversationId);
  if (idx === -1) return null;

  const conv = all[idx];
  const now = Date.now();
  const isBuyer = sender.id === conv.buyerId;

  const offerObj: ChatOffer = {
    id: `offer-${now}-${Math.random().toString(36).substring(2, 6)}`,
    amount: offerAmount,
    originalPrice: conv.listingPrice,
    currency: conv.listingCurrency,
    status: 'pending',
    createdAt: now,
    senderId: sender.id,
    senderName: sender.name,
  };

  conv.currentOffer = offerObj;

  const summaryText = customMessage?.trim() || `Ofertă de preț trimisă: ${offerAmount.toLocaleString('ro-RO')} ${conv.listingCurrency}`;

  const newMsg: ChatMessage = {
    id: `msg-${now}-${Math.random().toString(36).substring(2, 7)}`,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    text: summaryText,
    timestamp: now,
    read: false,
    type: 'offer',
    offer: offerObj,
  };

  conv.messages.push(newMsg);
  conv.lastMessage = `Ofertă: ${offerAmount.toLocaleString('ro-RO')} ${conv.listingCurrency}`;
  conv.lastMessageTime = now;

  if (isBuyer) {
    conv.unreadCountSeller = (conv.unreadCountSeller || 0) + 1;
  } else {
    conv.unreadCountBuyer = (conv.unreadCountBuyer || 0) + 1;
  }

  all.splice(idx, 1);
  all.unshift(conv);
  saveChatConversations(all);
  return conv;
}

/**
 * Accepts or rejects an offer in a conversation
 */
export function updateOfferDecision(
  conversationId: string,
  offerId: string,
  decision: 'accepted' | 'rejected',
  actorName: string
): ChatConversation | null {
  const all = getChatConversations();
  const idx = all.findIndex((c) => c.id === conversationId);
  if (idx === -1) return null;

  const conv = all[idx];
  const now = Date.now();

  if (conv.currentOffer && conv.currentOffer.id === offerId) {
    conv.currentOffer.status = decision;
  }

  // Update offer object in message history
  conv.messages.forEach((msg) => {
    if (msg.offer && msg.offer.id === offerId) {
      msg.offer.status = decision;
    }
  });

  const decisionText = decision === 'accepted'
    ? `🎉 ${actorName} a ACCEPTAT oferta de preț!`
    : `❌ ${actorName} a REFUZAT oferta de preț.`;

  const systemMsg: ChatMessage = {
    id: `sys-${now}`,
    senderId: 'system',
    senderName: 'Sistem Tevinde',
    text: decisionText,
    timestamp: now,
    read: true,
    type: 'system',
  };

  conv.messages.push(systemMsg);
  conv.lastMessage = decisionText;
  conv.lastMessageTime = now;

  all.splice(idx, 1);
  all.unshift(conv);
  saveChatConversations(all);
  return conv;
}

/**
 * Marks all messages in conversation as read for the current user
 */
export function markChatConversationAsRead(conversationId: string, isSeller = false) {
  const all = getChatConversations();
  const conv = all.find((c) => c.id === conversationId);
  if (!conv) return;

  if (isSeller) {
    conv.unreadCountSeller = 0;
  } else {
    conv.unreadCountBuyer = 0;
  }

  conv.messages.forEach((m) => {
    m.read = true;
  });

  saveChatConversations(all);
}

/**
 * Returns total unread messages count for badge display
 */
export function getTotalUnreadChatCount(): number {
  if (typeof window === 'undefined') return 0;
  const all = getChatConversations();
  return all.reduce((sum, conv) => sum + (conv.unreadCountBuyer || 0), 0);
}

/**
 * Deletes a conversation from storage
 */
export function deleteChatConversation(conversationId: string) {
  const all = getChatConversations();
  const filtered = all.filter((c) => c.id !== conversationId);
  saveChatConversations(filtered);
}

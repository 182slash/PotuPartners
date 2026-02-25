'use client';

import { useCallback, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { conversationService, messageService, userService } from '@/services/api';
import { useSocket } from './useSocket';
import toast from 'react-hot-toast';
import { debounce } from '@/lib/utils';

export function useChat() {
  const user         = useAuthStore(s => s.user);
  const store        = useChatStore();
  const socket       = useSocket();

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load staff list for contact selector ────────────────────────────────
  const loadStaff = useCallback(async () => {
    if (store.staff.length > 0) return;
    try {
      const { data } = await userService.getStaff();
      store.setStaff(data.data);
    } catch {
      // Non-critical: silently fail
    }
  }, [store]);

  // ─── Load all conversations for current user ──────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await conversationService.list();
      store.setConversations(data.data);
    } catch {
      toast.error('Could not load conversations');
    }
  }, [user, store]);

  // ─── Open or create a conversation ───────────────────────────────────────
  const openConversation = useCallback(async (
    participantId: string | null,
    isAiChat: boolean
  ) => {
    try {
      const { data } = await conversationService.createOrGet(participantId, isAiChat);
      const conv = data.data;
      store.addConversation(conv);
      store.setActiveConversation(conv.id);

      // Load messages if not already loaded
      if (!store.messages[conv.id]) {
        const { data: msgData } = await messageService.list(conv.id);
        store.setMessages(conv.id, msgData.data);
      }

      socket.joinConversation(conv.id);
    } catch {
      toast.error('Could not open conversation');
    }
  }, [store, socket]);

  // ─── Send a message ───────────────────────────────────────────────────────
  const sendMessage = useCallback((content: string, fileId?: string) => {
    const convId = store.activeId;
    if (!convId || (!content.trim() && !fileId)) return;
    socket.sendMessage(convId, content.trim(), fileId);
    socket.sendTypingStop(convId);
  }, [store.activeId, socket]);

  // ─── Delete a message ─────────────────────────────────────────────────────
  const deleteMessage = useCallback(async (messageId: string) => {
    const convId = store.activeId;
    if (!convId) return;
    try {
      await messageService.delete(messageId);
      store.deleteMessage(convId, messageId);
      socket.deleteMsg(messageId);
    } catch {
      toast.error('Could not delete message');
    }
  }, [store, socket]);

  // ─── Delete a whole conversation ──────────────────────────────────────────
  const deleteConversation = useCallback(async (convId: string) => {
    try {
      await conversationService.delete(convId);
      store.setConversations(store.conversations.filter(c => c.id !== convId));
      if (store.activeId === convId) {
        store.setStep('select');
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Could not delete conversation');
    }
  }, [store]);

  // ─── Typing indicator ─────────────────────────────────────────────────────
  const handleTyping = useCallback(
    debounce(() => {
      const convId = store.activeId;
      if (!convId) return;
      socket.sendTypingStart(convId);

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.sendTypingStop(convId);
      }, 2000);
    }, 300) as () => void,
    [store.activeId, socket]
  );

  return {
    ...store,
    loadStaff,
    loadConversations,
    openConversation,
    sendMessage,
    deleteMessage,
    deleteConversation,
    handleTyping,
    currentUser: user,
  };
}

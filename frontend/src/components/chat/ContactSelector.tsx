'use client';

import { useEffect } from 'react';
import { Bot, UserRound, ChevronRight } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { getInitials, cn } from '@/lib/utils';

export default function ContactSelector() {
  const { staff, loadStaff, openConversation } = useChat();

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const associates = staff.filter(s => s.role === 'associate');
  const partners   = staff.filter(s => s.role === 'partner');

  const selectContact = async (id: string | null, isAi: boolean) => {
    await openConversation(id, isAi);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-divider flex-shrink-0">
        <h2 className="font-serif text-lg font-light text-text-primary mb-1">
          Start a Conversation
        </h2>
        <p className="font-sans text-xs text-text-secondary font-light">
          Select who you would like to speak with.
        </p>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">

        {/* AI Chatbot */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[0.6rem] tracking-[0.2em] uppercase text-gold opacity-60 font-sans mb-2 px-1">
            AI Assistant
          </p>
          <button
            onClick={() => selectContact(null, true)}
            className="w-full flex items-center gap-3 p-3 hover:bg-surface-3 border border-transparent hover:border-gold-faint transition-all duration-200 group text-left"
          >
            <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-gold/20 to-gold/5 border border-gold-faint flex items-center justify-center">
              <Bot size={16} className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-text-primary font-light">PotuPartners AI</p>
              <p className="font-sans text-xs text-text-muted truncate">
                Ask about our services, processes & policies
              </p>
            </div>
            <ChevronRight size={14} className="text-text-muted group-hover:text-gold transition-colors flex-shrink-0" />
          </button>
        </div>

        {/* Partners */}
        {partners.length > 0 && (
          <StaffGroup
            title="Managing Partners"
            members={partners}
            onSelect={id => selectContact(id, false)}
          />
        )}

        {/* Associates */}
        {associates.length > 0 && (
          <StaffGroup
            title="Associates"
            members={associates}
            onSelect={id => selectContact(id, false)}
          />
        )}

        {/* Loading state */}
        {staff.length === 0 && (
          <div className="px-4 pt-2 space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-28" />
                  <div className="skeleton h-2 w-40" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Footer note */}
      <div className="px-5 py-3 border-t border-divider flex-shrink-0">
        <p className="font-sans text-[0.6rem] text-text-muted leading-relaxed">
          All conversations are confidential and stored securely.
        </p>
      </div>
    </div>
  );
}

function StaffGroup({
  title,
  members,
  onSelect,
}: {
  title: string;
  members: ReturnType<typeof useChat>['staff'];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="px-4 pt-4 pb-2">
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-gold opacity-60 font-sans mb-2 px-1">
        {title}
      </p>
      <div className="space-y-1">
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="w-full flex items-center gap-3 p-3 hover:bg-surface-3 border border-transparent hover:border-gold-faint transition-all duration-200 group text-left"
          >
            <div className="w-10 h-10 flex-shrink-0 bg-surface-3 border border-divider flex items-center justify-center relative">
              {m.avatarUrl ? (
                <img src={m.avatarUrl} alt={m.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-xs font-light text-gold select-none">
                  {getInitials(m.fullName)}
                </span>
              )}
              {/* Online indicator */}
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black',
                  m.isOnline ? 'bg-emerald-500' : 'bg-surface-3'
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-text-primary font-light truncate">{m.fullName}</p>
              <p className="font-sans text-xs text-text-muted truncate">{m.title ?? m.role}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {m.isOnline && (
                <span className="text-[0.55rem] text-emerald-500 font-sans tracking-wide">Online</span>
              )}
              <ChevronRight size={14} className="text-text-muted group-hover:text-gold transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

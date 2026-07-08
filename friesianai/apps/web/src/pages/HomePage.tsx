import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Code2,
  Lightbulb,
  PenLine,
  Telescope,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react';
import type { MessageAttachment } from '@/types';
import { HorseLogo } from '@/components/ui/HorseLogo';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatStore } from '@/store/chatStore';
import { setChatInputValue } from '@/utils/focus';

interface Suggestion {
  label: string;
  icon: LucideIcon;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  { label: 'Code', icon: Code2, prompt: 'Help me write a function that ' },
  { label: 'Research', icon: Telescope, prompt: 'Research and summarize the current state of ' },
  { label: 'Reason', icon: Lightbulb, prompt: 'Think step by step through this problem: ' },
  { label: 'Analyze', icon: BarChart3, prompt: 'Analyze the trade-offs between ' },
  { label: 'Write', icon: PenLine, prompt: 'Write a first draft of ' },
  { label: 'Plan', icon: CalendarCheck, prompt: 'Help me plan ' },
];

const EASE_OUT = [0.16, 1, 0.3, 1];

/**
 * First impression: a quiet, centered invitation to talk.
 * Sending from here creates the conversation and moves into it.
 */
export function HomePage() {
  const navigate = useNavigate();
  const createConversation = useChatStore((s) => s.createConversation);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const startChat = (content: string, attachments: MessageAttachment[]) => {
    const conversation = createConversation(null);
    navigate(`/c/${conversation.id}`);
    void sendMessage(conversation.id, content, attachments);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6">
      <div className="flex w-full max-w-2xl flex-col items-center pb-[8vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <HorseLogo size={56} strokeWidth={1.8} className="text-muted" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: EASE_OUT }}
          className="mt-6 text-[26px] font-medium tracking-tight text-foreground"
        >
          How can I help you today?
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: EASE_OUT }}
          className="mt-8 w-full"
        >
          <ChatInput variant="hero" autoFocus placeholder="Ask anything…" onSend={startChat} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26, ease: EASE_OUT }}
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          {SUGGESTIONS.map(({ label, icon: Icon, prompt }) => (
            <button
              key={label}
              onClick={() => setChatInputValue(prompt)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-transparent px-3.5 py-1.5 text-[13px] text-muted transition-all duration-150 hover:border-border-strong hover:bg-surface-hover hover:text-foreground cursor-pointer"
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

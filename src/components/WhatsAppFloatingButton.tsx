import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const whatsappNumber = '919154797936';
  const defaultMessage = encodeURIComponent(
    'Hello NutriCrunch! I am interested in ordering Dry Fruits Panjiri / Banana Chips. Could you assist me?'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <aside aria-label="Customer support" className="fixed bottom-6 right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#1EBE5D] hover:shadow-xl transition-all duration-200 active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
        aria-label="Chat with NutriCrunch on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline whitespace-nowrap">
          Order on WhatsApp
        </span>
      </a>
    </aside>
  );
};

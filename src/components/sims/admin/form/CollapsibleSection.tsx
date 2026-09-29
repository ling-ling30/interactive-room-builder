import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  /** Small pill shown on the right of the header. */
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Dropdown-style section: header toggles the content. */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl bg-[#f3ecdb] border border-[#e2d7bd] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[#ece2c9] transition"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-stone-800">
          {icon}
          <span>{title}</span>
        </span>
        <span className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] text-emerald-700 font-mono font-semibold px-2 py-0.5 bg-white/70 rounded-full border border-emerald-300/70">
              {badge}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && <div className="px-3.5 pb-3.5 animate-fade-in">{children}</div>}
    </div>
  );
};

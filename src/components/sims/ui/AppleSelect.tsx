import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, X } from 'lucide-react';
import { sounds } from '../../../utils/soundEffects';

export interface AppleSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode | string;
  count?: number;
  badge?: string;
  description?: string;
}

export interface AppleSelectProps {
  value: string;
  options: AppleSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  icon?: React.ReactNode;
  allowCustom?: boolean;
  customPlaceholder?: string;
  customButtonText?: string;
  onAddCustom?: (customValue: string) => void;
  disabled?: boolean;
  align?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const AppleSelect: React.FC<AppleSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  icon,
  allowCustom = false,
  customPlaceholder = 'Type new value & press Enter...',
  customButtonText = '+ Add Custom Option...',
  onAddCustom,
  disabled = false,
  align = 'left',
  size = 'md',
  label,
  theme = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      (buttonClassName.includes('bg-slate-900') ||
        buttonClassName.includes('border-slate-700') ||
        buttonClassName.includes('text-slate-100') ||
        buttonClassName.includes('text-slate-200')));

  // Selected Option Object
  const selectedOption = options.find(
    (opt) => opt.value.toLowerCase() === value.toLowerCase()
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreatingCustom(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsCreatingCustom(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus custom input when revealed
  useEffect(() => {
    if (isCreatingCustom && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [isCreatingCustom]);

  const handleToggle = () => {
    if (disabled) return;
    sounds.playSelect();
    setIsOpen(!isOpen);
    setIsCreatingCustom(false);
  };

  const handleSelectOption = (optValue: string) => {
    sounds.playSelect();
    onChange(optValue);
    setIsOpen(false);
    setIsCreatingCustom(false);
  };

  const handleCommitCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInputValue.trim();
    if (!trimmed) return;

    sounds.playSelect();
    if (onAddCustom) {
      onAddCustom(trimmed);
    } else {
      onChange(trimmed);
    }
    setCustomInputValue('');
    setIsCreatingCustom(false);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-[11px] rounded-xl min-h-[30px]',
    md: 'px-3.5 py-2 text-xs rounded-2xl min-h-[38px]',
    lg: 'px-4 py-2.5 text-sm rounded-2xl min-h-[44px]',
  }[size];

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left select-none ${className}`}
    >
      {label && (
        <span
          className={`block text-[11px] font-bold mb-1.5 tracking-tight ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label}
        </span>
      )}

      {/* Apple Liquid Glass Pull-down Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group relative flex items-center justify-between gap-2.5 w-full transition-all duration-150 cursor-pointer font-semibold outline-none
          active:scale-[0.98]
          ${sizeClasses}
          ${
            isDark
              ? 'bg-slate-900/90 hover:bg-slate-850 text-slate-100 border border-slate-750 shadow-md active:bg-slate-800'
              : 'bg-white/90 hover:bg-white text-slate-900 border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] active:bg-slate-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          ${
            isOpen
              ? isDark
                ? 'ring-2 ring-emerald-500/20 border-emerald-500'
                : 'ring-2 ring-slate-900/10 border-slate-900 bg-white'
              : ''
          }
          ${buttonClassName}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && (
            <span
              className={`shrink-0 transition-colors ${
                isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-400 group-hover:text-slate-700'
              }`}
            >
              {icon}
            </span>
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-xs">{selectedOption.icon}</span>
          )}
          <span className="truncate capitalize tracking-tight font-semibold">
            {selectedOption ? selectedOption.label : value || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedOption?.count !== undefined && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {selectedOption.count}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ease-out ${
              isOpen ? 'rotate-180' : ''
            } ${
              isDark
                ? isOpen
                  ? 'text-emerald-400'
                  : 'text-slate-400 group-hover:text-slate-200'
                : isOpen
                ? 'text-slate-900'
                : 'text-slate-400 group-hover:text-slate-700'
            }`}
          />
        </div>
      </button>

      {/* Apple-style Translucent Popover Menu */}
      <div
        className={`absolute z-50 mt-1.5 min-w-[200px] w-full max-h-[300px] overflow-hidden rounded-2xl
          backdrop-blur-2xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            isDark
              ? 'bg-slate-900/95 border border-slate-700/80 shadow-[0_16px_36px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.3)] text-slate-100'
              : 'bg-white/95 border border-slate-200/90 shadow-[0_16px_36px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] text-slate-900'
          }
          ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
          ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 -translate-y-1.5 pointer-events-none'
          }
          ${menuClassName}
        `}
      >
        {/* Scrollable Items Container */}
        <div className="p-1.5 max-h-[240px] overflow-y-auto no-scrollbar space-y-0.5">
          {options.map((option) => {
            const isSelected = option.value.toLowerCase() === value.toLowerCase();
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => handleSelectOption(option.value)}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-100 text-left cursor-pointer group active:scale-[0.98] ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/90'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon && (
                    <span className="shrink-0 text-xs leading-none">
                      {option.icon}
                    </span>
                  )}
                  <div className="flex flex-col truncate">
                    <span className="truncate capitalize font-semibold tracking-tight">
                      {option.label}
                    </span>
                    {option.description && (
                      <span
                        className={`text-[10px] truncate ${
                          isSelected
                            ? isDark
                              ? 'text-emerald-400/80'
                              : 'text-slate-300'
                            : isDark
                            ? 'text-slate-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {option.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? isDark
                            ? 'bg-emerald-400/20 text-emerald-300'
                            : 'bg-white/20 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 text-slate-300'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80'
                      }`}
                    >
                      {option.count}
                    </span>
                  )}
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isDark ? 'text-emerald-400' : 'text-emerald-400'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Value Creator Section */}
        {allowCustom && (
          <div
            className={`p-1.5 pt-1 border-t ${
              isDark
                ? 'border-slate-800 bg-slate-950/60'
                : 'border-slate-100 bg-slate-50/70'
            }`}
          >
            {!isCreatingCustom ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playSelect();
                  setIsCreatingCustom(true);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isDark
                    ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                    : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/80'
                }`}
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="tracking-tight">{customButtonText}</span>
              </button>
            ) : (
              <form
                onSubmit={handleCommitCustom}
                className="flex items-center gap-1.5 p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  ref={customInputRef}
                  type="text"
                  value={customInputValue}
                  onChange={(e) => setCustomInputValue(e.target.value)}
                  placeholder={customPlaceholder}
                  className={`flex-1 min-w-0 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none shadow-2xs border ${
                    isDark
                      ? 'bg-slate-800 border-emerald-500 text-white placeholder-slate-500'
                      : 'bg-white border-emerald-500 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!customInputValue.trim()}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold disabled:opacity-40 transition active:scale-95 cursor-pointer shrink-0 ${
                    isDark
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(false)}
                  className={`p-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

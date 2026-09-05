import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({ value, onChange, options, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listboxRef = useRef(null);
  const listboxId = useId();

  const isEmpty = !options || options.length === 0;
  const selectedOption = !isEmpty ? (options.find(opt => opt.value === value) || options[0]) : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex(opt => opt.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, value, options]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const el = listboxRef.current.children[focusedIndex];
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e) => {
    if (isEmpty) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange({ target: { value: options[focusedIndex].value } });
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (idx) => {
    onChange({ target: { value: options[idx].value } });
    setIsOpen(false);
  };

  return (
    <div 
      className={`relative ${className}`}
      ref={containerRef}
    >
      <div
        className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${isEmpty ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        tabIndex={isEmpty ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onKeyDown={handleKeyDown}
        onClick={() => !isEmpty && setIsOpen(!isOpen)}
      >
        <span className="truncate">{isEmpty ? 'No options' : selectedOption?.label || ''}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>

      {isOpen && !isEmpty && (
        <ul
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-800 bg-[#09090b] text-popover-foreground shadow-md p-1 outline-none"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-3 pr-2 text-sm outline-none transition-colors ${
                  isFocused ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50'
                }`}
                onClick={() => handleSelect(idx)}
                onMouseEnter={() => setFocusedIndex(idx)}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

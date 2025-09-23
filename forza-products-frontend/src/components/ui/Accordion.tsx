import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen = false, onToggle }) => {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 text-left hover:bg-slate-50 transition-colors rounded-lg px-2"
      >
        <span className="flex items-center gap-2 font-medium text-slate-900">
          {title}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
        <div className="px-2 text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};

interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
}

export const Accordion: React.FC<AccordionProps> = ({ children, type = 'single' }) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const handleToggle = (index: number) => {
    if (type === 'single') {
      setOpenItems(openItems.has(index) ? new Set() : new Set([index]));
    } else {
      const newOpenItems = new Set(openItems);
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
      setOpenItems(newOpenItems);
    }
  };

  return (
    <div className="space-y-0">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen: openItems.has(index),
            onToggle: () => handleToggle(index),
          });
        }
        return child;
      })}
    </div>
  );
};

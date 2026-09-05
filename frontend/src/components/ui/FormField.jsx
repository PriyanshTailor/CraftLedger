import React from 'react';
import { cn } from '../../lib/utils';

export function FormField({ label, required, children, className, hint }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800',
        'focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all bg-white',
        'placeholder:text-slate-300',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800',
        'focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all bg-white',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      rows={3}
      className={cn(
        'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800',
        'focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all bg-white resize-none',
        'placeholder:text-slate-300',
        className
      )}
      {...props}
    />
  );
}

"use client";

import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[0.8125rem] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-stone">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-[var(--radius-md)] border bg-white px-3.5 text-base outline-none transition-colors placeholder:text-sand focus:border-graphite focus:ring-2 focus:ring-graphite/10";

export const TextInput = forwardRef<HTMLInputElement, ComponentProps<"input"> & { invalid?: boolean }>(
  function TextInput({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(inputBase, "h-12", invalid ? "border-danger" : "border-graphite/15", className)}
        {...props}
      />
    );
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea"> & { invalid?: boolean }>(
  function TextArea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(inputBase, "min-h-28 py-3 leading-relaxed", invalid ? "border-danger" : "border-graphite/15", className)}
        {...props}
      />
    );
  },
);

export function Switch({
  id,
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center justify-between gap-4 py-3", disabled && "opacity-50")}>
      <span>
        <span className="block text-[0.9375rem] font-medium">{label}</span>
        {description && <span className="block text-[0.8125rem] text-stone">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="h-7 w-12 rounded-full bg-sand transition-colors peer-checked:bg-graphite peer-focus-visible:ring-2 peer-focus-visible:ring-graphite peer-focus-visible:ring-offset-2"
        />
        <span
          aria-hidden
          className="absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5"
        />
      </span>
    </label>
  );
}

"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`w-full rounded-full bg-coral-500 px-6 py-4 text-base font-semibold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`w-full rounded-full border border-coral-300 bg-white px-6 py-4 text-base font-semibold text-coral-600 transition active:scale-[0.98] disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-ink-500 underline underline-offset-4">
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl2 bg-white p-5 shadow-card ${className}`}>{children}</div>
  );
}

export function Chip({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-3 text-sm font-medium transition ${
        selected
          ? "border-coral-500 bg-coral-500 text-white shadow-soft"
          : "border-cream-200 bg-white text-ink-700"
      }`}
    >
      {children}
    </button>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  step,
  totalSteps,
}: {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
}) {
  return (
    <div className="mb-6">
      {step && totalSteps ? (
        <div className="mb-3 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < step ? "bg-coral-500" : "bg-coral-100"
              }`}
            />
          ))}
        </div>
      ) : null}
      <h1 className="text-xl font-bold text-ink-900">{title}</h1>
      {subtitle ? <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{subtitle}</p> : null}
    </div>
  );
}

export function ScreenShell({ children }: { children: ReactNode }) {
  return <main className="flex flex-1 flex-col px-6 pb-10 pt-8">{children}</main>;
}

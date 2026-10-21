"use client";

/** A submit button that asks first. Put it inside a <form action={...}>. */
export function ConfirmButton({ message, children, className = "b b--danger" }: { message: string; children: React.ReactNode; className?: string }) {
  return (
    <button
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

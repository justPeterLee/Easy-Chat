"use client";

import { ReactNode } from "react";

export function Modal({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="h-screen w-screen bg-black absolute opacity-70"></div>
      <div className="z-30 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-700 rounded p-3 text-gray-200">
        {children}
      </div>
    </>
  );
}

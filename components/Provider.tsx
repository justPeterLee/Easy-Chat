"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { UserModal } from "./modal/User-Modal";

interface ProviderProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProviderProps) => {
  return (
    <>
      <SessionProvider>
        <UserModal />
        {children}
      </SessionProvider>
    </>
  );
};

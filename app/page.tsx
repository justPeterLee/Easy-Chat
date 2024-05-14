"use client";

import { UserModal } from "@/components/modal/User-Modal";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main>
      {!session && <UserModal />}
      {JSON.stringify(session)}
    </main>
  );
}

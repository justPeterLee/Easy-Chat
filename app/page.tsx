"use client";

import { signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main>
      {JSON.stringify(session)}
      {session && (
        <button
          onClick={() => {
            signOut();
          }}
        >
          sign out
        </button>
      )}
    </main>
  );
}

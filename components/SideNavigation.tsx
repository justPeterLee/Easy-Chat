"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
export function SideNavigation() {
  const { data: session } = useSession();
  useEffect(() => {
    console.log(session);
  }, [session]);
  return (
    <div className="flex z-30 bg-neutral-900 w-80 h-screen">
      <div className="text-red-200">
        <p>{session?.user.name}</p>
      </div>
    </div>
  );
}

// user

// channels

// recent messages (memebers)

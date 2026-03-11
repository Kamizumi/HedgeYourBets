'use client';

import { useSession } from "next-auth/react";
import Image from "next/image";

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="flex items-center gap-3 text-white">
      {session.user?.image && (
        <Image
          src={session.user.image}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <span className="text-sm">
        Welcome, {session.user?.name || session.user?.email}
      </span>
    </div>
  );
}
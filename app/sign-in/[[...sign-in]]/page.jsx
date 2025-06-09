"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const { push } = useRouter();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null; // Prevents rendering before Clerk loads user

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SignIn withSignUp="false" />
      </div>
    );
  }

  push("/home");
  return null; // Prevents rendering anything else
}

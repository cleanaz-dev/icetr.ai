"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { push } = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      push("/home");
    }
  }, [isLoaded, user, push]);

  if (!isLoaded) return null;

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SignIn withSignUp={false} />
      </div>
    );
  }

  return null;
}
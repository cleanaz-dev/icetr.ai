"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/lib/hooks/useLogo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from '@clerk/nextjs';

export default function InvitePage({ userData = {} }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: userData.email || "",
    orgId: userData.orgId || "",
    id: userData.id,
    teamId: userData.teamId || "",
    userRole: userData.userRole || "Agent",
    senderUserId: userData.senderUserId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");

  const { setActive, signIn } = useSignIn()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Basic validation
      if (!formData.firstname || !formData.lastname) {
        throw new Error("First name and last name are required");
      }

      const response = await fetch(`/api/org/${orgId}/invite/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept invitation");
      }

      // Parse the response data
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success && data.signInToken) {
        try {
          // Use Clerk's signIn to create session from token
          console.log("Creating session from token:", data.signInToken);
          
          const signInAttempt = await signIn.create({
            strategy: "ticket",
            ticket: data.signInToken
          });

          if (signInAttempt.status === "complete") {
            await setActive({ session: signInAttempt.createdSessionId });
            console.log("Session set successfully");
            
            // Set redirecting state before navigation
            setIsSubmitting(false);
            setIsRedirecting(true);
            
            router.push("/home");
          } else {
            throw new Error("Sign-in not complete");
          }
          
        } catch (sessionError) {
          console.error("Error creating session from token:", sessionError);
          throw new Error("Failed to authenticate user session");
        }
      }

    } catch (err) {
      setError(err.message);
      console.error("Invite acceptance error:", err);
      setIsSubmitting(false);
      setIsRedirecting(false);
    }
  };


  return (
    <div className="flex flex-col justify-center items-center px-4 mt-10">
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-semibold">
          You've been invited to icetr.ai!
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete your profile to get started
        </p>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-2">
            <Label htmlFor="firstname">First Name *</Label>
            <Input
              id="firstname"
              name="firstname"
              type="text"
              value={formData.firstname}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  firstname: e.target.value,
                }))
              }
              required
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Last Name *</Label>
            <Input
              id="lastname"
              name="lastname"
              type="text"
              value={formData.lastname}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  lastname: e.target.value,
                }))
              }
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled={!!userData.email}
              autoComplete="email"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
             <div className="space-y-2">
            <Label htmlFor="teamId">Team ID</Label>
            <Input
              id="teamId"
              name="teamId"
              type="text"
              value={formData.teamId}
              disabled={!!userData.teamId}
              autoComplete="teamId"
              className="truncate"
            />
          </div>
            <div className="space-y-2">
            <Label htmlFor="organization">Organization ID</Label>
            <Input
              id="organization"
              name="organization"
              type="text"
              value={formData.orgId}
              disabled={!!userData.orgId}
              autoComplete="organization"
              className="truncate"
            />
          </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting || isRedirecting}>
          {isSubmitting ? "Processing..." : isRedirecting ? "Redirecting..." : "Accept Invitation"}
        </Button>
      </form>
    </div>
  );
}
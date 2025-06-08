"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/lib/hooks/useLogo";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvitePage({ userData = {} }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: userData.email || "",
    orgId: userData.orgId || "",
    id: userData.id
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Basic validation
      if (!formData.firstname || !formData.lastname) {
        throw new Error("First name and last name are required");
      }

      const response = await fetch("/api/invite/accept", {
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

      // Redirect on success
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Invite acceptance error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col  justify-center items-center px-4 mt-10">
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
          <div className="space-y-2">
            <Label htmlFor="organization">Organization ID</Label>
            <Input
              id="organization"
              name="organization"
              type="text"
              value={formData.orgId}
              disabled={!!userData.orgId}
              autoComplete="organization"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Accept Invitation"}
        </Button>
      </form>
    </div>
  );
}

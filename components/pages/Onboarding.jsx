"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  Plus,
  X,
  User,
  Mail,
  Building2,
  Globe,
  Users,
  Shield,
  UserCheck,
  Sparkles,
  ArrowRight,
  FileText
} from "lucide-react";

export default function Onboarding() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [currentStep, setCurrentStep] = useState("signup");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    code: "",
    organizationName: "",
    teamName: "",
    teamDescription: "",
    country: "",
    invites: [],
  });

  const [currentInvite, setCurrentInvite] = useState({
    email: "",
    role: "agent",
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const addInvite = () => {
    if (currentInvite.email && currentInvite.email.includes("@")) {
      setFormData((prev) => ({
        ...prev,
        invites: [...prev.invites, { ...currentInvite, id: Date.now() }],
      }));
      setCurrentInvite({ email: "", role: "standard" });
    }
  };

  const removeInvite = (id) => {
    setFormData((prev) => ({
      ...prev,
      invites: prev.invites.filter((invite) => invite.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isLoaded) {
      setError("System not ready");
      setIsLoading(false);
      return;
    }

    try {
      await signUp.create({
        emailAddress: formData.email,
        firstName: formData.firstname,
        lastName: formData.lastname,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setCurrentStep("verify");
    } catch (err) {
      console.error(err);
      setError(
        err.errors?.[0]?.message || "Failed to sign up. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isLoaded) {
      setError("System not ready");
      setIsLoading(false);
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: formData.code,
      });
      if (completeSignUp.status === "complete") {
       

        await setActive({ session: completeSignUp.createdSessionId });
        setCurrentStep("organization");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.errors?.[0]?.message || "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationSetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (formData.invites.length > 0) {
        // Send invitations logic here
      }
      const response = await fetch("/api/public/onboarding", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json", // This is crucial for JSON requests
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      router.push("/home");
    } catch (err) {
      console.error(err);
      setError("Failed to setup organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced Progress indicator
const ProgressIndicator = () => {
  const steps = [
    { key: "signup", label: "Account", icon: User, title: "Welcome aboard!", text: "Please enter your account details." },
    { key: "verify", label: "Verify", icon: Mail, title: "Check your email", text: "We’ve sent a verification code." },
    { key: "organization", label: "Setup", icon: Building2, title: "Set up your organization", text: "Add your company details and invite others." },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);
  const currentStepData = steps[currentIndex];

  return (
    <div className="w-full mb-10">
      {/* Step title + text */}
      <div className="text-center my-6">
        <h1 className="text-2xl font-bold text-primary">{currentStepData.title}</h1>
        <p className="text-muted-foreground text-sm">{currentStepData.text}</p>
      </div>

      {/* Step icons */}
      <div className="flex items-center justify-center max-w-md mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted = currentIndex > index;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500
                    ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground shadow-lg"
                        : isActive
                        ? "border-primary bg-primary/10 text-primary shadow-md scale-110"
                        : "border-muted-foreground/30 text-muted-foreground bg-background"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  {isActive && (
                    <div className="absolute -inset-1 bg-primary/20 rounded-full " />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCompleted || isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-4 h-px w-16 ${
                    isCompleted
                      ? "bg-primary shadow-sm"
                      : "bg-muted-foreground/30"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};



  // Step 1: Sign Up
  if (currentStep === "signup") {
    return (
     <>
   
     <ProgressIndicator />
     
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstname"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                First Name
              </Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                 onChange={(e) => updateFormData("firstname", e.target.value)}
                className="h-11 border-2 focus:border-primary transition-all duration-200"
                placeholder="John"
                required
                autoComplete="on"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastname"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                Last Name
              </Label>
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={(e) => updateFormData("lastname", e.target.value)}
                className="h-11 border-2 focus:border-primary transition-all duration-200"
                placeholder="Doe"
                required
                autoComplete="on"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              className="h-11 border-2 focus:border-primary transition-all duration-200"
              placeholder="john@example.com"
              required
              autoComplete="on"
            />
          </div>

          <div id="clerk-captcha" />

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-5 w-5" />
            )}
            {isLoading ? "Sending verification..." : "Continue"}
          </Button>
        </form>
        
      </>
    );
  }

  // Step 2: Verification
  if (currentStep === "verify") {
    return (
 <>
 <ProgressIndicator />
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="code"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                Verification Code
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={(e) => {
                  // Allow only numbers and limit to 6 digits
                  const value = e.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 6);
                  updateFormData("code", value);
                }}
                placeholder="Enter code here"
                className="h-12 text-center text-xl tracking-widest border-2  transition-all duration-200"
                inputMode="numeric"
                autoFocus
                required
              />
            </div>

            <div className="p-4  rounded-lg border-2 border-primary text-primary">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5  mt-0.5" />
                </div>
                <div>
                  <p className="text-sm mt-1">
                    We sent a 6-digit code to <strong>{formData.email}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-5 w-5" />
            )}
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
</>
    );
  }

  // Step 3: Organization
  if (currentStep === "organization") {
    return (
      <>
      <ProgressIndicator />
        <form onSubmit={handleOrganizationSetup} className="space-y-6 pb-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="organizationName"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Organization Name *
                </Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) =>
                    updateFormData("organizationName", e.target.value)
                  }
                  placeholder="Acme Corp"
                  className="h-11 border-2 focus:border-primary transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  Country *
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => updateFormData("country", value)}
                  required
                >
                  <SelectTrigger className="h-11 border-2 focus:border-primary transition-all duration-200">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="canada">🇨🇦 Canada</SelectItem>
                    <SelectItem value="us">🇺🇸 United States</SelectItem>
                    <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team Section - NEW */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-lg">Create Your First Team</h4>
              <Badge variant="destructive" className="ml-auto">Required</Badge>
            </div>
            
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm text-blue-700">
                Teams help organize your campaigns, users and leads. You can create more teams later.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamName" className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4 text-muted-foreground" />
                Team Name *
              </Label>
              <Input
                id="teamName"
                value={formData.teamName}
                onChange={(e) => updateFormData("teamName", e.target.value)}
                placeholder="Sales Team, Marketing Team, etc."
                className="h-11 border-2 focus:border-primary transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamDescription" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Team Description
              </Label>
              <Input
                id="teamDescription"
                value={formData.teamDescription}
                onChange={(e) => updateFormData("teamDescription", e.target.value)}
                placeholder="Brief description of this team's purpose"
                className="h-11 border-2 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-lg">Invite Your Team</h4>
                <Badge variant="secondary" className="ml-auto">
                  Optional
                </Badge>
              </div>

              <div className="p-6   ">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Input
                        type="email"
                        value={currentInvite.email}
                        onChange={(e) =>
                          setCurrentInvite((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="colleague@example.com"
                        className="h-10 border-2 focus:border-primary transition-all duration-200"
                      />
                    </div>
                    <Select
                      value={currentInvite.role}
                      onValueChange={(value) =>
                        setCurrentInvite((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="h-10 border-2 focus:border-primary transition-all duration-200 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="agent">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            Agent
                          </div>
                        </SelectItem>
                         <SelectItem value="manager">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            Manager
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addInvite}
                    disabled={
                      !currentInvite.email || !currentInvite.email.includes("@")
                    }
                    className="w-full h-10 border-2 hover:border-primary transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              </div>

              {formData.invites.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Team Members ({formData.invites.length})
                    </p>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {formData.invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {invite.role === "admin" ? (
                              <Shield className="w-4 h-4 text-primary" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {invite.email}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {invite.role}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvite(invite.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/90"
            disabled={
              isLoading || !formData.organizationName || !formData.country
            }
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
   </>
    );
  }

  return null;
}

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, Building, Settings, CheckCheck } from "lucide-react";
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function OnboardingDemo() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [verifying, setVerifying] = useState(false)
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { push } = useRouter()
 
  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    emailVerified: false,
    verificationCode: "",
    organizationName: "",
    country: "",
    inviteEmail: "",
    inviteRole: "standard",
    hasEmailSetup: false,
    aiCallingExperience: "",
  });

  const steps = [
    { number: 1, title: "Personal Info", icon: Mail },
    { number: 2, title: "Organization", icon: Building },
    { number: 3, title: "Complete", icon: CheckCheck },
  ];

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

const sendEmailVerification = async () => {
  // Validate email format before sending
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    setError("Please enter a valid email address");
    return;
  }

  if (!formData.firstName || !formData.lastName) {
    setError("Please enter your first and last name");
    return;
  }

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    // Create the sign up with email
    await signUp.create({
      emailAddress: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    // Prepare email verification
    await signUp.prepareEmailAddressVerification({
      strategy: 'email_code'
    });

    setSuccess("Verification code sent to your email!");
    setVerifying(true); // Show verification code input
    
  } catch (err) {
    console.error("Email verification error:", JSON.stringify(err, null, 2));
    
    let errorMessage = "Failed to send verification code. Please try again.";
    if (err.errors && err.errors[0]) {
      errorMessage = err.errors[0].longMessage || err.errors[0].message;
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

const handleVerification = async (e) => {
  e.preventDefault();

  if (!isLoaded || !signUp) {
    setError("Service not ready. Please try again.");
    return;
  }

  const code = formData.verificationCode.trim();
  if (!code || code.length !== 6) {
    setError("Please enter a valid 6-digit verification code");
    return;
  }

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    // Use the code provided by the user and attempt verification
    const signUpAttempt = await signUp.attemptEmailAddressVerification({
      code: code,
    });

    console.log("Sign up attempt:", signUpAttempt); // Debug log

    // If verification was completed, set the session to active
    if (signUpAttempt.status === 'complete') {
      await setActive({ session: signUpAttempt.createdSessionId });
      
      // Update form state
      setFormData(prev => ({
        ...prev,
        emailVerified: true
      }));
      
      setSuccess("Email verified successfully!");
      setVerifying(false);
      
      // Automatically move to next step after verification
      setTimeout(() => {
        setCurrentStep(2);
        setSuccess(""); // Clear success message
      }, 1500);
      
    } else {
      // If the status is not complete, check why
      console.error("Verification not complete:", signUpAttempt);
      
      // Check if we need to handle specific statuses
      if (signUpAttempt.status === 'missing_requirements') {
        setError("Additional information required. Please contact support.");
      } else {
        setError("Verification incomplete. Please try again or request a new code.");
      }
    }
  } catch (err) {
    console.error('Verification Error:', JSON.stringify(err, null, 2));
    
    let errorMessage = "Invalid verification code. Please try again.";
    
    if (err.errors && err.errors[0]) {
      const error = err.errors[0];
      if (error.code === 'form_code_incorrect') {
        errorMessage = "Incorrect verification code. Please check and try again.";
      } else if (error.code === 'form_code_expired') {
        errorMessage = "Verification code has expired. Please request a new one.";
      } else {
        errorMessage = error.longMessage || error.message;
      }
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

// Add a function to resend verification code
const resendVerificationCode = async () => {
  if (!isLoaded || !signUp) return;

  setLoading(true);
  setError("");

  try {
    await signUp.prepareEmailAddressVerification({
      strategy: 'email_code'
    });
    setSuccess("New verification code sent!");
  } catch (err) {
    console.error("Resend error:", err);
    setError("Failed to resend code. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const submitOnboarding = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Onboarding completed successfully!");
        // Redirect after success
        setTimeout(() => push('/dashboard'), 2000);
      } else {
        setError(data.error || "Failed to complete onboarding");
      }
    } catch (err) {
      setError("Failed to submit onboarding data");
    } finally {
      setLoading(false);
    }
  };

const renderStep1 = () => (
  <div className="space-y-4">
    {!verifying ? (
      // Initial form - collect email and names
      <>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              placeholder="John"
              disabled={formData.emailVerified}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              placeholder="Doe"
              disabled={formData.emailVerified}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            placeholder="john@example.com"
            disabled={formData.emailVerified}
          />
        </div>

        {!formData.emailVerified && (
          <Button
            onClick={sendEmailVerification}
            disabled={!formData.email || !formData.firstName || !formData.lastName || loading}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        )}
      </>
    ) : (
      // Verification form - show only when verifying
      <>
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">Verify your email</h3>
          <p className="text-sm text-gray-600">
            Enter the verification code sent to {formData.email}
          </p>
        </div>
        
        <form onSubmit={handleVerification} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="verificationCode">Enter your verification code</Label>
            <Input
              id="verificationCode"
              value={formData.verificationCode}
              onChange={(e) => updateFormData("verificationCode", e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              autoComplete
              required
              
            />
          </div>
          
          <Button
            type="submit"
            disabled={formData.verificationCode.length !== 6 || loading}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
        
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={resendVerificationCode}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Sending..." : "Resend Code"}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => {
              setVerifying(false);
              updateFormData("verificationCode", "");
              setError("");
              setSuccess("");
            }}
            className="w-full"
          >
            Back to email entry
          </Button>
        </div>
      </>
    )}

    {formData.emailVerified && (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span>Email verified successfully!</span>
      </div>
    )}
  </div>
);

  const renderStep2 = () => (
    <div className="flex w-full">
     
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* User Information Section */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-500">First Name</Label>
            <p className="text-gray-900">{formData.firstName}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-500">Last Name</Label>
            <p className="text-gray-900">{formData.lastName}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-500">Email</Label>
            <p className="text-gray-900 flex items-center gap-2">
              {formData.email}
              {formData.emailVerified && (
                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Organization Information Section */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900">Organization Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-500">Organization Name</Label>
            <p className="text-gray-900">{formData.organizationName}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-500">Country</Label>
            <p className="text-gray-900">
              {formData.country === 'us' ? 'United States' : 'Canada'}
            </p>
          </div>
        </div>
      </div>

      {/* Invited Team Member (if exists) */}
      {formData.inviteEmail && (
        <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900">Team Member Invitation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-gray-900">{formData.inviteEmail}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">Role</Label>
              <p className="text-gray-900 capitalize">{formData.inviteRole}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const canProceedStep1 = formData.firstName && formData.lastName && formData.emailVerified;
  const canProceedStep2 = formData.organizationName && formData.country;
  const canCompleteStep3 = true;

  return (
    <div className="md:min-w-3xl mx-auto min-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Our Platform</CardTitle>
          <CardDescription>
            Let's get you set up in just a few steps
          </CardDescription>

          {/* Progress Bar */}
          <div className="w-full">
            <Progress value={(currentStep / 3) * 100} className="w-full" />
            <div className="flex justify-between mt-2">
              {steps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.number}
                    className={`flex items-center gap-2 text-sm ${
                      currentStep >= step.number
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                    {step.title}
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div id="clerk-captcha" />

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  loading ||
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={submitOnboarding}
                disabled={loading || !canCompleteStep3}
              >
                {loading ? "Completing..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
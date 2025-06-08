import { z } from "zod";

export const onboardingSchema = z.object({
  // Step 1: Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  emailVerified: z.boolean().default(false),
  
  // Step 2: Organization
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  country: z.enum(["canada", "us"], {
    required_error: "Please select a country",
  }),
  inviteEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  inviteRole: z.enum(["admin", "standard"]).optional(),
  
  // Step 3: Preferences
  hasEmailSetup: z.boolean(),
  aiCallingExperience: z.enum(["never", "little", "pro"], {
    required_error: "Please select your AI calling experience",
  }),
});

export const emailVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().min(6, "Verification code must be 6 characters"),
});

export const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "standard"]),
  organizationId: z.string(),
});

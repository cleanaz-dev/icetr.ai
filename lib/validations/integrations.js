// lib/validations/integrations.js
import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .optional()
  .nullable()
  .refine(v => !v || new URL(v), "Must be a valid URL")
  .transform(v => v?.trim() || null);

const optionalString = z.string().optional().nullable();

export const twilioIntegrationSchema = z.object({
  enabled: z.boolean().default(false),
  accountSid: z.string().optional(),
  authToken: z.string().optional(),
  apiKey: optionalString,
  apiSecret: optionalString,
  appSid: z.string().optional(),
  phoneNumbers: z.array(z.string()).optional().nullable().default([]),
  voiceUrl: optionalUrlSchema,
  smsUrl: optionalUrlSchema,
}).superRefine((data, ctx) => {
  if (data.enabled) {
    if (!data.accountSid?.startsWith("AC")) ctx.addIssue({ path: ["accountSid"], message: "Must be a valid Twilio Account SID" });
    if (!data.authToken || data.authToken.length < 32) ctx.addIssue({ path: ["authToken"], message: "Auth Token must be at least 32 characters" });
  }
});

export const twilioTestSchema = z.object({
  sid: z.string().regex(/^AC[a-f0-9]{32}$/),
  token: z.string().min(32),
});

export const validateTwilioIntegration = d => twilioIntegrationSchema.safeParse(d);
export const validateTwilioTest       = d => twilioTestSchema.safeParse(d);

export const formatZodError = e =>
  Object.fromEntries(e.errors.map(err => [err.path.join('.'), err.message]));23545
// Helper to get first error message
export const getFirstErrorMessage = (error) => {
  return error.errors[0]?.message || "Validation failed";
};
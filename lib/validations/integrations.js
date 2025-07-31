// lib/validations/integrations.js
import { z } from "zod";

const phoneRegex = /^\+?[1-9]\d{1,14}$/;           // E.164
const uuidRegex    = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;


const optionalUrlSchema = z
  .string()
  .optional()
  .nullable()
  .refine(v => !v || new URL(v), "Must be a valid URL")
  .transform(v => v?.trim() || null);

const optionalString = z.string().optional().nullable();

export const blandAiIntegrationSchema = z.object({
  enabled:         z.boolean().default(false),
  apiKey:          z.string().optional(),
  webhookUrl:      optionalUrlSchema,
  phoneNumbers:    z.array(z.string()).optional().default([]),
  voiceId:         z.array(z.string()).optional().default([]),
  maxCallDuration: z.number().int().min(1).max(14400).optional().nullable(), // 1-4 hrs
  recordCalls:     z.boolean().default(true),
  transferNumbers: z.array(z.string()).optional().default([]),
  temperature:     z.number().min(0).max(1).optional().default(0.7),
  model:           z.enum(["base", "enhanced", "turbo"]).optional().default("enhanced"),
})
.superRefine((data, ctx) => {
  if (!data.enabled) return;

  /* 1. Skip validation if the key is already encrypted (doesn’t look like org_…) */
  if (data.apiKey && data.apiKey.startsWith('org') === false) {
    /* 2. Only throw if the key is *not* the encrypted/saved one.
          We can recognise an encrypted key because it is longer and
          doesn’t start with “org”.  A quick heuristic: */
    const looksEncrypted = data.apiKey.length > 50 && !data.apiKey.startsWith('org');
    if (!looksEncrypted) {
      ctx.addIssue({ path: ['apiKey'], message: 'Must be a valid Bland AI key (org…)' });
    }
  }

  // if (!data.phoneNumbers?.length)
  //   ctx.addIssue({ path: ["phoneNumbers"], message: "At least one phone number is required" });

  data.phoneNumbers.forEach((n, i) => {
    if (!phoneRegex.test(n))
      ctx.addIssue({ path: ["phoneNumbers", i], message: "Invalid E.164 number" });
  });

  data.transferNumbers.forEach((n, i) => {
    if (n && !phoneRegex.test(n))
      ctx.addIssue({ path: ["transferNumbers", i], message: "Invalid E.164 number" });
  });

 data.voiceId?.forEach((v, i) => {
    if (typeof v !== 'string' || v.trim().length === 0) {
      ctx.addIssue({
        path: ["voiceId", i],
        code: z.ZodIssueCode.custom,
        message: "Voice ID must be a non-empty string"
      });
    }
  });
});

export const blandAiTestSchema = z.object({
  apiKey: z.string().regex(/^bland_ai_key_/),
});

export const validateBlandAiIntegration = d => blandAiIntegrationSchema.safeParse(d);
export const validateBlandAiTest       = d => blandAiTestSchema.safeParse(d);



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
  // Required when enabled
  if (data.enabled) {
    if (!data.accountSid?.startsWith("AC"))
      ctx.addIssue({ path: ["accountSid"], message: "Must be a valid Twilio Account SID" });
    if (!data.authToken || data.authToken.length < 32)
      ctx.addIssue({ path: ["authToken"], message: "Auth Token must be at least 32 characters" });
  }

  // Optional, but validate format if provided
  if (data.appSid && !/^AP[a-f0-9]{32}$/.test(data.appSid))
    ctx.addIssue({ path: ["appSid"], message: "Must be a valid Twilio App SID (starts with AP)" });

  if (data.apiKey && data.apiKey.length < 32)
    ctx.addIssue({ path: ["apiKey"], message: "API Key must be at least 32 characters" });

  if (data.apiSecret && data.apiSecret.length < 32)
    ctx.addIssue({ path: ["apiSecret"], message: "API Secret must be at least 32 characters" });
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


export const trainingSchema = z.object({
  name: z.string().min(1, "Training name is required"),
  scenario: z.object({
    description: z.string().optional(),
    objectives: z.string().optional(),
    targetAudience: z.string().optional(),
    keyPoints: z.array(z.string()).optional(),
  }),
  scripts: z.object({
    opening: z.string().optional(),
    rebuttal: z.string().optional(),
    features: z.string().optional(),
    closing: z.string().optional(),
  }),
  voiceId: z.string().optional(),
  prompt: z.string().optional(),
  webhookUrl: z.string().optional(),
});


export const calendlyIntegrationSchema = z.object({
  enabled: z.boolean().default(false),
  orgUri: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal("")).nullable(),
}).superRefine((data, ctx) => {
  // Required when enabled
  if (data.enabled) {
    if (!data.orgUri) {
      ctx.addIssue({ 
        path: ["orgUri"], 
        message: "Calendly URL is required when enabled" 
      });
    }
  }

  // Optional validation for URI format
  if (data.orgUri && !data.orgUri.startsWith("https://calendly.com/")) {
    ctx.addIssue({ 
      path: ["orgUri"], 
      message: "Must be a valid Calendly URL (e.g., https://calendly.com/your-username)" 
    });
  }

  // Optional validation for webhook URL format
  if (data.webhookUrl) {
    if (!z.string().url().safeParse(data.webhookUrl).success) {
      ctx.addIssue({ 
        path: ["webhookUrl"], 
        message: "Must be a valid webhook URL" 
      });
    }
  }
});

export const validateCalendlyIntegration = d => calendlyIntegrationSchema.safeParse(d);
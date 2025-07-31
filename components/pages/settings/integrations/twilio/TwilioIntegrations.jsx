"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import {
  validateTwilioIntegration,
  validateTwilioTest,
  formatZodError,
  getFirstErrorMessage,
} from "@/lib/validations/integrations";
import PurchasePhoneNumberDialog from "./PurchasePhoneNumberDialog";
import Link from "next/link";


export default function TwilioIntegrations({ integration = {}, orgId }) {
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [enabled, setEnabled] = useState(integration.enabled ?? false);
  const [sid, setSid] = useState(integration.accountSid ?? "");
  const [token, setToken] = useState(integration.authToken ?? "");
  const [appSid, setAppSid] = useState(integration.appSid ?? "");
  const [apiSecret, setApiSecret] = useState(integration.apiSecret ?? "");
  const [apiKey, setApiKey] = useState(integration.apiKey ?? "");
  const [voiceUrl, setVoiceUrl] = useState(integration.voiceUrl);
  const [smsUrl, setSmsUrl] = useState(integration.smsUrl ?? "");
  const [errors, setErrors] = useState({});
  const [openTwilioDialog, setOpenTwilioDialog] = useState(null);
  const formRef = useRef(null);
console.log({
  enabled,
  sid,
  token,
  appSid,
  apiSecret,
  apiKey,
  voiceUrl,
});

  function hasIntegrationValues() {
  return (
    enabled &&
    Boolean(sid) &&
    Boolean(token) &&
    Boolean(appSid) &&
    Boolean(apiSecret) &&
    Boolean(apiKey) && 
    Boolean(voiceUrl)
   
  );
}


  // Update state when prop data changes
  useEffect(() => {
    if (!integration) return;
    setEnabled(integration.enabled ?? false);
    setSid(integration.accountSid ?? "");
    setToken(integration.authToken ?? "");
    setAppSid(integration.appSid ?? "");
    setApiKey(integration.apiKey ?? "");
    setApiSecret(integration.apiSecret ?? "");
    setVoiceUrl(integration.voiceUrl ?? "");
    setSmsUrl(integration.smsUrl ?? "");
    setErrors({});
  }, [integration]);

  const handleSave = async () => {
    if (!orgId) {
      toast.error("Organization ID is required");
      return;
    }

    // 1. Map to the keys the schema expects
    const formData = {
      enabled,
      ...(enabled && {
        accountSid: sid.trim(),
        authToken: token.trim(),
        appSid: appSid.trim() || null,
        apiKey: apiKey.trim() || null,
        apiSecret: apiSecret.trim() || null,
        voiceUrl: voiceUrl.trim() || null,
        smsUrl: smsUrl.trim() || null,
      }),
    };

    // 2. Validate
    const validation = validateTwilioIntegration(formData);
    if (!validation.success) {
      const formattedErrors = formatZodError(validation.error);
      setErrors(formattedErrors);
      toast.error(getFirstErrorMessage(validation.error));
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`/api/org/${orgId}/integrations/twilio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Save failed");
      }

      toast.success("Twilio settings saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const testTwilio = async () => {
    if (!orgId) {
      toast.error("Organization ID is required");
      return;
    }

    // Prepare test data
    const testData = {
      sid: sid.trim(),
      token: token.trim(),
    };

    // Validate test data
    const validation = validateTwilioTest(testData);

    if (!validation.success) {
      const formattedErrors = formatZodError(validation.error);
      setErrors(formattedErrors);
      toast.error(getFirstErrorMessage(validation.error));
      return;
    }

    setTestLoading(true);
    try {
      const res = await fetch(`/api/org/${orgId}/integrations/test/twilio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data), // Use validated data
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Test failed");
      }

      toast.success("Twilio connection test successful!");
    } catch (error) {
      console.error("Test error:", error);
      toast.error(
        error instanceof Error ? error.message : "Twilio test failed"
      );
    } finally {
      setTestLoading(false);
    }
  };

  const handleDisableIntegration = async () => {
    setDisabling(true);
    try {
      const response = await fetch(`/api/org/${orgId}/integrations/twilio`, {
        method: "PATCH",
        body: JSON.stringify({
          enabled: false,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        toast.error("Unable to disable Twilio Integration. Please try again.");
        return;
      }
      setEnabled(false);
      toast.success("Disabled Twilio Integration successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setDisabling(false);
    }
  };

  const handleShow = () => {
    setShow(!show);
    if (!show) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const hasRequiredFields = sid.trim() && token.trim();

  return (
    <div>
      <div className="flex gap-6 items-start px-4">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center space-x-2">
              <CardTitle>Twilio SMS/Voice</CardTitle>
              <PurchasePhoneNumberDialog
                open={openTwilioDialog}
                setOpen={setOpenTwilioDialog}
                orgId={orgId}
                orgIntegrationId={integration.id}
              />
              {hasIntegrationValues() && (
                <Button size="sm" asChild>
                  <Link href="/settings/phone-configuration">
                    Phone Configuration
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              {enabled && integration && (
                <Button size="sm" variant="ghost" onClick={handleShow}>
                  {show ? "Hide" : "Show"}
                </Button>
              )}
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </CardHeader>

          {enabled && show && (
            <CardContent ref={formRef} className="space-y-4">
              {/* Account SID */}
              <div className="space-y-2">
                <Label htmlFor="sid">Account SID *</Label>
                <Input
                  id="sid"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={sid}
                  onChange={(e) => setSid(e.target.value)}
                  className={
                    errors.sid
                      ? "border-red-500"
                      : sid
                      ? "border-green-500/50" // Color when there's a value
                      : "" // Default when empty
                  }
                />
                {errors.twilioAccountSid && (
                  <p className="text-sm text-red-500">
                    {errors.twilioAccountSid}
                  </p>
                )}
              </div>
              {/* Auth Token */}
              <div className="space-y-2">
                <Label htmlFor="token">Auth Token *</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="••••••••"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className={
                    errors.twilioAuthToken
                      ? "border-red-500"
                      : token
                      ? "border-emerald-500/50"
                      : ""
                  }
                />
                {errors.twilioAuthToken && (
                  <p className="text-sm text-red-500">
                    {errors.twilioAuthToken}
                  </p>
                )}
              </div>
              {/* App SID */}
              <div className="space-y-2">
                <Label htmlFor="appSid">Twilio App SID (optional)</Label>
                <Input
                  id="appSid"
                  placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={appSid}
                  onChange={(e) => setAppSid(e.target.value)}
                  className={
                    errors.appSid
                      ? "border-red-500"
                      : appSid
                      ? "border-emerald-500/50"
                      : ""
                  }
                />
                {errors.appSid && (
                  <p className="text-sm text-red-500">{errors.appSid}</p>
                )}
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key (optional)</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={
                    errors.apiKey
                      ? "border-red-500"
                      : apiKey
                      ? "border-emerald-500/50"
                      : ""
                  }
                  autoComplete="off"
                />
                {errors.apiKey && (
                  <p className="text-sm text-red-500">{errors.apiKey}</p>
                )}
              </div>

              {/* API Secret */}
              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret (optional)</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="••••••••"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className={
                    errors.apiSecret
                      ? "border-red-500"
                      : apiSecret
                      ? "border-emerald-500/50"
                      : ""
                  }
                  autoComplete="off"
                />
                {errors.apiSecret && (
                  <p className="text-sm text-red-500">{errors.apiSecret}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceUrl">Voice Webhook URL</Label>
                <Input
                  id="voiceUrl"
                  value={voiceUrl}
                  onChange={(e) => setVoiceUrl(e.target.value)}
                  className={errors.twilioVoiceUrl ? "border-red-500" : ""}
                 
                />
                {errors.twilioVoiceUrl && (
                  <p className="text-sm text-red-5000">
                    {errors.twilioVoiceUrl}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsUrl">SMS Webhook URL</Label>
                <Input
                  id="smsUrl"
                  value={`https://icretrai.vercel.app/api/org/${orgId}/sms`}
                  onChange={(e) => setSmsUrl(e.target.value)}
                  className={errors.twilioSmsUrl ? "border-red-500" : ""}
                  readOnly
                  disabled
                />
                {errors.twilioSmsUrl && (
                  <p className="text-sm text-red-500">{errors.twilioSmsUrl}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          )}

          {/* Show save button when disabled but has existing data */}
          {!enabled && (sid || token || voiceUrl) && (
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Integration is disabled. Settings are preserved.
              </div>
              <Button
                onClick={handleDisableIntegration}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          )}
        </Card>

        <div className="w-48 bg-card p-5 rounded-xl border text-center">
          <Button
            variant="outline"
            onClick={testTwilio}
            className="w-full"
            disabled={!enabled || !hasRequiredFields || testLoading}
          >
            {testLoading ? "Testing..." : "Test Connection"}
          </Button>
          {enabled && !hasRequiredFields && (
            <p className="text-xs text-muted-foreground">
              SID and Token required
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

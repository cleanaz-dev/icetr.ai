"use client";

import { useState, useEffect } from "react";
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

export default function TwilioIntegrations({ integration = {}, orgId }) {
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [enabled, setEnabled] = useState(integration.enabled ?? false);
  const [sid, setSid] = useState(integration.accountSid ?? "");
  const [token, setToken] = useState(integration.authToken ?? "");
  const [voiceUrl, setVoiceUrl] = useState(integration.voiceUrl ?? "");
  const [smsUrl, setSmsUrl] = useState(integration.smsUrl ?? "");
  const [errors, setErrors] = useState({});
  const [openTwilioDialog, setOpenTwilioDialog] = useState(null)

  // Update state when prop data changes
  useEffect(() => {
    if (!integration) return;

    setEnabled(integration.enabled ?? true);
    setSid(integration.accountSid ?? "");
    setToken(integration.authToken ?? "");
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

  const hasRequiredFields = sid.trim() && token.trim();

  return (
    <div>
      <header className="p-4">
        <h1 className="text-lg font-semibold">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect Twilio and other services to power calls, texts, and
          automations.
        </p>
      </header>

      <div className="flex gap-6 items-start px-4">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <CardTitle>Twilio SMS/Voice</CardTitle>
              <PurchasePhoneNumberDialog 
                open={openTwilioDialog}
                setOpen={setOpenTwilioDialog}
                orgId={orgId}
                orgIntegrationId={integration.id}
              />
            </div>
            <div className="flex gap-6">
              
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </CardHeader>

          {enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sid">Account SID *</Label>
                <Input
                  id="sid"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={sid}
                  onChange={(e) => setSid(e.target.value)}
                  className={errors.twilioAccountSid ? "border-red-500" : ""}
                />
                {errors.twilioAccountSid && (
                  <p className="text-sm text-red-500">
                    {errors.twilioAccountSid}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Auth Token *</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="••••••••"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className={errors.twilioAuthToken ? "border-red-500" : ""}
                />
                {errors.twilioAuthToken && (
                  <p className="text-sm text-red-500">
                    {errors.twilioAuthToken}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceUrl">Voice Webhook URL</Label>
                <Input
                  id="voiceUrl"
                  placeholder="https://your-app.com/twilio/voice"
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
                  placeholder="https://your-app.com/twilio/sms"
                  value={smsUrl}
                  onChange={(e) => setSmsUrl(e.target.value)}
                  className={errors.twilioSmsUrl ? "border-red-500" : ""}
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
          {!enabled && (sid || token || voiceUrl || smsUrl) && (
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

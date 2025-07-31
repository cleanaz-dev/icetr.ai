"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  calendlyIntegrationSchema,
  formatZodError,
} from "@/lib/validations/integrations";

// Calendly Integration Schema

export default function CalendlyIntegration({
  integration,
  orgId,
  onSave,
  onTest,
  loading = false,
}) {
  const [enabled, setEnabled] = useState(false);
  const [orgUri, setOrgUri] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [testing, setTesting] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const formRef = useRef(null);

  // Update state when prop data changes
  useEffect(() => {
    if (!integration) return;
    setEnabled(integration.enabled ?? false);
    setOrgUri(integration.orgUri ?? "");
    setWebhookUrl(integration.webhookUrl ?? "");
    setErrors({});
  }, [integration]);

  const handleShow = () => {
    setShow(!show);
  };

  const handleSave = async () => {
    // Clear previous errors
    setErrors({});

    // Map to the keys the schema expects
    const formData = {
      enabled,
      ...(enabled && {
        orgUri: orgUri.trim() || null,
        webhookUrl: webhookUrl.trim() || null,
        orgId: orgId,
      }),
    };

    // Validate with schema
    const validation = calendlyIntegrationSchema.safeParse(formData);

    if (!validation.success) {
      const formattedErrors = formatZodError(validation.error);
      setErrors(formattedErrors);
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleTest = async () => {
    if (!enabled || !apiKey.trim()) {
      setErrors({ apiKey: "API Key is required for testing" });
      return;
    }

    setTesting(true);
    setErrors({});

    try {
      const testData = {
        apiKey: apiKey.trim(),
        orgUri: orgUri.trim() || null,
      };

      await onTest(testData);
    } catch (error) {
      setErrors({ test: error.message || "Test failed" });
    } finally {
      setTesting(false);
    }
  };

  const handleDisableIntegration = async () => {
    setDisabling(true);
    try {
      const response = await fetch(`/api/org/${orgId}/integrations/calendly`, {
        method: "PATCH",
        body: JSON.stringify({
          enabled: false,
          integrationId: integration?.id
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        toast.error(
          "Unable to disable Calendly Integration. Please try again."
        );
        return;
      }

      setEnabled(false);
      setShow(false); // Hide the panel when disabled
      toast.success("Disabled Calendly Integration successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div>
      <div className="flex gap-6 items-start px-4">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center space-x-2">
              <CardTitle>Calendly Integration</CardTitle>
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
              {/* API Key */}

              {/* Organization URI */}
              <div className="space-y-2">
                <Label htmlFor="orgUri">Organization URI *</Label>
                <Input
                  id="orgUri"
                  placeholder="https://calendly.com/your-organization"
                  value={orgUri}
                  onChange={(e) => setOrgUri(e.target.value)}
                  className={
                    errors.orgUri
                      ? "border-red-500"
                      : orgUri
                      ? "border-emerald-500/50"
                      : ""
                  }
                />
                {errors.orgUri && (
                  <p className="text-sm text-red-500">{errors.orgUri}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your Calendly organization URL
                </p>
              </div>

              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-app.com/webhooks/calendly"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className={
                    errors.webhookUrl
                      ? "border-red-500"
                      : webhookUrl
                      ? "border-emerald-500/50"
                      : ""
                  }
                />
                {errors.webhookUrl && (
                  <p className="text-sm text-red-500">{errors.webhookUrl}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  URL to receive Calendly event notifications
                </p>
              </div>

              {/* Test Connection */}
              {enabled && (
                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTest}
                      disabled={testing}
                      size="sm"
                    >
                      {testing ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? "Saving..." : "Save Configuration"}
                    </Button>
                  </div>
                  {errors.test && (
                    <p className="text-sm text-red-500 mt-2">{errors.test}</p>
                  )}
                </div>
              )}

              {/* Info Section */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">
                  Setup Instructions:
                </h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to Calendly Developer Settings</li>
                  <li>Create a new Personal Access Token</li>
                  <li>Copy your Organization URI from your Calendly account</li>
                  <li>
                    Optionally configure webhook URL for event notifications
                  </li>
                </ol>
              </div>
            </CardContent>
          )}

          {/* Show save button when disabled but has existing data */}
          {!enabled && (orgUri || webhookUrl) && (
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
                {disabling ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

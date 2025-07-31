"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PhoneForwarded } from "lucide-react";
import { toast } from "sonner";
import {
  validateBlandAiIntegration,
  validateBlandAiTest,
  formatZodError,
  getFirstErrorMessage,
} from "@/lib/validations/integrations";

export default function BlandAiIntegrations({ integration = {}, orgId }) {
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [enabled, setEnabled] = useState(integration.enabled);
  const [apiKey, setApiKey] = useState(integration.apiKey ?? "");
  const [webhookUrl, setWebhookUrl] = useState(`https://icetrai.vercel.app/api/org/${orgId}/training/webhook`);
  const [phoneNumbers, setPhoneNumbers] = useState(
    integration.phoneNumbers ?? []
  );
  const [voiceId, setVoiceId] = useState(integration.voiceId ?? []);
  const [maxCallDuration, setMaxCallDuration] = useState(
    integration.maxCallDuration ?? 3600
  );
  const [recordCalls, setRecordCalls] = useState(
    integration.recordCalls ?? true
  );
  const [transferNumbers, setTransferNumbers] = useState(
    integration.transferNumbers ?? []
  );
  const [temperature, setTemperature] = useState(
    integration.temperature ?? 0.7
  );
  const [model, setModel] = useState(integration.model ?? "enhanced");
  const [errors, setErrors] = useState({});
  const formRef = useRef(null)

  useEffect(() => {
    if (!integration) return;
    setEnabled(integration.enabled ?? false);
    setApiKey(integration.apiKey ?? "");
    setPhoneNumbers(integration.phoneNumbers ?? []);
    setVoiceId(integration.voiceId ?? []);
    setMaxCallDuration(integration.maxCallDuration ?? 3600);
    setRecordCalls(integration.recordCalls ?? true);
    setTransferNumbers(integration.transferNumbers ?? []);
    setTemperature(integration.temperature ?? 0.7);
    setModel(integration.model ?? "enhanced");
    setErrors({});
  }, [integration]);

  const addItem = (setter) => () => setter((prev) => [...prev, ""]);
  const updateItem = (setter, idx) => (e) =>
    setter((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)));
  const removeItem = (setter, idx) => () =>
    setter((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!orgId) {
      toast.error("Organization ID is required");
      return;
    }

    const formData = {
      enabled,
      ...(enabled && {
        apiKey: apiKey.trim(),
        webhookUrl: webhookUrl.trim() || null,
        phoneNumbers: phoneNumbers.filter(Boolean),
        voiceId: voiceId.filter(Boolean),
        maxCallDuration: Number(maxCallDuration),
        recordCalls,
        transferNumbers: transferNumbers.filter(Boolean),
        temperature: Number(temperature),
        model: model.trim() || null,
      }),
    };

    const validation = validateBlandAiIntegration(formData);
    if (!validation.success) {
      const formattedErrors = formatZodError(validation.error);
      setErrors(formattedErrors);
      toast.error(getFirstErrorMessage(validation.error));
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`/api/org/${orgId}/integrations/blandAi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Save failed");
      }

      toast.success("Bland AI settings saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const testBland = async () => {
    if (!orgId) {
      toast.error("Organization ID is required");
      return;
    }

    const testData = { apiKey: apiKey.trim() };
    const validation = validateBlandAiTest(testData);

    if (!validation.success) {
      const formattedErrors = formatZodError(validation.error);
      setErrors(formattedErrors);
      toast.error(getFirstErrorMessage(validation.error));
      return;
    }

    setTestLoading(true);
    try {
      const res = await fetch(`/api/org/${orgId}/integrations/test/bland`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Test failed");
      }

      toast.success("Bland AI connection test successful!");
    } catch (error) {
      console.error("Test error:", error);
      toast.error(
        error instanceof Error ? error.message : "Bland AI test failed"
      );
    } finally {
      setTestLoading(false);
    }
  };

  const handleDisableIntegration = async () => {
    setDisabling(true);
    try {
      const response = await fetch(`/api/org/${orgId}/integrations/bland`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: false }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        toast.error(
          "Unable to disable Bland AI integration. Please try again."
        );
        return;
      }
      setEnabled(false);
      toast.success("Disabled Bland AI Integration successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setDisabling(false);
    }
  };

const handleShow = () => {
  setShow(!show)
  if (!show) {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }
}

  const hasRequiredFields = apiKey.trim() && phoneNumbers.length > 0;

  return (
    <div>
     

      <div className="flex gap-6 items-start px-4">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <div className="flex items-center space-x-2">
              
              <CardTitle>Bland AI Voice</CardTitle>
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
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key *</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="bland_ai_key_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={
                    errors.apiKey
                      ? "border-red-500"
                      : apiKey
                      ? "border-green-500/50"
                      : ""
                  }
                />
                {errors.apiKey && (
                  <p className="text-sm text-red-500">{errors.apiKey}</p>
                )}
              </div>

              {/* Phone Numbers */}
              <div className="space-y-2">
                <Label>Phone Numbers *</Label>
                {phoneNumbers.map((num, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="+1234567890"
                      value={num}
                      onChange={updateItem(setPhoneNumbers, idx)}
                      className={errors.phoneNumbers ? "border-red-500" : ""}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={removeItem(setPhoneNumbers, idx)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addItem(setPhoneNumbers)}
                >
                  Add Phone Number
                </Button>
                {errors.phoneNumbers && (
                  <p className="text-sm text-red-500">{errors.phoneNumbers}</p>
                )}
              </div>

              {/* Voice IDs */}
              <div className="space-y-2">
                <Label>Voice IDs</Label>
                {voiceId.map((v, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="voice_id"
                      value={v}
                      onChange={updateItem(setVoiceId, idx)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={removeItem(setVoiceId, idx)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addItem(setVoiceId)}
                >
                  Add Voice ID
                </Button>
              </div>

              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-domain.com/webhooks/bland"
                  value={webhookUrl}
                  disabled

                />
              </div>

              {/* Max Call Duration */}
              <div className="space-y-2">
                <Label htmlFor="maxCallDuration">
                  Max Call Duration (minutes)
                </Label>
                <Input
                  id="maxCallDuration"
                  type="number"
                  value={maxCallDuration}
                  onChange={(e) => setMaxCallDuration(e.target.value)}
                />
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <Label htmlFor="temperature">AI Temperature (0.0 - 1.0)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="enhanced"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              {/* Record Calls */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={recordCalls}
                  onCheckedChange={setRecordCalls}
                />
                <Label>Record calls</Label>
              </div>

              {/* Transfer Numbers */}
              <div className="space-y-2">
                <Label>Transfer Numbers</Label>
                {transferNumbers.map((num, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="+1234567890"
                      value={num}
                      onChange={updateItem(setTransferNumbers, idx)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={removeItem(setTransferNumbers, idx)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addItem(setTransferNumbers)}
                >
                  Add Transfer Number
                </Button>
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

          {!enabled && (apiKey || phoneNumbers.length > 0) && (
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Integration is disabled. Settings are preserved.
              </div>
              <Button
                onClick={handleDisableIntegration}
                disabled={disabling}
                variant="outline"
                className="w-full"
              >
                {disabling ? "Disabling..." : "Save Changes"}
              </Button>
            </CardContent>
          )}
        </Card>

        <div className="w-48 bg-card p-5 rounded-xl border text-center">
          <Button
            variant="outline"
            onClick={testBland}
            className="w-full"
            disabled={!enabled || !hasRequiredFields || testLoading}
          >
            {testLoading ? "Testing..." : "Test Connection"}
          </Button>
          {enabled && !hasRequiredFields && (
            <p className="text-xs text-muted-foreground mt-2">
              API Key required
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { TabsContent } from "@/components/ui/tabs-og";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, Webhook, Check, X } from "lucide-react";
import { toast } from "sonner";

// helper function
function mapDbToState(dbData) {
  return {
    twilio: {
      enabled: dbData?.twilioEnabled || false,
      accountSid: dbData?.twilioAccountSid || "",
      authToken: dbData?.twilioAuthToken || "",
      phoneNumbers: dbData?.twilioPhoneNumbers || [],
      voiceWebhookUrl: dbData?.twilioVoiceUrl || "",
      smsWebhookUrl: dbData?.twilioSmsUrl || "",
      appSid: dbData?.twilioAppSid || "",
    },
    calendly: {
      enabled: dbData?.calendlyEnabled || false,
      apiKey: dbData?.calendlyApiKey || "",
      webhookUrl: dbData?.calendlyWebhookUrl || "",
      organizationUri: dbData?.calendlyOrgUri || "",
    },
    makeZoom: {
      enabled: dbData?.zoomEnabled || false,
      makeWebhookUrl: dbData?.makeWebhookUrl || "",
      zoomWebhookUrl: dbData?.zoomWebhookUrl || "",
      zoomApiKey: dbData?.zoomApiKey || "",
      zoomApiSecret: dbData?.zoomApiSecret || "",
    },
  };
}

function transformStateToDbPayload(integrations) {
  const payload = {};

  // Twilio transformation
  if (integrations.twilio?.enabled) {
    payload.twilioEnabled = true;
    if (integrations.twilio.accountSid) payload.twilioAccountSid = integrations.twilio.accountSid;
    if (integrations.twilio.authToken) payload.twilioAuthToken = integrations.twilio.authToken;
    if (integrations.twilio.phoneNumbers) payload.twilioPhoneNumbers = integrations.twilio.phoneNumbers;
    if (integrations.twilio.voiceWebhookUrl) payload.twilioVoiceUrl = integrations.twilio.voiceWebhookUrl;
    if (integrations.twilio.smsWebhookUrl) payload.twilioSmsUrl = integrations.twilio.smsWebhookUrl;
    if (integrations.twilio.appSid) payload.twilioAppSid = integrations.twilio.appSid;
  }

  // Calendly transformation
  if (integrations.calendly?.enabled) {
    payload.calendlyEnabled = true;
    if (integrations.calendly.apiKey) payload.calendlyApiKey = integrations.calendly.apiKey;
    if (integrations.calendly.webhookUrl) payload.calendlyWebhookUrl = integrations.calendly.webhookUrl;
    if (integrations.calendly.organizationUri) payload.calendlyOrgUri = integrations.calendly.organizationUri;
  }

  // Zoom transformation
  if (integrations.makeZoom?.enabled) {
    payload.zoomEnabled = true;
    if (integrations.makeZoom.makeWebhookUrl) payload.makeWebhookUrl = integrations.makeZoom.makeWebhookUrl;
    if (integrations.makeZoom.zoomWebhookUrl) payload.zoomWebhookUrl = integrations.makeZoom.zoomWebhookUrl;
    if (integrations.makeZoom.zoomApiKey) payload.zoomApiKey = integrations.makeZoom.zoomApiKey;
    if (integrations.makeZoom.zoomApiSecret) payload.zoomApiSecret = integrations.makeZoom.zoomApiSecret;
  }

  return payload;
}


export default function IntegrationsTab({ orgIntegrations = {}, orgId = "" }) {
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState(
   () => mapDbToState(orgIntegrations)
  );

  const updateIntegration = (service, field, value) => {
    setIntegrations((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value,
      },
    }));
  };

  const toggleIntegration = (service) => {
    setIntegrations((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        enabled: !prev[service].enabled,
      },
    }));
  };

  const testConnection = async (service) => {
    // Placeholder for testing connection
    console.log(`Testing ${service} connection...`);
    // Here you would implement actual API testing
  };

const handleSaveSettings = async () => {
  setLoading(true);

  try {
    // Transform the state to DB payload format
    const payload = transformStateToDbPayload(integrations);
    
    const response = await fetch(`/api/org/${orgId}/integrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.details?.join(', ') || 
        errorData.error || 
        "Failed to save settings"
      );
    }

    const data = await response.json();
    toast.success(data.message || "Settings saved successfully");
  } catch (error) {
    console.error("Save error:", error);
    toast.error(error.message || "Failed to save settings");
  } finally {
    setLoading(false);
  }
};
  return (
    <TabsContent value="integrations" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
          <p className="text-muted-foreground">
            Connect your external services and configure webhooks
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          {loading ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Overview of all your active integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <div
                className={`h-3 w-3 rounded-full ${
                  integrations.twilio.enabled ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="font-medium">Twilio</span>
              {integrations.twilio.enabled ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <div
                className={`h-3 w-3 rounded-full ${
                  integrations.calendly.enabled ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="font-medium">Calendly</span>
              {integrations.calendly.enabled ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <div
                className={`h-3 w-3 rounded-full ${
                  integrations.makeZoom.enabled ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="font-medium">Make & Zoom</span>
              {integrations.makeZoom.enabled ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Twilio Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Phone className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle>Twilio SMS/Voice</CardTitle>
              <CardDescription>
                Configure Twilio for TwiML voice and SMS handling
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={integrations.twilio.enabled ? "default" : "secondary"}
            >
              {integrations.twilio.enabled ? "Active" : "Inactive"}
            </Badge>
            <Switch
              checked={integrations.twilio.enabled}
              onCheckedChange={() => toggleIntegration("twilio")}
            />
          </div>
        </CardHeader>
        {integrations.twilio.enabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twilio-sid">Account SID</Label>
                <Input
                  id="twilio-sid"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={integrations.twilio.accountSid}
                  onChange={(e) =>
                    updateIntegration("twilio", "accountSid", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilio-token">Auth Token</Label>
                <Input
                  id="twilio-token"
                  type="password"
                  placeholder="Your auth token"
                  value={integrations.twilio.authToken}
                  onChange={(e) =>
                    updateIntegration("twilio", "authToken", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twilio-phone">Phone Number</Label>
                  <Input
                    id="twilio-phone"
                    placeholder="+1234567890"
                    value={integrations.twilio.phoneNumber}
                    onChange={(e) =>
                      updateIntegration("twilio", "phoneNumber", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twilio-app-sid">
                    TwiML App SID (Optional)
                  </Label>
                  <Input
                    id="twilio-app-sid"
                    placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={integrations.twilio.appSid}
                    onChange={(e) =>
                      updateIntegration("twilio", "appSid", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilio-voice-webhook">
                  Voice Webhook URL (TwiML)
                </Label>
                <Input
                  id="twilio-voice-webhook"
                  placeholder="https://your-app.com/twilio/voice"
                  value={integrations.twilio.voiceWebhookUrl}
                  onChange={(e) =>
                    updateIntegration(
                      "twilio",
                      "voiceWebhookUrl",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilio-sms-webhook">
                  SMS Webhook URL (TwiML)
                </Label>
                <Input
                  id="twilio-sms-webhook"
                  placeholder="https://your-app.com/twilio/sms"
                  value={integrations.twilio.smsWebhookUrl}
                  onChange={(e) =>
                    updateIntegration("twilio", "smsWebhookUrl", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilio-status-webhook">
                  Status Callback URL (Optional)
                </Label>
                <Input
                  id="twilio-status-webhook"
                  placeholder="https://your-app.com/twilio/status"
                  value={integrations.twilio.statusWebhookUrl}
                  onChange={(e) =>
                    updateIntegration(
                      "twilio",
                      "statusWebhookUrl",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => testConnection("twilio")}
              >
                Test Connection
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Calendly Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Calendly</CardTitle>
              <CardDescription>
                Sync with Calendly scheduling and receive booking webhooks
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={integrations.calendly.enabled ? "default" : "secondary"}
            >
              {integrations.calendly.enabled ? "Active" : "Inactive"}
            </Badge>
            <Switch
              checked={integrations.calendly.enabled}
              onCheckedChange={() => toggleIntegration("calendly")}
            />
          </div>
        </CardHeader>
        {integrations.calendly.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calendly-api">API Key</Label>
              <Input
                id="calendly-api"
                type="password"
                placeholder="Your Calendly API key"
                value={integrations.calendly.apiKey}
                onChange={(e) =>
                  updateIntegration("calendly", "apiKey", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calendly-org">Organization URI</Label>
                <Input
                  id="calendly-org"
                  placeholder="https://api.calendly.com/organizations/AAAAAAAAAAAAAAAA"
                  value={integrations.calendly.organizationUri}
                  onChange={(e) =>
                    updateIntegration(
                      "calendly",
                      "organizationUri",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calendly-webhook">Webhook URL</Label>
                <Input
                  id="calendly-webhook"
                  placeholder="https://your-app.com/calendly/webhook"
                  value={integrations.calendly.webhookUrl}
                  onChange={(e) =>
                    updateIntegration("calendly", "webhookUrl", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => testConnection("calendly")}
              >
                Test Connection
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Make.com & Zoom Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Webhook className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Make.com & Zoom</CardTitle>
              <CardDescription>
                Configure webhooks for Make.com automation and Zoom meetings
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={integrations.makeZoom.enabled ? "default" : "secondary"}
            >
              {integrations.makeZoom.enabled ? "Active" : "Inactive"}
            </Badge>
            <Switch
              checked={integrations.makeZoom.enabled}
              onCheckedChange={() => toggleIntegration("makeZoom")}
            />
          </div>
        </CardHeader>
        {integrations.makeZoom.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="make-webhook">Make.com Webhook URL</Label>
                <Input
                  id="make-webhook"
                  placeholder="https://hook.eu1.make.com/xxxxxxxxxxxxxxxxx"
                  value={integrations.makeZoom.makeWebhookUrl}
                  onChange={(e) =>
                    updateIntegration(
                      "makeZoom",
                      "makeWebhookUrl",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoom-webhook">Zoom Webhook URL</Label>
                <Input
                  id="zoom-webhook"
                  placeholder="https://your-app.com/zoom/webhook"
                  value={integrations.makeZoom.zoomWebhookUrl}
                  onChange={(e) =>
                    updateIntegration(
                      "makeZoom",
                      "zoomWebhookUrl",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zoom-api">Zoom API Key</Label>
                <Input
                  id="zoom-api"
                  type="password"
                  placeholder="Your Zoom API key"
                  value={integrations.makeZoom.zoomApiKey}
                  onChange={(e) =>
                    updateIntegration("makeZoom", "zoomApiKey", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoom-secret">Zoom API Secret</Label>
                <Input
                  id="zoom-secret"
                  type="password"
                  placeholder="Your Zoom API secret"
                  value={integrations.makeZoom.zoomApiSecret}
                  onChange={(e) =>
                    updateIntegration(
                      "makeZoom",
                      "zoomApiSecret",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => testConnection("make")}>
                Test Make.com
              </Button>
              <Button variant="outline" onClick={() => testConnection("zoom")}>
                Test Zoom
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </TabsContent>
  );
}

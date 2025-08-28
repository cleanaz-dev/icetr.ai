import { useState } from "react";
import {
  Webhook,
  Copy,
  Check,
  Zap,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function WebhookConfiguration({
  webhookUrl,
  webhookEnabled,
  webhookEnabledChange,
  onUrlChange,
  onEnabledChange,
}) {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const handleCopyWebhook = async () => {
    if (!webhookUrl) return;

    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } catch (error) {
      console.error("Failed to copy webhook URL:", error);
    }
  };

  const getWebhookStatus = () => {
    if (!webhookEnabled) return { color: "bg-gray-500", text: "Disabled" };
    if (!webhookUrl) return { color: "bg-yellow-500", text: "No URL" };
    return { color: "bg-green-500", text: "Active" };
  };

  const webhookStatus = getWebhookStatus();

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    // Simulate webhook test
    setTimeout(() => {
      setIsTestingWebhook(false);
      alert("Webhook test successful!");
    }, 2000);
  };

  return (
    <section className="space-y-4">
      <Card className="hover:border-primary/50 transition-all duration-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
             <CardTitle className="flex items-center gap-2">
               <Webhook className="size-4"/> Enable Webhooks
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Send call events to external services at the end of each call
              </p>
            </div>
            <Switch
              id="webhookEnabled"
              checked={webhookEnabled}
              onCheckedChange={webhookEnabledChange}
            />
          </div>
        </CardHeader>

        {webhookEnabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl" className="text-sm font-medium">
                Webhook URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="webhookUrl"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="https://hook.make.com/your-webhook-url"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhook}
                  disabled={!webhookUrl}
                  className="shrink-0"
                >
                  {copiedWebhook ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compatible with Make.com, Zapier, and other webhook services
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${webhookStatus.color}`}
                ></div>
                <span className="text-sm font-medium">
                  {webhookStatus.text}
                </span>
              </div>

              {webhookUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="ml-auto"
                >
                  {isTestingWebhook ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 mr-2" />
                      Test Webhook
                    </>
                  )}
                </Button>
              )}
            </div>


            <div className="pt-2 border-t">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ExternalLink className="w-3 h-3" />
                <span>Events are sent as POST requests with JSON payload</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </section>
  );
}

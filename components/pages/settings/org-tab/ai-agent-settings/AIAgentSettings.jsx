import { useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Save,
  Settings,
  AlertCircle,
  TestTube,
  Sparkles,
  MessageSquare,
  Webhook,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PromptConfiguration from "./PromptConfiguration";
import WebhookConfiguration from "./WebhookConfiguration";

export default function AIAgentSettings({
  agentConfig = {},
  onSave,
  savingSettings,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Agent configuration state
  const [agentInstructions, setAgentInstructions] = useState(
    agentConfig.agentInstructions || {
      profile: {},
      greeting: {},
      transitions: {},
    }
  );

  const [webhookUrl, setWebhookUrl] = useState(agentConfig.webhookUrl || "");

  const [webhookEnabled, setWebhookEnabled] = useState(
    agentConfig.webhookEnabled || false
  );

  const handleSave = () => {
    const updatedConfig = {
      ...agentConfig,
      prompt,
      webhookUrl,
      webhookEnabled,
      webhookEvents,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedConfig);
  };

  const getWebhookStatus = () => {
    if (!webhookEnabled) return { color: "bg-gray-500", text: "Disabled" };
    if (!webhookUrl) return { color: "bg-yellow-500", text: "No URL" };
    return { color: "bg-green-500", text: "Active" };
  };

  const webhookStatus = getWebhookStatus();

  return (
    <Card className="w-full overflow-hidden hover:border-primary transition-all duration-300">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">AI Agent Settings</CardTitle>
              <CardDescription>
                Configure agent behavior, prompts, and integrations
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Configured
            </Badge>
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${webhookStatus.color}`}
              ></div>
              <span className="text-xs text-muted-foreground">Webhook</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          <div className="p-6 space-y-6">
            <PromptConfiguration
              agentInstructions={agentInstructions}
              onChange={setAgentInstructions}
            />

            <WebhookConfiguration
              webhookUrl={webhookUrl}
              webhookEnabled={webhookEnabled}
              webhookEnabledChange={setWebhookEnabled}
              onUrlChange={setWebhookUrl}
            />
          </div>

          <CardFooter className="border-t p-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>Changes will apply to new calls immediately</span>
              </div>

              <Button
                onClick={handleSave}
                disabled={savingSettings}
                className="w-auto"
              >
                {savingSettings ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Agent Settings
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </CardContent>
      )}
    </Card>
  );
}

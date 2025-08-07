"use client";
import { useState } from "react";
import {
  Phone,
  Mic,
  Settings,
  Save,
  ChevronDown,
  ChevronRight,
  Volume2,
  MessageSquare,
  Forward,
  Users,
  Brain,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCoreContext } from "@/context/CoreProvider";
import { toast } from "sonner";
import Link from "next/link";

export default function PhoneConfiguration({ onSave }) {
  const {
    callFlowConfiguration: initialCallFlowConfiguration,
    savePhoneConfiguration,
  } = useCoreContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [config, setConfig] = useState(initialCallFlowConfiguration);
  const [saving, setSaving] = useState(false);

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePhoneConfiguration(config);
      toast.success("Phone configuration saved successfully!");
    } catch (error) {
      toast.error("Failed to save phone configuration");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const getProviderName = (provider) => {
    const providers = {
      assemblyai: "Assembly AI",
      twilio: "Twilio",
      none: "Disabled",
    };
    return providers[provider] || provider;
  };

  const getFlowName = (flow) => {
    const flows = {
      voicemail: "Send to Voicemail",
      forward: "Forward to Number",
      ivr: "Interactive Voice Response",
    };
    return flows[flow] || flow;
  };

  const getConfigSummary = () => {
    const activeFeatures = [];
    if (config.recordingEnabled) activeFeatures.push("Recording");
    if (config.transcriptionProvider !== "none")
      activeFeatures.push("Transcription");
    if (config.autoCreateLeads) activeFeatures.push("Auto Leads");
    if (config.autoCreateFollowUps) activeFeatures.push("Auto Follow-ups");

    return activeFeatures.length > 0
      ? activeFeatures.join(" • ")
      : "Basic configuration";
  };

  if (
    !initialCallFlowConfiguration ||
    Object.keys(initialCallFlowConfiguration).length === 0
  ) {
    return (
      <Card className="hover:border-primary transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <CardTitle className="text-lg">
                  Call Flow Configuration
                </CardTitle>
                <CardDescription>No configuration available</CardDescription>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              <Activity className="w-3 h-3 mr-1" />
              Not Configured
            </span>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-muted flex items-center justify-center">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-white">No Phone Configuration</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Set up your phone configuration to enable call recording,
                transcription, and automated workflows.
              </p>
            </div>
            <Button
              className="mt-2"
              asChild
            >
              <Link href="/settings/call-flow-builder">
                <Settings className="w-4 h-4 mr-2" />
                Configure Call Flow
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-primary transition-all duration-300">
      {/* Header */}
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <div>
              <CardTitle className="text-lg">Phone Configuration</CardTitle>
              <CardDescription>{getConfigSummary()}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                config.recordingEnabled
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <Activity className="w-3 h-3 mr-1" />
              {config.recordingEnabled ? "Active" : "Inactive"}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      {isExpanded && (
        <CardContent className="space-y-6 bg-card hover:not-enabled:">
          {/* Recording Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-gray-500" />
              <h4 className="font-semibold">Recording Settings</h4>
            </div>

            <div className="space-y-4">
              {/* Master Recording Switch */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Enable Call Recording
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Master switch for all call recording functionality
                    </p>
                  </div>
                  <Switch
                    checked={config.recordingEnabled}
                    onCheckedChange={(checked) =>
                      updateConfig("recordingEnabled", checked)
                    }
                  />
                </div>
              </Card>

              {/* Recording Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Record Inbound Calls
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Record incoming voicemails
                      </p>
                    </div>
                    <Switch
                      checked={config.recordInboundCalls}
                      onCheckedChange={(checked) =>
                        updateConfig("recordInboundCalls", checked)
                      }
                      disabled={!config.recordingEnabled}
                    />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Record Outbound Calls
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Record calls you make
                      </p>
                    </div>
                    <Switch
                      checked={config.recordOutboundCalls}
                      onCheckedChange={(checked) =>
                        updateConfig("recordOutboundCalls", checked)
                      }
                      disabled={!config.recordingEnabled}
                    />
                  </div>
                </Card>
              </div>

              {/* Minimum Duration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Minimum Outbound Recording Duration (seconds)
                </Label>
                <Input
                  type="number"
                  value={config.minOutboundDuration}
                  onChange={(e) =>
                    updateConfig(
                      "minOutboundDuration",
                      parseInt(e.target.value) || 0
                    )
                  }
                  disabled={
                    !config.recordingEnabled || !config.recordOutboundCalls
                  }
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Only record outbound calls longer than this duration
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transcription Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-gray-500" />
                <h4 className="font-semibold">Transcription Settings</h4>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Transcription Provider
                  </Label>
                  <Select
                    value={config.transcriptionProvider}
                    onValueChange={(value) =>
                      updateConfig("transcriptionProvider", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assemblyai">Assembly AI</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="none">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Provider:
                  </span>
                  <span className="font-medium">
                    {getProviderName(config.transcriptionProvider)}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Transcribe Inbound</Label>
                    <Switch
                      checked={config.transcribeInbound}
                      onCheckedChange={(checked) =>
                        updateConfig("transcribeInbound", checked)
                      }
                      disabled={config.transcriptionProvider === "none"}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Transcribe Outbound</Label>
                    <Switch
                      checked={config.transcribeOutbound}
                      onCheckedChange={(checked) =>
                        updateConfig("transcribeOutbound", checked)
                      }
                      disabled={config.transcriptionProvider === "none"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Forward className="w-4 h-4 text-gray-500" />
                <h4 className="font-semibold">Call Flow Settings</h4>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Inbound Call Handling
                  </Label>
                  <Select
                    value={config.inboundFlow}
                    onValueChange={(value) =>
                      updateConfig("inboundFlow", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voicemail">
                        Send to Voicemail
                      </SelectItem>
                      <SelectItem value="forward">Forward to Number</SelectItem>
                      <SelectItem value="ivr">
                        Interactive Voice Response
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Flow Type:
                  </span>
                  <span className="font-medium">
                    {getFlowName(config.inboundFlow)}
                  </span>
                </div>

                {config.inboundFlow === "forward" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Forward to Number
                    </Label>
                    <Input
                      type="tel"
                      value={config?.forwardToNumber || ""}
                      onChange={(e) =>
                        updateConfig("forwardToNumber", e.target.value)
                      }
                      placeholder="+1234567890"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voicemail Message */}
          {config.inboundFlow === "voicemail" && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <h4 className="font-semibold">Voicemail Settings</h4>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Custom Voicemail Message
                  </Label>
                  <Textarea
                    value={config.voicemailMessage}
                    onChange={(e) =>
                      updateConfig("voicemailMessage", e.target.value)
                    }
                    placeholder="Leave empty to use default message"
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Business Logic - Compact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-medium text-sm">Business Logic</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={config.autoCreateLeads}
                    onCheckedChange={(checked) =>
                      updateConfig("autoCreateLeads", checked)
                    }
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      Auto-create Leads
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From unknown callers
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={config.autoCreateFollowUps}
                    onCheckedChange={(checked) =>
                      updateConfig("autoCreateFollowUps", checked)
                    }
                    className="data-[state=checked]:bg-green-500"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                      Auto Follow-ups
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For known leads
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto"
            >
              {saving ? (
                <>
                  {/* <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> */}
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

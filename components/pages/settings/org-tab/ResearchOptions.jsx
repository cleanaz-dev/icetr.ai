"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Microscope,
  ChevronDown,
  ChevronRight,
  Save,
  Copy,
  Check,
  Settings,
  Globe,
  Activity,
  TrendingUp,
  Users,
  Building2,
  Target,
  Database,
  BarChart3,
  Zap,
  HandPlatter,
  Mic,
  Plus,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import useSWR, { mutate } from "swr";
import { useTeamContext } from "@/context/TeamProvider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TECH_STACK_OPTIONS = [
  { id: "CRM", label: "CRM Systems", icon: Database },
  { id: "LIVE_CHAT", label: "Live Chat", icon: Users },
  { id: "ANALYTICS", label: "Analytics", icon: BarChart3 },
  { id: "EMAIL_MARKETING", label: "Marketing Tools", icon: Target },
  { id: "ECOMMERCE", label: "E-commerce", icon: TrendingUp },
];

const SOCIAL_PLATFORMS = [
  { id: "LINKEDIN", label: "LinkedIn", color: "text-blue-600" },
  { id: "TWITTER", label: "Twitter/X", color: "text-slate-600" },
  { id: "FACEBOOK", label: "Facebook", color: "text-blue-700" },
  { id: "INSTAGRAM", label: "Instagram", color: "text-pink-600" },
];

export default function ResearchOptions({ campaigns = [] }) {
  const { orgId } = useTeamContext();
  const fetcher = async (url) => fetch(url).then((res) => res.json());
  const cacheKey = orgId ? `/api/org/${orgId}/research-config` : null;
  const { data: configs, error, isLoading } = useSWR(cacheKey, fetcher);
  const [configExpanded, setConfigExpanded] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(
    campaigns[0]?.id || null
  );
  const [newService, setNewService] = useState("");

  // Find config for selected campaign or default to empty
  const selectedConfig = configs?.find(
    (c) => c.campaignId === selectedCampaign
  ) || {
    services: [],
    techStackFocus: [],
    isPremium: false,
    socials: [],
  };

  const [localConfig, setLocalConfig] = useState(selectedConfig);

  // Update localConfig when selectedCampaign or configs change
  useEffect(() => {
    setLocalConfig(
      configs?.find((c) => c.campaignId === selectedCampaign) || {
        services: [],
        techStackFocus: [],
        isPremium: false,
        socials: [],
      }
    );
  }, [selectedCampaign, configs]);

  const handleConfigChange = (key, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArrayToggle = (array, item) => {
    const current = localConfig[array] || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    handleConfigChange(array, updated);
  };

  // Custom services functions
  const addService = () => {
    if (
      newService.trim() &&
      !localConfig.services.includes(newService.trim())
    ) {
      const updatedServices = [...localConfig.services, newService.trim()];
      handleConfigChange("services", updatedServices);
      setNewService("");
    }
  };

  const removeService = (serviceToRemove) => {
    const updatedServices = localConfig.services.filter(
      (service) => service !== serviceToRemove
    );
    handleConfigChange("services", updatedServices);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addService();
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign");
      return;
    }
    setSavingConfig(true);
    try {
      const response = await fetch(`/api/org/${orgId}/research-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...localConfig, campaignId: selectedCampaign }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      mutate(
        cacheKey,
        (current) => {
          const updated = current
            ? current.map((c) => (c.campaignId === selectedCampaign ? data : c))
            : [data];
          return updated;
        },
        false
      );
      toast.success("Config saved successfully");
    } catch (error) {
      console.error("Failed to save config:", error);
      toast.error("Failed to save config");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveToAll = async () => {
    if (!campaigns.length) {
      toast.error("No campaigns available");
      return;
    }
    setSavingConfig(true);
    try {
      const responses = await Promise.all(
        campaigns.map(async (campaign) => {
          const response = await fetch(`/api/org/${orgId}/research-config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...localConfig, campaignId: campaign.id }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message);
          }
          return data;
        })
      );

      mutate(cacheKey, responses, false);
      toast.success("Config saved to all campaigns");
    } catch (error) {
      console.error("Failed to save config to all campaigns:", error);
      toast.error("Failed to save config to all campaigns");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="">
      <Card className="w-full overflow-hidden hover:border-primary transition-all duration-300">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setConfigExpanded(!configExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">
                  Research Configuration
                </CardTitle>
                <CardDescription>
                  Configure research services and focus areas
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={localConfig.isPremium ? "default" : "secondary"}>
                {localConfig.isPremium ? "Premium" : "Standard"}
              </Badge>
              {configExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>
          </div>
        </CardHeader>

        {configExpanded && (
          <CardContent className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-4">
                   <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Loading configuration...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Label>Campaigns:</Label>
                    <Select
                      value={selectedCampaign || ""}
                      onValueChange={(value) => setSelectedCampaign(value)}
                    >
                      <SelectTrigger className="w-[400px]">
                        <SelectValue placeholder="Select Campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((c) => {
                          const config = configs?.find(
                            (config) => config.campaignId === c.id
                          );
                          return (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center justify-between w-full gap-2">
                                <span>{c.name || c.id}</span>
                                <div className="flex items-center gap-1">
                                  {TECH_STACK_OPTIONS.map(
                                    ({ id, icon: Icon, label }) => (
                                      <Icon
                                        key={id}
                                        className={`w-4 h-4 ml-2 ${
                                          config?.techStackFocus?.includes(id)
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                        }`}
                                        title={label}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campaign Services */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <HandPlatter className="w-4 h-4" />
                      <h3 className="font-semibold">Campaign Services</h3>
                    </div>

                    {/* Current Services */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Current Services ({localConfig.services.length}):
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {localConfig.services.length > 0 ? (
                          localConfig.services.map((service, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-2 pr-1 pl-3 py-1"
                            >
                              {service}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                                onClick={() => removeService(service)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No services added yet.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Quick Add Suggestions:
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "chatbots",
                          "automation funnels",
                          "process automation",
                          "voice services",
                          "lead generation",
                          "email marketing",
                          "social media management",
                          "content creation",
                          "SEO optimization",
                          "web development",
                        ]
                          .filter(
                            (suggestion) =>
                              !localConfig.services.includes(suggestion)
                          )
                          .map((suggestion) => (
                            <Button
                              key={suggestion}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedServices = [
                                  ...localConfig.services,
                                  suggestion,
                                ];
                                handleConfigChange("services", updatedServices);
                              }}
                              className="text-xs"
                            >
                              + {suggestion}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Zap className="w-4 h-4" />
                    <h3 className="font-semibold">Tech Stack Focus</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {TECH_STACK_OPTIONS.map((tech) => (
                      <div
                        key={tech.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border"
                      >
                        <Checkbox
                          checked={localConfig.techStackFocus.includes(tech.id)}
                          onCheckedChange={() =>
                            handleArrayToggle("techStackFocus", tech.id)
                          }
                        />
                        <tech.icon className="w-4 h-4 text-muted-foreground" />
                        <Label className="flex-1 cursor-pointer">
                          {tech.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* Premium */}
                <section>
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <div>
                        <Label className="font-medium">Premium Research</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable advanced research features and deeper analysis
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={localConfig.isPremium}
                      onCheckedChange={(checked) =>
                        handleConfigChange("isPremium", checked)
                      }
                    />
                  </div>
                </section>

                {localConfig.isPremium && (
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <Globe className="w-4 h-4" />
                      <h3 className="font-semibold">
                        Social Platform Research
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <div
                          key={platform.id}
                          className="flex items-center space-x-3 p-3 rounded-lg border"
                        >
                          <Checkbox
                            checked={localConfig.socials.includes(platform.id)}
                            onCheckedChange={() =>
                              handleArrayToggle("socials", platform.id)
                            }
                          />
                          <Label
                            className={`flex-1 cursor-pointer ${platform.color}`}
                          >
                            {platform.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </CardContent>
        )}

        {!isLoading && configExpanded && (
          <CardFooter className="border-t p-6 flex gap-4">
            <Button
              onClick={handleSaveConfig}
              disabled={savingConfig || !selectedCampaign}
              className="w-full md:w-auto"
            >
              {savingConfig ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Configuration...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Selected Campaign
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

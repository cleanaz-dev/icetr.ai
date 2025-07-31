"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Mic,
  MessageSquare,
  Settings,
  Plus,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { CircleDot, Dot, Trash2 } from "lucide-react";

export default function CreateTrainingPage({ campaigns = [], orgId, blandAi }) {
  const router = useRouter();

  /* ----------  NEW: campaign selection  ---------- */
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignSearch, setCampaignSearch] = useState("");

  /* ----------  original form state  ---------- */
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const [customScripts, setCustomScripts] = useState([
    { id: 1, label: "", content: "" },
    {
      id: 2,
      label: "Opening",
      content: "Hi, my name is [NAME] and I'm calling from [COMPANY]...",
    },
  ]);
  const [nextId, setNextId] = useState(3)
  const [formData, setFormData] = useState({
    name: "",
    scenario: {
      title: "",
      difficulty: "",
      description: "",
      objectives: "",
      targetAudience: "",
      keyPoints: [],
    },
    voiceId: "",
    prompt: "",
    webhookUrl: blandAi.webhookUrl,
  });

  const sections = [
    { id: "basic", label: "Basic Info", icon: MessageSquare },
    { id: "scenario", label: "Scenario", icon: MessageSquare },
    { id: "scripts", label: "Scripts", icon: Mic },
    { id: "ai-settings", label: "Bland AI Settings", icon: Settings },
  ];
  const voiceOptions = [
    { value: "maya", label: "Maya (Default Female)" },
    { value: "ryan", label: "Ryan (Default Male)" },
    { value: "sarah", label: "Sarah (Professional)" },
  ];

  /* ----------  utility helpers (unchanged)  ---------- */
  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));
  const handleNestedChange = (parent, field, value) =>
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  const addKeyPoint = () =>
    setFormData((prev) => ({
      ...prev,
      scenario: {
        ...prev.scenario,
        keyPoints: [...prev.scenario.keyPoints, ""],
      },
    }));
  const updateKeyPoint = (idx, val) =>
    setFormData((prev) => ({
      ...prev,
      scenario: {
        ...prev.scenario,
        keyPoints: prev.scenario.keyPoints.map((p, i) => (i === idx ? val : p)),
      },
    }));
  const removeKeyPoint = (idx) =>
    setFormData((prev) => ({
      ...prev,
      scenario: {
        ...prev.scenario,
        keyPoints: prev.scenario.keyPoints.filter((_, i) => i !== idx),
      },
    }));

const addScript = () => {
  setCustomScripts([
    ...customScripts,
    { id: nextId, label: "", content: "" },
  ]);
  setNextId(prev => prev + 1);
};

  const removeScript = (id) => {
    setCustomScripts(customScripts.filter((script) => script.id !== id));
  };

  const updateScript = (id, field, value) => {
    setCustomScripts(
      customScripts.map((script) =>
        script.id === id ? { ...script, [field]: value } : script
      )
    );
  };

  const getLevelDot = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return <div className="size-2 rounded-full bg-green-500" />;
      case "intermediate":
        return <div className="size-2 rounded-full bg-yellow-300" />;
      case "advanced":
        return <div className="w-2 h-2 rounded-full bg-red-500" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  /* ----------  submit (unchanged, just used selectedCampaign.id)  ---------- */
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Training name is required");
      setActiveSection("basic");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        campaignId: selectedCampaign.id,
        scenario: {
          title: formData.scenario.title,
          difficulty: formData.scenario.difficulty,
          description: formData.scenario.description,
          objectives: formData.scenario.objectives,
          targetAudience: formData.scenario.targetAudience,
          keyPoints: formData.scenario.keyPoints.filter((p) => p.trim()),
        },
        customScripts,
        voiceId: formData.voiceId || null,
        prompt: formData.prompt || null,
        webhookUrl: formData.webhookUrl || null,
      };

      const res = await fetch(`/api/org/${orgId}/training`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create training");
      }

      toast.success("Training created successfully");
      router.push("/training/create-training");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to create training");
    } finally {
      setLoading(false);
    }
  };

  /* ----------  render helpers  ---------- */
  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  const renderCampaignPicker = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search campaigns..."
          value={campaignSearch}
          onChange={(e) => setCampaignSearch(e.target.value)}
        />

        <div className="space-y-6 overflow-y-auto">
          {filtered.map((c) => {
            const trainings = c.training || [];

            return (
              <div key={c.id} className="rounded-lg border bg-card">
                {/* Campaign Header */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{c.name}</h3>
                    <Badge variant="outline" className="bg-card">
                      {c.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {trainings.length} training{trainings.length !== 1 && "s"}
                    </span>
                  </div>
                  <Button size="sm" onClick={() => setSelectedCampaign(c)}>
                    Create Training
                  </Button>
                </div>

                {/* Trainings Table */}
                {trainings.length > 0 ? (
                  <Table>
                    <TableHeader className="p-2">
                      <TableRow className="border-none">
                        <TableHead className="border-none">
                          Training Name
                        </TableHead>
                        <TableHead className="border-none">Scenarios</TableHead>
                        <TableHead className="text-right border-none">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainings.map((t) => (
                        <TableRow key={t.id} className="border-none h-14">
                          <TableCell className="font-medium border-none">
                            <span className="flex items-center gap-2">
                              <CircleDot className="size-4 text-primary" />{" "}
                              {t.name}
                            </span>
                          </TableCell>
                          <TableCell className="border-none">
                            {t.scenarios.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {t.scenarios.map((scenario) => (
                                  <div
                                    key={scenario.id}
                                    className="flex gap-2 items-center text-xs bg-muted px-2 py-1 rounded"
                                  >
                                    {scenario.title}
                                    {getLevelDot(scenario.level)}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No scenarios
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right border-none">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/training/${t.id}`}>
                                <span className="text-xs">Manage</span>
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No trainings created yet
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No campaigns found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  /* ----------  original section renderers (unchanged)  ---------- */
  const renderBasicInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Training Name *</Label>
          <Input
            id="name"
            placeholder="Enter training name..."
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="text-lg"
          />
          <p className="text-sm text-muted-foreground">
            Give your training session a clear, descriptive name
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderScenario = () => (
    <Card>
      <CardHeader>
        <CardTitle>Training Scenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={formData.scenario.difficulty}
            onValueChange={(value) =>
              handleNestedChange("scenario", "difficulty", value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Title</Label>
          <Input
            id="targetAudience"
            placeholder="e.g., Easy propsect, Laptop Support, Irate Customer"
            value={formData.scenario.title}
            onChange={(e) =>
              handleNestedChange("scenario", "title", e.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Scenario Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the training scenario in detail..."
            value={formData.scenario.description}
            onChange={(e) =>
              handleNestedChange("scenario", "description", e.target.value)
            }
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives">Training Objectives</Label>
          <Textarea
            id="objectives"
            placeholder="What should trainees accomplish by the end of this session?"
            value={formData.scenario.objectives}
            onChange={(e) =>
              handleNestedChange("scenario", "objectives", e.target.value)
            }
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            placeholder="e.g., New sales reps, experienced agents, managers"
            value={formData.scenario.targetAudience}
            onChange={(e) =>
              handleNestedChange("scenario", "targetAudience", e.target.value)
            }
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Key Points to Cover</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addKeyPoint}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Point
            </Button>
          </div>
          {formData.scenario.keyPoints.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No key points added yet. Click "Add Point" to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {formData.scenario.keyPoints.map((point, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Key point ${idx + 1}...`}
                      value={point}
                      onChange={(e) => updateKeyPoint(idx, e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKeyPoint(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderScripts = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Call Scripts & Content</CardTitle>
          <Button onClick={addScript} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Script
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {customScripts.map((script) => (
          <div key={script.id} className="border p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-2">
                <Label>Label</Label>
                <Input
                  placeholder="Enter script label (e.g., Opening, Follow-up, Rebuttal, Closing, How-to)"
                  value={script.label}
                  onChange={(e) =>
                    updateScript(script.id, "label", e.target.value)
                  }
                />
              </div>
              {customScripts.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeScript(script.id)}
                  className="mt-6" // Aligns with input field
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>Script</Label>
              <Textarea
                placeholder="Enter your script content here..."
                value={script.content}
                onChange={(e) =>
                  updateScript(script.id, "content", e.target.value)
                }
                rows={4}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
  const renderAISettings = () => {
    // Determine if we have a custom voice ID
    const currentVoice = formData.voiceId;
    const isCustomVoice =
      currentVoice && !["maya", "ryan", "sarah"].includes(currentVoice);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Bland AI Configuration</CardTitle>
          <CardDescription>
            Configure voice and AI behavior settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Voice Selection</Label>
            <div className="flex gap-2">
              <Select
                value={isCustomVoice ? "custom" : currentVoice}
                onValueChange={(value) => {
                  if (value !== "custom") {
                    setFormData((prev) => ({ ...prev, voiceId: value }));
                  }
                }}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isCustomVoice && (
                <Input
                  placeholder="Enter custom Voice ID"
                  value={currentVoice}
                  onChange={(e) => handleInputChange("voiceId", e.target.value)}
                />
              )}
            </div>
            {isCustomVoice && (
              <p className="text-xs text-muted-foreground">
                Enter a valid UUID voice ID from Bland AI
              </p>
            )}
          </div>

          {/* Rest of your existing fields */}
          <div className="space-y-2">
            <Label htmlFor="prompt">AI Instructions</Label>
            <Textarea
              id="prompt"
              placeholder="Detailed instructions for the AI..."
              value={formData.prompt}
              onChange={(e) => handleInputChange("prompt", e.target.value)}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              placeholder="https://your-domain.com/webhooks/training"
              value={formData.webhookUrl}
              readOnly
              disabled
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "basic":
        return renderBasicInfo();
      case "scenario":
        return renderScenario();
      case "scripts":
        return renderScripts();
      case "ai-settings":
        return renderAISettings();
      default:
        return renderBasicInfo();
    }
  };

  /* ----------  main render flow  ---------- */
  if (!selectedCampaign) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="">
          <div className="flex items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">
                Create Training Session
              </h1>
              <p className="text-muted-foreground">
                Choose a campaign to create the training for
              </p>
            </div>
          </div>

          {renderCampaignPicker()}
        </div>
      </div>
    );
  }

  /* ----------  form view (original layout)  ---------- */
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Create Training Session
              </h1>
              <p className="text-muted-foreground">
                Campaign:{" "}
                <span className="font-medium">{selectedCampaign.name}</span>{" "}
                <span className="text-xs text-muted-foreground">
                  ({selectedCampaign.type})
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              className="group"
              onClick={() => setSelectedCampaign(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 duration-300 transition-all" />
              Change Campaign
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Create Training"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <nav className="space-y-2">
                {sections.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                        activeSection === s.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{s.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="lg:col-span-3">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

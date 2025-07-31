"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

export default function AddNewScenarioDialog({
  training,
  orgId,
  open,
  setOpen,
}) {
  const [loading, setLoading] = useState(false);
  const [useCustomScripts, setUseCustomScripts] = useState(false);
  const [customScripts, setCustomScripts] = useState([]);
  const [newScenario, setNewScenario] = useState({
    title: "",
    level: "beginner",
    description: "",
    objectives: "",
    targetAudience: "",
    keyPoints: "",
    voiceId: "maya",
    prompt: "",
  });
  const bottomRef = useRef(null);
  const { push } = useRouter();

  useEffect(() => {
    // This runs when the Dialog closes (open changes from true to false)
    if (!open) {
      setUseCustomScripts(false);
      setCustomScripts([]);
    }
  }, [open]);

  const addScript = () => {
    setCustomScripts([
      ...customScripts,
      {
        id: Date.now(), // or nanoid
        label: "",
        content: "",
      },
    ]);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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

  const handleAddScenario = async () => {
    setLoading(true);
    // Get scripts from the first scenario if training.scripts is empty
    let scriptToSave;

    if (!useCustomScripts) {
      // Inherit scripts from the training level
      scriptToSave = training.scenarios?.[0]?.scripts || [];
    } else {
      // Save custom scripts provided by the user
      scriptToSave = customScripts;
    }

    const scenario = {
      trainingId: training.id,
      ...newScenario,
      keyPoints: newScenario.keyPoints
        .split("\n")
        .filter((point) => point.trim()),
      scripts: scriptToSave,
    };

    try {
      const response = await fetch(`/api/org/${orgId}/training`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainingId: training.id,
          action: "addScenario",
          scenario,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add scenario");
      }

      const { message } = await response.json();
      toast.success(message);
      // push("/training/create-training");
    } catch (error) {
      console.error("Error adding scenario:", error);
      toast.error("Failed to add scenario. Please try again.");
    } finally {
      setIsAddingScenario(false);
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Scenario
          </Button>
        </DialogTrigger>

        <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Scenario</DialogTitle>
            <DialogDescription>
              Create a new training scenario for {training.name}
            </DialogDescription>
          </DialogHeader>
          {/* Title */}
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newScenario.title}
                  onChange={(e) =>
                    setNewScenario((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., Cold Introduction"
                />
              </div>
              {/* Level */}
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={newScenario.level}
                  onValueChange={(value) =>
                    setNewScenario((prev) => ({
                      ...prev,
                      level: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newScenario.description}
                onChange={(e) =>
                  setNewScenario((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of the scenario"
                rows={2}
              />
            </div>
            {/* Objectives */}
            <div className="space-y-2">
              <Label htmlFor="objectives">Objectives</Label>
              <Textarea
                id="objectives"
                value={newScenario.objectives}
                onChange={(e) =>
                  setNewScenario((prev) => ({
                    ...prev,
                    objectives: e.target.value,
                  }))
                }
                placeholder="What should the trainee learn from this scenario?"
                rows={2}
              />
            </div>
            {/* Target Audience */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={newScenario.targetAudience}
                  onChange={(e) =>
                    setNewScenario((prev) => ({
                      ...prev,
                      targetAudience: e.target.value,
                    }))
                  }
                  placeholder="e.g., New prospects"
                />
              </div>
              {/* Voice ID */}
              <div className="space-y-2">
                <Label htmlFor="voiceId">Voice ID</Label>
                <Select
                  value={newScenario.voiceId}
                  onValueChange={(value) =>
                    setNewScenario((prev) => ({
                      ...prev,
                      voiceId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maya">Maya</SelectItem>
                    <SelectItem value="ryan">Ryan</SelectItem>
                    <SelectItem value="sarah">Sarah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* AI Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">AI Prompt</Label>
              <Textarea
                id="prompt"
                value={newScenario.prompt}
                onChange={(e) =>
                  setNewScenario((prev) => ({
                    ...prev,
                    prompt: e.target.value,
                  }))
                }
                placeholder="Instructions for the AI role-play character"
                rows={4}
              />
            </div>

            <Separator />
            {/* Scripts */}
            <div className="space-y-4">
              <h4 className="font-semibold">Scripts</h4>
              <p className="text-sm text-muted-foreground">
                By default, this scenario uses scripts shared across the entire
                training. You can override them below if needed.
              </p>

              <div className="flex items-center justify-between">
                <Label htmlFor="customScripts">
                  Use custom scripts for this scenario
                </Label>
                <Switch
                  id="customScripts"
                  checked={useCustomScripts}
                  onCheckedChange={(checked) => {
                    setUseCustomScripts(checked);
                    if (!checked) {
                      setCustomScripts([]); // or [] depending on your structure
                    }
                  }}
                />
              </div>

              {/* Compact input form if switch is enabled */}
              {useCustomScripts && (
                <div className="space-y-2">
                  {customScripts.map((script) => (
                    <div key={script.id} className="grid grid-cols-1 gap-2">
                      <Input
                        value={script.label}
                        placeholder="Script Label"
                        onChange={(e) =>
                          updateScript(script.id, "label", e.target.value)
                        }
                      />
                      <Textarea
                        value={script.content}
                        placeholder="Script Content"
                        className="text-sm"
                        rows={3}
                        onChange={(e) =>
                          updateScript(script.id, "content", e.target.value)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="self-end text-red-500"
                        onClick={() => removeScript(script.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addScript}
                    className="w-full"
                  >
                    + Add Script
                  </Button>
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddScenario}>
              {loading ? "Saving Scenario..." : "Add Scenario"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

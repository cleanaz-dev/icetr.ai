"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, ChevronDown, ChevronRight } from "lucide-react";
import { useTeamContext } from "@/context/TeamProvider";
import { useCoreContext } from "@/context/CoreProvider";
import { BrainCircuit } from "lucide-react";
import { Atom } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ManageCallScriptsDialog({
  scripts = [],
  campaignId,
  onScriptsUpdate,
  trigger,
}) {
  const { orgId } = useTeamContext();
  const { saveScript } = useCoreContext();
  const [isOpen, setIsOpen] = useState(false);
  const [formScripts, setFormScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generateWithAI, setGenerateWitAI] = useState(false);
  const [aiConfig, setAIConfig] = useState({
    numberOfScripts: 3,
    scriptParams: "",
    includeOpening: false,
  });
  const [expandedScripts, setExpandedScripts] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      setFormScripts(scripts.length > 0 ? [...scripts] : []);
      // Auto-expand new empty scripts
      setExpandedScripts(
        new Set(
          scripts
            .map((_, index) =>
              scripts.length === 0 || !scripts[index].label ? index : null
            )
            .filter((i) => i !== null)
        )
      );
    }
  }, [isOpen, scripts]);

  const addScript = () => {
    const newIndex = formScripts.length;
    setFormScripts([...formScripts, { label: "", content: "" }]);
    // Auto-expand new script
    setExpandedScripts((prev) => new Set([...prev, newIndex]));
  };

  const updateScript = (index, field, value) => {
    const updated = [...formScripts];
    updated[index][field] = value;
    setFormScripts(updated);
  };

  const removeScript = (index) => {
    setFormScripts(formScripts.filter((_, i) => i !== index));
    setExpandedScripts((prev) => {
      const newSet = new Set();
      prev.forEach((i) => {
        if (i < index) newSet.add(i);
        else if (i > index) newSet.add(i - 1);
      });
      return newSet;
    });
  };

  const toggleScript = (index) => {
    setExpandedScripts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    const hasEmpty = formScripts.some(
      (s) => !s.label.trim() || !s.content.trim()
    );
    if (hasEmpty || !orgId || !campaignId) return;

    setIsLoading(true);
    try {
      await saveScript(formScripts, orgId, campaignId);
      onScriptsUpdate?.(formScripts);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Manage Call Scripts</Button>}
      </DialogTrigger>
      <DialogContent className="min-w-3xl min-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Call Scripts</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Label>Generate with AI:</Label>
          <Checkbox
            checked={generateWithAI}
            onCheckedChange={setGenerateWitAI}
          />
        </div>
        {generateWithAI && (
          <>
            <div className="flex-col items-center space-y-2">
              <Label>Number of Scripts</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={aiConfig.numberOfScripts}
                onChange={(e) =>
                  setAIConfig({ ...aiConfig, numberOfScripts: e.target.value })
                }
              />
            </div>
            <div className="flex-col items-center space-y-2">
              <Label>Script Parameters</Label>
              <Textarea
                value={aiConfig.scriptParams}
                onChange={(e) =>
                  setAIConfig({ ...aiConfig, scriptParams: e.target.value })
                }
                placeholder="Enter script parameters (e.g., type of calls, campaign details, etc.)"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Label>Include Opening Script:</Label>
              <Checkbox
                checked={aiConfig.includeOpening}
                onCheckedChange={(e) =>
                  setAIConfig({...aiConfig, includeOpening: e.target.checked })
                }
              />
            </div>
          </>
        )}
        <div className="flex-1 overflow-y-auto space-y-2">
          {formScripts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No call scripts yet. Add your first script below.</p>
            </div>
          ) : (
            formScripts.map((script, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                {/* Header - Always Visible */}
                <div
                  className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleScript(index)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {expandedScripts.has(index) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm truncate">
                      {script.label || "Untitled Script"}
                    </span>
                    {script.content && (
                      <span className="text-xs text-muted-foreground">
                        ({script.content.split(" ").length} words)
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeScript(index);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Expandable Content */}
                <div
                  className={`transition-all duration-200 ease-in-out ${
                    expandedScripts.has(index)
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="p-4 space-y-3 bg-background">
                    <div>
                      <Label
                        htmlFor={`label-${index}`}
                        className="text-xs font-medium"
                      >
                        Script Label
                      </Label>
                      <Input
                        id={`label-${index}`}
                        value={script.label}
                        onChange={(e) =>
                          updateScript(index, "label", e.target.value)
                        }
                        placeholder="Opening, Closing, Objection Handling..."
                        className="mt-1 h-8"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`content-${index}`}
                        className="text-xs font-medium"
                      >
                        Script Content
                      </Label>
                      <Textarea
                        id={`content-${index}`}
                        value={script.content}
                        onChange={(e) =>
                          updateScript(index, "content", e.target.value)
                        }
                        placeholder="Hi, I'm [Name] from [Company]. I know you're busy, so I'll keep this quick..."
                        rows={5}
                        className="mt-1 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          <Button
            onClick={addScript}
            variant="outline"
            className="w-full border-dashed h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Script
          </Button>
        </div>

        <DialogFooter className="gap-2 pt-4">
          {generateWithAI && (
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={!aiConfig.numberOfScripts ||!aiConfig.scriptParams}
              
              >
              <Atom className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || formScripts.length === 0}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Scripts
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  FileText,
  Clock,
  Target,
} from "lucide-react";

export default function CallScriptTab({ selectedLead, callScriptData }) {
  console.log("organization", callScriptData);
  const [scripts, setScripts] = useState([
    {
      id: 1,
      name: "Cold Call Introduction",
      category: "Opening",
      content:
        "Hi [Name], this is [Your Name] from [Organization]. I hope I'm not catching you at a bad time. I'm calling because we help [Industry] companies like yours [Value Proposition]. Do you have a quick minute to chat?",
      tags: ["cold-call", "introduction"],
    },
    {
      id: 2,
      name: "Follow-up Script",
      category: "Follow-up",
      content:
        "Hi [Name], it's [Your Name] from [Organization]. We spoke last week about [Previous Discussion]. I wanted to follow up on [Specific Topic] and see if you had any questions about what we discussed.",
      tags: ["follow-up", "warm-call"],
    },
    {
      id: 3,
      name: "Objection Handler - Price",
      category: "Objections",
      content:
        "I understand price is always a consideration. Let me ask you this - what's the cost of not solving this problem? Many of our clients found that the investment pays for itself within [Timeframe] through [Specific Benefits].",
      tags: ["objection", "pricing"],
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingScript, setEditingScript] = useState(null);
  const [newScript, setNewScript] = useState({
    name: "",
    category: "",
    content: "",
    tags: [],
  });

  const categories = [
    "Opening",
    "Follow-up",
    "Objections",
    "Closing",
    "Discovery",
  ];

  const handleCreateScript = () => {
    if (newScript.name && newScript.content) {
      const script = {
        id: Date.now(),
        ...newScript,
        tags: newScript.tags.length > 0 ? newScript.tags : ["custom"],
      };
      setScripts([...scripts, script]);
      setNewScript({ name: "", category: "", content: "", tags: [] });
      setIsCreating(false);
    }
  };

  const handleEditScript = (script) => {
    setEditingScript(script.id);
    setNewScript({ ...script });
  };

  const handleUpdateScript = () => {
    setScripts(
      scripts.map((script) =>
        script.id === editingScript ? { ...newScript } : script
      )
    );
    setEditingScript(null);
    setNewScript({ name: "", category: "", content: "", tags: [] });
  };

  const handleDeleteScript = (id) => {
    setScripts(scripts.filter((script) => script.id !== id));
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingScript(null);
    setNewScript({ name: "", category: "", content: "", tags: [] });
  };

  const replaceVariables = (content) => {
    if (!selectedLead) return content;

    return content
      .replace(/\[Name\]/g, selectedLead.name || "[Name]")
      .replace(/\[Company\]/g, selectedLead.company || "[Company]")
      .replace(/\[Industry\]/g, selectedLead.industry || "[Industry]")
      .replace(/\[Your Name\]/g, callScriptData.firstName || "Your Name")
      .replace(
        /\[Value Proposition\]/g,
        "attract and convert leads through funnels, including chatbots, cold outreach, Facebook marketing, and more."
      )
      .replace(
        /\[Organization\]/g,
        callScriptData.organizationName || "[Organization]"
      );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">Call Scripts</h4>
          <p className="text-sm text-muted-foreground">
            Pre-written scripts to guide your conversations
          </p>
        </div>
        {/* <Button
          size="sm"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Script
        </Button> */}
      </div>

      {/* Selected Lead Context */}
      {selectedLead && (
        <div className="bg-muted rounded-lg ">
          <div className="p-2">
            <div className="flex-col items-center gap-2 text-sm">
              <div className="font-medium">Current Lead:</div>
              <div className="flex gap-2">
                <span>{selectedLead.name || "N/A"}</span>
                {selectedLead.company && (
                  <>
                    <span className="text-muted-foreground">at</span>
                    <span>{selectedLead.company}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingScript) && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {editingScript ? "Edit Script" : "Create New Script"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="script-name">Script Name</Label>
                <Input
                  id="script-name"
                  value={newScript.name}
                  onChange={(e) =>
                    setNewScript({ ...newScript, name: e.target.value })
                  }
                  placeholder="e.g., Cold Call Introduction"
                />
              </div>
              <div>
                <Label htmlFor="script-category">Category</Label>
                <select
                  id="script-category"
                  value={newScript.category}
                  onChange={(e) =>
                    setNewScript({ ...newScript, category: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="script-content">Script Content</Label>
              <Textarea
                id="script-content"
                value={newScript.content}
                onChange={(e) =>
                  setNewScript({ ...newScript, content: e.target.value })
                }
                placeholder="Write your script here. Use [Name], [Company], [Industry] for dynamic replacement."
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={
                  editingScript ? handleUpdateScript : handleCreateScript
                }
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingScript ? "Update" : "Create"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scripts List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {scripts.map((script) => (
            <Card key={script.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {script.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {script.category}
                      </Badge>
                      {script.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-muted rounded-md p-3 text-sm">
                  <p className="whitespace-pre-wrap">
                    {replaceVariables(script.content)}
                  </p>
                </div>
             
                  {/* <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        replaceVariables(script.content)
                      );
                    }}
                  >
                    Copy to Clipboard
                  </Button> */}
             
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {scripts.length === 0 && !isCreating && (
        <Card className="text-center py-8">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No call scripts yet. Create your first script to get started.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Script
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

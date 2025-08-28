"use client"
import { useState } from "react";
import { 
  MessageSquare, 
  User, 
  ChevronDown,
  ChevronRight,
  Settings,
  Plus
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Workflow from "./WorkFlow";

export default function PromptConfiguration({ agentInstructions = {}, onChange }) {

  // Extract current values or use defaults
  const profile = agentInstructions.profile || {};
  const greeting = agentInstructions.greeting || {};
  const transitions = agentInstructions.transitions || {};

  const updateInstructions = (section, field, value) => {
    const updated = {
      ...agentInstructions,
      [section]: {
        ...agentInstructions[section],
        [field]: value
      }
    };
    onChange(updated);
  };

  const insertVariable = (variable) => {
    const currentValue = greeting.message || "";
    const newValue = currentValue + `{${variable}}`;
    updateInstructions('greeting', 'message', newValue);
  };

  const variables = ['lead_name', 'agent_name', 'company', 'services'];

  return (
    <section className="space-y-6">
      {/* Configuration Card */}
      <div>
       
        <CardContent className="space-y-6">

          <Workflow />
          
          {/* Agent Profile - 2 columns */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Agent Profile</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agentName" className="text-xs text-muted-foreground">Agent Name</Label>
                <Input
                  id="agentName"
                  value={profile.name || ""}
                  onChange={(e) => updateInstructions('profile', 'name', e.target.value)}
                  placeholder="Sarah"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="companyName" className="text-xs text-muted-foreground">Company Name</Label>
                <Input
                  id="companyName"
                  value={profile.company || ""}
                  onChange={(e) => updateInstructions('profile', 'company', e.target.value)}
                  placeholder="Your Company"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="services" className="text-xs text-muted-foreground">Services</Label>
                <Input
                  id="services"
                  value={profile.services || ""}
                  onChange={(e) => updateInstructions('profile', 'services', e.target.value)}
                  placeholder="AI solutions, consulting"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tone" className="text-xs text-muted-foreground">Voice</Label>
                <Select
                  value={profile.voice || "Aurora"}
                  onValueChange={(value) => updateInstructions('profile', 'voice', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aura-2-aurora-en">Aurora</SelectItem>
                    <SelectItem value="aura-2-arcas-en">Arcas</SelectItem>
                    <SelectItem value="aura-2-thalia-en">Thalia</SelectItem>
                    <SelectItem value="aura-2-zeus-enl">Zeus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Greeting Message */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Opening Message</Label>
            <Textarea
              value={greeting.message || ""}
              onChange={(e) => updateInstructions('greeting', 'message', e.target.value)}
              rows={3}
              placeholder="Hi {lead_name}, this is {agent_name} from {company}..."
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {variables.map((variable) => (
                  <Button
                    key={variable}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => insertVariable(variable)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {variable}
                  </Button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {(greeting.message || "").length} chars
              </span>
            </div>
          </div>

          {/* Transition Message */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">When Lead Says "Yes"</Label>
            <Textarea
              value={transitions.onYes || ""}
              onChange={(e) => updateInstructions('transitions', 'onYes', e.target.value)}
              rows={2}
              placeholder="Great! Let me check our specialist's availability..."
              className="resize-none"
            />
            <div className="flex items-center justify-end">
              <span className="text-xs text-muted-foreground">
                {(transitions.onYes || "").length} chars
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </section>
  );
}
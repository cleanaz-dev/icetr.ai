"use client";

import React, { useState, useCallback } from "react";
import {
  Phone,
  Database,
  Mic,
  FileText,
  CheckCircle,
  ArrowDown,
  Settings,
  Play,
  Code,
  Zap,
  Clock,
  Users,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FlowSteps } from "@/lib/config/call-flow-config";
import { Atom } from "lucide-react";

export default function CallFlowBuilder() {
  const [flowConfig, setFlowConfig] = useState({
    minCallDuration: 30,
    recordingEnabled: true,
    transcriptionEnabled: true,
    autoCreateLeads: true,
    autoCreateFollowUps: true,
    aiCallGrading: true,
  });

  const [activeStep, setActiveStep] = useState(null);
  const [showCode, setShowCode] = useState(false);

  const handleConfigChange = (key, value) => {
    setFlowConfig((prev) => ({ ...prev, [key]: value }));
  };

  const flowSteps = FlowSteps(flowConfig);

  const StepCard = ({ step, index, isActive }) => {
    const Icon = step.icon;
    const isConditional = step.conditional && step.id === "recording-check";
    const shouldShow = !isConditional || flowConfig.recordingEnabled;

    if (!shouldShow) return null;

    return (
      <div className={`relative ${isActive ? "scale-105 shadow-xl" : ""}`}>
        <div
          className={`
          ${step.bgColor} ${step.borderColor} border-2 rounded-xl p-6
          ${isActive ? "ring-4 ring-blue-200 shadow-xl" : "shadow-md"}
        `}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-bold text-lg ${step.textColor}`}>
                  {step.title}
                </h3>
                <div className="flex items-center space-x-2">
                  {isConditional && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Conditional
                    </span>
                  )}
                  <span className="bg-secondary text-primary-foreground px-2 py-1 rounded-full text-xs font-mono">
                    Step {index + 1}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground font-medium ">
                {step.subtitle}
              </p>
              <p className="text-muted-foreground text-sm mb-3">
                {step.description}
              </p>

              <div className="bg-background rounded-md p-2 flex items-center">
                <code className="text-xs font-mono text-primary">
                  {step.action}
                  <span className="text-amber-300">()</span>
                </code>
              </div>
            </div>
          </div>
        </div>

        {index < flowSteps.length - 1 && (
          <div className="flex justify-center py-4">
            <ArrowDown
              className="text-primary"
              size={16}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="text-primary" size={24} />

              <div>
                <h1 className="text-2xl font-bold">Call Flow Designer</h1>
                <p className="text-muted-foreground">
                  Visual call flow builder for Twilio integration
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button className="">
                <Play size={16} className="inline mr-2" />
                Deploy Flow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="">
              <CardHeader>
                <CardTitle>
                  <span className="flex gap-2 items-center">
                    <Settings className="text-primary" size={20} />
                    <h2 className="text-xl font-bold ">Flow Configuration</h2>
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex gap-2 item-center">
                    <Clock size={16} className="inline" />
                    Record Calls After{" "}
                    <span className="text-xs italic">(seconds)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={flowConfig.minCallDuration}
                      onChange={(e) =>
                        handleConfigChange(
                          "minCallDuration",
                          parseInt(e.target.value)
                        )
                      }
                      className=""
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-muted-foreground flex items-center">
                    <Users size={16} className="inline" />
                    Features
                  </Label>
                  {[
                    {
                      key: "recordingEnabled",
                      label: "Call Recording",
                      icon: Mic,
                    },
                    {
                      key: "transcriptionEnabled",
                      label: "Auto Transcription",
                      icon: FileText,
                    },
                    {
                      key: "autoCreateLeads",
                      label: "Auto Create Leads",
                      icon: Database,
                    },
                    {
                      key: "autoCreateFollowUps",
                      label: "Auto Follow-ups",
                      icon: CheckCircle,
                    },
                    {
                      key: "aiCallGrading",
                      label: "Grades Call with AI",
                      icon: Atom,
                    }
                  ].map(({ key, label, icon: FeatureIcon }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FeatureIcon size={16} className="text-primary" />
                        <label className="font-medium">{label}</label>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <Switch
                          type="checkbox"
                          checked={flowConfig[key]}
                          onChange={(e) =>
                            handleConfigChange(key, e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flow Visualization */}
          <div className="lg:col-span-2">
            <Card className="">
              <CardHeader>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity size={20} className="text-primary" />
                  Call Flow Visualization
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {flowSteps.map((step, index) => (
                    <StepCard
                      key={step.id}
                      step={step}
                      index={index}
                      isActive={activeStep === step.id}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

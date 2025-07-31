"use client";
import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  Edit,
  Mic,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import AddNewScenarioDialog from "../create-training/AddNewScenarioDialog";
import TrainingStatsCards from "../create-training/TrainingStatsCards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default function SingleTrainingPage({
  training: initialTraining,
  orgId,
  blandAiVoiceIds = [],
}) {
  const [training, setTraining] = useState(initialTraining);
  const [open, setOpen] = useState(false);
  const [expandedScripts, setExpandedScripts] = useState(new Set());
  const scriptsRefs = useRef({});

  const toggleScripts = (scenarioId) => {
    setExpandedScripts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(scenarioId)) {
        newSet.delete(scenarioId);
      } else {
        newSet.add(scenarioId);
        // Smooth scroll to scripts section after a short delay to allow expansion
        setTimeout(() => {
          scriptsRefs.current[scenarioId]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
      return newSet;
    });
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getLevelDecoration = (level) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "underline decoration-green-500";
      case "intermediate":
        return "underline decoration-yellow-500";
      case "advanced":
        return "underline decoration-red-500";
      default:
        return "underline decoration-gray-500";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen px-6 py-2">
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold decoration-primary underline">
                {training.name}
              </h1>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center text-xs">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created: {formatDate(training.createdAt)}
                </div>
                <div className="flex items-center text-xs">
                  <Clock className="w-4 h-4 mr-1" />
                  Updated: {formatDate(training.updatedAt)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <AddNewScenarioDialog
                training={training}
                orgId={orgId}
                open={open}
                setOpen={setOpen}
              />
            </div>
          </div>
        </div>
        {/* Training Overview Cards */}
        <TrainingStatsCards training={training} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="scenarios_scripts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scenarios_scripts">
              <span className="cursor-pointer">Scenarios & Scripts</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <span className="cursor-pointer">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios_scripts" className="space-y-6">
            {training.scenarios.map((scenario) => {
              const isScriptsExpanded = expandedScripts.has(scenario.id);

              return (
                <Card key={scenario.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Image 
                          src="https://avatar.iran.liara.run/public/25"
                          className="size-16"
                          width={100}
                          height={100}
                          alt="traininig avatar"
                        />
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <span
                              className={getLevelDecoration(scenario.level)}
                            >
                              {scenario.title}{" "}
                            </span>
                            <Badge className={getLevelColor(scenario.level)}>
                              <span className="capitalize">
                                {scenario.level}
                              </span>
                            </Badge>
                            {scenario.scripts &&
                              scenario.scripts.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {scenario.scripts.length} script
                                  {scenario.scripts.length !== 1 ? "s" : ""}
                                </Badge>
                              )}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {scenario.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center">
                          <Mic className="w-4 h-4 mr-1 text-primary" />
                          Voice:{" "}
                          <span className="capitalize ml-2">
                            {scenario.voiceId}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-primary" />
                          Target: {scenario.targetAudience}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Objectives</h4>
                      <p className="text-sm">{scenario.objectives}</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-sm mb-2">AI Prompt</h4>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm">{scenario.prompt}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Show Scripts Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>
                          {scenario.scripts ? scenario.scripts.length : 0}{" "}
                          script(s) available
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleScripts(scenario.id)}
                        className="flex items-center gap-2 text-"
                      >
                        {isScriptsExpanded ? "Hide Scripts" : "Show Scripts"}
                        {isScriptsExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>

                  {/* Scripts Section */}
                  <div
                    ref={(el) => (scriptsRefs.current[scenario.id] = el)}
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isScriptsExpanded
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <CardContent className="pt-0 pb-6">
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        Scripts for {scenario.title}
                      </h4>

                      {scenario.scripts && scenario.scripts.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {scenario.scripts.map((script) => (
                            <div key={script.id}>
                              <div className="pb-3">
                                <div className="text-base">
                                  <span className="font-semibold uppercase tracking-wide text-sm">
                                    {script.label}
                                  </span>
                                </div>
                              </div>
                              <div className="pt-0">
                                <div className="bg-background/80 p-4 rounded-md border">
                                  <pre className="text-sm whitespace-pre-wrap  ">
                                    {script.content}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Card className="bg-muted/30">
                          <CardContent className="text-center py-8">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                              No scripts available for this scenario.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Configuration and webhook settings for this training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-md">
                    <code className="text-sm text-muted-foreground">
                      {training.webhookUrl}
                    </code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Training ID</label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-md">
                    <code className="text-sm text-muted-foreground">
                      {training.id}
                    </code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Campaign ID</label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-md">
                    <code className="text-sm text-muted-foreground">
                      {training.campaignId}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

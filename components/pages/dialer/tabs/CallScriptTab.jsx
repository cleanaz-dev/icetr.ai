"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, X, FileText } from "lucide-react";

export default function CallScriptTab({ selectedLead, callScriptData }) {
  console.log("selectedLead", selectedLead);
  const [scripts, setScripts] = useState(selectedLead.campaign?.scripts || []);

  const [isCreating, setIsCreating] = useState(false);

  const replaceVariables = (content) => {
    if (!selectedLead) return content;

    return content
      .replace(/\[Name\]/g, selectedLead.name || "[Lead_Name]")
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
    <div className="flex flex-col h-full max-h-screen">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Call Scripts</h4>
            <p className="text-sm text-muted-foreground">
              Pre-written scripts to guide your conversations
            </p>
          </div>
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
      </div>

      {/* Scrollable Scripts List */}
      <div className="flex-1 min-h-0 my-4 pb-4">
        <ScrollArea className="h-[calc(100vh-220px)] w-full">
          <div className="space-y-3 pb-4">
            {scripts.map((script, index) => (
              <div key={index} className="flex-col gap-4 sapce-y-4">
                <div className="flex gap-2 items-center mb-2 ">
                  <FileText className="w-4 h-4 text-primary" />
                  {script.label}
                </div>

                <div className="">
                  <div className="bg-muted rounded-md px-2 py-1 text-sm">
                    <pre className="whitespace-pre-wrap">
                      {replaceVariables(script.content)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Empty State */}
      {scripts.length === 0 && !isCreating && (
        <div className="flex-1 flex items-center justify-center">
          <Card className="text-center py-8 max-w-md mx-auto">
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
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, X, FileText } from "lucide-react";

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
    {
      id: 4,
      name: "Closing Script",
      category: "Closing",
      content:
        "Based on our conversation today, it sounds like [Solution] would be a great fit for [Company]. The next step would be to [Next Action]. Are you available for a quick call tomorrow to discuss the details?",
      tags: ["closing", "next-steps"],
    },
    {
      id: 5,
      name: "Referral Request",
      category: "Referrals",
      content:
        "I'm glad we could help [Company] with [Solution]. Do you know of any other [Industry] companies that might benefit from similar results? I'd appreciate any introductions you could make.",
      tags: ["referral", "networking"],
    },
  ]);

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
        <ScrollArea className="h-[calc(100vh-280px)] w-full">
          <div className="space-y-3 pb-4">
            {scripts.map((script) => (
              <Card
                key={script.id}
                className="hover:shadow-sm transition-shadow"
              >
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
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-muted rounded-md p-3 text-sm">
                    <pre className="whitespace-pre-wrap">
                      {replaceVariables(script.content)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
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

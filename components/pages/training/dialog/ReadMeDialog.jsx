import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Copy,
  CheckCircle,
  Target,
  MessageSquare,
  Bot,
  Lightbulb,
  FileText,
  Users,
  Zap,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ReadMeDialog() {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const promptTemplate = `Prompt:

Create a roleplay training scenario using the structure below. Use natural paragraph format throughout except for the Training Objectives, which should be a bulleted list. Keep the Scenario Description and AI Instructions to a maximum of 3 sentences each. Include an Opening Script as the first script, followed by three other relevant scripts matching the scenario context. Each script should include only the dialogue the user will say, in quotes.

Level: [Beginner / Intermediate / Advanced]
Title: [Scenario Title]

Scenario Description:
[Briefly describe the scenario in no more than 3 sentences. Include who the user is talking to, what the company offers, and the goal.]

Training Objectives:
• [Objective 1]
• [Objective 2]
• [Objective 3]

Target: [Who the user is speaking to — e.g., job title or persona]

Scripts:

Opening Script
Script:
"[What the user says to start the interaction]"

[Second Script Label]
Script:
"[Relevant user dialogue for this stage]"

[Third Script Label]
Script:
"[Relevant user dialogue for this stage]"

[Fourth Script Label]
Script:
"[Relevant user dialogue for this stage]"

AI Instructions:
[In no more than 3 sentences, explain how the AI should respond during the roleplay. Include guidance on resistance or openness based on user tone and clarity.]`;

  const exampleScenario = `**Level:** intermediate

**Title:** Cold Lead Insurance Follow-up

**Scenario Description:** 
Follow up with a potential customer who filled out an online form for auto insurance quotes but hasn't responded to previous contact attempts.

**Training Objectives:** 
• Build rapport and trust with the prospect
• Identify their current insurance situation and pain points
• Present appropriate insurance solutions
• Overcome price objections and scheduling concerns
• Secure a commitment for next steps

**Target:** 
Busy professional who filled out insurance form 2 weeks ago but has been avoiding sales calls due to past bad experiences with pushy salespeople.

**Scripts:**

1. **Opening Script**
   - Label: "Warm Introduction"
   - Script: "Hi [Name], this is [Your Name] from ABC Insurance. You recently requested a quote on our website. I'm calling because I have some great options that could save you money. Do you have a quick minute to discuss your auto insurance?"
   - AI Instructions: Act slightly skeptical and busy. Show mild interest but be ready to brush off the call. Respond with something like "Oh, I filled out so many forms... I'm pretty busy right now, what's this about exactly?"

2. **Objection Handling Script**
   - Label: "Addressing Concerns"
   - Script: "I completely understand you're busy and probably get a lot of these calls. I'm not here to pressure you - I just want to show you how you could potentially save $200-400 annually. Would you prefer I email you the details or could we take just 3 minutes now?"
   - AI Instructions: Soften slightly but remain cautious. Express concern about switching insurers and mention being satisfied with current coverage. Say something like "I don't know... I've been with my current company for years and switching seems like a hassle."

3. **Value Proposition Script**
   - Label: "Presenting Benefits"
   - Script: "I hear you about switching being a hassle - that's exactly why we handle everything for you. Plus, with your clean driving record, you qualify for our preferred rates. Most clients in your situation save at least $300 yearly with better coverage. What matters most to you - saving money or having better protection?"
   - AI Instructions: Show genuine interest now. Ask specific questions about coverage options and express concern about being locked into contracts. Respond with "That does sound interesting... but I'm worried about being stuck in a long contract. What if I'm not happy with the service?"

4. **Closing Script**
   - Label: "Securing Next Steps"
   - Script: "Great question! We have a 30-day satisfaction guarantee - no cancellation fees if you're not completely happy. How about this: let me prepare a personalized quote comparison for you. I can have it ready by tomorrow. Would you prefer a call at 2 PM or 4 PM to review it together?"
   - AI Instructions: Show readiness to move forward but request to think it over. Accept the quote review but be slightly hesitant about the timing. Respond with "Okay, that sounds fair. Tomorrow is pretty packed though... could we do Thursday instead? And can you email me some basic info before then?"`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          How to Generate Scenarios
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-3xl max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
              <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            Generate Training Scenarios with AI
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guide">Quick Guide</TabsTrigger>
            <TabsTrigger value="template">AI Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="guide" className="space-y-6">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-green-600" />
                    Training Scenario Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          1
                        </Badge>
                        <div>
                          <h4 className="font-medium">Level</h4>
                          <p className="text-sm text-muted-foreground">
                            Beginner, Intermediate, or Advanced
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          2
                        </Badge>
                        <div>
                          <h4 className="font-medium">Title</h4>
                          <p className="text-sm text-muted-foreground">
                            Descriptive scenario name
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          3
                        </Badge>
                        <div>
                          <h4 className="font-medium">Scenario Description</h4>
                          <p className="text-sm text-muted-foreground">
                            What the call is about (sales, support, etc.)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          4
                        </Badge>
                        <div>
                          <h4 className="font-medium">Training Objectives</h4>
                          <p className="text-sm text-muted-foreground">
                            What the user needs to accomplish (bullet points)
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          5
                        </Badge>
                        <div>
                          <h4 className="font-medium">Target</h4>
                          <p className="text-sm text-muted-foreground">
                            Who the AI roleplays (prospect, customer, etc.)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          6
                        </Badge>
                        <div>
                          <h4 className="font-medium">Scripts (4 required)</h4>
                          <p className="text-sm text-muted-foreground">
                            Each with Label, Script, and AI Instructions
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Script Components
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Label (Title)</h4>
                        <p className="text-sm text-muted-foreground">
                          Brief name for the script section
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
                        <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Script</h4>
                        <p className="text-sm text-muted-foreground">
                          What the user/agent will say
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                        <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">AI Instructions</h4>
                        <p className="text-sm text-muted-foreground">
                          How the AI should respond and behave
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Copy This Prompt to Any AI
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(promptTemplate, "template")}
                    className="flex items-center gap-2"
                  >
                    {copiedSection === "template" ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {promptTemplate}
                  </pre>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>💡 Pro Tip:</strong> After copying this prompt,
                    paste it into ChatGPT, Claude, or any AI assistant. Then add
                    specific details about your industry, product, or service to
                    get customized scenarios.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span>Works with ChatGPT, Claude, Gemini</span>
          </div>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span>Generate unlimited scenarios</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Customize for any industry</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

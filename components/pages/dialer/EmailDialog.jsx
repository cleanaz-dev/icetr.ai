"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Eye, Send, User, Building } from "lucide-react";

const EMAIL_TEMPLATES = [
  {
    id: "product",
    name: "Product Email",
    description: "Introduce your product/service",
    subject: "Solution for {company}",
    preview: "Introduce your product benefits and features...",
    icon: <Mail className="w-4 h-4" />
  },
  {
    id: "followup",
    name: "Follow-up Email", 
    description: "Follow up after a call or meeting",
    subject: "Great talking with you, {name}",
    preview: "Thanks for our conversation. Here's what we discussed...",
    icon: <User className="w-4 h-4" />
  },
  {
    id: "introduction",
    name: "Introduction Email",
    description: "Introduce yourself and your company",
    subject: "Introduction from {user.firstname}",
    preview: "Hi {name}, I wanted to introduce myself and our company...",
    icon: <Building className="w-4 h-4" />
  }
];

export default function EmailDialog({ lead, open, onOpenChange, onEmailSent, user }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailAddress, setEmailAddress] = useState(lead?.email || "");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowPreview(false);
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate || !emailAddress) return;

    setSending(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          emailAddress: emailAddress,
          leadData: {
            name: lead.name,
            company: lead.company,
            // Add other lead data as needed
          }
        }),
      });

      if (response.ok) {
        onEmailSent?.(selectedTemplate, emailAddress);
        onOpenChange(false);
        // Reset state
        setSelectedTemplate(null);
        setShowPreview(false);
      } else {
        console.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setSending(false);
    }
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null;

    const personalizedSubject = selectedTemplate.subject
      .replace("{company}", lead.company || "your company")
      .replace("{name}", lead.name || "there")
      .replace("{user.firstname}", "John"); // Replace with actual user data

    const personalizedPreview = selectedTemplate.preview
      .replace("{company}", lead.company || "your company")
      .replace("{name}", lead.name || "there")
      .replace("{user.firstname}", "John"); // Replace with actual user data

    return (
      <Card >
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
              <div className="text-sm font-medium">{personalizedSubject}</div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Preview</Label>
              <div className="text-sm text-muted-foreground">{personalizedPreview}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl md:min-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email to {lead?.name || "Lead"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Address Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter email address"
              className={!lead?.email ? "border-orange-200 bg-orange-50" : ""}
            />
            {!lead?.email && (
              <p className="text-sm text-orange-600">
                No email address on file for this lead
              </p>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Choose Email Template</Label>
            <div className="grid grid-cols-1 gap-3">
              {EMAIL_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {template.icon}
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          {selectedTemplate && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Email Preview</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>
              {showPreview && renderTemplatePreview()}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={!selectedTemplate || !emailAddress || sending}
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
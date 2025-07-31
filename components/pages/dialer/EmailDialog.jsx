"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Mail, Eye, Send, User, Building, Video } from "lucide-react";

const EMAIL_TEMPLATES = [
  {
    id: "product",
    name: "Product Email",
    description: "Introduce your product/service",
    subject: "Solution for {company}",
    preview: "Introduce your product benefits and features...",
    icon: <Mail className="w-4 h-4" />,
  },
  {
    id: "followup",
    name: "Follow-up Email",
    description: "Follow up after a call or meeting",
    subject: "Great talking with you, {name}",
    preview: "Thanks for our conversation. Here's what we discussed...",
    icon: <User className="w-4 h-4" />,
  },
  {
    id: "introduction",
    name: "Introduction Email",
    description: "Introduce yourself and your company",
    subject: "Introduction from {user.firstname}",
    preview: "Hi {name}, I wanted to introduce myself and our company...",
    icon: <Building className="w-4 h-4" />,
  },
  {
    id: "loom",
    name: "Loom VSL",
    description: "Video introduction",
    subject: "Check out this 2min video",
    preview: "This video will show you exactly....",
    icon: <Video className="w-4 h-4" />,
  },
];

export default function EmailDialog({
  lead,
  open,
  onOpenChange,
  onEmailSent,
  user,
}) {
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
      const response = await fetch(`/api/org/${orgId}/leads/${lead.id}/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          emailAddress: emailAddress,
          leadData: {
            name: lead.name,
            company: lead.company,
          },
        }),
      });

      if (response.ok) {
        onEmailSent?.(selectedTemplate, emailAddress);
        onOpenChange(false);
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
      .replace("{user.firstname}", user?.firstName || "John");

    const personalizedPreview = selectedTemplate.preview
      .replace("{company}", lead.company || "your company")
      .replace("{name}", lead.name || "there")
      .replace("{user.firstname}", user?.firstName || "John");

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-muted/30 rounded-lg p-4 space-y-3"
      >
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Subject
          </span>
          <div className="text-sm font-medium mt-1">{personalizedSubject}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
        >
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Preview
          </span>
          <div className="text-sm text-muted-foreground mt-1">
            {personalizedPreview}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  useEffect(() => {
    if (!open) {
      setEmailAddress(lead?.email || "");
      setSelectedTemplate(null);
      setShowPreview(false);
    } else {
      setEmailAddress(lead?.email || "");
    }
  }, [open, lead]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setEmailAddress("");
      setSelectedTemplate(null);
      setShowPreview(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
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
              className={!lead?.email ? "border-orange-500" : ""}
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
            <div className="space-y-2">
              {EMAIL_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-all hover:bg-muted/50 ${
                    selectedTemplate?.id === template.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                        {template.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
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
              <AnimatePresence>
                {showPreview && renderTemplatePreview()}
              </AnimatePresence>
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
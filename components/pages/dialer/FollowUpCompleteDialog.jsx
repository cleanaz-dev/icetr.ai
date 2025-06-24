import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CheckCheck } from 'lucide-react';
// Using native Date formatting instead of date-fns

const COMPLETION_OUTCOMES = [
  { value: "contacted", label: "Successfully Contacted" },
  { value: "scheduled", label: "Meeting/Call Scheduled" },
  { value: "not_interested", label: "Not Interested" },
  { value: "unreachable", label: "Still Unreachable" },
  { value: "callback_requested", label: "Callback Requested" },
  { value: "email_sent", label: "Email Sent Instead" },
  { value: "other", label: "Other" }
];

export default function FollowUpCompleteDialog({ 
  followUpId, 
  onComplete 
}) {
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!outcome) return;
    
    setLoading(true);

    const completionData = {
      outcome,
      notes,
    };
    
    try {
      await onComplete(followUpId, completionData);
      setOpen(false); // ✅ Close dialog on success
      // Reset form
      setOutcome("");
      setNotes("");
      // Assuming these are unused or global — remove if undefined
      // setCreateNewFollowUp(false);
      // setNewFollowUpDate("");
      // setNewFollowUpType("call");
    } catch (error) {
      console.error("Error completing follow-up:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!followUpId) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CheckCheck /> Complete
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Follow-Up</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="outcome">What was the outcome? *</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome..." />
              </SelectTrigger>
              <SelectContent>
                {COMPLETION_OUTCOMES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details about this follow-up..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!outcome || loading}
          >
            {loading ? "Completing..." : "Complete Follow-Up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

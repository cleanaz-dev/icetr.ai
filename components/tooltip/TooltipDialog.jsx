"use client"
import { useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function TooltipDialog({ tooltip, children, dialogContent }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div onClick={() => setIsDialogOpen(true)}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          {tooltip}
        </TooltipContent>
      </Tooltip>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {dialogContent}
        </DialogContent>
      </Dialog>
    </>
  );
}
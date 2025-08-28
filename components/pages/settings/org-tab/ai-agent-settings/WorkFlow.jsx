import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StepBadge,
  StepNumber,
  RightArrow,
  DownArrow,
  WorkflowWrapper,
  GridCell,
} from "@/lib/styles";
import { Star } from "lucide-react";
import { Database } from "lucide-react";

export default function workflow() {
  return (
    <div className="bg-muted/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
        
         Conversation Flow
        </CardTitle>
      </CardHeader>

      <CardContent>
        <WorkflowWrapper>
          {/* Row 1: Badges and Right Arrows */}
          <GridCell $row={1} $col={1} $span={1}>
            <StepBadge>
              <StepNumber>1</StepNumber>
              Opening Message
            </StepBadge>
          </GridCell>

          <GridCell $row={1} $col={2} $span={1}>
            <RightArrow />
          </GridCell>

          <GridCell $row={1} $col={3} $span={1}>
            <StepBadge>
              <StepNumber>2</StepNumber>
              Wrong Person/Objection
            </StepBadge>
          </GridCell>

          <GridCell $row={1} $col={4} $span={1}>
            <RightArrow />
          </GridCell>

          <GridCell $row={1} $col={5} $span={1}>
            <StepBadge>
              <StepNumber>3</StepNumber>
              If Yes, Mini Pitch
            </StepBadge>
          </GridCell>

          <GridCell $row={1} $col={6} $span={1}>
            <RightArrow />
          </GridCell>

          <GridCell $row={1} $col={7} $span={1}>
            <StepBadge>
              <StepNumber>4</StepNumber>
              Booking Meeting
            </StepBadge>
          </GridCell>

          {/* Row 2: Down Arrows */}
          <GridCell $row={2} $col={3} $span={1}>
            <DownArrow />
          </GridCell>

          <GridCell $row={2} $col={7} $span={1}>
            <DownArrow />
          </GridCell>

          {/* Row 3: Badges and Right Arrows */}
          <GridCell $row={3} $col={3} $span={1}>
            <StepBadge>
              <StepNumber>5</StepNumber>
              Address Objections
            </StepBadge>
          </GridCell>

          <GridCell $row={3} $col={4} $span={1}>
            <RightArrow />
          </GridCell>

          <GridCell $row={3} $col={5} $span={1}>
            <StepBadge>
              <StepNumber>6</StepNumber>
              Schedule Call Back
            </StepBadge>
          </GridCell>

          <GridCell $row={3} $col={6} $span={1}>
            <RightArrow />
          </GridCell>

          <GridCell $row={3} $col={7} $span={1}>
            <StepBadge>
              <StepNumber><Database className="size-4"/></StepNumber>
              Update CRM / End Call
            </StepBadge>
          </GridCell>

          {/* Row 4: Down Arrow */}
          <GridCell $row={4} $col={3} $span={1}>
            <DownArrow />
          </GridCell>

          {/* Row 5: Badges and Right Arrows */}
          <GridCell $row={5} $col={3} $span={1}>
            <StepBadge>
              <StepNumber>7</StepNumber>
              Not Interested
            </StepBadge>
          </GridCell>

          <GridCell $row={5} $col={4} $span={1}>
            <RightArrow />
          </GridCell>

          <GridCell $row={5} $col={5} $span={1}>
            <StepBadge>
              <StepNumber>8</StepNumber>
              Polite Close / Offer Email
            </StepBadge>
          </GridCell>

          <GridCell $row={5} $col={6} $span={1}>
            <RightArrow />
          </GridCell>

          <GridCell $row={5} $col={7} $span={1}>
            <StepBadge>
            <StepNumber><Database className="size-4"/></StepNumber>
              Update CRM / End Call
            </StepBadge>
          </GridCell>
        </WorkflowWrapper>
      </CardContent>
    </div>
  );
}
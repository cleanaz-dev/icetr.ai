import styled from 'styled-components';
import { ArrowRight, ArrowDown } from "lucide-react";

export const StepBadge = styled.div.attrs({
  className: "flex items-center px-4 py-3 bg-muted rounded-full text-sm font-medium whitespace-nowrap w-full justify-center",
})``;

export const StepNumber = styled.div.attrs({
  className: "w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold mr-3 text-primary-foreground",
})``;

export const RightArrow = styled(ArrowRight).attrs({
  className: "w-6 h-6 text-muted-foreground",
})``;

export const DownArrow = styled(ArrowDown).attrs({
  className: "w-6 h-6 text-muted-foreground",
})``;

export const WorkflowWrapper = styled.div.attrs({
  className: "grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] grid-rows-5 gap-4 w-full grid-flow-row auto-rows-max",
})``;

export const GridCell = styled.div.attrs(({ $col, $span = 1, $row }) => ({
  style: {
    gridColumnStart: $col,
    gridColumnEnd: `span ${$span}`,
    gridRowStart: $row,
  },
  className: "flex items-center justify-center",
}))``;
import React from "react";
import { scenarios } from "@/lib/constants/training";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800 border-green-200";
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Advanced":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getDifficultyDecoration = (difficulty) => {
  switch (difficulty) {
    case "Beginner":
      return "underline font-semibold decoration-green-500";
    case "Intermediate":
      return "underline font-semibold decoration-yellow-500";
    case "Advanced":
      return "underline font-semibold decoration-red-500";
    default:
      return "underline font-semibold decoration-gray-500";
  }
}

export default function ScenarioSelectionCard({
  selectedScenario,
  setSelectedScenario,
  trainingStatus,
}) {
  const current = scenarios.find((s) => s.id === selectedScenario);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Practice Scenario</CardTitle>
        <CardDescription>
          Choose the type of customer interaction you want to practice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedScenario}
          onValueChange={(value) =>
            trainingStatus === "idle" && setSelectedScenario(value)
          }
          disabled={trainingStatus !== "idle"}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a scenario..." />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                {scenario.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {current && (
          <div className="p-4 border rounded-md space-y-2 bg-muted/50">
            <div className="flex items-center justify-between">
              <p className={getDifficultyDecoration(current.difficulty)}>{current.name}</p>
              <Badge className={getDifficultyColor(current.difficulty)}>
                {current.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {current.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

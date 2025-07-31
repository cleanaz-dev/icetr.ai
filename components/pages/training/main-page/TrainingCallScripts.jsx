import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dot } from "lucide-react";

export default function TrainingCallScripts({selectedScenario, currentCampaign, currentTraining}) {
  // Handle case where no scenario is selected
  if (!selectedScenario || !selectedScenario.scripts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Call Scripts</CardTitle>
          <CardDescription>Select a scenario to view call scripts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Choose a campaign, training, and scenario to display relevant call scripts.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get scripts from the selected scenario
  const scripts = selectedScenario.scripts || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Call Scripts</CardTitle>
          <CardDescription>
           <p className="flex items-center text-base">Scripts for {currentCampaign?.campaignName} <Dot /> {currentTraining?.trainingName} <Dot />  {selectedScenario.title}</p> 
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scripts.map((script) => (
            <div key={script.id}>
              <h3 className="text-sm font-medium text-primary mb-3 uppercase tracking-wide">
                {script.label}
              </h3>
              <div className="bg-muted/30 p-4 rounded-md border-l-2 border-primary/50">
                <pre className="leading-relaxed text-sm whitespace-pre-line">
                  {script.content}
                </pre>
              </div>
            </div>
          ))}
          
          {/* Show message if no scripts available */}
          {scripts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                No scripts available for this scenario.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
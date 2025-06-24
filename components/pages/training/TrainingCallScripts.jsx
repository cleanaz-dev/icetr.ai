import { callScripts } from "@/lib/constants/training";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TrainingCallScripts() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cold Call Script</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted py-2 px-4 rounded">
            <h2 className="text-sm font-semibold text-primary mb-1">Opening</h2>
            <p className="text-sm leading-relaxed">{callScripts.opening}</p>
          </div>
          <div className="bg-muted py-2 px-4 rounded">
            <h2 className="text-sm font-semibold text-primary mb-1">
              Rebuttal
            </h2>
            <p className="text-sm leading-relaxed">{callScripts.rebuttal}</p>
          </div>
          <div className="bg-muted py-2 px-4 rounded">
            <h2 className="text-sm font-semibold text-primary mb-1">
              Features
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {callScripts.features}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

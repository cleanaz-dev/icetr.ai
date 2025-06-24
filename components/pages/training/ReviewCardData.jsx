import { Button } from "@/components/ui/button";
import {
  AudioLines,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from "lucide-react";

const getGradeColor = (grade) => {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-800 border-green-300";
    case "B":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "C":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "D":
    case "F":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const MetricRow = ({ label, value, isBoolean = false }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm">{label}</span>
    {isBoolean ? (
      value ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )
    ) : (
      <span className="text-sm font-medium">{value}</span>
    )}
  </div>
);

export default function ReviewDataCard({ review }) {
  return (
    <div className="space-y-6">
     

      {/* Performance Metrics */}
      <div>
        <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
          Performance Metrics
        </h4>
        <div className="space-y-1 bg-muted/30 rounded-lg p-3">
          <MetricRow 
            label="Rapport Built" 
            value={review.rapportBuilt} 
            isBoolean={true} 
          />
          <MetricRow 
            label="Objection Handled" 
            value={review.objectionHandled} 
            isBoolean={true} 
          />
          <MetricRow 
            label="Booked Meeting" 
            value={review.bookedMeeting} 
            isBoolean={true} 
          />
        </div>
      </div>

      {/* Scores Section */}
      <div>
        <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
          Scores
        </h4>
        <div className="space-y-4">
          {/* Overall Score */}
          {review.overallScore && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Grade</span>
              <span
                className={`px-3 py-1 rounded-full text-lg font-semibold border ${getGradeColor(
                  review.overallScore
                )}`}
              >
                {review.overallScore}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      {review.improvements && (
        <div>
          <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
            Feedback
          </h4>
          <div className="bg-muted/30  rounded-lg p-3">
            <p className="text-sm ">{review.improvements}</p>
          </div>
        </div>
      )}

      {/* Actions Section */}
      {review.recordingUrl && (
        <div className="pt-2 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href={review.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <AudioLines className="w-4 h-4 mr-2" />
              Listen to Recording
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
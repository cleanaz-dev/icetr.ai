import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TECH_STACK_OPTIONS = [
  { id: "CRM", label: "CRM" },
  { id: "EMAIL_MARKETING", label: "Email Marketing" },
  { id: "LIVE_CHAT", label: "Live Chat" },
  { id: "ECOMMERCE", label: "Ecommerce" },
  { id: "ANALYTICS", label: "Analytics" },
  { id: "AUTOMATION", label: "Automation" },
  { id: "PAYMENT_PROCESSING", label: "Payment Processing" },
  { id: "CUSTOMER_SUPPORT", label: "Customer Support" },
  { id: "LEAD_GENERATION", label: "Lead Generation" },
  { id: "SOCIAL_MEDIA_TOOLS", label: "Social Media Tools" },
];

const ResearchDisplay = ({ research, isLoading }) => {
  const [filterPriority, setFilterPriority] = useState("all");

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-5 h-5 mr-3 " />
        <span className="">Loading research data...</span>
      </div>
    );
  }

  if (!research) return null;

  const data = typeof research === "string"
    ? { companyOverview: research, talkingPoints: [], leadScore: 0 }
    : research;

  const KeyValuePair = ({ label, value, isArray = false, isBoolean = false }) => (
    <div className="flex justify-between py-2 px-3 bg-muted rounded items-center">
      <span className="font-medium capitalize text-primary">{label}</span>
      <span className="text-sm ">
        {isBoolean ? (
          <Badge variant={value ? "default" : "secondary"}>
            {value ? "Active" : "Not Found"}
          </Badge>
        ) : isArray && Array.isArray(value) ? (
          value.length ? value.join(", ") : "None Detected"
        ) : (
          value || <span className="text-muted-foreground/50">Not Detected</span>  
        )}
      </span>
    </div>
  );

  const TechGroup = ({ groups }) => (
    <div className="space-y-4">
      <h5 className="font-semibold text-md ">Technology Groups</h5>
      {groups.map((group) => (
        <div key={group.name} className="border-b pb-4 last:border-b-0">
          <h6 className="font-medium capitalize ">{group.name}</h6>
          <p className="text-sm ">
            Live: {group.live || 0} | Dead: {group.dead || 0}
          </p>
          {group.categories?.length ? (
            <ul className="list-disc list-inside text-sm space-y-1 ">
              {group.categories.map((cat) => (
                <li key={cat.name} className="capitalize">
                  <span className="font-medium">{cat.name}</span> — Live: {cat.live || 0}, Dead: {cat.dead || 0}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm  italic">No categories detected</p>
          )}
        </div>
      ))}
    </div>
  );

  const filteredPoints = data.talkingPoints?.filter(
    (point) => filterPriority === "all" || point.priority === filterPriority
  ) || [];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="">Research Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.companyOverview && (
          <div>
            <h5 className="font-semibold text-md mb-2 ">Company Overview</h5>
            <p className="text-sm ">{data.companyOverview}</p>
          </div>
        )}

        {data.leadScore !== undefined && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-semibold text-md ">Lead Score</h5>
              <span className="text-xl font-bold ">{data.leadScore}/100</span>
            </div>
            {data.leadScoreExplanation && (
              <p className="text-sm ">{data.leadScoreExplanation}</p>
            )}
          </div>
        )}

        {data.techStackAnalysis && (
          <div>
            <h5 className="font-semibold text-md mb-2 ">Technology Assessment</h5>
            {data.techStackAnalysis.techStackOverview && (
              <p className="text-sm  mb-4">{data.techStackAnalysis.techStackOverview}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(data.techStackAnalysis)
                .filter(([key]) => key !== "techStackOverview" && key !== "groups")
                .map(([key, value]) => {
                  const techOption = TECH_STACK_OPTIONS.find(opt => opt.id === key);
                  return (
                    <KeyValuePair
                      key={key}
                      label={techOption ? techOption.label : key.replace(/([A-Z])/g, " $1").trim()}
                      value={value}
                      isArray={Array.isArray(value)}
                      isBoolean={typeof value === "boolean"}
                    />
                  );
                })}
            </div>
            {data.techStackAnalysis.groups?.length > 0 && (
              <div className="mt-6">
                <TechGroup groups={data.techStackAnalysis.groups} />
              </div>
            )}
          </div>
        )}

        {data.talkingPoints?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-md ">Key Discussion Points</h5>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ul className="space-y-3">
              {filteredPoints
                .sort((a, b) => {
                  const priorityOrder = { high: 1, medium: 2, low: 3 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((point, index) => (
                  <li key={index} className="flex items-start gap-3 bg-muted p-1 rounded">
                    <span className="flex-shrink-0 w-6 h-6 bg-muted rounded-full flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${point.priority === "high" ? "font-semibold " : "text-muted-foreground"}`}>
                        {point.text}
                      </p>
                      {point.priority && (
                        <Badge variant={point.priority === "high" ? "default" : "secondary"} className="mt-1">
                          {point.priority.charAt(0).toUpperCase() + point.priority.slice(1)} Priority
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default ResearchDisplay;

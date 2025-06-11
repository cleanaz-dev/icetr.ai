import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Phone } from "lucide-react";

export default function SingleCampaignCard({ campaign }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="flex flex-col h-full">
        {" "}
        {/* Add flex-col and h-full */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="mt-auto">
          {" "}
          {/* Add mt-auto to push content down */}
          <div className="text-2xl font-bold">{campaign.leads.length}</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>

      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Conversion</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="mt-auto">
          {/* <div className="text-2xl font-bold">{campaign.metrics.conversionRate}%</div> */}
          <p className="text-xs text-muted-foreground">+2.1% from last month</p>
        </CardContent>
      </Card>

      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="mt-auto">
          <div className="text-2xl font-bold">
            {formatCurrency(campaign.spent)}
          </div>
          <Progress
            value={(campaign.spent / campaign.budget) * 100}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(campaign.budget - campaign.spent)} remaining
          </p>
        </CardContent>
      </Card>

      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Pick Up Rate</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="mt-auto">
          {/* <div className="text-2xl font-bold">{campaign.metrics.openRate}%</div> */}
          <p className="text-xs text-muted-foreground">Industry avg: 21.3%</p>
        </CardContent>
      </Card>
    </div>
  );
}

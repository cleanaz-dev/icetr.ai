import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function SingleCampaignStats({ campaign }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Leads */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Total Leads
          </p>
          <p className="text-3xl font-bold mt-2">{campaign._count?.leads || 0}</p>
        </div>
        <div className="mt-4 flex items-center">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600 dark:text-green-400">
            +12% from last month
          </span>
        </div>
      </div>

      {/* Contacted */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Contacted
          </p>
          <p className="text-3xl font-bold mt-2">89</p>
        </div>
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">
            36% contact rate
          </span>
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            In Progress
          </p>
          <p className="text-3xl font-bold mt-2">42</p>
        </div>
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">
            47% of contacted
          </span>
        </div>
      </div>

      {/* Converted */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Converted
          </p>
          <p className="text-3xl font-bold mt-2">18</p>
        </div>
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">
            7.3% conversion rate
          </span>
        </div>
      </div>
    </div>
  );
}
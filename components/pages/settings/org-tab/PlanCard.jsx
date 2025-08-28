import { AlertTriangle, BarChart3, Package, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const PlanCard = ({ 
  tierInfo, 
  TierIcon, 
  usageStats, 
  formatNumber 
}) => {
  function getUsageStatsTitle(stat) {
    const title =
      stat === "voiceMins"
        ? "Voice Minutes"
        : stat === "aiCreditAddOns"
        ? "AI Credit Add-ons"
        : stat === "aiCredits"
        ? "AI Credits"
        : stat === "leads"
        ? "Leads"
        : stat === "campaigns"
        ? "Campaigns"
        : stat === "users"
        ? "Users"
        : stat === "TrainingScenarios"
        ? "Training Scenarios"
        : "";
    return title;
  }

  // Split stats into core usage and addons
  const coreUsageStats = {
    users: usageStats.users,
    campaigns: usageStats.campaigns,
    leads: usageStats.leads,
    TrainingScenarios: usageStats.TrainingScenarios,
    aiCredits: usageStats.aiCredits,
    voiceMins: usageStats.voiceMins,
  };

  const addonStats = {
    aiCreditAddOns: usageStats.aiCreditAddOns,
  };

  const renderUsageCard = (key, stat) => {
    const percentage = stat.max > 0 ? (stat.current / stat.max) * 100 : 0;
    const isNearLimit = percentage > 80;
    
    return (
      <div key={key} className="p-3 rounded-lg border bg-card">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-muted-foreground">
            {getUsageStatsTitle(key)}
          </h4>
          {isNearLimit && (
            <AlertTriangle className="w-3 h-3 text-amber-500" />
          )}
        </div>
        <div className="space-y-1">
          <div className="text-lg font-semibold">
            {stat.current.toLocaleString()}
            <span className="text-xs text-muted-foreground ml-1">
              / {formatNumber(stat.max)}
            </span>
          </div>
          <Progress 
            value={percentage} 
            className={`h-1.5 ${isNearLimit ? 'text-amber-500' : ''}`}
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <TierIcon className="w-5 h-5" />
            Current Plan
          </CardTitle>
          <Badge>{tierInfo.price}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Plan Info */}
          <div className="p-4 rounded-lg bg-background/80 border text-center">
            <div className="text-2xl font-bold">{tierInfo.name}</div>
            <p className="text-muted-foreground mt-1">
              Perfect for your current needs
            </p>
          </div>
          
          {/* Core Usage Stats */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Usage Statistics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(coreUsageStats).map(([key, stat]) => 
                renderUsageCard(key, stat)
              )}
            </div>
          </div>

          {/* Add-ons Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Add-ons
              </h4>
              <Button variant="outline" size="sm">
                <Plus className="w-3 h-3 mr-1" />
                Add More
              </Button>
            </div>
            
            {Object.keys(addonStats).length === 0 || addonStats.aiCreditAddOns.max === 0 ? (
              <div className="p-4 rounded-lg border border-dashed text-center">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No add-ons active
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enhance your plan with additional features
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(addonStats).map(([key, stat]) => 
                  stat.max > 0 ? renderUsageCard(key, stat) : null
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;